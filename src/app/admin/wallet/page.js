'use client';

import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  SunIcon,
  MoonIcon,
  CreditCardIcon,
  BanknotesIcon,
  ChartBarIcon,
  WalletIcon
} from '@heroicons/react/24/outline';

export default function WalletPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [adjustData, setAdjustData] = useState({
    userId: '',
    amount: '',
    type: 'credit',
    reason: ''
  });

  // Summary statistics
  const [stats, setStats] = useState({
    totalCredits: 0,
    totalDebits: 0,
    totalTransactions: 0,
    activeWallets: 0
  });

  useEffect(() => {
    // Check for saved dark mode preference or system preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
    
    fetchWalletTransactions();
    fetchUsers();
    fetchStats();
  }, [currentPage, typeFilter, purposeFilter, searchTerm, startDate, endDate]);

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', JSON.stringify(true));
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', JSON.stringify(false));
    }
  }, [darkMode]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('Token');
      const response = await fetch('http://localhost:5000/api/admin/wallet-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default values for demo
      setStats({
        totalCredits: 12500,
        totalDebits: 7500,
        totalTransactions: 156,
        activeWallets: 89
      });
    }
  };

  const fetchWalletTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('Token');
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(typeFilter && { type: typeFilter }),
        ...(purposeFilter && { purpose: purposeFilter }),
        ...(searchTerm && { search: searchTerm }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await fetch(`http://localhost:5000/api/admin/wallet-transactions?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setWalletTransactions(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('Token');
      const response = await fetch('http://localhost:5000/api/admin/users?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAdjustWallet = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('Token');
      const response = await fetch('http://localhost:5000/api/admin/wallet/adjust', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adjustData)
      });

      const data = await response.json();
      if (data.success) {
        alert('Wallet adjusted successfully');
        setShowAdjustModal(false);
        setAdjustData({
          userId: '',
          amount: '',
          type: 'credit',
          reason: ''
        });
        fetchWalletTransactions();
        fetchStats();
      } else {
        alert(data.message || 'Error adjusting wallet');
      }
    } catch (error) {
      console.error('Error adjusting wallet:', error);
      alert('Error adjusting wallet');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount || 0);
  };

  const getTransactionIcon = (type) => {
    return type === 'credit' ? (
      <PlusCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400" />
    ) : (
      <MinusCircleIcon className="h-5 w-5 text-red-500 dark:text-red-400" />
    );
  };

  const getPurposeColor = (purpose) => {
    const colors = {
      topup: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      purchase: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      refund: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      adjustment: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      transfer: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
    };
    return colors[purpose] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-300">
      <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
        
        {/* Dark Mode Toggle - Floating */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-110"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <SunIcon className="h-5 w-5 text-yellow-500 group-hover:rotate-12 transition-transform" />
            ) : (
              <MoonIcon className="h-5 w-5 text-gray-700 group-hover:rotate-[-20deg] transition-transform" />
            )}
          </button>
        </div>

        {/* Page Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Wallet Management
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Monitor transactions and manage user wallets efficiently
              </p>
            </div>
            <button
              onClick={() => setShowAdjustModal(true)}
              className="flex items-center px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Adjust Wallet
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Credits Card */}
          <div className="group animate-slide-up">
            <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-700/50 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Credits Today</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {formatCurrency(stats.totalCredits)}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                    <BanknotesIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Debits Card */}
          <div className="group animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="relative bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-2xl p-6 border border-red-200/50 dark:border-red-700/50 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/20 to-transparent rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Debits Today</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {formatCurrency(stats.totalDebits)}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                    <CreditCardIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Card */}
          <div className="group animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {stats.totalTransactions}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Wallets Card */}
          <div className="group animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/50 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Wallets</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {stats.activeWallets}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                    <WalletIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
              />
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>

            <select
              value={purposeFilter}
              onChange={(e) => setPurposeFilter(e.target.value)}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 cursor-pointer"
            >
              <option value="">All Purposes</option>
              <option value="topup">Topup</option>
              <option value="purchase">Purchase</option>
              <option value="refund">Refund</option>
              <option value="adjustment">Adjustment</option>
              <option value="transfer">Transfer</option>
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        {/* Wallet Transactions Table */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
                      <div className="inline-flex items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-400"></div>
                      </div>
                    </td>
                  </tr>
                ) : walletTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                          <WalletIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No transactions found</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  walletTransactions.map((transaction) => (
                    <tr 
                      key={transaction._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg ${
                            transaction.type === 'credit' 
                              ? 'bg-green-100 dark:bg-green-900/30' 
                              : 'bg-red-100 dark:bg-red-900/30'
                          }`}>
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <span className={`ml-3 text-sm font-semibold capitalize ${
                            transaction.type === 'credit' 
                              ? 'text-green-700 dark:text-green-400' 
                              : 'text-red-700 dark:text-red-400'
                          }`}>
                            {transaction.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {transaction.user?.fullName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {transaction.user?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center text-sm font-bold ${
                          transaction.type === 'credit' 
                            ? 'text-green-700 dark:text-green-400' 
                            : 'text-red-700 dark:text-red-400'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="text-gray-500 dark:text-gray-400">
                            Before: {formatCurrency(transaction.balanceBefore)}
                          </div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            After: {formatCurrency(transaction.balanceAfter)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPurposeColor(transaction.purpose)}`}>
                          {transaction.purpose}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700 dark:text-gray-300">
                        {transaction.reference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(transaction.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                
                <div className="flex items-center space-x-2">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-300 ${
                          currentPage === pageNum 
                            ? 'bg-blue-600 text-white shadow-lg' 
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center"
                >
                  Next
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Adjust Wallet Modal */}
        {showAdjustModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl transform animate-slide-up">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <WalletIcon className="h-7 w-7 mr-3 text-blue-600 dark:text-blue-400" />
                Adjust User Wallet
              </h2>
              <form onSubmit={handleAdjustWallet}>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Select User
                    </label>
                    <select
                      value={adjustData.userId}
                      onChange={(e) => setAdjustData({...adjustData, userId: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                      required
                    >
                      <option value="">Choose a user...</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.fullName} - {user.email} (Balance: {formatCurrency(user.wallet?.balance || 0)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Transaction Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setAdjustData({...adjustData, type: 'credit'})}
                        className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center ${
                          adjustData.type === 'credit'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 ring-2 ring-green-500 dark:ring-green-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        <PlusCircleIcon className="h-5 w-5 mr-2" />
                        Credit
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdjustData({...adjustData, type: 'debit'})}
                        className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center ${
                          adjustData.type === 'debit'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-2 ring-red-500 dark:ring-red-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        <MinusCircleIcon className="h-5 w-5 mr-2" />
                        Debit
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Amount (GHS)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500 dark:text-gray-400">₵</span>
                      <input
                        type="number"
                        step="0.01"
                        value={adjustData.amount}
                        onChange={(e) => setAdjustData({...adjustData, amount: e.target.value})}
                        className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Reason
                    </label>
                    <textarea
                      value={adjustData.reason}
                      onChange={(e) => setAdjustData({...adjustData, reason: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 resize-none"
                      rows="3"
                      placeholder="Enter adjustment reason..."
                      required
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdjustModal(false);
                      setAdjustData({
                        userId: '',
                        amount: '',
                        type: 'credit',
                        reason: ''
                      });
                    }}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 font-medium transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Confirm Adjustment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slide-up {
          from {
            transform: translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-in-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}