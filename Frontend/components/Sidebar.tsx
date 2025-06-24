'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import api from '../utils/api'
import { LayoutDashboard, Upload, Plus, LogOut, User } from 'lucide-react';

interface SidebarProps {
  role: string | null;
  username: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, alwaysVisible: true },
  { name: 'Upload CSV', href: '/upload-csv', icon: Upload, visibleTo: 'master' },
  { name: 'Add Page', href: '/add', icon: Plus, visibleTo: 'master' },
];

export default function Sidebar({ role, username, isOpen, onToggle, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
  
      localStorage.clear();     // 🧹 Clear client-side storage
      onClose();                // 📦 Close sidebar
      router.push('/login');    // 🔁 Redirect
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavClick = () => {
    onClose(); // Close sidebar on navigation
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg lg:hidden hover:bg-gray-50 transition-all duration-200 hover:shadow-xl"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        <div className="relative w-5 h-5">
          <span className={`absolute block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${
            isOpen ? 'rotate-45 top-2' : 'top-1'
          }`} />
          <span className={`absolute block w-5 h-0.5 bg-gray-600 transition-all duration-300 top-2 ${
            isOpen ? 'opacity-0' : 'opacity-100'
          }`} />
          <span className={`absolute block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${
            isOpen ? '-rotate-45 top-2' : 'top-3'
          }`} />
        </div>
      </button>

      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 lg:hidden ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto w-72 lg:w-72 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-500 mt-1">Management Dashboard</p>
          </div>
        </div>

        {/* User Info */}
        {username && (
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                <User size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{username}</p>
                <p className="text-xs text-blue-600 capitalize font-medium">{role || 'User'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const canView = item.alwaysVisible || item.visibleTo === role;
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              canView && (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`
                    group flex items-center space-x-3 px-4 py-3 rounded-xl
                    text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border-l-4 border-blue-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                    }
                  `}
                >
                  <Icon 
                    size={20} 
                    className={`transition-colors duration-200 ${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`} 
                  />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="
              w-full flex items-center space-x-3 px-4 py-3 rounded-xl
              text-sm font-medium text-red-600 
              hover:bg-red-50 hover:text-red-700
              transition-all duration-200
              border border-red-200 hover:border-red-300 hover:shadow-sm
              group
            "
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform duration-200" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}