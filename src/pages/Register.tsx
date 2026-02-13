import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Heart, Sparkles, ArrowLeft, Lock, Mail, User } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile with name
      await updateProfile(user, {
        displayName: name
      });

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        createdAt: new Date(),
        isAdmin: email === 'admin@phoolishlove.com' // Make first admin user
      });

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      {/* Elegant Header */}
      <div className="absolute top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm border-b border-purple-100 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              className="text-purple-900 hover:text-purple-700 hover:bg-purple-50 font-medium transition-all duration-300"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Store
            </Button>
            <h1 className="text-2xl font-serif text-purple-900 italic tracking-wide">Phoolishh Loveee</h1>
          </div>
        </div>
      </div>

      {/* Register Form */}
      <div className="w-full max-w-md mt-20">
        <Card className="bg-white border-0 shadow-2xl rounded-3xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-purple-800 to-pink-600 p-8 text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-serif text-white mb-2 italic">Create Account</CardTitle>
            <p className="text-white/90">Join our elegant community</p>
          </div>

          <CardContent className="p-8">
            <form onSubmit={handleRegister} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-red-800">Registration Error</AlertTitle>
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Success!</AlertTitle>
                  <AlertDescription className="text-green-700">{success}</AlertDescription>
                </Alert>
              )}

              {/* Name Field */}
              <div className="space-y-3">
                <Label htmlFor="name" className="text-purple-900 font-medium flex items-center">
                  <User className="h-4 w-4 mr-2 text-purple-600" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your beautiful name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="border-2 border-purple-200 rounded-xl px-4 py-3 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-300 text-purple-900 placeholder-purple-300"
                />
              </div>

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
                  minLength={6}
                  className="border-2 border-purple-200 rounded-xl px-4 py-3 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-300 text-purple-900 placeholder-purple-300"
                />
                <p className="text-xs text-purple-600">Minimum 6 characters</p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-purple-900 font-medium flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-purple-600" />
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="border-2 border-purple-200 rounded-xl px-4 py-3 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-300 text-purple-900 placeholder-purple-300"
                />
              </div>

              {/* Register Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-800 to-pink-600 hover:from-purple-900 hover:to-pink-700 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create Elegant Account
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="bg-gradient-to-r from-purple-50 to-pink-50 p-6">
            <div className="w-full text-center">
              <p className="text-purple-700">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-purple-900 hover:text-purple-700 font-semibold underline decoration-2 underline-offset-2 transition-all duration-300"
                >
                  Login to Your Account
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>

        {/* Benefits Section */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-serif text-purple-900 mb-4">Why Join Us?</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Heart className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-purple-700 font-medium">Exclusive Offers</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-purple-700 font-medium">Early Access</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-purple-700 font-medium">Member Rewards</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;