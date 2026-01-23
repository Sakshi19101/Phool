import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, PlusCircle, Edit, Trash2, Upload } from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { getAllProducts, addProduct, updateProduct, deleteProduct } from '@/services/productService';
import { showSuccess, showError } from '@/utils/toast';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  stock: number;
}

const Admin = () => {
  const [user] = useAuthState(auth);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Form state for adding/editing products
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        // Check if user is admin
        const isAdminUser = user.email === 'admin@phoolishlove.com';
        setIsAdmin(isAdminUser);

        if (!isAdminUser) {
          navigate('/');
          return;
        }

        // Fetch products
        const productsData = await getAllProducts();
        setProducts(productsData);

      } catch (error) {
        console.error('Error checking admin status:', error);
        setError('Failed to load admin panel');
        showError('Failed to load admin panel');
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !price || !description || !stock) {
      setError('Please fill in all fields');
      showError('Please fill in all fields');
      return;
    }

    try {
      const productData = {
        name,
        price: parseFloat(price),
        description,
        stock: parseInt(stock),
      };

      if (editingProduct) {
        // Update existing product
        await updateProduct(editingProduct.id, productData, imageFile || undefined);
        setSuccess('Product updated successfully!');
        showSuccess('Product updated successfully!');
      } else {
        // Add new product
        await addProduct(productData, imageFile || undefined);
        setSuccess('Product added successfully!');
        showSuccess('Product added successfully!');
      }

      // Refresh products list
      const updatedProducts = await getAllProducts();
      setProducts(updatedProducts);

      // Reset form
      resetForm();

    } catch (error) {
      console.error('Error saving product:', error);
      setError('Failed to save product. Please try again.');
      showError('Failed to save product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price.toString());
    setDescription(product.description);
    setStock(product.stock.toString());
    setImagePreview(product.imageUrl);
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteProduct(productId);
      setProducts(products.filter(product => product.id !== productId));
      setSuccess('Product deleted successfully!');
      showSuccess('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Failed to delete product');
      showError('Failed to delete product');
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setName('');
    setPrice('');
    setDescription('');
    setStock('');
    setImageFile(null);
    setImagePreview('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-pink-600 font-medium">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Redirecting
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100">
      <header className="bg-pink-500 text-white py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold italic">Phoolishh Loveee Admin</h1>
          <nav className="flex space-x-4">
            <Button
              variant="ghost"
              className="text-white hover:bg-pink-400"
              onClick={() => navigate('/')}
            >
              View Store
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-pink-400"
              onClick={() => auth.signOut()}
            >
              Logout
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <h2 className="text-3xl font-bold text-pink-600 mb-6">Product Management</h2>

        {error && (
          <Alert variant="destructive" className="mb-6 alert-custom">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6 alert-custom">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="border-pink-200">
              <CardHeader>
                <CardTitle className="text-pink-600">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-pink-600">Product Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="border-pink-200 focus:border-pink-500 focus:ring-pink-500 input-focus"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-pink-600">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      className="border-pink-200 focus:border-pink-500 focus:ring-pink-500 input-focus"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock" className="text-pink-600">Stock Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      required
                      className="border-pink-200 focus:border-pink-500 focus:ring-pink-500 input-focus"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-pink-600">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      className="border-pink-200 focus:border-pink-500 focus:ring-pink-500 min-h-[100px] input-focus"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image" className="text-pink-600">Product Image</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="border-pink-200 focus:border-pink-500 focus:ring-pink-500 input-focus"
                      />
                      {uploadingImage && (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                      )}
                    </div>
                    {imagePreview && (
                      <div className="mt-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg border-2 border-pink-200"
                        />
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-pink-500 hover:bg-pink-600 mt-4 button-hover"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin mr-2">🌀</span>
                        {editingProduct ? 'Updating...' : 'Adding...'}
                      </>
                    ) : editingProduct ? (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        Update Product
                      </>
                    ) : (
                      <>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Product
                      </>
                    )}
                  </Button>

                  {editingProduct && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-pink-200 text-pink-500 hover:bg-pink-50"
                      onClick={resetForm}
                    >
                      Cancel
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="border-pink-200">
              <CardHeader>
                <CardTitle className="text-pink-600">Product List</CardTitle>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <p className="text-pink-500 text-center py-8">No products found. Add your first product!</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-pink-200">
                        <TableHead className="text-pink-600">Image</TableHead>
                        <TableHead className="text-pink-600">Name</TableHead>
                        <TableHead className="text-pink-600">Price</TableHead>
                        <TableHead className="text-pink-600">Stock</TableHead>
                        <TableHead className="text-pink-600 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id} className="border-pink-100 card-hover">
                          <TableCell>
                            <div className="w-12 h-12 bg-pink-100 rounded-lg overflow-hidden">
                              <img
                                src={product.imageUrl || '/placeholder.svg'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-pink-600 font-medium">{product.name}</TableCell>
                          <TableCell className="text-pink-500">${product.price.toFixed(2)}</TableCell>
                          <TableCell className="text-pink-500">{product.stock}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-pink-200 text-pink-500 hover:bg-pink-50"
                                onClick={() => handleEdit(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="bg-pink-500 text-white py-6 mt-12">
        <div className="container mx-auto text-center">
          <p className="mb-2">© {new Date().getFullYear()} Phoolishh Loveee. All rights reserved.</p>
          <MadeWithDyad />
        </div>
      </footer>
    </div>
  );
};

export default Admin;