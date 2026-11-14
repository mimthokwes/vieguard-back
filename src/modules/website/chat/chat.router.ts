import { Router } from 'express';
import * as chatController from './chat.controller';
import { authenticateWebsite } from '../../../middlewares/website/authenticate';

const router = Router();

router.use(authenticateWebsite);

router.get('/conversations', chatController.getConversations);
router.post('/conversations', chatController.getOrCreateConversation);
router.get('/conversations/:id/messages', chatController.getMessages);
router.post('/conversations/:id/messages', chatController.sendMessage);
router.patch('/conversations/:id/bot', chatController.setBotStatus);

export default router;
