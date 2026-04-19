'use client';

import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import api from '@/lib/api';
import type { Order } from '@/types/order';
import Loading from '@/app/loading';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/admin/orders');
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, status: string) => {
    try {
      await api.put(`/api/v1/admin/orders/${orderId}`, { status });
      await loadOrders();
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('Cập nhật đơn hàng thất bại. Vui lòng thử lại.');
    }
  };

  const handleOrderDelete = async (orderId: string) => {
    if (!confirm("Xóa đơn hàng vĩnh viễn?")) return;

    try {
      await api.delete(`/api/v1/admin/orders/${orderId}`);
      await loadOrders();
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('Xóa đơn hàng thất bại. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="animate-in fade-in space-y-8">
      <h2 className="text-4xl font-black uppercase italic mb-10 italic tracking-tighter">Quản lý <span className="text-red-600">Đơn hàng</span></h2>
      {orders.map(o => (
        <div key={o.id} className="bg-white p-10 rounded-[50px] shadow-xl border border-gray-100 grid grid-cols-1 lg:grid-cols-4 gap-12 hover:shadow-2xl transition-all">
          <div className="lg:border-r pr-10 border-gray-100 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-gray-300 mb-3 tracking-widest">Đơn hàng #{o.order_number || o.id.slice(-6)}</p>
              <h4 className="text-2xl font-black text-gray-900 uppercase italic tracking-tight">{o.shipping_name || 'Khách hàng'}</h4>
              <p className="text-lg font-black text-red-600 mb-6">{o.shipping_phone || 'N/A'}</p>
              <div className="flex items-start gap-3 text-xs text-gray-500 font-medium leading-relaxed bg-gray-50 p-4 rounded-2xl"><FileText size={18} className="shrink-0 text-red-600" /> {o.shipping_address}</div>
            </div>
            <p className="text-[10px] text-gray-300 font-black mt-8 uppercase tracking-widest">{new Date(o.created_at).toLocaleString('vi-VN')}</p>
          </div>
          <div className="lg:col-span-2">
            <p className="text-[10px] font-black uppercase text-gray-300 mb-6 tracking-widest italic">Chi tiết sản phẩm</p>
            <div className="space-y-4">
              {o.items?.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50/50 p-5 rounded-[25px] border border-gray-100 group hover:bg-white hover:shadow-md transition-all">
                  <span className="text-sm font-black uppercase group-hover:text-red-600 transition-colors">{it.product?.name || 'Sản phẩm'} <span className="ml-3 text-red-600 font-black tracking-widest">X {it.quantity}</span></span>
                  <span className="text-sm font-black tracking-tighter">{it.total_price.toLocaleString('vi-VN')}đ</span>
                </div>
              ))}
            </div>
            <div className="mt-10 pt-6 border-t flex justify-between items-end">
              <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest">Tổng thu hộ (COD):</span>
              <span className="text-5xl font-black text-red-600 tracking-tighter">{o.total_amount.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-4">
            <div className={`py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-center shadow-sm ${o.status === 'pending' ? 'bg-orange-50 text-orange-600 border border-orange-100' : o.status === 'delivered' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
              {o.status === 'pending' ? 'Đang chờ xử lý' : o.status === 'delivered' ? 'Đã giao thành công' : 'Đang xử lý'}
            </div>
            {o.status === 'pending' ? (
              <button onClick={() => handleOrderStatusUpdate(o.id, 'delivered')} className="w-full py-6 bg-gray-900 text-white font-black rounded-3xl shadow-xl hover:bg-black transition-all uppercase text-xs tracking-widest">Xác nhận giao hàng</button>
            ) : (
              <div className="w-full py-6 bg-gray-50 text-gray-400 font-black rounded-3xl text-center uppercase text-[10px] tracking-widest border border-gray-100">Đơn hàng hoàn tất</div>
            )}
            <button onClick={() => handleOrderDelete(o.id)} className="w-full py-2 text-gray-300 font-black uppercase text-[9px] tracking-widest hover:text-red-600 transition-colors">Hủy & Xóa đơn</button>
          </div>
        </div>
      ))}
    </div>
  );
}