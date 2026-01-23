import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { getAllProducts } from '@/services/productService';
import { addToCart } from '@/services/cartService';
import { showSuccess, showError } from '@/utils/toast';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  stock: number;
}

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

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

    fetchProducts();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-pink-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-pink-600 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100">
      <header className="bg-pink-500 text-white py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold italic">Phoolishh Loveee</h1>
          <nav className="flex space-x-4">
            <Button
              variant="ghost"
              className="text-white hover:bg-pink-400"
              onClick={() => navigate('/')}
            >
              Home
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-pink-400"
              onClick={() => navigate('/cart')}
            >
              Cart
            </Button>
            {user ? (
              <>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-pink-400"
                  onClick={() => auth.signOut()}
                >
                  Logout
                </Button>
                {user.email === 'admin@phoolishlove.com' && (
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-pink-400"
                    onClick={() => navigate('/admin')}
                  >
                    Admin
                  </Button>
                )}
              </>
            ) : (
              <Button
                variant="ghost"
                className="text-white hover:bg-pink-400"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-pink-600 mb-2">Handmade Pipe Cleaner Art</h2>
          <p className="text-pink-500">Unique, colorful creations made with love</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-pink-500 text-lg">No products available yet. Check back soon!</p>
            {user?.email === 'admin@phoolishlove.com' && (
              <Button
                className="mt-4 bg-pink-500 hover:bg-pink-600"
                onClick={() => navigate('/admin')}
              >
                Add Products
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className="transition-transform hover:scale-105 hover:shadow-lg border-pink-200 card-hover"
              >
                <CardHeader className="p-4">
                  <div className="aspect-square bg-pink-100 rounded-lg mb-4 overflow-hidden">
                    <img
                      src={product.imageUrl || '/placeholder.svg'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-pink-600">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-pink-500 mb-2">{product.description}</p>
                  <p className="font-bold text-pink-600">${product.price.toFixed(2)}</p>
                  {product.stock > 0 ? (
                    <Badge className="bg-green-100 text-green-800 mt-2">In Stock</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 mt-2">Out of Stock</Badge>
                  )}
                </CardContent>
                <CardFooter className="p-4">
                  <Button
                    className="w-full bg-pink-500 hover:bg-pink-600 button-hover"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0}
                  >
                    {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-pink-500 text-white py-6 mt-12">
        <div className="container mx-auto text-center">
          <p className="mb-2">© {new Date().getFullYear()} Phoolishh Loveee. All rights reserved.</p>
          <p className="text-sm">Handmade with love and pipe cleaners</p>
          <MadeWithDyad />
        </div>
      </footer>
    </div>
  );
};

export default Index;