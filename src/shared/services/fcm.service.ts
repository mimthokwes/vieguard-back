import { getFirebaseMessaging } from '../../config/firebase';
import { redis } from '../../config/redis';

export interface FcmPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  channelId?: string;
  orderId?: string;
  conversationId?: string;
}

export class FcmService {
  private static ALL_ADMINS_KEY = 'fcm:admin:tokens';
  private static USER_TOKENS_PREFIX = 'fcm:user:';

  /**
   * Mendaftarkan FCM device token admin ke Redis
   */
  static async registerAdminToken(adminId: string | bigint, token: string) {
    if (!token || !token.trim()) return;
    try {
      await redis.sadd(this.ALL_ADMINS_KEY, token.trim());
      await redis.sadd(`fcm:admin:${adminId.toString()}`, token.trim());
      console.log(`[FCM] Token perangkat admin ${adminId} berhasil didaftarkan.`);
    } catch (err) {
      console.error('[FCM] Gagal mendaftarkan admin FCM token:', err);
    }
  }

  /**
   * Menghapus FCM device token saat logout
   */
  static async unregisterAdminToken(adminId: string | bigint, token: string) {
    if (!token || !token.trim()) return;
    try {
      await redis.srem(this.ALL_ADMINS_KEY, token.trim());
      await redis.srem(`fcm:admin:${adminId.toString()}`, token.trim());
      console.log(`[FCM] Token perangkat admin ${adminId} dihapus.`);
    } catch (err) {
      console.error('[FCM] Gagal menghapus admin FCM token:', err);
    }
  }

  /**
   * Mengirim Push Notification FCM ke seluruh perangkat Admin
   */
  static async sendToAllAdmins(payload: FcmPayload) {
    const messaging = getFirebaseMessaging();
    if (!messaging) {
      return;
    }

    try {
      const tokens = await redis.smembers(this.ALL_ADMINS_KEY);
      if (!tokens || tokens.length === 0) {
        return;
      }

      const channelId = payload.channelId || 'vieguard_orders_channel';
      const dataPayload: Record<string, string> = {
        title: payload.title,
        body: payload.body,
        ...(payload.data || {}),
      };
      if (payload.orderId) dataPayload.orderId = payload.orderId;
      if (payload.conversationId) dataPayload.conversationId = payload.conversationId;

      const response = await messaging.sendEachForMulticast({
        tokens,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: dataPayload,
        android: {
          priority: 'high',
          notification: {
            channelId,
            sound: 'default',
            priority: 'max',
            defaultVibrateTimings: true,
            color: '#8E0A20',
          },
        },
      });

      // Bersihkan token yang sudah tidak valid / uninstalled
      const staleTokens: string[] = [];
      response.responses.forEach((res, idx) => {
        if (!res.success && res.error) {
          const code = res.error.code;
          if (
            code === 'messaging/invalid-registration-token' ||
            code === 'messaging/registration-token-not-registered'
          ) {
            staleTokens.push(tokens[idx]);
          }
        }
      });

      if (staleTokens.length > 0) {
        await redis.srem(this.ALL_ADMINS_KEY, ...staleTokens);
      }
    } catch (err) {
      console.error('[FCM] Gagal mengirim broadcast push notification ke admin:', err);
    }
  }

  /**
   * Mengirim Push Notification khusus Chat dari Pelanggan ke Admin
   */
  static async sendChatPushToAdmins(params: {
    customerName: string;
    messageText: string;
    conversationId: string;
  }) {
    await this.sendToAllAdmins({
      title: `Pesan dari ${params.customerName}`,
      body: params.messageText,
      conversationId: params.conversationId,
      channelId: 'vieguard_chat_channel',
      data: {
        type: 'chat',
        conversationId: params.conversationId,
      },
    });
  }
}
