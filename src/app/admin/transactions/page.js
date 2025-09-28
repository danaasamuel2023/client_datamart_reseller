'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowUturnLeftIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  PencilSquareIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  FolderIcon,
  InformationCircleIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('data_purchase');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [exportPreview, setExportPreview] = useState(null);
  const [exportInProgress, setExportInProgress] = useState(false);
  const [notification, setNotification] = useState(null);
  const [statusUpdateReason, setStatusUpdateReason] = useState('');
  const [bulkStatusUpdate, setBulkStatusUpdate] = useState({ status: '', reason: '' });
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);
  const [exportSettings, setExportSettings] = useState({
    status: 'pending',
    markAsSent: false // Changed from markAsSuccessful to markAsSent
  });
  const router = useRouter();

  useEffect(() => {
    fetchTransactions();
    fetchExportStatus();
  }, [currentPage, statusFilter, typeFilter, searchTerm, startDate, endDate]);

  useEffect(() => {
    // Refresh export status every 30 seconds
    const interval = setInterval(() => {
      fetchExportStatus();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('Token');
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 40,
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter }),
        ...(searchTerm && { search: searchTerm }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await fetch(`https://server-datamart-reseller.onrender.com/api/admin/transactions?${params}`, {
        headers: { 'x-auth-token': token }
      });

      const data = await response.json();
      if (data.success) {
        setTransactions(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch transactions'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchExportStatus = async () => {
    try {
      const token = localStorage.getItem('Token');
      const response = await fetch('https://server-datamart-reseller.onrender.com/api/admin/system-status', {
        headers: { 'x-auth-token': token }
      });
      const data = await response.json();
      if (data.success) {
        setExportStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching export status:', error);
    }
  };

  const handleStatusUpdate = async (transactionId, newStatus, reason) => {
    try {
      const token = localStorage.getItem('Token');
      const response = await fetch(`https://server-datamart-reseller.onrender.com/api/admin/transactions/${transactionId}/status`, {
        method: 'PATCH',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus, reason })
      });

      const data = await response.json();
      if (data.success) {
        setNotification({
          type: 'success',
          title: 'Status Updated',
          message: `Transaction updated to ${newStatus}`
        });
        fetchTransactions();
        setShowStatusModal(false);
        setStatusUpdateReason('');
      } else {
        setNotification({
          type: 'error',
          title: 'Update Failed',
          message: data.message || 'Error updating status'
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update transaction status'
      });
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedTransactions.length === 0) {
      setNotification({
        type: 'error',
        title: 'No Selection',
        message: 'Please select transactions to update'
      });
      return;
    }

    if (!bulkStatusUpdate.status || !bulkStatusUpdate.reason) {
      setNotification({
        type: 'error',
        title: 'Missing Information',
        message: 'Please provide status and reason'
      });
      return;
    }

    try {
      const token = localStorage.getItem('Token');
      const response = await fetch('https://server-datamart-reseller.onrender.com/api/admin/transactions/bulk-status-update', {
        method: 'POST',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          transactionIds: selectedTransactions, 
          status: bulkStatusUpdate.status, 
          reason: bulkStatusUpdate.reason 
        })
      });

      const data = await response.json();
      if (data.success) {
        setNotification({
          type: 'success',
          title: 'Bulk Update Successful',
          message: `Updated ${data.results.successfullyUpdated} transactions`
        });
        setSelectedTransactions([]);
        setShowBulkStatusModal(false);
        setBulkStatusUpdate({ status: '', reason: '' });
        fetchTransactions();
      } else {
        setNotification({
          type: 'error',
          title: 'Bulk Update Failed',
          message: data.message || 'Error updating transactions'
        });
      }
    } catch (error) {
      console.error('Error in bulk update:', error);
      setNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to perform bulk update'
      });
    }
  };

  const handleExportPreview = async () => {
    try {
      const token = localStorage.getItem('Token');
      const response = await fetch('https://server-datamart-reseller.onrender.com/api/admin/orders/export/preview', {
        method: 'POST',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: exportSettings.status,
          ...(startDate && { startDate }),
          ...(endDate && { endDate })
        })
      });

      const data = await response.json();
      if (data.success) {
        setExportPreview(data);
        setShowExportModal(true);
      } else {
        setNotification({
          type: 'error',
          title: 'Preview Failed',
          message: data.message || 'Error previewing batch'
        });
      }
    } catch (error) {
      console.error('Error previewing batch:', error);
      setNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to preview batch export'
      });
    }
  };

  const handleExportExcel = async () => {
    try {
      setExportInProgress(true);
      const token = localStorage.getItem('Token');
      
      const requestBody = {
        status: exportSettings.status,
        markAsSuccessful: exportSettings.markAsSent, // This will mark as "sent" in new system
        confirmExport: true,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      };

      const response = await fetch('https://server-datamart-reseller.onrender.com/api/admin/orders/export/excel', {
        method: 'POST',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const contentType = response.headers.get('content-type');
      
      if (!response.ok) {
        const errorData = await response.json();
        setExportInProgress(false);
        setNotification({
          type: 'error',
          title: 'Export Failed',
          message: errorData.message || 'Error exporting batch'
        });
        setShowExportModal(false);
        return;
      }

      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setExportInProgress(false);
        if (!data.success) {
          setNotification({
            type: 'error',
            title: 'Export Failed',
            message: data.message || 'Error exporting batch'
          });
          setShowExportModal(false);
          return;
        }
      } else {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        const exportId = response.headers.get('X-Export-ID') || 'export';
        
        a.href = url;
        a.download = `export_${exportId}_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        setExportSettings({
          status: 'pending',
          markAsSent: false
        });
        setShowExportModal(false);
        setExportInProgress(false);
        
        // Show appropriate notification based on action
        if (exportSettings.markAsSent) {
          setNotification({
            type: 'info',
            title: `Export ${exportId} - Orders Sent to MTN`,
            message: `${exportPreview?.count || 0} orders exported and sent for processing. Estimated completion: 30 minutes.`
          });
        } else {
          setNotification({
            type: 'success',
            title: `Export ${exportId} Completed`,
            message: `${exportPreview?.count || 0} orders exported successfully.`
          });
        }
        
        fetchTransactions();
        fetchExportStatus();
      }
    } catch (error) {
      console.error('Error exporting batch:', error);
      setExportInProgress(false);
      setShowExportModal(false);
      setNotification({
        type: 'error',
        title: 'Export Error',
        message: error.message
      });
    }
  };

  const handleReverse = async (transactionId) => {
    try {
      const token = localStorage.getItem('Token');
      const response = await fetch(`https://server-datamart-reseller.onrender.com/api/admin/transactions/${transactionId}/reverse`, {
        method: 'POST',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: 'Admin reversal' })
      });

      const data = await response.json();
      if (data.success) {
        setNotification({
          type: 'success',
          title: 'Transaction Reversed',
          message: 'Transaction has been reversed successfully'
        });
        fetchTransactions();
      } else {
        setNotification({
          type: 'error',
          title: 'Reversal Failed',
          message: data.message || 'Error reversing transaction'
        });
      }
    } catch (error) {
      console.error('Error reversing transaction:', error);
      setNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to reverse transaction'
      });
    }
  };

  const handleRetry = async (transactionId) => {
    try {
      const token = localStorage.getItem('Token');
      const response = await fetch(`https://server-datamart-reseller.onrender.com/api/admin/transactions/${transactionId}/retry`, {
        method: 'POST',
        headers: {
          'x-auth-token': token
        }
      });

      const data = await response.json();
      if (data.success) {
        setNotification({
          type: 'success',
          title: 'Retry Initiated',
          message: 'Transaction retry has been initiated'
        });
        fetchTransactions();
      } else {
        setNotification({
          type: 'error',
          title: 'Retry Failed',
          message: data.message || 'Error retrying transaction'
        });
      }
    } catch (error) {
      console.error('Error retrying transaction:', error);
      setNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to retry transaction'
      });
    }
  };

  const viewDetails = async (transactionId) => {
    try {
      const token = localStorage.getItem('Token');
      const response = await fetch(`https://server-datamart-reseller.onrender.com/api/admin/transactions/${transactionId}`, {
        headers: { 'x-auth-token': token }
      });

      const data = await response.json();
      if (data.success) {
        setSelectedTransaction(data.data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      setNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch transaction details'
      });
    }
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('Token');
      const params = new URLSearchParams({
        format: 'csv',
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await fetch(`https://server-datamart-reseller.onrender.com/api/admin/reports/export/transactions?${params}`, {
        headers: { 'x-auth-token': token }
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setNotification({
        type: 'success',
        title: 'CSV Exported',
        message: 'Transaction data exported successfully'
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export CSV'
      });
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

  const getStatusBadge = (status) => {
    const statusStyles = {
      successful: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      reversed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };

    const statusIcons = {
      successful: <CheckCircleIcon className="h-4 w-4 inline mr-1" />,
      pending: <ClockIcon className="h-4 w-4 inline mr-1" />,
      sent: <PaperAirplaneIcon className="h-4 w-4 inline mr-1" />,
      processing: <ArrowPathIcon className="h-4 w-4 inline mr-1" />,
      failed: <XCircleIcon className="h-4 w-4 inline mr-1" />
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full inline-flex items-center ${statusStyles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
        {statusIcons[status]}
        {status}
      </span>
    );
  };

  const handleSelectTransaction = (transactionId) => {
    setSelectedTransactions(prev => {
      if (prev.includes(transactionId)) {
        return prev.filter(id => id !== transactionId);
      }
      return [...prev, transactionId];
    });
  };

  const handleSelectAll = () => {
    if (selectedTransactions.length === transactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(transactions.map(t => t._id));
    }
  };

  // Export Status Bar Component
  const ExportStatusBar = () => {
    if (!exportStatus?.lastExport) return null;
    
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <span className="font-medium">Last Export:</span> {exportStatus.lastExportDisplay}
              {exportStatus.lastExport?.status && (
                <span className="ml-2">
                  Status: <span className={`font-medium ${
                    exportStatus.lastExport.status === 'completed' ? 'text-green-700 dark:text-green-400' : 
                    exportStatus.lastExport.status === 'processing' ? 'text-blue-700 dark:text-blue-400' : 
                    'text-yellow-700 dark:text-yellow-400'
                  }`}>{exportStatus.lastExport.status}</span>
                </span>
              )}
            </div>
          </div>
          {exportStatus.currentProcessing?.isProcessing && (
            <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded flex items-center">
              <ArrowPathIcon className="h-3 w-3 mr-1 animate-spin" />
              Processing {exportStatus.currentProcessing.activeExports?.length || 0} export(s)
            </span>
          )}
        </div>
      </div>
    );
  };

  // Notification Toast Component
  const NotificationToast = () => {
    useEffect(() => {
      if (notification) {
        const timer = setTimeout(() => {
          setNotification(null);
        }, 5000); // 5 seconds for better readability
        return () => clearTimeout(timer);
      }
    }, [notification]);

    if (!notification) return null;

    return (
      <div className="fixed top-4 right-4 z-[70] animate-slideIn">
        <div className={`rounded-lg shadow-lg p-4 max-w-md ${
          notification.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700'
            : notification.type === 'info'
            ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
            : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700'
        }`}>
          <div className="flex items-start">
            {notification.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5 text-green-400 dark:text-green-300 mt-0.5" />
            ) : notification.type === 'info' ? (
              <InformationCircleIcon className="h-5 w-5 text-blue-400 dark:text-blue-300 mt-0.5" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-400 dark:text-red-300 mt-0.5" />
            )}
            <div className="ml-3 flex-1">
              <h3 className={`text-sm font-medium ${
                notification.type === 'success'
                  ? 'text-green-800 dark:text-green-200'
                  : notification.type === 'info'
                  ? 'text-blue-800 dark:text-blue-200'
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {notification.title}
              </h3>
              {notification.message && (
                <div className={`mt-1 text-sm ${
                  notification.type === 'success'
                    ? 'text-green-700 dark:text-green-300'
                    : notification.type === 'info'
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {notification.message}
                </div>
              )}
            </div>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Bulk Status Update Modal
  const BulkStatusUpdateModal = () => (
    <>
      {showBulkStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Bulk Status Update
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Selected Transactions
                </label>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {selectedTransactions.length} transactions selected
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Status
                </label>
                <select
                  value={bulkStatusUpdate.status}
                  onChange={(e) => setBulkStatusUpdate({...bulkStatusUpdate, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                >
                  <option value="">Select status</option>
                  <option value="pending">Pending</option>
                  <option value="sent">Sent to MTN</option>
                  <option value="successful">Successful</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason for Update
                </label>
                <textarea
                  value={bulkStatusUpdate.reason}
                  onChange={(e) => setBulkStatusUpdate({...bulkStatusUpdate, reason: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  placeholder="Enter reason for bulk update..."
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowBulkStatusModal(false);
                  setBulkStatusUpdate({ status: '', reason: '' });
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkStatusUpdate}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      <NotificationToast />

      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">View and manage all platform transactions</p>
          </div>
          <div className="flex space-x-2">
            {selectedTransactions.length > 0 && (
              <button
                onClick={() => setShowBulkStatusModal(true)}
                className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
              >
                <PencilSquareIcon className="h-5 w-5 mr-2" />
                Update ({selectedTransactions.length})
              </button>
            )}
            <button
              onClick={() => router.push('/admin/batches')}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
            >
              <FolderIcon className="h-5 w-5 mr-2" />
              Batches
            </button>
            <button
              onClick={handleExportPreview}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Export
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Export Status Bar */}
      <ExportStatusBar />

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2 relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            <option value="">All Status</option>
            <option value="successful">Successful</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent to MTN</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
            <option value="reversed">Reversed</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            <option value="">All Types</option>
            <option value="data_purchase">Data Purchase</option>
            <option value="wallet_funding">Wallet Funding</option>
            <option value="withdrawal">Withdrawal</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.length === transactions.length && transactions.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
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
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction._id} className={`${selectedTransactions.includes(transaction._id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''} hover:bg-gray-50 dark:hover:bg-gray-700/50`}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(transaction._id)}
                        onChange={() => handleSelectTransaction(transaction._id)}
                        className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {transaction.transactionId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {transaction.user?.fullName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.user?.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {transaction.type?.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewDetails(transaction._id)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowStatusModal(true);
                          }}
                          className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                          title="Edit"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        {transaction.status === 'successful' && (
                          <button
                            onClick={() => handleReverse(transaction._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Reverse"
                          >
                            <ArrowUturnLeftIcon className="h-5 w-5" />
                          </button>
                        )}
                        {transaction.status === 'failed' && (
                          <button
                            onClick={() => handleRetry(transaction._id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Retry"
                          >
                            <ArrowPathIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      
      {/* Bulk Status Update Modal */}
      <BulkStatusUpdateModal />

      {/* Status Update Modal */}
      {showStatusModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Update Transaction Status</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Transaction ID
                </label>
                <p className="text-sm text-gray-900 dark:text-gray-100">{selectedTransaction.transactionId}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Status
                </label>
                <p>{getStatusBadge(selectedTransaction.status)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Status
                </label>
                <select
                  id="newStatus"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                >
                  <option value="pending">Pending</option>
                  <option value="sent">Sent to MTN</option>
                  <option value="successful">Successful</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason
                </label>
                <textarea
                  id="statusReason"
                  rows="3"
                  value={statusUpdateReason}
                  onChange={(e) => setStatusUpdateReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  placeholder="Enter reason..."
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setStatusUpdateReason('');
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const newStatus = document.getElementById('newStatus').value;
                  handleStatusUpdate(selectedTransaction._id, newStatus, statusUpdateReason);
                }}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Batch Modal */}
      {showExportModal && exportPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Export Batch to MTN
            </h2>
            
            {/* Export Settings */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded mb-4">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Export Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Order Status Filter
                  </label>
                  <select
                    value={exportSettings.status}
                    onChange={(e) => setExportSettings({
                      ...exportSettings,
                      status: e.target.value,
                      markAsSent: false // Reset when changing filter
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="pending">Pending Orders</option>
                    <option value="sent">Already Sent Orders</option>
                    <option value="successful">Successful Orders</option>
                    <option value="failed">Failed Orders</option>
                  </select>
                </div>
                
                {exportSettings.status === 'pending' && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded p-3">
                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={exportSettings.markAsSent}
                        onChange={(e) => setExportSettings({
                          ...exportSettings,
                          markAsSent: e.target.checked
                        })}
                        className="mt-1 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Send to MTN for Processing
                        </span>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {exportSettings.markAsSent 
                            ? "Orders will be marked as 'Sent' and automatically completed after 30 minutes"
                            : "Export only - orders will remain as 'Pending' status"
                          }
                        </p>
                      </div>
                    </label>
                  </div>
                )}
                
                {exportSettings.markAsSent && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded p-3">
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                          Processing Notice
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                          Orders will be sent to MTN and marked as "Sent". They will automatically update to "Successful" after approximately 30 minutes.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Preview Data */}
            <div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                Preview ({exportPreview.count} orders)
              </h3>
              {exportPreview.impactSummary && (
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded mb-3">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(exportPreview.impactSummary.totalAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Processing Time:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                        {exportPreview.impactSummary.estimatedProcessingTime} minutes
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Success Rate:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                        {exportPreview.impactSummary.successRate}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-gray-50 dark:bg-gray-900 rounded overflow-hidden">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left">Transaction ID</th>
                      <th className="px-4 py-2 text-left">Beneficiary</th>
                      <th className="px-4 py-2 text-left">Capacity</th>
                      <th className="px-4 py-2 text-left">Current Status</th>
                      <th className="px-4 py-2 text-left">New Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {exportPreview.data.slice(0, 5).map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{item.transactionId}</td>
                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{item.beneficiaryNumber}</td>
                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{item.capacity}</td>
                        <td className="px-4 py-2">{getStatusBadge(item.currentStatus)}</td>
                        <td className="px-4 py-2">
                          {exportSettings.markAsSent && item.currentStatus === 'pending' 
                            ? getStatusBadge('sent')
                            : getStatusBadge(item.currentStatus)
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {exportPreview.data.length > 5 && (
                  <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-center text-sm text-gray-600 dark:text-gray-400">
                    ... and {exportPreview.data.length - 5} more orders
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-between">
              <button
                onClick={handleExportPreview}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ArrowPathIcon className="h-4 w-4 inline mr-2" />
                Refresh Preview
              </button>
              <div className="space-x-3">
                <button
                  onClick={() => {
                    setShowExportModal(false);
                    setExportPreview(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExportExcel}
                  disabled={exportInProgress || exportPreview.count === 0}
                  className={`px-4 py-2 rounded-md text-white ${
                    exportInProgress || exportPreview.count === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : exportSettings.markAsSent 
                        ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600' 
                        : 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                  }`}
                >
                  {exportInProgress ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Exporting...
                    </span>
                  ) : (
                    <>
                      {exportSettings.markAsSent ? (
                        <>
                          <PaperAirplaneIcon className="h-4 w-4 inline mr-2" />
                          Export & Send to MTN
                        </>
                      ) : (
                        <>
                          <DocumentArrowDownIcon className="h-4 w-4 inline mr-2" />
                          Export Only
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {showDetailsModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Transaction Details</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Transaction ID</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedTransaction.transactionId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <p className="mt-1">{getStatusBadge(selectedTransaction.status)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Type</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {selectedTransaction.type?.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Amount</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {formatCurrency(selectedTransaction.amount)}
                  </p>
                </div>
              </div>

              {selectedTransaction.user && (
                <div className="border-t dark:border-gray-700 pt-4">
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">User Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {selectedTransaction.user.fullName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {selectedTransaction.user.phone}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedTransaction.metadata?.exportId && (
                <div className="border-t dark:border-gray-700 pt-4">
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Export Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Export ID</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {selectedTransaction.metadata.exportId}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Completion</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {selectedTransaction.metadata.estimatedCompletion 
                          ? formatDate(selectedTransaction.metadata.estimatedCompletion)
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedTransaction(null);
                }}
                className="px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-md hover:bg-gray-700 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}