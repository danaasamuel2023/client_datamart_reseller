'use client';
import React, { useState, useEffect } from 'react';
import { 
  CurrencyDollarIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  SunIcon,
  MoonIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalculatorIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function PriceManagementPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('individual');
  const [editingProduct, setEditingProduct] = useState(null);
  const [bulkUpdateModal, setBulkUpdateModal] = useState(false);
  const [bulkSettings, setBulkSettings] = useState({
    percentage: 0,
    operation: 'increase',
    roles: []
  });
  const [priceChanges, setPriceChanges] = useState({});
  const [savingPrice, setSavingPrice] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', JSON.stringify(true));
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', JSON.stringify(false));
    }
  }, [darkMode]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('Token');
      
      const response = await fetch('https://server-datamart-reseller.onrender.com/api/admin/products?status=active&limit=100', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        // Fetch pricing for each product
        const productsWithPricing = await Promise.all(
          data.data.map(async (product) => {
            try {
              const pricingResponse = await fetch(
                `https://server-datamart-reseller.onrender.com/api/admin/products/${product._id}/pricing-history`,
                {
                  headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
              
              if (pricingResponse.ok) {
                const pricingData = await pricingResponse.json();
                const latestPricing = pricingData.data?.[0]; // Get most recent pricing
                
                return {
                  ...product,
                  pricing: latestPricing || {
                    costPrice: 0,
                    agentPrice: product.pricing?.find(p => p.role === 'agent')?.price || 0,
                    dealerPrice: product.pricing?.find(p => p.role === 'dealer')?.price || 0,
                    supplierPrice: product.pricing?.find(p => p.role === 'supplier')?.price || 0
                  }
                };
              }
              return product;
            } catch (err) {
              console.error(`Error fetching pricing for product ${product._id}:`, err);
              return product;
            }
          })
        );
        
        setProducts(productsWithPricing);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (productId, field, value) => {
    setPriceChanges(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const savePriceChanges = async (productId) => {
    try {
      setSavingPrice(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('Token');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const product = products.find(p => p._id === productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const changes = priceChanges[productId] || {};
      
      // Get current prices - use the pricing object structure from your schema
      const currentPricing = product.pricing || {};
      
      // Extract current prices from the pricing array structure
      const currentAgentPrice = currentPricing.agentPrice || 
                                (Array.isArray(product.pricing) ? 
                                  product.pricing.find(p => p.role === 'agent')?.price : 0) || 0;
      const currentDealerPrice = currentPricing.dealerPrice || 
                                 (Array.isArray(product.pricing) ? 
                                   product.pricing.find(p => p.role === 'dealer')?.price : 0) || 0;
      const currentSupplierPrice = currentPricing.supplierPrice || 
                                   (Array.isArray(product.pricing) ? 
                                     product.pricing.find(p => p.role === 'supplier')?.price : 0) || 0;
      
      // Merge with changes, ensuring all are valid numbers
      const costPrice = parseFloat(changes.costPrice !== undefined ? changes.costPrice : (currentPricing.costPrice || 1));
      const agentPrice = parseFloat(changes.agentPrice !== undefined ? changes.agentPrice : currentAgentPrice);
      const dealerPrice = parseFloat(changes.dealerPrice !== undefined ? changes.dealerPrice : currentDealerPrice);
      const supplierPrice = parseFloat(changes.supplierPrice !== undefined ? changes.supplierPrice : currentSupplierPrice);

      // Validation checks according to PriceSetting schema requirements
      if (isNaN(costPrice) || isNaN(agentPrice) || isNaN(dealerPrice) || isNaN(supplierPrice)) {
        throw new Error('All prices must be valid numbers');
      }

      // Schema requires min: 0 for all prices
      if (costPrice < 0 || agentPrice < 0 || dealerPrice < 0 || supplierPrice < 0) {
        throw new Error('Prices cannot be negative (minimum is 0)');
      }

      // Business logic validation
      if (costPrice === 0) {
        throw new Error('Cost price must be greater than 0');
      }

      if (agentPrice === 0 || dealerPrice === 0 || supplierPrice === 0) {
        throw new Error('All selling prices must be greater than 0');
      }

      // Logical price hierarchy check
      if (supplierPrice > dealerPrice || dealerPrice > agentPrice) {
        if (!confirm('Price hierarchy warning: Expected Supplier ≤ Dealer ≤ Agent. Continue anyway?')) {
          return;
        }
      }

      // Check profit margins
      if (agentPrice <= costPrice || dealerPrice <= costPrice || supplierPrice <= costPrice) {
        if (!confirm('Warning: Some prices are at or below cost. This will result in losses. Continue?')) {
          return;
        }
      }

      // Prepare data matching PriceSetting schema exactly
      // The API expects productId in the body along with prices
      const updatedPricing = {
        productId: productId,  // Add productId to the request body
        costPrice: parseFloat((Math.round(costPrice * 100) / 100).toFixed(2)),
        agentPrice: parseFloat((Math.round(agentPrice * 100) / 100).toFixed(2)),
        dealerPrice: parseFloat((Math.round(dealerPrice * 100) / 100).toFixed(2)),
        supplierPrice: parseFloat((Math.round(supplierPrice * 100) / 100).toFixed(2))
      };

      // Additional validation to ensure no NaN values
      for (const [key, value] of Object.entries(updatedPricing)) {
        if (key !== 'productId' && isNaN(value)) {
          throw new Error(`Invalid ${key}: must be a number`);
        }
      }

      console.log('Sending price update for product:', productId);
      console.log('Price data being sent:', JSON.stringify(updatedPricing));
      console.log('Data types:', {
        productId: typeof updatedPricing.productId,
        costPrice: typeof updatedPricing.costPrice,
        agentPrice: typeof updatedPricing.agentPrice,
        dealerPrice: typeof updatedPricing.dealerPrice,
        supplierPrice: typeof updatedPricing.supplierPrice
      });

      // Note: Check if the productId is an ObjectId or needs conversion
      const url = `https://server-datamart-reseller.onrender.com/api/admin/products/${productId}/pricing`;
      console.log('API URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updatedPricing)
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        // Log detailed error for debugging
        console.error('API Error Response:', {
          status: response.status,
          data: data,
          sentData: updatedPricing
        });
        
        // Extract validation errors if present
        if (data.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(', ');
          throw new Error(`Validation failed: ${errorMessages}`);
        }
        
        throw new Error(data.message || data.error || `Failed to update prices (HTTP ${response.status})`);
      }

      if (data.success) {
        setSuccess(`Prices updated successfully for ${product.name}`);
        setEditingProduct(null);
        setPriceChanges(prev => {
          const newChanges = { ...prev };
          delete newChanges[productId];
          return newChanges;
        });
        
        // Refresh products list
        await fetchProducts();
      } else {
        // This shouldn't happen if response.ok is true, but handle it anyway
        throw new Error(data.message || 'Failed to update prices');
      }
    } catch (error) {
      console.error('Error saving price changes:', error);
      setError(error.message || 'Failed to update prices. Please try again.');
    } finally {
      setSavingPrice(false);
    }
  };

  const handleBulkUpdate = async () => {
    try {
      setSavingPrice(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('Token');
      
      if (bulkSettings.roles.length === 0) {
        setError('Please select at least one role to update');
        return;
      }

      const response = await fetch(
        'https://server-datamart-reseller.onrender.com/api/admin/products/bulk-pricing',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            percentage: parseFloat(bulkSettings.percentage),
            operation: bulkSettings.operation,
            roles: bulkSettings.roles
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess(`Bulk price update applied to ${data.data?.length || 0} products`);
        setBulkUpdateModal(false);
        setBulkSettings({ percentage: 0, operation: 'increase', roles: [] });
        
        // Refresh products list
        await fetchProducts();
      } else {
        throw new Error(data.message || 'Failed to apply bulk update');
      }
    } catch (error) {
      console.error('Error applying bulk update:', error);
      setError(error.message || 'Failed to apply bulk update. Please try again.');
    } finally {
      setSavingPrice(false);
    }
  };

  const formatPrice = (price) => {
    return `GHS ${(price || 0).toFixed(2)}`;
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateMargin = (costPrice, sellingPrice) => {
    if (!costPrice || costPrice === 0) return 0;
    return (((sellingPrice - costPrice) / costPrice) * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 py-6 space-y-6">
        
        {/* Dark Mode Toggle */}
        <div className="flex justify-end">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <SunIcon className="h-5 w-5 text-yellow-500" />
            ) : (
              <MoonIcon className="h-5 w-5 text-gray-700" />
            )}
          </button>
        </div>

        {/* Page Header */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 transition-colors duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Price Management</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                View and update pricing for different user roles
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchProducts}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-300 disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => setBulkUpdateModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
              >
                <CalculatorIcon className="h-5 w-5 mr-2" />
                Bulk Update
              </button>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-4 rounded-lg">
            <div className="flex">
              <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg transition-colors duration-300">
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cost Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Agent Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Dealer Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Supplier Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Updated
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
                    products.map((product) => {
                      const isEditing = editingProduct === product._id;
                      const changes = priceChanges[product._id] || {};
                      
                      return (
                        <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{product.productCode}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.01"
                                value={changes.costPrice ?? product.pricing?.costPrice ?? 0}
                                onChange={(e) => handlePriceChange(product._id, 'costPrice', e.target.value)}
                                className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            ) : (
                              <span className="text-sm text-gray-900 dark:text-gray-300">
                                {formatPrice(product.pricing?.costPrice)}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditing ? (
                              <div>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={changes.agentPrice ?? product.pricing?.agentPrice ?? 0}
                                  onChange={(e) => handlePriceChange(product._id, 'agentPrice', e.target.value)}
                                  className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Margin: {calculateMargin(
                                    changes.costPrice ?? product.pricing?.costPrice,
                                    changes.agentPrice ?? product.pricing?.agentPrice
                                  )}%
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span className="text-sm text-gray-900 dark:text-gray-300">
                                  {formatPrice(product.pricing?.agentPrice)}
                                </span>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  +{calculateMargin(product.pricing?.costPrice, product.pricing?.agentPrice)}%
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditing ? (
                              <div>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={changes.dealerPrice ?? product.pricing?.dealerPrice ?? 0}
                                  onChange={(e) => handlePriceChange(product._id, 'dealerPrice', e.target.value)}
                                  className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Margin: {calculateMargin(
                                    changes.costPrice ?? product.pricing?.costPrice,
                                    changes.dealerPrice ?? product.pricing?.dealerPrice
                                  )}%
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span className="text-sm text-gray-900 dark:text-gray-300">
                                  {formatPrice(product.pricing?.dealerPrice)}
                                </span>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  +{calculateMargin(product.pricing?.costPrice, product.pricing?.dealerPrice)}%
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditing ? (
                              <div>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={changes.supplierPrice ?? product.pricing?.supplierPrice ?? 0}
                                  onChange={(e) => handlePriceChange(product._id, 'supplierPrice', e.target.value)}
                                  className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Margin: {calculateMargin(
                                    changes.costPrice ?? product.pricing?.costPrice,
                                    changes.supplierPrice ?? product.pricing?.supplierPrice
                                  )}%
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span className="text-sm text-gray-900 dark:text-gray-300">
                                  {formatPrice(product.pricing?.supplierPrice)}
                                </span>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  +{calculateMargin(product.pricing?.costPrice, product.pricing?.supplierPrice)}%
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(product.updatedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {isEditing ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => savePriceChanges(product._id)}
                                  disabled={savingPrice}
                                  className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 disabled:opacity-50"
                                  title="Save Changes"
                                >
                                  <CheckCircleIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingProduct(null);
                                    setPriceChanges(prev => {
                                      const newChanges = { ...prev };
                                      delete newChanges[product._id];
                                      return newChanges;
                                    });
                                  }}
                                  disabled={savingPrice}
                                  className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 disabled:opacity-50"
                                  title="Cancel"
                                >
                                  <XCircleIcon className="h-5 w-5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingProduct(product._id)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                                title="Edit Prices"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bulk Update Modal */}
        {bulkUpdateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Bulk Price Update</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Percentage Change
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={bulkSettings.percentage}
                    onChange={(e) => setBulkSettings(prev => ({ ...prev, percentage: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter percentage (e.g., 10 for 10%)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Operation
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="increase"
                        checked={bulkSettings.operation === 'increase'}
                        onChange={(e) => setBulkSettings(prev => ({ ...prev, operation: e.target.value }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-900 dark:text-gray-300">
                        <ArrowTrendingUpIcon className="h-4 w-4 inline mr-1 text-green-500" />
                        Increase
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="decrease"
                        checked={bulkSettings.operation === 'decrease'}
                        onChange={(e) => setBulkSettings(prev => ({ ...prev, operation: e.target.value }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-900 dark:text-gray-300">
                        <ArrowTrendingDownIcon className="h-4 w-4 inline mr-1 text-red-500" />
                        Decrease
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Apply to Roles
                  </label>
                  <div className="space-y-2">
                    {['agent', 'dealer', 'supplier'].map((role) => (
                      <label key={role} className="flex items-center">
                        <input
                          type="checkbox"
                          value={role}
                          checked={bulkSettings.roles.includes(role)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBulkSettings(prev => ({ ...prev, roles: [...prev.roles, role] }));
                            } else {
                              setBulkSettings(prev => ({ 
                                ...prev, 
                                roles: prev.roles.filter(r => r !== role) 
                              }));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-900 dark:text-gray-300 capitalize">
                          {role} Pricing
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {bulkSettings.percentage > 0 && bulkSettings.roles.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      This will {bulkSettings.operation} prices by {bulkSettings.percentage}% for {bulkSettings.roles.join(', ')} role(s) across all active products.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setBulkUpdateModal(false);
                    setBulkSettings({ percentage: 0, operation: 'increase', roles: [] });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkUpdate}
                  disabled={bulkSettings.percentage <= 0 || bulkSettings.roles.length === 0 || savingPrice}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingPrice ? 'Applying...' : 'Apply Update'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}