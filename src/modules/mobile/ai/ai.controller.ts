import { Response, NextFunction } from 'express';
import { AuthenticatedAdminRequest } from '../../../middlewares/mobile/authenticate';
import { MobileAIService } from './ai.service';
import { sendSuccess } from '../../../shared/utils/response';
import { AppError } from '../../../middlewares/error-handler';

export const uploadKnowledge = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError('File dokumen wajib diunggah (field name: "file")', 400);
    }

    const result = await MobileAIService.uploadDocument(req.file);
    return sendSuccess(res, 'Dokumen berhasil diunggah dan diindeks ke dalam pengetahuan AI', result, 201);
  } catch (error) {
    next(error);
  }
};

export const getKnowledgeStatus = async (_req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const status = await MobileAIService.getKnowledgeStatus();
    return sendSuccess(res, 'Status knowledge base AI berhasil diambil', status);
  } catch (error) {
    next(error);
  }
};

export const rebuildIndex = async (_req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const result = await MobileAIService.rebuildIndex();
    return sendSuccess(res, 'Indeks pengetahuan AI berhasil diperbarui', result);
  } catch (error) {
    next(error);
  }
};

export const listModels = async (_req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const models = await MobileAIService.listModels();
    return sendSuccess(res, 'Daftar model AI berhasil diambil', models);
  } catch (error) {
    next(error);
  }
};
