import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Truck, Package, X, ArrowLeft, Eye, Phone, Mail, MapPin, Heart, Sparkles } from 'lucide-react';
import { getUserOrders } from '@/services/orderService';
import { Order } from '@/services/orderService';
import { showSuccess, showError } from '@/utils/toast';

const CustomerOrders = () => {
  const [user] = useAuthState(auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching customer orders...');
      const ordersData = await getUserOrders();
      console.log('Customer orders fetched:', ordersData);
      
      // Sort orders by date (newest first)
      const sortedOrders = ordersData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load your orders');
      showError('Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle2 className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      default: return null;
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    
    try {
      let dateObj: Date;
      
      if (typeof date === 'string') {
        if (date.includes('T')) {
          dateObj = new Date(date);
        } else {
          dateObj = new Date(date + 'T00:00:00');
        }
      } else if (date && typeof date === 'object' && date.toDate) {
        dateObj = date.toDate();
      } else if (date instanceof Date) {
        dateObj = date;
      } else {
        dateObj = new Date(date);
      }
      
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      
      return dateObj.toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusMessage = (status: Order['status']) => {
    switch (status) {
      case 'pending': 
        return 'Your order has been received and is pending confirmation.';
      case 'processing': 
        return 'Your order is being prepared and will be shipped soon.';
      case 'shipped': 
        return 'Your order has been shipped and is on its way!';
      case 'delivered': 
        return 'Your order has been successfully delivered. Enjoy!';
      case 'cancelled': 
        return 'Your order has been cancelled.';
      default: 
        return 'Order status updated.';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-pink-600 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
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
              <h1 className="text-xl sm:text-3xl font-serif text-purple-900 italic tracking-wide">My Orders</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              <span className="text-purple-900 font-medium text-sm sm:text-base">{orders.length} Orders</span>
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

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-12 w-12 text-purple-400" />
              </div>
              <h2 className="text-3xl font-serif text-purple-900 mb-4 italic">No orders yet</h2>
              <p className="text-gray-600 mb-8">
                You haven't placed any orders yet. Start shopping to see your orders here!
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
          <div className="space-y-6 lg:space-y-8">
            {/* Orders List */}
            <Card className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                <CardTitle className="text-xl sm:text-2xl font-serif text-purple-900 flex items-center">
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-purple-600" />
                  Your Order History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-purple-200 rounded-xl p-3 sm:p-4 hover:shadow-md transition-all duration-300 cursor-pointer group"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                        <div>
                          <h4 className="font-semibold text-purple-900 group-hover:text-purple-700 transition-colors text-sm sm:text-base">
                            Order #{order.id?.slice(-8)}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                        </div>
                        <Badge className={`${getStatusColor(order.status)} border-0 text-xs sm:text-sm`}>
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(order.status)}
                            <span className="font-medium">{order.status}</span>
                          </span>
                        </Badge>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </p>
                          <p className="font-bold text-purple-900 text-base sm:text-lg">₹{order.total.toFixed(2)}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-purple-300 text-purple-600 hover:bg-purple-50 rounded-full text-xs sm:text-sm"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Details - Mobile Modal / Desktop Sidebar */}
            {selectedOrder && (
              <div className="lg:hidden">
                {/* Mobile Modal */}
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-b border-purple-100 sticky top-0">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-serif text-purple-900">Order Details</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrder(null)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">#{selectedOrder.id?.slice(-8)}</p>
                    </div>
                    <div className="p-4 space-y-4">
                      {/* Order Status */}
                      <div>
                        <h4 className="font-semibold text-purple-900 mb-2 flex items-center text-sm">
                          <Heart className="h-4 w-4 mr-2 text-purple-600" />
                          Order Status
                        </h4>
                        <div className="space-y-2">
                          <Badge className={`${getStatusColor(selectedOrder.status)} border-0 text-xs`}>
                            <span className="flex items-center space-x-1">
                              {getStatusIcon(selectedOrder.status)}
                              <span className="font-medium">{selectedOrder.status}</span>
                            </span>
                          </Badge>
                          <p className="text-xs text-gray-600">{getStatusMessage(selectedOrder.status)}</p>
                        </div>
                      </div>

                      {/* Shipping Information */}
                      <div>
                        <h4 className="font-semibold text-purple-900 mb-2 flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-purple-600" />
                          Shipping Information
                        </h4>
                        <div className="space-y-1 text-xs">
                          <p className="font-medium text-purple-900">{selectedOrder.customerDetails.name}</p>
                          <p className="text-gray-600">{selectedOrder.customerDetails.address}</p>
                          <p className="text-gray-600">
                            {selectedOrder.customerDetails.city}, {selectedOrder.customerDetails.state} {selectedOrder.customerDetails.zip}
                          </p>
                          <p className="text-gray-600">{selectedOrder.customerDetails.country}</p>
                          <div className="flex items-center space-x-2 pt-1">
                            <Phone className="h-3 w-3 text-purple-600" />
                            <p className="text-gray-600">{selectedOrder.customerDetails.phone}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-3 w-3 text-purple-600" />
                            <p className="text-gray-600">{selectedOrder.customerDetails.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h4 className="font-semibold text-purple-900 mb-2 flex items-center text-sm">
                          <Package className="h-4 w-4 mr-2 text-purple-600" />
                          Order Items
                        </h4>
                        <div className="space-y-2">
                          {selectedOrder.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-xs border-b border-purple-100 pb-2">
                              <div>
                                <p className="font-medium text-purple-900">{item.productName}</p>
                                <p className="text-gray-500">Qty: {item.quantity}</p>
                              </div>
                              <p className="font-semibold text-purple-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          ))}
                          <div className="pt-2 border-t border-purple-100">
                            <div className="flex justify-between items-center font-bold">
                              <span className="text-purple-900 text-sm">Total:</span>
                              <span className="text-purple-900 text-base">₹{selectedOrder.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Order Details Sidebar */}
            <div className="hidden lg:block">
              {selectedOrder ? (
                <Card className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden sticky top-24">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                    <CardTitle className="text-xl font-serif text-purple-900">Order Details</CardTitle>
                    <p className="text-sm text-gray-500">#{selectedOrder.id?.slice(-8)}</p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Order Status */}
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                        <Heart className="h-4 w-4 mr-2 text-purple-600" />
                        Order Status
                      </h4>
                      <div className="space-y-2">
                        <Badge className={`${getStatusColor(selectedOrder.status)} border-0`}>
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(selectedOrder.status)}
                            <span className="font-medium">{selectedOrder.status}</span>
                          </span>
                        </Badge>
                        <p className="text-sm text-gray-600">{getStatusMessage(selectedOrder.status)}</p>
                      </div>
                    </div>

                    {/* Shipping Information */}
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-purple-600" />
                        Shipping Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p className="font-medium text-purple-900">{selectedOrder.customerDetails.name}</p>
                        <p className="text-gray-600">{selectedOrder.customerDetails.address}</p>
                        <p className="text-gray-600">
                          {selectedOrder.customerDetails.city}, {selectedOrder.customerDetails.state} {selectedOrder.customerDetails.zip}
                        </p>
                        <p className="text-gray-600">{selectedOrder.customerDetails.country}</p>
                        <div className="flex items-center space-x-2 pt-2">
                          <Phone className="h-4 w-4 text-purple-600" />
                          <p className="text-gray-600">{selectedOrder.customerDetails.phone}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-purple-600" />
                          <p className="text-gray-600">{selectedOrder.customerDetails.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                        <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
                        Payment Information
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Method:</strong> {selectedOrder.paymentDetails.method}</p>
                        <p><strong>Status:</strong> {selectedOrder.paymentDetails.status}</p>
                        {selectedOrder.paymentDetails.transactionId && (
                          <p><strong>Transaction ID:</strong> {selectedOrder.paymentDetails.transactionId}</p>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                        <Package className="h-4 w-4 mr-2 text-purple-600" />
                        Order Items
                      </h4>
                      <div className="space-y-2">
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-sm border-b border-purple-100 pb-2">
                            <div>
                              <p className="font-medium text-purple-900">{item.productName}</p>
                              <p className="text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-semibold text-purple-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-purple-100">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-purple-900">Total:</span>
                            <span className="text-purple-900 text-lg">₹{selectedOrder.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Timeline */}
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-2 text-purple-600" />
                        Order Timeline
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <p>Order placed on {formatDate(selectedOrder.createdAt)}</p>
                        </div>
                        {selectedOrder.status !== 'pending' && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <p>Order is being processed</p>
                          </div>
                        )}
                        {selectedOrder.status === 'shipped' && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <p>Order has been shipped</p>
                          </div>
                        )}
                        {selectedOrder.status === 'delivered' && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <p>Order delivered successfully</p>
                          </div>
                        )}
                        {selectedOrder.status === 'cancelled' && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <p>Order was cancelled</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden">
                  <CardContent className="text-center py-12">
                    <Eye className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <p className="text-purple-600 font-medium">Select an order to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerOrders;
