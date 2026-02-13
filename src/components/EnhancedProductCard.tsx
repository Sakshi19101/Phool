import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Star, ShoppingBag, Sparkles } from 'lucide-react';
import { Product } from '@/services/productService';
import { addToCart } from '@/services/cartService';
import { showSuccess } from '@/utils/toast';

interface EnhancedProductCardProps {
  product: Product;
  index: number;
}

const EnhancedProductCard: React.FC<EnhancedProductCardProps> = ({ product, index }) => {
  const handleAddToCart = async () => {
    try {
      await addToCart(product.id);
      showSuccess(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <Card
      className="group bg-white border border-gray-200 hover:border-purple-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 overflow-hidden rounded-2xl fade-in-up card-3d"
      style={{
        animationDelay: `${index * 0.1}s`,
        boxShadow: 'inset 0 0 60px rgba(255,255,255,0.15)'
      }}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
          <img
            src={product.imageUrl || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          
          {/* Bit UI Style Floating Actions */}
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex flex-col gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="bg-white/90 backdrop-blur-sm hover:bg-white text-purple-500 rounded-full p-1.5 sm:p-2 shadow-md border border-purple-200 hover:scale-110 transition-all duration-300"
            >
              <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            {product.stock <= 5 && product.stock > 0 && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 font-medium shadow-lg text-xs">
                Only {product.stock} left
              </Badge>
            )}
          </div>

          {/* Bit UI Style Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl font-serif text-gray-900 mb-2 group-hover:text-purple-500 transition-all duration-300 transform group-hover:scale-105">
          {product.name}
        </CardTitle>
        
        <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2 group-hover:text-gray-800 transition-colors duration-300">
          {product.description}
        </p>
        
        {/* Bit UI Style Rating */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current group-hover:scale-110 transition-transform duration-300"
              />
            ))}
            <span className="text-xs sm:text-sm text-gray-500 ml-1 group-hover:text-purple-500 transition-colors duration-300">
              (4.9)
            </span>
          </div>
        </div>
        
        {/* Bit UI Style Price and Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-purple-500 transition-colors duration-300">
              ₹{product.price.toFixed(2)}
            </p>
            <div className="flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-500" />
              <p className="text-xs sm:text-sm text-green-600 font-medium">Free shipping</p>
            </div>
          </div>
          
          <Button
            className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white font-bold shadow-lg transform hover:scale-105 transition-all duration-300 w-full sm:w-auto text-sm sm:text-base"
            style={{ boxShadow: 'inset 0 0 60px rgba(255,255,255,0.15)' }}
            onClick={handleAddToCart}
          >
            <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedProductCard;
