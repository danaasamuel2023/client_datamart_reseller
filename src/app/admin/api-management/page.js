'use client';

import { useState, useEffect } from 'react';
import {
  KeyIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  PlusCircleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

export default function ApiManagementPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [apiUsers, setApiUsers] = useState([]);
  const [apiLogs, setApiLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showCredentials, setShowCredentials] = useState(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [apiStats, setApiStats] = useState({
    totalRequests: 0,
    successRate: 0,
    activeKeys: 0,
    avgResponseTime: 0
  });

  useEffect(() => {
    // Check for saved dark mode preference or system preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

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

  useEffect(() => {
    if (activeTab === 'users') {
      fetchApiUsers();
    } else if (activeTab === 'logs') {
      fetchApiLogs();
    } else if (activeTab === 'stats') {
      fetchApiStats();
    }
  }, [activeTab]);

  const fetchApiUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch('https://server-datamart-reseller.onrender.com/api/admin/users?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        const apiEnabledUsers = data.data.filter(user => user.apiAccess?.enabled);
        setApiUsers(apiEnabledUsers);
      }
    } catch (error) {
      console.error('Error fetching API users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApiLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch('https://server-datamart-reseller.onrender.com/api/admin/api-logs?limit=50', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setApiLogs(data.data);
      }
    } catch (error) {
      console.error('Error fetching API logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApiStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch('https://server-datamart-reseller.onrender.com/api/admin/api-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setApiStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching API stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = async () => {
    if (!selectedUser) {
      alert('Please select a user');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`https://server-datamart-reseller.onrender.com/api/admin/users/${selectedUser}/generate-api-key`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ webhookUrl })
      });

      const data = await response.json();
      if (data.success) {
        setShowCredentials(data.data);
        setShowGenerateModal(false);
        fetchApiUsers();
      }
    } catch (error) {
      console.error('Error generating API key:', error);
      alert('Error generating API key');
    }
  };

  const revokeApiAccess = async (userId) => {
    if (!confirm('Are you sure you want to revoke API access for this user?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`https://server-datamart-reseller.onrender.com/api/admin/users/${userId}/revoke-api-access`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        alert('API access revoked successfully');
        fetchApiUsers();
      }
    } catch (error) {
      console.error('Error revoking API access:', error);
      alert('Error revoking API access');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 py-6 space-y-6">
        
        {/* Dark Mode Toggle */}
        <div className="flex justify-end">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <SunIcon className="h-5 w-5 text-yellow-500" />
            ) : (
              <MoonIcon className="h-5 w-5 text-gray-700" />
            )}
          </button>
        </div>

        {/* Page Header */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 transition-colors duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Management</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage API keys and monitor API usage</p>
            </div>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Generate API Key
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Requests</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{apiStats.totalRequests.toLocaleString()}</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-blue-500 dark:text-blue-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{apiStats.successRate}%</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-500 dark:text-green-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Keys</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{apiStats.activeKeys}</p>
              </div>
              <KeyIcon className="h-8 w-8 text-purple-500 dark:text-purple-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Response Time</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{apiStats.avgResponseTime}ms</p>
              </div>
              <ArrowPathIcon className="h-8 w-8 text-yellow-500 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg transition-colors duration-300">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-300 ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                API Users
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-300 ${
                  activeTab === 'logs'
                    ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                API Logs
              </button>
              <button
                onClick={() => setActiveTab('documentation')}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-300 ${
                  activeTab === 'documentation'
                    ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Documentation
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        API Key
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Webhook URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
                        </td>
                      </tr>
                    ) : apiUsers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-gray-500 dark:text-gray-400">
                          No API users found
                        </td>
                      </tr>
                    ) : (
                      apiUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{user.fullName}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-900 dark:text-gray-300">
                                {user.apiAccess?.apiKey?.substring(0, 20)}...
                              </code>
                              <button
                                onClick={() => copyToClipboard(user.apiAccess?.apiKey)}
                                className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              >
                                <ClipboardDocumentIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                            {user.apiAccess?.webhookUrl || 'Not set'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-400">
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => revokeApiAccess(user._id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                              title="Revoke API Access"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Endpoint
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Response Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {apiLogs.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-gray-500 dark:text-gray-400">
                          No API logs found
                        </td>
                      </tr>
                    ) : (
                      apiLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(log.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {log.user?.fullName || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                            {log.endpoint}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded ${
                              log.method === 'GET' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300' :
                              log.method === 'POST' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' :
                              log.method === 'PUT' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300' :
                              log.method === 'DELETE' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300' :
                              'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                            }`}>
                              {log.method}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              log.statusCode >= 200 && log.statusCode < 300 
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-400'
                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-400'
                            }`}>
                              {log.statusCode}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                            {log.responseTime}ms
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'documentation' && (
              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">API Documentation</h3>
                
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Base URL</h4>
                  <code className="bg-gray-900 dark:bg-black text-green-400 px-3 py-1 rounded">
                    https://api.mtndata.com/v1
                  </code>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Authentication</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Include your API key in the request headers:
                  </p>
                  <code className="bg-gray-900 dark:bg-black text-green-400 px-3 py-1 rounded block">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                </div>

                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 dark:border-blue-400 pl-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">GET /balance</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Get current wallet balance</p>
                  </div>
                  
                  <div className="border-l-4 border-green-500 dark:border-green-400 pl-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">POST /purchase</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Purchase data bundle</p>
                  </div>
                  
                  <div className="border-l-4 border-yellow-500 dark:border-yellow-400 pl-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">GET /transactions</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">List transaction history</p>
                  </div>
                  
                  <div className="border-l-4 border-purple-500 dark:border-purple-400 pl-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">GET /products</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">List available products</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generate API Key Modal */}
        {showGenerateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Generate API Key</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select User</label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a user</option>
                    {/* Fetch and list users without API access */}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Webhook URL (Optional)</label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://example.com/webhook"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowGenerateModal(false);
                    setSelectedUser(null);
                    setWebhookUrl('');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={generateApiKey}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
                >
                  Generate Key
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Show Credentials Modal */}
        {showCredentials && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">API Credentials Generated</h2>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Save these credentials now. The API Secret will not be shown again.
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">API Key</label>
                  <div className="flex mt-1">
                    <input
                      type="text"
                      value={showCredentials.apiKey}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => copyToClipboard(showCredentials.apiKey)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 border-l-0 rounded-r-md hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <ClipboardDocumentIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">API Secret</label>
                  <div className="flex mt-1">
                    <input
                      type="text"
                      value={showCredentials.apiSecret}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => copyToClipboard(showCredentials.apiSecret)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 border-l-0 rounded-r-md hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <ClipboardDocumentIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowCredentials(null)}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}