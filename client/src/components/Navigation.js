import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatRole, getInitials } from '../utils/helpers';

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const getNavigationItems = () => {
    const baseItems = [
      { path: '/dashboard', label: 'Dashboard', icon: '📊' }
    ];

    const roleSpecificItems = {
      admin: [
        { path: '/clients', label: 'Clients', icon: '🏢' },
        { path: '/projects', label: 'Projects', icon: '📁' },
        { path: '/users', label: 'Users', icon: '👥' },
        { path: '/departments', label: 'Departments', icon: '🏛️' },
        { path: '/reports', label: 'Reports', icon: '📈' }
      ],
      resource_manager: [
        { path: '/projects', label: 'Projects', icon: '📁' },
        { path: '/team', label: 'My Team', icon: '👥' },
        { path: '/allocations', label: 'Allocations', icon: '📋' },
        { path: '/requests', label: 'Requests', icon: '📝' }
      ],
      engagement_manager: [
        { path: '/clients', label: 'Clients', icon: '🏢' },
        { path: '/projects', label: 'Projects', icon: '📁' },
        { path: '/resources', label: 'Resources', icon: '👨‍💼' },
        { path: '/requests', label: 'My Requests', icon: '📤' }
      ]
    };

    return [...baseItems, ...(roleSpecificItems[user?.role] || [])];
  };

  const handleLogout = async () => {
    await logout();
    setIsProfileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="text-xl font-bold text-primary-600">
                RMS
              </Link>
              <span className="ml-2 text-gray-600 text-sm">Resource Management</span>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-1">
              {getNavigationItems().map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
                  {getInitials(user?.name)}
                </div>
                <div className="ml-3 hidden sm:block">
                  <div className="text-sm font-medium text-gray-700">{user?.name}</div>
                  <div className="text-xs text-gray-500">{formatRole(user?.role)}</div>
                </div>
                <svg className="ml-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isProfileMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <span className="mr-3">👤</span>
                      Your Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <span className="mr-3">⚙️</span>
                      Settings
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                    >
                      <span className="mr-3">🚪</span>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="sm:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50">
          {getNavigationItems().map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive(item.path)
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;