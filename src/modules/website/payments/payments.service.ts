import { prisma } from '../../../config/prisma';
import { AppError } from '../../../middlewares/error-handler';
import { dispatchNotification } from '../../../shared/services/notificationDispatcher';
import { MidtransService } from '../../../shared/services/midtrans.service';

export class WebsitePaymentsService {
  static async uploadPaymentProof(
    userId: bigint,
    data: {
      orderId: bigint;
      paymentType: 'dp' | 'pelunasan' | 'refund';
      amount: number;
      paymentMethod?: string;
      proofImage: string;
    }
  ) {
    const order = await prisma.order.findFirst({
      where: { id: data.orderId, userId },
    });

    if (!order) {
      throw new AppError('Pesanan tidak ditemukan.', 404);
    }

    const payment = await prisma.payment.create({
      data: {
        orderId: data.orderId,
        paymentType: data.paymentType,
        amount: data.amount,
        paymentMethod: data.paymentMethod || 'manual_transfer',
        proofImage: data.proofImage,
        status: 'menunggu',
      },
    });

    // Notify admins of new proof of payment
    const admins = await prisma.admin.findMany({ select: { id: true } });
    for (const admin of admins) {
      await dispatchNotification({
        recipientType: 'admin',
        recipientId: admin.id,
        type: 'PAYMENT_PROOF_UPLOADED',
        title: 'Bukti Pembayaran Diunggah',
        message: `Bukti transfer (${data.paymentType}) untuk pesanan ${order.orderNumber} diunggah oleh pelanggan.`,
        relatedOrderId: order.id,
      });
    }

    return payment;
  }

  static async createSnapTransaction(userId: bigint, orderId: bigint) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        user: true,
        items: {
          include: {
            product: true,
            productVariant: true,
            accessory: true,
          },
        },
      },
    });

    if (!order) {
      throw new AppError('Pesanan tidak ditemukan.', 404);
    }

    if (order.isLunas) {
      throw new AppError('Pesanan ini sudah lunas.', 400);
    }

    const itemDetails = order.items.map((item) => ({
      id: String(item.id),
      price: Number(item.unitPrice),
      quantity: item.quantity,
      name:
        item.product?.name
          ? (item.size ? `${item.product.name} (${item.size})` : item.product.name)
          : item.accessory?.name || 'Item Pesanan',
    }));

    if (order.shippingCost && Number(order.shippingCost) > 0) {
      itemDetails.push({
        id: 'SHIPPING',
        price: Number(order.shippingCost),
        quantity: 1,
        name: `Ongkir (${order.courier || 'Kurir'})`,
      });
    }

    const snapResult = await MidtransService.createTransaction({
      orderNumber: order.orderNumber,
      grossAmount: Number(order.totalPrice),
      customerDetails: {
        firstName: order.user.name,
        email: order.user.email,
        phone: order.user.phone || undefined,
      },
      itemDetails,
    });

    return {
      orderId: order.id.toString(),
      orderNumber: order.orderNumber,
      grossAmount: Number(order.totalPrice),
      snapToken: snapResult.token,
      redirectUrl: snapResult.redirectUrl,
    };
  }
}
