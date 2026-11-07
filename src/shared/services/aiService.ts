import { env } from '../../config/env';
import { AppError } from '../../middlewares/error-handler';

export interface AIChatResponse {
  status: string;
  question: string;
  answer: string;
  sources: Array<{
    id: number;
    text: string;
    source?: string;
    score: number;
  }>;
  source_ids: string[];
  model_used: string;
  execution_time_ms: number;
}

export interface AIKnowledgeStatus {
  status: string;
  knowledge_dir: string;
  total_files: number;
  files: Array<{
    name: string;
    size_bytes: number;
    extension: string;
  }>;
  index_exists: boolean;
  total_chunks_indexed: number;
  chat_model: string;
  embedding_model: string;
}

export class AIService {
  private static baseUrl = env.AI_SERVICE_URL.replace(/\/+$/, '');

  /**
   * Mengirim pertanyaan ke Model RAG di server AI-vie
   */
  static async askChatbot(question: string, topK: number = 3): Promise<AIChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chatbot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, top_k: topK }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[AIService] AI Server Error (${response.status}):`, errorText);
        throw new AppError(`Layanan AI bermasalah (${response.status})`, 502);
      }

      const data = (await response.json()) as AIChatResponse;
      return data;
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      console.error('[AIService] Gagal menghubungi AI Server:', err);
      throw new AppError('Tidak dapat terhubung ke Layanan AI. Pastikan server AI berjalan.', 503);
    }
  }

  /**
   * Mengirim file dokumen (PDF, DOCX, TXT, MD) ke AI-vie untuk diindeks langsung
   */
  static async uploadKnowledgeFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<any> {
    try {
      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: mimeType });
      formData.append('file', blob, fileName);

      const response = await fetch(`${this.baseUrl}/api/chatbot/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData: any = await response.json().catch(() => ({ message: response.statusText }));
        throw new AppError(errorData.message || 'Gagal mengunggah dokumen ke server AI', response.status);
      }

      return await response.json();
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      console.error('[AIService] Upload error:', err);
      throw new AppError('Gagal mengirim file ke Layanan AI.', 503);
    }
  }

  /**
   * Mengambil status knowledge base dan file yang terindeks
   */
  static async getKnowledgeStatus(): Promise<AIKnowledgeStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chatbot/health`);
      if (!response.ok) {
        throw new AppError('Gagal mengambil status knowledge base dari AI', response.status);
      }
      return (await response.json()) as AIKnowledgeStatus;
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      throw new AppError('Layanan AI tidak dapat diakses.', 503);
    }
  }

  /**
   * Memicu build-index secara manual
   */
  static async rebuildIndex(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chatbot/build-index`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new AppError('Gagal membangun ulang indeks AI', response.status);
      }
      return await response.json();
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      throw new AppError('Layanan AI tidak dapat diakses.', 503);
    }
  }

  /**
   * Mengambil daftar seluruh model Gemini yang tersedia
   */
  static async listModels(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chatbot/model`);
      if (!response.ok) {
        throw new AppError('Gagal mengambil daftar model AI', response.status);
      }
      return await response.json();
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      throw new AppError('Layanan AI tidak dapat diakses.', 503);
    }
  }
}
