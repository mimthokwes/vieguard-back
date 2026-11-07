import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import * as aiController from './ai.controller';
import { authenticateMobile } from '../../../middlewares/mobile/authenticate';
import { AppError } from '../../../middlewares/error-handler';

const router = Router();

// Multer memory storage for direct forwarding to AI service
const allowedDocExtensions = ['.pdf', '.docx', '.doc', '.txt', '.md'];

const docUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB limit
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedDocExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new AppError(`Format file '${ext}' tidak didukung. Gunakan PDF, DOCX, TXT, atau Markdown`, 400));
    }
  },
});

// Protect all mobile AI endpoints with Admin authentication
router.use(authenticateMobile);

router.post('/knowledge', docUpload.single('file'), aiController.uploadKnowledge);
router.get('/knowledge', aiController.getKnowledgeStatus);
router.post('/build-index', aiController.rebuildIndex);
router.get('/models', aiController.listModels);

export default router;
