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
  FunnelIcon,
  ArrowDownTrayIcon,
  PencilSquareIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  FolderIcon
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
  const [exportSettings, setExportSettings] = useState({
    status: 'pending',
    markAsSuccessful: true
  });
  const router = useRouter();

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, statusFilter, typeFilter, searchTerm, startDate, endDate]);

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
    } finally {
      setLoading(false);
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
        alert(`Transaction status updated to ${newStatus}`);
        fetchTransactions();
        setShowStatusModal(false);
      } else {
        alert(data.message || 'Error updating status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating transaction status');
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedTransactions.length === 0) {
      alert('Please select transactions to update');
      return;
    }

    const status = prompt('Enter new status (pending, successful, failed):');
    if (!['pending', 'successful', 'failed'].includes(status)) {
      alert('Invalid status');
      return;
    }

    const reason = prompt('Reason for bulk update:');
    if (!reason) return;

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
          status, 
          reason 
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Updated ${data.results.successfullyUpdated} transactions`);
        setSelectedTransactions([]);
        fetchTransactions();
      }
    } catch (error) {
      console.error('Error in bulk update:', error);
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
          markAsSuccessful: exportSettings.markAsSuccessful,
          ...(startDate && { startDate }),
          ...(endDate && { endDate })
        })
      });

      const data = await response.json();
      if (data.success) {
        setExportPreview(data);
        setShowExportModal(true);
      } else {
        alert(data.message || 'Error previewing batch');
      }
    } catch (error) {
      console.error('Error previewing batch:', error);
      alert('Error previewing batch export');
    }
  };

  const handleExportExcel = async (skipConfirmation = false) => {
    try {
      const token = localStorage.getItem('Token');
      
      if (exportSettings.status === 'pending' && exportSettings.markAsSuccessful && !skipConfirmation) {
        const confirmed = window.confirm(
          'WARNING: You are about to create a batch export of pending orders and mark them as successful. ' +
          'This will deduct amounts from user wallets and cannot be undone. ' +
          'Are you sure you want to proceed?'
        );
        
        if (!confirmed) return;
        
        // Proceed with export without asking again
        handleExportExcel(true);
        return;
      }

      const response = await fetch('https://server-datamart-reseller.onrender.com/api/admin/orders/export/excel', {
        method: 'POST',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: exportSettings.status,
          markAsSuccessful: exportSettings.markAsSuccessful,
          ...(startDate && { startDate }),
          ...(endDate && { endDate })
        })
      });

      const contentType = response.headers.get('content-type');
      const batchId = response.headers.get('X-Batch-ID');
      
      if (!response.ok || (contentType && contentType.includes('application/json'))) {
        const data = await response.json();
        if (data.requiresConfirmation) {
          alert(data.message);
          return;
        }
        if (!data.success) {
          alert(data.message || 'Error exporting batch');
          return;
        }
      } else {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `batch_${batchId || 'export'}_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        const exportSummary = response.headers.get('X-Export-Summary');
        const summary = exportSummary ? JSON.parse(exportSummary) : null;
        
        setExportSettings({
          status: 'pending',
          markAsSuccessful: true
        });
        setShowExportModal(false);
        
        if (summary && summary.batchId) {
          alert(`Batch ${summary.batchId} created successfully!\n` +
                `Exported: ${summary.exported} orders\n` +
                `Processed: ${summary.processed} orders\n` +
                `Failed: ${summary.failed} orders\n\n` +
                `View batch details in the Batches section.`);
        } else {
          alert('Batch exported successfully!');
        }
        
        if (exportSettings.markAsSuccessful) {
          fetchTransactions();
        }
      }
    } catch (error) {
      console.error('Error exporting batch:', error);
      alert('Error creating batch export: ' + error.message);
    }
  };

  const handleReverse = async (transactionId) => {
    const reason = prompt('Please provide a reason for reversing this transaction:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('Token');
      const response = await fetch(`https://server-datamart-reseller.onrender.com/api/admin/transactions/${transactionId}/reverse`, {
        method: 'POST',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();
      if (data.success) {
        alert('Transaction reversed successfully');
        fetchTransactions();
      } else {
        alert(data.message || 'Error reversing transaction');
      }
    } catch (error) {
      console.error('Error reversing transaction:', error);
    }
  };

  const handleRetry = async (transactionId) => {
    if (!confirm('Are you sure you want to retry this transaction?')) return;

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
        alert('Transaction retry initiated');
        fetchTransactions();
      } else {
        alert(data.message || 'Error retrying transaction');
      }
    } catch (error) {
      console.error('Error retrying transaction:', error);
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
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error exporting CSV: ' + error.message);
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
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      reversed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };

    const statusIcons = {
      successful: <CheckCircleIcon className="h-4 w-4 inline mr-1" />,
      pending: <ClockIcon className="h-4 w-4 inline mr-1" />,
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

  return (
    <div className="space-y-6">
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
                onClick={handleBulkStatusUpdate}
                className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
              >
                <PencilSquareIcon className="h-5 w-5 mr-2" />
                Update Status ({selectedTransactions.length})
              </button>
            )}
            <button
              onClick={() => router.push('/admin/batches')}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
            >
              <FolderIcon className="h-5 w-5 mr-2" />
              View Batches
            </button>
            <button
              onClick={handleExportPreview}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Export Batch
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2 relative">
            <input
              type="text"
              placeholder="Search by ID, user, phone..."
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
            placeholder="Start Date"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            placeholder="End Date"
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
                  Transaction ID
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
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowStatusModal(true);
                          }}
                          className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                          title="Update Status"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        {transaction.status === 'successful' && (
                          <button
                            onClick={() => handleReverse(transaction._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Reverse Transaction"
                          >
                            <ArrowUturnLeftIcon className="h-5 w-5" />
                          </button>
                        )}
                        {transaction.status === 'failed' && (
                          <button
                            onClick={() => handleRetry(transaction._id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Retry Transaction"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  placeholder="Enter reason for status change..."
                ></textarea>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const newStatus = document.getElementById('newStatus').value;
                  const reason = document.getElementById('statusReason').value;
                  handleStatusUpdate(selectedTransaction._id, newStatus, reason);
                }}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
              >
                Update Status
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
              Create Order Batch Export
            </h2>
            
            {/* Batch Info Alert */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded p-4 mb-4">
              <div className="flex">
                <DocumentArrowDownIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300">Batch Export Information</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                    This export will create a new batch with a unique Batch ID. Maximum 40 orders per batch.
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                    You can view, search, and re-export this batch anytime from the Batches section.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Export Settings */}
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded">
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Batch Export Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Order Status
                    </label>
                    <select
                      value={exportSettings.status}
                      onChange={(e) => setExportSettings({
                        ...exportSettings,
                        status: e.target.value,
                        markAsSuccessful: e.target.value === 'pending' ? true : false
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    >
                      <option value="pending">Pending Orders</option>
                      <option value="successful">Successful Orders</option>
                      <option value="failed">Failed Orders</option>
                    </select>
                  </div>
                  
                  {exportSettings.status === 'pending' && (
                    <div>
                      <label className="flex items-center space-x-2 mt-7">
                        <input
                          type="checkbox"
                          checked={exportSettings.markAsSuccessful}
                          onChange={(e) => setExportSettings({
                            ...exportSettings,
                            markAsSuccessful: e.target.checked
                          })}
                          className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Mark as successful after export
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Warning Message */}
              {exportSettings.markAsSuccessful && exportPreview.impactSummary && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded p-4">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400 mr-2" />
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-300">Critical Warning</h4>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                        {exportPreview.impactSummary.warning}
                      </p>
                      <ul className="text-sm text-red-700 dark:text-red-400 mt-2 space-y-1">
                        <li>• Total orders to process: {exportPreview.impactSummary.totalOrdersToProcess}</li>
                        <li>• Total amount to deduct: {formatCurrency(exportPreview.impactSummary.totalAmountToDeduct)}</li>
                        <li>• Orders with insufficient balance: {exportPreview.impactSummary.ordersWithInsufficientBalance}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Preview Data */}
              <div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  Batch Preview ({exportPreview.count} orders, max 40 will be exported)
                </h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded overflow-hidden">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Transaction ID</th>
                        <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Beneficiary</th>
                        <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Capacity</th>
                        <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Status</th>
                        {exportSettings.markAsSuccessful && (
                          <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Can Process</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {exportPreview.data.slice(0, 10).map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{item.transactionId}</td>
                          <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{item.beneficiaryNumber}</td>
                          <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{item.capacity}</td>
                          <td className="px-4 py-2">
                            {getStatusBadge(item.currentStatus)}
                          </td>
                          {exportSettings.markAsSuccessful && (
                            <td className="px-4 py-2">
                              {item.sufficientBalance ? (
                                <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400" />
                              ) : (
                                <XCircleIcon className="h-5 w-5 text-red-500 dark:text-red-400" />
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {exportPreview.data.length > 10 && (
                    <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-center text-sm text-gray-600 dark:text-gray-400">
                      ... and {exportPreview.data.length - 10} more orders
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => handleExportPreview()}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Refresh Preview
              </button>
              <div className="space-x-3">
                <button
                  onClick={() => {
                    setShowExportModal(false);
                    setExportPreview(null);
                    setExportSettings({
                      status: 'pending',
                      markAsSuccessful: true
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleExportExcel()}
                  className={`px-4 py-2 rounded-md text-white ${
                    exportSettings.markAsSuccessful 
                      ? 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600' 
                      : 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                  }`}
                >
                  {exportSettings.markAsSuccessful 
                    ? 'Create Batch & Mark as Successful' 
                    : 'Create Batch Export'}
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
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Date</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(selectedTransaction.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Reference</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {selectedTransaction.reference || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="border-t dark:border-gray-700 pt-4">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">User Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {selectedTransaction.user?.fullName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {selectedTransaction.user?.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {selectedTransaction.user?.phone}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Role</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {selectedTransaction.user?.role}
                    </p>
                  </div>
                </div>
              </div>

              {selectedTransaction.dataDetails && (
                <div className="border-t dark:border-gray-700 pt-4">
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Data Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Product</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {selectedTransaction.dataDetails.product?.name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Beneficiary</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {selectedTransaction.dataDetails.beneficiaryNumber}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Capacity</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {selectedTransaction.dataDetails.capacity}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Network</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {selectedTransaction.dataDetails.network}
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