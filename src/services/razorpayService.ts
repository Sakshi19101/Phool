import { loadRazorpayScript as loadScript } from '@/utils/razorpayLoader';

export interface PaymentOptions {
  key: string;
  amount: number;
  currency?: string;
  name: string;
  description: string;
  order_id?: string;
  handler: (response: any) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export const createRazorpayOrder = async (amount: number, receipt: string) => {
  try {
    // Call backend API to create Razorpay order
    const response = await fetch('/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        receipt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create Razorpay order: ${errorText}`);
    }

    const order = await response.json();
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

export const initializeRazorpay = (options: PaymentOptions) => {
  // Check if Razorpay is already loaded
  if (!(window as any).Razorpay) {
    throw new Error('Razorpay SDK not loaded');
  }

  const rzp = new (window as any).Razorpay(options);
  return rzp;
};

export const loadRazorpayScript = (): Promise<boolean> => {
  return loadScript();
};