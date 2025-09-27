'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    productCode: '',
    description: '',
    capacityValue: '',
    capacityUnit: 'GB',
    validityValue: '',
    validityUnit: 'days',
    status: 'active'
  });
  
  const [pricingData, setPricingData] = useState({
    costPrice: '0',
    agentPrice: '0',
    dealerPrice: '0',
    supplierPrice: '0'
  });
  
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, [currentPage, statusFilter, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('Token');
      
      if (!token) {
        console.error('No auth token found');
        router.push('/admin/login');
        return;
      }
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(statusFilter && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`https://server-datamart-reseller.onrender.com/api/admin/products?${params}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        console.error('Failed to fetch products:', data);
        if (response.status === 401) {
          router.push('/admin/login');
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.productCode?.trim()) {
      newErrors.productCode = 'Product code is required';
    } else if (!/^[A-Z0-9_-]+$/i.test(formData.productCode)) {
      newErrors.productCode = 'Product code must contain only letters, numbers, hyphens and underscores';
    }
    
    if (!formData.capacityValue) {
      newErrors.capacityValue = 'Capacity value is required';
    } else if (isNaN(formData.capacityValue) || parseFloat(formData.capacityValue) <= 0) {
      newErrors.capacityValue = 'Capacity must be a positive number';
    }
    
    if (!formData.validityValue) {
      newErrors.validityValue = 'Validity period is required';
    } else if (isNaN(formData.validityValue) || parseInt(formData.validityValue) <= 0) {
      newErrors.validityValue = 'Validity must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePricing = () => {
    const newErrors = {};
    
    // Parse all prices
    const prices = {
      costPrice: parseFloat(pricingData.costPrice) || 0,
      agentPrice: parseFloat(pricingData.agentPrice) || 0,
      dealerPrice: parseFloat(pricingData.dealerPrice) || 0,
      supplierPrice: parseFloat(pricingData.supplierPrice) || 0
    };
    
    // Check for invalid values
    if (Object.values(prices).some(price => isNaN(price) || price < 0)) {
      newErrors.general = 'All prices must be valid positive numbers';
    }
    
    // Check price hierarchy: supplier < dealer < agent
    if (prices.supplierPrice > prices.dealerPrice) {
      newErrors.general = 'Supplier price must be less than or equal to Dealer price';
    }
    if (prices.dealerPrice > prices.agentPrice) {
      newErrors.general = 'Dealer price must be less than or equal to Agent price';
    }
    if (prices.costPrice > prices.supplierPrice) {
      newErrors.general = 'Cost price should not exceed Supplier price';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const token = localStorage.getItem('Token');
      
      // Prepare the payload matching backend schema
      const productPayload = {
        name: formData.name.trim(),
        productCode: formData.productCode.trim().toUpperCase(),
        description: formData.description?.trim() || '',
        capacity: {
          value: parseFloat(formData.capacityValue),
          unit: formData.capacityUnit.toUpperCase()
        },
        validity: {
          value: parseInt(formData.validityValue),
          unit: formData.validityUnit
        },
        status: formData.status || 'active'
      };
      
      console.log('Sending product data:', productPayload);
      
      const response = await fetch('https://server-datamart-reseller.onrender.com/api/admin/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productPayload)
      });

      const data = await response.json();
      console.log('Server response:', data);
      
      if (!response.ok) {
        if (data.errors) {
          // Handle validation errors from backend
          const backendErrors = {};
          if (Array.isArray(data.errors)) {
            data.errors.forEach(error => {
              // Map backend field names to frontend field names
              if (error.field === 'capacity.value') {
                backendErrors.capacityValue = error.message;
              } else if (error.field === 'capacity.unit') {
                backendErrors.capacityUnit = error.message;
              } else if (error.field === 'validity.value') {
                backendErrors.validityValue = error.message;
              } else if (error.field === 'validity.unit') {
                backendErrors.validityUnit = error.message;
              } else {
                backendErrors[error.field] = error.message;
              }
            });
          } else if (typeof data.errors === 'object') {
            Object.keys(data.errors).forEach(field => {
              backendErrors[field] = data.errors[field];
            });
          } else {
            backendErrors.general = 'Validation failed';
          }
          setErrors(backendErrors);
        } else {
          setErrors({ general: data.message || `Error: ${response.status}` });
        }
        return;
      }
      
      // Success
      setShowCreateModal(false);
      fetchProducts();
      resetForm();
      alert('Product created successfully');
      
    } catch (error) {
      console.error('Request error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const token = localStorage.getItem('Token');
      
      const productPayload = {
        name: formData.name.trim(),
        productCode: formData.productCode.trim().toUpperCase(),
        description: formData.description?.trim() || '',
        capacity: {
          value: parseFloat(formData.capacityValue),
          unit: formData.capacityUnit.toUpperCase()
        },
        validity: {
          value: parseInt(formData.validityValue),
          unit: formData.validityUnit
        },
        status: formData.status
      };
      
      const response = await fetch(`https://server-datamart-reseller.onrender.com/api/admin/products/${selectedProduct._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productPayload)
      });

      const data = await response.json();
      
      if (!response.ok) {
        setErrors({ general: data.message || 'Error updating product' });
        return;
      }
      
      setShowEditModal(false);
      fetchProducts();
      resetForm();
      alert('Product updated successfully');
      
    } catch (error) {
      console.error('Error updating product:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

 const handleUpdatePricing = async (e) => {
  e.preventDefault();
  
  if (!validatePricing()) {
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    const token = localStorage.getItem('Token');
    
    // Parse and validate pricing data
    const prices = {
      productId: selectedProduct._id,  // ADD THIS LINE - include productId in body
      costPrice: parseFloat(pricingData.costPrice) || 0,
      agentPrice: parseFloat(pricingData.agentPrice) || 0,
      dealerPrice: parseFloat(pricingData.dealerPrice) || 0,
      supplierPrice: parseFloat(pricingData.supplierPrice) || 0
    };
    
    console.log('Sending pricing data:', prices);
    
    const response = await fetch(`https://server-datamart-reseller.onrender.com/api/admin/products/${selectedProduct._id}/pricing`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(prices)
    });

    const data = await response.json();
    console.log('Pricing response:', data);
    
    if (!response.ok) {
      setErrors({ general: data.message || 'Error updating pricing' });
      return;
    }
    
    setShowPricingModal(false);
    fetchProducts();
    alert('Pricing updated successfully');
    
  } catch (error) {
    console.error('Error updating pricing:', error);
    setErrors({ general: 'Network error. Please try again.' });
  } finally {
    setIsSubmitting(false);
  }
};
  const handleStatusChange = async (productId, newStatus) => {
    try {
      const token = localStorage.getItem('Token');
      const response = await fetch(`https://server-datamart-reseller.onrender.com/api/admin/products/${productId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        fetchProducts();
        alert(`Product ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      } else {
        alert(data.message || 'Error updating status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating product status');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('Token');
      const response = await fetch(`https://server-datamart-reseller.onrender.com/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        fetchProducts();
        alert('Product deleted successfully');
      } else {
        alert(data.message || 'Error deleting product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      productCode: '',
      description: '',
      capacityValue: '',
      capacityUnit: 'GB',
      validityValue: '',
      validityUnit: 'days',
      status: 'active'
    });
    setErrors({});
    setSelectedProduct(null);
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    
    // Parse capacity and validity from product data
    let capacityValue = '';
    let capacityUnit = 'GB';
    let validityValue = '';
    let validityUnit = 'days';
    
    // Handle different possible data structures from backend
    if (product.capacity) {
      capacityValue = product.capacity.value || '';
      capacityUnit = product.capacity.unit || 'GB';
    } else if (product.dataAmount) {
      // Parse legacy format like "1GB"
      const match = product.dataAmount.match(/^(\d+(?:\.\d+)?)\s?(MB|GB|TB)$/i);
      if (match) {
        capacityValue = match[1];
        capacityUnit = match[2].toUpperCase();
      }
    }
    
    if (product.validity) {
      validityValue = product.validity.value || '';
      validityUnit = product.validity.unit || 'days';
    } else if (product.validityDays) {
      validityValue = product.validityDays.toString();
      validityUnit = 'days';
    }
    
    setFormData({
      name: product.name || '',
      productCode: product.productCode || '',
      description: product.description || '',
      capacityValue,
      capacityUnit,
      validityValue,
      validityUnit,
      status: product.status || 'active'
    });
    setErrors({});
    setShowEditModal(true);
  };

  const openPricingModal = (product) => {
    setSelectedProduct(product);
    
    // Get existing pricing or set defaults to 0
    let agentPrice = 0;
    let dealerPrice = 0;
    let supplierPrice = 0;
    let costPrice = 0;
    
    // Check if pricing array exists and has values
    if (product.pricing && Array.isArray(product.pricing)) {
      const agentPricing = product.pricing.find(p => p.role === 'agent');
      const dealerPricing = product.pricing.find(p => p.role === 'dealer');
      const supplierPricing = product.pricing.find(p => p.role === 'supplier');
      
      agentPrice = agentPricing?.price || 0;
      dealerPrice = dealerPricing?.price || 0;
      supplierPrice = supplierPricing?.price || 0;
    }
    
    // Get cost price if it exists
    costPrice = product.costPrice || 0;
    
    // Set pricing data with proper string conversion
    setPricingData({
      costPrice: costPrice.toString(),
      agentPrice: agentPrice.toString(),
      dealerPrice: dealerPrice.toString(),
      supplierPrice: supplierPrice.toString()
    });
    
    setErrors({});
    setShowPricingModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount || 0);
  };

  // Helper function to display product capacity
  const displayCapacity = (product) => {
    if (product.capacity) {
      return `${product.capacity.value}${product.capacity.unit}`;
    } else if (product.dataAmount) {
      return product.dataAmount;
    }
    return 'N/A';
  };

  // Helper function to display product validity
  const displayValidity = (product) => {
    if (product.validity) {
      return `${product.validity.value} ${product.validity.unit}`;
    } else if (product.validityDays) {
      return `${product.validityDays} days`;
    }
    return 'N/A';
  };

  // Helper function to display pricing status
  const hasPricing = (product) => {
    if (product.pricing && Array.isArray(product.pricing) && product.pricing.length > 0) {
      return product.pricing.some(p => p.price > 0);
    }
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products Management</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage data products and pricing</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:placeholder-gray-400"
            />
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Data Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Validity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pricing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{product.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900 dark:text-gray-200">{product.productCode}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-gray-200">{displayCapacity(product)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-gray-200">{displayValidity(product)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {hasPricing(product) ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Set
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          Not Set
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openPricingModal(product)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Set Pricing"
                        >
                          <CurrencyDollarIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openEditModal(product)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Edit Product"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            const newStatus = product.status === 'active' ? 'inactive' : 'active';
                            handleStatusChange(product._id, newStatus);
                          }}
                          className={product.status === 'active' 
                            ? 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300' 
                            : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'}
                          title={product.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {product.status === 'active' ? (
                            <XCircleIcon className="h-5 w-5" />
                          ) : (
                            <CheckCircleIcon className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete Product"
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
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Product Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create New Product</h2>
            
            {/* Error Alert */}
            {errors.general && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{errors.general}</span>
              </div>
            )}
            
            <form onSubmit={handleCreateProduct}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full px-3 py-2 border ${
                      errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="e.g., Yello Bundle"
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.productCode}
                    onChange={(e) => setFormData({...formData, productCode: e.target.value.toUpperCase()})}
                    className={`w-full px-3 py-2 border ${
                      errors.productCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="e.g., YELLO_1GB_30D"
                    disabled={isSubmitting}
                  />
                  {errors.productCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.productCode}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="e.g., Affordable data bundle for daily use"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data Capacity <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      step="0.1"
                      value={formData.capacityValue}
                      onChange={(e) => setFormData({...formData, capacityValue: e.target.value})}
                      className={`flex-1 px-3 py-2 border ${
                        errors.capacityValue ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="e.g., 1, 500, 2.5"
                      disabled={isSubmitting}
                    />
                    <select
                      value={formData.capacityUnit}
                      onChange={(e) => setFormData({...formData, capacityUnit: e.target.value})}
                      className={`px-3 py-2 border ${
                        errors.capacityUnit ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      disabled={isSubmitting}
                    >
                      <option value="MB">MB</option>
                      <option value="GB">GB</option>
                    </select>
                  </div>
                  {(errors.capacityValue || errors.capacityUnit) && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.capacityValue || errors.capacityUnit}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Validity Period <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={formData.validityValue}
                      onChange={(e) => setFormData({...formData, validityValue: e.target.value})}
                      className={`flex-1 px-3 py-2 border ${
                        errors.validityValue ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="e.g., 30, 7, 1"
                      min="1"
                      disabled={isSubmitting}
                    />
                    <select
                      value={formData.validityUnit}
                      onChange={(e) => setFormData({...formData, validityUnit: e.target.value})}
                      className={`px-3 py-2 border ${
                        errors.validityUnit ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      disabled={isSubmitting}
                    >
                      <option value="days">Days</option>
                      <option value="hours">Hours</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                    </select>
                  </div>
                  {(errors.validityValue || errors.validityUnit) && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.validityValue || errors.validityUnit}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Edit Product</h2>
            
            {errors.general && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{errors.general}</span>
              </div>
            )}
            
            <form onSubmit={handleUpdateProduct}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full px-3 py-2 border ${
                      errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.productCode}
                    onChange={(e) => setFormData({...formData, productCode: e.target.value.toUpperCase()})}
                    className={`w-full px-3 py-2 border ${
                      errors.productCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    disabled={isSubmitting}
                  />
                  {errors.productCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.productCode}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data Capacity <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      step="0.1"
                      value={formData.capacityValue}
                      onChange={(e) => setFormData({...formData, capacityValue: e.target.value})}
                      className={`flex-1 px-3 py-2 border ${
                        errors.capacityValue ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      disabled={isSubmitting}
                    />
                    <select
                      value={formData.capacityUnit}
                      onChange={(e) => setFormData({...formData, capacityUnit: e.target.value})}
                      className={`px-3 py-2 border ${
                        errors.capacityUnit ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      disabled={isSubmitting}
                    >
                      <option value="MB">MB</option>
                      <option value="GB">GB</option>
                    </select>
                  </div>
                  {(errors.capacityValue || errors.capacityUnit) && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.capacityValue || errors.capacityUnit}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Validity Period <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={formData.validityValue}
                      onChange={(e) => setFormData({...formData, validityValue: e.target.value})}
                      className={`flex-1 px-3 py-2 border ${
                        errors.validityValue ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      min="1"
                      disabled={isSubmitting}
                    />
                    <select
                      value={formData.validityUnit}
                      onChange={(e) => setFormData({...formData, validityUnit: e.target.value})}
                      className={`px-3 py-2 border ${
                        errors.validityUnit ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      disabled={isSubmitting}
                    >
                      <option value="days">Days</option>
                      <option value="hours">Hours</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                    </select>
                  </div>
                  {(errors.validityValue || errors.validityUnit) && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.validityValue || errors.validityUnit}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pricing Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Set Product Pricing</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Product: <span className="font-medium text-gray-900 dark:text-white">{selectedProduct?.name}</span>
            </p>
            
            {errors.general && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{errors.general}</span>
              </div>
            )}
            
            <form onSubmit={handleUpdatePricing}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cost Price (GHS) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={pricingData.costPrice}
                    onChange={(e) => setPricingData({...pricingData, costPrice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Supplier Price (GHS) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={pricingData.supplierPrice}
                    onChange={(e) => setPricingData({...pricingData, supplierPrice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Lowest selling price</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Dealer Price (GHS) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={pricingData.dealerPrice}
                    onChange={(e) => setPricingData({...pricingData, dealerPrice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Should be ≥ Supplier price</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Agent Price (GHS) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={pricingData.agentPrice}
                    onChange={(e) => setPricingData({...pricingData, agentPrice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Highest selling price (≥ Dealer price)</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPricingModal(false);
                    setPricingData({
                      costPrice: '0',
                      agentPrice: '0',
                      dealerPrice: '0',
                      supplierPrice: '0'
                    });
                    setErrors({});
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update Pricing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}