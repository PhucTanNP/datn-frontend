'use client';

import Link from 'next/link';
import { Package, FileText, Users, TrendingUp } from 'lucide-react';

export default function AdminPage() {
  const tabs = [
    { id: 'products', label: 'Kho hàng', icon: Package, href: '/admin/products' },
    { id: 'orders', label: 'Đơn hàng', icon: FileText, href: '/admin/orders' },
    { id: 'users', label: 'Người dùng', icon: Users, href: '/admin/users' },
    { id: 'analytics', label: 'Phân tích', icon: TrendingUp, href: '/admin/analytics' }
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tabs.map(tab => (
            <Link
              key={tab.id}
              href={tab.href}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-red-600 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <tab.icon size={28} />
                </div>
                <h3 className="font-bold uppercase text-lg mb-2 text-gray-800 group-hover:text-red-600 transition-colors">
                  {tab.label}
                </h3>
                <p className="text-sm text-gray-500">
                  Quản lý {tab.label.toLowerCase()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}