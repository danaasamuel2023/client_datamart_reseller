// components/AccountSidebar.jsx
'use client';

import { useState } from 'react';
import { 
  X, 
  LayoutDashboard, 
  Package, 
  User, 
  History, 
  LogOut,
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Send,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function AccountSidebar({ isOpen, onClose, userBalance = 8986.00 }) {
  const [topupAmount, setTopupAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [todayEarnings] = useState(39000.00);
  const [todaySpent] = useState(30642.00);
  const [isTopupLoading, setIsTopupLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleTopup = async () => {
    if (!topupAmount || parseFloat(topupAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    setIsTopupLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`Topup of ₵${topupAmount} initiated`);
      setTopupAmount('');
    } catch (error) {
      alert('Topup failed. Please try again.');
    } finally {
      setIsTopupLoading(false);
    }
  };

  const handleVerifyTransaction = async () => {
    if (!transactionId) {
      alert('Please enter a transaction ID');
      return;
    }
    
    setIsVerifying(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`Transaction ${transactionId} verified successfully`);
      setTransactionId('');
    } catch (error) {
      alert('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Package, label: 'Orders', href: '/orders' },
    { icon: User, label: 'Account details', href: '/account' },
    { icon: History, label: 'Wallet History', href: '/wallet-history' },
    { icon: LogOut, label: 'Log out', href: '/logout', danger: true }
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity z-40 ${
          isOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-96 bg-[#1f2128] z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Account</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Navigation Menu */}
          <nav className="p-4">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  item.danger 
                    ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </nav>
          
          {/* Balance Section */}
          <div className="mx-4 p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl">
            <div className="text-center mb-4">
              <p className="text-blue-100 text-sm mb-2">AVAILABLE BALANCE</p>
              <p className="text-4xl font-bold text-white">
                ₵{userBalance.toFixed(2).toLocaleString()}
              </p>
            </div>
            
            {/* Today's Statistics */}
            <div className="flex justify-between items-center pt-4 border-t border-blue-500/30">
              <span className="text-blue-100 text-sm">TODAY</span>
              <div className="flex gap-4">
                <span className="flex items-center gap-1 text-green-400 text-sm font-medium">
                  <ArrowUpRight className="w-4 h-4" />
                  +{todayEarnings.toFixed(2).toLocaleString()}
                </span>
                <span className="flex items-center gap-1 text-red-400 text-sm font-medium">
                  <ArrowDownRight className="w-4 h-4" />
                  -{todaySpent.toFixed(2).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          {/* Add Money Section */}
          <div className="mx-4 mt-6 p-4 bg-gray-800 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-5 h-5 text-gray-400" />
              <h3 className="text-white font-medium">Add Money</h3>
            </div>
            
            <div className="space-y-3">
              <input
                type="number"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 bg-[#2a2d3a] text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none placeholder-gray-500"
              />
              <button
                onClick={handleTopup}
                disabled={isTopupLoading}
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isTopupLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Topup
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Send & Claim Section */}
          <div className="mx-4 mt-6 mb-6 p-4 bg-gray-800 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Send className="w-5 h-5 text-gray-400" />
              <h3 className="text-white font-medium">Send & Claim</h3>
            </div>
            
            <div className="space-y-3">
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter Transaction ID:"
                className="w-full px-4 py-3 bg-[#2a2d3a] text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none placeholder-gray-500"
              />
              <p className="text-gray-400 text-xs">
                Enter the MoMo transaction ID from your payment.
              </p>
              <button
                onClick={handleVerifyTransaction}
                disabled={isVerifying}
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Verify Transaction
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Mobile-optimized version with bottom sheet style
export function MobileAccountMenu({ isOpen, onClose, userBalance = 8986.00 }) {
  const [topupAmount, setTopupAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  
  return (
    <>
      {/* Overlay */}
      <div 
        className={`md:hidden fixed inset-0 bg-black transition-opacity z-40 ${
          isOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-[#1f2128] z-50 rounded-t-2xl transform transition-transform duration-300 ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="max-h-[90vh] overflow-y-auto pb-safe">
          {/* Handle */}
          <div className="flex justify-center pt-2 pb-4">
            <div className="w-12 h-1 bg-gray-600 rounded-full" />
          </div>
          
          {/* Header */}
          <div className="px-6 pb-4">
            <h2 className="text-xl font-bold text-white">Account Menu</h2>
          </div>
          
          {/* Balance Card */}
          <div className="px-6 pb-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-xl">
              <p className="text-blue-100 text-sm mb-1">Available Balance</p>
              <p className="text-3xl font-bold text-white">
                ₵{userBalance.toFixed(2).toLocaleString()}
              </p>
            </div>
          </div>
          
          {/* Quick Actions Grid */}
          <div className="px-6 pb-4">
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-gray-800 p-4 rounded-lg text-white hover:bg-gray-700 transition-colors">
                <Wallet className="w-6 h-6 mb-2 text-blue-400" />
                <span className="text-sm">Top Up</span>
              </button>
              <button className="bg-gray-800 p-4 rounded-lg text-white hover:bg-gray-700 transition-colors">
                <Send className="w-6 h-6 mb-2 text-green-400" />
                <span className="text-sm">Send</span>
              </button>
              <button className="bg-gray-800 p-4 rounded-lg text-white hover:bg-gray-700 transition-colors">
                <History className="w-6 h-6 mb-2 text-yellow-400" />
                <span className="text-sm">History</span>
              </button>
              <button className="bg-gray-800 p-4 rounded-lg text-white hover:bg-gray-700 transition-colors">
                <Package className="w-6 h-6 mb-2 text-purple-400" />
                <span className="text-sm">Orders</span>
              </button>
            </div>
          </div>
          
          {/* Menu Items */}
          <div className="px-6 pb-6">
            <a href="/dashboard" className="flex items-center gap-3 py-3 text-gray-300">
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </a>
            <a href="/account" className="flex items-center gap-3 py-3 text-gray-300">
              <User className="w-5 h-5" />
              <span>Account Details</span>
            </a>
            <a href="/logout" className="flex items-center gap-3 py-3 text-red-400">
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}