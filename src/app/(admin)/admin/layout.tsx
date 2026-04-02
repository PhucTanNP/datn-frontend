'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { LogOut } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuthStore();

  if (user?.role !== 'admin') {
    return <div>Truy cập bị từ chối. Chỉ admin.</div>;
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