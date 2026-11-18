import { ChatService } from '../../../shared/services/chatService';
import { getSocketServer } from '../../../config/socket';
import { prisma } from '../../../config/prisma';
import { AppError } from '../../../middlewares/error-handler';

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
    const result = await ChatService.handleUserMessageAndAIReply(data);
    const io = getSocketServer();
    if (io) {
      const room = `conversation:${data.conversationId.toString()}`;
      io.of('/ws/website').to(room).to(`user:${data.userId.toString()}`).emit('message:new', result.userMessage);
      io.of('/ws/mobile').emit('message:new', result.userMessage);
      if (result.aiMessage) {
        io.of('/ws/website').to(room).to(`user:${data.userId.toString()}`).emit('message:new', result.aiMessage);
        io.of('/ws/mobile').emit('message:new', result.aiMessage);
      }
    }
    return result;
  }
}
