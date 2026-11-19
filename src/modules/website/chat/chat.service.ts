import { ChatService } from '../../../shared/services/chatService';
import { getSocketServer } from '../../../config/socket';
import { prisma } from '../../../config/prisma';
import { AppError } from '../../../middlewares/error-handler';
import { FcmService } from '../../../shared/services/fcm.service';

export class WebsiteChatService {
  static async getConversations(userId: bigint) {
    return ChatService.getConversationsForUser(userId);
  }

  static async getOrCreateConversation(userId: bigint) {
    return ChatService.getOrCreateConversation(userId);
  }

  static async getMessages(conversationId: bigint) {
    return ChatService.getMessages(conversationId);
  }

  static async setBotStatus(conversationId: bigint, userId: bigint, isBotActive: boolean) {
    const conv = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
    });
    if (!conv) throw new AppError('Percakapan tidak ditemukan', 404);

    const updated = await ChatService.setBotStatus(conversationId, isBotActive);
    const io = getSocketServer();
    if (io) {
      const room = `conversation:${conversationId.toString()}`;
      const payload = { conversationId: conversationId.toString(), isBotActive: updated.isBotActive };
      io.of('/ws/website').to(room).to(`user:${userId.toString()}`).emit('conversation:bot_status', payload);
      io.of('/ws/mobile').to(room).to('admins').emit('conversation:bot_status', payload);
    }
    return updated;
  }

  static async sendMessage(data: { conversationId: bigint; userId: bigint; messageText?: string; imageAttachment?: string }) {
    const userMessage = await ChatService.saveMessage({
      conversationId: data.conversationId,
      senderType: 'user',
      senderId: data.userId,
      messageText: data.messageText,
      imageAttachment: data.imageAttachment,
    });

    const io = getSocketServer();
    if (io) {
      const room = `conversation:${data.conversationId.toString()}`;
      io.of('/ws/website').to(room).to(`user:${data.userId.toString()}`).emit('message:new', userMessage);
      io.of('/ws/mobile').emit('message:new', userMessage);

      // Kirim Push Notification FCM ke handphone admin
      prisma.user.findUnique({ where: { id: data.userId }, select: { name: true } }).then((sender) => {
        FcmService.sendChatPushToAdmins({
          customerName: sender?.name || 'Pelanggan',
          messageText: data.messageText || (data.imageAttachment ? 'Mengirim gambar lampiran' : 'Pesan baru masuk'),
          conversationId: data.conversationId.toString(),
        }).catch((err) => console.error('[FCM] Error chat push HTTP:', err));
      }).catch(() => {});

      if (data.messageText && data.messageText.trim().length > 0) {
        ChatService.processAIReply(data.conversationId, data.messageText, (aiMessage) => {
          io.of('/ws/website').to(room).to(`user:${data.userId.toString()}`).emit('message:new', aiMessage);
          io.of('/ws/mobile').emit('message:new', aiMessage);
        }).catch((err) => {
          console.error('Error background AI reply HTTP:', err);
        });
      }
    }
    return { userMessage };
  }
}
