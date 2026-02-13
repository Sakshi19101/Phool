import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth } from '@/lib/firebase';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  addedAt: Date;
}

export const addToCart = async (productId: string, quantity: number = 1) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  console.log('Adding to cart:', { productId, quantity, userId: user.uid });

  try {
    // Check if item already exists in cart
    const cartRef = collection(db, `users/${user.uid}/cart`);
    const q = query(cartRef, where('productId', '==', productId));
    const querySnapshot = await getDocs(q);

    console.log('Cart query result:', querySnapshot.empty ? 'No existing items' : `${querySnapshot.docs.length} items found`);

    if (!querySnapshot.empty) {
      // Update existing item
      const docRef = querySnapshot.docs[0].ref;
      const existingItem = querySnapshot.docs[0].data() as Omit<CartItem, 'id'>;
      console.log('Updating existing cart item:', existingItem);
      await updateDoc(docRef, {
        quantity: existingItem.quantity + quantity,
        addedAt: new Date()
      });
    } else {
      // Add new item
      console.log('Adding new cart item');
      await addDoc(cartRef, {
        productId,
        quantity,
        addedAt: new Date()
      });
    }

    // Also update localStorage for quick access
    const cartItems = await getCartItems();
    localStorage.setItem(`cart_${user.uid}`, JSON.stringify(cartItems));

    console.log('Cart updated successfully:', cartItems);
    return true;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const getCartItems = async (): Promise<CartItem[]> => {
  const user = auth.currentUser;
  if (!user) {
    console.log('No user authenticated, returning empty cart');
    return [];
  }

  console.log('Getting cart items for user:', user.uid);

  try {
    // First try localStorage for quick access
    const cachedCart = localStorage.getItem(`cart_${user.uid}`);
    if (cachedCart) {
      console.log('Found cached cart:', JSON.parse(cachedCart));
      return JSON.parse(cachedCart);
    }

    console.log('No cached cart found, fetching from Firestore');

    // If not in cache, fetch from Firestore
    const cartRef = collection(db, `users/${user.uid}/cart`);
    const querySnapshot = await getDocs(cartRef);

    console.log('Firestore cart query result:', querySnapshot.empty ? 'No items' : `${querySnapshot.docs.length} items`);

    const cartItems = querySnapshot.docs.map(doc => {
      const data = doc.data() as Omit<CartItem, 'id'>;
      return {
        id: doc.id,
        ...data
      } as CartItem;
    });

    console.log('Processed cart items:', cartItems);

    // Cache in localStorage
    localStorage.setItem(`cart_${user.uid}`, JSON.stringify(cartItems));

    return cartItems;
  } catch (error) {
    console.error('Error getting cart items:', error);
    return [];
  }
};

export const updateCartItemQuantity = async (itemId: string, newQuantity: number) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  if (newQuantity <= 0) {
    return removeFromCart(itemId);
  }

  try {
    const docRef = doc(db, `users/${user.uid}/cart`, itemId);
    await updateDoc(docRef, {
      quantity: newQuantity,
      addedAt: new Date()
    });

    // Update localStorage
    const cartItems = await getCartItems();
    localStorage.setItem(`cart_${user.uid}`, JSON.stringify(cartItems));

    return true;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

export const removeFromCart = async (itemId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  try {
    const docRef = doc(db, `users/${user.uid}/cart`, itemId);
    await deleteDoc(docRef);

    // Update localStorage
    const cartItems = await getCartItems();
    localStorage.setItem(`cart_${user.uid}`, JSON.stringify(cartItems));

    return true;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

export const clearCart = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  try {
    const cartItems = await getCartItems();
    const deletePromises = cartItems.map(item =>
      deleteDoc(doc(db, `users/${user.uid}/cart`, item.id))
    );

    await Promise.all(deletePromises);

    // Clear localStorage
    localStorage.removeItem(`cart_${user.uid}`);

    return true;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};