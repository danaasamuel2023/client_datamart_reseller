'use client';

import { useState, useEffect } from 'react';
import { 
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BellIcon,
  KeyIcon,
  CurrencyDollarIcon,
  DevicePhoneMobileIcon,
  CloudIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  ChartBarIcon,
  ServerIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [saveStatus, setSaveStatus] = useState('');
  const [exportSettings, setExportSettings] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [exportHistory, setExportHistory] = useState([]);

  useEffect(() => {
    fetchSettings();
    fetchExportSettings();
    fetchSystemStatus();
    fetchExportHistory();
    
    // Refresh system status every 30 seconds
    const interval = setInterval(fetchSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('Token');
      
      const response = await fetch('https://server-datamart-reseller.onrender.com/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        const settingsObj = {};
        data.data.forEach(setting => {
          settingsObj[setting.key] = setting.value;
        });
        setSettings(settingsObj);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExportSettings = async () => {
    try {
      const token = localStorage.getItem('Token');
      const response = await fetch('https://server-datamart-reseller.onrender.com/api/admin/export-settings/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setExportSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching export settings:', error);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const token = localStorage.getItem('Token');
      const response = await fetch('https://server-datamart-reseller.onrender.com/api/admin/system-status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setSystemStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };

  const fetchExportHistory = async () => {
    try {
      const token = localStorage.getItem('Token');
      const response = await fetch('https://server-datamart-reseller.onrender.com/api/admin/export-history?limit=5', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setExportHistory(data.data);
      }
    } catch (error) {
      console.error('Error fetching export history:', error);
    }
  };

  const updateSetting = async (key, value, category = 'general') => {
    try {
      const token = localStorage.getItem('Token');
      const response = await fetch(`https://server-datamart-reseller.onrender.com/api/admin/settings/${key}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value, category })
      });

      const data = await response.json();
      if (data.success) {
        setSettings(prev => ({ ...prev, [key]: value }));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      setSaveStatus('error');
    }
  };

  const updateExportSettings = async (updates) => {
    try {
      const token = localStorage.getItem('Token');
      const response = await fetch('https://server-datamart-reseller.onrender.com/api/admin/export-settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...exportSettings?.settings,
          ...updates,
          isActive: true
        })
      });

      const data = await response.json();
      if (data.success) {
        setExportSettings(prev => ({
          ...prev,
          settings: data.data
        }));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (error) {
      console.error('Error updating export settings:', error);
      setSaveStatus('error');
    }
  };

  const toggleMaintenanceMode = async () => {
    try {
      const token = localStorage.getItem('Token');
      const maintenanceMode = settings.maintenance_mode === 'true';
      const response = await fetch('https://server-datamart-reseller.onrender.com/api/admin/settings/maintenance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enabled: !maintenanceMode,
          message: settings.maintenance_message || 'System is under maintenance'
        })
      });

      const data = await response.json();
      if (data.success) {
        setSettings(prev => ({
          ...prev,
          maintenance_mode: (!maintenanceMode).toString()
        }));
        alert(`Maintenance mode ${!maintenanceMode ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
    }
  };

  const settingsTabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'export', name: 'Export Settings', icon: DocumentArrowDownIcon },
    { id: 'api', name: 'API Settings', icon: KeyIcon },
    { id: 'payment', name: 'Payment', icon: CurrencyDollarIcon },
    { id: 'sms', name: 'SMS Config', icon: DevicePhoneMobileIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'system', name: 'System Status', icon: ServerIcon }
  ];

  const generalSettings = [
    { key: 'site_name', label: 'Site Name', type: 'text', default: 'MTN Data Platform' },
    { key: 'site_url', label: 'Site URL', type: 'url', default: 'https://example.com' },
    { key: 'admin_email', label: 'Admin Email', type: 'email', default: 'admin@example.com' },
    { key: 'support_email', label: 'Support Email', type: 'email', default: 'support@example.com' },
    { key: 'timezone', label: 'Timezone', type: 'select', options: ['GMT', 'WAT', 'UTC'] },
    { key: 'currency', label: 'Currency', type: 'select', options: ['GHS', 'USD', 'EUR'] },
    { key: 'language', label: 'Default Language', type: 'select', options: ['English', 'French'] }
  ];

  const apiSettings = [
    { key: 'mtn_api_url', label: 'MTN API URL', type: 'url', placeholder: 'https://api.mtn.com/v1' },
    { key: 'mtn_api_key', label: 'MTN API Key', type: 'password' },
    { key: 'mtn_api_secret', label: 'MTN API Secret', type: 'password' },
    { key: 'mtn_merchant_id', label: 'Merchant ID', type: 'text' },
    { key: 'api_timeout', label: 'API Timeout (seconds)', type: 'number', default: '30' },
    { key: 'api_retry_attempts', label: 'Retry Attempts', type: 'number', default: '3' },
    { key: 'webhook_url', label: 'Webhook URL', type: 'url' },
    { key: 'api_rate_limit', label: 'Rate Limit (per minute)', type: 'number', default: '60' }
  ];

  const paymentSettings = [
    { key: 'payment_gateway', label: 'Primary Gateway', type: 'select', options: ['PayStack', 'Flutterwave', 'MTN MoMo'] },
    { key: 'payment_public_key', label: 'Public Key', type: 'text' },
    { key: 'payment_secret_key', label: 'Secret Key', type: 'password' },
    { key: 'min_deposit', label: 'Minimum Deposit (GHS)', type: 'number', default: '1' },
    { key: 'max_deposit', label: 'Maximum Deposit (GHS)', type: 'number', default: '10000' },
    { key: 'transaction_fee', label: 'Transaction Fee (%)', type: 'number', default: '1.5' },
    { key: 'auto_approve_limit', label: 'Auto-Approve Limit (GHS)', type: 'number', default: '500' }
  ];

  const renderSettingsForm = (settingsList, category = 'general') => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsList.map((setting) => (
          <div key={setting.key} className={setting.fullWidth ? 'md:col-span-2' : ''}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {setting.label}
              {setting.required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
            </label>
            
            {setting.type === 'text' || setting.type === 'email' || setting.type === 'url' || setting.type === 'number' ? (
              <input
                type={setting.type}
                value={settings[setting.key] || setting.default || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, [setting.key]: e.target.value }))}
                onBlur={(e) => updateSetting(setting.key, e.target.value, category)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                placeholder={setting.placeholder || setting.default}
              />
            ) : setting.type === 'password' ? (
              <div className="relative">
                <input
                  type="password"
                  value={settings[setting.key] || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, [setting.key]: e.target.value }))}
                  onBlur={(e) => updateSetting(setting.key, e.target.value, category)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  placeholder="••••••••"
                />
              </div>
            ) : setting.type === 'select' ? (
              <select
                value={settings[setting.key] || ''}
                onChange={(e) => {
                  setSettings(prev => ({ ...prev, [setting.key]: e.target.value }));
                  updateSetting(setting.key, e.target.value, category);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              >
                <option value="">Select {setting.label}</option>
                {setting.options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : setting.type === 'toggle' ? (
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[setting.key] === 'true'}
                  onChange={(e) => {
                    const value = e.target.checked ? 'true' : 'false';
                    setSettings(prev => ({ ...prev, [setting.key]: value }));
                    updateSetting(setting.key, value, category);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            ) : null}
            
            {setting.description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{setting.description}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderExportSettings = () => {
    const settings = exportSettings?.settings;
    
    return (
      <div className="space-y-6">
        {/* Export Status Widget */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Current Export Status</h4>
            <ArrowPathIcon 
              className="h-5 w-5 text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-800 dark:hover:text-blue-300"
              onClick={fetchSystemStatus}
            />
          </div>
          
          {systemStatus?.currentProcessing?.isProcessing ? (
            <div className="space-y-2">
              <div className="flex items-center text-blue-800 dark:text-blue-200">
                <ClockIcon className="h-5 w-5 mr-2 animate-spin" />
                <span className="font-medium">Processing {systemStatus.currentProcessing.activeExports.length} export(s)</span>
              </div>
              {systemStatus.currentProcessing.activeExports.map((exp, idx) => (
                <div key={idx} className="ml-7 text-sm text-blue-700 dark:text-blue-300">
                  Export {exp.exportId}: {exp.orderCount} orders - Progress: {exp.progress || 0}%
                </div>
              ))}
            </div>
          ) : (
            <div className="text-green-700 dark:text-green-400">
              <CheckCircleIcon className="h-5 w-5 inline mr-2" />
              System idle - Ready for exports
            </div>
          )}
          
          {systemStatus?.lastExportDisplay && (
            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Last Export:</strong> {systemStatus.lastExportDisplay}
              </p>
            </div>
          )}
        </div>

        {/* SIMPLIFIED Processing Time Settings - Just ONE time input */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Export Processing Time</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Auto-Complete After (minutes)
              </label>
              <input
                type="number"
                value={settings?.autoComplete?.fixedTimeMinutes || 30}
                onChange={(e) => {
                  const minutes = parseInt(e.target.value);
                  updateExportSettings({
                    autoComplete: {
                      ...settings?.autoComplete,
                      fixedTimeMinutes: minutes
                    },
                    timeSettings: {
                      ...settings?.timeSettings,
                      totalProcessingMinutes: minutes
                    }
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-lg font-semibold"
                min="1"
                max="1440"
                placeholder="30"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Orders will automatically be marked as successful after this time (minimum 1 minute, maximum 24 hours)
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quick Set
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    updateExportSettings({
                      autoComplete: {
                        ...settings?.autoComplete,
                        fixedTimeMinutes: 1
                      },
                      timeSettings: {
                        ...settings?.timeSettings,
                        totalProcessingMinutes: 1
                      }
                    });
                  }}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm"
                >
                  1 min
                </button>
                <button
                  onClick={() => {
                    updateExportSettings({
                      autoComplete: {
                        ...settings?.autoComplete,
                        fixedTimeMinutes: 5
                      },
                      timeSettings: {
                        ...settings?.timeSettings,
                        totalProcessingMinutes: 5
                      }
                    });
                  }}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm"
                >
                  5 min
                </button>
                <button
                  onClick={() => {
                    updateExportSettings({
                      autoComplete: {
                        ...settings?.autoComplete,
                        fixedTimeMinutes: 15
                      },
                      timeSettings: {
                        ...settings?.timeSettings,
                        totalProcessingMinutes: 15
                      }
                    });
                  }}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm"
                >
                  15 min
                </button>
                <button
                  onClick={() => {
                    updateExportSettings({
                      autoComplete: {
                        ...settings?.autoComplete,
                        fixedTimeMinutes: 30
                      },
                      timeSettings: {
                        ...settings?.timeSettings,
                        totalProcessingMinutes: 30
                      }
                    });
                  }}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm"
                >
                  30 min
                </button>
                <button
                  onClick={() => {
                    updateExportSettings({
                      autoComplete: {
                        ...settings?.autoComplete,
                        fixedTimeMinutes: 60
                      },
                      timeSettings: {
                        ...settings?.timeSettings,
                        totalProcessingMinutes: 60
                      }
                    });
                  }}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm"
                >
                  1 hour
                </button>
                <button
                  onClick={() => {
                    updateExportSettings({
                      autoComplete: {
                        ...settings?.autoComplete,
                        fixedTimeMinutes: 120
                      },
                      timeSettings: {
                        ...settings?.timeSettings,
                        totalProcessingMinutes: 120
                      }
                    });
                  }}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm"
                >
                  2 hours
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              <strong>How it works:</strong> When you export orders, they will be marked as "sent" immediately. 
              After <strong>{settings?.autoComplete?.fixedTimeMinutes || 30} minutes</strong>, they will automatically 
              be marked as "successful" based on the success rate below.
            </p>
          </div>
        </div>

        {/* Auto-Complete Settings */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Auto-Complete Configuration</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Auto-Complete
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Automatically mark orders as complete after processing time
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.autoComplete?.enabled || false}
                  onChange={(e) => updateExportSettings({
                    autoComplete: {
                      ...settings?.autoComplete,
                      enabled: e.target.checked
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {settings?.autoComplete?.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Success Rate (%)
                  </label>
                  <input
                    type="number"
                    value={settings?.autoComplete?.successRate || 95}
                    onChange={(e) => updateExportSettings({
                      autoComplete: {
                        ...settings?.autoComplete,
                        successRate: parseInt(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Percentage of orders to mark as successful
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Strategy
                  </label>
                  <select
                    value={settings?.autoComplete?.strategy || 'fixed_time'}
                    onChange={(e) => updateExportSettings({
                      autoComplete: {
                        ...settings?.autoComplete,
                        strategy: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    <option value="fixed_time">Fixed Time</option>
                    <option value="progressive">Progressive</option>
                    <option value="random">Random Within Range</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Export Messages */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Export Messages</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Before Export Message
              </label>
              <input
                type="text"
                value={settings?.messages?.beforeExport || ''}
                onChange={(e) => updateExportSettings({
                  messages: {
                    ...settings?.messages,
                    beforeExport: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="Preparing to export orders..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Export Success Message
              </label>
              <input
                type="text"
                value={settings?.messages?.exportSuccess || ''}
                onChange={(e) => updateExportSettings({
                  messages: {
                    ...settings?.messages,
                    exportSuccess: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="Orders successfully sent to MTN"
              />
            </div>
          </div>
        </div>

        {/* Recent Export History */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Export History</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Export ID</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Orders</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {exportHistory.map((exp) => (
                  <tr key={exp.exportId}>
                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">{exp.exportId}</td>
                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">{exp.exportDetails?.totalOrders || 0}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${
                        exp.status?.current === 'completed' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                        exp.status?.current === 'processing' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {exp.status?.current}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                      {new Date(exp.timestamps?.exportedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderSystemStatus = () => {
    return (
      <div className="space-y-6">
        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Health</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {systemStatus?.systemHealth?.status || 'Unknown'}
                </p>
              </div>
              <ServerIcon className="h-8 w-8 text-green-500 dark:text-green-400" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Exports</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {systemStatus?.currentProcessing?.activeExports?.length || 0}
                </p>
              </div>
              <DocumentArrowDownIcon className="h-8 w-8 text-blue-500 dark:text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Exports</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {systemStatus?.statistics?.today?.totalExports || 0}
                </p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-purple-500 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Maintenance Mode Control */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Maintenance Mode</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Maintenance Message
              </label>
              <textarea
                value={settings.maintenance_message || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, maintenance_message: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                rows="3"
                placeholder="System is under maintenance. Please check back later."
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Maintenance Mode Status</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {settings.maintenance_mode === 'true' ? 
                    'System is currently in maintenance mode' : 
                    'System is operational'}
                </p>
              </div>
              <button
                onClick={toggleMaintenanceMode}
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  settings.maintenance_mode === 'true' 
                    ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600' 
                    : 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600'
                }`}
              >
                {settings.maintenance_mode === 'true' ? 'Disable' : 'Enable'} Maintenance
              </button>
            </div>
          </div>
        </div>

        {/* System Statistics */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">System Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {systemStatus?.statistics?.today?.totalOrders || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Today's Orders</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {systemStatus?.statistics?.today?.successRate || 0}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {systemStatus?.statistics?.thisWeek?.totalExports || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Week's Exports</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {systemStatus?.statistics?.thisMonth?.totalOrders || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Month's Orders</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">System Settings</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Configure platform settings and export management</p>
          </div>
          {saveStatus && (
            <div className={`flex items-center px-4 py-2 rounded-md ${
              saveStatus === 'saved' 
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
            }`}>
              {saveStatus === 'saved' ? (
                <>
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Settings saved
                </>
              ) : (
                <>
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                  Error saving
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Maintenance Mode Alert */}
      {settings.maintenance_mode === 'true' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 dark:text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>MAINTENANCE MODE ACTIVE</strong> - Users cannot access the platform
              </p>
              {settings.maintenance_message && (
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">{settings.maintenance_message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        {/* Settings Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex flex-wrap -mb-px">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-3 py-3 text-center border-b-2 font-medium text-sm flex items-center
                    ${activeTab === tab.id 
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}
                  `}
                >
                  <Icon className="h-5 w-5 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="p-6">
          {activeTab === 'general' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">General Settings</h3>
              {renderSettingsForm(generalSettings, 'general')}
            </div>
          )}

          {activeTab === 'export' && renderExportSettings()}

          {activeTab === 'api' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">API Configuration</h3>
              {renderSettingsForm(apiSettings, 'api')}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">API Health Check</h4>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded">
                  Test MTN API Connection
                </button>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Payment Settings</h3>
              {renderSettingsForm(paymentSettings, 'payment')}
            </div>
          )}

          {activeTab === 'sms' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">SMS Configuration</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      SMS Provider
                    </label>
                    <select
                      value={settings.sms_provider || ''}
                      onChange={(e) => updateSetting('sms_provider', e.target.value, 'sms')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select Provider</option>
                      <option value="Twilio">Twilio</option>
                      <option value="Hubtel">Hubtel</option>
                      <option value="Arkesel">Arkesel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sender ID
                    </label>
                    <input
                      type="text"
                      value={settings.sms_sender_id || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, sms_sender_id: e.target.value }))}
                      onBlur={(e) => updateSetting('sms_sender_id', e.target.value, 'sms')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      placeholder="MTNData"
                    />
                  </div>
                </div>
                
                <div className="border-t dark:border-gray-700 pt-4">
                  <label className="flex items-center text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={settings.enable_sms_notifications === 'true'}
                      onChange={(e) => updateSetting('enable_sms_notifications', e.target.checked ? 'true' : 'false', 'sms')}
                      className="mr-3"
                    />
                    <span>Enable SMS notifications for transactions</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Notification Settings</h3>
              <div className="space-y-3">
                <label className="flex items-center text-gray-700 dark:text-gray-300">
                  <input type="checkbox" className="mr-3" />
                  <span>Email notifications for new user registrations</span>
                </label>
                <label className="flex items-center text-gray-700 dark:text-gray-300">
                  <input type="checkbox" className="mr-3" />
                  <span>Email notifications for failed transactions</span>
                </label>
                <label className="flex items-center text-gray-700 dark:text-gray-300">
                  <input type="checkbox" className="mr-3" />
                  <span>Daily sales summary report</span>
                </label>
                <label className="flex items-center text-gray-700 dark:text-gray-300">
                  <input type="checkbox" className="mr-3" />
                  <span>Low wallet balance alerts</span>
                </label>
                <label className="flex items-center text-gray-700 dark:text-gray-300">
                  <input type="checkbox" className="mr-3" />
                  <span>Export completion notifications</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Security Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center text-gray-700 dark:text-gray-300">
                    <input type="checkbox" className="mr-3" />
                    <span>Require two-factor authentication for admin accounts</span>
                  </label>
                  <label className="flex items-center text-gray-700 dark:text-gray-300">
                    <input type="checkbox" className="mr-3" />
                    <span>Force password reset every 90 days</span>
                  </label>
                  <label className="flex items-center text-gray-700 dark:text-gray-300">
                    <input type="checkbox" className="mr-3" />
                    <span>Log all admin actions and API calls</span>
                  </label>
                  <label className="flex items-center text-gray-700 dark:text-gray-300">
                    <input type="checkbox" className="mr-3" />
                    <span>Enable IP whitelisting for admin access</span>
                  </label>
                </div>
              </div>
              
              <div className="border-t dark:border-gray-700 pt-6">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Session Management</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      defaultValue="30"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      defaultValue="5"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && renderSystemStatus()}
        </div>
      </div>
    </div>
  );
}