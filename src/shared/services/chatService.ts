import { prisma } from '../../config/prisma';
import { AIService } from './aiService';

export class ChatService {
  static async getOrCreateConversation(userId: bigint, adminId?: bigint) {
    let conversation = await prisma.conversation.findFirst({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, profilePhoto: true } },
        admin: { select: { id: true, name: true } },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { userId, adminId },
        include: {
          user: { select: { id: true, name: true, profilePhoto: true } },
          admin: { select: { id: true, name: true } },
        },
      });
    }

    return conversation;
  }

  static async getConversationsForUser(userId: bigint) {
    return prisma.conversation.findMany({
      where: { userId },
      include: {
        admin: { select: { name: true } },
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  static async getConversationsForAdmin() {
    return prisma.conversation.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, profilePhoto: true } },
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  static async getMessages(conversationId: bigint) {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async saveMessage(data: { conversationId: bigint; senderType: 'user' | 'admin'; senderId: bigint; messageText?: string; imageAttachment?: string }) {
    const message = await prisma.message.create({
      data: {
        conversationId: data.conversationId,
        senderType: data.senderType,
        senderId: data.senderId,
        messageText: data.messageText,
        imageAttachment: data.imageAttachment,
      },
    });

    await prisma.conversation.update({
      where: { id: data.conversationId },
      data: { lastMessageAt: new Date() },
    });

    return message;
  }

  /**
   * Mengatur status keaktifan AI Bot pada percakapan
   */
  static async setBotStatus(conversationId: bigint, isBotActive: boolean) {
    return prisma.conversation.update({
      where: { id: conversationId },
      data: { isBotActive },
    });
  }

  /**
   * Menghasilkan balasan otomatis dari Model AI (RAG) secara mandiri / asinkron.
   * Hanya diproses jika status isBotActive bernilai true.
   */
  static async processAIReply(
    conversationId: bigint,
    messageText: string,
    onReply?: (aiMessage: any) => void
  ) {
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { adminId: true, isBotActive: true },
    });

    if (!conv?.isBotActive || !messageText.trim()) return null;

    try {
      const aiResponse = await AIService.askChatbot(messageText.trim());

      let adminId = conv?.adminId;
      if (!adminId) {
        const defaultAdmin = await prisma.admin.findFirst({ orderBy: { id: 'asc' } });
        adminId = defaultAdmin ? defaultAdmin.id : 1n;
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { adminId },
        });
      }

      const aiMessage = await this.saveMessage({
        conversationId,
        senderType: 'admin',
        senderId: adminId,
        messageText: aiResponse.answer,
      });

      if (onReply) {
        onReply(aiMessage);
      }
      return aiMessage;
    } catch (err) {
      console.error('[ChatService] Gagal menghasilkan balasan AI:', err);
      return null;
    }
  }

  /**
   * Menyimpan pesan pelanggan dan meminta balasan otomatis dari Model AI (RAG).
   * Balasan AI hanya diproses jika status isBotActive pada percakapan bernilai true.
   * Jawaban AI disimpan sebagai 'admin' sehingga seolah-olah dibalas oleh admin.
   */
  static async handleUserMessageAndAIReply(data: {
    conversationId: bigint;
    userId: bigint;
    messageText?: string;
    imageAttachment?: string;
  }) {
    // 1. Simpan pesan pengguna
    const userMessage = await this.saveMessage({
      conversationId: data.conversationId,
      senderType: 'user',
      senderId: data.userId,
      messageText: data.messageText,
      imageAttachment: data.imageAttachment,
    });

    let aiMessage: any = null;
    if (data.messageText && data.messageText.trim().length > 0) {
      aiMessage = await this.processAIReply(data.conversationId, data.messageText);
    }

    return { userMessage, aiMessage };
  }
}
