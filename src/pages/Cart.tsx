import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { CustomerDetailsForm } from '@/components/CustomerDetailsForm';
import { getCartItems, updateCartItemQuantity, removeFromCart, clearCart } from '@/services/cartService';
import { getProductById } from '@/services/productService';
import { createOrder } from '@/services/orderService';
import { loadRazorpayScript, initializeRazorpay, createRazorpayOrder } from '@/services/razorpayService';
import { showSuccess, showError } from '@/utils/toast';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
}

interface CartItemWithProduct extends CartItem {
  product: Product;
}

const Cart = () => {
  const [user] = useAuthState(auth);
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchCartWithProducts = async () => {
      try {
        setLoading(true);
        const cartItems = await getCartItems();

        // Fetch product details for each cart item
        const itemsWithProducts = await Promise.all(
          cartItems.map(async (cartItem) => {
            const product = await getProductById(cartItem.productId);
            return {
              ...cartItem,
              product: product || {
                id: cartItem.productId,
                name: 'Unknown Product',
                price: 0,
                imageUrl: '/placeholder.svg',
                stock: 0
              }
            };
          })
        );

        setCartItems(itemsWithProducts.filter(item => item.product !== null));
      } catch (error) {
        console.error('Error fetching cart with products:', error);
        setError('Failed to load cart items');
        showError('Failed to load cart items');
      } finally {
        setLoading(false);
      }
    };

    fetchCartWithProducts();
  }, [user, navigate]);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      await updateCartItemQuantity(itemId, newQuantity);
      const updatedItems = await getCartItems();

      // Update with product details
      const itemsWithProducts = await Promise.all(
        updatedItems.map(async (cartItem) => {
          const product = await getProductById(cartItem.productId);
          return {
            ...cartItem,
            product: product || {
              id: cartItem.productId,
              name: 'Unknown Product',
              price: 0,
              imageUrl: '/placeholder.svg',
              stock: 0
            }
          };
        })
      );

      setCartItems(itemsWithProducts);
      showSuccess('Cart updated');
    } catch (error) {
      console.error('Error updating quantity:', error);
      showError('Failed to update quantity');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      setCartItems(cartItems.filter(item => item.id !== itemId));
      showSuccess('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      showError('Failed to remove item');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setShowCustomerForm(true);
  };

  const handleCustomerDetailsSubmit = async (customerDetails: any) => {
    try {
      console.log('Starting payment process with customer details:', customerDetails);
      setPaymentLoading(true);
      setError('');

      // Prepare order items
      const orderItems = cartItems.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl
      }));

      const total = calculateTotal();
      console.log('Order total:', total);

      // Load Razorpay script
      console.log('Loading Razorpay script...');
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway');
      }
      console.log('Razorpay script loaded successfully');

      // Create Razorpay order
      console.log('Creating Razorpay order...');
      const razorpayOrder = await createRazorpayOrder(total, `order_${Date.now()}`);
      console.log('Razorpay order created:', razorpayOrder);

      // Initialize Razorpay payment
      console.log('Initializing Razorpay payment...');
      const razorpay = initializeRazorpay({
        amount: total,
        name: 'Phoolishh Loveee',
        description: 'Payment for order items',
        // Skip order_id for test mode to avoid API errors
        // order_id: razorpayOrder.id,
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.phone
        },
        handler: async (response: any) => {
          console.log('Payment successful:', response);
          try {
            // Payment successful - create order with payment details
            const paymentDetails = {
              method: 'razorpay' as const,
              status: 'paid' as const,
              transactionId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id || razorpayOrder.id
            };

            const orderId = await createOrder(orderItems, customerDetails, paymentDetails);
            console.log('Order created successfully:', orderId);
            
            setCheckoutSuccess(true);
            setShowCustomerForm(false);
            showSuccess('Payment successful! Order placed successfully!');

            // Redirect to home after a delay
            setTimeout(() => {
              navigate('/');
            }, 3000);
          } catch (error) {
            console.error('Order creation error:', error);
            setError('Payment successful but order creation failed. Please contact support.');
            showError('Order creation failed');
          } finally {
            setPaymentLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
            setPaymentLoading(false);
            showError('Payment cancelled');
          }
        }
      });

      console.log('Opening Razorpay modal...');
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment failed. Please try again.');
      showError('Payment failed');
      setPaymentLoading(false);
    }
  };

  const handleCancelPayment = () => {
    setPaymentLoading(false);
    setShowCustomerForm(false);
    showError('Payment cancelled');
  };

  if (loading && !cartItems.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-pink-600 font-medium">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirecting to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100">
      <header className="bg-pink-500 text-white py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold italic">Phoolishh Loveee</h1>
          <nav className="flex space-x-4">
            <Button
              variant="ghost"
              className="text-white hover:bg-pink-400"
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <h2 className="text-3xl font-bold text-pink-600 mb-6">Your Shopping Cart</h2>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {checkoutSuccess ? (
          <div className="text-center py-12 fade-in">
            <div className="mx-auto mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-pink-600 mb-2">Order Placed Successfully!</h3>
            <p className="text-pink-500 mb-4">Thank you for your purchase. You will be redirected shortly.</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-12 fade-in">
            <h3 className="text-xl font-semibold text-pink-500 mb-4">Your cart is empty</h3>
            <p className="text-pink-400 mb-6">Looks like you haven't added anything to your cart yet</p>
            <Button
              className="bg-pink-500 hover:bg-pink-600 button-hover"
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {cartItems.map((item) => (
                <Card key={item.id} className="mb-4 border-pink-200 card-hover">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                      <div className="w-24 h-24 bg-pink-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.imageUrl || '/placeholder.svg'}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-pink-600">{item.product.name}</h3>
                        <p className="text-pink-500">₹{item.product.price.toFixed(2)} each</p>
                        <Badge className="mt-2" variant={item.product.stock > 0 ? "default" : "destructive"}>
                          {item.product.stock > 0 ? 'In Stock' : 'Low Stock'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-pink-200 text-pink-500 hover:bg-pink-50"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-16 text-center border-pink-200 input-focus"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-pink-200 text-pink-500 hover:bg-pink-50"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= (item.product.stock || 10)}
                          >
                            +
                          </Button>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-8 border-pink-200">
                <CardHeader>
                  <CardTitle className="text-pink-600">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-pink-500">Subtotal</span>
                    <span className="font-semibold text-pink-600">₹{calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-pink-500">Shipping</span>
                    <span className="font-semibold text-pink-600">Free</span>
                  </div>
                  <div className="flex justify-between border-t border-pink-200 pt-4">
                    <span className="font-semibold text-pink-600">Total</span>
                    <span className="font-bold text-pink-600">₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-pink-500 hover:bg-pink-600 button-hover"
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading ? (
                      <>
                        <span className="animate-spin mr-2">🌀</span>
                        Processing...
                      </>
                    ) : (
                      'Checkout'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Customer Details Modal */}
      {showCustomerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CustomerDetailsForm
              onSubmit={handleCustomerDetailsSubmit}
              onCancel={() => setShowCustomerForm(false)}
              loading={paymentLoading}
              error={error}
            />
          </div>
        </div>
      )}

      <footer className="bg-pink-500 text-white py-6 mt-12">
        <div className="container mx-auto text-center">
          <p className="mb-2">© {new Date().getFullYear()} Phoolishh Loveee. All rights reserved.</p>
          <MadeWithDyad />
        </div>
      </footer>
    </div>
  );
};

export default Cart;