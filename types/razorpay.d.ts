// types/razorpay.d.ts
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
    method?: "card" | "netbanking" | "wallet" | "emi" | "upi";
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
  config?: {
    display?: {
      blocks?: Record<string, any>;
      sequence?: string[];
      preferences?: {
        show_default_blocks?: boolean;
      };
    };
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status?: string;
  created_at?: number;
}

export interface PaymentData {
  paymentId: string;
  transactionId: string;
  order: RazorpayOrder;
  razorpayKey: string;
  amount: number;
  month: string;
  monthDisplay: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Room {
  _id: string;
  roomNumber: string;
  monthlyRent: number;
  building?: string;
  floor?: string;
}
