import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Minus, Plus, Trash2, ShoppingBag, Heart, Star, ArrowLeft, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CustomerDetailsForm } from '@/components/CustomerDetailsForm';
import { getCartItems, updateCartItemQuantity, removeFromCart } from '@/services/cartService';
import { getProductById, Product } from '@/services/productService';
import { createOrder } from '@/services/orderService';
import { loadRazorpayScript, initializeRazorpay, createRazorpayOrder } from '@/services/razorpayService';
import { showSuccess, showError } from '@/utils/toast';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  addedAt: Date;
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
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; type: 'fixed' | 'percentage' } | null>(null);
  const [couponError, setCouponError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchCartWithProducts = async () => {
      try {
        setLoading(true);
        
        // Clear localStorage cache to force fresh fetch
        localStorage.removeItem(`cart_${user.uid}`);
        
        const cartItems = await getCartItems();
        console.log('Cart items fetched:', cartItems);
        
        if (cartItems.length === 0) {
          console.log('No cart items found');
          setCartItems([]);
          return;
        }
        
        // Fetch product details for each cart item
        const itemsWithProducts = await Promise.all(
          cartItems.map(async (cartItem) => {
            console.log('Fetching product for cart item:', cartItem);
            try {
              const product = await getProductById(cartItem.productId);
              console.log('Product fetched:', product);
              return {
                ...cartItem,
                product: product || {
                  id: cartItem.productId,
                  name: 'Unknown Product',
                  price: 0,
                  imageUrl: '/placeholder.svg',
                  stock: 0,
                  description: 'Product details not available'
                }
              };
            } catch (error) {
              console.error('Error fetching product:', error);
              return {
                ...cartItem,
                product: {
                  id: cartItem.productId,
                  name: 'Unknown Product',
                  price: 0,
                  imageUrl: '/placeholder.svg',
                  stock: 0,
                  description: 'Product details not available'
                }
              };
            }
          })
        );

        console.log('Items with products:', itemsWithProducts);
        
        // Show items even if product is null - create a placeholder product
        const itemsWithPlaceholders = itemsWithProducts.map(item => {
          if (item.product === null) {
            console.log('Creating placeholder for missing product:', item);
            return {
              ...item,
              product: {
                id: item.productId,
                name: `Product ${item.productId}`,
                price: 99, // Set a default price
                description: 'Product details not available',
                imageUrl: '/placeholder.svg',
                stock: 10
              }
            };
          }
          return item;
        });

        setCartItems(itemsWithPlaceholders);
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
      
      // Clear localStorage cache to force fresh fetch
      const user = auth.currentUser;
      if (user) {
        localStorage.removeItem(`cart_${user.uid}`);
      }
      
      const updatedItems = await getCartItems();
      console.log('Updated cart items:', updatedItems);
      
      // Update with product details
      const itemsWithProducts = await Promise.all(
        updatedItems.map(async (cartItem) => {
          try {
            const product = await getProductById(cartItem.productId);
            return {
              ...cartItem,
              product: product || {
                id: cartItem.productId,
                name: 'Unknown Product',
                price: 0,
                imageUrl: '/placeholder.svg',
                stock: 0,
                description: 'Product details not available'
              }
            };
          } catch (error) {
            console.error('Error fetching product:', error);
            return {
              ...cartItem,
              product: {
                id: cartItem.productId,
                name: 'Unknown Product',
                price: 0,
                imageUrl: '/placeholder.svg',
                stock: 0,
                description: 'Product details not available'
              }
            };
          }
        })
      );

      // Show items even if product is null - create a placeholder product
      const itemsWithPlaceholders = itemsWithProducts.map(item => {
        if (item.product === null) {
          console.log('Creating placeholder for missing product:', item);
          return {
            ...item,
            product: {
              id: item.productId,
              name: `Product ${item.productId}`,
              price: 99, // Set a default price
              description: 'Product details not available',
              imageUrl: '/placeholder.svg',
              stock: 10
            }
          };
        }
        return item;
      });

      setCartItems(itemsWithPlaceholders);
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

  const calculateDiscountedTotal = () => {
    const subtotal = calculateTotal();
    if (!appliedCoupon) return subtotal;
    
    if (appliedCoupon.type === 'fixed') {
      return Math.max(0, subtotal - appliedCoupon.discount);
    } else {
      return subtotal * (1 - appliedCoupon.discount / 100);
    }
  };

  const applyCoupon = () => {
    setCouponError('');
    
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    // Define valid coupons
    const validCoupons = {
      'TRUELOVE100': { discount: 100, type: 'fixed' as const },
      'TRUELOVE50': { discount: 50, type: 'fixed' as const },
      'ALMOSTLOVE5': { discount: 5, type: 'percentage' as const }
    };

    const coupon = validCoupons[couponCode.toUpperCase()];
    
    if (coupon) {
      setAppliedCoupon({
        code: couponCode.toUpperCase(),
        discount: coupon.discount,
        type: coupon.type
      });
      showSuccess(`Coupon applied! ${coupon.type === 'fixed' ? `₹${coupon.discount} off` : `${coupon.discount}% off`}`);
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showSuccess('Coupon removed');
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

      // Calculate totals
      const subtotal = calculateTotal();
      const discountedTotal = calculateDiscountedTotal();
      console.log('Subtotal:', subtotal, 'Discounted Total:', discountedTotal);

      // Prepare order items
      const orderItems = cartItems.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl
      }));

      // Load Razorpay script
      console.log('Loading Razorpay script...');
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway');
      }

      console.log('Razorpay script loaded successfully');

      // Create Razorpay order with DISCOUNTED total
      console.log('Creating Razorpay order...');
      const razorpayOrder = await createRazorpayOrder(discountedTotal, `order_${Date.now()}`);
      console.log('Razorpay order created:', razorpayOrder);

      // Initialize Razorpay payment with DISCOUNTED total
      console.log('Initializing Razorpay payment...');
      const rzp = initializeRazorpay({
        key: 'rzp_test_S81qGkN4miqepM',
        amount: discountedTotal, // Razorpay service will convert to paise
        currency: 'INR',
        name: 'Phoolishh Loveee',
        description: `Payment for order items ${appliedCoupon ? `(Coupon: ${appliedCoupon.code})` : ''}`,
        order_id: razorpayOrder.id,
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
              transactionId: response.razorpay_payment_id || `txn_${Date.now()}`,
              orderId: razorpayOrder.id || `order_${Date.now()}`
            };

            console.log('Payment details:', paymentDetails);

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
        },
        theme: {
          color: '#ec4899'
        }
      });

      console.log('Opening Razorpay modal...');
      rzp.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment failed. Please try again.');
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-pink-50 to-purple-50">
      {/* Elegant Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-purple-100">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Button
                variant="ghost"
                className="text-purple-900 hover:text-purple-700 hover:bg-purple-50 font-medium transition-all duration-300"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to Store</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <h1 className="text-xl sm:text-3xl font-serif text-purple-900 italic tracking-wide">Shopping Cart</h1>
            </div>
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              <span className="text-purple-900 font-medium text-sm sm:text-base">{cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 sm:px-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {checkoutSuccess ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-serif text-purple-900 mb-4 italic">Order Placed Successfully!</h2>
              <p className="text-gray-600 mb-8">
                Thank you for your purchase. You will be redirected shortly.
              </p>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-12 w-12 text-purple-400" />
              </div>
              <h2 className="text-3xl font-serif text-purple-900 mb-4 italic">Your cart is empty</h2>
              <p className="text-gray-600 mb-8">
                Looks like you haven't added any beautiful blooms to your cart yet. 
                Start shopping to fill it with love!
              </p>
              <Button
                className="bg-gradient-to-r from-purple-800 to-pink-600 hover:from-purple-900 hover:to-pink-700 text-white font-bold px-8 py-3 shadow-lg transform hover:scale-105 transition-all duration-300"
                onClick={() => navigate('/')}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Start Shopping
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                  <CardTitle className="text-2xl font-serif text-purple-900 flex items-center">
                    <ShoppingBag className="h-6 w-6 mr-3 text-purple-600" />
                    Cart Items ({cartItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="group">
                        <div className="flex flex-col sm:flex-row gap-6 p-4 bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-xl hover:shadow-md transition-all duration-300">
                          {/* Product Image */}
                          <div className="relative aspect-square sm:w-24 sm:h-24 overflow-hidden rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
                            <img
                              src={item.product.imageUrl || '/placeholder.svg'}
                              alt={item.product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white text-purple-900 rounded-full p-2 shadow-md"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 space-y-3">
                            <div>
                              <h3 className="text-xl font-serif text-purple-900 group-hover:text-purple-700 transition-colors">
                                {item.product.name}
                              </h3>
                              <p className="text-gray-600 text-sm line-clamp-2">{item.product.description || 'Beautiful floral arrangement'}</p>
                            </div>

                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-500 ml-1">(4.9)</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div className="flex items-center space-x-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-purple-300 text-purple-900 hover:bg-purple-50 rounded-full p-2"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="font-semibold text-purple-900 min-w-[2rem] text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-purple-300 text-purple-900 hover:bg-purple-50 rounded-full p-2"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  disabled={item.quantity >= (item.product.stock || 10)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>

                              <div className="text-right">
                                <p className="text-2xl font-bold text-purple-900">
                                  ₹{(item.product.price * item.quantity).toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  ₹{item.product.price.toFixed(2)} each
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Order Summary Card */}
                <Card className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                    <CardTitle className="text-xl font-serif text-purple-900">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {/* Coupon Section */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-purple-100 text-purple-800">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Have a coupon?
                        </Badge>
                      </div>
                      {!appliedCoupon ? (
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-1 border-purple-200 focus:border-purple-400"
                            onKeyPress={(e) => e.key === 'Enter' && applyCoupon()}
                          />
                          <Button
                            onClick={applyCoupon}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4"
                          >
                            Apply
                          </Button>
                        </div>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">
                                Coupon applied: {appliedCoupon.code}
                              </span>
                              <Badge className="bg-green-100 text-green-800">
                                {appliedCoupon.type === 'fixed' ? `₹${appliedCoupon.discount} off` : `${appliedCoupon.discount}% off`}
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={removeCoupon}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      )}
                      {couponError && (
                        <p className="text-sm text-red-600">{couponError}</p>
                      )}
                    </div>

                    <div className="border-t border-purple-100 pt-4">
                      <div className="space-y-3">
                        <div className="flex justify-between text-gray-600">
                          <span>Subtotal ({cartItems.length} items)</span>
                          <span>₹{calculateTotal().toFixed(2)}</span>
                        </div>
                        {appliedCoupon && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount ({appliedCoupon.code})</span>
                            <span>-₹{(calculateTotal() - calculateDiscountedTotal()).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-gray-600">
                          <span>Shipping</span>
                          <span className="text-green-600 font-medium">FREE</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Tax</span>
                          <span>₹0.00</span>
                        </div>
                        <div className="border-t border-purple-100 pt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-purple-900">Total</span>
                            <div className="text-right">
                              {appliedCoupon && (
                                <p className="text-sm text-gray-500 line-through">
                                  ₹{calculateTotal().toFixed(2)}
                                </p>
                              )}
                              <span className="text-2xl font-bold text-purple-900">
                                ₹{calculateDiscountedTotal().toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4">
                      <Button
                        className="w-full bg-gradient-to-r from-purple-800 to-pink-600 hover:from-purple-900 hover:to-pink-700 text-white font-bold py-4 shadow-lg transform hover:scale-105 transition-all duration-300"
                        onClick={handleCheckout}
                        disabled={cartItems.length === 0}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Proceed to Checkout
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full border-purple-300 text-purple-900 hover:bg-purple-50 font-medium"
                        onClick={() => navigate('/')}
                      >
                        Continue Shopping
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Trust Badges */}
                <Card className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-purple-900 mb-4 text-center">Why Shop With Us?</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="text-sm text-gray-700">Premium Quality Flowers</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="text-sm text-gray-700">Same Day Delivery</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="text-sm text-gray-700">100% Satisfaction Guarantee</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Customer Details Modal */}
      {showCustomerForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-800 to-pink-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-serif italic">Complete Your Order</h2>
              <p className="text-white/90">Please provide your delivery details</p>
            </div>
            <div className="p-6">
              <CustomerDetailsForm
                onSubmit={handleCustomerDetailsSubmit}
                onCancel={() => setShowCustomerForm(false)}
                loading={paymentLoading}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Cart;