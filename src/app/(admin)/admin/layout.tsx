'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { LogOut } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, accessToken } = useAuthStore();
  const [loading, setLoading] = useState(true);

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
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  if (user?.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center">Truy cập bị từ chối. Chỉ admin.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">Admin DRC</h2>
          </div>
          <nav className="p-4 space-y-2">
            <Link href="/admin/dashboard" className="block p-3 rounded-lg hover:bg-gray-100">Dashboard</Link>
            <Link href="/admin/products" className="block p-3 rounded-lg hover:bg-gray-100">Sản phẩm</Link>
            <Link href="/admin/orders" className="block p-3 rounded-lg hover:bg-gray-100">Đơn hàng</Link>
            <Link href="/admin/users" className="block p-3 rounded-lg hover:bg-gray-100">Người dùng</Link>
            <Link href="/admin/analytics" className="block p-3 rounded-lg hover:bg-gray-100">Phân tích</Link>
          </nav>
        </div>
        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold">Admin Panel</h1>
            <Button variant="ghost" onClick={logout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </Button>
          </header>
          <main className="p-8 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}