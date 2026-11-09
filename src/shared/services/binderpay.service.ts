import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { env } from '../../config/env';

export interface QrisGenerateParams {
  partnerReferenceNo: string;
  amount: number;
  validityMinutes?: number;
}

export interface QrisGenerateResponse {
  responseCode: string;
  responseMessage: string;
  partnerReferenceNo: string;
  qrUrl?: string;
  qrContent?: string;
  terminalId?: string;
  amount?: {
    value: string;
    currency: string;
  };
  [key: string]: any;
}

export interface VaCreateParams {
  trxId: string;
  customerName: string;
  amount: number;
  channel: 'BRI' | 'BNI' | 'MANDIRI' | 'PERMATA' | 'BSI' | 'MUAMALAT' | 'BCA' | 'CIMB' | 'SINARMAS' | 'BNC';
  customerNo?: string;
  validityMinutes?: number;
}

export interface VaCreateResponse {
  responseCode: string;
  responseMessage: string;
  trxId: string;
  virtualAccountNo?: string;
  virtualAccountName?: string;
  totalAmount?: {
    value: string;
    currency: string;
  };
  [key: string]: any;
}

export class BinderPayService {
  private static binderPayPublicKey: string = '';
  private static partnerPrivateKey: string = '';

  private static loadKeys() {
    if (!this.binderPayPublicKey) {
      const pubPath = path.isAbsolute(env.BINDERPAY_PUBLIC_KEY_PATH)
        ? env.BINDERPAY_PUBLIC_KEY_PATH
        : path.resolve(process.cwd(), env.BINDERPAY_PUBLIC_KEY_PATH);

      if (fs.existsSync(pubPath)) {
        this.binderPayPublicKey = fs.readFileSync(pubPath, 'utf8');
      } else {
        console.warn(`[BinderPay] Public key not found at ${pubPath}`);
      }
    }

    if (!this.partnerPrivateKey) {
      const privPath = path.isAbsolute(env.BINDERPAY_PRIVATE_KEY_PATH)
        ? env.BINDERPAY_PRIVATE_KEY_PATH
        : path.resolve(process.cwd(), env.BINDERPAY_PRIVATE_KEY_PATH);

      if (fs.existsSync(privPath)) {
        this.partnerPrivateKey = fs.readFileSync(privPath, 'utf8');
      } else {
        console.warn(`[BinderPay] Private key not found at ${privPath}`);
      }
    }
  }

  /**
   * Format timestamp ISO 8601 with timezone offset (e.g. 2026-11-09T03:30:00+07:00)
   */
  static getIsoTimestamp(date: Date = new Date()): string {
    const tzo = -date.getTimezoneOffset();
    const dif = tzo >= 0 ? '+' : '-';
    const pad = (num: number) => (num < 10 ? '0' : '') + num;

    return (
      date.getFullYear() +
      '-' +
      pad(date.getMonth() + 1) +
      '-' +
      pad(date.getDate()) +
      'T' +
      pad(date.getHours()) +
      ':' +
      pad(date.getMinutes()) +
      ':' +
      pad(date.getSeconds()) +
      dif +
      pad(Math.floor(Math.abs(tzo) / 60)) +
      ':' +
      pad(Math.abs(tzo) % 60)
    );
  }

  /**
   * Generate SHA-256 hash of JSON body (hex lowercase)
   */
  static hashBody(payload: any): string {
    const jsonStr = typeof payload === 'string' ? payload : JSON.stringify(payload || {});
    return crypto.createHash('sha256').update(jsonStr).digest('hex').toLowerCase();
  }

  /**
   * Generate SNAP RSA-SHA256 X-SIGNATURE for request
   */
  static generateSignature(httpMethod: string, endpointUrl: string, payload: any, timestamp: string): string {
    this.loadKeys();

    if (!this.partnerPrivateKey) {
      throw new Error('[BinderPay] Cannot sign request: Private key is not configured.');
    }

    const hashedBody = this.hashBody(payload);
    const stringToSign = `${httpMethod.toUpperCase()}:${endpointUrl}:${hashedBody}:${timestamp}`;

    const signer = crypto.createSign('RSA-SHA256');
    signer.update(stringToSign);
    signer.end();

    return signer.sign(this.partnerPrivateKey, 'base64');
  }

