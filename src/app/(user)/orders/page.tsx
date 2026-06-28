'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import Loading from '@/app/loading';
import { NotFound } from '@/app/not-found';
import type { Order } from '@/types/order';
import { XCircle, ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: '⏳ Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: '✅ Đã xác nhận',  color: 'bg-green-100 text-green-800' },
  cancelled: { label: '❌ Đã hủy',       color: 'bg-red-100 text-red-800' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    api.get('/orders/my')
      .then((res) => {
        setOrders(res.data.orders || []);
        setLoading(false);
      })
      .catch((error) => {
        if (error.response?.status === 404) {
          setNotFound(true);
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <Loading />;

  if (notFound) return <NotFound />;

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
                {orders.map((order) => {
                  const info = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' };
                  const isExpanded = expandedId === order.id;
                  return (
                    <tr key={order.id} className="border-t hover:bg-gray-50">
                      <td className="p-4 font-medium">{order.order_number}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${info.color}`}>
                          {info.label}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold">{order.total_amount.toLocaleString()}đ</td>
                      <td className="p-4">{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                      <td className="p-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setExpandedId(isExpanded ? null : order.id)}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expanded detail section */}
        {expandedId && (() => {
          const order = orders.find(o => o.id === expandedId);
          if (!order) return null;
          return (
            <div className="mt-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 animate-fadeIn">
              <h3 className="font-bold text-lg mb-4">Chi tiết đơn hàng #{order.order_number}</h3>
              
              {/* Lý do hủy (nếu có) */}
              {order.status === 'cancelled' && order.cancel_reason && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <XCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-red-800 text-sm">Lý do hủy đơn:</p>
                      <p className="text-red-700 text-sm mt-1">{order.cancel_reason}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500 space-y-1">
                <p>Mã đơn: <span className="font-bold text-gray-900">{order.order_number}</span></p>
                <p>Trạng thái: <span className="font-bold text-gray-900">{STATUS_LABELS[order.status]?.label || order.status}</span></p>
                <p>Tổng tiền: <span className="font-bold text-gray-900">{order.total_amount.toLocaleString()}đ</span></p>
                <p>Ngày đặt: <span className="font-bold text-gray-900">{new Date(order.created_at).toLocaleDateString('vi-VN')}</span></p>
              </div>
            </div>
          );
        })()}

        {orders.length === 0 && <p className="text-center py-12 text-gray-500">Chưa có đơn hàng nào.</p>}
      </div>
    </div>
  );
}