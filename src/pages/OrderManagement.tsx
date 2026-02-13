import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle2, Truck, Package, X, ArrowLeft, Eye, Search } from 'lucide-react';
import { getAllOrders, updateOrderStatus } from '@/services/orderService';
import { Order } from '@/services/orderService';
import { showSuccess, showError } from '@/utils/toast';

const OrderManagement = () => {
  const [user] = useAuthState(auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if user is admin
    const checkAdminStatus = async () => {
      try {
        // For now, check if email matches admin email
        // In production, you should check the isAdmin field in the user document
        const adminEmails = ['admin@phoolishlove.com']; // Add your admin email here
        
        if (!adminEmails.includes(user?.email || '')) {
          console.log('User is not admin, redirecting...', user?.email);
          navigate('/');
          return;
        }
        
        console.log('User is admin, fetching orders...');
        fetchOrders();
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/');
      }
    };

    checkAdminStatus();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching all orders...');
      const ordersData = await getAllOrders();
      console.log('Orders fetched:', ordersData);
      
      // Sort orders by date (newest first)
      const sortedOrders = ordersData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      console.log('Sorted orders:', sortedOrders);
      setOrders(sortedOrders);
      setFilteredOrders(sortedOrders); // Initialize filtered orders
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
      showError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on search term and status
  useEffect(() => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.customerDetails.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerDetails.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      console.log('Updating order status:', orderId, newStatus);
      await updateOrderStatus(orderId, newStatus);
      showSuccess('Order status updated successfully');
      fetchOrders(); // Refresh the orders list
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
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

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    
    try {
      // Handle different date formats
      let dateObj: Date;
      
      if (typeof date === 'string') {
        // Handle Firestore timestamp string
        if (date.includes('T')) {
          dateObj = new Date(date);
        } else {
          // Handle date strings without time
          dateObj = new Date(date + 'T00:00:00');
        }
      } else if (date && typeof date === 'object' && date.toDate) {
        // Handle Firestore Timestamp object
        dateObj = date.toDate();
      } else if (date instanceof Date) {
        dateObj = date;
      } else {
        // Handle timestamp numbers
        dateObj = new Date(date);
      }
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date:', date);
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
      console.error('Error formatting date:', error, date);
      return 'Invalid Date';
    }
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
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-pink-400 ml-4"
              onClick={() => fetchOrders()}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
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
          <div className="space-y-6">
            {/* Search and Filter Controls */}
            <Card className="border-pink-200">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by name, email, or order ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-pink-200"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-48">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-pink-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Showing {filteredOrders.length} of {orders.length} orders
                </div>
              </CardContent>
            </Card>

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
                          {filteredOrders.map((order) => (
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
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderManagement;
