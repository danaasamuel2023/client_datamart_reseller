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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
    address: false,
    security: false
  });
  
  // Form States
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    businessName: '',
    taxId: ''
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
  
  // Notification Preferences
  const [notifications, setNotifications] = useState({
    email: {
      transactions: true,
      security: true,
      marketing: false,
      updates: true
    },
    sms: {
      transactions: true,
      security: true,
      marketing: false,
      updates: false
    }
  });
  
  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
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
      
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch profile');
      
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.data);
        setFormData({
          fullName: data.data.personalInfo.fullName || '',
          phone: data.data.personalInfo.phone || '',
          address: data.data.profile.address || '',
          city: data.data.profile.city || '',
          state: data.data.profile.state || '',
          postalCode: data.data.profile.postalCode || '',
          businessName: data.data.profile.businessName || '',
          taxId: data.data.profile.taxId || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };
  
  // Update personal information
  const updatePersonalInfo = async () => {
    try {
      setSaving(true);
      setError('');
      
      const token = localStorage.getItem('Token');
      
      const response = await fetch(`${API_BASE_URL}/user/profile/personal`, {
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
  
  // Update address details
  const updateAddressDetails = async () => {
    try {
      setSaving(true);
      setError('');
      
      const token = localStorage.getItem('Token');
      
      const response = await fetch(`${API_BASE_URL}/user/profile/details`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          businessName: formData.businessName,
          taxId: formData.taxId
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Address details updated successfully');
        setEditMode({ ...editMode, address: false });
        fetchProfile();
      } else {
        setError(data.message || 'Failed to update details');
      }
    } catch (error) {
      setError('Failed to update details');
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
      
      const response = await fetch(`${API_BASE_URL}/user/profile/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(passwordData)
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
      
      const response = await fetch(`${API_BASE_URL}/user/profile/pin/set`, {
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
      
      const response = await fetch(`${API_BASE_URL}/user/api-keys/generate`, {
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
          apiKey: data.data.apiKey,
          apiSecret: data.data.apiSecret,
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
                onClick={fetchProfile}
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
              <h2 className="text-2xl font-bold text-white">{profile.personalInfo.fullName}</h2>
              <div className="flex flex-wrap gap-4 mt-2">
                <span className="text-gray-400 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {profile.personalInfo.email}
                </span>
                <span className="text-gray-400 flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {profile.personalInfo.phone}
                </span>
                <span className="text-gray-400 flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {profile.account.role}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  profile.account.status === 'active' ? 'bg-green-500 bg-opacity-20 text-green-400' : 'bg-gray-600 text-gray-300'
                }`}>
                  {profile.account.status}
                </span>
                {profile.personalInfo.emailVerified && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500 bg-opacity-20 text-blue-400 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Email Verified
                  </span>
                )}
                {profile.account.twoFactorEnabled && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500 bg-opacity-20 text-purple-400 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    2FA Enabled
                  </span>
                )}
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Wallet Balance</p>
              <p className="text-2xl font-bold text-yellow-400">{formatAmount(profile.wallet.balance)}</p>
              <p className="text-xs text-gray-500 mt-1">Account age: {profile.stats.accountAge}</p>
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
            <p className="text-xl font-bold text-white">{profile.stats.totalTransactions}</p>
            <p className="text-xs text-gray-400">Transactions</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-xs text-gray-500">Success</span>
            </div>
            <p className="text-xl font-bold text-white">{profile.stats.successfulTransactions}</p>
            <p className="text-xs text-gray-400">Completed</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-gray-500">Spent</span>
            </div>
            <p className="text-xl font-bold text-white">{formatAmount(profile.stats.totalSpent)}</p>
            <p className="text-xs text-gray-400">Total</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-gray-500">Referrals</span>
            </div>
            <p className="text-xl font-bold text-white">{profile.referral.referralCount}</p>
            <p className="text-xs text-gray-400">Users</p>
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
          <button
            onClick={() => setActiveTab('referrals')}
            className={`px-4 py-2 font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'referrals'
                ? 'bg-yellow-400 text-gray-900'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Referrals
          </button>
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
                          ...formData,
                          fullName: profile.personalInfo.fullName,
                          phone: profile.personalInfo.phone
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
                    <p className="text-white">{profile.personalInfo.fullName}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Email</label>
                  <p className="text-white flex items-center gap-2">
                    {profile.personalInfo.email}
                    {profile.personalInfo.emailVerified && (
                      <span className="text-green-400">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </p>
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
                    <p className="text-white">{profile.personalInfo.phone}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Account Type</label>
                  <p className="text-white capitalize">{profile.account.role}</p>
                </div>
                
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Member Since</label>
                  <p className="text-white">{formatDate(profile.personalInfo.createdAt)}</p>
                </div>
                
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Last Login</label>
                  <p className="text-white">{formatDate(profile.personalInfo.lastLogin)}</p>
                </div>
              </div>
              
              {/* Address Section */}
              <div className="border-t border-gray-700 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-white">Address Details</h4>
                  {!editMode.address ? (
                    <button
                      onClick={() => setEditMode({ ...editMode, address: true })}
                      className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={updateAddressDetails}
                        disabled={saving}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditMode({ ...editMode, address: false });
                          setFormData({
                            ...formData,
                            address: profile.profile.address || '',
                            city: profile.profile.city || '',
                            state: profile.profile.state || '',
                            postalCode: profile.profile.postalCode || ''
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
                  <div className="md:col-span-2">
                    <label className="text-gray-400 text-sm mb-2 block">Street Address</label>
                    {editMode.address ? (
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Enter your street address"
                      />
                    ) : (
                      <p className="text-white">{profile.profile.address || 'Not provided'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">City</label>
                    {editMode.address ? (
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Enter city"
                      />
                    ) : (
                      <p className="text-white">{profile.profile.city || 'Not provided'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">State/Region</label>
                    {editMode.address ? (
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Enter state"
                      />
                    ) : (
                      <p className="text-white">{profile.profile.state || 'Not provided'}</p>
                    )}
                  </div>
                  
                  {profile.account.role !== 'agent' && (
                    <>
                      <div>
                        <label className="text-gray-400 text-sm mb-2 block">Business Name</label>
                        {editMode.address ? (
                          <input
                            type="text"
                            value={formData.businessName}
                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="Enter business name"
                          />
                        ) : (
                          <p className="text-white">{profile.profile.businessName || 'Not provided'}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="text-gray-400 text-sm mb-2 block">Tax ID</label>
                        {editMode.address ? (
                          <input
                            type="text"
                            value={formData.taxId}
                            onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="Enter tax ID"
                          />
                        ) : (
                          <p className="text-white">{profile.profile.taxId || 'Not provided'}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
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
              <div className="border-b border-gray-700 pb-6">
                <h4 className="text-lg font-semibold text-white mb-4">Transaction PIN</h4>
                {profile.wallet.pinEnabled ? (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-green-400 flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      Transaction PIN is enabled
                    </p>
                    <p className="text-gray-400 text-sm mt-2">Your transactions are secured with a PIN</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-400 mb-4">Set a 4-digit PIN for transaction security</p>
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
                        <label className="text-gray-400 text-sm mb-2 block">Password</label>
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
                )}
              </div>
              
              {/* Two-Factor Authentication */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h4>
                {profile.account.twoFactorEnabled ? (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-green-400 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      2FA is enabled
                    </p>
                    <p className="text-gray-400 text-sm mt-2">Your account is protected with two-factor authentication</p>
                    <button className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                      Disable 2FA
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-400 mb-4">Add an extra layer of security to your account</p>
                    <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                      Enable 2FA
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Wallet Tab */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">Wallet Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2">Available Balance</p>
                  <p className="text-2xl font-bold text-yellow-400">{formatAmount(profile.wallet.balance)}</p>
                </div>
                {profile.wallet.bonus > 0 && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-2">Bonus Balance</p>
                    <p className="text-2xl font-bold text-green-400">{formatAmount(profile.wallet.bonus)}</p>
                  </div>
                )}
                {profile.wallet.commission > 0 && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-2">Commission Earned</p>
                    <p className="text-2xl font-bold text-blue-400">{formatAmount(profile.wallet.commission)}</p>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Wallet Security</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Transaction PIN</p>
                    <p className="text-sm text-gray-500">Required for all transactions</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profile.wallet.pinEnabled 
                      ? 'bg-green-500 bg-opacity-20 text-green-400' 
                      : 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                  }`}>
                    {profile.wallet.pinEnabled ? 'Enabled' : 'Not Set'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* API Access Tab */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">API Access</h3>
              
              {profile.apiAccess.enabled ? (
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-white">API Credentials</h4>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500 bg-opacity-20 text-green-400">
                        Active
                      </span>
                    </div>
                    
                    <div className="space-y-3">
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
                      
                      <div>
                        <label className="text-gray-400 text-sm mb-1 block">Webhook URL</label>
                        <input
                          type="url"
                          value={profile.apiAccess.webhookUrl || ''}
                          placeholder="https://your-domain.com/webhook"
                          className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-700 rounded-lg p-3">
                      <p className="text-gray-400 text-sm">Requests</p>
                      <p className="text-xl font-bold text-white">{profile.apiAccess.requestCount}</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <p className="text-gray-400 text-sm">Rate Limit</p>
                      <p className="text-xl font-bold text-white">100/hour</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <p className="text-gray-400 text-sm">Last Used</p>
                      <p className="text-sm text-white">
                        {profile.apiAccess.lastUsed ? formatDate(profile.apiAccess.lastUsed) : 'Never'}
                      </p>
                    </div>
                  </div>
                  
                  <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                    Regenerate Secret
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
          
          {/* Referrals Tab */}
          {activeTab === 'referrals' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">Referral Program</h3>
              
              <div className="bg-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">Your Referral Code</h4>
                  <UserPlus className="w-6 h-6 text-yellow-400" />
                </div>
                
                {profile.referral.referralCode ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={profile.referral.referralCode}
                        readOnly
                        className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-lg font-bold text-lg text-center"
                      />
                      <button
                        onClick={() => copyToClipboard(profile.referral.referralCode, 'Referral code')}
                        className="px-4 py-3 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Referral Link</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={`https://platform.com/register?ref=${profile.referral.referralCode}`}
                          readOnly
                          className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-lg text-sm"
                        />
                        <button
                          onClick={() => copyToClipboard(`https://platform.com/register?ref=${profile.referral.referralCode}`, 'Referral link')}
                          className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                        >
                          <Link2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-400 mb-4">Generate your unique referral code to start earning</p>
                    <button className="px-4 py-2 bg-yellow-400 text-gray-900 font-medium rounded-lg hover:bg-yellow-500 transition-colors">
                      Generate Referral Code
                    </button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Total Referrals</p>
                  <p className="text-2xl font-bold text-white">{profile.referral.referralCount}</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Total Earned</p>
                  <p className="text-2xl font-bold text-green-400">{formatAmount(profile.referral.referralEarnings)}</p>
                </div>
              </div>
              
              {profile.referral.referredBy && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Referred By</p>
                  <p className="text-white font-medium">{profile.referral.referredBy.name}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}