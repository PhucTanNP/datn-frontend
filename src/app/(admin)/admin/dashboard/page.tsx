'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, ArrowUpRight } from 'lucide-react';
import api from '@/lib/api';
import type { Order } from '@/types/order';
import type { User } from '@/types/auth';
import type { Product, Category } from '@/types/product';

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersRes, usersRes, productsRes, categoriesRes] = await Promise.all([
        api.get('/api/v1/admin/orders'),
        api.get('/api/v1/admin/users'),
        api.get('/api/v1/admin/products'),
        api.get('/api/v1/admin/categories')
      ]);

      setOrders(ordersRes.data.data || []);
      setUsersList(usersRes.data.data || []);
      setProducts(productsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Stats calculation
  const totalRevenue = orders.reduce((s, o) => s + (o.status === 'delivered' ? o.total_amount : 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-4xl font-black uppercase mb-10 italic tracking-tighter">Bảng điều khiển <span className="text-red-600">Admin</span></h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Doanh thu (VNĐ)</p>
            <p className="text-3xl font-black text-gray-900 tracking-tighter">{totalRevenue.toLocaleString('vi-VN')}đ</p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest bg-green-50 w-fit px-3 py-1 rounded-full"><ArrowUpRight size={14} /> +12.5%</div>
        </div>
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Đơn chờ xử lý</p>
            <p className="text-3xl font-black text-red-600 tracking-tighter">{pendingOrders}</p>
          </div>
          <button onClick={() => window.location.href = '/admin/orders'} className="mt-4 text-[10px] font-black uppercase text-gray-400 hover:text-red-600 transition-colors">Chi tiết đơn hàng →</button>
        </div>
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Khách hàng mới</p>
            <p className="text-3xl font-black text-gray-900 tracking-tighter">{usersList.length}</p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-widest bg-blue-50 w-fit px-3 py-1 rounded-full">Hoạt động</div>
        </div>
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Sản phẩm kho</p>
            <p className="text-3xl font-black text-gray-900 tracking-tighter">{products.length}</p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-orange-500 text-[10px] font-black uppercase tracking-widest bg-orange-50 w-fit px-3 py-1 rounded-full">Đang bán</div>
        </div>
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Danh mục</p>
            <p className="text-3xl font-black text-gray-900 tracking-tighter">{categories.length}</p>
          </div>
          <button onClick={() => window.location.href = '/admin/categories'} className="mt-4 text-[10px] font-black uppercase text-gray-400 hover:text-red-600 transition-colors">Quản lý danh mục →</button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 mb-8">
        <h3 className="font-black uppercase mb-6 text-lg italic tracking-tight">Quản lý nhanh</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button onClick={() => window.location.href = '/admin/products'} className="p-4 bg-gray-50 hover:bg-red-50 rounded-2xl text-left group transition-colors">
            <div className="text-2xl mb-2">📦</div>
            <p className="text-sm font-black text-gray-900 group-hover:text-red-600">Sản phẩm</p>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Quản lý kho</p>
          </button>
          <button onClick={() => window.location.href = '/admin/categories'} className="p-4 bg-gray-50 hover:bg-red-50 rounded-2xl text-left group transition-colors">
            <div className="text-2xl mb-2">🏷️</div>
            <p className="text-sm font-black text-gray-900 group-hover:text-red-600">Danh mục</p>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Phân loại</p>
          </button>
          <button onClick={() => window.location.href = '/admin/orders'} className="p-4 bg-gray-50 hover:bg-red-50 rounded-2xl text-left group transition-colors">
            <div className="text-2xl mb-2">📋</div>
            <p className="text-sm font-black text-gray-900 group-hover:text-red-600">Đơn hàng</p>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Xử lý đơn</p>
          </button>
          <button onClick={() => window.location.href = '/admin/users'} className="p-4 bg-gray-50 hover:bg-red-50 rounded-2xl text-left group transition-colors">
            <div className="text-2xl mb-2">👥</div>
            <p className="text-sm font-black text-gray-900 group-hover:text-red-600">Khách hàng</p>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Quản lý user</p>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-gray-100">
          <h3 className="font-black uppercase mb-8 flex items-center gap-3 text-lg italic tracking-tight border-b pb-4"><AlertCircle className="text-orange-500" /> Đơn hàng mới</h3>
          <div className="space-y-6">
            {orders.slice(0, 5).map(o => (
              <div key={o.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-gray-300 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">DRC</div>
                  <div>
                    <p className="text-sm font-black text-gray-900">{o.shipping_name || 'Khách hàng'}</p>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{o.status === 'pending' ? 'Chờ xác nhận' : o.status === 'delivered' ? 'Hoàn tất' : 'Đang xử lý'}</p>
                  </div>
                </div>
                <p className="text-sm font-black text-red-600">+{o.total_amount.toLocaleString('vi-VN')}đ</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-gray-100">
          <h3 className="font-black uppercase mb-8 flex items-center gap-3 text-lg italic tracking-tight border-b pb-4"><TrendingUp className="text-green-500" /> Tăng trưởng doanh số</h3>
          <div className="h-64 flex items-end justify-between gap-2 px-4 pb-4">
            {[40, 70, 45, 90, 65, 80, 95].map((h, i) => (
              <div key={i} className="flex-1 bg-red-600 rounded-t-xl relative group" style={{ height: `${h}%` }}>
                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">T.{i+1}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4">
             <span>Tháng 1</span><span>Tháng 7</span>
          </div>
        </div>
      </div>
    </div>
  );
}