'use client';

import { useAuthStore } from '@/store/authStore';

import { User, Phone,MapPin, Mail, Shield, ShoppingBag,
  Settings, LogOut, ChevronRight,Camera,
  Package, Clock, CreditCard, Eye, X, ChevronDown, ChevronUp, FileText, Truck, CheckCircle, AlertCircle, Ban,
} from 'lucide-react';
import api from '@/lib/api';
import { useState, useEffect } from 'react';
import {Loading} from '@/app/loading';
import { NotFound } from '@/app/not-found';
import PleaseLogin from '@/app/pleaselogin/page';
import type { Order, OrderItem } from '@/types/order';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const menuItems = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: <User size={20} /> },
    { id: 'orders', label: 'Lịch sử đơn hàng', icon: <ShoppingBag size={20} /> },
    { id: 'security', label: 'Bảo mật & Mật khẩu', icon: <Shield size={20} /> },
    { id: 'settings', label: 'Cài đặt tài khoản', icon: <Settings size={20} /> },
  ];
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    email: user?.email || '',
  });
  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await api.get('/api/v1/orders/my');
      setOrders(res.data?.orders || res.data?.data || []);
    } catch {
      // silently fail
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') loadOrders();
  }, [activeTab]);

  const toggleExpand = (id: string) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // displayName tries multiple fields from backend (snake_case or camelCase)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

// PUT /api/v1/auth/profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await api.put('/api/v1/auth/profile', formData);
      // backend uses ApiResponse wrapper: { success, message, data }
      const payload = resp.data?.data ?? resp.data;
      // payload can be either the user object or an object containing `user` (in other endpoints)
      const updatedUser = payload?.user ?? payload;
      updateUser(updatedUser);
      setIsEditing(false);
      setToast({ type: 'success', msg: 'Cập nhật hồ sơ thành công' });
    } catch (error) {
      setToast({ type: 'error', msg: 'Cập nhật hồ sơ thất bại' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFormData({
      full_name: user?.full_name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      email: user?.email || '',
    });
  }, [user]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!user) return <PleaseLogin />;
  if (loading) {
    return <Loading />;
  }
  if (notFound) {
    return <NotFound />;
  }
  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR */}
          <aside className="lg:w-1/3">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  <div className="w-28 h-28 bg-red-600 rounded-[35%] flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-red-200">
                    {(user?.full_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-white rounded-xl shadow-lg border border-gray-100 text-gray-600 hover:text-red-600 transition">
                    <Camera size={16} />
                  </button>
                </div>
                <h2 className="mt-5 text-xl font-black text-gray-900">{user?.full_name || 'Người dùng'}</h2>
                <p className="text-sm text-gray-400 font-medium italic">Khách hàng thân thiết</p>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all font-bold text-sm ${
                      activeTab === item.id 
                        ? 'bg-red-50 text-red-600' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {item.icon}
                      {item.label}
                    </div>
                    <ChevronRight size={16} className={activeTab === item.id ? 'opacity-100' : 'opacity-0'} />
                  </button>
                ))}
                <div className="h-px bg-gray-50 my-4"></div>
              </nav>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <div className="lg:w-2/3">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
                  {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="text-xs font-bold text-red-600 hover:underline"
                    >
                      Chỉnh sửa thông tin
                    </button>
                  )}
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Họ và tên</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                            disabled={!isEditing}
                            className={`w-full pl-12 pr-4 py-4 rounded-2xl border transition-all outline-none font-medium ${isEditing ? 'bg-white border-red-200 focus:ring-2 focus:ring-red-500' : 'bg-gray-50 border-gray-100 text-gray-600'}`}
                          />
                        ) : (
                          <div className="w-full pl-12 pr-4 py-4 rounded-2xl border bg-gray-50 text-gray-600">
                            {user?.full_name || 'Chưa có tên'}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Số điện thoại</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="tel" value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          disabled={!isEditing}
                          className={`w-full pl-12 pr-4 py-4 rounded-2xl border transition-all outline-none font-medium ${isEditing ? 'bg-white border-red-200 focus:ring-2 focus:ring-red-500' : 'bg-gray-50 border-gray-100 text-gray-600'}`}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email liên hệ</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input type="email" value={formData.email} disabled readOnly className="w-full pl-12 pr-4 py-4 rounded-2xl border bg-gray-50 border-gray-100 text-gray-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Địa chỉ mặc định</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-6 text-gray-400" size={18} />
                      <textarea value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} disabled={!isEditing} rows={3}
                        className={`w-full pl-12 pr-4 py-4 rounded-2xl border transition-all outline-none font-medium resize-none ${isEditing ? 'bg-white border-red-200 focus:ring-2 focus:ring-red-500' : 'bg-gray-50 border-gray-100 text-gray-600'}`}
                      ></textarea>
                    </div>
                  </div>
                  {isEditing && (
                    <div className="pt-6 flex gap-3">
                      <button type="submit" className="flex-grow bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-red-200 transition active:scale-95">Cập nhật hồ sơ</button>
                      <button type="button" onClick={() => setIsEditing(false)} className="px-8 bg-gray-100 hover:bg-gray-200 text-gray-600 py-4 rounded-2xl font-bold transition">Hủy</button>
                    </div>
                  )}
                </form>
                <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-dashed border-gray-200">
                  <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2"><Shield size={16} className="text-red-600" /> Cấp độ bảo mật: Cao</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">Tài khoản của bạn đã được xác minh bằng số điện thoại. Để tăng cường bảo mật, bạn có thể kích hoạt xác thực 2 lớp trong phần cài đặt bảo mật.</p>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <OrdersView
                orders={orders}
                loading={ordersLoading}
                expandedOrders={expandedOrders}
                onToggleExpand={toggleExpand}
                onViewDetail={setSelectedOrder}
                onRefresh={loadOrders}
              />
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Bảo mật & Mật khẩu</h2>
                <p className="text-gray-400 italic">Tính năng đang được phát triển.</p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Cài đặt tài khoản</h2>
                <p className="text-gray-400 italic">Tính năng đang được phát triển.</p>
              </div>
            )}
          </div>

          {/* Order Detail Modal */}
          {selectedOrder && (
            <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
          )}
        </div>
      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-2xl border-l-4 italic ${toast.type === 'success' ? 'bg-gray-900 text-white border-green-500' : 'bg-red-600 text-white border-red-800'}`}>
            {toast.msg}
          </div>
        </div>
      )}
      </main>
    
  );
}

/* ========== Helpers ========== */

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:           { label: 'Chờ xác nhận',  color: 'bg-amber-50 text-amber-700 border-amber-200',      icon: <Clock size={14} /> },
  confirmed:         { label: 'Đã xác nhận',   color: 'bg-green-50 text-green-700 border-green-200',       icon: <CheckCircle size={14} /> },
  cancelled:         { label: 'Đã hủy',        color: 'bg-red-50 text-red-700 border-red-200',            icon: <Ban size={14} /> },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] || { label: status, color: 'bg-gray-50 text-gray-700 border-gray-200', icon: <AlertCircle size={14} /> };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${s.color}`}>
      {s.icon}{s.label}
    </span>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatPrice(price: number) {
  return price.toLocaleString('vi-VN') + '₫';
}

