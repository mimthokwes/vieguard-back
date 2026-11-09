import { Response, NextFunction } from 'express';
import { AuthenticatedUserRequest } from '../../../middlewares/website/authenticate';
import { WebsitePaymentsService } from './payments.service';
import { sendSuccess } from '../../../shared/utils/response';
import { AppError } from '../../../middlewares/error-handler';

export const uploadPaymentProof = async (req: AuthenticatedUserRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const file = req.file;
    if (!file) {
      throw new AppError('File bukti transfer wajib diunggah.', 400);
    }

    const { orderId, paymentType, amount, paymentMethod } = req.body;
    if (!orderId || !paymentType || !amount) {
      throw new AppError('orderId, paymentType, dan amount wajib diisi.', 400);
    }

    const payment = await WebsitePaymentsService.uploadPaymentProof(userId, {
      orderId: BigInt(orderId),
      paymentType,
      amount: parseFloat(amount),
      paymentMethod,
      proofImage: `/uploads/payments/${file.filename}`,
    });

    return sendSuccess(res, 'Bukti pembayaran berhasil diunggah', payment, 201);
  } catch (error) {
    next(error);
  }
};

export const createSnapTransaction = async (req: AuthenticatedUserRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { orderId, paymentMethod, paymentType, amount } = req.body;

    if (!orderId) {
      throw new AppError('orderId wajib diisi.', 400);
    }

    const result = await WebsitePaymentsService.createSnapTransaction(userId, BigInt(orderId), {
      paymentMethod,
      paymentType,
      amount: amount ? parseFloat(amount) : undefined,
    });
    return sendSuccess(res, 'Transaksi Midtrans Snap berhasil dibuat', result, 201);
  } catch (error) {
    next(error);
  }
};

export const chargeDirectPayment = async (req: AuthenticatedUserRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { orderId, paymentMethod, bank, paymentType, amount } = req.body;

    if (!orderId) {
      throw new AppError('orderId wajib diisi.', 400);
    }
    if (!paymentMethod || !['qris', 'va'].includes(paymentMethod)) {
      throw new AppError('paymentMethod harus "qris" atau "va".', 400);
    }

    const result = await WebsitePaymentsService.createDirectCharge(userId, BigInt(orderId), {
      paymentMethod,
      bank,
      paymentType,
      amount: amount ? parseFloat(amount) : undefined,
    });

    return sendSuccess(res, 'Pembayaran berhasil diinisiasi', result, 201);
  } catch (error) {
    next(error);
  }
};
