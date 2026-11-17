import { ChatService } from '../../../shared/services/chatService';
import { getSocketServer } from '../../../config/socket';

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
