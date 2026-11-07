import { Response, NextFunction } from 'express';
import { AuthenticatedUserRequest } from '../../../middlewares/website/authenticate';
import { WebsiteChatService } from './chat.service';
import { sendSuccess, toBigInt } from '../../../shared/utils/response';

export const getConversations = async (req: AuthenticatedUserRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const conversations = await WebsiteChatService.getConversations(userId);
    return sendSuccess(res, 'Daftar percakapan berhasil diambil', conversations);
  } catch (error) {
    next(error);
  }
};

export const getOrCreateConversation = async (req: AuthenticatedUserRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const conversation = await WebsiteChatService.getOrCreateConversation(userId);
    return sendSuccess(res, 'Percakapan berhasil ditemukan/dibuat', conversation);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req: AuthenticatedUserRequest, res: Response, next: NextFunction) => {
  try {
    const conversationId = toBigInt(req.params.id);
    const messages = await WebsiteChatService.getMessages(conversationId);
    return sendSuccess(res, 'Riwayat pesan berhasil diambil', messages);
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req: AuthenticatedUserRequest, res: Response, next: NextFunction) => {
  try {
    const conversationId = toBigInt(req.params.id);
    const userId = req.user!.id;
    const { messageText, imageAttachment } = req.body;

    const result = await WebsiteChatService.sendMessage({
      conversationId,
      userId,
      messageText,
      imageAttachment,
    });

    return sendSuccess(res, 'Pesan berhasil dikirim dan direspon', result, 201);
  } catch (error) {
    next(error);
  }
};

