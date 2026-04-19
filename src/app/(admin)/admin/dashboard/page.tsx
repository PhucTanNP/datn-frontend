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
    </div>
  );
}