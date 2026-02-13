import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllReviews, approveReview, deleteReview, Review } from '@/services/reviewService';
import { showSuccess, showError } from '@/utils/toast';
import { Star, Check, X, Eye, Edit, Trash2, Calendar, User, Mail, Image as ImageIcon } from 'lucide-react';

const AdminReviews: React.FC = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Check if user is admin
  const isAdmin = user?.email === 'admin@phoolishlove.com';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!isAdmin) {
      showError('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }

    fetchReviews();
  }, [user, navigate, isAdmin]);

  const fetchReviews = async () => {
    try {
      const reviewsData = await getAllReviews();
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showError('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    try {
      await approveReview(reviewId);
      showSuccess('Review approved successfully!');
      fetchReviews(); // Refresh the list
    } catch (error) {
      console.error('Error approving review:', error);
      showError('Failed to approve review');
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await deleteReview(reviewId);
      showSuccess('Review deleted successfully!');
      fetchReviews(); // Refresh the list
      setShowDetails(false);
      setSelectedReview(null);
    } catch (error) {
      console.error('Error deleting review:', error);
      showError('Failed to delete review');
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'pending') return !review.approved;
    if (filter === 'approved') return review.approved;
    return true; // 'all'
  });

  const pendingCount = reviews.filter(r => !r.approved).length;
  const approvedCount = reviews.filter(r => r.approved).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-purple-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                className="text-purple-900 hover:text-purple-700 hover:bg-purple-50"
                onClick={() => navigate('/')}
              >
                ← Back to Store
              </Button>
              <h1 className="text-2xl font-bold text-purple-900">Review Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-yellow-100 text-yellow-800">
                Pending: {pendingCount}
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                Approved: {approvedCount}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Filter Tabs */}
        <div className="flex space-x-4 mb-8">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-purple-800' : 'border-purple-300 text-purple-900'}
          >
            All Reviews ({reviews.length})
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
            className={filter === 'pending' ? 'bg-yellow-600' : 'border-yellow-300 text-yellow-700'}
          >
            Pending ({pendingCount})
          </Button>
          <Button
            variant={filter === 'approved' ? 'default' : 'outline'}
            onClick={() => setFilter('approved')}
            className={filter === 'approved' ? 'bg-green-600' : 'border-green-300 text-green-700'}
          >
            Approved ({approvedCount})
          </Button>
        </div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-serif text-purple-900 mb-2">No reviews found</h3>
            <p className="text-gray-600">
              {filter === 'pending' ? 'No pending reviews to approve.' : 
               filter === 'approved' ? 'No approved reviews yet.' : 
               'No reviews submitted yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <Card key={review.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-5 w-5 ${
                                star <= review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            {review.rating}.0
                          </span>
                        </div>
                        <Badge className={review.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {review.approved ? 'Approved' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{review.customerName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4" />
                          <span>{review.customerEmail}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {review.createdAt?.toDate() ? 
                              new Date(review.createdAt.toDate()).toLocaleDateString() : 
                              'Unknown'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedReview(review);
                          setShowDetails(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!review.approved && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(review.id!)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(review.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 italic">"{review.reviewText}"</p>
                  {review.photoUrl && (
                    <div className="mt-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <ImageIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Photo attached</span>
                      </div>
                      <img
                        src={review.photoUrl}
                        alt="Review photo"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Review Details Modal */}
      {showDetails && selectedReview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-0 shadow-2xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-serif text-purple-900">
                  Review Details
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                  className="text-purple-900 hover:bg-purple-100 rounded-full p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Name</label>
                      <p className="text-gray-900">{selectedReview.customerName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{selectedReview.customerEmail}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Rating</label>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= selectedReview.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2">{selectedReview.rating}.0</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <Badge className={selectedReview.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {selectedReview.approved ? 'Approved' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">Review</h3>
                  <p className="text-gray-700 italic bg-gray-50 p-4 rounded-lg">
                    "{selectedReview.reviewText}"
                  </p>
                </div>

                {/* Photo */}
                {selectedReview.photoUrl && (
                  <div>
                    <h3 className="text-lg font-semibold text-purple-900 mb-3">Photo</h3>
                    <img
                      src={selectedReview.photoUrl}
                      alt="Review photo"
                      className="w-full max-w-md rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetails(false)}
                  >
                    Close
                  </Button>
                  {!selectedReview.approved && (
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        handleApprove(selectedReview.id!);
                        setShowDetails(false);
                      }}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve Review
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleDelete(selectedReview.id!);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Review
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
