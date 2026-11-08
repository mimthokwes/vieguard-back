import { prisma } from '../../config/prisma';
import { dispatchNotification } from '../../shared/services/notificationDispatcher';
import { MidtransService } from '../../shared/services/midtrans.service';

export class MidtransWebhookService {
  static async handleNotification(notification: any) {
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      transaction_id,
      payment_type,
    } = notification;

    if (!order_id) return;

    // Verify signature from Midtrans if provided
    if (signature_key && status_code && gross_amount) {
      const isValid = MidtransService.verifySignature(order_id, status_code, gross_amount, signature_key);
      if (!isValid) {
        console.warn(`[Midtrans Webhook] Warning: Invalid signature for order ${order_id}`);
      }
    }

    // Strip charge suffix if present (e.g. "VG-20261109-001-DP-1234" -> "VG-20261109-001")
    const baseOrderNumber = order_id
      .replace(/-(DP|PELUNASAN|FULL)-[a-zA-Z0-9]+$/, '')
      .replace(/-(DP|PELUNASAN|FULL)$/, '');

    const order = await prisma.order.findUnique({
      where: { orderNumber: baseOrderNumber },
      include: { payments: true },
    });

    if (!order) {
      console.warn(`[Midtrans Webhook] Order with number ${baseOrderNumber} (from ${order_id}) not found.`);
      return;
    }

    let isSuccess = false;
    if (transaction_status === 'capture') {
      if (fraud_status === 'challenge') {
        console.log(`[Midtrans Webhook] Order ${order_id} is in fraud challenge.`);
      } else if (fraud_status === 'accept') {
        isSuccess = true;
      }
    } else if (transaction_status === 'settlement') {
      isSuccess = true;
    }

    if (isSuccess) {
      const paymentAmount = parseFloat(gross_amount) || Number(order.totalPrice);
      const isDp = order_id.includes('-DP');

      // Check if this midtransTransactionId or midtransOrderId was already recorded to prevent duplicate records
      const existingPayment = await prisma.payment.findFirst({
        where: {
          orderId: order.id,
          midtransOrderId: order_id,
        },
      });

      if (!existingPayment) {
        await prisma.payment.create({
          data: {
            orderId: order.id,
            paymentType: isDp ? 'dp' : 'pelunasan',
            amount: paymentAmount,
            paymentMethod: payment_type || 'midtrans',
            midtransOrderId: order_id,
            midtransTransactionId: transaction_id,
            status: 'terverifikasi',
            verifiedAt: new Date(),
          },
        });
      }

      // Calculate total paid
      const existingPaid = order.payments
        .filter((p) => p.status === 'terverifikasi' && p.paymentType !== 'refund')
        .reduce((sum, p) => sum + Number(p.amount), 0);
      const totalPaid = existingPaid + paymentAmount;
      const isLunas = totalPaid >= Number(order.totalPrice);

      await prisma.order.update({
        where: { id: order.id },
        data: {
          isLunas,
          status: isLunas
            ? (order.requiresProduction ? 'diproses' : 'siap_diambil')
            : 'diproses',
        },
      });

      await dispatchNotification({
        recipientType: 'user',
        recipientId: order.userId,
        type: 'PAYMENT_VERIFIED',
        title: 'Pembayaran Berhasil',
        message: `Pembayaran online (${isDp ? 'DP' : 'Pelunasan'}) untuk pesanan ${order.orderNumber} telah berhasil terverifikasi otomatis.`,
        relatedOrderId: order.id,
      });

      console.log(`[Midtrans Webhook] Order ${order.orderNumber} payment verified successfully.`);
    }
  }
}
