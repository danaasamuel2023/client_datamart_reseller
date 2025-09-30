// app/page.jsx - COMPLETE DATAMART MAIN PAGE WITH FIXED ERROR MESSAGES
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BulkOrderComponent from './../../component/bulkOrder';
import { 
  ShoppingCart, 
  X, 
  Check, 
  Loader2, 
  Phone, 
  Hash, 
  Upload, 
  FileSpreadsheet,
  Download,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  User,
  Wallet,
  Package,
  BarChart3,
  LogOut,
  Menu,
  Plus,
  Minus,
  Home,
  CreditCard,
  History,
  Settings,
  ArrowLeft,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Shield,
  RefreshCw,
  FileText,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  Terminal
} from 'lucide-react';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://server-datamart-reseller.onrender.com/api';

export default function DataMartMainPage() {
  const router = useRouter();
  
  // State Management
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [beneficiaryNumber, setBeneficiaryNumber] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [activeNetwork, setActiveNetwork] = useState('MTN');
  const [purchaseMode, setPurchaseMode] = useState('single');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userBalance, setUserBalance] = useState(0);

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem('Token');
      const storedUserData = localStorage.getItem('userData');

      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsAuthenticated(true);
          
          if (storedUserData) {
            const user = JSON.parse(storedUserData);
            setUserData(user);
            setUserBalance(user.wallet?.balance || 0);
          }
          
          setAuthLoading(false);
          fetchUserProfile(token);
        } else {
          handleLogout();
        }
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      handleLogout();
    }
  };

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'x-auth-token': token
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserData(data.data);
          setUserBalance(data.data.wallet?.balance || 0);
          localStorage.setItem('userData', JSON.stringify(data.data));
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('Token');
      
      if (!token) {
        setError('Authentication required. Please login.');
        router.push('/auth/login');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/purchase/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please login again.');
          handleLogout();
          return;
        }
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        const transformedProducts = data.data.map(product => ({
          id: product._id,
          productCode: product.productCode,
          name: product.name,
          capacity: product.capacity ? 
            `${product.capacity.value}${product.capacity.unit}` :
            'N/A',
          capacityValue: product.capacity?.value || 0,
          capacityUnit: product.capacity?.unit || 'GB',
          price: product.price || product.userPrice || 0,
          validity: product.validity ? 
            `${product.validity.value} ${product.validity.unit}` : 
            'No Expiry',
          network: 'MTN',
          description: product.description || '',
          discount: product.discount || 0,
          originalPrice: product.originalPrice || product.price,
          available: product.available !== false
        }));
        
        setProducts(transformedProducts);
        
        if (transformedProducts.length === 0) {
          setError('No products available at the moment.');
        }
      } else {
        setError(data.message || 'Failed to load products');
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please check your connection and try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('Token');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setUserData(null);
    router.push('/auth/login');
  };

  const handleBulkOrdersProcessed = (newBalance) => {
    setUserBalance(newBalance);
    
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
      userData.wallet.balance = newBalance;
      localStorage.setItem('userData', JSON.stringify(userData));
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#2a2d3a] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
          <Loader2 className="w-12 h-12 animate-spin text-yellow-400 mx-auto mb-4" />
          <p className="text-white text-lg">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleProductSelect = (product) => {
    if (purchaseMode === 'single') {
      setSelectedProduct(product);
      setQuantity(1);
      setBeneficiaryNumber('');
      setError('');
      setSuccess('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    let cleaned = String(phone).replace(/\D/g, '');
    
    if (cleaned.startsWith('233')) {
      cleaned = '0' + cleaned.substring(3);
    } else if (cleaned.length === 9 && !cleaned.startsWith('0')) {
      cleaned = '0' + cleaned;
    }
    
    return cleaned;
  };

  const validatePhoneNumber = (number) => {
    const formatted = formatPhoneNumber(number);
    const phoneRegex = /^0[2-9][0-9]{8}$/;
    return phoneRegex.test(formatted);
  };

  const handleAddToCart = () => {
    setError('');
    setSuccess('');
    
    if (!beneficiaryNumber) {
      setError('Please enter beneficiary phone number');
      return;
    }

    if (!validatePhoneNumber(beneficiaryNumber)) {
      setError('Invalid Ghana phone number format (e.g., 024XXXXXXX)');
      return;
    }

    const cartItem = {
      id: Date.now(),
      product: selectedProduct,
      beneficiaryNumber,
      quantity,
      totalPrice: selectedProduct.price * quantity
    };

    setCart([...cart, cartItem]);
    setSuccess(`Added ${quantity} x ${selectedProduct.capacity} to cart!`);
    
    setTimeout(() => {
      setSelectedProduct(null);
      setBeneficiaryNumber('');
      setQuantity(1);
      setSuccess('');
    }, 2000);
  };

  const handleDirectPurchase = async () => {
    setError('');
    setSuccess('');
    
    if (!beneficiaryNumber) {
      setError('Please enter beneficiary phone number');
      return;
    }

    if (!validatePhoneNumber(beneficiaryNumber)) {
      setError('Invalid Ghana phone number format');
      return;
    }

    const totalCost = selectedProduct.price * quantity;
    if (totalCost > userBalance) {
      setError(`Insufficient wallet balance. You need GHS ${totalCost.toFixed(2)} but have GHS ${userBalance.toFixed(2)}`);
      return;
    }

    setPurchasing(true);
    try {
      const token = localStorage.getItem('Token');
      
      const response = await fetch(`${API_BASE_URL}/purchase/orders/single`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          beneficiaryNumber
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setUserBalance(data.data.balance || (userBalance - totalCost));
        setSuccess(`Purchase successful! ${selectedProduct.capacity} sent to ${beneficiaryNumber}`);
        
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData && data.data.balance !== undefined) {
          userData.wallet.balance = data.data.balance;
          localStorage.setItem('userData', JSON.stringify(userData));
        }
        
        setTimeout(() => {
          setSelectedProduct(null);
          setBeneficiaryNumber('');
          setQuantity(1);
          setSuccess('');
        }, 3000);
      } else {
        setError(data.message || 'Purchase failed. Please try again.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const getTotalCartAmount = () => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const processCartCheckout = async () => {
    if (cart.length === 0) {
      setError('Cart is empty');
      return;
    }

    const totalAmount = getTotalCartAmount();
    if (totalAmount > userBalance) {
      setError(`Insufficient balance. Need GHS ${totalAmount.toFixed(2)}`);
      return;
    }

    try {
      const token = localStorage.getItem('Token');
      
      const orders = cart.map(item => ({
        productId: item.product.id,
        beneficiaryNumber: item.beneficiaryNumber,
        quantity: item.quantity
      }));
      
      const response = await fetch(`${API_BASE_URL}/purchase/orders/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ orders })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUserBalance(data.data.newBalance);
        setCart([]);
        setShowCart(false);
        setSuccess('Cart items purchased successfully!');
        
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData) {
          userData.wallet.balance = data.data.newBalance;
          localStorage.setItem('userData', JSON.stringify(userData));
        }
      } else {
        setError(data.message || 'Checkout failed');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setError('Checkout failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2a2d3a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-yellow-400 mx-auto mb-4" />
          <p className="text-white text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2a2d3a] relative">
      {/* HEADER */}
      <header className="bg-[#1f2128] border-b border-gray-700 sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 text-white hover:text-yellow-400 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <h1 className="text-xl sm:text-2xl font-bold text-yellow-400">DATAMART</h1>
              
              <nav className="hidden lg:flex items-center gap-6 ml-8">
                <a href="#" className="text-yellow-400 font-medium hover:text-yellow-500 transition-colors">Home</a>
                <a href="/orders" className="text-gray-300 hover:text-white transition-colors">Orders</a>
                <button 
                  onClick={() => setPurchaseMode('bulk')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Bulk Orders
                </button>
                <a href="/api-docs" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1">
                  <Terminal className="w-4 h-4" />
                  API Docs
                </a>
                <a href="/profile" className="text-gray-300 hover:text-white transition-colors">Profile</a>
              </nav>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-4">
              {userData && (
                <div className="hidden lg:flex items-center gap-2 text-sm text-gray-400">
                  <User className="w-4 h-4" />
                  <span>{userData.fullName || userData.email}</span>
                  {userData.role === 'admin' && (
                    <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded">Admin</span>
                  )}
                </div>
              )}
              
              <div className="hidden sm:flex items-center gap-2 bg-gray-800 px-2 sm:px-3 py-1.5 rounded-lg">
                <Wallet className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-medium text-sm sm:text-base">₵{userBalance.toFixed(2)}</span>
              </div>
              
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 text-white hover:text-yellow-400 transition-colors"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cart.length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="p-2 text-white hover:text-yellow-400 transition-colors"
              >
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU DRAWER */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileMenu(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-[#1f2128] shadow-xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Menu</h2>
                <button onClick={() => setShowMobileMenu(false)} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {userData && (
                <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-400">Logged in as</p>
                  <p className="text-white font-medium">{userData.fullName || userData.email}</p>
                  {userData.role && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded">
                      {userData.role}
                    </span>
                  )}
                </div>
              )}
              
              <nav className="space-y-2">
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-yellow-400 bg-gray-800 rounded-lg">
                  <Home className="w-5 h-5" />
                  Home
                </a>
                <a href="/orders" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg">
                  <Package className="w-5 h-5" />
                  Orders
                </a>
                <button 
                  onClick={() => {
                    setPurchaseMode('bulk');
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg text-left"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  Bulk Orders
                </button>
                <a href="/api-docs" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg">
                  <Terminal className="w-5 h-5" />
                  API Documentation
                </a>
                <a href="/profile" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg">
                  <User className="w-5 h-5" />
                  Profile
                </a>
                <a href="/wallet" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg">
                  <CreditCard className="w-5 h-5" />
                  Top Up Wallet
                </a>
              </nav>
              
              <div className="mt-6 p-3 bg-gray-800 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Wallet Balance</p>
                <p className="text-2xl font-bold text-yellow-400">₵{userBalance.toFixed(2)}</p>
              </div>
              
              <div className="mt-4 space-y-2">
                <button 
                  onClick={() => router.push('/api-docs')}
                  className="w-full py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Terminal className="w-4 h-4" />
                  View API Docs
                </button>
                <button className="w-full py-2 bg-yellow-400 text-gray-900 font-medium rounded-lg hover:bg-yellow-500 transition-colors">
                  Top Up Wallet
                </button>
                <button 
                  onClick={() => router.push('/orders')}
                  className="w-full py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
                >
                  View Orders
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="bg-gradient-to-r from-yellow-400 to-yellow-600 py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
              Ghana's #1 Data Top-Up Platform
            </h2>
            <p className="text-gray-800 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8">
              Instant delivery • Best prices • 24/7 service
            </p>
            
            <div className="inline-flex bg-gray-900 rounded-lg p-1">
              <button
                onClick={() => setPurchaseMode('single')}
                className={`px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors ${
                  purchaseMode === 'single'
                    ? 'bg-yellow-400 text-gray-900'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Single Purchase
              </button>
              <button
                onClick={() => setPurchaseMode('bulk')}
                className={`px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors ${
                  purchaseMode === 'bulk'
                    ? 'bg-yellow-400 text-gray-900'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Bulk Purchase
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* NETWORK TABS */}
      <div className="container mx-auto px-4 pt-6 sm:pt-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveNetwork('MTN')}
            className={`px-4 sm:px-6 py-2 font-medium rounded whitespace-nowrap transition-all flex-shrink-0 ${
              activeNetwork === 'MTN' 
                ? 'bg-yellow-400 text-black shadow-lg' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            MTN
          </button>
          <button
            onClick={() => setActiveNetwork('Vodafone')}
            className={`px-4 sm:px-6 py-2 font-medium rounded whitespace-nowrap transition-all flex-shrink-0 ${
              activeNetwork === 'Vodafone' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Vodafone
          </button>
          <button
            onClick={() => setActiveNetwork('AirtelTigo')}
            className={`px-4 sm:px-6 py-2 font-medium rounded whitespace-nowrap transition-all flex-shrink-0 ${
              activeNetwork === 'AirtelTigo' 
                ? 'bg-red-600 text-white shadow-lg' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            AirtelTigo
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        {/* ============================================= */}
        {/* FIXED ERROR/SUCCESS MESSAGES - NOW VISIBLE! */}
        {/* ============================================= */}
        {error && !selectedProduct && purchaseMode !== 'bulk' && (
          <div className="mb-6 p-4 bg-red-600 rounded-lg shadow-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-white flex-shrink-0" />
              <p className="text-white font-semibold text-base">{error}</p>
            </div>
          </div>
        )}

        {success && !selectedProduct && purchaseMode !== 'bulk' && (
          <div className="mb-6 p-4 bg-green-600 rounded-lg shadow-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-white flex-shrink-0" />
              <p className="text-white font-semibold text-base">{success}</p>
            </div>
          </div>
        )}

        {purchaseMode === 'bulk' ? (
          // BULK ORDER COMPONENT
          <BulkOrderComponent
            products={products}
            userBalance={userBalance}
            onProcessOrders={handleBulkOrdersProcessed}
            API_BASE_URL={API_BASE_URL}
          />
        ) : selectedProduct ? (
          // SELECTED PRODUCT VIEW
          <div className="bg-[#1f2128] rounded-xl p-4 sm:p-6 shadow-2xl animate-fadeIn max-w-md mx-auto">
            <button
              onClick={() => setSelectedProduct(null)}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to products</span>
            </button>
            
            <div className="text-center mb-4">
              <span className="inline-block px-3 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full mb-2">
                MTN
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                {selectedProduct.capacity}
              </h2>
              <p className="text-yellow-400 text-xl font-bold mt-2">
                ₵{selectedProduct.price.toFixed(2)}
              </p>
            </div>

            {/* ============================================= */}
            {/* FIXED ERROR MESSAGE - NOW VISIBLE! */}
            {/* ============================================= */}
            {error && (
              <div className="mb-4 p-4 bg-red-600 rounded-lg shadow-lg">
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-white font-semibold text-sm">{error}</span>
                </div>
              </div>
            )}
            
            {/* ============================================= */}
            {/* FIXED SUCCESS MESSAGE - NOW VISIBLE! */}
            {/* ============================================= */}
            {success && (
              <div className="mb-4 p-4 bg-green-600 rounded-lg shadow-lg">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-white flex-shrink-0" />
                  <span className="text-white font-semibold text-sm">{success}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">
                  Beneficiary Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="tel"
                    value={beneficiaryNumber}
                    onChange={(e) => setBeneficiaryNumber(e.target.value)}
                    placeholder="024XXXXXXX"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between bg-gray-700 rounded-lg p-2">
                <label className="text-gray-400 text-sm">Quantity</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    className="w-8 h-8 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors flex items-center justify-center"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-12 text-center text-white font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => quantity < 100 && setQuantity(quantity + 1)}
                    className="w-8 h-8 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-3 flex justify-between items-center">
                <span className="text-gray-400 text-sm">Total</span>
                <span className="text-xl font-bold text-yellow-400">
                  ₵{(selectedProduct.price * quantity).toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={purchasing || success}
                  className="py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleDirectPurchase}
                  disabled={purchasing || success}
                  className="py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {purchasing && <Loader2 className="w-4 h-4 animate-spin" />}
                  {purchasing ? 'Processing...' : 'Buy Now'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // PRODUCTS GRID
          products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
              {products
                .filter(product => product.network === activeNetwork)
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={() => handleProductSelect(product)}
                  />
                ))}
            </div>
          ) : !loading && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-4">
                {error || 'No products available'}
              </p>
              <button
                onClick={() => fetchProducts()}
                className="px-6 py-2 bg-yellow-400 text-gray-900 font-medium rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          )
        )}
      </main>

      {/* STATS SECTION */}
      <section className="bg-gray-800 py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-400 mb-1 sm:mb-2">50K+</p>
              <p className="text-gray-400 text-xs sm:text-sm">Happy Customers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-400 mb-1 sm:mb-2">1M+</p>
              <p className="text-gray-400 text-xs sm:text-sm">Transactions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-400 mb-1 sm:mb-2">24/7</p>
              <p className="text-gray-400 text-xs sm:text-sm">Service</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-400 mb-1 sm:mb-2">99.9%</p>
              <p className="text-gray-400 text-xs sm:text-sm">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1f2128] py-8 border-t border-gray-700">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-yellow-400 font-bold text-xl mb-2">DATAMART</h3>
            <p className="text-gray-400 text-sm">© 2024 DATAMART. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* CART SIDEBAR */}
      {showCart && (
        <CartSidebar 
          cart={cart} 
          onClose={() => setShowCart(false)} 
          onRemoveItem={removeFromCart} 
          totalAmount={getTotalCartAmount()}
          onCheckout={processCartCheckout}
          userBalance={userBalance}
        />
      )}
      
      {/* ACCOUNT DROPDOWN */}
      {showAccountMenu && (
        <div className="absolute top-16 right-4 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-50">
          {userData && (
            <div className="px-3 py-2 border-b border-gray-700">
              <p className="text-xs text-gray-400">Signed in as</p>
              <p className="text-white text-sm font-medium truncate">{userData.email}</p>
            </div>
          )}
          <a href="/profile" className="flex items-center gap-2 px-3 py-1.5 text-gray-300 hover:bg-gray-700 hover:text-white text-sm">
            <User className="w-3 h-3" />
            Profile
          </a>
          <a href="/orders" className="flex items-center gap-2 px-3 py-1.5 text-gray-300 hover:bg-gray-700 hover:text-white text-sm">
            <History className="w-3 h-3" />
            Order History
          </a>
          <a href="/wallet" className="flex items-center gap-2 px-3 py-1.5 text-gray-300 hover:bg-gray-700 hover:text-white text-sm">
            <CreditCard className="w-3 h-3" />
            Top Up Wallet
          </a>
          <a href="/api-docs" className="flex items-center gap-2 px-3 py-1.5 text-gray-300 hover:bg-gray-700 hover:text-white text-sm">
            <Terminal className="w-3 h-3" />
            API Documentation
          </a>
          {userData?.role === 'admin' && (
            <>
              <hr className="my-1 border-gray-700" />
              <a href="/admin" className="flex items-center gap-2 px-3 py-1.5 text-purple-400 hover:bg-gray-700 text-sm">
                <Shield className="w-3 h-3" />
                Admin Panel
              </a>
            </>
          )}
          {(userData?.role === 'dealer' || userData?.role === 'supplier') && (
            <>
              <hr className="my-1 border-gray-700" />
              <div className="px-3 py-2">
                <p className="text-xs text-gray-400 mb-1">API Access</p>
                <a href="/api-docs" className="flex items-center gap-2 py-1 text-yellow-400 hover:text-yellow-500 text-sm">
                  <Terminal className="w-3 h-3" />
                  View API Docs
                </a>
              </div>
            </>
          )}
          <hr className="my-1 border-gray-700" />
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-red-400 hover:bg-gray-700 text-left text-sm"
          >
            <LogOut className="w-3 h-3" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

// PRODUCT CARD COMPONENT
function ProductCard({ product, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className="group cursor-pointer transform transition-all duration-200 hover:scale-105"
    >
      <div className="bg-[#fbbf24] rounded-t-lg sm:rounded-t-xl p-3 sm:p-4 lg:p-6 relative overflow-hidden">
        <span className="absolute top-2 left-2 bg-yellow-600 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs">
          MTN
        </span>
        {product.discount > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs">
            -{product.discount}%
          </span>
        )}
        <div className="text-center pt-6 sm:pt-8">
          <h3 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900">
            {product.capacity}
          </h3>
        </div>
      </div>
      <div className="bg-[#1f2128] rounded-b-lg sm:rounded-b-xl p-2 sm:p-3 lg:p-4 grid grid-cols-3 gap-1 sm:gap-2 group-hover:bg-gray-800 transition-colors">
        <div className="text-center">
          <p className="text-gray-500 text-[10px] sm:text-xs uppercase mb-1">Price</p>
          <p className="text-white font-bold text-xs sm:text-sm">₵{product.price}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 text-[10px] sm:text-xs uppercase mb-1">Rollover</p>
          <p className="text-gray-400 text-[10px] sm:text-xs">N/A</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 text-[10px] sm:text-xs uppercase mb-1">Duration</p>
          <p className="text-gray-400 text-[10px] sm:text-xs truncate">{product.validity}</p>
        </div>
      </div>
    </div>
  );
}

// CART SIDEBAR COMPONENT
function CartSidebar({ cart, onClose, onRemoveItem, totalAmount, onCheckout, userBalance }) {
  const [processing, setProcessing] = useState(false);
  
  const handleCheckout = async () => {
    setProcessing(true);
    await onCheckout();
    setProcessing(false);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div onClick={onClose} className="absolute inset-0 bg-black bg-opacity-50" />
      
      <div className="relative bg-[#1f2128] w-full max-w-sm sm:max-w-md h-full overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Shopping Cart</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Your cart is empty</p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-yellow-400 text-gray-900 font-medium rounded-lg hover:bg-yellow-500 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {cart.map(item => (
                <div key={item.id} className="bg-gray-800 rounded-lg p-3 sm:p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-medium text-sm sm:text-base">{item.product.capacity}</h4>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm">To: {item.beneficiaryNumber}</p>
                  <p className="text-gray-400 text-xs sm:text-sm">Quantity: {item.quantity}</p>
                  <p className="text-yellow-400 font-bold mt-2 text-sm sm:text-base">
                    ₵{item.totalPrice.toFixed(2)}
                  </p>
                </div>
              ))}
              
              <div className="border-t border-gray-700 pt-4">
                <div className="mb-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Cart Total:</span>
                    <span className="text-white font-medium">₵{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-gray-400 text-sm">Wallet Balance:</span>
                    <span className={`font-medium ${userBalance >= totalAmount ? 'text-green-400' : 'text-red-400'}`}>
                      ₵{userBalance.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg sm:text-xl font-bold text-white">Total:</span>
                  <span className="text-xl sm:text-2xl font-bold text-yellow-400">
                    ₵{totalAmount.toFixed(2)}
                  </span>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  disabled={processing || totalAmount > userBalance}
                  className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                  {processing ? 'Processing...' : `Checkout (${cart.length} items)`}
                </button>
                
                {totalAmount > userBalance && (
                  <p className="mt-2 text-red-400 text-xs text-center">
                    Insufficient wallet balance
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}