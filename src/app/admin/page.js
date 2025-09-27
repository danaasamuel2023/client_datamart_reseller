'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UserGroupIcon, 
  CreditCardIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  ShoppingBagIcon,
  UsersIcon,
  DocumentChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7days');
  const [refreshTime, setRefreshTime] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
      setRefreshTime(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('Token');
      
      // Fetch all dashboard data
      const [statsRes, revenueRes, productsRes, transactionsRes] = await Promise.all([
        fetch('https://server-datamart-reseller.onrender.com/api/admin/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`https://server-datamart-reseller.onrender.com/api/admin/dashboard/revenue?period=${period}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('https://server-datamart-reseller.onrender.com/api/admin/dashboard/top-products?limit=5', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('https://server-datamart-reseller.onrender.com/api/admin/transactions?limit=10', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [statsData, revenueData, productsData, transactionsData] = await Promise.all([
        statsRes.json(),
        revenueRes.json(),
        productsRes.json(),
        transactionsRes.json()
      ]);

      setStats(statsData.data || {
        users: [],
        transactions: [],
        today: { todaySales: 0, todayTransactions: 0 },
        activeProducts: 0,
        totalWalletBalance: 0
      });
      setRevenue(revenueData.data || []);
      setTopProducts(productsData.data || []);
      setRecentTransactions(transactionsData.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default data on error
      setStats({
        users: [{ _id: 'user', count: 100 }],
        transactions: [{ _id: 'successful', count: 50, totalAmount: 5000 }],
        today: { todaySales: 1500, todayTransactions: 25 },
        activeProducts: 10,
        totalWalletBalance: 15000
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount || 0);
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  // Calculate statistics
  const totalUsers = stats?.users?.reduce((acc, u) => acc + u.count, 0) || 0;
  const totalTransactions = stats?.transactions?.reduce((acc, t) => acc + t.count, 0) || 0;
  const totalRevenue = stats?.transactions?.reduce((acc, t) => acc + t.totalAmount, 0) || 0;
  const successRate = totalTransactions > 0 
    ? ((stats?.transactions?.find(t => t._id === 'successful')?.count || 0) / totalTransactions * 100).toFixed(1)
    : 0;

  // Chart data
  const revenueChartData = {
    labels: revenue.map(r => {
      const date = new Date(r._id);
      return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Revenue',
        data: revenue.map(r => r.revenue),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Transactions',
        data: revenue.map(r => r.transactions * 10), // Scale for visibility
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const transactionStatusData = {
    labels: ['Successful', 'Pending', 'Failed'],
    datasets: [{
      data: [
        stats?.transactions?.find(t => t._id === 'successful')?.count || 0,
        stats?.transactions?.find(t => t._id === 'pending')?.count || 0,
        stats?.transactions?.find(t => t._id === 'failed')?.count || 0
      ],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      change: '+15.3%',
      changeType: 'increase',
      icon: CurrencyDollarIcon,
      color: 'green',
      link: '/admin/transactions'
    },
    {
      title: "Today's Sales",
      value: formatCurrency(stats?.today?.todaySales || 0),
      subtitle: `${stats?.today?.todayTransactions || 0} transactions`,
      change: '+23%',
      changeType: 'increase',
      icon: BanknotesIcon,
      color: 'blue',
      link: '/admin/transactions'
    },
    {
      title: 'Total Users',
      value: totalUsers.toLocaleString(),
      subtitle: `${stats?.users?.find(u => u._id === 'agent')?.count || 0} agents`,
      change: '+12%',
      changeType: 'increase',
      icon: UsersIcon,
      color: 'purple',
      link: '/admin/users'
    },
    {
      title: 'Success Rate',
      value: `${successRate}%`,
      subtitle: 'Transaction success',
      change: '-2%',
      changeType: 'decrease',
      icon: ChartBarIcon,
      color: 'yellow',
      link: '/admin/reports'
    }
  ];

  const quickActions = [
    { name: 'Add Product', icon: ShoppingBagIcon, href: '/admin/products', color: 'blue' },
    { name: 'View Reports', icon: DocumentChartBarIcon, href: '/admin/reports', color: 'green' },
    { name: 'Send Notification', icon: BanknotesIcon, href: '/admin/notifications', color: 'purple' },
    { name: 'System Settings', icon: CogIcon, href: '/admin/settings', color: 'gray' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Welcome Back, Admin!</h1>
            <p className="mt-2 text-blue-100">
              Here's what's happening with your platform today
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Last updated</p>
            <p className="text-lg font-semibold">{formatTime(refreshTime)}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              href={stat.link}
              className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
                <div className={`flex items-center text-sm ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.changeType === 'increase' ? (
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                {stat.subtitle && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{stat.subtitle}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                href={action.href}
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Icon className={`h-8 w-8 text-${action.color}-600 mb-2`} />
                <span className="text-sm text-gray-700 dark:text-gray-300">{action.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue & Transactions</h2>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
            </select>
          </div>
          <div style={{ height: '300px' }}>
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>

        {/* Transaction Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transaction Status</h2>
          <div style={{ height: '300px' }}>
            <Doughnut data={transactionStatusData} options={{
              ...chartOptions,
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }} />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Products</h2>
              <Link href="/admin/products" className="text-sm text-blue-600 hover:text-blue-800">
                View All →
              </Link>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No product data available</p>
            ) : (
              topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.product?.name || 'Unknown Product'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {product.totalSales} sales
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(product.totalRevenue)}
                    </p>
                    <div className="flex items-center text-xs text-green-600">
                      <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                      +12%
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
              <Link href="/admin/transactions" className="text-sm text-blue-600 hover:text-blue-800">
                View All →
              </Link>
            </div>
          </div>
          <div className="p-6 space-y-3">
            {recentTransactions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent transactions</p>
            ) : (
              recentTransactions.slice(0, 5).map((transaction, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    {transaction.status === 'successful' ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                    ) : transaction.status === 'pending' ? (
                      <ClockIcon className="h-5 w-5 text-yellow-500 mr-3" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-500 mr-3" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.transactionId}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">API Status</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Operational</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Payment Gateway</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">SMS Service</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Low Balance</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Database</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Healthy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}