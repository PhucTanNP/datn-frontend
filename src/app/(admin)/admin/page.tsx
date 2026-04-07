'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BarChart3, Package, FileText, Users, TrendingUp } from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Tổng quan', icon: BarChart3, href: '/admin/dashboard' },
    { id: 'products', label: 'Kho hàng', icon: Package, href: '/admin/products' },
    { id: 'orders', label: 'Đơn hàng', icon: FileText, href: '/admin/orders' },
    { id: 'users', label: 'Người dùng', icon: Users, href: '/admin/users' },
    { id: 'analytics', label: 'Phân tích', icon: TrendingUp, href: '/admin/analytics' }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Sidebar giả lập bằng Top Nav Admin */}
      <div className="bg-white border-b px-4 py-2 sticky top-[108px] z-40 shadow-sm">
        <div className="container mx-auto flex items-center gap-4 overflow-x-auto no-scrollbar">
          {tabs.map(t => (
            <Link
              key={t.id}
              href={t.href}
              className={`flex items-center gap-2 py-3 px-5 rounded-2xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === t.id ? 'bg-red-600 text-white shadow-xl shadow-red-100 scale-105' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setActiveTab(t.id)}
            >
              <t.icon size={16} /> {t.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="text-center py-20">
          <h1 className="text-4xl font-black uppercase mb-4 italic tracking-tighter">Chào mừng đến <span className="text-red-600">Admin Panel</span></h1>
          <p className="text-lg text-gray-600 mb-8">Chọn một tab ở trên để bắt đầu quản lý hệ thống DRC Tires</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {tabs.slice(1).map(tab => (
              <Link
                key={tab.id}
                href={tab.href}
                className="bg-white p-8 rounded-[32px] shadow-xl border border-gray-100 hover:shadow-2xl transition-all group"
                onClick={() => setActiveTab(tab.id)}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-red-600 text-white rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <tab.icon size={32} />
                  </div>
                  <h3 className="font-black uppercase text-lg mb-2 italic tracking-tight">{tab.label}</h3>
                  <p className="text-sm text-gray-500">Quản lý {tab.label.toLowerCase()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}