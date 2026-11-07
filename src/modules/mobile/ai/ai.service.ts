import { AIService } from '../../../shared/services/aiService';

export class MobileAIService {
  static async uploadDocument(file: Express.Multer.File) {
    return AIService.uploadKnowledgeFile(file.buffer, file.originalname, file.mimetype);
  }

  static async getKnowledgeStatus() {
    return AIService.getKnowledgeStatus();
  }

  static async rebuildIndex() {
    return AIService.rebuildIndex();
  }

  static async listModels() {
    return AIService.listModels();
  }
}
