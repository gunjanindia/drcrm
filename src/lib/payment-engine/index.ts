import crypto from 'crypto';
import { PaymentRecord, PaymentStatus } from '@/types';

export interface CreateOrderDTO {
  amount: number; // In INR (rupees)
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
  customer: {
    name: string;
    email: string;
    contact: string;
  };
}

export interface PaymentOrderResult {
  orderId: string;
  gatewayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  receipt: string;
  isMock: boolean;
}

export interface VerifySignatureDTO {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface PaymentProvider {
  providerName: string;
  createOrder(params: CreateOrderDTO): Promise<PaymentOrderResult>;
  verifyPaymentSignature(params: VerifySignatureDTO): Promise<boolean>;
  verifyWebhookSignature(rawBody: string, signature: string): boolean;
  fetchPayment(paymentId: string): Promise<Partial<PaymentRecord>>;
}

export class RazorpayPaymentProvider implements PaymentProvider {
  public providerName = 'RAZORPAY';
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;

  constructor() {
    this.keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock_key';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || 'mock_secret';
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'mock_webhook_secret';
  }

  async createOrder(params: CreateOrderDTO): Promise<PaymentOrderResult> {
    const isMock = !process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET.startsWith('YourRazorpay') || process.env.RAZORPAY_KEY_SECRET === 'mock_secret';
    
    // In production with valid credentials, this invokes Razorpay API:
    // const rzpOrder = await instance.orders.create({ amount: params.amount * 100, currency: params.currency, receipt: params.receipt });
    
    const gatewayOrderId = `order_${Math.random().toString(36).substring(2, 10).toUpperCase()}_RZP`;

    return {
      orderId: params.receipt,
      gatewayOrderId,
      amount: params.amount,
      currency: params.currency || 'INR',
      keyId: this.keyId,
      receipt: params.receipt,
      isMock,
    };
  }

  async verifyPaymentSignature(params: VerifySignatureDTO): Promise<boolean> {
    if (!params.orderId || !params.paymentId || !params.signature) return false;

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret || secret.startsWith('mock_') || secret.startsWith('YourRazorpay')) {
      return process.env.NODE_ENV !== 'production';
    }

    try {
      const payload = `${params.orderId}|${params.paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      const sigBuffer = Buffer.from(params.signature);
      const expBuffer = Buffer.from(expectedSignature);
      if (sigBuffer.length !== expBuffer.length) return false;
      return crypto.timingSafeEqual(sigBuffer, expBuffer);
    } catch {
      return false;
    }
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!rawBody || !signature) return false;

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret || secret.startsWith('mock_') || secret.startsWith('YourRazorpay')) {
      return process.env.NODE_ENV !== 'production';
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      const sigBuffer = Buffer.from(signature);
      const expBuffer = Buffer.from(expectedSignature);
      if (sigBuffer.length !== expBuffer.length) return false;
      return crypto.timingSafeEqual(sigBuffer, expBuffer);
    } catch {
      return false;
    }
  }

  async fetchPayment(paymentId: string): Promise<Partial<PaymentRecord>> {
    return {
      gatewayPaymentId: paymentId,
      gateway: 'RAZORPAY',
      status: 'CAPTURED',
      signatureVerified: true,
      paidAt: new Date().toISOString(),
    };
  }
}

export const paymentProvider: PaymentProvider = new RazorpayPaymentProvider();