/* ========== OrdersView Component ========== */

function OrdersView({
  orders, loading, expandedOrders, onToggleExpand, onViewDetail, onRefresh,
}: {
  orders: Order[];
  loading: boolean;
  expandedOrders: Set<string>;
  onToggleExpand: (id: string) => void;
  onViewDetail: (order: Order) => void;
  onRefresh: () => void;
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử đơn hàng</h1>
        </div>
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử đơn hàng</h1>
          <p className="text-sm text-gray-400 mt-1 italic">{orders.length} đơn hàng</p>
        </div>
        <button onClick={onRefresh} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition" title="Tải lại">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="py-20 text-center">
          <Package size={64} className="mx-auto text-gray-200 mb-6" />
          <p className="text-xl font-black text-gray-300 uppercase italic tracking-wider">Chưa có đơn hàng nào</p>
          <p className="text-sm text-gray-300 mt-2">Hãy mua sắm để có đơn hàng đầu tiên</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="group bg-gray-50/50 hover:bg-gray-50 rounded-3xl border border-gray-100 hover:border-gray-200 transition-all overflow-hidden">
              {/* Order header */}
              <div className="p-6 cursor-pointer" onClick={() => onToggleExpand(order.id)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-black text-gray-900 uppercase tracking-wider">{order.order_number}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock size={12} />{formatDate(order.created_at)}</span>
                      <span className="font-bold">{order.items?.length || 0} sản phẩm</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-gray-900">{formatPrice(order.total_amount)}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] text-gray-400">{expandedOrders.has(order.id) ? 'Thu gọn' : 'Chi tiết'}</span>
                      {expandedOrders.has(order.id) ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded items */}
              {expandedOrders.has(order.id) && order.items && order.items.length > 0 && (
                <div className="px-6 pb-6 border-t border-gray-100 pt-4 space-y-3">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Sản phẩm trong đơn</p>
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center gap-4 bg-white rounded-2xl p-3 border border-gray-50">
                      <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-gray-100">
                        {item.snapshot?.image ? (
                          <img src={item.snapshot.image} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <Package size={20} className="text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{item.snapshot?.name || 'Sản phẩm'}</p>
                        <p className="text-xs text-gray-400">{item.snapshot?.sku || ''}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-gray-900">{formatPrice(item.unit_price)}</p>
                        <p className="text-[11px] text-gray-400">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onViewDetail(order); }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition shadow-lg shadow-red-100 active:scale-95"
                    >
                      <Eye size={14} /> Xem chi tiết
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ========== OrderDetailModal Component ========== */

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-white w-full max-w-xl rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Chi tiết đơn hàng</h2>
            <p className="text-xs text-gray-400 mt-0.5 italic">{order.order_number}</p>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-50 text-gray-400 hover:text-red-600 rounded-full transition hover:bg-red-50"><X size={20} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-gray-400 tracking-wider">Trạng thái</span>
            <StatusBadge status={order.status} />
          </div>

          {/* Timeline */}
          <div className="bg-gray-50 rounded-3xl p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                order.status === 'cancelled' ? 'bg-red-500' : 'bg-green-500'
              }`}>
                <Package size={14} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Đã đặt hàng</p>
                <p className="text-[10px] text-gray-400">{formatDate(order.created_at)}</p>
              </div>
            </div>

            {/* Đã hủy */}
            {order.status === 'cancelled' && (
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center"><X size={14} className="text-white" /></div>
                <div>
                  <p className="text-xs font-bold text-red-600">Đơn hàng đã bị hủy</p>
                  {order.cancel_reason && (
                    <p className="text-[11px] text-red-500 italic">Lý do: {order.cancel_reason}</p>
                  )}
                  <p className="text-[10px] text-gray-400">{formatDate(order.updated_at)}</p>
                </div>
              </div>
            )}

            {order.status === 'confirmed' && (
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center"><CheckCircle size={14} className="text-white" /></div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Đã xác nhận</p>
                  <p className="text-[10px] text-gray-400">{formatDate(order.updated_at)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Shipping info */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Thông tin giao hàng</h4>
            <div className="bg-blue-50/50 rounded-3xl p-5 border border-blue-100 space-y-2">
              <div className="flex items-center gap-2 text-sm"><User size={14} className="text-blue-500" /><span className="font-bold text-gray-900">{order.shipping_name}</span></div>
              <div className="flex items-center gap-2 text-sm"><Phone size={14} className="text-blue-500" /><span className="text-gray-700">{order.shipping_phone}</span></div>
              <div className="flex items-start gap-2 text-sm"><MapPin size={14} className="text-blue-500 mt-0.5" /><span className="text-gray-700">{order.shipping_address}</span></div>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Sản phẩm</h4>
            {order.items?.map(item => (
              <div key={item.id} className="flex items-center gap-4 bg-gray-50 rounded-2xl p-3 border border-gray-100">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden shrink-0 border">
                  {item.snapshot?.image ? <img src={item.snapshot.image} alt="" className="w-full h-full object-contain" /> : <Package size={24} className="text-gray-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{item.snapshot?.name || 'Sản phẩm'}</p>
                  <p className="text-xs text-gray-400">{item.snapshot?.sku || ''}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-gray-900">{formatPrice(item.unit_price)}</p>
                  <p className="text-[11px] text-gray-400">x{item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Payment info */}
          {order.payment_proof_url && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Ảnh thanh toán</h4>
              <div className="bg-gray-50 rounded-3xl p-3 border">
                <img src={order.payment_proof_url} alt="Payment proof" className="w-full max-h-48 object-contain rounded-2xl" />
              </div>
            </div>
          )}
        </div>

        {/* Footer with total */}
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 shrink-0 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tạm tính</span>
            <span className="font-bold text-gray-700">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Phí vận chuyển</span>
            <span className="font-bold text-gray-700">{order.shipping_fee === 0 ? 'Miễn phí' : formatPrice(order.shipping_fee)}</span>
          </div>
          <div className="flex justify-between text-base pt-2 border-t border-gray-200">
            <span className="font-black text-gray-900">Tổng cộng</span>
            <span className="font-black text-xl text-red-600">{formatPrice(order.total_amount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}