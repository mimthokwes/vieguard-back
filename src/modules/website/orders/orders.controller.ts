import { Response, NextFunction } from 'express';
import { AuthenticatedUserRequest } from '../../../middlewares/website/authenticate';
import { WebsiteOrdersService } from './orders.service';
import { sendSuccess, toBigInt } from '../../../shared/utils/response';
import { decodeOrderId, encodeOrderId } from '../../../shared/utils/orderHash';

export const createOrder = async (req: AuthenticatedUserRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const order = await WebsiteOrdersService.createOrder(userId, req.body);
    return sendSuccess(res, 'Pesanan berhasil dibuat', {
      ...order,
      orderHash: encodeOrderId(order.id),
    }, 201);
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req: AuthenticatedUserRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const orders = await WebsiteOrdersService.getUserOrders(userId);
    const enriched = orders.map((o: any) => ({
      ...o,
      orderHash: encodeOrderId(o.id),
    }));
    return sendSuccess(res, 'Daftar pesanan berhasil diambil', enriched);
  } catch (error) {
    next(error);
  }
};

export const getOrderDetail = async (req: AuthenticatedUserRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const rawParam = req.params.id;
    const decoded = decodeOrderId(rawParam);
    const orderId = decoded ? BigInt(decoded) : toBigInt(rawParam);
    const order = await WebsiteOrdersService.getOrderDetail(userId, orderId);
    return sendSuccess(res, 'Detail pesanan berhasil diambil', {
      ...order,
      orderHash: encodeOrderId(order.id),
    });
  } catch (error) {
    next(error);
  }
};

export const getStatusHistory = async (req: AuthenticatedUserRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const rawParam = req.params.id;
    const decoded = decodeOrderId(rawParam);
    const orderId = decoded ? BigInt(decoded) : toBigInt(rawParam);
    const history = await WebsiteOrdersService.getOrderStatusHistory(userId, orderId);
    return sendSuccess(res, 'Riwayat status pesanan berhasil diambil', history);
  } catch (error) {
    next(error);
  }
};
