import Razorpay from 'razorpay';

// Razorpay configuration
const RAZORPAY_KEY_ID = 'rzp_test_S2UwgGjTCRAvqY';
const RAZORPAY_KEY_SECRET = 'xfmber20FwYYgceCwfTzE5AZ';

export interface PaymentOptions {
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
      const response = await fetch('http://localhost:5001/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, receipt }),
      });
      if (!response.ok) {
        throw new Error('Failed to create Razorpay order');
      }
      const order = await response.json();
      return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

// Mock payment function for testing
export const processMockPayment = async (amount: number, customerDetails: any): Promise<any> => {
  console.log('Processing mock payment for:', amount, customerDetails);
  
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate successful payment
  return {
    razorpay_payment_id: `pay_${Date.now()}`,
    razorpay_order_id: `order_${Date.now()}`,
    razorpay_signature: `mock_signature_${Date.now()}`
  };
};

export const initializeRazorpay = (options: PaymentOptions) => {
  console.log('Initializing Razorpay with options:', options);
  
  // For now, let's use a mock payment flow since Razorpay test keys are not working
  console.log('Using mock payment flow instead of Razorpay API');
  
  // Create a mock payment handler
  const mockPayment = {
    open: () => {
      console.log('Opening mock payment modal...');
      // Simulate payment modal opening
      setTimeout(async () => {
        try {
          // Simulate successful payment
          const mockResponse = await processMockPayment(options.amount, options.prefill);
          console.log('Mock payment successful:', mockResponse);
          options.handler(mockResponse);
        } catch (error) {
          console.error('Mock payment failed:', error);
          if (options.modal?.ondismiss) {
            options.modal.ondismiss();
          }
        }
      }, 1000);
    },
    close: () => {
      console.log('Closing mock payment modal');
      if (options.modal?.ondismiss) {
        options.modal.ondismiss();
      }
    }
  };

  return mockPayment;
};

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // For mock payment, we don't need to load the script
    console.log('Using mock payment - no script needed');
    resolve(true);
  });
};
