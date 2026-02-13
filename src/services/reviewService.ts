import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  Timestamp,
  doc,
  deleteDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

export interface Review {
  id?: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  reviewText: string;
  photoUrl?: string;
  productId?: string;
  productName?: string;
  approved: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface ReviewSubmission {
  customerName: string;
  customerEmail: string;
  rating: number;
  reviewText: string;
  photo?: File;
  productId?: string;
  productName?: string;
}

// Submit a new review
export const submitReview = async (reviewData: ReviewSubmission): Promise<string> => {
  try {
    let photoUrl = '';
    
    // Upload photo if provided
    if (reviewData.photo) {
      const photoRef = ref(storage, `reviews/${Date.now()}_${reviewData.photo.name}`);
      const snapshot = await uploadBytes(photoRef, reviewData.photo);
      photoUrl = await getDownloadURL(snapshot.ref);
    }

    // Create review document
    const review: Omit<Review, 'id'> = {
      customerName: reviewData.customerName,
      customerEmail: reviewData.customerEmail,
      rating: reviewData.rating,
      reviewText: reviewData.reviewText,
      photoUrl: photoUrl || undefined,
      productId: reviewData.productId,
      productName: reviewData.productName,
      approved: false, // Reviews need admin approval
      createdAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'reviews'), review);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw new Error('Failed to submit review');
  }
};

// Get approved reviews
export const getApprovedReviews = async (limitCount: number = 8): Promise<Review[]> => {
  try {
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('approved', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(reviewsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw new Error('Failed to fetch reviews');
  }
};

// Get all reviews (for admin)
export const getAllReviews = async (): Promise<Review[]> => {
  try {
    const reviewsQuery = query(
      collection(db, 'reviews'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(reviewsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    throw new Error('Failed to fetch reviews');
  }
};

// Approve a review (for admin)
export const approveReview = async (reviewId: string): Promise<void> => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    await updateDoc(reviewRef, {
      approved: true,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error approving review:', error);
    throw new Error('Failed to approve review');
  }
};

// Delete a review (for admin)
export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    await deleteDoc(reviewRef);
  } catch (error) {
    console.error('Error deleting review:', error);
    throw new Error('Failed to delete review');
  }
};
