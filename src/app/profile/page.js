'use client';
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Wallet, 
  Shield, 
  Key,
  Bell,
  Users,
  Edit,
  Save,
  X,
  Check,
  AlertCircle,
  Loader2,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  CreditCard,
  TrendingUp,
  Lock,
  Smartphone,
  Building,
  Globe,
  Award,
  Settings,
  LogOut,
  Calendar,
  DollarSign,
  Link2,
  UserPlus,
  Activity,
  FileText
} from 'lucide-react';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://server-datamart-reseller.onrender.com/api';

export default function UserProfile() {
  // State Management
  const [activeTab, setActiveTab] = useState('personal');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Edit States
  const [editMode, setEditMode] = useState({
    personal: false,
    security: false
  });
  
  // Form States
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: ''
  });
  
  // Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // PIN Management
  const [pinData, setPinData] = useState({
    pin: '',
    password: '',
    showPin: false
  });
  
  // API Key Management
  const [apiKeyData, setApiKeyData] = useState({
    apiKey: '',
    apiSecret: '',
    webhookUrl: '',
    showSecret: false
  });
  
  // Statistics (will be fetched separately if needed)
  const [stats, setStats] = useState({
    totalTransactions: 0,
    successfulTransactions: 0,
    totalSpent: 0,
    accountAge: 'N/A'
  });
  
  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);
  
  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('Token');
      if (!token) {
        setError('Please login to view profile');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      console.log('Profile API Response:', data); // Debug log
      
      if (data.success) {
        // Handle both nested and flat data structures
        const userData = data.data || data.user || data;
        setProfile(userData);
        
        // Update form data based on actual structure
        setFormData({
          fullName: userData.fullName || '',
          phone: userData.phone || '',
          email: userData.email || ''
        });
        
        // Update API key data if available
        if (userData.apiAccess) {
          setApiKeyData({
            ...apiKeyData,
            apiKey: userData.apiAccess.apiKey || '',
            webhookUrl: userData.apiAccess.webhookUrl || ''
          });
        }
      } else {
        setError(data.message || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('Token');
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/auth/stats`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats || {
            totalTransactions: 0,
            successfulTransactions: 0,
            totalSpent: 0,
            accountAge: 'N/A'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  
  // Update personal information
  const updatePersonalInfo = async () => {
    try {
      setSaving(true);
      setError('');
      
      const token = localStorage.getItem('Token');
      
      const response = await fetch(`${API_BASE_URL}/auth/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Personal information updated successfully');
        setEditMode({ ...editMode, personal: false });
        fetchProfile();
      } else {
        setError(data.message || 'Failed to update information');
      }
    } catch (error) {
      setError('Failed to update information');
    } finally {
      setSaving(false);
    }
  };
  
  // Change password
  const changePassword = async () => {
    try {
      setSaving(true);
      setError('');
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }
      
      const token = localStorage.getItem('Token');
      
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (error) {
      setError('Failed to change password');
    } finally {
      setSaving(false);
    }
  };
  
  // Set transaction PIN
  const setTransactionPin = async () => {
    try {
      setSaving(true);
      setError('');
      
      if (!/^\d{4}$/.test(pinData.pin)) {
        setError('PIN must be exactly 4 digits');
        return;
      }
      
      const token = localStorage.getItem('Token');
      
      const response = await fetch(`${API_BASE_URL}/auth/set-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          pin: pinData.pin,
          password: pinData.password
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Transaction PIN set successfully');
        setPinData({
          pin: '',
          password: '',
          showPin: false
        });
        fetchProfile();
      } else {
        setError(data.message || 'Failed to set PIN');
      }
    } catch (error) {
      setError('Failed to set PIN');
    } finally {
      setSaving(false);
    }
  };
  
  // Generate API key
  const generateApiKey = async () => {
    try {
      setSaving(true);
      setError('');
      
      const password = prompt('Enter your password to generate API key:');
      if (!password) return;
      
      const token = localStorage.getItem('Token');
      
      const response = await fetch(`${API_BASE_URL}/auth/generate-api-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          password: password,
          webhookUrl: apiKeyData.webhookUrl
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setApiKeyData({
          ...apiKeyData,
          apiKey: data.apiKey,
          apiSecret: data.apiSecret,
          showSecret: true
        });
        setSuccess('API credentials generated successfully. Save your secret key securely!');
        fetchProfile();
      } else {
        setError(data.message || 'Failed to generate API key');
      }
    } catch (error) {
      setError('Failed to generate API key');
    } finally {
      setSaving(false);
    }
  };
  
  // Copy to clipboard
  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setSuccess(`${type} copied to clipboard`);
    setTimeout(() => setSuccess(''), 3000);
  };
  
  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Format amount
  const formatAmount = (amount) => {
    return `GHS ${(amount || 0).toFixed(2)}`;
  };
  
  // Calculate account age
  const getAccountAge = (createdAt) => {
    if (!createdAt) return 'N/A';
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#2a2d3a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-yellow-400 mx-auto mb-4" />
          <p className="text-white text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#2a2d3a] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-white text-lg">Failed to load profile</p>
          <button
            onClick={fetchProfile}
            className="mt-4 px-4 py-2 bg-yellow-400 text-gray-900 font-medium rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Retry
          </button>
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
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                <User className="w-8 h-8 text-yellow-400" />
                User Profile
              </h1>
              <p className="text-gray-400 mt-1">Manage your account settings and preferences</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  fetchProfile();
                  fetchStats();
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile Overview */}
      <div className="container mx-auto px-4 py-6">
        {/* User Summary Card */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-gray-900" />
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{profile.fullName || 'User'}</h2>
              <div className="flex flex-wrap gap-4 mt-2">
                <span className="text-gray-400 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {profile.email}
                </span>
                <span className="text-gray-400 flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {profile.phone}
                </span>
                <span className="text-gray-400 flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {profile.role}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  profile.status === 'active' ? 'bg-green-500 bg-opacity-20 text-green-400' : 
                  profile.status === 'pending' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
                  'bg-red-500 bg-opacity-20 text-red-400'
                }`}>
                  {profile.status}
                </span>
                {profile.wallet?.locked && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500 bg-opacity-20 text-red-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Wallet Locked
                  </span>
                )}
                {profile.apiAccess?.enabled && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500 bg-opacity-20 text-blue-400 flex items-center gap-1">
                    <Key className="w-3 h-3" />
                    API Enabled
                  </span>
                )}
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Wallet Balance</p>
              <p className="text-2xl font-bold text-yellow-400">{formatAmount(profile.wallet?.balance)}</p>
              <p className="text-xs text-gray-500 mt-1">
                Account age: {getAccountAge(profile.createdAt)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-yellow-400" />
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <p className="text-xl font-bold text-white">{stats.totalTransactions}</p>
            <p className="text-xs text-gray-400">Transactions</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-xs text-gray-500">Success</span>
            </div>
            <p className="text-xl font-bold text-white">{stats.successfulTransactions}</p>
            <p className="text-xs text-gray-400">Completed</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-gray-500">Spent</span>
            </div>
            <p className="text-xl font-bold text-white">{formatAmount(stats.totalSpent)}</p>
            <p className="text-xs text-gray-400">Total</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-gray-500">Member</span>
            </div>
            <p className="text-sm font-bold text-white">
              {formatDate(profile.createdAt)}
            </p>
            <p className="text-xs text-gray-400">Since</p>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-4 py-2 font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'personal'
                ? 'bg-yellow-400 text-gray-900'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Personal Info
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-yellow-400 text-gray-900'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-4 py-2 font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'wallet'
                ? 'bg-yellow-400 text-gray-900'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Wallet
          </button>
          {profile.role !== 'agent' && (
            <button
              onClick={() => setActiveTab('api')}
              className={`px-4 py-2 font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'api'
                  ? 'bg-yellow-400 text-gray-900'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              API Access
            </button>
          )}
        </div>
        
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-500 bg-opacity-10 border border-green-500 rounded-lg">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <p className="text-green-500">{success}</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-500">{error}</p>
            </div>
          </div>
        )}
        
        {/* Tab Content */}
        <div className="bg-gray-800 rounded-lg p-6">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Personal Information</h3>
                {!editMode.personal ? (
                  <button
                    onClick={() => setEditMode({ ...editMode, personal: true })}
                    className="px-3 py-1 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={updatePersonalInfo}
                      disabled={saving}
                      className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditMode({ ...editMode, personal: false });
                        setFormData({
                          fullName: profile.fullName || '',
                          phone: profile.phone || '',
                          email: profile.email || ''
                        });
                      }}
                      className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Full Name</label>
                  {editMode.personal ? (
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  ) : (
                    <p className="text-white">{profile.fullName}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Email</label>
                  <p className="text-white">{profile.email}</p>
                </div>
                
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Phone</label>
                  {editMode.personal ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  ) : (
                    <p className="text-white">{profile.phone}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Account Type</label>
                  <p className="text-white capitalize">{profile.role}</p>
                </div>
                
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Account Status</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    profile.status === 'active' ? 'bg-green-500 bg-opacity-20 text-green-400' : 
                    profile.status === 'pending' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
                    'bg-red-500 bg-opacity-20 text-red-400'
                  }`}>
                    {profile.status}
                  </span>
                </div>
                
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Member Since</label>
                  <p className="text-white">{formatDate(profile.createdAt)}</p>
                </div>
                
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Last Login</label>
                  <p className="text-white">{formatDate(profile.lastLogin)}</p>
                </div>
                
                {profile.createdBy && (
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Created By</label>
                    <p className="text-white">Admin</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">Security Settings</h3>
              
              {/* Change Password */}
              <div className="border-b border-gray-700 pb-6">
                <h4 className="text-lg font-semibold text-white mb-4">Change Password</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Confirm Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>
                <button
                  onClick={changePassword}
                  disabled={saving || !passwordData.currentPassword || !passwordData.newPassword}
                  className="mt-4 px-4 py-2 bg-yellow-400 text-gray-900 font-medium rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
                >
                  Update Password
                </button>
              </div>
              
              {/* Transaction PIN */}
              <div className="pb-6">
                <h4 className="text-lg font-semibold text-white mb-4">Transaction PIN</h4>
                <p className="text-gray-400 mb-4">Set a 4-digit PIN for additional transaction security</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">4-Digit PIN</label>
                    <div className="relative">
                      <input
                        type={pinData.showPin ? "text" : "password"}
                        value={pinData.pin}
                        onChange={(e) => setPinData({ ...pinData, pin: e.target.value })}
                        maxLength="4"
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="••••"
                      />
                      <button
                        type="button"
                        onClick={() => setPinData({ ...pinData, showPin: !pinData.showPin })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {pinData.showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Password Confirmation</label>
                    <input
                      type="password"
                      value={pinData.password}
                      onChange={(e) => setPinData({ ...pinData, password: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>
                <button
                  onClick={setTransactionPin}
                  disabled={saving || !pinData.pin || !pinData.password}
                  className="mt-4 px-4 py-2 bg-yellow-400 text-gray-900 font-medium rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
                >
                  Set PIN
                </button>
              </div>
            </div>
          )}
          
          {/* Wallet Tab */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">Wallet Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2">Available Balance</p>
                  <p className="text-2xl font-bold text-yellow-400">{formatAmount(profile.wallet?.balance)}</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2">Currency</p>
                  <p className="text-2xl font-bold text-white">{profile.wallet?.currency || 'GHS'}</p>
                </div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Wallet Status</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Wallet Lock Status</p>
                    <p className="text-sm text-gray-500">Prevents transactions when locked</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profile.wallet?.locked 
                      ? 'bg-red-500 bg-opacity-20 text-red-400' 
                      : 'bg-green-500 bg-opacity-20 text-green-400'
                  }`}>
                    {profile.wallet?.locked ? 'Locked' : 'Active'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* API Access Tab */}
          {activeTab === 'api' && profile.role !== 'agent' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">API Access</h3>
              
              {profile.apiAccess?.enabled ? (
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-white">API Credentials</h4>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500 bg-opacity-20 text-green-400">
                        Active
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {profile.apiAccess.apiKey && (
                        <div>
                          <label className="text-gray-400 text-sm mb-1 block">API Key</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={profile.apiAccess.apiKey}
                              readOnly
                              className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-lg font-mono text-sm"
                            />
                            <button
                              onClick={() => copyToClipboard(profile.apiAccess.apiKey, 'API Key')}
                              className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {apiKeyData.apiSecret && (
                        <div className="p-3 bg-yellow-500 bg-opacity-10 border border-yellow-500 rounded-lg">
                          <p className="text-yellow-400 text-sm font-medium mb-2">⚠️ Save this secret key securely!</p>
                          <div className="flex items-center gap-2">
                            <input
                              type={apiKeyData.showSecret ? "text" : "password"}
                              value={apiKeyData.apiSecret}
                              readOnly
                              className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-lg font-mono text-sm"
                            />
                            <button
                              onClick={() => copyToClipboard(apiKeyData.apiSecret, 'API Secret')}
                              className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {profile.apiAccess.webhookUrl && (
                        <div>
                          <label className="text-gray-400 text-sm mb-1 block">Webhook URL</label>
                          <input
                            type="url"
                            value={profile.apiAccess.webhookUrl}
                            readOnly
                            className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                    Regenerate Credentials
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Key className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-white mb-2">API Access Not Enabled</h4>
                  <p className="text-gray-400 mb-6">Generate API credentials to integrate with your applications</p>
                  <div className="max-w-md mx-auto">
                    <input
                      type="url"
                      value={apiKeyData.webhookUrl}
                      onChange={(e) => setApiKeyData({ ...apiKeyData, webhookUrl: e.target.value })}
                      placeholder="Webhook URL (optional)"
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg mb-4"
                    />
                    <button
                      onClick={generateApiKey}
                      className="px-6 py-2 bg-yellow-400 text-gray-900 font-medium rounded-lg hover:bg-yellow-500 transition-colors"
                    >
                      Generate API Key
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}