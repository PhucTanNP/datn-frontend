'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { TrendingUp, Package, DollarSign, ShoppingCart } from 'lucide-react';

interface OrdersByDay {
  createdAt: string;
  _count: number;
  _sum: { totalAmount: number };
}

interface TopProduct {
  productId: string;
  _sum: { quantity: number; totalPrice: number };
  product: { name: string };
}

interface OrdersByStatus {
  status: string;
  _count: number;
}

interface AnalyticsData {
  ordersByDay: OrdersByDay[];
  topProducts: TopProduct[];
  ordersByStatus: OrdersByStatus[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-400',
  confirmed: 'bg-green-400',
  cancelled: 'bg-gray-400',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã hủy',
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7' | '30'>('30');

  useEffect(() => {
    api.get('/api/v1/admin/analytics')
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-12 text-center text-gray-400 text-sm font-bold">Đang tải...</div>;
  if (!data) return <div className="p-12 text-center text-gray-400 text-sm font-bold">Không có dữ liệu</div>;

  const days = data.ordersByDay;
  const filteredDays = period === '7' ? days.slice(-7) : days;
  const maxCount = Math.max(...filteredDays.map(d => d._count), 1);
  const totalRevenue = days.reduce((s, d) => s + d._sum.totalAmount, 0);
  const totalOrders = days.reduce((s, d) => s + d._count, 0);

  return (
    <div className="animate-in fade-in space-y-8">
      <h2 className="text-4xl font-black uppercase italic tracking-tighter">
        Phân tích <span className="text-red-600">Thị trường</span>
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
            <DollarSign size={28} className="text-green-600" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Doanh thu 30 ngày</p>
            <p className="text-2xl font-black text-gray-900">{totalRevenue.toLocaleString('vi-VN')}₫</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
            <ShoppingCart size={28} className="text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tổng đơn hàng</p>
            <p className="text-2xl font-black text-gray-900">{totalOrders}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
            <Package size={28} className="text-purple-600" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sản phẩm bán chạy nhất</p>
            <p className="text-lg font-black text-gray-900 truncate max-w-[200px]">{data.topProducts[0]?.product?.name || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Biểu đồ đơn hàng */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[50px] shadow-xl border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black uppercase text-lg italic tracking-tighter">Đơn hàng theo ngày</h3>
            <div className="flex gap-2">
              {['7', '30'].map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p as '7' | '30')}
                  className={`px-5 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                    period === p ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400 hover:text-gray-900'
                  }`}
                >
                  {p} ngày
                </button>
              ))}
            </div>
          </div>
          <div className="h-72 flex items-end justify-between gap-2 px-2 border-b-2 border-gray-100 pb-2">
            {filteredDays.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <div
                  className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t-xl relative transition-all hover:scale-105 shadow-lg shadow-red-100"
                  style={{ height: `${(d._count / maxCount) * 100}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity font-black whitespace-nowrap">
                    {d._count} đơn - {d._sum.totalAmount.toLocaleString('vi-VN')}₫
                  </div>
                </div>
                <span className="text-[8px] text-gray-400 font-bold">
                  {new Date(d.createdAt).getDate()}/{new Date(d.createdAt).getMonth() + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top sản phẩm */}
        <div className="bg-white p-8 rounded-[50px] shadow-xl border border-gray-100">
          <h3 className="font-black uppercase text-lg italic tracking-tighter mb-8">Top bán chạy</h3>
          <div className="space-y-4">
            {data.topProducts.slice(0, 6).map((p, i) => (
              <div key={p.productId} className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                  i === 0 ? 'bg-red-600 text-white' : i === 1 ? 'bg-gray-900 text-white' : i === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{p.product?.name}</p>
                  <p className="text-[10px] text-gray-400 font-semibold">{p._sum.quantity} cái - {p._sum.totalPrice.toLocaleString('vi-VN')}₫</p>
                </div>
              </div>
            ))}
            {data.topProducts.length === 0 && (
              <p className="text-sm text-gray-400 italic text-center py-8">Chưa có dữ liệu</p>
            )}
          </div>
        </div>
      </div>

      {/* Đơn hàng theo trạng thái */}
      <div className="bg-white p-8 rounded-[50px] shadow-xl border border-gray-100">
        <h3 className="font-black uppercase text-lg italic tracking-tighter mb-8">Đơn hàng theo trạng thái</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {data.ordersByStatus.map(s => (
            <div key={s.status} className="bg-gray-50 p-6 rounded-[32px] text-center border border-gray-100">
              <div className={`w-4 h-4 rounded-full ${STATUS_COLORS[s.status] || 'bg-gray-400'} mx-auto mb-3`} />
              <p className="text-3xl font-black text-gray-900">{s._count}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">
                {STATUS_LABELS[s.status] || s.status}
              </p>
            </div>
          ))}
          {data.ordersByStatus.length === 0 && (
            <p className="text-sm text-gray-400 italic col-span-full text-center py-8">Chưa có đơn hàng</p>
          )}
        </div>
      </div>
    </div>
  );
}