import { Router } from 'express';
import * as paymentsController from './payments.controller';
import { authenticateWebsite } from '../../../middlewares/website/authenticate';
import { upload } from '../../../config/multer';

const router = Router();

router.use(authenticateWebsite);

// Manual transfer proof upload
router.post('/proof', upload.single('proofImage'), paymentsController.uploadPaymentProof);

// Midtrans Snap payment creation
router.post('/snap', paymentsController.createSnapTransaction);

export default router;
