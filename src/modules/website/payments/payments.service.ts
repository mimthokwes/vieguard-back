import { prisma } from '../../../config/prisma';
import { AppError } from '../../../middlewares/error-handler';
import { dispatchNotification } from '../../../shared/services/notificationDispatcher';
import { MidtransService } from '../../../shared/services/midtrans.service';

export interface CreateSnapOptions {
  paymentMethod?: 'qris' | 'va';
  paymentType?: 'dp' | 'pelunasan';
  amount?: number;
}

export interface CreateDirectChargeOptions {
  paymentMethod: 'qris' | 'va';
  bank?: 'bca' | 'mandiri' | 'bni' | 'bri' | 'permata' | 'cimb';
  paymentType?: 'dp' | 'pelunasan';
  amount?: number;
}

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

  static async createSnapTransaction(userId: bigint, orderId: bigint, options?: CreateSnapOptions) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        user: true,
        payments: {
          where: { status: 'terverifikasi', paymentType: { not: 'refund' } },
        },
      },
    });

    if (!order) {
      throw new AppError('Pesanan tidak ditemukan.', 404);
    }

    if (order.isLunas) {
      throw new AppError('Pesanan ini sudah lunas.', 400);
    }

    const total = Number(order.totalPrice);
    const dp = Number(order.dpAmount) > 0 ? Number(order.dpAmount) : Math.round(total * 0.5);

    const paid = order.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const remaining = Math.max(0, total - paid);

    let payAmount = remaining;
    let paymentType = options?.paymentType || (paid > 0 ? 'pelunasan' : 'dp');

    if (paid === 0) {
      if (options?.paymentType === 'dp') {
        payAmount = dp;
      } else if (options?.paymentType === 'pelunasan') {
        payAmount = total;
      } else {
        payAmount = options?.amount || dp;
      }
    } else {
      payAmount = remaining;
      paymentType = 'pelunasan';
    }

    // Determine enabled payments filter (QRIS vs VA)
    let enabledPayments: string[] | undefined = undefined;
    if (options?.paymentMethod === 'qris') {
      enabledPayments = ['qris', 'gopay', 'shopeepay'];
    } else if (options?.paymentMethod === 'va') {
      enabledPayments = ['bca_va', 'bni_va', 'bri_va', 'echannel', 'permata_va', 'cimb_va', 'other_va'];
    }

    const chargeSuffix = paymentType === 'dp' ? 'DP' : (paid > 0 ? 'PELUNASAN' : 'FULL');
    const midtransOrderId = `${order.orderNumber}-${chargeSuffix}-${Date.now().toString().slice(-4)}`;

    const snapResult = await MidtransService.createTransaction({
      orderNumber: midtransOrderId,
      grossAmount: payAmount,
      customerDetails: {
        firstName: order.user.name,
        email: order.user.email,
        phone: order.user.phone || undefined,
      },
      itemDetails: [
        {
          id: `${order.orderNumber}-${paymentType}`,
          price: payAmount,
          quantity: 1,
          name: `Pembayaran ${paymentType.toUpperCase()} #${order.orderNumber}`,
        },
      ],
      enabledPayments,
    });

    return {
      orderId: order.id.toString(),
      orderNumber: order.orderNumber,
      midtransOrderId,
      paymentType,
      grossAmount: payAmount,
      snapToken: snapResult.token,
      redirectUrl: snapResult.redirectUrl,
    };
  }

  /**
   * Direct Headless Core API Charge (Returns QR URL / VA Number directly)
   */
  static async createDirectCharge(userId: bigint, orderId: bigint, options: CreateDirectChargeOptions) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        user: true,
        payments: {
          where: { status: 'terverifikasi', paymentType: { not: 'refund' } },
        },
      },
    });

    if (!order) {
      throw new AppError('Pesanan tidak ditemukan.', 404);
    }

    if (order.isLunas) {
      throw new AppError('Pesanan ini sudah lunas.', 400);
    }

    const total = Number(order.totalPrice);
    const dp = Number(order.dpAmount) > 0 ? Number(order.dpAmount) : Math.round(total * 0.5);

    const paid = order.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const remaining = Math.max(0, total - paid);

    let payAmount = remaining;
    let paymentType = options?.paymentType || (paid > 0 ? 'pelunasan' : 'dp');

    if (paid === 0) {
      if (options?.paymentType === 'dp') {
        payAmount = dp;
      } else if (options?.paymentType === 'pelunasan') {
        payAmount = total;
      } else {
        payAmount = options?.amount || dp;
      }
    } else {
      payAmount = remaining;
      paymentType = 'pelunasan';
    }

    const chargeSuffix = paymentType === 'dp' ? 'DP' : (paid > 0 ? 'PELUNASAN' : 'FULL');
    const midtransOrderId = `${order.orderNumber}-${chargeSuffix}-${Date.now().toString().slice(-4)}`;

    const chargeRes = await MidtransService.chargeCoreApi({
      orderNumber: midtransOrderId,
      grossAmount: payAmount,
      paymentMethod: options.paymentMethod,
      bank: options.bank,
      customerDetails: {
        firstName: order.user.name,
        email: order.user.email,
        phone: order.user.phone || undefined,
      },
    });

    return {
      orderId: order.id.toString(),
      originalOrderNumber: order.orderNumber,
      paymentType,
      ...chargeRes,
    };
  }
}
