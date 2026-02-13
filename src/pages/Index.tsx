import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { getAllProducts, Product } from '@/services/productService';
import { addToCart } from '@/services/cartService';
import { showSuccess, showError } from '@/utils/toast';
import { Heart, Search, ShoppingBag, Star, Sparkles, Flower, RefreshCw, Menu, User } from 'lucide-react';
import { getApprovedReviews, Review } from '@/services/reviewService';
import ReviewForm from '@/components/ReviewForm';
import EnhancedHeader from '@/components/EnhancedHeader';
import EnhancedProductCard from '@/components/EnhancedProductCard';
import '@/styles/enhancements.css';

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [user] = useAuthState(auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // 🌸 Floating Flower Particles
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);
  // ⌨️ Typing Animation
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const fullText = "Unwrap Elegance.\nBloom Love.";

  useEffect(() => {
    // Generate random flower particles
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 10
    }));
    setParticles(newParticles);

    // ⌨️ Typing Animation Effect
    let charIndex = 0;
    const typingInterval = setInterval(() => {
      if (charIndex <= fullText.length) {
        setTypedText(fullText.slice(0, charIndex));
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 100);

    // 📜 Scroll-triggered animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    // 🎭 Parallax Effect
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.parallax');
      parallaxElements.forEach(element => {
        const speed = element.getAttribute('data-speed') || '0.5';
        const yPos = -(scrolled * parseFloat(speed));
        (element as HTMLElement).style.transform = `translateY(${yPos}px)`;
      });
    };

    // Observe elements with animation classes
    const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .scale-in');
    animatedElements.forEach(el => observer.observe(el));

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearInterval(typingInterval);
      animatedElements.forEach(el => observer.unobserve(el));
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getAllProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products: ", error);
        showError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        console.log('Initial fetch: Getting approved reviews...');
        const reviewsData = await getApprovedReviews(8);
        console.log('Initial fetch - reviews data:', reviewsData);
        console.log('Initial fetch - reviews count:', reviewsData.length);
        setReviews(reviewsData);
      } catch (error) {
        console.error("Error fetching reviews: ", error);
        // Don't show error for reviews, just log it
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchProducts();
    fetchReviews();
  }, []);

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await addToCart(product.id, 1);
      showSuccess(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      showError('Failed to add item to cart');
    }
  };

  const handleReviewSubmit = (newReview: any) => {
    // Refresh reviews after submission
    const fetchReviews = async () => {
      try {
        console.log('Refreshing reviews after submission...');
        const reviewsData = await getApprovedReviews(8);
        console.log('Fetched reviews after refresh:', reviewsData);
        setReviews(reviewsData);
      } catch (error) {
        console.error("Error fetching reviews: ", error);
      }
    };
    fetchReviews();
  };

  // Add a manual refresh function for debugging
  const refreshReviews = async () => {
    try {
      console.log('Manual refresh triggered...');
      setReviewsLoading(true);
      const reviewsData = await getApprovedReviews(8);
      console.log('Manual refresh - fetched reviews:', reviewsData);
      setReviews(reviewsData);
    } catch (error) {
      console.error("Error in manual refresh: ", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Loading beautiful arrangements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white smooth-scroll" style={{position: 'relative', zIndex: 10}}>
      {/* 🌸 Floating Flower Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="flower-particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`
          }}
        >
          <Flower className="h-6 w-6 text-purple-300 opacity-30" />
        </div>
      ))}
      {/* Enhanced Bit UI Header */}
      <EnhancedHeader 
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 animated-gradient parallax" data-speed="0.5"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/40 to-purple-700/30"></div>
        <div className="relative container mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-4 sm:mb-6">
              <Sparkles className="h-8 w-8 sm:h-12 sm:w-12 text-yellow-300 animate-pulse" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif text-white mb-4 sm:mb-6 italic leading-tight px-2">
              {typedText.split('\n').map((line, index) => (
                <span key={index}>
                  {line}
                  {index === 0 && <br />}
                  {isTyping && index === typedText.split('\n').length - 1 && (
                    <span className="typing-cursor"></span>
                  )}
                </span>
              ))}
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 font-light max-w-2xl mx-auto fade-in-up px-4">
              Discover our curated collection of luxurious floral arrangements and premium gifts, 
              designed to make every moment unforgettable.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center fade-in-up px-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-purple-700 font-bold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-xl transform hover:scale-105 transition-all duration-300 ripple-button w-full sm:w-auto"
                style={{boxShadow: 'inset 0 0 60px rgba(255,255,255,0.15)'}}
                onClick={() => {
                  const element = document.getElementById('products');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                SHOP NOW
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-purple-600 font-bold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg transition-all duration-300 ripple-button w-full sm:w-auto"
                style={{boxShadow: 'inset 0 0 60px rgba(255,255,255,0.15)'}}
              >
                EXPLORE COLLECTION
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center group fade-in-up card-3d">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 shadow-lg border-2 border-purple-200 group-hover:border-purple-300 glassmorphism" style={{boxShadow: 'inset 0 0 60px rgba(255,255,255,0.15)'}}>
                <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-purple-400 group-hover:text-purple-500 transition-colors duration-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-serif text-gray-900 mb-2 group-hover:text-purple-500 transition-colors duration-300">Handcrafted with Love</h3>
              <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-800 transition-colors duration-300 px-2">Each arrangement is carefully designed by our expert florists</p>
            </div>
            <div className="text-center group fade-in-up card-3d" style={{animationDelay: '0.2s'}}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 shadow-lg border-2 border-yellow-200 group-hover:border-yellow-400 glassmorphism" style={{boxShadow: 'inset 0 0 60px rgba(255,255,255,0.15)'}}>
                <Star className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-600 group-hover:text-yellow-700 transition-colors duration-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-serif text-gray-900 mb-2 group-hover:text-purple-500 transition-colors duration-300">Premium Quality</h3>
              <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-800 transition-colors duration-300 px-2">Only the finest flowers and materials make it to our collections</p>
            </div>
            <div className="text-center group fade-in-up card-3d" style={{animationDelay: '0.4s'}}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 shadow-lg border-2 border-green-200 group-hover:border-green-400 glassmorphism" style={{boxShadow: 'inset 0 0 60px rgba(255,255,255,0.15)'}}>
                <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-serif text-gray-900 mb-2 group-hover:text-purple-500 transition-colors duration-300">Same Day Delivery</h3>
              <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-800 transition-colors duration-300 px-2">Express delivery available for last-minute celebrations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <main id="products" className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 bg-white">
        <div className="text-center mb-8 sm:mb-12 fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-serif text-gray-900 mb-4 italic">Featured Collections</h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Discover our handpicked selection of premium floral arrangements, 
            each crafted with love and attention to detail.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {products.map((product, index) => (
              <EnhancedProductCard
                key={product.id}
                product={product}
                index={index}
              />
            ))}
          </div>
        )}
      </main>

      {/* Customer Reviews Section */}
      <section id="reviews" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-serif text-gray-900 mb-4 italic">Customer Love Stories</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              See how our flowers have brightened special moments. Share your experience!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mt-6 sm:mt-8">
              <Button
                variant="outline"
                className="border-purple-200 text-purple-600 hover:bg-purple-50 ripple-button w-full sm:w-auto"
                onClick={refreshReviews}
                disabled={reviewsLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${reviewsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white font-bold px-6 sm:px-8 py-3 shadow-lg transform hover:scale-105 transition-all duration-300 ripple-button w-full sm:w-auto"
                style={{boxShadow: 'inset 0 0 60px rgba(255,255,255,0.15)'}}
                onClick={() => setShowReviewForm(true)}
              >
                <Star className="h-4 w-4 mr-2" />
                Share Your Review
              </Button>
            </div>
          </div>

          {reviewsLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {reviews.map((review, index) => (
                <div key={review.id} className="group fade-in-up card-3d" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200 hover:border-purple-300 transform hover:-translate-y-1 lavender-glow">
                    {/* Review Header */}
                    <div className="bg-gradient-to-r from-purple-50 to-white p-6 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                              <Heart className="h-6 w-6 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                              <Star className="h-2 w-2 text-white fill-current" />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg group-hover:text-purple-500 transition-colors duration-300">{review.customerName || 'Anonymous'}</h4>
                            <div className="flex items-center space-x-1">
                              {[1,2,3,4,5].map((star) => (
                                <Star 
                                  key={star} 
                                  className="h-4 w-4 text-yellow-400 fill-current group-hover:scale-110 transition-transform duration-300" 
                                />
                              ))}
                              <span className="text-xs text-gray-600 ml-1 group-hover:text-purple-500 transition-colors duration-300">5.0</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                          {new Date(review.createdAt.toDate()).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="p-6">
                      <p className="text-gray-700 leading-relaxed mb-4 text-sm font-medium line-clamp-3 group-hover:text-gray-900 transition-colors duration-300">
                        "{review.reviewText || 'Beautiful flowers! Absolutely loved the arrangement and delivery was on time.'}"
                      </p>
                      
                      {/* Review Photo */}
                      {review.photoUrl && (
                        <div className="relative mb-4">
                          <div className="aspect-square rounded-xl overflow-hidden bg-gray-50">
                            <img
                              src={review.photoUrl}
                              alt={`Review by ${review.customerName}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="absolute top-2 right-2">
                            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md">
                              <Heart className="h-3 w-3 text-red-500 fill-current" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Review Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-600 font-medium">Verified Purchase</span>
                        </div>
                        <button className="text-xs text-purple-500 hover:text-purple-700 hover:scale-105 font-medium transition-all duration-300">
                          Read more →
                        </button>
                      </div>
                    </div>

                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Share Your Love Story</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowReviewForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <RefreshCw className="h-6 w-6" />
                </Button>
              </div>
              <ReviewForm
                onSubmit={handleReviewSubmit}
                onClose={() => setShowReviewForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-br from-purple-900 to-purple-800 text-white">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* About Section */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-lavender-400 to-purple-400 rounded-full flex items-center justify-center">
                  <Flower className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-serif italic">Phoolishh Loveee</h3>
              </div>
              <p className="text-purple-200 mb-4">
                Your trusted partner for luxury floral arrangements and heartfelt gifts. 
                Making every moment special since 2024.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-purple-200 hover:text-white transition-colors">
                  <Heart className="h-5 w-5" />
                </a>
                <a href="#" className="text-purple-200 hover:text-white transition-colors">
                  <ShoppingBag className="h-5 w-5" />
                </a>
                <a href="#" className="text-purple-200 hover:text-white transition-colors">
                  <Star className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-lavender-200">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-purple-200 hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-purple-200 hover:text-white transition-colors">
                    Our Story
                  </a>
                </li>
                <li>
                  <a href="#" className="text-purple-200 hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-purple-200 hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-lavender-200">Customer Service</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-purple-200 hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-purple-200 hover:text-white transition-colors">
                    Delivery Info
                  </a>
                </li>
                <li>
                  <a href="#" className="text-purple-200 hover:text-white transition-colors">
                    Returns & Refunds
                  </a>
                </li>
                <li>
                  <a href="#" className="text-purple-200 hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-lavender-200">Stay Connected</h4>
              <p className="text-purple-200 mb-4">
                Subscribe to get special offers and updates
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 bg-purple-800 border border-purple-700 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-lavender-400"
                />
                <Button className="w-full bg-gradient-to-r from-lavender-500 to-purple-500 hover:from-lavender-600 hover:to-purple-600 text-white font-medium">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-purple-700 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-purple-200 text-sm mb-4 md:mb-0">
                © 2024 Phoolishh Loveee. All rights reserved. Made with 💕 in India
              </p>
              <div className="flex space-x-6 text-sm">
                <a href="#" className="text-purple-200 hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-purple-200 hover:text-white transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-purple-200 hover:text-white transition-colors">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <MadeWithDyad />
    </div>
  );
};

export default Index;
