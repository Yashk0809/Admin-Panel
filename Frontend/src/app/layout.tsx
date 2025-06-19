'use client';
import './globals.css';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '../../components/Sidebar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Check authentication state
    const storedRole = localStorage.getItem('role');
    const storedUsername = localStorage.getItem('username');
    
    setRole(storedRole);
    setUsername(storedUsername);
    setIsLoading(false);
    
    // Close sidebar on route change
    setSidebarOpen(false);
  }, [pathname]);

  // Close sidebar when user logs out (role becomes null)
  useEffect(() => {
    if (!role) {
      setSidebarOpen(false);
    }
  }, [role]);

  const showSidebar = !!role && !isLoading;
  const isAuthPage = pathname === '/login' || pathname === '/register';

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <html lang="en">
      <body className={`min-h-screen transition-colors duration-300 ${
        showSidebar ? 'bg-gray-50' : 'bg-white'
      }`}>
        <div className="flex min-h-screen">
          {showSidebar && (
            <Sidebar
              role={role}
              username={username}
              isOpen={sidebarOpen}
              onToggle={toggleSidebar}
              onClose={closeSidebar}
            />
          )}
          
          <main className={`flex-1 transition-all duration-300 ${
            showSidebar ? 'lg:ml-0' : ''
          } ${isAuthPage ? '' : 'min-w-0'}`}>
            <div className={`${showSidebar && !isAuthPage ? '' : 'p-0'} transition-all duration-300`}>
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}