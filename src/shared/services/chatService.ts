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
   * Menyimpan pesan pelanggan dan meminta balasan otomatis dari Model AI (RAG).
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

    // 2. Jika ada teks pesan, minta respon dari Model AI
    if (data.messageText && data.messageText.trim().length > 0) {
      try {
        const aiResponse = await AIService.askChatbot(data.messageText.trim());

        // Cari atau pasang adminId untuk percakapan ini
        const conv = await prisma.conversation.findUnique({
          where: { id: data.conversationId },
          select: { adminId: true },
        });

        let adminId = conv?.adminId;
        if (!adminId) {
          const defaultAdmin = await prisma.admin.findFirst({ orderBy: { id: 'asc' } });
          adminId = defaultAdmin ? defaultAdmin.id : 1n;
          await prisma.conversation.update({
            where: { id: data.conversationId },
            data: { adminId },
          });
        }

        // Simpan jawaban AI dengan identitas admin
        aiMessage = await this.saveMessage({
          conversationId: data.conversationId,
          senderType: 'admin',
          senderId: adminId,
          messageText: aiResponse.answer,
        });
      } catch (err) {
        console.error('[ChatService] Gagal menghasilkan balasan AI:', err);
      }
    }

    return { userMessage, aiMessage };
  }
}
