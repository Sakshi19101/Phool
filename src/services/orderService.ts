import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth } from '@/lib/firebase';
import { clearCart } from './cartService';

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface PaymentDetails {
  method: 'razorpay' | 'cod';
  status: 'pending' | 'paid' | 'failed';
  transactionId?: string;
  orderId?: string;
}

export interface Order {
  id?: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  customerDetails: CustomerDetails;
  paymentDetails: PaymentDetails;
}

export const createOrder = async (
  items: OrderItem[], 
  customerDetails: CustomerDetails, 
  paymentDetails: PaymentDetails
): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  try {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const orderData: Order = {
      userId: user.uid,
      items,
      total,
      status: paymentDetails.status === 'paid' ? 'processing' : 'pending',
      createdAt: new Date(),
      customerDetails,
      paymentDetails
    };

    const docRef = await addDoc(collection(db, "orders"), orderData);

    // Clear the cart after successful order
    await clearCart();

    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getUserOrders = async (): Promise<Order[]> => {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
  } catch (error) {
    console.error('Error getting user orders:', error);
    return [];
  }
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const docRef = doc(db, "orders", orderId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Order;
    }

    return null;
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
};

export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "orders"));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
  } catch (error) {
    console.error('Error getting all orders:', error);
    return [];
  }
};

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<void> => {
  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      status
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};