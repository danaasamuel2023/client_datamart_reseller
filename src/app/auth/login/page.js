'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://server-datamart-reseller.onrender.com/api';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.emailOrPhone || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      // Direct API call to login endpoint
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailOrPhone: formData.emailOrPhone,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Login successful! Redirecting...');
        
        // Store token in localStorage as "Token"
        if (typeof window !== 'undefined') {
          localStorage.setItem('Token', data.token);
          
          // Store user data
          localStorage.setItem('userData', JSON.stringify(data.user));
          
          // If remember me is checked, store credentials (optional)
          if (rememberMe) {
            localStorage.setItem('rememberedEmail', formData.emailOrPhone);
          } else {
            localStorage.removeItem('rememberedEmail');
          }
        }
        
        // Redirect based on user role
        setTimeout(() => {
          if (data.user.role === 'admin') {
            router.push('/admin/dashboard');
          } else {
            router.push('/');
          }
        }, 1500);
      } else {
        // Handle different error status codes
        if (response.status === 401) {
          setError('Invalid credentials. Please check your email/phone and password.');
        } else if (response.status === 403) {
          // Account status issues
          if (data.message?.includes('suspended')) {
            setError('Your account has been suspended. Please contact support.');
          } else if (data.message?.includes('pending')) {
            setError('Your account is pending approval. Please wait for admin verification.');
          } else {
            setError(data.message || 'Access denied');
          }
        } else if (response.status === 429) {
          setError('Too many login attempts. Please try again later.');
        } else {
          setError(data.message || 'Login failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Check for remembered email on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rememberedEmail = localStorage.getItem('rememberedEmail');
      if (rememberedEmail) {
        setFormData(prev => ({
          ...prev,
          emailOrPhone: rememberedEmail
        }));
        setRememberMe(true);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#2a2d3a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">DATAMART</h1>
          <p className="text-gray-400">Reseller Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1f2128] rounded-xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Welcome Back</h2>

          {/* Error Message - More Visible */}
          {error && (
            <div className="mb-4 p-4 bg-red-900 bg-opacity-50 border-2 border-red-500 rounded-lg animate-pulse">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-400 font-medium text-sm">{error}</p>
                </div>
                <button
                  onClick={() => setError('')}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Success Message - More Visible */}
          {success && (
            <div className="mb-4 p-4 bg-green-900 bg-opacity-50 border-2 border-green-500 rounded-lg animate-pulse">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-green-400 font-medium text-sm">{success}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email/Phone Input */}
            <div>
              <label htmlFor="emailOrPhone" className="block text-gray-400 text-sm mb-2">
                Email or Phone Number
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="emailOrPhone"
                  name="emailOrPhone"
                  type="text"
                  value={formData.emailOrPhone}
                  onChange={handleInputChange}
                  placeholder="email@example.com or 024XXXXXXX"
                  className="w-full pl-10 pr-4 py-3 bg-[#2a2d3a] text-white rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none transition-colors"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-gray-400 text-sm mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 bg-[#2a2d3a] text-white rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none transition-colors"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center text-gray-400 text-sm cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2 rounded border-gray-600 text-yellow-400 focus:ring-yellow-400" 
                />
                Remember me
              </label>
              <Link href="/auth/forgot-password" className="text-yellow-400 text-sm hover:text-yellow-500">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Admin Contact Info */}
          <div className="mt-6 p-4 bg-gray-800 bg-opacity-50 rounded-lg">
            <p className="text-center text-gray-400 text-sm">
              Need an account? Contact your administrator
            </p>
            <p className="text-center text-gray-500 text-xs mt-1">
              admin@datamart.com
            </p>
          </div>

          {/* Demo Account Info (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <p className="text-gray-500 text-xs mb-2">Demo Accounts:</p>
              <div className="space-y-1 text-xs text-gray-400">
                <p>Agent: agent@demo.com / demo123</p>
                <p>Admin: admin@demo.com / admin123</p>
              </div>
            </div>
          )}
        </div>

        {/* Alternative Toast-style notifications (optional) */}
        {(error || success) && (
          <div className="fixed top-4 right-4 z-50 max-w-sm animate-slide-in">
            {error && (
              <div className="bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl mb-2">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5" />
                  <p className="font-medium">{error}</p>
                  <button
                    onClick={() => setError('')}
                    className="ml-auto hover:opacity-80"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
            
            {success && (
              <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5" />
                  <p className="font-medium">{success}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}