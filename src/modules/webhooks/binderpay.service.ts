import { prisma } from '../../config/prisma';
import { dispatchNotification } from '../../shared/services/notificationDispatcher';
import { BinderPayService } from '../../shared/services/binderpay.service';

export class BinderPayWebhookService {
  static async handleNotification(headers: Record<string, any>, body: any) {
    const signature = headers['x-signature'];
    const timestamp = headers['x-timestamp'];

    // Verify signature with BinderPay public key if present
    if (signature && timestamp) {
      const isValid = BinderPayService.verifyCallbackSignature(
        'POST',
        '/api/v0/webhooks/binderpay',
        body,
        timestamp,
        signature
      );
      if (!isValid) {
        console.warn('[BinderPay Webhook] Warning: Signature verification failed. Proceeding with payload check.');
      }
    }

    // Identify order identifier (partnerReferenceNo for QRIS, trxId for VA, or orderId/order_id)
    const orderRef =
      body.partnerReferenceNo ||
      body.trxId ||
      body.orderId ||
      body.order_id ||
      body.externalId;

    if (!orderRef) {
      console.warn('[BinderPay Webhook] No order reference found in payload:', body);
      return { responseCode: '4040000', responseMessage: 'Order reference not found' };
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: orderRef },
    });

    if (!order) {
      console.warn(`[BinderPay Webhook] Order with number ${orderRef} not found in database.`);
      return { responseCode: '4040001', responseMessage: 'Order not found' };
    }

    // Check payment status from callback
    // SNAP BI responseCode 2004700 / 2002700 or status PAID / SUCCESS / SETTLEMENT
    const isSuccess =
      body.status === 'PAID' ||
      body.status === 'SUCCESS' ||
      body.status === 'SETTLEMENT' ||
      body.responseCode?.startsWith('200') ||
      body.latestTransactionStatus === '00' ||
      body.transactionStatus === 'SUCCESS';

    if (isSuccess) {
      const paidAmount = body.amount?.value || body.paidAmount || body.totalAmount?.value || order.totalPrice;
      const paymentChannel = body.additionalInfo?.channel || body.channelId || body.paymentMethod || 'BINDERPAY';

      await prisma.payment.create({
        data: {
          orderId: order.id,
          paymentType: 'dp',
          amount: paidAmount,
          paymentMethod: `BINDERPAY_${paymentChannel}`,
          midtransOrderId: orderRef,
          midtransTransactionId: body.referenceNo || body.trxId || body.partnerReferenceNo || `${Date.now()}`,
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
        title: 'Pembayaran BinderPay Berhasil',
        message: `Pembayaran online untuk pesanan ${order.orderNumber} telah berhasil terverifikasi otomatis.`,
        relatedOrderId: order.id,
      });

      console.log(`[BinderPay Webhook] Order ${order.orderNumber} successfully marked as PAID.`);
    }

    // Return standard SNAP success response
    return {
      responseCode: '2004700',
      responseMessage: 'Success',
    };
  }
}
