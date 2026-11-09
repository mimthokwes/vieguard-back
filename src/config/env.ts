import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'super_secret_access_key',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key',
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || '15m',
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || '7d',
  
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || undefined,
  WEBSITE_FRONTEND_URL: process.env.WEBSITE_FRONTEND_URL || 'http://localhost:3000',
  
  REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,
  REDIS_DB: parseInt(process.env.REDIS_DB || '0', 10),

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  
  MIDTRANS_SERVER_KEY: process.env.MIDTRANS_SERVER_KEY || '',
  MIDTRANS_CLIENT_KEY: process.env.MIDTRANS_CLIENT_KEY || '',
  MIDTRANS_IS_PRODUCTION: process.env.MIDTRANS_IS_PRODUCTION === 'true',

  BINDERPAY_BASE_URL: process.env.BINDERPAY_BASE_URL || 'https://api-sandbox.binderpay.id',
  BINDERPAY_PARTNER_ID: process.env.BINDERPAY_PARTNER_ID || 'BP750523',
  BINDERPAY_PUBLIC_KEY_PATH: process.env.BINDERPAY_PUBLIC_KEY_PATH || 'keys/binderpay-public.pem',
  BINDERPAY_PRIVATE_KEY_PATH: process.env.BINDERPAY_PRIVATE_KEY_PATH || 'keys/vieguard-private.pem',


  MAIL_MAILER: process.env.MAIL_MAILER || 'smtp',
  MAIL_HOST: process.env.MAIL_HOST || 'sandbox.smtp.mailtrap.io',
  MAIL_PORT: parseInt(process.env.MAIL_PORT || '587', 10),
  MAIL_USERNAME: process.env.MAIL_USERNAME || '',
  MAIL_PASSWORD: process.env.MAIL_PASSWORD || '',
  MAIL_FROM_ADDRESS: process.env.MAIL_FROM_ADDRESS || 'no-reply@vieguard.com',
  MAIL_FROM_APP: process.env.MAIL_FROM_APP || 'VIEGUARD',

  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:5001',
};
