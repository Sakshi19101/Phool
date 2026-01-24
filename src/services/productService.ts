import { db, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

interface Product {
  id?: string;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  stock: number;
  createdAt?: Date;
}

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
};

export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    const docRef = doc(db, "products", productId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Product;
    }

    return null;
  } catch (error) {
    console.error('Error getting product:', error);
    throw error;
  }
};

export const addProduct = async (product: Omit<Product, 'id'>, imageFile?: File): Promise<string> => {
  try {
    let imageUrl = product.imageUrl;

    if (imageFile) {
      imageUrl = await uploadProductImage(imageFile);
    }

    const productData = {
      ...product,
      imageUrl: imageUrl || '/placeholder.svg',
      createdAt: new Date()
    };

    const docRef = await addDoc(collection(db, "products"), productData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

export const updateProduct = async (productId: string, product: Partial<Product>, imageFile?: File): Promise<void> => {
  try {
    let imageUrl = product.imageUrl;

    if (imageFile) {
      // If there's an existing image, delete it first
      const existingProduct = await getProductById(productId);
      if (existingProduct?.imageUrl && !existingProduct.imageUrl.includes('placeholder.svg')) {
        await deleteProductImage(existingProduct.imageUrl);
      }

      imageUrl = await uploadProductImage(imageFile);
    }

    const productData = {
      ...product,
      imageUrl: imageUrl || product.imageUrl
    };

    await updateDoc(doc(db, "products", productId), productData);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    // First get the product to delete its image
    const product = await getProductById(productId);
    if (product?.imageUrl && !product.imageUrl.includes('placeholder.svg')) {
      await deleteProductImage(product.imageUrl);
    }

    await deleteDoc(doc(db, "products", productId));
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const updateProductStock = async (productId: string, quantity: number): Promise<void> => {
  try {
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, {
      stock: quantity
    });
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw error;
  }
};

const uploadProductImage = async (file: File): Promise<string> => {
  const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

const deleteProductImage = async (imageUrl: string): Promise<void> => {
  // Extract the path from the full URL
  const path = decodeURIComponent(imageUrl.split('/o/')[1].split('?')[0]);
  const fileRef = ref(storage, path);
  await deleteObject(fileRef);
};