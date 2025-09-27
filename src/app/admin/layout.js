'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  HomeIcon, 
  UserGroupIcon, 
  CubeIcon, 
  CreditCardIcon,
  WalletIcon,
  CogIcon,
  ChartBarIcon,
  KeyIcon,
  BellIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { 
      name: 'Dashboard', 
      href: '/admin', 
      icon: HomeIcon,
      badge: null 
    },
    { 
      name: 'Users', 
      href: '/admin/users', 
      icon: UserGroupIcon,
      badge: null 
    },
    { 
      name: 'Products', 
      href: '/admin/products', 
      icon: CubeIcon,
      badge: null 
    },
    { 
      name: 'Transactions', 
      href: '/admin/transactions', 
      icon: CreditCardIcon,
      badge: '5' 
    },
    { 
      name: 'Wallet', 
      href: '/admin/wallet', 
      icon: WalletIcon,
      badge: null 
    },
    { 
      name: 'Reports', 
      href: '/admin/reports', 
      icon: ChartBarIcon,
      badge: null 
    },
    { 
      name: 'API Management', 
      href: '/admin/api-management', 
      icon: KeyIcon,
      badge: null 
    },
    { 
      name: 'Settings', 
      href: '/admin/settings', 
      icon: CogIcon,
      badge: null 
    },
    { 
      name: 'Notifications', 
      href: '/admin/notifications', 
      icon: BellIcon,
      badge: '3' 
    },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('Token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      
      try {
        // Simulate API call to verify token and get user data
        // Replace with actual API endpoint
        const response = await fetch('http://localhost:5000/api/admin/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Invalid token');
        }
        
        const data = await response.json();
        setUser(data.user || {
          fullName: 'Admin User',
          email: 'admin@mtndata.com',
          role: 'admin',
          avatar: null
        });
        
        // Fetch notifications count
        fetchNotifications();
      } catch (error) {
        localStorage.removeItem('Token');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    // Apply dark mode preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      // Simulate fetching notifications
      setNotifications([
        { id: 1, message: 'New user registration', time: '5 min ago' },
        { id: 2, message: 'Transaction failed', time: '1 hour ago' },
        { id: 3, message: 'Low stock alert', time: '2 hours ago' }
      ]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('adminToken');
      router.push('/login');
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-sm z-40 h-16">
        <div className="flex items-center justify-between h-full px-6">
          {/* Left side */}
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {sidebarOpen ? (
                <XMarkIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            
            <div className="ml-4 flex items-center">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">MT</span>
              </div>
              <h1 className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">
                MTN Data Admin
              </h1>
            </div>
          </div>
          
          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? (
                <SunIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <MoonIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 relative">
                <BellIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            </div>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <UserCircleIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden md:block">
                  {user?.fullName}
                </span>
                <ChevronDownIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 hidden md:block" />
              </button>

              {/* Dropdown menu */}
              {profileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2">
                  <div className="px-4 py-2 border-b dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    href="/admin/profile"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/admin/settings"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 bottom-0 bg-gray-900 dark:bg-gray-950 transition-all duration-300 z-30 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}>
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
                           (item.href !== '/admin' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors group ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="ml-3 transition-opacity">
                      {item.name}
                    </span>
                  )}
                </div>
                {sidebarOpen && item.badge && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    isActive 
                      ? 'bg-blue-700 text-blue-100' 
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        {sidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                <UserCircleIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {user?.fullName}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 pt-16 ${
        sidebarOpen ? 'ml-64' : 'ml-20'
      }`}>
        <div className="p-6">
          {/* Breadcrumb */}
          <div className="mb-4">
            <nav className="text-sm text-gray-600 dark:text-gray-400">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href="/admin" className="hover:text-gray-900 dark:hover:text-white">
                    Home
                  </Link>
                </li>
                {pathname !== '/admin' && (
                  <>
                    <li>/</li>
                    <li className="text-gray-900 dark:text-white capitalize">
                      {pathname.split('/').slice(2).join(' / ') || 'Dashboard'}
                    </li>
                  </>
                )}
              </ol>
            </nav>
          </div>

          {/* Page content */}
          {children}
        </div>

        {/* Footer */}
        <footer className="mt-auto px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© 2024 MTN Data Platform. All rights reserved.</p>
        </footer>
      </main>

      {/* Toast notifications container (you can add react-toastify here) */}
    </div>
  );
}