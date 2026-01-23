import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad';

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-pink-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-pink-600">Welcome Back</CardTitle>
          <p className="text-pink-500">Login to your Phoolishh Loveee account</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-pink-600">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-pink-600">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-pink-500 hover:bg-pink-600 mt-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">🌀</span>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-pink-500 text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-pink-600 hover:underline font-medium">
              Register here
            </Link>
          </p>
          <p className="text-sm text-pink-500 text-center">
            Forgot password?{' '}
            <button
              type="button"
              className="text-pink-600 hover:underline font-medium"
              onClick={() => alert('Password reset functionality would be implemented here')}
            >
              Reset it
            </button>
          </p>
        </CardFooter>
      </Card>

      <MadeWithDyad />
    </div>
  );
};

export default Login;