  /**
   * Verify callback webhook X-SIGNATURE using BinderPay's Public Key
   */
  static verifyCallbackSignature(
    httpMethod: string,
    endpointUrl: string,
    rawBody: string | any,
    timestamp: string,
    signature: string
  ): boolean {
    this.loadKeys();

    if (!this.binderPayPublicKey) {
      console.error('[BinderPay] BinderPay Public key is not configured for signature verification.');
      return false;
    }

    try {
      const hashedBody = typeof rawBody === 'string' ? this.hashBody(rawBody) : this.hashBody(rawBody);
      const stringToSign = `${httpMethod.toUpperCase()}:${endpointUrl}:${hashedBody}:${timestamp}`;

      const verifier = crypto.createVerify('RSA-SHA256');
      verifier.update(stringToSign);
      verifier.end();

      return verifier.verify(this.binderPayPublicKey, signature, 'base64');
    } catch (error) {
      console.error('[BinderPay] Signature verification error:', error);
      return false;
    }
  }

  /**
   * Helper to build full SNAP headers for outgoing requests
   */
  static getHeaders(httpMethod: string, endpointUrl: string, payload: any, channelId: string, externalId?: string) {
    const timestamp = this.getIsoTimestamp();
    const signature = this.generateSignature(httpMethod, endpointUrl, payload, timestamp);

    return {
      'Content-Type': 'application/json',
      'X-TIMESTAMP': timestamp,
      'X-SIGNATURE': signature,
      'X-PARTNER-ID': env.BINDERPAY_PARTNER_ID,
      'X-EXTERNAL-ID': externalId || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      'CHANNEL-ID': channelId,
    };
  }

  /**
   * Generate QRIS (Merchant Presented Mode)
   * POST /v1.0/qr/qr-mpm-generate
   */
  static async generateQris(params: QrisGenerateParams): Promise<QrisGenerateResponse> {
    const endpoint = '/v1.0/qr/qr-mpm-generate';
    const now = new Date();
    const expireDate = new Date(now.getTime() + (params.validityMinutes || 1440) * 60 * 1000);

    const payload = {
      partnerReferenceNo: params.partnerReferenceNo,
      amount: {
        value: Number(params.amount).toFixed(2),
        currency: 'IDR',
      },
      validityPeriod: this.getIsoTimestamp(expireDate),
      additionalInfo: {
        isStatic: false,
      },
    };

    const headers = this.getHeaders('POST', endpoint, payload, 'QRIS', params.partnerReferenceNo);
    const url = `${env.BINDERPAY_BASE_URL}${endpoint}`;

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return data as QrisGenerateResponse;
  }

  /**
   * Create Virtual Account (Closed Type)
   * POST /v1.0/transfer-va/create-va
   */
  static async createVirtualAccount(params: VaCreateParams): Promise<VaCreateResponse> {
    const endpoint = '/v1.0/transfer-va/create-va';
    const now = new Date();
    const expireDate = new Date(now.getTime() + (params.validityMinutes || 1440) * 60 * 1000);

    // virtualAccountName length must be 5-24 characters, alphanumeric + space, _, -
    let cleanName = params.customerName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim();
    if (cleanName.length < 5) cleanName = (cleanName + ' User').padEnd(5, 'X');
    if (cleanName.length > 24) cleanName = cleanName.substring(0, 24);

    const payload: any = {
      virtualAccountName: cleanName,
      trxId: params.trxId,
      totalAmount: {
        value: Number(params.amount).toFixed(2),
        currency: 'IDR',
      },
      virtualAccountTrxType: 'C',
      expiredDate: this.getIsoTimestamp(expireDate),
      additionalInfo: {
        channel: params.channel,
      },
    };

    if (params.customerNo) {
      payload.customerNo = params.customerNo;
    }

    const headers = this.getHeaders('POST', endpoint, payload, params.channel, params.trxId);
    const url = `${env.BINDERPAY_BASE_URL}${endpoint}`;

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return data as VaCreateResponse;
  }
}
