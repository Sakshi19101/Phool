import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Search, ShoppingBag, Flower, Menu, User, Sparkles } from 'lucide-react';

interface EnhancedHeaderProps {
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({ onMobileMenuToggle, isMobileMenuOpen }) => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-purple-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300"
                 style={{ boxShadow: 'inset 0 0 60px rgba(255,255,255,0.15)' }}>
              <Flower className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-serif text-purple-700 italic">Phoolishh Loveee</h1>
              <p className="text-xs text-purple-500 font-medium hidden sm:block">Premium Floral Boutique</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Button
              variant="ghost"
              className="text-gray-700 hover:text-purple-500 hover:bg-purple-50 hover:scale-105 font-medium transition-all duration-300 group"
              onClick={() => handleScrollToSection('products')}
            >
              <ShoppingBag className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              Shop
            </Button>
            
            <Button
              variant="ghost"
              className="text-gray-700 hover:text-purple-500 hover:bg-purple-50 hover:scale-105 font-medium transition-all duration-300 group"
              onClick={() => navigate('/game')}
            >
              <Flower className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              Love Game
            </Button>
            
            <Button
              variant="ghost"
              className="text-gray-700 hover:text-purple-500 hover:bg-purple-50 hover:scale-105 font-medium transition-all duration-300 group"
              onClick={() => handleScrollToSection('reviews')}
            >
              <Heart className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              Reviews
            </Button>
            
            <Button
              variant="ghost"
              className="text-gray-700 hover:text-purple-500 hover:bg-purple-50 hover:scale-105 font-medium transition-all duration-300 group"
              onClick={() => navigate('/cart')}
            >
              <ShoppingBag className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              Cart
            </Button>

            {user && (
              <Button
                variant="ghost"
                className="text-gray-700 hover:text-purple-500 hover:bg-purple-50 font-medium transition-all duration-300"
                onClick={() => navigate('/orders')}
              >
                My Orders
              </Button>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-2 px-2 sm:px-3 py-2 bg-purple-50 rounded-full">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                  <span className="text-xs sm:text-sm font-medium text-purple-700 truncate max-w-20 sm:max-w-none">
                    {user.email?.split('@')[0]}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-purple-500 hover:bg-purple-50 font-medium transition-all duration-300 p-2 sm:px-4"
                  onClick={() => auth.signOut()}
                >
                  <span className="hidden sm:inline">Logout</span>
                  <span className="sm:hidden">
                    <User className="h-4 w-4" />
                  </span>
                </Button>
                
                {user.email === 'admin@phoolishlove.com' && (
                  <Button
                    className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white font-medium shadow-lg transition-all duration-300 text-xs sm:text-sm px-2 sm:px-4"
                    style={{ boxShadow: 'inset 0 0 60px rgba(255,255,255,0.15)' }}
                    onClick={() => navigate('/admin')}
                  >
                    Admin
                  </Button>
                )}
              </>
            ) : (
              <div className="hidden md:flex space-x-2 sm:space-x-3">
                <Button
                  variant="outline"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 font-medium transition-all duration-300 text-xs sm:text-sm px-2 sm:px-4"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button
                  className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white font-medium shadow-lg transition-all duration-300 text-xs sm:text-sm px-2 sm:px-4"
                  style={{ boxShadow: 'inset 0 0 60px rgba(255,255,255,0.15)' }}
                  onClick={() => navigate('/register')}
                >
                  Sign Up
                </Button>
              </div>
            )}
            
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-gray-700 hover:text-purple-500 hover:bg-purple-50 p-2"
              onClick={onMobileMenuToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-purple-100">
            <div className="flex flex-col space-y-2">
              <Button
                variant="ghost"
                className="text-gray-700 hover:text-purple-500 hover:bg-purple-50 justify-start py-3"
                onClick={() => handleScrollToSection('products')}
              >
                <ShoppingBag className="h-4 w-4 mr-3" />
                Shop
              </Button>
              <Button
                variant="ghost"
                className="text-gray-700 hover:text-purple-500 hover:bg-purple-50 justify-start py-3"
                onClick={() => navigate('/game')}
              >
                <Flower className="h-4 w-4 mr-3" />
                Love Game
              </Button>
              <Button
                variant="ghost"
                className="text-gray-700 hover:text-purple-500 hover:bg-purple-50 justify-start py-3"
                onClick={() => handleScrollToSection('reviews')}
              >
                <Heart className="h-4 w-4 mr-3" />
                Reviews
              </Button>
              <Button
                variant="ghost"
                className="text-gray-700 hover:text-purple-500 hover:bg-purple-50 justify-start py-3"
                onClick={() => navigate('/cart')}
              >
                <ShoppingBag className="h-4 w-4 mr-3" />
                Cart
              </Button>
              
              {!user && (
                <>
                  <Button
                    variant="outline"
                    className="border-purple-200 text-purple-600 hover:bg-purple-50 justify-start py-3"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white justify-start py-3"
                    onClick={() => navigate('/register')}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default EnhancedHeader;
