import crypto from 'crypto';
import midtransClient from 'midtrans-client';
import { env } from '../../config/env';

export interface CreateSnapTransactionParams {
  orderNumber: string;
  grossAmount: number;
  customerDetails?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  itemDetails?: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
}

export interface SnapTransactionResponse {
  token: string;
  redirectUrl: string;
}

export class MidtransService {
  private static snapClient: midtransClient.Snap | null = null;

  static getSnapClient(): midtransClient.Snap {
    if (!this.snapClient) {
      if (!env.MIDTRANS_SERVER_KEY) {
        console.warn('[Midtrans] MIDTRANS_SERVER_KEY is not set in environment variables.');
      }

      this.snapClient = new midtransClient.Snap({
        isProduction: env.MIDTRANS_IS_PRODUCTION,
        serverKey: env.MIDTRANS_SERVER_KEY,
        clientKey: env.MIDTRANS_CLIENT_KEY,
      });
    }

    return this.snapClient;
  }

  /**
   * Create Midtrans Snap Transaction
   * Returns Snap payment token & redirect URL
   */
  static async createTransaction(params: CreateSnapTransactionParams): Promise<SnapTransactionResponse> {
    const snap = this.getSnapClient();

    const parameter: any = {
      transaction_details: {
        order_id: params.orderNumber,
        gross_amount: Math.round(params.grossAmount),
      },
    };

    if (params.customerDetails) {
      parameter.customer_details = {
        first_name: params.customerDetails.firstName || 'Customer',
        last_name: params.customerDetails.lastName || '',
        email: params.customerDetails.email,
        phone: params.customerDetails.phone,
      };
    }

    if (params.itemDetails && params.itemDetails.length > 0) {
      parameter.item_details = params.itemDetails.map((item) => ({
        id: item.id.substring(0, 50),
        price: Math.round(item.price),
        quantity: item.quantity,
        name: item.name.substring(0, 50),
      }));
    }

    const transaction = await snap.createTransaction(parameter);

    return {
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
    };
  }

  /**
   * Verify Midtrans Webhook Notification Signature
   * SHA512(order_id + status_code + gross_amount + ServerKey) === signature_key
   */
  static verifySignature(
    orderId: string,
    statusCode: string,
    grossAmount: string,
    signatureKey: string
  ): boolean {
    if (!env.MIDTRANS_SERVER_KEY) return false;

    const rawString = `${orderId}${statusCode}${grossAmount}${env.MIDTRANS_SERVER_KEY}`;
    const calculatedHash = crypto.createHash('sha512').update(rawString).digest('hex');

    return calculatedHash === signatureKey;
  }
}
