// app/page.jsx - DATAMART ENHANCED WITH API DOCUMENTATION NAVIGATION
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { 
  ShoppingCart, 
  X, 
  Check, 
  Loader2, 
  Phone, 
  Hash, 
  Upload, 
  FileSpreadsheet,
  Download,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  User,
  Wallet,
  Package,
  BarChart3,
  LogOut,
  Menu,
  Plus,
  Minus,
  Home,
  CreditCard,
  History,
  Settings,
  ArrowLeft,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Shield,
  RefreshCw,
  FileText,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  Terminal // Added Terminal icon for API Docs
} from 'lucide-react';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://server-datamart-reseller.onrender.com/api';

export default function DataMartMainPage() {
  const router = useRouter();
  
  // State Management
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [beneficiaryNumber, setBeneficiaryNumber] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [activeNetwork, setActiveNetwork] = useState('MTN');
  const [purchaseMode, setPurchaseMode] = useState('single');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userBalance, setUserBalance] = useState(0);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkOrders, setBulkOrders] = useState([]);
  const [processingBulk, setProcessingBulk] = useState(false);
  const [bulkErrors, setBulkErrors] = useState([]);
  const [bulkParseProgress, setBulkParseProgress] = useState('');
  const [manualBulkInput, setManualBulkInput] = useState('');
  const [bulkInputMode, setBulkInputMode] = useState('file'); // 'file' or 'manual'
  const [showPreview, setShowPreview] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'valid', 'invalid'
  const [bulkSummary, setBulkSummary] = useState({
    total: 0,
    valid: 0,
    invalid: 0,
    totalCost: 0
  });
  
  const fileInputRef = useRef(null);

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem('Token');
      const storedUserData = localStorage.getItem('userData');

      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Verify token with backend
      const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsAuthenticated(true);
          
          if (storedUserData) {
            const user = JSON.parse(storedUserData);
            setUserData(user);
            setUserBalance(user.wallet?.balance || 0);
          }
          
          setAuthLoading(false);
          fetchUserProfile(token);
        } else {
          handleLogout();
        }
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      handleLogout();
    }
  };

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'x-auth-token': token
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserData(data.data);
          setUserBalance(data.data.wallet?.balance || 0);
          localStorage.setItem('userData', JSON.stringify(data.data));
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  // Fetch products after authentication
  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('Token');
      
      if (!token) {
        setError('Authentication required. Please login.');
        router.push('/auth/login');
        return;
      }
      
      // Fetch actual products from API
      const response = await fetch(`${API_BASE_URL}/purchase/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please login again.');
          handleLogout();
          return;
        }
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Transform the API data to match UI structure
        const transformedProducts = data.data.map(product => ({
          id: product._id,
          productCode: product.productCode,
          name: product.name,
          capacity: product.capacity ? 
            `${product.capacity.value}${product.capacity.unit}` : // Show value with unit (e.g., "1GB", "500MB")
            'N/A',
          capacityValue: product.capacity?.value || 0, // Store numeric value for matching
          capacityUnit: product.capacity?.unit || 'GB',
          price: product.price || product.userPrice || 0,
          validity: product.validity ? 
            `${product.validity.value} ${product.validity.unit}` : 
            'No Expiry',
          network: 'MTN',
          description: product.description || '',
          discount: product.discount || 0,
          originalPrice: product.originalPrice || product.price,
          available: product.available !== false
        }));
        
        setProducts(transformedProducts);
        
        if (transformedProducts.length === 0) {
          setError('No products available at the moment.');
        }
      } else {
        setError(data.message || 'Failed to load products');
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please check your connection and try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('Token');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setUserData(null);
    router.push('/auth/login');
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#2a2d3a] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
          <Loader2 className="w-12 h-12 animate-spin text-yellow-400 mx-auto mb-4" />
          <p className="text-white text-lg">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Handlers
  const handleProductSelect = (product) => {
    if (purchaseMode === 'single') {
      setSelectedProduct(product);
      setQuantity(1);
      setBeneficiaryNumber('');
      setError('');
      setSuccess('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Format phone number helper
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    let cleaned = String(phone).replace(/\D/g, '');
    
    // Handle different formats
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

  // Parse capacity value helper
  const parseCapacityValue = (value) => {
    if (!value) return null;
    
    const strValue = String(value).trim().toLowerCase();
    
    // Remove common units and spaces
    let cleanValue = strValue.replace(/\s*(gb|gig|gigabyte|mb|megabyte|meg)\s*/gi, '');
    
    // Check if it's MB (500MB case)
    if (strValue.includes('mb') || strValue.includes('megabyte')) {
      const mbValue = parseFloat(cleanValue);
      if (!isNaN(mbValue)) {
        // Convert MB to value that matches product (500MB = 500 in products)
        return mbValue;
      }
    }
    
    // Parse as GB
    const gbValue = parseFloat(cleanValue);
    if (!isNaN(gbValue) && gbValue > 0 && gbValue <= 1000) {
      return gbValue;
    }
    
    return null;
  };

  const handleAddToCart = () => {
    setError('');
    setSuccess('');
    
    if (!beneficiaryNumber) {
      setError('Please enter beneficiary phone number');
      return;
    }

    if (!validatePhoneNumber(beneficiaryNumber)) {
      setError('Invalid Ghana phone number format (e.g., 024XXXXXXX)');
      return;
    }

    const cartItem = {
      id: Date.now(),
      product: selectedProduct,
      beneficiaryNumber,
      quantity,
      totalPrice: selectedProduct.price * quantity
    };

    setCart([...cart, cartItem]);
    setSuccess(`Added ${quantity} x ${selectedProduct.capacity} to cart!`);
    
    setTimeout(() => {
      setSelectedProduct(null);
      setBeneficiaryNumber('');
      setQuantity(1);
      setSuccess('');
    }, 2000);
  };

  const handleDirectPurchase = async () => {
    setError('');
    setSuccess('');
    
    if (!beneficiaryNumber) {
      setError('Please enter beneficiary phone number');
      return;
    }

    if (!validatePhoneNumber(beneficiaryNumber)) {
      setError('Invalid Ghana phone number format');
      return;
    }

    const totalCost = selectedProduct.price * quantity;
    if (totalCost > userBalance) {
      setError(`Insufficient wallet balance. You need GHS ${totalCost.toFixed(2)} but have GHS ${userBalance.toFixed(2)}`);
      return;
    }

    setPurchasing(true);
    try {
      const token = localStorage.getItem('Token');
      
      const response = await fetch(`${API_BASE_URL}/purchase/orders/single`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          beneficiaryNumber
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setUserBalance(data.data.balance || (userBalance - totalCost));
        setSuccess(`Purchase successful! ${selectedProduct.capacity} sent to ${beneficiaryNumber}`);
        
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData && data.data.balance !== undefined) {
          userData.wallet.balance = data.data.balance;
          localStorage.setItem('userData', JSON.stringify(userData));
        }
        
        setTimeout(() => {
          setSelectedProduct(null);
          setBeneficiaryNumber('');
          setQuantity(1);
          setSuccess('');
        }, 3000);
      } else {
        setError(data.message || 'Purchase failed. Please try again.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setPurchasing(false);
    }
  };

  // ENHANCED FILE UPLOAD WITH PROPER EXCEL PARSING
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(fileExtension)) {
      setError('Please upload a valid Excel (.xlsx, .xls) or CSV (.csv) file');
      return;
    }

    setBulkFile(file);
    setError('');
    setBulkErrors([]);
    setBulkParseProgress('Reading file...');
    
    if (fileExtension === 'csv') {
      parseCSVFile(file);
    } else {
      parseExcelFile(file);
    }
  };

  // Parse Excel file with XLSX
  const parseExcelFile = async (file) => {
    try {
      setBulkParseProgress('Parsing Excel file...');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          
          // Get first sheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON with header
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
          
          if (jsonData.length < 2) {
            setError('File is empty or has no data rows');
            setBulkParseProgress('');
            return;
          }
          
          // Process data
          processFileData(jsonData);
          
        } catch (error) {
          setError('Failed to parse Excel file: ' + error.message);
          setBulkParseProgress('');
        }
      };
      
      reader.onerror = () => {
        setError('Failed to read file');
        setBulkParseProgress('');
      };
      
      reader.readAsArrayBuffer(file);
      
    } catch (error) {
      setError('Failed to process Excel file: ' + error.message);
      setBulkParseProgress('');
    }
  };

  // Parse CSV file
  const parseCSVFile = async (file) => {
    try {
      setBulkParseProgress('Parsing CSV file...');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const lines = content.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          setError('File is empty or has no data rows');
          setBulkParseProgress('');
          return;
        }
        
        // Convert CSV to 2D array format like Excel
        const data = lines.map(line => line.split(',').map(cell => cell.trim()));
        processFileData(data);
      };
      
      reader.onerror = () => {
        setError('Failed to read CSV file');
        setBulkParseProgress('');
      };
      
      reader.readAsText(file);
      
    } catch (error) {
      setError('Failed to process CSV file: ' + error.message);
      setBulkParseProgress('');
    }
  };

  // Process file data (both Excel and CSV)
  const processFileData = (data) => {
    const orders = [];
    const errors = [];
    
    // Get headers (first row)
    const headers = data[0].map(h => String(h).toLowerCase().trim());
    
    // Find column indices
    let phoneColumnIndex = headers.findIndex(h => 
      h.includes('number') || h.includes('phone') || h.includes('beneficiary') || h.includes('mobile')
    );
    let capacityColumnIndex = headers.findIndex(h => 
      h.includes('capacity') || h.includes('data') || h.includes('gb') || h.includes('bundle')
    );
    
    if (phoneColumnIndex === -1 || capacityColumnIndex === -1) {
      setError('Invalid file format. Required columns: phone/number and capacity/data');
      setBulkParseProgress('');
      return;
    }
    
    // Process rows (skip header, max 100 rows)
    const maxRows = Math.min(data.length - 1, 100);
    
    for (let i = 1; i <= maxRows; i++) {
      const row = data[i];
      if (!row || row.every(cell => !cell)) continue; // Skip empty rows
      
      const phoneValue = row[phoneColumnIndex] || '';
      const capacityValue = row[capacityColumnIndex] || '';
      
      // Format and validate phone
      const formattedPhone = formatPhoneNumber(phoneValue);
      const isValidPhone = validatePhoneNumber(formattedPhone);
      
      // Parse capacity
      const parsedCapacity = parseCapacityValue(capacityValue);
      
      // Find matching product
      let product = null;
      if (parsedCapacity !== null) {
        // Try to match by capacity value
        product = products.find(p => {
          // Handle MB products (500MB)
          if (p.capacityUnit === 'MB' && parsedCapacity === 500) {
            return p.capacityValue === 500;
          }
          // Handle GB products
          return p.capacityValue === parsedCapacity;
        });
      }
      
      // Build error messages
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
        row: i,
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
        errors.push(`Row ${i}: ${rowErrors.join(', ')}`);
      }
    }
    
    if (data.length > 101) {
      errors.push(`Note: Only first 100 rows processed (file has ${data.length - 1} rows)`);
    }
    
    // Update state
    setBulkOrders(orders);
    setBulkErrors(errors);
    setBulkParseProgress('');
    
    // Calculate summary
    const validOrders = orders.filter(o => o.isValid);
    setBulkSummary({
      total: orders.length,
      valid: validOrders.length,
      invalid: orders.length - validOrders.length,
      totalCost: validOrders.reduce((sum, o) => sum + o.price, 0)
    });
    
    // Show success message
    if (validOrders.length > 0) {
      setSuccess(`Loaded ${validOrders.length} valid orders from ${orders.length} rows`);
    } else {
      setError(`No valid orders found in ${orders.length} rows. Please check your data.`);
    }
  };

  const handleManualBulkAdd = () => {
    const lines = manualBulkInput.trim().split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      setError('Please enter at least one order in the format: phone_number capacity');
      return;
    }
    
    const orders = [];
    const errors = [];
    
    lines.forEach((line, index) => {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 2) {
        errors.push(`Line ${index + 1}: Invalid format. Expected: phone_number capacity`);
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
        row: index + 1,
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
        errors: errors.filter(e => e.includes(`Line ${index + 1}`)).map(e => e.split(': ')[1]),
        status: 'pending'
      });
    });
    
    if (orders.length > 0) {
      setBulkOrders(prev => [...prev, ...orders]);
      const validOrders = orders.filter(o => o.isValid);
      setBulkSummary({
        total: bulkOrders.length + orders.length,
        valid: bulkOrders.filter(o => o.isValid).length + validOrders.length,
        invalid: bulkOrders.filter(o => !o.isValid).length + orders.filter(o => !o.isValid).length,
        totalCost: bulkOrders.filter(o => o.isValid).reduce((sum, o) => sum + o.price, 0) + 
                   validOrders.reduce((sum, o) => sum + o.price, 0)
      });
      
      setSuccess(`Added ${validOrders.length} valid orders from ${orders.length} lines`);
      setManualBulkInput('');
    }
    
    if (errors.length > 0) {
      setBulkErrors(errors);
    }
  };

  const processBulkOrders = async () => {
    const validOrders = bulkOrders.filter(o => o.isValid);
    
    if (validOrders.length === 0) {
      setError('No valid orders to process');
      return;
    }

    const totalCost = validOrders.reduce((sum, order) => sum + order.price, 0);
    if (totalCost > userBalance) {
      setError(`Insufficient wallet balance. Need GHS ${totalCost.toFixed(2)}, have GHS ${userBalance.toFixed(2)}`);
      return;
    }

    setProcessingBulk(true);
    setError('');
    setBulkErrors([]);
    
    try {
      const token = localStorage.getItem('Token');
      
      // Transform bulk orders to match API format
      const orders = validOrders.map(order => ({
        productId: order.productId,
        beneficiaryNumber: order.beneficiary,
        quantity: 1
      }));
      
      // Call bulk order endpoint
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
        setUserBalance(data.data.newBalance);
        setSuccess(`Successfully processed ${data.data.processedCount} orders`);
        
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData) {
          userData.wallet.balance = data.data.newBalance;
          localStorage.setItem('userData', JSON.stringify(userData));
        }
        
        // Update order statuses
        setBulkOrders(prev => prev.map((order) => {
          if (order.isValid) {
            return { ...order, status: 'completed' };
          }
          return order;
        }));
        
        setTimeout(() => {
          setBulkOrders([]);
          setBulkFile(null);
          setBulkErrors([]);
          setBulkParseProgress('');
          setBulkSummary({ total: 0, valid: 0, invalid: 0, totalCost: 0 });
          setSuccess('');
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 5000);
      } else {
        setError(data.message || 'Bulk processing failed');
        if (data.errors) {
          setBulkErrors(data.errors);
        }
      }
    } catch (error) {
      console.error('Bulk processing error:', error);
      setError('Bulk processing failed. Please try again.');
      setBulkErrors(['Network error: ' + error.message]);
    } finally {
      setProcessingBulk(false);
    }
  };

  // Export results to Excel
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
  };

  // Clear bulk orders
  const clearBulkOrders = () => {
    setBulkOrders([]);
    setBulkFile(null);
    setBulkErrors([]);
    setBulkParseProgress('');
    setBulkSummary({ total: 0, valid: 0, invalid: 0, totalCost: 0 });
    setError('');
    setSuccess('');
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
    
    // Add column widths
    ws['!cols'] = [{ wch: 15 }, { wch: 10 }];
    
    XLSX.writeFile(wb, 'datamart_bulk_template.xlsx');
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const getTotalCartAmount = () => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const processCartCheckout = async () => {
    if (cart.length === 0) {
      setError('Cart is empty');
      return;
    }

    const totalAmount = getTotalCartAmount();
    if (totalAmount > userBalance) {
      setError(`Insufficient balance. Need GHS ${totalAmount.toFixed(2)}`);
      return;
    }

    try {
      const token = localStorage.getItem('Token');
      
      // Convert cart items to bulk order format
      const orders = cart.map(item => ({
        productId: item.product.id,
        beneficiaryNumber: item.beneficiaryNumber,
        quantity: item.quantity
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
        setUserBalance(data.data.newBalance);
        setCart([]);
        setShowCart(false);
        setSuccess('Cart items purchased successfully!');
        
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData) {
          userData.wallet.balance = data.data.newBalance;
          localStorage.setItem('userData', JSON.stringify(userData));
        }
      } else {
        setError(data.message || 'Checkout failed');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setError('Checkout failed. Please try again.');
    }
  };

  // Get filtered bulk orders
  const getFilteredBulkOrders = () => {
    if (filterStatus === 'valid') {
      return bulkOrders.filter(o => o.isValid);
    } else if (filterStatus === 'invalid') {
      return bulkOrders.filter(o => !o.isValid);
    }
    return bulkOrders;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2a2d3a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-yellow-400 mx-auto mb-4" />
          <p className="text-white text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2a2d3a] relative">
      {/* RESPONSIVE HEADER WITH API DOCS NAVIGATION */}
      <header className="bg-[#1f2128] border-b border-gray-700 sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 text-white hover:text-yellow-400 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <h1 className="text-xl sm:text-2xl font-bold text-yellow-400">DATAMART</h1>
              
              {/* UPDATED DESKTOP NAVIGATION WITH API DOCS */}
              <nav className="hidden lg:flex items-center gap-6 ml-8">
                <a href="#" className="text-yellow-400 font-medium hover:text-yellow-500 transition-colors">Home</a>
                <a href="/orders" className="text-gray-300 hover:text-white transition-colors">Orders</a>
                <button 
                  onClick={() => setPurchaseMode('bulk')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Bulk Orders
                </button>
                <a href="/api-docs" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1">
                  <Terminal className="w-4 h-4" />
                  API Docs
                </a>
                <a href="/profile" className="text-gray-300 hover:text-white transition-colors">Profile</a>
              </nav>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-4">
              {userData && (
                <div className="hidden lg:flex items-center gap-2 text-sm text-gray-400">
                  <User className="w-4 h-4" />
                  <span>{userData.fullName || userData.email}</span>
                  {userData.role === 'admin' && (
                    <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded">Admin</span>
                  )}
                </div>
              )}
              
              <div className="hidden sm:flex items-center gap-2 bg-gray-800 px-2 sm:px-3 py-1.5 rounded-lg">
                <Wallet className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-medium text-sm sm:text-base">₵{userBalance.toFixed(2)}</span>
              </div>
              
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 text-white hover:text-yellow-400 transition-colors"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cart.length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="p-2 text-white hover:text-yellow-400 transition-colors"
              >
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU DRAWER WITH API DOCS */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileMenu(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-[#1f2128] shadow-xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Menu</h2>
                <button onClick={() => setShowMobileMenu(false)} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {userData && (
                <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-400">Logged in as</p>
                  <p className="text-white font-medium">{userData.fullName || userData.email}</p>
                  {userData.role && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded">
                      {userData.role}
                    </span>
                  )}
                </div>
              )}
              
              {/* UPDATED MOBILE NAVIGATION WITH API DOCS */}
              <nav className="space-y-2">
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-yellow-400 bg-gray-800 rounded-lg">
                  <Home className="w-5 h-5" />
                  Home
                </a>
                <a href="/orders" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg">
                  <Package className="w-5 h-5" />
                  Orders
                </a>
                <button 
                  onClick={() => {
                    setPurchaseMode('bulk');
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg text-left"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  Bulk Orders
                </button>
                <a href="/api-docs" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg">
                  <Terminal className="w-5 h-5" />
                  API Documentation
                </a>
                <a href="/profile" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg">
                  <User className="w-5 h-5" />
                  Profile
                </a>
                <a href="/wallet" className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg">
                  <CreditCard className="w-5 h-5" />
                  Top Up Wallet
                </a>
              </nav>
              
              <div className="mt-6 p-3 bg-gray-800 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Wallet Balance</p>
                <p className="text-2xl font-bold text-yellow-400">₵{userBalance.toFixed(2)}</p>
              </div>
              
              <div className="mt-4 space-y-2">
                <button 
                  onClick={() => router.push('/api-docs')}
                  className="w-full py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Terminal className="w-4 h-4" />
                  View API Docs
                </button>
                <button className="w-full py-2 bg-yellow-400 text-gray-900 font-medium rounded-lg hover:bg-yellow-500 transition-colors">
                  Top Up Wallet
                </button>
                <button 
                  onClick={() => router.push('/orders')}
                  className="w-full py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
                >
                  View Orders
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESPONSIVE HERO SECTION - Same as original */}
      <section className="bg-gradient-to-r from-yellow-400 to-yellow-600 py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
              Ghana's #1 Data Top-Up Platform
            </h2>
            <p className="text-gray-800 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8">
              Instant delivery • Best prices • 24/7 service
            </p>
            
            <div className="inline-flex bg-gray-900 rounded-lg p-1">
              <button
                onClick={() => setPurchaseMode('single')}
                className={`px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors ${
                  purchaseMode === 'single'
                    ? 'bg-yellow-400 text-gray-900'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Single Purchase
              </button>
              <button
                onClick={() => setPurchaseMode('bulk')}
                className={`px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors ${
                  purchaseMode === 'bulk'
                    ? 'bg-yellow-400 text-gray-900'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Bulk Purchase
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* NETWORK TABS */}
      <div className="container mx-auto px-4 pt-6 sm:pt-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveNetwork('MTN')}
            className={`px-4 sm:px-6 py-2 font-medium rounded whitespace-nowrap transition-all flex-shrink-0 ${
              activeNetwork === 'MTN' 
                ? 'bg-yellow-400 text-black shadow-lg' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            MTN
          </button>
          <button
            onClick={() => setActiveNetwork('Vodafone')}
            className={`px-4 sm:px-6 py-2 font-medium rounded whitespace-nowrap transition-all flex-shrink-0 ${
              activeNetwork === 'Vodafone' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Vodafone
          </button>
          <button
            onClick={() => setActiveNetwork('AirtelTigo')}
            className={`px-4 sm:px-6 py-2 font-medium rounded whitespace-nowrap transition-all flex-shrink-0 ${
              activeNetwork === 'AirtelTigo' 
                ? 'bg-red-600 text-white shadow-lg' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            AirtelTigo
          </button>
        </div>
      </div>

      {/* MAIN CONTENT - Same as original */}
      <main className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        {/* Error Message Display */}
        {error && !selectedProduct && purchaseMode !== 'bulk' && (
          <div className="mb-6 p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-500">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message Display */}
        {success && !selectedProduct && purchaseMode !== 'bulk' && (
          <div className="mb-6 p-4 bg-green-500 bg-opacity-10 border border-green-500 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-green-500">{success}</p>
            </div>
          </div>
        )}

        {purchaseMode === 'bulk' ? (
          // ENHANCED BULK PURCHASE INTERFACE
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6 lg:p-8">
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
            
            {/* Error/Success Messages for Bulk */}
            {error && purchaseMode === 'bulk' && (
              <div className="mb-4 p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-500">{error}</p>
                </div>
              </div>
            )}
            
            {success && purchaseMode === 'bulk' && (
              <div className="mb-4 p-4 bg-green-500 bg-opacity-10 border border-green-500 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className="text-green-500">{success}</p>
                </div>
              </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {/* Upload Section or Manual Input */}
              <div>
                <h4 className="text-base sm:text-lg font-medium text-white mb-4">
                  {bulkInputMode === 'manual' ? 'Manual Entry' : 'Upload Orders File'}
                </h4>
                
                {/* Show either file upload or manual input */}
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
                    
                    {/* File Format Info */}
                    <div className="mt-4 p-3 bg-blue-500 bg-opacity-10 rounded-lg">
                      <p className="text-blue-400 text-sm mb-1 font-medium">
                        <Info className="inline w-4 h-4 mr-1" />
                        Accepted File Formats:
                      </p>
                      <ul className="text-blue-300 text-xs space-y-1 ml-5">
                        <li>• Column 1: "number" OR "beneficiary" (phone)</li>
                        <li>• Column 2: "capacity" (e.g., 1, 2, 500)</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Instructions with Better Visual */}
              <div>
                <h4 className="text-base sm:text-lg font-medium text-white mb-4">How It Works</h4>
                <div className="space-y-3">
                  {[
                    { icon: <Download className="w-5 h-5" />, text: "Download our template Excel/CSV file" },
                    { icon: <FileText className="w-5 h-5" />, text: "Add phone numbers and data capacities" },
                    { icon: <Upload className="w-5 h-5" />, text: "Upload the file (max 100 orders)" },
                    { icon: <Zap className="w-5 h-5" />, text: "Click process to execute all orders instantly" }
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
                
                <div className="mt-6 p-4 bg-purple-600 bg-opacity-10 border border-purple-500 rounded-lg">
                  <p className="text-purple-400 text-sm font-medium mb-1">
                    <Zap className="inline w-4 h-4 mr-1" />
                    Pro Tip:
                  </p>
                  <p className="text-purple-300 text-xs">
                    Process up to 100 orders in one click! Perfect for corporate data distribution.
                  </p>
                </div>
              </div>
            </div>
            
            {/* ENHANCED BULK ORDERS PREVIEW */}
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
                
                {/* Desktop Table - Shows ALL rows with scrolling */}
                {showPreview && (
                  <div className="hidden sm:block">
                    <div className="bg-gray-700 rounded-lg overflow-hidden">
                      <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-600 sticky top-0 z-10">
                            <tr>
                              <th className="px-4 py-3 text-gray-300">Row #</th>
                              <th className="px-4 py-3 text-gray-300">Phone Number</th>
                              <th className="px-4 py-3 text-gray-300">Capacity</th>
                              <th className="px-4 py-3 text-gray-300">Product</th>
                              <th className="px-4 py-3 text-gray-300">Price</th>
                              <th className="px-4 py-3 text-gray-300">Status</th>
                              <th className="px-4 py-3 text-gray-300">Issues</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-600">
                            {getFilteredBulkOrders().map((order) => (
                              <tr key={`${order.row}-${order.formattedPhone}`} 
                                  className={`hover:bg-gray-600 transition-colors ${
                                    !order.isValid ? 'bg-red-900 bg-opacity-20' : ''
                                  } ${order.status === 'completed' ? 'bg-green-900 bg-opacity-10' : ''}`}>
                                <td className="px-4 py-3 text-white">{order.row}</td>
                                <td className="px-4 py-3">
                                  <div>
                                    <p className={order.isValid ? 'text-white' : 'text-red-400'}>
                                      {order.formattedPhone}
                                    </p>
                                    {order.originalPhone !== order.formattedPhone && (
                                      <p className="text-xs text-gray-400">Original: {order.originalPhone}</p>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div>
                                    <p className={order.isValid ? 'text-white' : 'text-red-400'}>
                                      {order.capacity}
                                    </p>
                                    {order.originalCapacity && order.originalCapacity !== order.capacity && (
                                      <p className="text-xs text-gray-400">Input: {order.originalCapacity}</p>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-white">{order.productName}</td>
                                <td className="px-4 py-3">
                                  {order.price > 0 ? (
                                    <span className="text-yellow-400 font-medium">₵{order.price.toFixed(2)}</span>
                                  ) : (
                                    <span className="text-gray-500">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {order.status === 'completed' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-500 bg-opacity-20 text-green-400">
                                      <CheckCircle className="w-3 h-3" />
                                      Completed
                                    </span>
                                  ) : order.status === 'failed' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-red-500 bg-opacity-20 text-red-400">
                                      <XCircle className="w-3 h-3" />
                                      Failed
                                    </span>
                                  ) : order.isValid ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-yellow-500 bg-opacity-20 text-yellow-400">
                                      <AlertCircle className="w-3 h-3" />
                                      Pending
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-red-500 bg-opacity-20 text-red-400">
                                      <XCircle className="w-3 h-3" />
                                      Invalid
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {order.errors && order.errors.length > 0 ? (
                                    <ul className="text-xs text-red-300">
                                      {order.errors.map((err, idx) => (
                                        <li key={idx}>• {err}</li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <span className="text-xs text-green-400">✓ Ready</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-center text-sm text-gray-400">
                      Showing {getFilteredBulkOrders().length} of {bulkOrders.length} orders
                      {bulkSummary.invalid > 0 && (
                        <span className="text-orange-400 ml-2">
                          ({bulkSummary.invalid} invalid rows need correction)
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Mobile Cards - Shows ALL with scrolling */}
                {showPreview && (
                  <div className="sm:hidden">
                    <div className="max-h-96 overflow-y-auto space-y-3">
                      {getFilteredBulkOrders().map((order) => (
                        <div key={`${order.row}-${order.formattedPhone}`} 
                             className={`bg-gray-700 rounded-lg p-4 ${
                               !order.isValid ? 'border-2 border-red-500' : ''
                             } ${order.status === 'completed' ? 'border-2 border-green-500' : ''}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="text-gray-400 text-xs">Row {order.row}</span>
                              <p className="text-white font-medium">{order.capacity}</p>
                              <p className="text-gray-400 text-xs mt-1">{order.productName}</p>
                            </div>
                            {order.status === 'completed' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-500 bg-opacity-20 text-green-400">
                                <CheckCircle className="w-3 h-3" />
                                Completed
                              </span>
                            ) : order.isValid ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-yellow-500 bg-opacity-20 text-yellow-400">
                                <AlertCircle className="w-3 h-3" />
                                Pending
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-red-500 bg-opacity-20 text-red-400">
                                <XCircle className="w-3 h-3" />
                                Invalid
                              </span>
                            )}
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className={order.isValid ? 'text-gray-300' : 'text-red-400'}>
                              <Phone className="inline w-3 h-3 mr-1 text-gray-500" />
                              {order.formattedPhone || order.originalPhone}
                            </p>
                            <p className="text-yellow-400 font-medium">
                              {order.price > 0 ? `₵${order.price.toFixed(2)}` : 'No price'}
                            </p>
                            {order.errors && order.errors.length > 0 && (
                              <div className="mt-2 text-xs text-red-300">
                                {order.errors.map((err, idx) => (
                                  <p key={idx}>• {err}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-center text-sm text-gray-400">
                      Showing {getFilteredBulkOrders().length} orders
                    </div>
                  </div>
                )}
                
                {/* Process Section */}
                <div className="mt-6 p-4 bg-gray-700 rounded-lg">
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
                  
                  {/* Show any bulk processing errors */}
                  {bulkErrors.length > 0 && (
                    <div className="mt-4 p-3 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg">
                      <p className="text-red-400 text-sm font-medium mb-2">Processing Errors:</p>
                      <ul className="text-xs text-red-300 space-y-1">
                        {bulkErrors.slice(0, 5).map((err, idx) => (
                          <li key={idx}>• {err}</li>
                        ))}
                      </ul>
                      {bulkErrors.length > 5 && (
                        <p className="text-red-300 text-xs mt-2">
                          ...and {bulkErrors.length - 5} more errors
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : selectedProduct ? (
          // COMPACT SELECTED PRODUCT VIEW - Same as original
          <div className="bg-[#1f2128] rounded-xl p-4 sm:p-6 shadow-2xl animate-fadeIn max-w-md mx-auto">
            <button
              onClick={() => setSelectedProduct(null)}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to products</span>
            </button>
            
            <div className="text-center mb-4">
              <span className="inline-block px-3 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full mb-2">
                MTN
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                {selectedProduct.capacity}
              </h2>
              <p className="text-yellow-400 text-xl font-bold mt-2">
                ₵{selectedProduct.price.toFixed(2)}
              </p>
            </div>

            {error && (
              <div className="mb-3 p-2 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg">
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-red-500 text-sm">{error}</span>
                </div>
              </div>
            )}
            
            {success && (
              <div className="mb-3 p-2 bg-green-500 bg-opacity-10 border border-green-500 rounded-lg">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-green-500 text-sm">{success}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Beneficiary Input */}
              <div>
                <label className="text-gray-400 text-sm mb-2 block">
                  Beneficiary Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="tel"
                    value={beneficiaryNumber}
                    onChange={(e) => setBeneficiaryNumber(e.target.value)}
                    placeholder="024XXXXXXX"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Quantity Selector - Compact */}
              <div className="flex items-center justify-between bg-gray-700 rounded-lg p-2">
                <label className="text-gray-400 text-sm">Quantity</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    className="w-8 h-8 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors flex items-center justify-center"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-12 text-center text-white font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => quantity < 100 && setQuantity(quantity + 1)}
                    className="w-8 h-8 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Total Price - Compact */}
              <div className="bg-gray-700 rounded-lg p-3 flex justify-between items-center">
                <span className="text-gray-400 text-sm">Total</span>
                <span className="text-xl font-bold text-yellow-400">
                  ₵{(selectedProduct.price * quantity).toFixed(2)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={purchasing || success}
                  className="py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleDirectPurchase}
                  disabled={purchasing || success}
                  className="py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {purchasing && <Loader2 className="w-4 h-4 animate-spin" />}
                  {purchasing ? 'Processing...' : 'Buy Now'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // PRODUCTS GRID
          products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
              {products
                .filter(product => product.network === activeNetwork)
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={() => handleProductSelect(product)}
                  />
                ))}
            </div>
          ) : !loading && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-4">
                {error || 'No products available'}
              </p>
              <button
                onClick={() => fetchProducts()}
                className="px-6 py-2 bg-yellow-400 text-gray-900 font-medium rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          )
        )}
      </main>

      {/* RESPONSIVE STATS SECTION - Same as original */}
      <section className="bg-gray-800 py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-400 mb-1 sm:mb-2">50K+</p>
              <p className="text-gray-400 text-xs sm:text-sm">Happy Customers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-400 mb-1 sm:mb-2">1M+</p>
              <p className="text-gray-400 text-xs sm:text-sm">Transactions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-400 mb-1 sm:mb-2">24/7</p>
              <p className="text-gray-400 text-xs sm:text-sm">Service</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-400 mb-1 sm:mb-2">99.9%</p>
              <p className="text-gray-400 text-xs sm:text-sm">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER - Same as original */}
      <footer className="bg-[#1f2128] py-8 border-t border-gray-700">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-yellow-400 font-bold text-xl mb-2">DATAMART</h3>
            <p className="text-gray-400 text-sm">© 2024 DATAMART. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* CART SIDEBAR - Same as original */}
      {showCart && (
        <CartSidebar 
          cart={cart} 
          onClose={() => setShowCart(false)} 
          onRemoveItem={removeFromCart} 
          totalAmount={getTotalCartAmount()}
          onCheckout={processCartCheckout}
          userBalance={userBalance}
        />
      )}
      
      {/* UPDATED ACCOUNT DROPDOWN WITH API DOCS */}
      {showAccountMenu && (
        <div className="absolute top-16 right-4 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-50">
          {userData && (
            <div className="px-3 py-2 border-b border-gray-700">
              <p className="text-xs text-gray-400">Signed in as</p>
              <p className="text-white text-sm font-medium truncate">{userData.email}</p>
            </div>
          )}
          <a href="/profile" className="flex items-center gap-2 px-3 py-1.5 text-gray-300 hover:bg-gray-700 hover:text-white text-sm">
            <User className="w-3 h-3" />
            Profile
          </a>
          <a href="/orders" className="flex items-center gap-2 px-3 py-1.5 text-gray-300 hover:bg-gray-700 hover:text-white text-sm">
            <History className="w-3 h-3" />
            Order History
          </a>
          <a href="/wallet" className="flex items-center gap-2 px-3 py-1.5 text-gray-300 hover:bg-gray-700 hover:text-white text-sm">
            <CreditCard className="w-3 h-3" />
            Top Up Wallet
          </a>
          <a href="/api-docs" className="flex items-center gap-2 px-3 py-1.5 text-gray-300 hover:bg-gray-700 hover:text-white text-sm">
            <Terminal className="w-3 h-3" />
            API Documentation
          </a>
          {userData?.role === 'admin' && (
            <>
              <hr className="my-1 border-gray-700" />
              <a href="/admin" className="flex items-center gap-2 px-3 py-1.5 text-purple-400 hover:bg-gray-700 text-sm">
                <Shield className="w-3 h-3" />
                Admin Panel
              </a>
            </>
          )}
          {(userData?.role === 'dealer' || userData?.role === 'supplier') && (
            <>
              <hr className="my-1 border-gray-700" />
              <div className="px-3 py-2">
                <p className="text-xs text-gray-400 mb-1">API Access</p>
                <a href="/api-docs" className="flex items-center gap-2 py-1 text-yellow-400 hover:text-yellow-500 text-sm">
                  <Terminal className="w-3 h-3" />
                  View API Docs
                </a>
              </div>
            </>
          )}
          <hr className="my-1 border-gray-700" />
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-red-400 hover:bg-gray-700 text-left text-sm"
          >
            <LogOut className="w-3 h-3" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

// RESPONSIVE PRODUCT CARD COMPONENT - Same as original
function ProductCard({ product, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className="group cursor-pointer transform transition-all duration-200 hover:scale-105"
    >
      <div className="bg-[#fbbf24] rounded-t-lg sm:rounded-t-xl p-3 sm:p-4 lg:p-6 relative overflow-hidden">
        <span className="absolute top-2 left-2 bg-yellow-600 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs">
          MTN
        </span>
        {product.discount > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs">
            -{product.discount}%
          </span>
        )}
        <div className="text-center pt-6 sm:pt-8">
          <h3 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900">
            {product.capacity}
          </h3>
        </div>
      </div>
      <div className="bg-[#1f2128] rounded-b-lg sm:rounded-b-xl p-2 sm:p-3 lg:p-4 grid grid-cols-3 gap-1 sm:gap-2 group-hover:bg-gray-800 transition-colors">
        <div className="text-center">
          <p className="text-gray-500 text-[10px] sm:text-xs uppercase mb-1">Price</p>
          <p className="text-white font-bold text-xs sm:text-sm">₵{product.price}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 text-[10px] sm:text-xs uppercase mb-1">Rollover</p>
          <p className="text-gray-400 text-[10px] sm:text-xs">N/A</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 text-[10px] sm:text-xs uppercase mb-1">Duration</p>
          <p className="text-gray-400 text-[10px] sm:text-xs truncate">{product.validity}</p>
        </div>
      </div>
    </div>
  );
}

// RESPONSIVE CART SIDEBAR COMPONENT - Same as original
function CartSidebar({ cart, onClose, onRemoveItem, totalAmount, onCheckout, userBalance }) {
  const [processing, setProcessing] = useState(false);
  
  const handleCheckout = async () => {
    setProcessing(true);
    await onCheckout();
    setProcessing(false);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div onClick={onClose} className="absolute inset-0 bg-black bg-opacity-50" />
      
      <div className="relative bg-[#1f2128] w-full max-w-sm sm:max-w-md h-full overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Shopping Cart</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Your cart is empty</p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-yellow-400 text-gray-900 font-medium rounded-lg hover:bg-yellow-500 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {cart.map(item => (
                <div key={item.id} className="bg-gray-800 rounded-lg p-3 sm:p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-medium text-sm sm:text-base">{item.product.capacity}</h4>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm">To: {item.beneficiaryNumber}</p>
                  <p className="text-gray-400 text-xs sm:text-sm">Quantity: {item.quantity}</p>
                  <p className="text-yellow-400 font-bold mt-2 text-sm sm:text-base">
                    ₵{item.totalPrice.toFixed(2)}
                  </p>
                </div>
              ))}
              
              <div className="border-t border-gray-700 pt-4">
                <div className="mb-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Cart Total:</span>
                    <span className="text-white font-medium">₵{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-gray-400 text-sm">Wallet Balance:</span>
                    <span className={`font-medium ${userBalance >= totalAmount ? 'text-green-400' : 'text-red-400'}`}>
                      ₵{userBalance.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg sm:text-xl font-bold text-white">Total:</span>
                  <span className="text-xl sm:text-2xl font-bold text-yellow-400">
                    ₵{totalAmount.toFixed(2)}
                  </span>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  disabled={processing || totalAmount > userBalance}
                  className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                  {processing ? 'Processing...' : `Checkout (${cart.length} items)`}
                </button>
                
                {totalAmount > userBalance && (
                  <p className="mt-2 text-red-400 text-xs text-center">
                    Insufficient wallet balance
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}