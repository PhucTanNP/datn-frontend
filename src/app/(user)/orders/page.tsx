'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import Loading from '@/app/loading';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my').then((res) => {
      setOrders(res.data.orders);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Đơn hàng của bạn</h1>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left">Mã đơn</th>
                  <th className="p-4 text-left">Trạng thái</th>
                  <th className="p-4 text-right">Tổng tiền</th>
                  <th className="p-4 text-left">Ngày đặt</th>
                  <th className="p-4">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-medium">{order.order_number}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold">{order.total_amount.toLocaleString()}đ</td>
                    <td className="p-4">{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                    <td className="p-4">
                      <Button variant="outline" size="sm">Xem</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {orders.length === 0 && <p className="text-center py-12 text-gray-500">Chưa có đơn hàng nào.</p>}
      </div>
    </div>
  );
}