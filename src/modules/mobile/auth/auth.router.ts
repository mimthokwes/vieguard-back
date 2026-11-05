import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../../middlewares/validate';
import {
  mobileRegisterSchema,
  mobileGoogleLoginSchema,
  mobileLoginSchema,
  mobileRefreshSchema,
  mobileLogoutSchema,
  mobileForgotPasswordSchema,
  mobileResetPasswordSchema,
} from './auth.validator';

const router = Router();

router.post('/register', validate(mobileRegisterSchema), authController.register);
router.post('/login', validate(mobileLoginSchema), authController.login);
router.post('/google', validate(mobileGoogleLoginSchema), authController.googleLogin);
router.post('/refresh', validate(mobileRefreshSchema), authController.refresh);
router.post('/logout', validate(mobileLogoutSchema), authController.logout);
router.post('/forgot-password', validate(mobileForgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(mobileResetPasswordSchema), authController.resetPassword);

export default router;
