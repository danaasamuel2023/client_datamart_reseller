'use client';

import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  DocumentChartBarIcon
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
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('sales');
  const [salesData, setSalesData] = useState([]);
  const [userActivityData, setUserActivityData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupBy, setGroupBy] = useState('day');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeReport === 'sales') {
      fetchSalesReport();
    } else if (activeReport === 'userActivity') {
      fetchUserActivityReport();
    }
  }, [activeReport, startDate, endDate, groupBy]);

  const fetchSalesReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const params = new URLSearchParams({
        groupBy,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await fetch(`/api/admin/reports/sales?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setSalesData(data.data);
      }
    } catch (error) {
      console.error('Error fetching sales report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivityReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const params = new URLSearchParams({
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await fetch(`/api/admin/reports/user-activity?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setUserActivityData(data.data);
      }
    } catch (error) {
      console.error('Error fetching user activity report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const token = localStorage.getItem('adminToken');
      const endpoint = activeReport === 'sales' ? 'sales' : 'user-activity';
      
      const params = new URLSearchParams({
        format,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await fetch(`/api/admin/reports/export/${endpoint}?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${endpoint}-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      } else {
        const data = await response.json();
        console.log('Export data:', data);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount || 0);
  };

  const salesChartData = {
    labels: salesData.map(d => d._id),
    datasets: [
      {
        label: 'Revenue',
        data: salesData.map(d => d.totalRevenue),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      }
    ]
  };

  const activityChartData = {
    labels: userActivityData.slice(0, 10).map(d => d.user?.fullName || 'Unknown'),
    datasets: [
      {
        label: 'Total Spent',
        data: userActivityData.slice(0, 10).map(d => d.totalSpent),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
        ],
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      }
    }
  };

  const reportTabs = [
    { id: 'sales', name: 'Sales Report', icon: CurrencyDollarIcon },
    { id: 'userActivity', name: 'User Activity', icon: UserGroupIcon },
    { id: 'products', name: 'Product Performance', icon: ChartBarIcon },
    { id: 'financial', name: 'Financial Summary', icon: DocumentChartBarIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="mt-1 text-sm text-gray-500">Generate and export detailed business reports</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Export CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {reportTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveReport(tab.id)}
                  className={`
                    flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm
                    ${activeReport === tab.id 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                >
                  <Icon className="h-5 w-5 inline-block mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            {activeReport === 'sales' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="hour">Hour</option>
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                </select>
              </div>
            )}
            <div className="flex items-end">
              <button
                onClick={() => {
                  if (activeReport === 'sales') fetchSalesReport();
                  else if (activeReport === 'userActivity') fetchUserActivityReport();
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {activeReport === 'sales' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Sales Report</h3>
                  
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Total Sales</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {salesData.reduce((sum, d) => sum + d.totalSales, 0)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Total Revenue</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {formatCurrency(salesData.reduce((sum, d) => sum + d.totalRevenue, 0))}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Average Transaction</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {formatCurrency(
                          salesData.reduce((sum, d) => sum + d.avgTransactionValue, 0) / salesData.length || 0
                        )}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Period</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {salesData.length} {groupBy}s
                      </p>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <Bar data={salesChartData} options={chartOptions} />
                  </div>

                  {/* Table */}
                  <div className="mt-6">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Period
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Total Sales
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Revenue
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Avg Transaction
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {salesData.map((row, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {row._id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {row.totalSales}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(row.totalRevenue)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(row.avgTransactionValue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeReport === 'userActivity' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">User Activity Report</h3>
                  
                  {/* Chart */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <Bar data={activityChartData} options={chartOptions} />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <Pie data={activityChartData} options={chartOptions} />
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Total Transactions
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Total Spent
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Success Rate
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Role
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {userActivityData.map((user, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {user.user?.fullName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.user?.email}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.totalTransactions}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(user.totalSpent)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                user.successRate >= 90 ? 'bg-green-100 text-green-800' :
                                user.successRate >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {user.successRate?.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                {user.user?.role}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeReport === 'products' && (
                <div className="text-center py-12">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Product performance report coming soon</p>
                </div>
              )}

              {activeReport === 'financial' && (
                <div className="text-center py-12">
                  <DocumentChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Financial summary report coming soon</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}