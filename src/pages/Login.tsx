import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Heart, Sparkles, ArrowLeft, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      {/* Elegant Header */}
      <div className="absolute top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm border-b border-purple-100 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Button
              variant="ghost"
              className="text-purple-900 hover:text-purple-700 hover:bg-purple-50 font-medium transition-all duration-300"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back to Store</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <h1 className="text-xl sm:text-2xl font-serif text-purple-900 italic tracking-wide">Phoolishh Loveee</h1>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="w-full max-w-md mt-16 sm:mt-20">
        <Card className="bg-white border-0 shadow-2xl rounded-3xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-purple-800 to-pink-600 p-6 sm:p-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-serif text-white mb-2 italic">Welcome Back</CardTitle>
            <p className="text-white/90 text-sm sm:text-base">Login to your elegant account</p>
          </div>

          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-red-800">Login Error</AlertTitle>
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-purple-900 font-medium flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-purple-600" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-2 border-purple-200 rounded-xl px-4 py-3 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-300 text-purple-900 placeholder-purple-300"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-purple-900 font-medium flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-purple-600" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-2 border-purple-200 rounded-xl px-4 py-3 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-300 text-purple-900 placeholder-purple-300"
                />
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-800 to-pink-600 hover:from-purple-900 hover:to-pink-700 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Logging in...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Login to Your Account
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:p-6">
            <div className="w-full space-y-4 text-center">
              <p className="text-purple-700 text-sm sm:text-base">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-purple-900 hover:text-purple-700 font-semibold underline decoration-2 underline-offset-2 transition-all duration-300"
                >
                  Create Elegant Account
                </Link>
              </p>
              <p className="text-purple-700 text-sm sm:text-base">
                Forgot password?{' '}
                <button
                  type="button"
                  className="text-purple-900 hover:text-purple-700 font-semibold underline decoration-2 underline-offset-2 transition-all duration-300"
                  onClick={() => alert('Password reset functionality would be implemented here')}
                >
                  Reset Password
                </button>
              </p>
            </div>
          </CardFooter>
        </Card>

        {/* Trust Badges */}
        <div className="mt-8 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-purple-600">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Secure Login</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Privacy Protected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;