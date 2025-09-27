'use client';
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  Upload, 
  FileSpreadsheet, 
  Calculator, 
  Download,
  Loader2,
  Settings,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Hash,
  Package,
  Edit,
  X,
  Plus,
  RefreshCw
} from 'lucide-react';

export default function ExcelCalculator() {
  // State Management
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [calculations, setCalculations] = useState([]);
  const [showPricing, setShowPricing] = useState(false);
  const [fileResults, setFileResults] = useState([]);
  
  // MTN Official Pricing Structure (No Expiry)
  const defaultPrices = {
    '1': 4,
    '2': 8,
    '3': 12,
    '4': 16,
    '5': 20,
    '6': 24,
    '8': 32,
    '10': 38,
    '15': 57,
    '20': 76,
    '25': 95,
    '30': 115,
    '40': 152,
    '50': 190  // Estimated based on pattern
  };
  
  // Pricing state
  const [prices, setPrices] = useState(defaultPrices);
  const [editingPrices, setEditingPrices] = useState(false);
  const [tempPrices, setTempPrices] = useState(defaultPrices);
  
  // Summary State
  const [summary, setSummary] = useState({
    totalRows: 0,
    validRows: 0,
    invalidRows: 0,
    totalCost: 0,
    totalGB: 0,
    uniqueNumbers: 0
  });
  
  // Load saved prices from localStorage on mount
  useEffect(() => {
    const savedPrices = localStorage.getItem('mtnCalculatorPrices');
    if (savedPrices) {
      try {
        const parsedPrices = JSON.parse(savedPrices);
        setPrices(parsedPrices);
        setTempPrices(parsedPrices);
      } catch (e) {
        console.error('Error loading saved prices:', e);
      }
    }
  }, []);
  
  // Clear messages after timeout
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);
  
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  // Save prices to localStorage
  const savePrices = () => {
    try {
      localStorage.setItem('mtnCalculatorPrices', JSON.stringify(tempPrices));
      setPrices(tempPrices);
      setEditingPrices(false);
      setSuccess('Prices saved successfully');
      
      // Recalculate if there are existing calculations
      if (calculations.length > 0) {
        recalculateWithNewPrices(tempPrices);
      }
    } catch (e) {
      setError('Failed to save prices');
    }
  };
  
  // Cancel editing
  const cancelPriceEdit = () => {
    setTempPrices(prices);
    setEditingPrices(false);
  };
  
  // Reset to default MTN prices
  const resetToDefault = () => {
    setTempPrices(defaultPrices);
    setPrices(defaultPrices);
    localStorage.removeItem('mtnCalculatorPrices');
    setSuccess('Reset to MTN default prices');
    
    if (calculations.length > 0) {
      recalculateWithNewPrices(defaultPrices);
    }
  };
  
  // Update individual price
  const updatePrice = (capacity, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setTempPrices({
        ...tempPrices,
        [capacity]: numValue
      });
    }
  };
  
  // Add new capacity tier
  const addCapacityTier = () => {
    const newCapacity = prompt('Enter new capacity in GB (e.g., 7):');
    if (newCapacity && !isNaN(parseFloat(newCapacity))) {
      const capacity = parseFloat(newCapacity).toString();
      if (!tempPrices[capacity]) {
        setTempPrices({
          ...tempPrices,
          [capacity]: 0
        });
        setSuccess(`Added ${capacity}GB tier`);
      } else {
        setError(`${capacity}GB already exists`);
      }
    }
  };
  
  // Remove capacity tier
  const removeCapacityTier = (capacity) => {
    if (window.confirm(`Remove ${capacity}GB tier?`)) {
      const newPrices = { ...tempPrices };
      delete newPrices[capacity];
      setTempPrices(newPrices);
    }
  };
  
  // Recalculate with new prices
  const recalculateWithNewPrices = (newPrices) => {
    const updatedCalculations = calculations.map(row => {
      if (row.isValid && row.capacity > 0) {
        const price = findPriceForCapacity(row.capacity, newPrices);
        return {
          ...row,
          cost: price
        };
      }
      return row;
    });
    
    setCalculations(updatedCalculations);
    
    // Recalculate summary
    const validRows = updatedCalculations.filter(r => r.isValid);
    const totalCost = validRows.reduce((sum, row) => sum + row.cost, 0);
    
    setSummary(prev => ({
      ...prev,
      totalCost: totalCost
    }));
  };
  
  // Find price for a given capacity
  const findPriceForCapacity = (capacity, priceList) => {
    // Try exact match first
    if (priceList[capacity.toString()]) {
      return priceList[capacity.toString()];
    }
    
    // If no exact match, find closest lower tier and calculate
    const availableTiers = Object.keys(priceList)
      .map(k => parseFloat(k))
      .sort((a, b) => a - b);
    
    // Find the appropriate tier
    for (let i = availableTiers.length - 1; i >= 0; i--) {
      if (capacity >= availableTiers[i]) {
        // Use the price of the matching or next higher tier
        return priceList[availableTiers[i].toString()];
      }
    }
    
    // If capacity is less than smallest tier, use smallest tier price
    return priceList[availableTiers[0].toString()] || 0;
  };
  
  // Format phone number
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    let cleaned = String(phone).replace(/\D/g, '');
    
    if (cleaned.length === 9) {
      cleaned = '0' + cleaned;
    }
    
    if (cleaned.startsWith('233')) {
      cleaned = '0' + cleaned.substring(3);
    }
    
    return cleaned;
  };
  
  // Validate Ghana phone number
  const validatePhoneNumber = (phone) => {
    const formatted = formatPhoneNumber(phone);
    return /^0[235][0-9]{8}$/.test(formatted);
  };
  
  // Download sample Excel template
  const downloadTemplate = () => {
    const sampleData = [
      { Number: '244123456', Capacity: '1' },     
      { Number: '201234567', Capacity: '2' },    
      { Number: '551234567', Capacity: '5' },   
      { Number: '244567890', Capacity: '10' },    
      { Number: '277123456', Capacity: '15' },    
      { Number: '244999888', Capacity: '20' },
      { Number: '551112223', Capacity: '30' },
      { Number: '201234567', Capacity: '40' }
    ];
    
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'MTN Data Calculator');
    
    ws['!cols'] = [
      { wch: 15 },
      { wch: 10 }
    ];
    
    // Add pricing sheet
    const pricingData = Object.entries(prices).map(([capacity, price]) => ({
      'Capacity (GB)': capacity,
      'Price (GHS)': price
    }));
    const ws2 = XLSX.utils.json_to_sheet(pricingData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Pricing');
    
    XLSX.writeFile(wb, 'mtn_calculator_template.xlsx');
    setSuccess('Template downloaded successfully');
  };
  
  // Handle file upload (multiple files)
  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    
    if (!uploadedFiles || uploadedFiles.length === 0) return;
    
    // Validate file types
    const invalidFiles = uploadedFiles.filter(file => 
      !file.name.match(/\.(xlsx|xls|csv)$/)
    );
    
    if (invalidFiles.length > 0) {
      setError(`Invalid files: ${invalidFiles.map(f => f.name).join(', ')}. Please upload only Excel or CSV files.`);
      return;
    }
    
    setFiles(prev => [...prev, ...uploadedFiles]);
    processFiles(uploadedFiles);
  };
  
  // Process multiple files
  const processFiles = async (uploadedFiles) => {
    setLoading(true);
    setError('');
    
    try {
      let allCalculations = [...calculations]; // Keep existing calculations
      let startId = calculations.length + 1;
      const newFileResults = [];
      
      for (const file of uploadedFiles) {
        const result = await processSingleFile(file, startId);
        if (result) {
          allCalculations = [...allCalculations, ...result.calculations];
          startId += result.calculations.length;
          
          newFileResults.push({
            fileName: file.name,
            rows: result.calculations.length,
            validRows: result.validRows,
            cost: result.totalCost
          });
        }
      }
      
      setCalculations(allCalculations);
      setFileResults(prev => [...prev, ...newFileResults]);
      
      // Update summary for all calculations
      updateTotalSummary(allCalculations);
      
      setSuccess(`Processed ${uploadedFiles.length} file(s) successfully`);
      
    } catch (error) {
      console.error('Error processing files:', error);
      setError('Failed to process some files. Please check the format.');
    } finally {
      setLoading(false);
    }
  };
  
  // Process single file
  const processSingleFile = async (uploadedFile, startId) => {
    try {
      const data = await readFileAsync(uploadedFile);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData.length === 0) {
        return null;
      }
      
      const processedRows = [];
      const uniqueNumbers = new Set();
      let totalValidCost = 0;
      let totalValidGB = 0;
      let validRowCount = 0;
      
      jsonData.forEach((row, index) => {
        // More flexible column detection
        const phoneNumber = row.Number || row.number || 
                          row.Phone || row.phone ||
                          row['Phone Number'] || row['phone number'] ||
                          row.Beneficiary || row.beneficiary ||
                          row.Mobile || row.mobile ||
                          row.MSISDN || row.msisdn ||
                          (Object.values(row)[0] && String(Object.values(row)[0]).match(/^[0-9]{9,10}$/) ? Object.values(row)[0] : '') ||
                          '';
        
        const capacity = row.Capacity || row.capacity || 
                        row.GB || row.gb || 
                        row.Data || row.data ||
                        row.Bundle || row.bundle ||
                        row.Size || row.size ||
                        (Object.values(row)[1] && !isNaN(parseFloat(Object.values(row)[1])) ? Object.values(row)[1] : '') ||
                        '';
        
        const formattedPhone = formatPhoneNumber(phoneNumber);
        const isValidPhone = validatePhoneNumber(formattedPhone);
        const capacityNum = parseFloat(String(capacity).replace(/[^0-9.]/g, ''));
        const isValidCapacity = !isNaN(capacityNum) && capacityNum > 0;
        
        let cost = 0;
        let matchedTier = '';
        
        if (isValidCapacity) {
          cost = findPriceForCapacity(capacityNum, prices);
          Object.keys(prices).forEach(tier => {
            if (prices[tier] === cost && !matchedTier) {
              matchedTier = tier + 'GB';
            }
          });
        }
        
        const rowData = {
          id: startId + index,
          fileName: uploadedFile.name,
          originalPhone: phoneNumber,
          formattedPhone: formattedPhone,
          capacity: isValidCapacity ? capacityNum : 0,
          matchedTier: matchedTier,
          cost: cost,
          isValid: isValidPhone && isValidCapacity,
          phoneError: !isValidPhone && phoneNumber ? 'Invalid phone' : '',
          capacityError: !isValidCapacity && capacity ? 'Invalid capacity' : ''
        };
        
        processedRows.push(rowData);
        
        if (rowData.isValid) {
          uniqueNumbers.add(formattedPhone);
          totalValidCost += cost;
          totalValidGB += capacityNum;
          validRowCount++;
        }
      });
      
      return {
        calculations: processedRows,
        validRows: validRowCount,
        totalCost: totalValidCost,
        totalGB: totalValidGB,
        uniqueNumbers: uniqueNumbers.size
      };
      
    } catch (error) {
      console.error(`Error processing file ${uploadedFile.name}:`, error);
      return null;
    }
  };
  
  // Update total summary
  const updateTotalSummary = (allCalculations) => {
    const validRows = allCalculations.filter(r => r.isValid);
    const uniqueNumbers = new Set(validRows.map(r => r.formattedPhone));
    const totalCost = validRows.reduce((sum, row) => sum + row.cost, 0);
    const totalGB = validRows.reduce((sum, row) => sum + row.capacity, 0);
    
    setSummary({
      totalRows: allCalculations.length,
      validRows: validRows.length,
      invalidRows: allCalculations.length - validRows.length,
      totalCost: totalCost,
      totalGB: totalGB,
      uniqueNumbers: uniqueNumbers.size
    });
  };
  
  // Read file asynchronously
  const readFileAsync = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(new Uint8Array(e.target.result));
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };
  
  // Export calculation results
  const exportResults = () => {
    const exportData = calculations.map(row => ({
      'Row': row.id,
      'File': row.fileName || '-',
      'Original Number': row.originalPhone,
      'Formatted Number': row.formattedPhone,
      'Capacity (GB)': row.capacity || '-',
      'Matched Tier': row.matchedTier || '-',
      'Cost (GHS)': row.cost.toFixed(2),
      'Status': row.isValid ? 'Valid' : 'Invalid',
      'Phone Error': row.phoneError || '-',
      'Capacity Error': row.capacityError || '-'
    }));
    
    // Create workbook with results
    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Calculations');
    
    // Add summary sheet
    const summaryData = [
      { 'Metric': 'Total Rows', 'Value': summary.totalRows },
      { 'Metric': 'Valid Rows', 'Value': summary.validRows },
      { 'Metric': 'Invalid Rows', 'Value': summary.invalidRows },
      { 'Metric': 'Total Cost (GHS)', 'Value': '₵' + summary.totalCost.toFixed(2) },
      { 'Metric': 'Total Data (GB)', 'Value': summary.totalGB.toFixed(2) },
      { 'Metric': 'Unique Numbers', 'Value': summary.uniqueNumbers }
    ];
    const ws2 = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Summary');
    
    // Add pricing reference
    const pricingData = Object.entries(prices)
      .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
      .map(([capacity, price]) => ({
        'Capacity (GB)': capacity,
        'Price (₵)': price
      }));
    const ws3 = XLSX.utils.json_to_sheet(pricingData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Pricing Used');
    
    XLSX.writeFile(wb, `mtn_calculation_${Date.now()}.xlsx`);
    setSuccess('Results exported successfully');
  };
  
  // Clear all
  const clearAll = () => {
    setFiles([]);
    setCalculations([]);
    setFileResults([]);
    setSummary({
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      totalCost: 0,
      totalGB: 0,
      uniqueNumbers: 0
    });
    setError('');
    setSuccess('');
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = '';
  };
  
  // Remove specific file's calculations
  const removeFile = (fileName) => {
    const updatedCalculations = calculations.filter(calc => calc.fileName !== fileName);
    setCalculations(updatedCalculations);
    setFileResults(prev => prev.filter(f => f.fileName !== fileName));
    setFiles(prev => prev.filter(f => f.name !== fileName));
    updateTotalSummary(updatedCalculations);
    
    if (updatedCalculations.length === 0) {
      clearAll();
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-yellow-400">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Calculator className="w-8 h-8" />
                MTN Data Calculator
              </h1>
              <p className="text-gray-700">Excel-based bulk pricing calculator</p>
            </div>
            <button
              onClick={() => setShowPricing(!showPricing)}
              className="px-4 py-2 bg-gray-900 text-yellow-400 font-bold rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Pricing
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-500">{error}</p>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-500 bg-opacity-10 border border-green-500 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-green-500">{success}</p>
            </div>
          </div>
        )}
        
        {/* Pricing Configuration */}
        {showPricing && (
          <div className="mb-6 bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">MTN Data Pricing (No Expiry)</h2>
              {!editingPrices ? (
                <button
                  onClick={() => setEditingPrices(true)}
                  className="px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Prices
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={savePrices}
                    className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={cancelPriceEdit}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={resetToDefault}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset
                  </button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {Object.entries(tempPrices)
                .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
                .map(([capacity, price]) => (
                  <div key={capacity} className="bg-gray-700 rounded-lg p-3">
                    <div className="text-yellow-400 font-bold text-sm mb-1">{capacity}GB</div>
                    {editingPrices ? (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">₵</span>
                        <input
                          type="number"
                          value={price}
                          onChange={(e) => updatePrice(capacity, e.target.value)}
                          className="w-full px-2 py-1 bg-gray-800 text-white rounded text-sm"
                          step="0.01"
                          min="0"
                        />
                        {!defaultPrices[capacity] && (
                          <button
                            onClick={() => removeCapacityTier(capacity)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-white font-bold">₵{price}</div>
                    )}
                  </div>
                ))}
              
              {editingPrices && (
                <button
                  onClick={addCapacityTier}
                  className="bg-gray-700 rounded-lg p-3 border-2 border-dashed border-gray-600 hover:border-yellow-400 transition-colors flex flex-col items-center justify-center"
                >
                  <Plus className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-400 text-sm">Add Tier</span>
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Upload Section */}
        {calculations.length === 0 && (
          <div className="bg-gray-800 rounded-lg p-8">
            <div className="max-w-2xl mx-auto">
              <div className="border-2 border-dashed border-yellow-400 rounded-lg p-8 text-center">
                <FileSpreadsheet className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Upload Excel Files</h3>
                <p className="text-gray-400 mb-6">
                  Upload one or more Excel files with phone numbers and data capacity
                </p>
                
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="inline-block px-6 py-3 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-colors">
                    Choose Files
                  </span>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    multiple
                  />
                </label>
                
                <p className="text-gray-500 text-sm mt-2">You can select multiple files at once</p>
                
                <button
                  onClick={downloadTemplate}
                  className="block mx-auto mt-4 text-yellow-400 hover:text-yellow-300 underline"
                >
                  Download Sample Template
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Results Section */}
        {calculations.length > 0 && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-yellow-400">
                <div className="flex items-center justify-between">
                  <Hash className="w-5 h-5 text-yellow-400" />
                  <span className="text-2xl font-bold text-white">{summary.totalRows}</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">Total Rows</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-2xl font-bold text-white">{summary.validRows}</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">Valid Rows</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <Package className="w-5 h-5 text-blue-500" />
                  <span className="text-2xl font-bold text-white">{summary.totalGB} GB</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">Total Data</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-yellow-400">
                <div className="flex items-center justify-between">
                  <DollarSign className="w-5 h-5 text-yellow-400" />
                  <span className="text-2xl font-bold text-yellow-400">₵{summary.totalCost.toFixed(2)}</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">Total Cost</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 mb-4">
              <label htmlFor="file-upload-more" className="cursor-pointer">
                <span className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 inline-flex">
                  <Plus className="w-4 h-4" />
                  Add More Files
                </span>
                <input
                  id="file-upload-more"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  multiple
                />
              </label>
              <button
                onClick={exportResults}
                className="px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export All Results
              </button>
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
            
            {/* File List */}
            {fileResults.length > 0 && (
              <div className="mb-4 bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-bold mb-2">Loaded Files ({fileResults.length})</h3>
                <div className="space-y-2">
                  {fileResults.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-700 rounded px-3 py-2">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-4 h-4 text-yellow-400" />
                        <span className="text-white text-sm">{file.fileName}</span>
                        <span className="text-gray-400 text-xs">
                          {file.rows} rows | {file.validRows} valid | ₵{file.cost.toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(file.fileName)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Results Table */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-yellow-400 text-gray-900">
                      <th className="px-4 py-3 text-left font-bold">#</th>
                      <th className="px-4 py-3 text-left font-bold">File</th>
                      <th className="px-4 py-3 text-left font-bold">Phone Number</th>
                      <th className="px-4 py-3 text-left font-bold">Capacity</th>
                      <th className="px-4 py-3 text-left font-bold">Tier</th>
                      <th className="px-4 py-3 text-left font-bold">Cost (₵)</th>
                      <th className="px-4 py-3 text-left font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {calculations.map(row => (
                      <tr key={row.id} className={row.isValid ? 'text-white' : 'text-gray-500'}>
                        <td className="px-4 py-3">{row.id}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-400">{row.fileName?.replace(/\.(xlsx|xls|csv)$/, '')}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className={row.isValid ? 'text-white' : 'text-red-400'}>
                              {row.formattedPhone || row.originalPhone || '-'}
                            </p>
                            {row.phoneError && (
                              <p className="text-xs text-red-400">{row.phoneError}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className={row.isValid ? 'text-white' : 'text-red-400'}>
                              {row.capacity ? `${row.capacity}GB` : '-'}
                            </p>
                            {row.capacityError && (
                              <p className="text-xs text-red-400">{row.capacityError}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {row.matchedTier || '-'}
                        </td>
                        <td className="px-4 py-3 font-bold">
                          ₵{row.cost.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          {row.isValid ? (
                            <span className="text-green-400">✓ Valid</span>
                          ) : (
                            <span className="text-red-400">✗ Invalid</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 flex items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
            <p className="text-white">Processing file...</p>
          </div>
        </div>
      )}
    </div>
  );
}