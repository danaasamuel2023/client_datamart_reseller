'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  History, 
  Wallet, 
  Package, 
  Filter, 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Check,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Loader2,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  ArrowLeft,
  Send,
  Info,
  HelpCircle,
  AlertTriangle,
  FileText,
  ExternalLink
} from 'lucide-react';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://server-datamart-reseller.onrender.com/api';

export default function TransactionHistory() {
  const router = useRouter();
  
  // State Management
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'wallet'
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [showStatusInfo, setShowStatusInfo] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 20;
  
  // Statistics
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalOrders: 0,
    successfulOrders: 0,
    failedOrders: 0,
    pendingOrders: 0,
    sentOrders: 0,
    totalCredits: 0,
    totalDebits: 0,
    walletBalance: 0
  });
  
  // Fetch data on mount and when filters change
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrderTransactions();
    } else {
      fetchWalletTransactions();
    }
  }, [activeTab, statusFilter, dateFilter, currentPage, startDate, endDate]);
  
  // Fetch order transactions
  const fetchOrderTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('Token');
      if (!token) {
        setError('Please login to view transactions');
        return;
      }
      
      // Build query params
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage
      });
      
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`${API_BASE_URL}/purchase/orders?${params}`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch transactions');
      
      const data = await response.json();
      
      if (data.success) {
        setTransactions(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalRecords(data.pagination?.total || 0);
        
        // Calculate stats
        const stats = data.data?.reduce((acc, tx) => {
          acc.totalSpent += tx.amount || 0;
          acc.totalOrders++;
          if (tx.status === 'successful') acc.successfulOrders++;
          if (tx.status === 'failed') acc.failedOrders++;
          if (tx.status === 'pending') acc.pendingOrders++;
          if (tx.status === 'sent') acc.sentOrders++;
          return acc;
        }, {
          totalSpent: 0,
          totalOrders: 0,
          successfulOrders: 0,
          failedOrders: 0,
          pendingOrders: 0,
          sentOrders: 0
        });
        
        setStats(prev => ({ ...prev, ...stats }));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch wallet transactions
  const fetchWalletTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('Token');
      if (!token) {
        setError('Please login to view transactions');
        return;
      }
      
      // Build query params
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage
      });
      
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      // First fetch wallet info
      const walletResponse = await fetch(`${API_BASE_URL}/user/wallet`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (walletResponse.ok) {
        const walletData = await walletResponse.json();
        if (walletData.success) {
          setStats(prev => ({
            ...prev,
            walletBalance: walletData.data?.balance || 0,
            totalCredits: walletData.data?.statistics?.totalCredits || 0,
            totalDebits: walletData.data?.statistics?.totalDebits || 0
          }));
        }
      }
      
      // Then fetch transactions
      const response = await fetch(`${API_BASE_URL}/user/wallet/transactions?${params}`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch wallet transactions');
      
      const data = await response.json();
      
      if (data.success) {
        setTransactions(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalRecords(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
      setError('Failed to load wallet transactions');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'orders') {
      await fetchOrderTransactions();
    } else {
      await fetchWalletTransactions();
    }
    setRefreshing(false);
  };
  
  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    if (activeTab === 'orders') {
      fetchOrderTransactions();
    } else {
      fetchWalletTransactions();
    }
  };
  
  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format amount
  const formatAmount = (amount) => {
    return `₵ ${(amount || 0).toFixed(2)}`;
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'successful':
      case 'completed':
        return 'text-green-400 bg-green-400/10';
      case 'failed':
        return 'text-red-400 bg-red-400/10';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'sent':
        return 'text-blue-400 bg-blue-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'successful':
      case 'completed':
        return <Check className="w-4 h-4" />;
      case 'failed':
        return <X className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'sent':
        return <Send className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };
  
  // Get status description
  const getStatusDescription = (status) => {
    switch (status?.toLowerCase()) {
      case 'successful':
        return 'Data delivered successfully';
      case 'failed':
        return 'Auto-retry in progress - DO NOT reorder';
      case 'pending':
        return 'In queue to be sent to MTN';
      case 'sent':
        return 'Sent to MTN, processing';
      default:
        return '';
    }
  };
  
  // Export transactions
  const handleExport = () => {
    const csvContent = [
      ['Date', 'Type', 'Amount', 'Status', 'Reference', 'Portal ID', 'Description'].join(','),
      ...transactions.map(tx => [
        formatDate(tx.createdAt || tx.date),
        tx.type || 'data_purchase',
        tx.amount,
        tx.status,
        tx.reference || tx.transactionId,
        tx.metadata?.portalId || '',
        tx.description || `${tx.product} for ${tx.beneficiary}`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Check if user has failed orders
  const hasFailedOrders = transactions.some(tx => tx.status === 'failed');
  
  if (loading && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-[#2a2d3a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-yellow-400 mx-auto mb-4" />
          <p className="text-white text-lg">Loading transactions...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#2a2d3a]">
      {/* Header */}
      <div className="bg-[#1f2128] border-b border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
                title="Go back to dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                  <History className="w-8 h-8 text-yellow-400" />
                  Transaction History
                </h1>
                <p className="text-gray-400 mt-1">View and manage your transactions</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-yellow-400 text-gray-900 font-medium rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Failed Orders Warning Banner */}
      {activeTab === 'orders' && hasFailedOrders && (
        <div className="container mx-auto px-4 pt-6">
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-red-400 font-semibold text-lg mb-1">Important: Failed Orders Auto-Retry System</h3>
                <p className="text-white mb-2">
                  ⚠️ <strong>DO NOT place the same order again if it fails!</strong>
                </p>
                <ul className="space-y-1 text-gray-300 text-sm">
                  <li>• Our system automatically retries failed orders multiple times</li>
                  <li>• When retrying, the amount will be deducted from your wallet automatically</li>
                  <li>• You will receive a notification when the retry is successful</li>
                  <li>• If all retries fail, your money will be refunded to your wallet</li>
                </ul>
                
                <div className="mt-3 p-2 bg-yellow-900/30 border border-yellow-500/50 rounded">
                  <p className="text-yellow-400 text-sm font-semibold mb-1">💰 Insufficient Balance Notice:</p>
                  <ul className="space-y-1 text-gray-300 text-xs">
                    <li>• If your wallet balance is insufficient, the retry will be <strong>skipped</strong></li>
                    <li>• The order will remain in "failed" status until you add funds</li>
                    <li>• System will retry once you top up your wallet with sufficient funds</li>
                    <li>• Keep extra balance in your wallet to ensure automatic retries work</li>
                  </ul>
                </div>
                
                <p className="text-yellow-400 text-sm mt-2 font-medium">
                  ⚠️ Placing duplicate orders will result in double charges!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Status Information Banner */}
      {activeTab === 'orders' && (
        <div className="container mx-auto px-4 pt-6">
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-5 h-5 text-blue-400" />
                  <h3 className="text-white font-semibold">Order Status Guide</h3>
                  <button
                    onClick={() => setShowStatusInfo(!showStatusInfo)}
                    className="ml-2 text-blue-400 hover:text-blue-300"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>
                
                {showStatusInfo && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-yellow-400 bg-yellow-400/10 min-w-[90px]">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                      <p className="text-gray-300 text-sm">Order is in queue waiting to be sent to MTN portal for processing</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-blue-400 bg-blue-400/10 min-w-[90px]">
                        <Send className="w-3 h-3" />
                        Sent
                      </span>
                      <p className="text-gray-300 text-sm">Order has been sent to MTN portal and is currently being processed (typically takes 15-30 minutes)</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-green-400 bg-green-400/10 min-w-[90px]">
                        <Check className="w-3 h-3" />
                        Successful
                      </span>
                      <p className="text-gray-300 text-sm">Data has been successfully delivered to the beneficiary number</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-red-400 bg-red-400/10 min-w-[90px]">
                        <X className="w-3 h-3" />
                        Failed
                      </span>
                      <div className="flex-1">
                        <p className="text-gray-300 text-sm">Transaction failed - amount has been refunded to your wallet</p>
                        <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded">
                          <p className="text-red-400 text-xs font-semibold mb-1">⚠️ IMPORTANT: DO NOT REORDER!</p>
                          <p className="text-gray-300 text-xs">System automatically retries failed orders.</p>
                          <p className="text-yellow-400 text-xs mt-1">💰 Note: Retries require sufficient wallet balance.</p>
                          <p className="text-gray-400 text-xs">If balance is low, retry will wait until you top up.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {!showStatusInfo && (
                  <div className="space-y-1">
                    <div className="flex gap-4 text-xs">
                      <span className="text-yellow-400">⚡ Pending = Queue</span>
                      <span className="text-blue-400">📤 Sent = Processing at MTN</span>
                      <span className="text-green-400">✓ Successful = Delivered</span>
                      <span className="text-red-400">⚠️ Failed = Auto-retry (needs funds)</span>
                      <span className="text-gray-400 ml-auto">Click ⓘ for details</span>
                    </div>
                    <div className="text-xs text-yellow-400 font-medium">
                      💰 Maintain wallet balance for automatic retries to work
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {activeTab === 'orders' ? (
            <>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm">Total Spent</p>
                  <TrendingUp className="w-4 h-4 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-white">{formatAmount(stats.totalSpent)}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.totalOrders} orders</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm">Successful</p>
                  <Check className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white">{stats.successfulOrders}</p>
                <p className="text-xs text-gray-500 mt-1">Delivered</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm">Processing</p>
                  <Send className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-white">{stats.sentOrders}</p>
                <p className="text-xs text-gray-500 mt-1">At MTN</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm">Pending</p>
                  <Clock className="w-4 h-4 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-white">{stats.pendingOrders}</p>
                <p className="text-xs text-gray-500 mt-1">In Queue</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm">Failed</p>
                  <X className="w-4 h-4 text-red-400" />
                </div>
                <p className="text-2xl font-bold text-white">{stats.failedOrders}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.failedOrders > 0 ? 'Check wallet balance' : 'Auto-retrying'}
                </p>
                {stats.failedOrders > 0 && (
                  <div className="absolute -top-1 -right-1">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="bg-gray-800 rounded-lg p-4 lg:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm">Wallet Balance</p>
                  <Wallet className="w-4 h-4 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-white">{formatAmount(stats.walletBalance)}</p>
                <p className="text-xs text-gray-500 mt-1">Available</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm">Total Credits</p>
                  <ArrowDownRight className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white">{formatAmount(stats.totalCredits)}</p>
                <p className="text-xs text-gray-500 mt-1">Received</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm">Total Debits</p>
                  <ArrowUpRight className="w-4 h-4 text-red-400" />
                </div>
                <p className="text-2xl font-bold text-white">{formatAmount(stats.totalDebits)}</p>
                <p className="text-xs text-gray-500 mt-1">Spent</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm">Net Flow</p>
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <p className={`text-2xl font-bold ${stats.totalCredits - stats.totalDebits >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatAmount(stats.totalCredits - stats.totalDebits)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Difference</p>
              </div>
            </>
          )}
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setActiveTab('orders');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-yellow-400 text-gray-900'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Package className="w-4 h-4" />
            Order History
          </button>
          <button
            onClick={() => {
              setActiveTab('wallet');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'wallet'
                ? 'bg-yellow-400 text-gray-900'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Wallet History
          </button>
        </div>
        
        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            {activeTab === 'orders' && (
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Transaction ID, phone, or Portal ID"
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>
            )}
            
            {/* Status Filter */}
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="all">All Status</option>
                {activeTab === 'orders' ? (
                  <>
                    <option value="successful">Successful (Delivered)</option>
                    <option value="sent">Sent (Processing)</option>
                    <option value="pending">Pending (Queue)</option>
                    <option value="failed">Failed (Auto-retry)</option>
                  </>
                ) : (
                  <>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </>
                )}
              </select>
            </div>
            
            {/* Date Range */}
            <div>
              <label className="text-gray-400 text-sm mb-2 block">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            
            <div>
              <label className="text-gray-400 text-sm mb-2 block">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-500">{error}</p>
            </div>
          </div>
        )}
        
        {/* Transactions Table/List */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900 border-b border-gray-700">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {activeTab === 'orders' ? 'Product' : 'Type'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {activeTab === 'orders' ? 'Beneficiary' : 'Purpose'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Reference / Portal ID
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {transactions.map((tx) => (
                  <tr key={tx.id || tx._id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(tx.createdAt || tx.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {activeTab === 'orders' ? (
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-yellow-400" />
                          {tx.product || tx.capacity}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {tx.type === 'credit' ? (
                            <ArrowDownRight className="w-4 h-4 text-green-400" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-red-400" />
                          )}
                          <span className="capitalize">{tx.type}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {activeTab === 'orders' ? tx.beneficiary : (tx.purpose || tx.description)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={tx.type === 'credit' ? 'text-green-400' : 'text-white'}>
                        {tx.type === 'credit' ? '+' : '-'}{formatAmount(tx.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                          {getStatusIcon(tx.status)}
                          {tx.status}
                        </span>
                        {activeTab === 'orders' && (
                          <span className={`text-xs ${tx.status === 'failed' ? 'text-red-400 font-medium' : 'text-gray-500'}`}>
                            {getStatusDescription(tx.status)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="space-y-1">
                        <div className="text-gray-400 font-mono text-xs">
                          Ref: {tx.reference || tx.transactionId}
                        </div>
                        {tx.metadata?.portalId && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3 text-blue-400" />
                            <span className="text-blue-400 text-xs font-medium">
                              Portal: {tx.metadata.portalId}
                            </span>
                          </div>
                        )}
                        {tx.metadata?.exportId && (
                          <div className="text-gray-500 text-xs">
                            Export: {tx.metadata.exportId.substring(0, 8)}...
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Mobile Cards */}
          <div className="lg:hidden">
            {transactions.map((tx) => (
              <div key={tx.id || tx._id} className="p-4 border-b border-gray-700 hover:bg-gray-700 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-white font-medium">
                      {activeTab === 'orders' ? tx.product || tx.capacity : tx.type?.toUpperCase()}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {formatDate(tx.createdAt || tx.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                      {getStatusIcon(tx.status)}
                      {tx.status}
                    </span>
                    {activeTab === 'orders' && (
                      <p className={`text-xs mt-1 ${tx.status === 'failed' ? 'text-red-400 font-medium' : 'text-gray-500'}`}>
                        {getStatusDescription(tx.status)}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Show warning for failed orders on mobile */}
                {tx.status === 'failed' && activeTab === 'orders' && (
                  <div className="mb-2 p-2 bg-red-900/20 border border-red-500/30 rounded text-xs">
                    <p className="text-red-400 font-medium">⚠️ DO NOT REORDER</p>
                    <p className="text-gray-300">Auto-retry in progress</p>
                    <p className="text-yellow-400 mt-1">💰 Needs sufficient wallet balance</p>
                  </div>
                )}
                
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-gray-400 text-sm">
                      {activeTab === 'orders' 
                        ? `To: ${tx.beneficiary}`
                        : tx.purpose || tx.description}
                    </p>
                    <div className="space-y-0.5">
                      <p className="text-gray-500 text-xs">
                        Ref: {(tx.reference || tx.transactionId)?.substring(0, 12)}...
                      </p>
                      {tx.metadata?.portalId && (
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3 text-blue-400" />
                          <span className="text-blue-400 text-xs font-medium">
                            Portal: {tx.metadata.portalId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className={`text-lg font-bold ${tx.type === 'credit' ? 'text-green-400' : 'text-white'}`}>
                    {tx.type === 'credit' ? '+' : ''}{formatAmount(tx.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Empty State */}
          {transactions.length === 0 && !loading && (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No transactions found</p>
              <p className="text-gray-500 text-sm mt-2">
                {statusFilter !== 'all' || startDate || endDate 
                  ? 'Try adjusting your filters'
                  : 'Your transactions will appear here'}
              </p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <p className="text-gray-400 text-sm">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords} records
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {/* Page numbers */}
              <div className="flex gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, index) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = index + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = index + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + index;
                  } else {
                    pageNumber = currentPage - 2 + index;
                  }
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === pageNumber
                          ? 'bg-yellow-400 text-gray-900'
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}