import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  Eye,
  EyeOff,
  Trash2,
  Phone,
  Hash,
  DollarSign,
  Loader2,
  Plus,
  FileText,
  X
} from 'lucide-react';

// Notification Modal Component
const NotificationModal = ({ type, title, message, details, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch(type) {
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-400" />;
      case 'error':
        return <XCircle className="w-8 h-8 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-8 h-8 text-yellow-400" />;
      default:
        return <Info className="w-8 h-8 text-blue-400" />;
    }
  };

  const getBgColor = () => {
    switch(type) {
      case 'success':
        return 'bg-green-900 border-green-400';
      case 'error':
        return 'bg-red-900 border-red-400';
      case 'warning':
        return 'bg-yellow-900 border-yellow-400';
      default:
        return 'bg-blue-900 border-blue-400';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black bg-opacity-60" onClick={onClose} />
      <div className={`relative max-w-md w-full ${getBgColor()} border-2 rounded-xl p-6 shadow-2xl transform transition-all animate-slideDown`}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex items-start gap-4">
          {getIcon()}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-200 mb-3">{message}</p>
            
            {details && details.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-sm font-medium text-gray-300 mb-2">Details:</p>
                <ul className="space-y-1 max-h-32 overflow-y-auto">
                  {details.slice(0, 5).map((detail, idx) => (
                    <li key={idx} className="text-xs text-gray-400 flex items-start gap-1">
                      <span>•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                  {details.length > 5 && (
                    <li className="text-xs text-gray-500 italic">
                      ...and {details.length - 5} more
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Bulk Order Component
export default function BulkOrderComponent({ 
  products, 
  userBalance, 
  onProcessOrders,
  API_BASE_URL 
}) {
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkOrders, setBulkOrders] = useState([]);
  const [processingBulk, setProcessingBulk] = useState(false);
  const [bulkParseProgress, setBulkParseProgress] = useState('');
  const [manualBulkInput, setManualBulkInput] = useState('');
  const [bulkInputMode, setBulkInputMode] = useState('file');
  const [showPreview, setShowPreview] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [notification, setNotification] = useState(null);
  const [bulkSummary, setBulkSummary] = useState({
    total: 0,
    valid: 0,
    invalid: 0,
    totalCost: 0
  });
  
  const fileInputRef = useRef(null);

  // Helper functions
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    let cleaned = String(phone).replace(/\D/g, '');
    
    if (cleaned.startsWith('233')) {
      cleaned = '0' + cleaned.substring(3);
    } else if (cleaned.length === 9 && !cleaned.startsWith('0')) {
      cleaned = '0' + cleaned;
    }
    
    return cleaned;
  };

  const validatePhoneNumber = (number) => {
    const formatted = formatPhoneNumber(number);
    const phoneRegex = /^0[2-9][0-9]{8}$/;
    return phoneRegex.test(formatted);
  };

  const parseCapacityValue = (value) => {
    if (!value) return null;
    
    const strValue = String(value).trim().toLowerCase();
    let cleanValue = strValue.replace(/\s*(gb|gig|gigabyte|mb|megabyte|meg)\s*/gi, '');
    
    if (strValue.includes('mb') || strValue.includes('megabyte')) {
      const mbValue = parseFloat(cleanValue);
      if (!isNaN(mbValue)) {
        return mbValue;
      }
    }
    
    const numValue = parseFloat(cleanValue);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 1000) {
      return numValue;
    }
    
    return null;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(fileExtension)) {
      setNotification({
        type: 'error',
        title: 'Invalid File Type',
        message: 'Please upload a valid Excel (.xlsx, .xls) or CSV (.csv) file'
      });
      return;
    }

    setBulkFile(file);
    setBulkParseProgress('Reading file...');
    
    if (fileExtension === 'csv') {
      parseCSVFile(file);
    } else {
      parseExcelFile(file);
    }
  };

  const parseExcelFile = async (file) => {
    try {
      setBulkParseProgress('Parsing Excel file...');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
          
          if (jsonData.length < 2) {
            setNotification({
              type: 'error',
              title: 'Empty File',
              message: 'The uploaded file is empty or has no data rows'
            });
            setBulkParseProgress('');
            return;
          }
          
          processFileData(jsonData);
          
        } catch (error) {
          setNotification({
            type: 'error',
            title: 'Parse Error',
            message: 'Failed to parse Excel file',
            details: [error.message]
          });
          setBulkParseProgress('');
        }
      };
      
      reader.readAsArrayBuffer(file);
      
    } catch (error) {
      setNotification({
        type: 'error',
        title: 'File Error',
        message: 'Failed to process Excel file',
        details: [error.message]
      });
      setBulkParseProgress('');
    }
  };

  const parseCSVFile = async (file) => {
    try {
      setBulkParseProgress('Parsing CSV file...');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const lines = content.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          setNotification({
            type: 'error',
            title: 'Empty File',
            message: 'The CSV file is empty or has no data rows'
          });
          setBulkParseProgress('');
          return;
        }
        
        const data = lines.map(line => line.split(',').map(cell => cell.trim()));
        processFileData(data);
      };
      
      reader.readAsText(file);
      
    } catch (error) {
      setNotification({
        type: 'error',
        title: 'CSV Error',
        message: 'Failed to process CSV file',
        details: [error.message]
      });
      setBulkParseProgress('');
    }
  };

  const processFileData = (data) => {
    const orders = [];
    const errors = [];
    
    const looksLikePhoneNumber = (value) => {
      if (!value) return false;
      const cleaned = String(value).replace(/\D/g, '');
      return cleaned.length === 9 || cleaned.length === 10;
    };
    
    const looksLikeCapacity = (value) => {
      if (!value) return false;
      const strValue = String(value).trim();
      const numValue = parseFloat(strValue.replace(/[^\d.]/g, ''));
      if (isNaN(numValue)) return false;
      
      const commonCapacities = [0.5, 1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 50, 100, 200, 500, 1000];
      return commonCapacities.includes(numValue);
    };
    
    const detectColumns = () => {
      let phoneColumnIndex = -1;
      let capacityColumnIndex = -1;
      
      const headers = data[0].map(h => String(h).toLowerCase().trim());
      
      phoneColumnIndex = headers.findIndex(h => 
        h.includes('number') || h.includes('phone') || h.includes('beneficiary') || 
        h.includes('mobile') || h.includes('msisdn') || h.includes('contact')
      );
      
      capacityColumnIndex = headers.findIndex(h => 
        h.includes('capacity') || h.includes('data') || h.includes('gb') || 
        h.includes('bundle') || h.includes('size') || h.includes('megabyte') || h.includes('mb')
      );
      
      if (phoneColumnIndex === -1 || capacityColumnIndex === -1) {
        setBulkParseProgress('Auto-detecting columns...');
        
        const sampleRows = Math.min(5, data.length - 1);
        const columnScores = {};
        
        for (let col = 0; col < (data[1] ? data[1].length : 0); col++) {
          let phoneScore = 0;
          let capacityScore = 0;
          
          for (let row = 1; row <= sampleRows; row++) {
            if (data[row] && data[row][col]) {
              const value = data[row][col];
              
              if (looksLikePhoneNumber(value)) {
                phoneScore++;
              }
              
              if (looksLikeCapacity(value)) {
                capacityScore++;
              }
            }
          }
          
          columnScores[col] = { phone: phoneScore, capacity: capacityScore };
        }
        
        if (phoneColumnIndex === -1) {
          let maxPhoneScore = 0;
          for (const [col, scores] of Object.entries(columnScores)) {
            if (scores.phone > maxPhoneScore) {
              maxPhoneScore = scores.phone;
              phoneColumnIndex = parseInt(col);
            }
          }
        }
        
        if (capacityColumnIndex === -1) {
          let maxCapacityScore = 0;
          for (const [col, scores] of Object.entries(columnScores)) {
            if (parseInt(col) !== phoneColumnIndex && scores.capacity > maxCapacityScore) {
              maxCapacityScore = scores.capacity;
              capacityColumnIndex = parseInt(col);
            }
          }
        }
      }
      
      return { phoneColumnIndex, capacityColumnIndex };
    };
    
    const { phoneColumnIndex, capacityColumnIndex } = detectColumns();
    
    if (phoneColumnIndex === -1 && capacityColumnIndex === -1) {
      setBulkParseProgress('Using default column positions...');
      
      if (data[1] && data[1].length >= 2) {
        const firstColLooksLikePhone = looksLikePhoneNumber(data[1][0]);
        const secondColLooksLikePhone = looksLikePhoneNumber(data[1][1]);
        
        if (firstColLooksLikePhone && !secondColLooksLikePhone) {
          processWithColumns(0, 1);
        } else if (!firstColLooksLikePhone && secondColLooksLikePhone) {
          processWithColumns(1, 0);
        } else {
          processWithColumns(0, 1);
        }
      } else {
        setNotification({
          type: 'error',
          title: 'Column Detection Failed',
          message: 'Cannot detect data columns. Please ensure file has phone numbers and capacity values.'
        });
        setBulkParseProgress('');
        return;
      }
    } else if (phoneColumnIndex === -1 || capacityColumnIndex === -1) {
      setNotification({
        type: 'error',
        title: 'Incomplete Data',
        message: 'Could not detect both phone number and capacity columns in your file.'
      });
      setBulkParseProgress('');
      return;
    } else {
      processWithColumns(phoneColumnIndex, capacityColumnIndex);
    }
    
    function processWithColumns(phoneCol, capacityCol) {
      setBulkParseProgress('Processing rows...');
      
      const startRow = (data[0] && !looksLikePhoneNumber(data[0][phoneCol]) && !looksLikeCapacity(data[0][capacityCol])) ? 1 : 0;
      const maxRows = Math.min(data.length - startRow, 100);
      
      for (let i = 0; i < maxRows; i++) {
        const rowIndex = startRow + i;
        const row = data[rowIndex];
        
        if (!row || row.every(cell => !cell)) continue;
        
        const phoneValue = row[phoneCol] || '';
        const capacityValue = row[capacityCol] || '';
        
        if (!phoneValue && !capacityValue) continue;
        
        const formattedPhone = formatPhoneNumber(phoneValue);
        const isValidPhone = validatePhoneNumber(formattedPhone);
        
        const parsedCapacity = parseCapacityValue(capacityValue);
        
        let product = null;
        if (parsedCapacity !== null) {
          product = products.find(p => {
            if (p.capacityUnit === 'MB' && parsedCapacity === 500) {
              return p.capacityValue === 500;
            }
            return p.capacityValue === parsedCapacity;
          });
        }
        
        const rowErrors = [];
        if (!phoneValue) {
          rowErrors.push('Missing phone number');
        } else if (!isValidPhone) {
          rowErrors.push(`Invalid phone: ${phoneValue}`);
        }
        
        if (!capacityValue) {
          rowErrors.push('Missing capacity');
        } else if (parsedCapacity === null) {
          rowErrors.push(`Invalid capacity: ${capacityValue}`);
        } else if (!product) {
          rowErrors.push(`No product for ${parsedCapacity}${parsedCapacity === 500 ? 'MB' : 'GB'}`);
        }
        
        orders.push({
          row: rowIndex + 1,
          originalPhone: phoneValue,
          formattedPhone: formattedPhone,
          originalCapacity: capacityValue,
          parsedCapacity: parsedCapacity,
          productId: product?.id || null,
          productCode: product?.productCode || '',
          productName: product?.name || 'Not Found',
          capacity: product?.capacity || '-',
          beneficiary: formattedPhone,
          price: product?.price || 0,
          isValid: isValidPhone && product !== null,
          errors: rowErrors,
          status: 'pending'
        });
        
        if (rowErrors.length > 0) {
          errors.push(`Row ${rowIndex + 1}: ${rowErrors.join(', ')}`);
        }
      }
      
      if (data.length - startRow > 100) {
        errors.push(`Note: Only first 100 rows processed (file has ${data.length - startRow} data rows)`);
      }
    }
    
    setBulkOrders(orders);
    setBulkParseProgress('');
    
    const validOrders = orders.filter(o => o.isValid);
    setBulkSummary({
      total: orders.length,
      valid: validOrders.length,
      invalid: orders.length - validOrders.length,
      totalCost: validOrders.reduce((sum, o) => sum + o.price, 0)
    });
    
    if (validOrders.length > 0) {
      setNotification({
        type: 'success',
        title: 'File Processed Successfully',
        message: `Loaded ${validOrders.length} valid orders from ${orders.length} rows`,
        details: errors.length > 0 ? errors.slice(0, 3) : null
      });
    } else {
      setNotification({
        type: 'error',
        title: 'No Valid Orders',
        message: `No valid orders found in ${orders.length} rows. Please check your data format.`,
        details: errors.slice(0, 5)
      });
    }
  };

  const handleManualBulkAdd = () => {
    const lines = manualBulkInput.trim().split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      setNotification({
        type: 'error',
        title: 'No Data',
        message: 'Please enter at least one order in the format: phone_number capacity'
      });
      return;
    }
    
    const orders = [];
    const errors = [];
    
    lines.forEach((line, index) => {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 2) {
        errors.push(`Line ${index + 1}: Invalid format`);
        return;
      }
      
      const phoneNumber = formatPhoneNumber(parts[0]);
      const capacity = parseCapacityValue(parts[1]);
      
      if (!validatePhoneNumber(phoneNumber)) {
        errors.push(`Line ${index + 1}: Invalid phone number: ${parts[0]}`);
      }
      
      const product = products.find(p => {
        if (capacity === 500 && p.capacityUnit === 'MB') {
          return p.capacityValue === 500;
        }
        return p.capacityValue === capacity;
      });
      
      if (!product) {
        errors.push(`Line ${index + 1}: Product not found for capacity: ${parts[1]}`);
      }
      
      orders.push({
        row: bulkOrders.length + index + 1,
        originalPhone: parts[0],
        formattedPhone: phoneNumber,
        originalCapacity: parts[1],
        parsedCapacity: capacity,
        productCode: product?.productCode || '',
        productId: product?.id || null,
        productName: product?.name || 'Not Found',
        capacity: product?.capacity || '-',
        beneficiary: phoneNumber,
        price: product?.price || 0,
        isValid: validatePhoneNumber(phoneNumber) && product !== null,
        errors: [],
        status: 'pending'
      });
    });
    
    if (orders.length > 0) {
      setBulkOrders(prev => [...prev, ...orders]);
      const validOrders = orders.filter(o => o.isValid);
      setBulkSummary(prev => ({
        total: prev.total + orders.length,
        valid: prev.valid + validOrders.length,
        invalid: prev.invalid + orders.filter(o => !o.isValid).length,
        totalCost: prev.totalCost + validOrders.reduce((sum, o) => sum + o.price, 0)
      }));
      
      setNotification({
        type: 'success',
        title: 'Orders Added',
        message: `Added ${validOrders.length} valid orders from ${orders.length} lines`,
        details: errors.length > 0 ? errors : null
      });
      setManualBulkInput('');
    }
  };

  const processBulkOrders = async () => {
    const validOrders = bulkOrders.filter(o => o.isValid);
    
    if (validOrders.length === 0) {
      setNotification({
        type: 'error',
        title: 'No Valid Orders',
        message: 'There are no valid orders to process'
      });
      return;
    }

    const totalCost = validOrders.reduce((sum, order) => sum + order.price, 0);
    if (totalCost > userBalance) {
      setNotification({
        type: 'error',
        title: 'Insufficient Balance',
        message: `You need GHS ${totalCost.toFixed(2)} but have GHS ${userBalance.toFixed(2)}`
      });
      return;
    }

    setProcessingBulk(true);
    
    try {
      const token = localStorage.getItem('Token');
      
      const orders = validOrders.map(order => ({
        productId: order.productId,
        beneficiaryNumber: order.beneficiary,
        quantity: 1
      }));
      
      const response = await fetch(`${API_BASE_URL}/purchase/orders/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ orders })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBulkOrders(prev => prev.map((order) => {
          if (order.isValid) {
            return { ...order, status: 'completed' };
          }
          return order;
        }));
        
        setNotification({
          type: 'success',
          title: 'Bulk Order Successful!',
          message: `Successfully processed ${data.data.processedCount} orders`,
          details: [
            `New Balance: GHS ${data.data.newBalance?.toFixed(2) || '0.00'}`,
            `Total Amount: GHS ${totalCost.toFixed(2)}`,
            `Orders Processed: ${data.data.processedCount}`
          ]
        });
        
        if (onProcessOrders) {
          onProcessOrders(data.data.newBalance);
        }
        
        setTimeout(() => {
          clearBulkOrders();
        }, 5000);
      } else {
        setNotification({
          type: 'error',
          title: 'Bulk Processing Failed',
          message: data.message || 'Failed to process bulk orders',
          details: data.errors
        });
      }
    } catch (error) {
      console.error('Bulk processing error:', error);
      setNotification({
        type: 'error',
        title: 'Processing Error',
        message: 'Network error occurred while processing orders',
        details: [error.message]
      });
    } finally {
      setProcessingBulk(false);
    }
  };

  const exportBulkResults = () => {
    const ws_data = [
      ['Row #', 'Phone Number', 'Capacity', 'Product', 'Price', 'Status', 'Errors']
    ];
    
    bulkOrders.forEach(order => {
      ws_data.push([
        order.row,
        order.formattedPhone,
        order.capacity,
        order.productName,
        order.price ? `GHS ${order.price.toFixed(2)}` : '-',
        order.isValid ? 'Valid' : 'Invalid',
        order.errors ? order.errors.join('; ') : ''
      ]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bulk Orders');
    XLSX.writeFile(wb, 'bulk_orders_review.xlsx');
    
    setNotification({
      type: 'success',
      title: 'Export Successful',
      message: 'Bulk orders exported to Excel file'
    });
  };

  const clearBulkOrders = () => {
    setBulkOrders([]);
    setBulkFile(null);
    setBulkSummary({ total: 0, valid: 0, invalid: 0, totalCost: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const template = [
      ['number', 'capacity'],
      ['0244123456', '1'],
      ['0501234567', '2'],
      ['0209876543', '5'],
      ['0277654321', '10'],
      ['0555555555', '500']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    
    ws['!cols'] = [{ wch: 15 }, { wch: 10 }];
    
    XLSX.writeFile(wb, 'datamart_bulk_template.xlsx');
    
    setNotification({
      type: 'info',
      title: 'Template Downloaded',
      message: 'Template file downloaded successfully'
    });
  };

  const getFilteredBulkOrders = () => {
    if (filterStatus === 'valid') {
      return bulkOrders.filter(o => o.isValid);
    } else if (filterStatus === 'invalid') {
      return bulkOrders.filter(o => !o.isValid);
    }
    return bulkOrders;
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 sm:p-6 lg:p-8">
      {/* Notification Modal */}
      {notification && (
        <NotificationModal
          type={notification.type}
          title={notification.title}
          message={notification.message}
          details={notification.details}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-white">Bulk Data Purchase</h3>
        <span className="px-3 py-1 bg-yellow-400 text-gray-900 font-medium rounded-full text-sm">
          Max 100 Orders
        </span>
      </div>
      
      {/* Tab Selection */}
      <div className="flex gap-2 mb-6 bg-gray-700 p-1 rounded-lg">
        <button
          onClick={() => setBulkInputMode('file')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            bulkInputMode === 'file' ? 'bg-yellow-400 text-gray-900' : 'text-gray-400 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="inline w-4 h-4 mr-2" />
          File Upload
        </button>
        <button
          onClick={() => setBulkInputMode('manual')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            bulkInputMode === 'manual' ? 'bg-yellow-400 text-gray-900' : 'text-gray-400 hover:text-white'
          }`}
        >
          <FileText className="inline w-4 h-4 mr-2" />
          Manual Input
        </button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
        {/* Upload Section or Manual Input */}
        <div>
          <h4 className="text-base sm:text-lg font-medium text-white mb-4">
            {bulkInputMode === 'manual' ? 'Manual Entry' : 'Upload Orders File'}
          </h4>
          
          {bulkInputMode === 'manual' ? (
            <div>
              <textarea
                value={manualBulkInput}
                onChange={(e) => setManualBulkInput(e.target.value)}
                placeholder="Enter orders (one per line):&#10;0597760914 1&#10;0244123456 2&#10;0501234567 500"
                className="w-full h-48 p-4 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-gray-400 font-mono text-sm"
              />
              
              <button
                onClick={handleManualBulkAdd}
                className="mt-4 w-full px-4 py-2 bg-yellow-400 text-gray-900 font-medium rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Orders
              </button>
              
              <div className="mt-4 p-3 bg-blue-500 bg-opacity-10 rounded-lg">
                <p className="text-blue-400 text-sm mb-1 font-medium">
                  <Info className="inline w-4 h-4 mr-1" />
                  Format:
                </p>
                <p className="text-blue-300 text-xs">
                  phone_number capacity (one per line)<br/>
                  Example: 0597760914 1
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-600 rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:border-yellow-400 hover:bg-gray-700 hover:bg-opacity-20 transition-all group"
              >
                <div className="transform group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-12 sm:w-16 h-12 sm:h-16 text-gray-400 group-hover:text-yellow-400 mx-auto mb-4 transition-colors" />
                  <p className="text-white font-medium mb-2 text-sm sm:text-base">
                    {bulkFile ? bulkFile.name : 'Click to upload Excel/CSV file'}
                  </p>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Supports .xlsx, .xls, .csv formats
                  </p>
                  {bulkParseProgress && (
                    <p className="text-green-400 text-sm mt-2 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {bulkParseProgress}
                    </p>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              
              <button
                onClick={downloadTemplate}
                className="mt-4 flex items-center gap-2 text-yellow-400 hover:text-yellow-500 text-sm sm:text-base transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Template
              </button>
              
              <div className="mt-4 p-3 bg-blue-500 bg-opacity-10 rounded-lg">
                <p className="text-blue-400 text-sm mb-2 font-medium">
                  <Info className="inline w-4 h-4 mr-1" />
                  Smart Column Detection:
                </p>
                <ul className="text-blue-300 text-xs space-y-1 ml-5">
                  <li>• Auto-detects phone numbers (9-10 digits)</li>
                  <li>• Auto-detects capacity values (1, 2, 5, 10, 500, etc.)</li>
                  <li>• Works with or without headers</li>
                  <li>• Handles various file formats</li>
                </ul>
              </div>
            </div>
          )}
        </div>
        
        {/* Instructions */}
        <div>
          <h4 className="text-base sm:text-lg font-medium text-white mb-4">How It Works</h4>
          <div className="space-y-3">
            {[
              { icon: <Download className="w-5 h-5" />, text: "Download template or use your own file" },
              { icon: <FileText className="w-5 h-5" />, text: "Add phone numbers and data capacities" },
              { icon: <FileSpreadsheet className="w-5 h-5" />, text: "Upload the file (auto-detects columns)" },
              { icon: <Zap className="w-5 h-5" />, text: "Process all valid orders instantly" }
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                <span className="flex items-center justify-center w-8 h-8 bg-yellow-400 text-gray-900 rounded-full font-bold text-sm flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-yellow-400">{step.icon}</span>
                  <p className="text-gray-300 text-sm sm:text-base">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* BULK ORDERS PREVIEW */}
      {bulkOrders.length > 0 && (
        <div className="mt-6 sm:mt-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <Hash className="w-5 h-5 text-yellow-400" />
                <span className="text-2xl font-bold text-white">{bulkSummary.total}</span>
              </div>
              <p className="text-gray-400 text-sm mt-2">Total Rows</p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-2xl font-bold text-green-400">{bulkSummary.valid}</span>
              </div>
              <p className="text-gray-400 text-sm mt-2">Valid Orders</p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-2xl font-bold text-red-400">{bulkSummary.invalid}</span>
              </div>
              <p className="text-gray-400 text-sm mt-2">Invalid Orders</p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <DollarSign className="w-5 h-5 text-yellow-400" />
                <span className="text-2xl font-bold text-yellow-400">₵{bulkSummary.totalCost.toFixed(2)}</span>
              </div>
              <p className="text-gray-400 text-sm mt-2">Total Cost</p>
            </div>
          </div>
          
          {/* Filter and Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none"
              >
                <option value="all">All Orders ({bulkOrders.length})</option>
                <option value="valid">Valid Only ({bulkSummary.valid})</option>
                <option value="invalid">Invalid Only ({bulkSummary.invalid})</option>
              </select>
              
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? 'Hide' : 'Show'} Preview
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={exportBulkResults}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={clearBulkOrders}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>
          
          {/* Preview Table (simplified for space) */}
          {showPreview && (
            <div className="bg-gray-700 rounded-lg overflow-hidden mb-6">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-600 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-gray-300">Row #</th>
                      <th className="px-4 py-3 text-gray-300">Phone</th>
                      <th className="px-4 py-3 text-gray-300">Capacity</th>
                      <th className="px-4 py-3 text-gray-300">Price</th>
                      <th className="px-4 py-3 text-gray-300">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-600">
                    {getFilteredBulkOrders().slice(0, 10).map((order) => (
                      <tr key={`${order.row}-${order.formattedPhone}`} 
                          className={!order.isValid ? 'bg-red-900 bg-opacity-20' : ''}>
                        <td className="px-4 py-3 text-white">{order.row}</td>
                        <td className="px-4 py-3 text-white">{order.formattedPhone}</td>
                        <td className="px-4 py-3 text-white">{order.capacity}</td>
                        <td className="px-4 py-3 text-yellow-400">₵{order.price.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          {order.isValid ? (
                            <span className="text-green-400">Valid</span>
                          ) : (
                            <span className="text-red-400">Invalid</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {getFilteredBulkOrders().length > 10 && (
                <div className="p-2 bg-gray-600 text-center text-sm text-gray-300">
                  Showing 10 of {getFilteredBulkOrders().length} orders
                </div>
              )}
            </div>
          )}
          
          {/* Process Section */}
          <div className="p-4 bg-gray-700 rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-sm text-gray-400">
                  {bulkSummary.valid} valid orders ready to process
                </p>
                <p className="text-2xl font-bold text-yellow-400">
                  Total: ₵{bulkSummary.totalCost.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Wallet Balance: ₵{userBalance.toFixed(2)}
                  {bulkSummary.totalCost > userBalance && (
                    <span className="text-red-400 ml-2">
                      (Insufficient balance)
                    </span>
                  )}
                </p>
              </div>
              
              <button
                onClick={processBulkOrders}
                disabled={processingBulk || bulkSummary.valid === 0 || bulkSummary.totalCost > userBalance}
                className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processingBulk && <Loader2 className="w-5 h-5 animate-spin" />}
                {processingBulk ? 'Processing...' : `Process ${bulkSummary.valid} Valid Orders`}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideDown {
          from { 
            opacity: 0;
            transform: translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}