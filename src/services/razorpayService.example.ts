// Razorpay service template
// Copy this file to razorpayService.ts and replace with your actual Razorpay credentials

// Razorpay configuration
const RAZORPAY_KEY_ID = 'YOUR_RAZORPAY_KEY_ID';
const RAZORPAY_KEY_SECRET = 'YOUR_RAZORPAY_KEY_SECRET';

export const createRazorpayOrder = async (amount: number, receipt: string) => {
  try {
    // This should be implemented on your backend server
    // Never expose your Razorpay key secret in frontend code
    
    const response = await fetch('YOUR_BACKEND_API_URL/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        receipt,
      }),
    });

    const order = await response.json();
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initializeRazorpay = (options: any) => {
  if (typeof window !== 'undefined' && (window as any).Razorpay) {
    return new (window as any).Razorpay(options);
  }
  throw new Error('Razorpay SDK not loaded');
};
