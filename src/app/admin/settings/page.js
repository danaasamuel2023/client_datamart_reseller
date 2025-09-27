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
  CloudIcon
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        const settingsObj = {};
        data.data.forEach(setting => {
          settingsObj[setting.key] = setting.value;
        });
        setSettings(settingsObj);
        setMaintenanceMode(settingsObj.maintenance_mode === 'true');
        setMaintenanceMessage(settingsObj.maintenance_message || '');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value, description = '') => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/settings/${key}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value, description })
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

  const toggleMaintenanceMode = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/settings/maintenance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enabled: !maintenanceMode,
          message: maintenanceMessage
        })
      });

      const data = await response.json();
      if (data.success) {
        setMaintenanceMode(!maintenanceMode);
        alert(`Maintenance mode ${!maintenanceMode ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
    }
  };

  const settingsTabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'api', name: 'API Settings', icon: KeyIcon },
    { id: 'payment', name: 'Payment', icon: CurrencyDollarIcon },
    { id: 'sms', name: 'SMS Configuration', icon: DevicePhoneMobileIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'backup', name: 'Backup & Security', icon: CloudIcon }
  ];

  const generalSettings = [
    { key: 'site_name', label: 'Site Name', type: 'text', default: 'MTN Data Platform' },
    { key: 'site_url', label: 'Site URL', type: 'url', default: 'https://example.com' },
    { key: 'admin_email', label: 'Admin Email', type: 'email', default: 'admin@example.com' },
    { key: 'support_email', label: 'Support Email', type: 'email', default: 'support@example.com' },
    { key: 'timezone', label: 'Timezone', type: 'select', options: ['GMT', 'WAT', 'UTC'] },
    { key: 'currency', label: 'Currency', type: 'select', options: ['GHS', 'USD', 'EUR'] }
  ];

  const apiSettings = [
    { key: 'mtn_api_url', label: 'MTN API URL', type: 'url' },
    { key: 'mtn_api_key', label: 'MTN API Key', type: 'password' },
    { key: 'mtn_api_secret', label: 'MTN API Secret', type: 'password' },
    { key: 'api_timeout', label: 'API Timeout (seconds)', type: 'number', default: '30' },
    { key: 'api_retry_attempts', label: 'Retry Attempts', type: 'number', default: '3' },
    { key: 'webhook_url', label: 'Webhook URL', type: 'url' }
  ];

  const paymentSettings = [
    { key: 'payment_gateway', label: 'Payment Gateway', type: 'select', options: ['PayStack', 'Flutterwave', 'MTN MoMo'] },
    { key: 'payment_public_key', label: 'Public Key', type: 'text' },
    { key: 'payment_secret_key', label: 'Secret Key', type: 'password' },
    { key: 'min_deposit', label: 'Minimum Deposit (GHS)', type: 'number', default: '1' },
    { key: 'max_deposit', label: 'Maximum Deposit (GHS)', type: 'number', default: '10000' },
    { key: 'transaction_fee', label: 'Transaction Fee (%)', type: 'number', default: '1.5' }
  ];

  const smsSettings = [
    { key: 'sms_provider', label: 'SMS Provider', type: 'select', options: ['Twilio', 'Hubtel', 'Arkesel'] },
    { key: 'sms_api_key', label: 'SMS API Key', type: 'password' },
    { key: 'sms_sender_id', label: 'Sender ID', type: 'text', default: 'MTNData' },
    { key: 'enable_sms_notifications', label: 'Enable SMS Notifications', type: 'toggle' },
    { key: 'sms_balance_alert', label: 'Low Balance Alert (GHS)', type: 'number', default: '10' }
  ];

  const renderSettingsForm = (settingsList) => {
    return (
      <div className="space-y-4">
        {settingsList.map((setting) => (
          <div key={setting.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {setting.label}
            </label>
            
            {setting.type === 'text' || setting.type === 'email' || setting.type === 'url' || setting.type === 'number' ? (
              <input
                type={setting.type}
                value={settings[setting.key] || setting.default || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, [setting.key]: e.target.value }))}
                onBlur={(e) => updateSetting(setting.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                placeholder={setting.default}
              />
            ) : setting.type === 'password' ? (
              <input
                type="password"
                value={settings[setting.key] || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, [setting.key]: e.target.value }))}
                onBlur={(e) => updateSetting(setting.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                placeholder="••••••••"
              />
            ) : setting.type === 'select' ? (
              <select
                value={settings[setting.key] || ''}
                onChange={(e) => {
                  setSettings(prev => ({ ...prev, [setting.key]: e.target.value }));
                  updateSetting(setting.key, e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
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
                    updateSetting(setting.key, value);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            ) : null}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
            <p className="mt-1 text-sm text-gray-500">Configure platform settings and preferences</p>
          </div>
          {saveStatus && (
            <div className={`flex items-center px-4 py-2 rounded-md ${
              saveStatus === 'saved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {saveStatus === 'saved' ? (
                <>
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Settings saved
                </>
              ) : (
                <>
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                  Error saving settings
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Maintenance Mode Alert */}
      {maintenanceMode && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Maintenance mode is currently <strong>ENABLED</strong>. 
                Users cannot access the platform except administrators.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        {/* Settings Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm
                    ${activeTab === tab.id 
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

        {/* Settings Content */}
        <div className="p-6">
          {activeTab === 'general' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">General Settings</h3>
              {renderSettingsForm(generalSettings)}
              
              {/* Maintenance Mode */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-3">Maintenance Mode</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maintenance Message
                    </label>
                    <textarea
                      value={maintenanceMessage}
                      onChange={(e) => setMaintenanceMessage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows="3"
                      placeholder="System is under maintenance. Please check back later."
                    />
                  </div>
                  <button
                    onClick={toggleMaintenanceMode}
                    className={`px-4 py-2 rounded-md text-white ${
                      maintenanceMode 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {maintenanceMode ? 'Disable' : 'Enable'} Maintenance Mode
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">API Settings</h3>
              {renderSettingsForm(apiSettings)}
            </div>
          )}

          {activeTab === 'payment' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Payment Settings</h3>
              {renderSettingsForm(paymentSettings)}
            </div>
          )}

          {activeTab === 'sms' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">SMS Configuration</h3>
              {renderSettingsForm(smsSettings)}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3" />
                  <span>Enable email notifications for new users</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3" />
                  <span>Enable email notifications for failed transactions</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3" />
                  <span>Enable daily sales report</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3" />
                  <span>Enable low stock alerts</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Backup & Security</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Automatic Backup</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Schedule automatic database backups
                  </p>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option>Daily at 2:00 AM</option>
                    <option>Weekly on Sunday</option>
                    <option>Monthly on 1st</option>
                    <option>Disabled</option>
                  </select>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Security Settings</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" />
                      <span>Enable two-factor authentication for admin</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" />
                      <span>Force password reset every 90 days</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-3" />
                      <span>Log all admin actions</span>
                    </label>
                  </div>
                </div>
                
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Create Manual Backup Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}