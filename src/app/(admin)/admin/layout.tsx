'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {  BarChart3, Package, FileText, Users, TrendingUp } from 'lucide-react';
import Loading from '@/app/loading';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, accessToken } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const tabs = [
    { id: 'dashboard', label: 'Tổng quan', icon: BarChart3, href: '/admin/dashboard' },
    { id: 'products', label: 'Kho hàng', icon: Package, href: '/admin/products' },
    { id: 'orders', label: 'Đơn hàng', icon: FileText, href: '/admin/orders' },
    { id: 'users', label: 'Người dùng', icon: Users, href: '/admin/users' },
    { id: 'analytics', label: 'Phân tích', icon: TrendingUp, href: '/admin/analytics' }
  ];

  useEffect(() => {
    if (!accessToken) {
      window.location.href = '/login';
      return;
    }

    let attempts = 0;
    const maxAttempts = 50; // 5 seconds (100ms * 50)

    // Chờ user được fetch từ Header's initialize
    const checkUser = () => {
      if (user !== null) {
        setLoading(false);
      } else if (attempts >= maxAttempts) {
        // Timeout: Nếu sau 5s vẫn chưa có user, có thể token invalid hoặc API lỗi
        console.error('Timeout waiting for user data');
        window.location.href = '/login'; // Hoặc hiển thị lỗi
      } else {
        attempts++;
        setTimeout(checkUser, 100);
      }
    };

    checkUser();
  }, [accessToken, user]);

  if (loading) {
    return <Loading />;
  }

  if (user?.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center">Truy cập bị từ chối. Chỉ admin.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex flex-col min-h-screen">
          {/* Header */}


          {/* Top Navigation Tabs */}
          <div className="bg-white border-b shadow-sm">
          <div className="px-4 py-3">
            
            
              <div className="flex justify-between gap-2 bg-gray-100 p-1.5 rounded-full shadow-inner">
                {tabs.map(t => (
                  <Link
                    key={t.id}
                    href={t.href}
                    className={`
                      flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all
                      ${pathname === t.href || (t.href !== '/admin/dashboard' && pathname.startsWith(t.href))
                        ? 'bg-red-600 text-white shadow-md scale-105'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-white'
                      }
                    `}
                  >
                    <t.icon size={14} />
                    {t.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
 
          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
  );
}