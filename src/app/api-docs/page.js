'use client';
import React, { useState } from 'react';
import { 
  Book, 
  Code, 
  Copy, 
  Check, 
  ChevronRight,
  ChevronDown,
  Lock,
  Globe,
  Zap,
  Package,
  CreditCard,
  ShoppingCart,
  FileSpreadsheet,
  Activity,
  Webhook,
  BarChart3,
  AlertCircle,
  Terminal,
  Key,
  Server,
  Phone,
  Hash,
  DollarSign,
  Clock,
  Shield,
  FileText,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';

const APIDocumentation = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedEndpoint, setExpandedEndpoint] = useState(null);
  const [copiedCode, setCopiedCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('curl');

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const CodeBlock = ({ code, language = 'json', id }) => (
    <div className="relative group">
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={() => copyToClipboard(code, id)}
          className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300 flex items-center gap-1 transition-colors"
        >
          {copiedCode === id ? (
            <>
              <Check className="w-3 h-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="bg-gray-900 border border-gray-700 rounded-lg p-4 overflow-x-auto">
        <code className="text-sm text-gray-300 font-mono">{code}</code>
      </pre>
    </div>
  );

  const EndpointCard = ({ endpoint, method, path, description, children, id }) => {
    const isExpanded = expandedEndpoint === id;
    const methodColors = {
      GET: 'bg-green-500',
      POST: 'bg-blue-500',
      PUT: 'bg-orange-500',
      DELETE: 'bg-red-500'
    };

    return (
      <div className="border border-gray-700 rounded-lg mb-4 overflow-hidden">
        <button
          onClick={() => setExpandedEndpoint(isExpanded ? null : id)}
          className="w-full px-6 py-4 bg-gray-800 hover:bg-gray-750 transition-colors flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 text-white text-xs font-bold rounded ${methodColors[method]}`}>
              {method}
            </span>
            <code className="text-sm font-mono text-yellow-400">{path}</code>
            <span className="text-gray-400 text-sm">{description}</span>
          </div>
          {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
        </button>
        {isExpanded && (
          <div className="p-6 bg-gray-850 border-t border-gray-700">
            {children}
          </div>
        )}
      </div>
    );
  };

  const ParameterTable = ({ parameters }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-2 px-4 text-gray-400">Parameter</th>
            <th className="text-left py-2 px-4 text-gray-400">Type</th>
            <th className="text-left py-2 px-4 text-gray-400">Required</th>
            <th className="text-left py-2 px-4 text-gray-400">Description</th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((param, idx) => (
            <tr key={idx} className="border-b border-gray-800">
              <td className="py-2 px-4 font-mono text-yellow-400">{param.name}</td>
              <td className="py-2 px-4 text-gray-300">{param.type}</td>
              <td className="py-2 px-4">
                {param.required ? (
                  <span className="text-green-400">Yes</span>
                ) : (
                  <span className="text-gray-500">No</span>
                )}
              </td>
              <td className="py-2 px-4 text-gray-300">{param.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const sections = [
    { id: 'overview', label: 'Overview', icon: Book },
    { id: 'authentication', label: 'Authentication', icon: Lock },
    { id: 'account', label: 'Account & Balance', icon: CreditCard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'purchase', label: 'Single Purchase', icon: ShoppingCart },
    { id: 'bulk', label: 'Bulk Purchase', icon: FileSpreadsheet },
    { id: 'transactions', label: 'Transactions', icon: Activity },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'statistics', label: 'Statistics', icon: BarChart3 },
    { id: 'errors', label: 'Error Codes', icon: AlertCircle }
  ];

  const getExampleCode = (endpoint, language) => {
    const examples = {
      auth: {
        curl: `curl -X GET https://server-datamart-reseller.onrender.com/api/v1/account \\
  -H "X-API-Key: your_api_key_here" \\
  -H "X-API-Secret: your_api_secret_here" \\
  -H "Content-Type: application/json"`,
        javascript: `const response = await fetch('https://server-datamart-reseller.onrender.com/api/v1/account', {
  method: 'GET',
  headers: {
    'X-API-Key': 'your_api_key_here',
    'X-API-Secret': 'your_api_secret_here',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`,
        python: `import requests

url = "https://server-datamart-reseller.onrender.com/api/v1/account"
headers = {
    "X-API-Key": "your_api_key_here",
    "X-API-Secret": "your_api_secret_here",
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)
data = response.json()
print(data)`
      },
      purchase: {
        curl: `curl -X POST https://server-datamart-reseller.onrender.com/api/v1/purchase \\
  -H "X-API-Key: your_api_key_here" \\
  -H "X-API-Secret: your_api_secret_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "capacity": "2GB",
    "product_name": "YELLOW",
    "beneficiary_number": "0241234567",
    "reference": "REF123456"
  }'`,
        javascript: `const response = await fetch('https://server-datamart-reseller.onrender.com/api/v1/purchase', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your_api_key_here',
    'X-API-Secret': 'your_api_secret_here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    capacity: '2GB',
    product_name: 'YELLOW',
    beneficiary_number: '0241234567',
    reference: 'REF123456'
  })
});

const data = await response.json();
console.log(data);`,
        python: `import requests
import json

url = "https://server-datamart-reseller.onrender.com/api/v1/purchase"
headers = {
    "X-API-Key": "your_api_key_here",
    "X-API-Secret": "your_api_secret_here",
    "Content-Type": "application/json"
}
payload = {
    "capacity": "2GB",
    "product_name": "YELLOW",
    "beneficiary_number": "0241234567",
    "reference": "REF123456"
}

response = requests.post(url, headers=headers, json=payload)
data = response.json()
print(data)`
      },
      bulk: {
        curl: `curl -X POST https://server-datamart-reseller.onrender.com/api/v1/purchase/bulk \\
  -H "X-API-Key: your_api_key_here" \\
  -H "X-API-Secret: your_api_secret_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "orders": [
      {
        "capacity": "1GB",
        "product_name": "YELLOW",
        "beneficiary_number": "0241234567",
        "quantity": 1
      },
      {
        "capacity": "2GB",
        "product_name": "YELLOW",
        "beneficiary_number": "0501234567",
        "quantity": 2
      }
    ],
    "reference": "BULK_REF_12345"
  }'`,
        javascript: `const response = await fetch('https://server-datamart-reseller.onrender.com/api/v1/purchase/bulk', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your_api_key_here',
    'X-API-Secret': 'your_api_secret_here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    orders: [
      {
        capacity: '1GB',
        product_name: 'YELLOW',
        beneficiary_number: '0241234567',
        quantity: 1
      },
      {
        capacity: '2GB',
        product_name: 'YELLOW',
        beneficiary_number: '0501234567',
        quantity: 2
      }
    ],
    reference: 'BULK_REF_12345'
  })
});

const data = await response.json();
console.log(data);`,
        python: `import requests
import json

url = "https://server-datamart-reseller.onrender.com/api/v1/purchase/bulk"
headers = {
    "X-API-Key": "your_api_key_here",
    "X-API-Secret": "your_api_secret_here",
    "Content-Type": "application/json"
}
payload = {
    "orders": [
        {
            "capacity": "1GB",
            "product_name": "YELLOW",
            "beneficiary_number": "0241234567",
            "quantity": 1
        },
        {
            "capacity": "2GB",
            "product_name": "YELLOW",
            "beneficiary_number": "0501234567",
            "quantity": 2
        }
    ],
    "reference": "BULK_REF_12345"
}

response = requests.post(url, headers=headers, json=payload)
data = response.json()
print(data)`
      }
    };
    return examples[endpoint]?.[language] || '';
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="w-8 h-8 text-yellow-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Ghana MTN Data Platform API</h1>
              <p className="text-gray-400 text-sm">Version 1.0 | RESTful API Documentation</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-green-500 bg-opacity-20 text-green-400 rounded text-sm font-medium">
              Production Ready
            </span>
            <span className="text-gray-400 text-sm">
              Base URL: <code className="text-yellow-400">https://server-datamart-reseller.onrender.com/api</code>
            </span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 h-[calc(100vh-73px)] sticky top-[73px] border-r border-gray-700 overflow-y-auto">
          <nav className="p-4">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                    activeSection === section.id
                      ? 'bg-yellow-400 text-gray-900'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">API Overview</h2>
              
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Introduction</h3>
                <p className="text-gray-300 mb-4">
                  The Ghana MTN Data Platform API enables third-party integrations for purchasing data bundles both individually and in bulk. 
                  This RESTful API provides secure, scalable access to MTN data products with role-based pricing.
                </p>
                
                <div className="grid grid-cols-2 gap-6 mt-6">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <Globe className="w-8 h-8 text-blue-400 mb-3" />
                    <h4 className="text-white font-medium mb-2">RESTful Design</h4>
                    <p className="text-gray-400 text-sm">Standard HTTP methods with JSON request/response format</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <Shield className="w-8 h-8 text-green-400 mb-3" />
                    <h4 className="text-white font-medium mb-2">Secure Authentication</h4>
                    <p className="text-gray-400 text-sm">API key and secret based authentication with HTTPS</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <Zap className="w-8 h-8 text-yellow-400 mb-3" />
                    <h4 className="text-white font-medium mb-2">Manual Processing</h4>
                    <p className="text-gray-400 text-sm">Orders are manually processed for quality assurance</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <BarChart3 className="w-8 h-8 text-purple-400 mb-3" />
                    <h4 className="text-white font-medium mb-2">Comprehensive Reporting</h4>
                    <p className="text-gray-400 text-sm">Detailed transaction history and usage statistics</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Quick Start</h3>
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center font-bold">1</span>
                    <div>
                      <p className="text-white font-medium">Get your API credentials</p>
                      <p className="text-gray-400 text-sm">Request API key and secret from your dashboard</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center font-bold">2</span>
                    <div>
                      <p className="text-white font-medium">Configure authentication</p>
                      <p className="text-gray-400 text-sm">Add X-API-Key and X-API-Secret headers</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center font-bold">3</span>
                    <div>
                      <p className="text-white font-medium">Test with GET /v1/account</p>
                      <p className="text-gray-400 text-sm">Verify your connection and credentials</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center font-bold">4</span>
                    <div>
                      <p className="text-white font-medium">Start making purchases</p>
                      <p className="text-gray-400 text-sm">Use single or bulk purchase endpoints with capacity and product_name</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* Authentication Section */}
          {activeSection === 'authentication' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Authentication</h2>
              
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">API Authentication</h3>
                <p className="text-gray-300 mb-4">
                  All API requests require authentication using API key and secret. These credentials must be included in the request headers.
                </p>
                
                <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 rounded-lg p-4 mb-4">
                  <div className="flex gap-2">
                    <Key className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <div>
                      <p className="text-yellow-400 font-medium mb-1">Important Security Note</p>
                      <p className="text-yellow-300 text-sm">
                        Never expose your API secret in client-side code. Always make API calls from your backend server.
                        Your API secret should be stored securely and never committed to version control.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Required Headers</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <code className="bg-gray-800 px-2 py-1 rounded text-yellow-400 text-sm">X-API-Key</code>
                      <p className="text-gray-300 text-sm">Your unique API key (starts with pk_)</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <code className="bg-gray-800 px-2 py-1 rounded text-yellow-400 text-sm">X-API-Secret</code>
                      <p className="text-gray-300 text-sm">Your API secret (starts with sk_)</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <code className="bg-gray-800 px-2 py-1 rounded text-yellow-400 text-sm">Content-Type</code>
                      <p className="text-gray-300 text-sm">Always set to application/json</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Authentication Example</h3>
                <div className="mb-3 flex gap-2">
                  <button
                    onClick={() => setSelectedLanguage('curl')}
                    className={`px-3 py-1 rounded text-sm ${selectedLanguage === 'curl' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-gray-300'}`}
                  >
                    cURL
                  </button>
                  <button
                    onClick={() => setSelectedLanguage('javascript')}
                    className={`px-3 py-1 rounded text-sm ${selectedLanguage === 'javascript' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-gray-300'}`}
                  >
                    JavaScript
                  </button>
                  <button
                    onClick={() => setSelectedLanguage('python')}
                    className={`px-3 py-1 rounded text-sm ${selectedLanguage === 'python' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-gray-300'}`}
                  >
                    Python
                  </button>
                </div>
                <CodeBlock
                  code={getExampleCode('auth', selectedLanguage)}
                  language={selectedLanguage}
                  id="auth-example"
                />
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Rate Limiting</h3>
                <p className="text-gray-300 mb-4">
                  API requests are rate-limited to ensure fair usage and system stability.
                </p>
                <div className="bg-gray-900 rounded-lg p-4">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-gray-300">Default rate limit: <span className="text-yellow-400 font-mono">60 requests/minute</span></p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-gray-300">Rate limit is per API key</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-gray-300">Exceeding the limit returns a 429 status code</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Account & Balance Section */}
          {activeSection === 'account' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Account & Balance API</h2>
              
              <EndpointCard
                method="GET"
                path="/v1/account"
                description="Get account information"
                id="get-account"
              >
                <div className="space-y-4">
                  <p className="text-gray-300">Retrieve detailed account information including wallet balance and API usage statistics.</p>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2">Response</h4>
                    <CodeBlock
                      code={`{
  "success": true,
  "message": "Account information retrieved",
  "data": {
    "account": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+233241234567",
      "role": "dealer",
      "status": "active"
    },
    "wallet": {
      "balance": 5000.00,
      "currency": "GHS"
    },
    "api": {
      "requestCount": 1523,
      "rateLimit": 100,
      "webhookUrl": "https://example.com/webhook"
    }
  },
  "timestamp": "2025-01-01T12:00:00.000Z"
}`}
                      id="account-response"
                    />
                  </div>
                </div>
              </EndpointCard>

              <EndpointCard
                method="GET"
                path="/v1/balance"
                description="Get wallet balance"
                id="get-balance"
              >
                <div className="space-y-4">
                  <p className="text-gray-300">Quick endpoint to check current wallet balance.</p>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2">Response</h4>
                    <CodeBlock
                      code={`{
  "success": true,
  "message": "Balance retrieved",
  "data": {
    "balance": 5000.00,
    "currency": "GHS",
    "formatted": "GHS 5000.00"
  },
  "timestamp": "2025-01-01T12:00:00.000Z"
}`}
                      id="balance-response"
                    />
                  </div>
                </div>
              </EndpointCard>
            </div>
          )}

          {/* Products Section */}
          {activeSection === 'products' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Products API</h2>
              
              <EndpointCard
                method="GET"
                path="/v1/products"
                description="List all available products"
                id="get-products"
              >
                <div className="space-y-4">
                  <p className="text-gray-300">Get a list of all available data products with role-specific pricing.</p>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2">Query Parameters</h4>
                    <ParameterTable
                      parameters={[
                        { name: 'category', type: 'string', required: false, description: 'Filter by product category' },
                        { name: 'min_capacity', type: 'integer', required: false, description: 'Minimum capacity in MB' },
                        { name: 'max_capacity', type: 'integer', required: false, description: 'Maximum capacity in MB' }
                      ]}
                    />
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-2">Response</h4>
                    <CodeBlock
                      code={`{
  "success": true,
  "message": "Products retrieved",
  "data": {
    "products": [
      {
        "product_code": "YELLOW_1GB_DAILY",
        "name": "YELLOW",
        "category": "daily",
        "capacity": "1GB",
        "capacity_value": 1,
        "capacity_unit": "GB",
        "validity": "24 hours",
        "price": 5.00,
        "currency": "GHS",
        "status": "active"
      },
      {
        "product_code": "YELLOW_2GB_DAILY",
        "name": "YELLOW",
        "category": "daily",
        "capacity": "2GB",
        "capacity_value": 2,
        "capacity_unit": "GB",
        "validity": "24 hours",
        "price": 10.00,
        "currency": "GHS",
        "status": "active"
      }
    ],
    "total": 2
  }
}`}
                      id="products-response"
                    />
                  </div>
                </div>
              </EndpointCard>

              <EndpointCard
                method="GET"
                path="/v1/capacities"
                description="Get available capacities"
                id="get-capacities"
              >
                <div className="space-y-4">
                  <p className="text-gray-300">List all available data capacities grouped with their respective products.</p>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2">Response</h4>
                    <CodeBlock
                      code={`{
  "success": true,
  "message": "Available capacities retrieved",
  "data": {
    "capacities": [
      {
        "capacity": "1GB",
        "products": [
          {
            "name": "YELLOW",
            "validity": "24 hours",
            "price": 5.00
          }
        ]
      },
      {
        "capacity": "2GB",
        "products": [
          {
            "name": "YELLOW",
            "validity": "24 hours",
            "price": 10.00
          }
        ]
      }
    ],
    "total": 2,
    "price_tier": "dealer"
  }
}`}
                      id="capacities-response"
                    />
                  </div>
                </div>
              </EndpointCard>
            </div>
          )}

          {/* Single Purchase Section */}
          {activeSection === 'purchase' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Single Purchase API</h2>
              
              <EndpointCard
                method="POST"
                path="/v1/purchase"
                description="Purchase single data bundle"
                id="post-purchase"
              >
                <div className="space-y-4">
                  <p className="text-gray-300">Execute a single data bundle purchase using capacity and product name.</p>
                  
                  <div className="bg-blue-500 bg-opacity-10 border border-blue-500 rounded-lg p-4">
                    <div className="flex gap-2">
                      <Zap className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <div>
                        <p className="text-blue-400 font-medium mb-1">Unified API Format</p>
                        <p className="text-blue-300 text-sm">
                          Both single and bulk purchases now use the same parameters: capacity and product_name.
                          This provides a consistent API experience across all endpoints.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 rounded-lg p-4">
                    <div className="flex gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                      <div>
                        <p className="text-yellow-400 font-medium mb-1">Available Product</p>
                        <p className="text-yellow-300 text-sm">
                          Currently, only <code className="bg-gray-800 px-1 rounded">YELLOW</code> is available as a product name.
                          All data bundles use this product name with different capacities.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-2">Request Body</h4>
                    <ParameterTable
                      parameters={[
                        { name: 'capacity', type: 'string', required: true, description: 'Data capacity (e.g., "500MB", "1GB", "2GB", "5GB")' },
                        { name: 'product_name', type: 'string', required: true, description: 'Product name (currently only "YELLOW")' },
                        { name: 'beneficiary_number', type: 'string', required: true, description: 'Ghana phone number (0241234567 or +233241234567)' },
                        { name: 'reference', type: 'string', required: false, description: 'Unique transaction reference' },
                        { name: 'callback_url', type: 'string', required: false, description: 'URL for transaction status callback' }
                      ]}
                    />
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-2">Available Capacities</h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <p className="text-gray-300 mb-3">The following capacities are available with "YELLOW" product:</p>
                      <div className="grid grid-cols-4 gap-3">
                        <code className="bg-gray-800 px-3 py-2 rounded text-yellow-400 text-center">500MB</code>
                        <code className="bg-gray-800 px-3 py-2 rounded text-yellow-400 text-center">1GB</code>
                        <code className="bg-gray-800 px-3 py-2 rounded text-yellow-400 text-center">2GB</code>
                        <code className="bg-gray-800 px-3 py-2 rounded text-yellow-400 text-center">3GB</code>
                        <code className="bg-gray-800 px-3 py-2 rounded text-yellow-400 text-center">5GB</code>
                        <code className="bg-gray-800 px-3 py-2 rounded text-yellow-400 text-center">10GB</code>
                        <code className="bg-gray-800 px-3 py-2 rounded text-yellow-400 text-center">15GB</code>
                        <code className="bg-gray-800 px-3 py-2 rounded text-yellow-400 text-center">20GB</code>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-2">Example Request</h4>
                    <div className="mb-3 flex gap-2">
                      <button
                        onClick={() => setSelectedLanguage('curl')}
                        className={`px-3 py-1 rounded text-sm ${selectedLanguage === 'curl' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-gray-300'}`}
                      >
                        cURL
                      </button>
                      <button
                        onClick={() => setSelectedLanguage('javascript')}
                        className={`px-3 py-1 rounded text-sm ${selectedLanguage === 'javascript' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-gray-300'}`}
                      >
                        JavaScript
                      </button>
                      <button
                        onClick={() => setSelectedLanguage('python')}
                        className={`px-3 py-1 rounded text-sm ${selectedLanguage === 'python' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-gray-300'}`}
                      >
                        Python
                      </button>
                    </div>
                    <CodeBlock
                      code={getExampleCode('purchase', selectedLanguage)}
                      language={selectedLanguage}
                      id="purchase-request"
                    />
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-2">Success Response</h4>
                    <CodeBlock
                      code={`{
  "success": true,
  "message": "Purchase successful - pending manual processing",
  "data": {
    "reference": "API1234567890ABCD",
    "transaction_id": "65abc123def456",
    "product": {
      "name": "YELLOW",
      "capacity": "2GB",
      "validity": "24 hours",
      "product_code": "YELLOW_2GB_DAILY"
    },
    "beneficiary": "0241234567",
    "amount": 10.00,
    "price_tier": "dealer",
    "currency": "GHS",
    "status": "pending",
    "balance_after": 4990.00
  },
  "timestamp": "2025-01-01T12:00:00.000Z"
}`}
                      id="purchase-success-response"
                    />
                  </div>
                </div>
              </EndpointCard>
            </div>
          )}

          {/* Bulk Purchase Section */}
          {activeSection === 'bulk' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Bulk Purchase API</h2>
              
              <EndpointCard
                method="POST"
                path="/v1/purchase/bulk"
                description="Process multiple data purchases"
                id="post-bulk-purchase"
              >
                <div className="space-y-4">
                  <p className="text-gray-300">Process up to 100 data bundle purchases in a single request. All purchases are deducted from your wallet immediately.</p>
                  
                  <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-4">
                    <div className="flex gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <div>
                        <p className="text-green-400 font-medium mb-1">Consistent API Format</p>
                        <p className="text-green-300 text-sm">
                          Bulk purchases now use the same format as single purchases: capacity and product_name.
                          This makes it easy to convert between single and bulk operations.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-2">Request Body</h4>
                    <ParameterTable
                      parameters={[
                        { name: 'orders', type: 'array', required: true, description: 'Array of order objects (max 100)' },
                        { name: 'orders[].capacity', type: 'string', required: true, description: 'Data capacity (e.g., "1GB", "2GB")' },
                        { name: 'orders[].product_name', type: 'string', required: true, description: 'Product name (currently only "YELLOW")' },
                        { name: 'orders[].beneficiary_number', type: 'string', required: true, description: 'Ghana phone number' },
                        { name: 'orders[].quantity', type: 'integer', required: false, description: 'Quantity per order (default: 1)' },
                        { name: 'orders[].reference', type: 'string', required: false, description: 'Order-specific reference' },
                        { name: 'reference', type: 'string', required: false, description: 'Bulk transaction reference' },
                        { name: 'callback_url', type: 'string', required: false, description: 'URL for bulk completion callback' }
                      ]}
                    />
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-2">Example Request</h4>
                    <div className="mb-3 flex gap-2">
                      <button
                        onClick={() => setSelectedLanguage('curl')}
                        className={`px-3 py-1 rounded text-sm ${selectedLanguage === 'curl' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-gray-300'}`}
                      >
                        cURL
                      </button>
                      <button
                        onClick={() => setSelectedLanguage('javascript')}
                        className={`px-3 py-1 rounded text-sm ${selectedLanguage === 'javascript' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-gray-300'}`}
                      >
                        JavaScript
                      </button>
                      <button
                        onClick={() => setSelectedLanguage('python')}
                        className={`px-3 py-1 rounded text-sm ${selectedLanguage === 'python' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-gray-300'}`}
                      >
                        Python
                      </button>
                    </div>
                    <CodeBlock
                      code={getExampleCode('bulk', selectedLanguage)}
                      language={selectedLanguage}
                      id="bulk-request"
                    />
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-2">Response</h4>
                    <CodeBlock
                      code={`{
  "success": true,
  "message": "Bulk purchase processed - pending manual processing",
  "data": {
    "bulk_reference": "BULK_API1234567890",
    "summary": {
      "total_orders": 3,
      "successful_count": 3,
      "failed_count": 0,
      "total_amount": 45.00
    },
    "successful_orders": [
      {
        "reference": "API1234567890ABC",
        "product_name": "YELLOW",
        "capacity": "1GB",
        "beneficiary": "0241234567",
        "quantity": 1,
        "amount": 5.00,
        "status": "pending"
      },
      {
        "reference": "API1234567890DEF",
        "product_name": "YELLOW",
        "capacity": "2GB",
        "beneficiary": "0501234567",
        "quantity": 2,
        "amount": 20.00,
        "status": "pending"
      }
    ],
    "failed_orders": [],
    "balance_after": 4955.00
  }
}`}
                      id="bulk-response"
                    />
                  </div>
                </div>
              </EndpointCard>
            </div>
          )}

          {/* Transactions Section */}
          {activeSection === 'transactions' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Transactions API</h2>
              
              <EndpointCard
                method="GET"
                path="/v1/transactions"
                description="Get transaction history"
                id="get-transactions"
              >
                <div className="space-y-4">
                  <p className="text-gray-300">Retrieve your transaction history with filtering and pagination options.</p>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2">Query Parameters</h4>
                    <ParameterTable
                      parameters={[
                        { name: 'status', type: 'string', required: false, description: 'Filter by status (pending, successful, failed)' },
                        { name: 'start_date', type: 'string', required: false, description: 'Start date (ISO format)' },
                        { name: 'end_date', type: 'string', required: false, description: 'End date (ISO format)' },
                        { name: 'page', type: 'integer', required: false, description: 'Page number (default: 1)' },
                        { name: 'limit', type: 'integer', required: false, description: 'Results per page (default: 20, max: 100)' }
                      ]}
                    />
                  </div>
                </div>
              </EndpointCard>

              <EndpointCard
                method="GET"
                path="/v1/transactions/:reference"
                description="Get transaction status"
                id="get-transaction"
              >
                <div className="space-y-4">
                  <p className="text-gray-300">Check the status of a specific transaction using its reference.</p>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2">Response</h4>
                    <CodeBlock
                      code={`{
  "success": true,
  "message": "Transaction retrieved",
  "data": {
    "reference": "API1234567890ABCD",
    "transaction_id": "65abc123def456",
    "status": "successful",
    "product": {
      "name": "YELLOW",
      "capacity": "2GB"
    },
    "beneficiary": "0241234567",
    "amount": 10.00,
    "currency": "GHS",
    "created_at": "2025-01-01T12:00:00.000Z",
    "completed_at": "2025-01-01T12:05:00.000Z",
    "failure_reason": null
  }
}`}
                      id="transaction-status-response"
                    />
                  </div>
                </div>
              </EndpointCard>
            </div>
          )}

          {/* Webhooks Section */}
          {activeSection === 'webhooks' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Webhooks</h2>
              
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Webhook Configuration</h3>
                <p className="text-gray-300 mb-4">
                  Configure a webhook URL to receive real-time notifications about transaction status changes and other events.
                </p>
                
                <div className="bg-blue-500 bg-opacity-10 border border-blue-500 rounded-lg p-4">
                  <div className="flex gap-2">
                    <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-blue-400 font-medium mb-1">Webhook Security</p>
                      <p className="text-blue-300 text-sm">
                        All webhook requests include a signature in the X-Platform-Signature header. 
                        Verify this signature using your API secret to ensure the webhook is from our platform.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <EndpointCard
                method="PUT"
                path="/v1/webhook"
                description="Update webhook URL"
                id="put-webhook"
              >
                <div className="space-y-4">
                  <p className="text-gray-300">Configure or update your webhook URL.</p>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2">Request Body</h4>
                    <ParameterTable
                      parameters={[
                        { name: 'webhook_url', type: 'string', required: true, description: 'Your webhook endpoint URL' }
                      ]}
                    />
                  </div>
                </div>
              </EndpointCard>

              <EndpointCard
                method="POST"
                path="/v1/webhook/test"
                description="Test webhook"
                id="test-webhook"
              >
                <div className="space-y-4">
                  <p className="text-gray-300">Send a test webhook to your configured URL.</p>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2">Webhook Events</h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <ul className="space-y-2">
                        <li className="flex items-start gap-3">
                          <code className="bg-gray-800 px-2 py-1 rounded text-yellow-400 text-sm">purchase.pending</code>
                          <p className="text-gray-300 text-sm">Purchase initiated and pending processing</p>
                        </li>
                        <li className="flex items-start gap-3">
                          <code className="bg-gray-800 px-2 py-1 rounded text-yellow-400 text-sm">purchase.successful</code>
                          <p className="text-gray-300 text-sm">Purchase completed successfully</p>
                        </li>
                        <li className="flex items-start gap-3">
                          <code className="bg-gray-800 px-2 py-1 rounded text-yellow-400 text-sm">purchase.failed</code>
                          <p className="text-gray-300 text-sm">Purchase failed</p>
                        </li>
                        <li className="flex items-start gap-3">
                          <code className="bg-gray-800 px-2 py-1 rounded text-yellow-400 text-sm">bulk_purchase.completed</code>
                          <p className="text-gray-300 text-sm">Bulk purchase completed</p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </EndpointCard>
            </div>
          )}

          {/* Statistics Section */}
          {activeSection === 'statistics' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Statistics API</h2>
              
              <EndpointCard
                method="GET"
                path="/v1/statistics"
                description="Get API usage statistics"
                id="get-statistics"
              >
                <div className="space-y-4">
                  <p className="text-gray-300">Retrieve detailed statistics about your API usage and transactions.</p>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2">Query Parameters</h4>
                    <ParameterTable
                      parameters={[
                        { name: 'period', type: 'string', required: false, description: 'Time period: 24hours, 7days, 30days (default: 7days)' }
                      ]}
                    />
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-2">Response</h4>
                    <CodeBlock
                      code={`{
  "success": true,
  "message": "Statistics retrieved",
  "data": {
    "period": "7days",
    "statistics": {
      "api_usage": {
        "total_requests": 1523,
        "successful_requests": 1500,
        "failed_requests": 23,
        "avg_response_time": 245
      },
      "transactions": {
        "successful": 450,
        "failed": 12,
        "pending": 38,
        "total_amount": 25000.00
      }
    }
  }
}`}
                      id="statistics-response"
                    />
                  </div>
                </div>
              </EndpointCard>
            </div>
          )}

          {/* Error Codes Section */}
          {activeSection === 'errors' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Error Codes</h2>
              
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Error Response Format</h3>
                <p className="text-gray-300 mb-4">
                  All API errors follow a consistent format to help you handle errors effectively.
                </p>
                
                <CodeBlock
                  code={`{
  "success": false,
  "message": "Human-readable error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error information"
  },
  "timestamp": "2025-01-01T12:00:00.000Z"
}`}
                  id="error-format"
                />
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Common Error Codes</h3>
                
                <div className="space-y-4">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Authentication Errors</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3">
                        <code className="bg-gray-800 px-2 py-1 rounded text-red-400 text-sm">401</code>
                        <div>
                          <p className="text-gray-300 font-medium">UNAUTHORIZED</p>
                          <p className="text-gray-400 text-sm">Missing or invalid API credentials</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <code className="bg-gray-800 px-2 py-1 rounded text-red-400 text-sm">403</code>
                        <div>
                          <p className="text-gray-300 font-medium">FORBIDDEN</p>
                          <p className="text-gray-400 text-sm">Valid credentials but insufficient permissions</p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Validation Errors</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3">
                        <code className="bg-gray-800 px-2 py-1 rounded text-yellow-400 text-sm">INVALID_PHONE_NUMBER</code>
                        <p className="text-gray-300 text-sm">Phone number format is invalid</p>
                      </li>
                      <li className="flex items-start gap-3">
                        <code className="bg-gray-800 px-2 py-1 rounded text-yellow-400 text-sm">INVALID_CAPACITY_FORMAT</code>
                        <p className="text-gray-300 text-sm">Capacity format is invalid (use: 1GB, 500MB)</p>
                      </li>
                      <li className="flex items-start gap-3">
                        <code className="bg-gray-800 px-2 py-1 rounded text-yellow-400 text-sm">PRODUCT_NOT_FOUND</code>
                        <p className="text-gray-300 text-sm">Product with specified capacity not found</p>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Transaction Errors</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3">
                        <code className="bg-gray-800 px-2 py-1 rounded text-yellow-400 text-sm">INSUFFICIENT_BALANCE</code>
                        <p className="text-gray-300 text-sm">Wallet balance insufficient for transaction</p>
                      </li>
                      <li className="flex items-start gap-3">
                        <code className="bg-gray-800 px-2 py-1 rounded text-yellow-400 text-sm">DUPLICATE_REFERENCE</code>
                        <p className="text-gray-300 text-sm">Transaction reference already exists</p>
                      </li>
                      <li className="flex items-start gap-3">
                        <code className="bg-gray-800 px-2 py-1 rounded text-yellow-400 text-sm">EXCEEDS_LIMIT</code>
                        <p className="text-gray-300 text-sm">Bulk order exceeds maximum limit</p>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Rate Limiting</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3">
                        <code className="bg-gray-800 px-2 py-1 rounded text-orange-400 text-sm">429</code>
                        <div>
                          <p className="text-gray-300 font-medium">TOO_MANY_REQUESTS</p>
                          <p className="text-gray-400 text-sm">Rate limit exceeded. Please slow down.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default APIDocumentation;