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

    // Midtrans order_id format: e.g. "VG-20260920-1234"
    const order = await prisma.order.findUnique({
      where: { orderNumber: order_id },
    });

    if (!order) {
      console.warn(`[Midtrans Webhook] Order with number ${order_id} not found.`);
      return;
    }

    let isSuccess = false;
    if (transaction_status === 'capture') {
      if (fraud_status === 'challenge') {
        // Pending fraud challenge
        console.log(`[Midtrans Webhook] Order ${order_id} is in fraud challenge.`);
      } else if (fraud_status === 'accept') {
        isSuccess = true;
      }
    } else if (transaction_status === 'settlement') {
      isSuccess = true;
    }

    if (isSuccess) {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          paymentType: 'dp',
          amount: parseFloat(gross_amount) || order.totalPrice,
          paymentMethod: payment_type || 'midtrans',
          midtransOrderId: order_id,
          midtransTransactionId: transaction_id,
          status: 'terverifikasi',
          verifiedAt: new Date(),
        },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: {
          isLunas: true,
          status: order.requiresProduction ? 'diproses' : 'siap_diambil',
        },
      });

      await dispatchNotification({
        recipientType: 'user',
        recipientId: order.userId,
        type: 'PAYMENT_VERIFIED',
        title: 'Pembayaran Berhasil',
        message: `Pembayaran online untuk pesanan ${order.orderNumber} telah berhasil terverifikasi otomatis.`,
        relatedOrderId: order.id,
      });

      console.log(`[Midtrans Webhook] Order ${order_id} payment verified successfully.`);
    }
  }
}
