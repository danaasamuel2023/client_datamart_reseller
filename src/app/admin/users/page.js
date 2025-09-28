'use client'
import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  PencilSquareIcon,
  TrashIcon,
  KeyIcon,
  WalletIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon,
  PauseCircleIcon,
  PlusCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  ClipboardDocumentIcon,
  SunIcon,
  MoonIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function UserManagementPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [copiedText, setCopiedText] = useState('');
  const [error, setError] = useState(null);
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showGeneratedCredentials, setShowGeneratedCredentials] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form states
  const [editForm, setEditForm] = useState({});
  const [walletForm, setWalletForm] = useState({ amount: '', type: 'credit', reason: '' });
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'agent',
    status: 'active'
  });
  const [apiKeyForm, setApiKeyForm] = useState({ webhookUrl: '' });
  const [generatedCredentials, setGeneratedCredentials] = useState(null);

  const SERVER_URL = 'https://server-datamart-reseller.onrender.com';

  useEffect(() => {
    // Check for saved dark mode preference
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
    fetchUsers();
  }, [currentPage, searchTerm, roleFilter, statusFilter, sortBy, sortOrder]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('Token');
      
      if (!token) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter })
      });
      
      const response = await fetch(`${SERVER_URL}/api/admin/users?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
          // Optionally redirect to login
          // window.location.href = '/login';
          return;
        }
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
        setTotalPages(data.pagination.pages);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error fetching users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus, reason = '') => {
    try {
      const token = localStorage.getItem('Token');
      const response = await fetch(`${SERVER_URL}/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus, reason })
      });

      const data = await response.json();
      if (data.success) {
        alert(`User ${newStatus} successfully`);
        fetchUsers();
      } else {
        alert(data.message || 'Error updating user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Error updating user status');
    }
  };

  const handleEditUser = async () => {
    try {
      const token = localStorage.getItem('Token');
      const response = await fetch(`${SERVER_URL}/api/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();
      if (data.success) {
        alert('User updated successfully');
        setShowEditModal(false);
        fetchUsers();
      } else {
        alert(data.message || 'Error updating user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    }
  };

  const handleWalletAdjustment = async () => {
    if (!walletForm.amount || !walletForm.reason) {
      alert('Please provide amount and reason');
      return;
    }

    try {
      const token = localStorage.getItem('Token');
      const response = await fetch(`${SERVER_URL}/api/admin/wallet/adjust`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: selectedUser._id,
          amount: parseFloat(walletForm.amount),
          type: walletForm.type,
          reason: walletForm.reason
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Wallet adjusted successfully');
        setShowWalletModal(false);
        setWalletForm({ amount: '', type: 'credit', reason: '' });
        fetchUsers();
      } else {
        alert(data.message || 'Error adjusting wallet');
      }
    } catch (error) {
      console.error('Error adjusting wallet:', error);
      alert('Error adjusting wallet');
    }
  };

  const handlePasswordReset = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      const token = localStorage.getItem('Token');
      const response = await fetch(`${SERVER_URL}/api/admin/users/${selectedUser._id}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword: passwordForm.newPassword })
      });

      const data = await response.json();
      if (data.success) {
        alert('Password reset successfully');
        setShowPasswordModal(false);
        setPasswordForm({ newPassword: '', confirmPassword: '' });
      } else {
        alert(data.message || 'Error resetting password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Error resetting password');
    }
  };

  const handleGenerateApiKey = async () => {
    try {
      const token = localStorage.getItem('Token');
      
      if (!token) {
        alert('Authentication token not found. Please log in again.');
        return;
      }
      
      const response = await fetch(`${SERVER_URL}/api/admin/users/${selectedUser._id}/generate-api-key`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ webhookUrl: apiKeyForm.webhookUrl })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setGeneratedCredentials(data.data);
        setShowApiKeyModal(false);
        setShowGeneratedCredentials(true);
        setApiKeyForm({ webhookUrl: '' });
        fetchUsers();
      } else {
        alert(data.message || 'Error generating API key');
      }
    } catch (error) {
      console.error('Error generating API key:', error);
      alert('Error generating API key. Please try again.');
    }
  };

  const handleRegenerateApiKey = async () => {
    if (!confirm('Are you sure you want to regenerate the API key? The current key will be invalidated.')) return;

    try {
      const token = localStorage.getItem('Token');
      const response = await fetch(`${SERVER_URL}/api/admin/users/${selectedUser._id}/regenerate-api-key`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ webhookUrl: apiKeyForm.webhookUrl })
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedCredentials(data.data);
        setShowRegenerateModal(false);
        setShowGeneratedCredentials(true);
        setApiKeyForm({ webhookUrl: '' });
        fetchUsers();
      } else {
        alert(data.message || 'Error regenerating API key');
      }
    } catch (error) {
      console.error('Error regenerating API key:', error);
      alert('Error regenerating API key');
    }
  };

  const handleRevokeApiAccess = async (userId) => {
    if (!confirm('Are you sure you want to revoke API access for this user?')) return;

    try {
      const token = localStorage.getItem('Token');
      const response = await fetch(`${SERVER_URL}/api/admin/users/${userId}/revoke-api-access`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        alert('API access revoked successfully');
        fetchUsers();
      } else {
        alert(data.message || 'Error revoking API access');
      }
    } catch (error) {
      console.error('Error revoking API access:', error);
      alert('Error revoking API access');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('Token');
      const response = await fetch(`${SERVER_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        alert('User deleted successfully');
        fetchUsers();
      } else {
        alert(data.message || 'Error deleting user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem('Token');
      const response = await fetch(`${SERVER_URL}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createForm)
      });

      const data = await response.json();
      if (data.success) {
        alert('User created successfully');
        setShowCreateModal(false);
        setCreateForm({
          fullName: '',
          email: '',
          phone: '',
          password: '',
          role: 'agent',
          status: 'active'
        });
        fetchUsers();
      } else {
        alert(data.message || 'Error creating user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user');
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(''), 2000);
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

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'supplier': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'dealer': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'agent': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
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
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage all platform users and their permissions</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchUsers}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
              >
                <PlusCircleIcon className="h-5 w-5 mr-2" />
                Create User
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 rounded">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 transition-colors duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="supplier">Supplier</option>
              <option value="dealer">Dealer</option>
              <option value="agent">Agent</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
            
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="fullName-asc">Name A-Z</option>
              <option value="fullName-desc">Name Z-A</option>
              <option value="wallet.balance-desc">Highest Balance</option>
              <option value="wallet.balance-asc">Lowest Balance</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Wallet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    API
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.fullName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">ID: {user._id.slice(-8)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900 dark:text-gray-200">{user.email}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          GHS {user.wallet?.balance?.toFixed(2) || '0.00'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.status}
                          onChange={(e) => handleStatusChange(user._id, e.target.value)}
                          className={`text-xs rounded-full px-2 py-1 border-0 ${getStatusBadgeColor(user.status)}`}
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                          <option value="pending">Pending</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {user.apiAccess?.enabled ? (
                            <>
                              <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400" />
                              <div className="flex flex-col space-y-1">
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowRegenerateModal(true);
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                  Regenerate
                                </button>
                                <button
                                  onClick={() => handleRevokeApiAccess(user._id)}
                                  className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  Revoke
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowApiKeyModal(true);
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                Enable
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDetailsModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setEditForm({
                                fullName: user.fullName,
                                email: user.email,
                                phone: user.phone,
                                role: user.role
                              });
                              setShowEditModal(true);
                            }}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Edit User"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowWalletModal(true);
                            }}
                            className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                            title="Adjust Wallet"
                          >
                            <WalletIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowPasswordModal(true);
                            }}
                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                            title="Reset Password"
                          >
                            <LockClosedIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete User"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 flex items-center justify-between sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create New User</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                  <input
                    type="text"
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm({...createForm, fullName: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                  <input
                    type="tel"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({...createForm, phone: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="+233XXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({...createForm, role: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  >
                    <option value="agent">Agent</option>
                    <option value="dealer">Dealer</option>
                    <option value="supplier">Supplier</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({...createForm, status: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUser}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Create User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Edit User</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                  <input
                    type="text"
                    value={editForm.fullName || ''}
                    onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                  <select
                    value={editForm.role || ''}
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  >
                    <option value="agent">Agent</option>
                    <option value="dealer">Dealer</option>
                    <option value="supplier">Supplier</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditForm({});
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditUser}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Adjustment Modal */}
        {showWalletModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
                <WalletIcon className="h-6 w-6 mr-2 text-purple-600 dark:text-purple-400" />
                Adjust Wallet Balance
              </h2>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Current balance for {selectedUser.fullName}: <span className="font-bold text-gray-900 dark:text-white">GHS {selectedUser.wallet?.balance?.toFixed(2) || '0.00'}</span>
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={walletForm.amount}
                    onChange={(e) => setWalletForm({...walletForm, amount: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                  <select
                    value={walletForm.type}
                    onChange={(e) => setWalletForm({...walletForm, type: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  >
                    <option value="credit">Credit (Add)</option>
                    <option value="debit">Debit (Subtract)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
                  <textarea
                    value={walletForm.reason}
                    onChange={(e) => setWalletForm({...walletForm, reason: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    rows="3"
                    placeholder="Enter reason for adjustment..."
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowWalletModal(false);
                    setWalletForm({ amount: '', type: 'credit', reason: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWalletAdjustment}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
                >
                  Adjust Balance
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Password Reset Modal */}
        {showPasswordModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
                <LockClosedIcon className="h-6 w-6 mr-2 text-yellow-600 dark:text-yellow-400" />
                Reset Password
              </h2>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Reset password for: <span className="font-semibold text-gray-900 dark:text-white">{selectedUser.fullName}</span>
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({ newPassword: '', confirmPassword: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordReset}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {showDetailsModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
                <UserGroupIcon className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
                User Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{selectedUser.fullName}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</label>
                  <p className="mt-1 text-gray-900 dark:text-white font-mono text-sm">{selectedUser._id}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{selectedUser.email}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{selectedUser.phone}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</label>
                  <p className="mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(selectedUser.role)}`}>
                      {selectedUser.role.toUpperCase()}
                    </span>
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <p className="mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(selectedUser.status)}`}>
                      {selectedUser.status.toUpperCase()}
                    </span>
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Wallet Balance</label>
                  <p className="mt-1 text-gray-900 dark:text-white font-semibold">
                    GHS {selectedUser.wallet?.balance?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Transactions</label>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {selectedUser.wallet?.totalTransactions || 0}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">API Access</label>
                  <p className="mt-1">
                    {selectedUser.apiAccess?.enabled ? (
                      <span className="flex items-center text-green-600 dark:text-green-400">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Enabled
                      </span>
                    ) : (
                      <span className="flex items-center text-gray-500 dark:text-gray-400">
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        Disabled
                      </span>
                    )}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</label>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Created</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{formatDate(selectedUser.updatedAt)}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generate API Key Modal */}
        {showApiKeyModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
                <KeyIcon className="h-6 w-6 mr-2 text-purple-600 dark:text-purple-400" />
                Generate API Key
              </h2>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Generate API credentials for: <span className="font-semibold text-gray-900 dark:text-white">{selectedUser.fullName}</span>
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Webhook URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={apiKeyForm.webhookUrl}
                    onChange={(e) => setApiKeyForm({...apiKeyForm, webhookUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="https://example.com/webhook"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    URL to receive webhook notifications for API events
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowApiKeyModal(false);
                    setApiKeyForm({ webhookUrl: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateApiKey}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
                >
                  Generate API Key
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Regenerate API Key Modal */}
        {showRegenerateModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
                <KeyIcon className="h-6 w-6 mr-2 text-purple-600 dark:text-purple-400" />
                Regenerate API Key
              </h2>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-4 rounded">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Warning:</strong> Regenerating will invalidate the current API credentials. The user will need to update their integration with new credentials.
                </p>
              </div>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Regenerate API credentials for: <span className="font-semibold text-gray-900 dark:text-white">{selectedUser.fullName}</span>
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Webhook URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={apiKeyForm.webhookUrl}
                    onChange={(e) => setApiKeyForm({...apiKeyForm, webhookUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="https://example.com/webhook"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Leave empty to keep existing webhook URL
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRegenerateModal(false);
                    setApiKeyForm({ webhookUrl: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegenerateApiKey}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
                >
                  Regenerate API Key
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Show Generated Credentials Modal */}
        {showGeneratedCredentials && generatedCredentials && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
              <div className="flex items-center mb-4">
                <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">API Credentials Generated</h2>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6 rounded">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Important:</strong> Save these credentials now. The API Secret will not be shown again for security reasons.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={generatedCredentials.apiKey}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-md font-mono text-sm text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => copyToClipboard(generatedCredentials.apiKey, 'apiKey')}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-600 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md hover:bg-gray-200 dark:hover:bg-gray-500"
                    >
                      {copiedText === 'apiKey' ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <ClipboardDocumentIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Secret</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={generatedCredentials.apiSecret}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-md font-mono text-sm text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => copyToClipboard(generatedCredentials.apiSecret, 'apiSecret')}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-600 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md hover:bg-gray-200 dark:hover:bg-gray-500"
                    >
                      {copiedText === 'apiSecret' ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <ClipboardDocumentIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {generatedCredentials.webhookUrl && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Webhook URL</label>
                    <input
                      type="text"
                      value={generatedCredentials.webhookUrl}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowGeneratedCredentials(false);
                    setGeneratedCredentials(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
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