// components/Navigation.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu,
  X,
  User,
  Wallet,
  ShoppingCart,
  Home,
  Package,
  FileSpreadsheet,
  Terminal,
  CreditCard,
  History,
  Settings,
  Shield,
  LogOut,
  TrendingUp,
  Activity,
  Calendar,
  DollarSign,
  Loader2,
  ChevronRight
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Navigation({ userData, userBalance, cartCount = 0, onCartClick }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [todayStats, setTodayStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [showStatsDropdown, setShowStatsDropdown] = useState(false);

  // Fetch today's stats when account menu is opened
  useEffect(() => {
    if (showAccountMenu && !todayStats) {
      fetchTodayStats();
    }
  }, [showAccountMenu]);

  const fetchTodayStats = async () => {
    try {
      setLoadingStats(true);
      const token = localStorage.getItem('Token');
      
      const response = await fetch(`${API_BASE_URL}/purchase/profile/today-stats`, {
        method: 'GET',
        headers: {
          'x-auth-token': token
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTodayStats(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch today stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('Token');
    localStorage.removeItem('userData');
    router.push('/auth/login');
  };

  const isActive = (path) => pathname === path;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.account-menu-container')) {
        setShowAccountMenu(false);
        setShowStatsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
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
              
              <h1 
                onClick={() => router.push('/')}
                className="text-xl sm:text-2xl font-bold text-yellow-400 cursor-pointer hover:text-yellow-500 transition-colors"
              >
                DATAMART
              </h1>
              
              <nav className="hidden lg:flex items-center gap-6 ml-8">
                <a 
                  href="/" 
                  className={`${isActive('/') ? 'text-yellow-400' : 'text-gray-300'} font-medium hover:text-white transition-colors`}
                >
                  Home
                </a>
                <a 
                  href="/orders" 
                  className={`${isActive('/orders') ? 'text-yellow-400' : 'text-gray-300'} hover:text-white transition-colors`}
                >
                  Orders
                </a>
                <a 
                  href="/bulk-orders"
                  className={`${isActive('/bulk-orders') ? 'text-yellow-400' : 'text-gray-300'} hover:text-white transition-colors`}
                >
                  Bulk Orders
                </a>
                <a 
                  href="/api-docs" 
                  className={`${isActive('/api-docs') ? 'text-yellow-400' : 'text-gray-300'} hover:text-white transition-colors flex items-center gap-1`}
                >
                  <Terminal className="w-4 h-4" />
                  API Docs
                </a>
                <a 
                  href="/profile" 
                  className={`${isActive('/profile') ? 'text-yellow-400' : 'text-gray-300'} hover:text-white transition-colors`}
                >
                  Profile
                </a>
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
                  {(userData.role === 'dealer' || userData.role === 'supplier') && (
                    <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded capitalize">
                      {userData.role}
                    </span>
                  )}
                </div>
              )}
              
              <div className="hidden sm:flex items-center gap-2 bg-gray-800 px-2 sm:px-3 py-1.5 rounded-lg">
                <Wallet className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-medium text-sm sm:text-base">
                  ₵{userBalance?.toFixed(2) || '0.00'}
                </span>
              </div>
              
              {onCartClick && (
                <button
                  onClick={onCartClick}
                  className="relative p-2 text-white hover:text-yellow-400 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}
              
              <div className="relative account-menu-container">
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className="p-2 text-white hover:text-yellow-400 transition-colors"
                >
                  <User className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {/* ACCOUNT DROPDOWN WITH TODAY'S STATS */}
                {showAccountMenu && (
                  <div className="absolute top-12 right-0 w-80 bg-gray-800 rounded-lg shadow-xl py-2 z-50">
                    {userData && (
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-white text-sm font-medium truncate">{userData.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Role: <span className="text-gray-300 capitalize">{userData.role}</span>
                        </p>
                      </div>
                    )}

                    {/* TODAY'S STATS SECTION */}
                    <div className="border-b border-gray-700">
                      <button
                        onClick={() => setShowStatsDropdown(!showStatsDropdown)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-yellow-400" />
                          <span className="text-white text-sm font-medium">Today's Activity</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showStatsDropdown ? 'rotate-90' : ''}`} />
                      </button>

                      {showStatsDropdown && (
                        <div className="px-4 pb-3 bg-gray-900">
                          {loadingStats ? (
                            <div className="py-4 text-center">
                              <Loader2 className="w-5 h-5 animate-spin text-yellow-400 mx-auto" />
                              <p className="text-xs text-gray-400 mt-2">Loading stats...</p>
                            </div>
                          ) : todayStats ? (
                            <div className="space-y-3">
                              {/* Orders Stats */}
                              <div className="bg-gray-800 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-gray-400">Orders Today</span>
                                  <Package className="w-3 h-3 text-gray-400" />
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                  <div>
                                    <p className="text-lg font-bold text-white">{todayStats.orders.total}</p>
                                    <p className="text-xs text-gray-500">Total</p>
                                  </div>
                                  <div>
                                    <p className="text-lg font-bold text-green-400">{todayStats.orders.successful}</p>
                                    <p className="text-xs text-gray-500">Success</p>
                                  </div>
                                  <div>
                                    <p className="text-lg font-bold text-yellow-400">{todayStats.orders.pending}</p>
                                    <p className="text-xs text-gray-500">Pending</p>
                                  </div>
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-700">
                                  <p className="text-xs text-gray-400">Total Spent</p>
                                  <p className="text-xl font-bold text-yellow-400">{todayStats.orders.formattedAmount}</p>
                                </div>
                              </div>

                              {/* Deposits Stats */}
                              <div className="bg-gray-800 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-gray-400">Admin Deposits</span>
                                  <DollarSign className="w-3 h-3 text-gray-400" />
                                </div>
                                <p className="text-xl font-bold text-green-400">{todayStats.deposits.formattedAmount}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {todayStats.deposits.count} transaction{todayStats.deposits.count !== 1 ? 's' : ''}
                                </p>
                              </div>

                              {/* Summary */}
                              <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-xs text-yellow-100">Net Activity</p>
                                    <p className="text-lg font-bold text-white">{todayStats.summary.formattedNetActivity}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-yellow-100">Success Rate</p>
                                    <p className="text-lg font-bold text-white">{todayStats.summary.successRate}</p>
                                  </div>
                                </div>
                              </div>

                              {/* View Full Stats Button */}
                             
                            </div>
                          ) : (
                            <div className="py-4 text-center">
                              <p className="text-sm text-gray-400">No data available</p>
                              <button 
                                onClick={fetchTodayStats}
                                className="mt-2 text-xs text-yellow-400 hover:text-yellow-500"
                              >
                                Retry
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Navigation Links */}
                    <div className="py-2">
                      <a href="/profile" className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white text-sm transition-colors">
                        <User className="w-4 h-4" />
                        Profile
                      </a>
                      <a href="/orders" className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white text-sm transition-colors">
                        <History className="w-4 h-4" />
                        Order History
                      </a>
                      <a href="/wallet" className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white text-sm transition-colors">
                        <CreditCard className="w-4 h-4" />
                        Top Up Wallet
                      </a>
                      <a href="/stats" className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white text-sm transition-colors">
                        <TrendingUp className="w-4 h-4" />
                        Statistics
                      </a>
                      <a href="/api-docs" className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white text-sm transition-colors">
                        <Terminal className="w-4 h-4" />
                        API Documentation
                      </a>
                    </div>

                    {/* Admin/Dealer/Supplier Links */}
                    {userData?.role === 'admin' && (
                      <>
                        <hr className="my-2 border-gray-700" />
                        <a href="/admin" className="flex items-center gap-2 px-4 py-2 text-purple-400 hover:bg-gray-700 text-sm transition-colors">
                          <Shield className="w-4 h-4" />
                          Admin Panel
                        </a>
                      </>
                    )}
                    
                    {(userData?.role === 'dealer' || userData?.role === 'supplier') && (
                      <>
                        <hr className="my-2 border-gray-700" />
                        <div className="px-4 py-2">
                          <p className="text-xs text-gray-400 mb-2">Business Tools</p>
                          <a href="/api-keys" className="flex items-center gap-2 py-1 text-yellow-400 hover:text-yellow-500 text-sm">
                            <Terminal className="w-4 h-4" />
                            Manage API Keys
                          </a>
                        </div>
                      </>
                    )}

                    <hr className="my-2 border-gray-700" />
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-gray-700 text-left text-sm transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU DRAWER */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileMenu(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-[#1f2128] shadow-xl overflow-y-auto">
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
                    <span className="inline-block mt-1 px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded capitalize">
                      {userData.role}
                    </span>
                  )}
                </div>
              )}
              
              {/* Mobile Navigation */}
              <nav className="space-y-2">
                <a href="/" className={`flex items-center gap-3 px-3 py-2 ${isActive('/') ? 'text-yellow-400 bg-gray-800' : 'text-gray-300 hover:bg-gray-800'} rounded-lg`}>
                  <Home className="w-5 h-5" />
                  Home
                </a>
                <a href="/orders" className={`flex items-center gap-3 px-3 py-2 ${isActive('/orders') ? 'text-yellow-400 bg-gray-800' : 'text-gray-300 hover:bg-gray-800'} rounded-lg`}>
                  <Package className="w-5 h-5" />
                  Orders
                </a>
                <a href="/bulk-orders" className={`flex items-center gap-3 px-3 py-2 ${isActive('/bulk-orders') ? 'text-yellow-400 bg-gray-800' : 'text-gray-300 hover:bg-gray-800'} rounded-lg`}>
                  <FileSpreadsheet className="w-5 h-5" />
                  Bulk Orders
                </a>
                <a href="/stats" className={`flex items-center gap-3 px-3 py-2 ${isActive('/stats') ? 'text-yellow-400 bg-gray-800' : 'text-gray-300 hover:bg-gray-800'} rounded-lg`}>
                  <TrendingUp className="w-5 h-5" />
                  Statistics
                </a>
                <a href="/api-docs" className={`flex items-center gap-3 px-3 py-2 ${isActive('/api-docs') ? 'text-yellow-400 bg-gray-800' : 'text-gray-300 hover:bg-gray-800'} rounded-lg`}>
                  <Terminal className="w-5 h-5" />
                  API Documentation
                </a>
                <a href="/profile" className={`flex items-center gap-3 px-3 py-2 ${isActive('/profile') ? 'text-yellow-400 bg-gray-800' : 'text-gray-300 hover:bg-gray-800'} rounded-lg`}>
                  <User className="w-5 h-5" />
                  Profile
                </a>
                <a href="/wallet" className={`flex items-center gap-3 px-3 py-2 ${isActive('/wallet') ? 'text-yellow-400 bg-gray-800' : 'text-gray-300 hover:bg-gray-800'} rounded-lg`}>
                  <CreditCard className="w-5 h-5" />
                  Top Up Wallet
                </a>
              </nav>
              
              {/* Today's Stats in Mobile */}
              {todayStats && (
                <div className="mt-6 p-3 bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-yellow-400" />
                    Today's Activity
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-gray-700 rounded p-2">
                      <p className="text-xs text-gray-400">Orders</p>
                      <p className="text-lg font-bold text-white">{todayStats.orders.total}</p>
                    </div>
                    <div className="bg-gray-700 rounded p-2">
                      <p className="text-xs text-gray-400">Spent</p>
                      <p className="text-lg font-bold text-yellow-400">₵{todayStats.orders.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6 p-3 bg-gray-800 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Wallet Balance</p>
                <p className="text-2xl font-bold text-yellow-400">₵{userBalance?.toFixed(2) || '0.00'}</p>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-4 space-y-2">
                {userData?.role === 'admin' && (
                  <button 
                    onClick={() => router.push('/admin')}
                    className="w-full py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </button>
                )}
                <button 
                  onClick={() => router.push('/wallet')}
                  className="w-full py-2 bg-yellow-400 text-gray-900 font-medium rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  Top Up Wallet
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
    </>
  );
}