import cron from 'node-cron';
import { prisma } from '../config/prisma';
import { dispatchNotification } from '../shared/services/notificationDispatcher';

export const startAutoCancelOrderJob = () => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      const expiredOrders = await prisma.order.findMany({
        where: {
          status: { in: ['pending', 'dikonfirmasi'] },
          expiredAt: { lte: now },
        },
      });

      for (const order of expiredOrders) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'dibatalkan' },
        });

        const isDikonfirmasi = order.status === 'dikonfirmasi';
        const cancelMessage = isDikonfirmasi
          ? `Pesanan ${order.orderNumber} telah dibatalkan otomatis karena melewati batas waktu pembayaran DP (24 jam).`
          : `Pesanan ${order.orderNumber} dibatalkan otomatis karena konfirmasi bahan melewati batas waktu.`;

        await dispatchNotification({
          recipientType: 'user',
          recipientId: order.userId,
          type: 'ORDER_AUTO_CANCELLED',
          title: 'Pesanan Dibatalkan Otomatis',
          message: cancelMessage,
          relatedOrderId: order.id,
        });

        console.log(`[JOB] Order ${order.orderNumber} (${order.status}) auto-cancelled.`);
      }
    } catch (error) {
      console.error('[JOB ERROR] Auto-cancel order job failed:', error);
    }
  });

  console.log('[JOB INITIALIZED] Auto-cancel order cron job running (every 5 mins).');
};
