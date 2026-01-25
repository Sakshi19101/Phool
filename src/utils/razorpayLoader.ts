export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const scriptId = 'razorpay-script';
    
    // Check if script is already loaded
    if (document.getElementById(scriptId)) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    
    document.body.appendChild(script);
  });
};