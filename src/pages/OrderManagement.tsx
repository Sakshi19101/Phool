import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, CheckCircle2, Truck, Package, X, ArrowLeft, Eye } from 'lucide-react';
import { getAllOrders, updateOrderStatus } from '@/services/orderService';
import { Order } from '@/services/orderService';
import { showSuccess, showError } from '@/utils/toast';

const OrderManagement = () => {
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
      const ordersData = await getAllOrders();
      // Sort orders by date (newest first)
      const sortedOrders = ordersData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
      showError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      showSuccess('Order status updated successfully');
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Error updating order status:', error);
      showError('Failed to update order status');
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-pink-600 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100">
      <header className="bg-pink-500 text-white py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              className="text-white hover:bg-pink-400"
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
            <h1 className="text-2xl font-bold italic">Order Management</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Package className="h-6 w-6" />
            <span>{orders.length} Orders</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-pink-500 mb-2">No orders yet</h3>
            <p className="text-pink-400">When customers place orders, they will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orders List */}
            <div className="lg:col-span-2">
              <Card className="border-pink-200">
                <CardHeader>
                  <CardTitle className="text-pink-600">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-pink-200">
                          <TableHead className="text-pink-600">Order ID</TableHead>
                          <TableHead className="text-pink-600">Customer</TableHead>
                          <TableHead className="text-pink-600">Total</TableHead>
                          <TableHead className="text-pink-600">Status</TableHead>
                          <TableHead className="text-pink-600">Date</TableHead>
                          <TableHead className="text-pink-600 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id} className="border-pink-100">
                            <TableCell className="font-medium">
                              #{order.id?.slice(-8)}
                            </TableCell>
                            <TableCell>{order.customerDetails.name}</TableCell>
                            <TableCell className="font-semibold text-pink-600">
                              ₹{order.total.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(order.status)}>
                                <span className="flex items-center space-x-1">
                                  {getStatusIcon(order.status)}
                                  <span>{order.status}</span>
                                </span>
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {formatDate(order.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-pink-200 text-pink-500 hover:bg-pink-50"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Details */}
            <div className="lg:col-span-1">
              {selectedOrder ? (
                <Card className="border-pink-200">
                  <CardHeader>
                    <CardTitle className="text-pink-600">Order Details</CardTitle>
                    <p className="text-sm text-gray-500">#{selectedOrder.id?.slice(-8)}</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Customer Information */}
                    <div>
                      <h4 className="font-semibold text-pink-600 mb-2">Customer Information</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Name:</strong> {selectedOrder.customerDetails.name}</p>
                        <p><strong>Email:</strong> {selectedOrder.customerDetails.email}</p>
                        <p><strong>Phone:</strong> {selectedOrder.customerDetails.phone}</p>
                        <p><strong>Address:</strong> {selectedOrder.customerDetails.address}</p>
                        <p><strong>City:</strong> {selectedOrder.customerDetails.city}, {selectedOrder.customerDetails.state}</p>
                        <p><strong>ZIP:</strong> {selectedOrder.customerDetails.zip}</p>
                        <p><strong>Country:</strong> {selectedOrder.customerDetails.country}</p>
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div>
                      <h4 className="font-semibold text-pink-600 mb-2">Payment Information</h4>
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
                      <h4 className="font-semibold text-pink-600 mb-2">Order Items</h4>
                      <div className="space-y-2">
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-sm border-b pb-2">
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-semibold text-pink-600">₹{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Management */}
                    <div>
                      <h4 className="font-semibold text-pink-600 mb-2">Update Status</h4>
                      <div className="space-y-2">
                        {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                          <>
                            {selectedOrder.status === 'pending' && (
                              <Button
                                size="sm"
                                className="w-full bg-blue-500 hover:bg-blue-600"
                                onClick={() => handleStatusUpdate(selectedOrder.id!, 'processing')}
                              >
                                Mark as Processing
                              </Button>
                            )}
                            {selectedOrder.status === 'processing' && (
                              <Button
                                size="sm"
                                className="w-full bg-purple-500 hover:bg-purple-600"
                                onClick={() => handleStatusUpdate(selectedOrder.id!, 'shipped')}
                              >
                                Mark as Shipped
                              </Button>
                            )}
                            {selectedOrder.status === 'shipped' && (
                              <Button
                                size="sm"
                                className="w-full bg-green-500 hover:bg-green-600"
                                onClick={() => handleStatusUpdate(selectedOrder.id!, 'delivered')}
                              >
                                Mark as Delivered
                              </Button>
                            )}
                          </>
                        )}
                        {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full border-red-200 text-red-500 hover:bg-red-50"
                            onClick={() => handleStatusUpdate(selectedOrder.id!, 'cancelled')}
                          >
                            Cancel Order
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-pink-200">
                  <CardContent className="text-center py-12">
                    <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Select an order to view details</p>
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

export default OrderManagement;
