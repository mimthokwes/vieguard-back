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
  enabledPayments?: string[];
}

export interface SnapTransactionResponse {
  token: string;
  redirectUrl: string;
}

export interface DirectChargeParams {
  orderNumber: string;
  grossAmount: number;
  paymentMethod: 'qris' | 'va';
  bank?: 'bca' | 'mandiri' | 'bni' | 'bri' | 'permata' | 'cimb';
  customerDetails?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
}

export interface DirectChargeResponse {
  orderNumber: string;
  grossAmount: number;
  paymentMethod: 'qris' | 'va';
  transactionId: string;
  transactionStatus: string;
  expiryTime?: string;
  // QRIS fields
  qrUrl?: string;
  qrString?: string;
  // VA fields
  bank?: string;
  vaNumber?: string;
  billKey?: string;
  billerCode?: string;
}

export class MidtransService {
  private static snapClient: midtransClient.Snap | null = null;
  private static coreApiClient: midtransClient.CoreApi | null = null;

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

  static getCoreApiClient(): midtransClient.CoreApi {
    if (!this.coreApiClient) {
      this.coreApiClient = new midtransClient.CoreApi({
        isProduction: env.MIDTRANS_IS_PRODUCTION,
        serverKey: env.MIDTRANS_SERVER_KEY,
        clientKey: env.MIDTRANS_CLIENT_KEY,
      });
    }

    return this.coreApiClient;
  }

  /**
   * Create Midtrans Snap Transaction
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

    if (params.enabledPayments && params.enabledPayments.length > 0) {
      parameter.enabled_payments = params.enabledPayments;
    }

    const transaction = await snap.createTransaction(parameter);

    return {
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
    };
  }

  /**
   * Direct Headless Charge via Core API (No Midtrans iframe/popup)
   * Directly returns QRIS code / VA number
   */
  static async chargeCoreApi(params: DirectChargeParams): Promise<DirectChargeResponse> {
    const core = this.getCoreApiClient();
    const grossAmount = Math.round(params.grossAmount);

    const transactionDetails = {
      order_id: params.orderNumber,
      gross_amount: grossAmount,
    };

    const customerDetails = params.customerDetails
      ? {
          first_name: params.customerDetails.firstName || 'Customer',
          last_name: params.customerDetails.lastName || '',
          email: params.customerDetails.email,
          phone: params.customerDetails.phone,
        }
      : undefined;

    if (params.paymentMethod === 'qris') {
      const qrisParam: any = {
        payment_type: 'qris',
        transaction_details: transactionDetails,
        customer_details: customerDetails,
        qris: {
          acquirer: 'gopay',
        },
      };

      const res = await core.charge(qrisParam);
      const qrAction = res.actions?.find((a: any) => a.name === 'generate-qr-code') || res.actions?.[0];

      return {
        orderNumber: params.orderNumber,
        grossAmount,
        paymentMethod: 'qris',
        transactionId: res.transaction_id,
        transactionStatus: res.transaction_status,
        expiryTime: res.expiry_time,
        qrUrl: qrAction?.url,
        qrString: res.qr_string,
      };
    }

    // Virtual Account (Bank Transfer)
    const bank = params.bank || 'bca';

    if (bank === 'mandiri') {
      const echannelParam: any = {
        payment_type: 'echannel',
        transaction_details: transactionDetails,
        customer_details: customerDetails,
        echannel: {
          bill_info1: 'Pembayaran:',
          bill_info2: params.orderNumber,
        },
      };

      const res = await core.charge(echannelParam);

      return {
        orderNumber: params.orderNumber,
        grossAmount,
        paymentMethod: 'va',
        bank: 'mandiri',
        transactionId: res.transaction_id,
        transactionStatus: res.transaction_status,
        expiryTime: res.expiry_time,
        billKey: res.bill_key,
        billerCode: res.biller_code,
      };
    }

    // BCA, BNI, BRI, Permata, CIMB
    const bankParam: any = {
      payment_type: 'bank_transfer',
      transaction_details: transactionDetails,
      customer_details: customerDetails,
      bank_transfer: {
        bank,
      },
    };

    const res = await core.charge(bankParam);
    const vaNumber = res.va_numbers?.[0]?.va_number || res.permata_va_number;

    return {
      orderNumber: params.orderNumber,
      grossAmount,
      paymentMethod: 'va',
      bank,
      transactionId: res.transaction_id,
      transactionStatus: res.transaction_status,
      expiryTime: res.expiry_time,
      vaNumber,
    };
  }

  /**
   * Verify Midtrans Webhook Notification Signature
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
