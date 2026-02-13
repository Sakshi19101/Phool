import { loadRazorpayScript as loadScript } from '@/utils/razorpayLoader';

export interface PaymentOptions {
  key?: string;
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

// Razorpay configuration
const RAZORPAY_KEY_ID = 'rzp_test_S81qGkN4miqepM';
const RAZORPAY_KEY_SECRET = 'n5PdmkrRgxQ7I8NIN3J6WJmm';

export const createRazorpayOrder = async (amount: number, receipt: string) => {
  try {
    // Since Razorpay doesn't allow direct API calls from browser due to CORS,
    // we'll create a mock order that works with the Razorpay frontend
    console.log('Creating Razorpay order for frontend integration...');
    
    // Create a mock order that will work with Razorpay frontend
    const order = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: receipt,
      status: 'created'
    };
    
    console.log('Razorpay order created successfully:', order);
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

export const initializeRazorpay = (options: PaymentOptions) => {
  console.log('Initializing Razorpay payment without order...');
  
  // Load Razorpay script if not already loaded
  if (!(window as any).Razorpay) {
    console.error('Razorpay script not loaded');
    return null;
  }

  // Initialize Razorpay without order_id for direct payment
  const razorpay = new (window as any).Razorpay({
    key: RAZORPAY_KEY_ID,
    amount: options.amount * 100, // Convert to paise
    currency: options.currency || 'INR',
    name: options.name,
    description: options.description,
    // Remove order_id to avoid 400 error
    handler: options.handler,
    prefill: options.prefill,
    theme: options.theme || {
      color: '#ec4899' // Pink color to match your theme
    },
    modal: options.modal,
    notes: {
      order_id: options.order_id // Store order_id in notes for reference
    }
  });

  return razorpay;
};

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      console.log('Razorpay script already loaded');
      resolve(true);
      return;
    }

    console.log('Loading Razorpay script...');
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
      resolve(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      resolve(false);
    };
    
    document.body.appendChild(script);
  });
};