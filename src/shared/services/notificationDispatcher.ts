import { prisma } from '../../config/prisma';
import { getSocketServer } from '../../config/socket';
import { FcmService } from './fcm.service';

export interface DispatchNotificationParams {
  recipientType: 'user' | 'admin';
  recipientId: bigint;
  type: string;
  title: string;
  message: string;
  relatedOrderId?: bigint;
}

export const dispatchNotification = async (params: DispatchNotificationParams) => {
  const notification = await prisma.notification.create({
    data: {
      recipientType: params.recipientType,
      recipientId: params.recipientId,
      type: params.type,
      title: params.title,
      message: params.message,
      relatedOrderId: params.relatedOrderId,
    },
  });

  // 1. Pancarkan via WebSocket jika ada client yang sedang online
  const io = getSocketServer();
  if (io) {
    const namespace = params.recipientType === 'user' ? '/ws/website' : '/ws/mobile';
    const room = `${params.recipientType}:${params.recipientId.toString()}`;
    const nsp = io.of(namespace);
    const payload = {
      id: notification.id.toString(),
      recipientType: notification.recipientType,
      recipientId: notification.recipientId.toString(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      relatedOrderId: notification.relatedOrderId ? notification.relatedOrderId.toString() : null,
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
    };
    nsp.to(room).emit('notification:new', payload);
    if (params.recipientType === 'admin') {
      nsp.to('admins').emit('notification:new', payload);
    }
  }

  // 2. Kirim Push Notification FCM ke handphone (menembus kondisi app tertutup / layar mati)
  if (params.recipientType === 'admin') {
    FcmService.sendToAllAdmins({
      title: params.title,
      body: params.message,
      orderId: params.relatedOrderId ? params.relatedOrderId.toString() : undefined,
      channelId: 'vieguard_orders_channel',
      data: {
        type: params.type,
        relatedOrderId: params.relatedOrderId ? params.relatedOrderId.toString() : '',
      },
    }).catch((err) => {
      console.error('[NotificationDispatcher] Gagal kirim FCM push:', err);
    });
  }

  return notification;
};
