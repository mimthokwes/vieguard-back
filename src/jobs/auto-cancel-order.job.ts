import cron from "node-cron";
import { prisma } from "../config/prisma";
import { dispatchNotification } from "../shared/services/notificationDispatcher";

// Store in-memory timers for scheduled order cancellations
const activeTimers = new Map<string, NodeJS.Timeout>();

/**
 * Execute cancellation of an expired order.
 */
export const executeAutoCancelOrder = async (
  orderId: bigint | number | string,
) => {
  const id = BigInt(orderId);
  const key = id.toString();

  // Clear timer reference if any
  const existingTimer = activeTimers.get(key);
  if (existingTimer) {
    clearTimeout(existingTimer);
    activeTimers.delete(key);
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      console.warn(`[AUTO-CANCEL] Order ${key} not found. Skipping.`);
      return;
    }

    // Only cancel if order is still in pending or dikonfirmasi
    if (!["pending", "dikonfirmasi"].includes(order.status)) {
      console.log(
        `[AUTO-CANCEL] Order ${order.orderNumber} is no longer pending/dikonfirmasi (status: ${order.status}). Skipping.`,
      );
      return;
    }

    const now = new Date();
    // Verify order has actually reached its expiration time
    if (order.expiredAt && order.expiredAt > now) {
      console.log(
        `[AUTO-CANCEL] Order ${order.orderNumber} is not yet expired (expires at ${order.expiredAt.toISOString()}). Rescheduling.`,
      );
      scheduleOrderAutoCancel(order.id, order.expiredAt);
      return;
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "dibatalkan",
        expiredAt: null,
      },
    });

    const isDikonfirmasi = order.status === "dikonfirmasi";
    const cancelMessage = isDikonfirmasi
      ? `Pesanan ${order.orderNumber} telah dibatalkan otomatis karena melewati batas waktu pembayaran DP (24 jam).`
      : `Pesanan ${order.orderNumber} dibatalkan otomatis oleh sistem karena melewati batas waktu konfirmasi pesanan (2 hari setelah pemesanan).`;

    const systemAdmin = await prisma.admin.findFirst({ select: { id: true } });
    if (systemAdmin) {
      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          progressPercentage: 0,
          statusLabel: "Pesanan Dibatalkan Otomatis",
          note: cancelMessage,
          updatedBy: systemAdmin.id,
        },
      });
    }

    await dispatchNotification({
      recipientType: "user",
      recipientId: order.userId,
      type: "ORDER_AUTO_CANCELLED",
      title: "Pesanan Dibatalkan Otomatis",
      message: cancelMessage,
      relatedOrderId: order.id,
    });

    console.log(
      `[AUTO-CANCEL] Order ${order.orderNumber} (${order.status}) successfully auto-cancelled after expiration.`,
    );
  } catch (error) {
    console.error(
      `[AUTO-CANCEL ERROR] Failed to auto-cancel order ${key}:`,
      error,
    );
  }
};

/**
 * Schedule auto-cancellation for a specific order at the given target time.
 * For newly placed orders, this executes 2 days (48 hours) after order placement.
 */
export const scheduleOrderAutoCancel = (
  orderId: bigint | number | string,
  executeAt: Date,
) => {
  const id = BigInt(orderId);
  const key = id.toString();

  // Clear previous timer for this order if any
  const existingTimer = activeTimers.get(key);
  if (existingTimer) {
    clearTimeout(existingTimer);
    activeTimers.delete(key);
  }

  const now = Date.now();
  const targetTime = executeAt.getTime();
  let delayMs = targetTime - now;

  // Max 32-bit signed integer in Node.js setTimeout (~24.8 days)
  const MAX_TIMEOUT_MS = 2147483647;

  if (delayMs <= 0) {
    // Already passed or due now, execute asynchronously
    setImmediate(() => {
      executeAutoCancelOrder(id);
    });
    return;
  }

  if (delayMs > MAX_TIMEOUT_MS) {
    delayMs = MAX_TIMEOUT_MS;
  }

  const timer = setTimeout(async () => {
    activeTimers.delete(key);
    await executeAutoCancelOrder(id);
  }, delayMs);

  // Allow process to exit cleanly without waiting on timers if shutting down
  if (timer.unref) {
    timer.unref();
  }

  activeTimers.set(key, timer);

  const hoursRemaining = (delayMs / (1000 * 60 * 60)).toFixed(1);
  console.log(
    `[SCHEDULER] Auto-cancel scheduled for Order ID ${key} in ${hoursRemaining}h (${executeAt.toISOString()}).`,
  );
};

/**
 * Cancel the scheduled auto-cancel timer for an order (e.g. when paid, confirmed, or manually handled).
 */
export const cancelScheduledAutoCancel = (
  orderId: bigint | number | string,
) => {
  const key = BigInt(orderId).toString();
  const existingTimer = activeTimers.get(key);
  if (existingTimer) {
    clearTimeout(existingTimer);
    activeTimers.delete(key);
    console.log(`[SCHEDULER] Auto-cancel timer cleared for Order ID ${key}.`);
  }
};

/**
 * Initialize order auto-cancel scheduler on server startup.
 * 1. Hydrates existing active orders and sets exact timers (2 days from creation for pending).
 * 2. Runs a single low-impact reconciliation sweep once a day at 03:00 AM instead of 5-minute polling.
 */
export const startAutoCancelOrderJob = async (retryCount = 0) => {
  try {
    const now = new Date();
    const activeOrders = await prisma.order.findMany({
      where: {
        status: { in: ["pending", "dikonfirmasi"] },
        expiredAt: { not: null },
      },
    });

    let expiredCount = 0;
    let scheduledCount = 0;

    for (const order of activeOrders) {
      if (!order.expiredAt) continue;

      if (order.expiredAt <= now) {
        expiredCount++;
        await executeAutoCancelOrder(order.id);
      } else {
        scheduledCount++;
        scheduleOrderAutoCancel(order.id, order.expiredAt);
      }
    }

    console.log(
      `[SCHEDULER INITIALIZED] Order auto-cancel scheduler loaded: ${scheduledCount} scheduled, ${expiredCount} expired orders processed.`,
    );
  } catch (error) {
    if (retryCount < 5) {
      const delay = Math.min(2000 * Math.pow(1.5, retryCount), 10000);
      console.warn(
        `[SCHEDULER] Database not reachable yet, retrying auto-cancel scheduler in ${(delay / 1000).toFixed(1)}s...`,
      );
      setTimeout(() => startAutoCancelOrderJob(retryCount + 1), delay);
      return;
    }
    console.error(
      "[SCHEDULER ERROR] Failed to initialize order auto-cancel scheduler:",
      error,
    );
  }

  // Once-daily safety check at 03:00 AM (replaces aggressive 5-minute database polling)
  cron.schedule("0 3 * * *", async () => {
    try {
      const now = new Date();
      const expiredOrders = await prisma.order.findMany({
        where: {
          status: { in: ["pending", "dikonfirmasi"] },
          expiredAt: { lte: now },
        },
      });

      for (const order of expiredOrders) {
        await executeAutoCancelOrder(order.id);
      }
    } catch (error) {
      console.error("[JOB ERROR] Daily auto-cancel sweep failed:", error);
    }
  });

  console.log(
    "[JOB INITIALIZED] Order auto-cancel active: scheduled per-order (2 days) + once-daily safety sweep at 03:00 AM.",
  );
};
