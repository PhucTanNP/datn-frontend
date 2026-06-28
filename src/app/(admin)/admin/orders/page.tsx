'use client';

import { useState, useEffect, useMemo } from 'react';
import { FileText, Layers, User, Search, Phone, RefreshCw, Eye, Check, X, Trash2, ShoppingBag, MapPin } from 'lucide-react';
import api from '@/lib/api';
import type { Order } from '@/types/order';
import Loading from '@/app/loading';
import { NotFound } from '@/app/not-found';
import Image from 'next/image';

// Mapping trạng thái đơn hàng sang nhãn tiếng Việt
const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã hủy',
};

function getOrderStatusLabel(status?: string) {
  if (!status) return '';
  const key = String(status).toLowerCase();
  return ORDER_STATUS_LABELS[key] || String(status);
}

function isAwaitingPayment(status?: string) {
  const s = String(status || '').toLowerCase();
  return s === 'pending';
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<string>('orders');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; orderId: string | null }>({ isOpen: false, orderId: null });
  const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; orderId: string | null }>({ isOpen: false, orderId: null });
  const [cancelReason, setCancelReason] = useState('');

  // Derived filtered orders based on search and status
  const filteredOrders = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    const status = (selectedStatusFilter || 'ALL').toUpperCase();

    const matchesFilter = (o: unknown) => {
      if (status === 'ALL') return true;
      const s = `${(o as { status?: string }).status || ''}`.toLowerCase();
      if (status === 'PENDING') return s === 'pending';
      if (status === 'PAID') return s === 'confirmed';
      if (status === 'CANCELLED') return s === 'cancelled';
      return true;
    };

    return (orders || []).filter(o => {
      if (!matchesFilter(o)) return false;
      if (!q) return true;
      return [(o as { order_number?: string }).order_number, (o as { shipping_name?: string }).shipping_name, (o as { email?: string }).email, (o as { id?: string }).id].some(field => (field || '').toString().toLowerCase().includes(q));
    });
  }, [orders, searchQuery, selectedStatusFilter]);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setNotFound(false);
      const response = await api.get('/api/v1/admin/orders');
      setOrders(response.data.data || []);
    } catch (error) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, status: string) => {
    try {
      setActionLoading(prev => ({ ...prev, [orderId]: true }));
      await api.put(`/api/v1/admin/orders/${orderId}`, { status });
      await loadOrders();
      setToastMessage('Cập nhật trạng thái đơn hàng thành công');
    } catch (error) {
      setToastMessage('Cập nhật đơn hàng thất bại');
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleOrderDelete = async (orderId: string) => {
    setDeleteModal({ isOpen: true, orderId });
  };

  const handleResetData = () => {
    setSearchQuery('');
    setSelectedStatusFilter('ALL');
    loadOrders();
  };

  const handleApprovePayment = async (orderId: string) => {
    try {
      setActionLoading(prev => ({ ...prev, [orderId]: true }));
      await api.put(`/api/v1/admin/orders/${orderId}`, { status: 'confirmed' });
      await loadOrders();
      setToastMessage('Đã phê duyệt đơn hàng');
    } catch (err) {
      setToastMessage('Phê duyệt thất bại');
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleDenyPayment = async (orderId: string) => {
    setCancelModal({ isOpen: true, orderId });
  };

  const confirmCancelOrder = async () => {
    const id = cancelModal.orderId;
    if (!id || !cancelReason.trim()) return;
    setCancelModal({ isOpen: false, orderId: null });
    try {
      setActionLoading(prev => ({ ...prev, [id]: true }));
      await api.put(`/api/v1/admin/orders/${id}`, {
        status: 'cancelled',
        cancel_reason: cancelReason.trim(),
      });
      await loadOrders();
      setToastMessage('Đã hủy đơn hàng');
      setCancelReason('');
    } catch (err) {
      setToastMessage('Hủy đơn hàng thất bại');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setDeleteModal({ isOpen: true, orderId });
  };

  const confirmDelete = async () => {
    const id = deleteModal.orderId;
    if (!id) return;
    setDeleteModal({ isOpen: false, orderId: null });
    try {
      await api.delete(`/api/v1/admin/orders/${id}`);
      await loadOrders();
      setToastMessage('Đã xóa đơn hàng');
    } catch (err) {
      setToastMessage('Xóa thất bại');
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (notFound) {
    return <NotFound />;
  }

return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111827] pb-24">
      
      {/* 4. KHỐI NỘI DUNG CHƯƠNG TRÌNH */}
      <main className="max-w-7xl mx-auto px-6 mt-12">
        
        {activeTab === 'orders' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Header phân khu chuẩn phong cách italic dốc của DRC */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black tracking-tight uppercase leading-none">
                  QUẢN LÝ <span className="text-red-600 italic">ĐƠN HÀNG</span>
                </h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">HỆ THỐNG KIỂM SOÁT GIAO DỊCH DRC ELITE</p>
              </div>
              {/* THANH CÔNG CỤ TÌM KIẾM VÀ LỌC TRẠNG THÁI */}
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Tìm đơn hàng, tên khách..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full text-xs font-semibold focus:ring-2 focus:ring-red-500 outline-none transition shadow-sm"
                  />
                </div>

                {/* Các nút bấm lọc nhanh trạng thái */}
                <div className="flex bg-white p-1 rounded-full border border-gray-200 shadow-sm overflow-x-auto">
                  {[
                    { id: 'ALL', label: 'TẤT CẢ' },
                    { id: 'PENDING', label: 'CHỜ DUYỆT' },
                    { id: 'PAID', label: 'ĐÃ DUYỆT' },
                    { id: 'CANCELLED', label: 'ĐÃ HỦY' }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setSelectedStatusFilter(filter.id)}
                      className={`px-4 py-2 rounded-full text-[10px] font-black tracking-wider transition whitespace-nowrap ${
                        selectedStatusFilter === filter.id
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-500 hover:text-red-600 hover:bg-gray-50'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={handleResetData}
                  className="p-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-400 hover:text-red-600 rounded-full transition shadow-sm"
                  title="Đặt lại dữ liệu"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {/* BẢNG CHỨA CÁC ĐƠN HÀNG DẠNG DẢI NGANG ĐỒNG BỘ NHƯ ẢNH MẪU */}
            <div className="bg-white rounded-[40px] p-6 lg:p-10 shadow-xl shadow-gray-200/50 border border-gray-100/50">
              
              {/* Header cột (ẩn trên mobile để tối ưu) */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-6 pb-6 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                <div className="col-span-3">Hội viên / Mã đơn</div>
                <div className="col-span-3">Thông tin liên lạc</div>
                <div className="col-span-4">Mặt hàng đặt mua</div>
                <div className="col-span-2 text-right">Hành động kiểm soát</div>
              </div>

              <div className="divide-y divide-gray-100">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const statusNorm = `${(order as { status?: string }).status || ''}`.toLowerCase();

                    const isConfirmed = statusNorm === 'confirmed';
                    const isCancelled = statusNorm === 'cancelled';
                    const isPendingApproval = statusNorm === 'pending';

                    // Màu sắc dot và badge trạng thái
                    const dotStatusClass = isConfirmed ? 'bg-green-500' : isCancelled ? 'bg-red-500' : 'bg-amber-500';

                    return (
                      <div 
                        key={order.id}
                        className="py-8 first:pt-4 last:pb-4 flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-4 items-center relative group"
                      >
                        
                        {/* TAG TRẠNG THÁI "TREO LÊN ĐẦU THẺ" THEO YÊU CẦU */}
                        <div className="absolute top-2 lg:top-4 right-2 lg:right-6 flex gap-2">
                          <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                            isPendingApproval 
                              ? 'bg-amber-500 text-white animate-pulse'
                              : isConfirmed
                              ? 'bg-green-600 text-white'
                              : isCancelled
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-400 text-white'
                          }`}>
                            {getOrderStatusLabel((order as { status?: string }).status)}
                          </span>
                        </div>

                        {/* CỘT 1: AVATAR TRÒN SÂU & HỘI VIÊN (Đồng bộ ảnh 269ee1) */}
                        <div className="col-span-3 flex items-center gap-5 w-full">
                          <div className="relative shrink-0">
                            <div className="w-14 h-14 bg-[#111827] text-white font-black text-xl flex items-center justify-center rounded-[24px] shadow-lg shadow-gray-200">
                              {order.shipping_name?.charAt(0) || "N"}
                            </div>
                            {/* Dot hiển thị trạng thái chuyển động */}
                            <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${dotStatusClass}`}></span>
                          </div>
                          <div>
                            <h3 className="text-base font-black text-[#111827] uppercase tracking-tight">
                              {order.shipping_name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-black text-red-500 tracking-wider bg-red-50 px-2 py-0.5 rounded-md">
                                {order.order_number}
                              </span>
                              <span className="text-[9px] font-bold text-gray-400 uppercase">
                                #{order.id.substring(0, 6).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* CỘT 3: SẢN PHẨM HIỂN THỊ HÀNG NGANG ĐẸP MẮT KÈM HÌNH ẢNH */}
                        <div className="col-span-4 w-full space-y-3 border-t lg:border-t-0 pt-4 lg:pt-0">
                          {(order.items?.length || 0) > 0 ? (
                            <div className="space-y-2">
                              {(order.items || []).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-gray-50/80 p-2 rounded-2xl border border-gray-100">
                                  <Image
                                    src={item.snapshot.image}
                                    alt={item.snapshot.name}
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 object-cover rounded-xl border border-gray-200 shrink-0"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-gray-800 truncate">{item.snapshot.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold">Số lượng: <span className="text-red-500">x{item.quantity}</span></p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 italic">Chưa chọn dòng sản phẩm</p>
                          )}
                          
                            <div className="flex items-baseline justify-between pt-1 border-t border-gray-50">
                            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">TỔNG THU HỘ COD:</span>
                            <span className="text-xl font-black text-red-600">{Number(order.total_amount ?? 0).toLocaleString()}đ</span>
                          </div>
                        </div>

                        {/* CỘT 4: THAO TÁC VỚI CÁC NÚT ĐỒNG BỘ TINH GỌN (ẨN/HIỆN PHÊ DUYỆT) */}
                        <div className="col-span-2 w-full flex items-center justify-end gap-2 border-t lg:border-t-0 pt-4 lg:pt-0">
                          
                          {/* Nút Xem UI riêng biệt cực xịn */}
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-100 text-gray-500 hover:text-[#111827] rounded-2xl transition shadow-sm"
                            title="Nhấp vào để hiển thị giao diện UI chi tiết riêng biệt"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Nút Phê duyệt chuyển khoản (Duyệt/Confirm) */}
                          {isPendingApproval && (
                            <>
                              <button
                                onClick={() => handleApprovePayment(order.id)}
                                disabled={!!actionLoading[order.id]}
                                className={`p-3 border rounded-2xl transition shadow-sm font-bold ${actionLoading[order.id] ? 'bg-green-200 text-white cursor-wait' : 'bg-green-50 hover:bg-green-600 border-green-100 hover:border-green-600 text-green-600 hover:text-white'}`}
                                title="Phê duyệt nhanh thanh toán (CONFIRM)"
                              >
                                {actionLoading[order.id] ? 'Đang...' : <Check size={16} strokeWidth={3} />}
                              </button>

                              <button
                                onClick={() => handleDenyPayment(order.id)}
                                disabled={!!actionLoading[order.id]}
                                className={`p-3 border rounded-2xl transition shadow-sm ${actionLoading[order.id] ? 'bg-red-200 text-white cursor-wait' : 'bg-red-50 hover:bg-red-600 border-red-100 hover:border-red-600 text-red-600 hover:text-white'}`}
                                title="Từ chối thanh toán (DENY)"
                              >
                                {actionLoading[order.id] ? 'Đang...' : <X size={16} strokeWidth={3} />}
                              </button>
                            </>
                          )}

                          {/* Nút Xóa đơn hàng mẫu */}
                          <button 
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-3 bg-gray-50 hover:bg-red-600 hover:text-white border border-gray-100 hover:border-red-600 text-gray-400 rounded-2xl transition shadow-sm"
                            title="Xóa đơn hàng khỏi hệ thống"
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>

                      </div>
                    );
                  })
                ) : (
                  <div className="py-20 text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag size={28} />
                    </div>
                    <h3 className="text-xl font-black text-[#111827] uppercase">Không tìm thấy kết quả</h3>
                    <p className="text-gray-400 text-sm mt-1">Vui lòng làm sạch từ khóa hoặc đổi bộ lọc tìm kiếm.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* CÁC PHÂN KHU KHÁC (Để đảm bảo giao diện vận hành hoàn mỹ) */}
        {activeTab !== 'orders' && (
          <div className="bg-white rounded-[40px] p-16 text-center shadow-sm border border-gray-100 animate-fadeIn">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Layers size={28} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 uppercase">Phân khu đang phát triển</h2>
            <p className="text-gray-400 text-sm mt-1 max-w-sm mx-auto">Vui lòng chuyển hướng về tab ĐƠN HÀNG để trải nghiệm quản trị.</p>
            <button onClick={() => setActiveTab('orders')} className="mt-6 bg-[#111827] hover:bg-black text-white px-8 py-3.5 rounded-full text-xs font-black tracking-widest">VỀ TRANG ĐƠN HÀNG</button>
          </div>
        )}

      </main>

      {/* ============================================================== */}
      {/* 5. GIAO DIỆN HIỂN THỊ RIÊNG BIỆT KHI NHẤP VÀO XEM CHI TIẾT (UI RIÊNG BIỆT) */}
      {/* ============================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[40px] max-w-3xl w-full h-[90vh] flex flex-col border border-gray-100 shadow-2xl overflow-hidden relative">
            
            {/* Trang trí background */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-50 rounded-full -mr-24 -mt-24 opacity-50 pointer-events-none"></div>

            {/* Modal Header */}
            <div className="p-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full">
                  Chi tiết cơ sở dữ liệu (orders schema)
                </span>
                <h3 className="text-2xl font-black text-[#111827] mt-3 uppercase tracking-tight">
                  ĐƠN HÀNG {selectedOrder.order_number}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-3 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body (Cuộn hiển thị đầy đủ 20 trường dữ liệu) */}
            <div className="p-8 space-y-8 flex-grow overflow-y-auto">
              
              {/* PHÂN KHU TRẠNG THÁI & THÔNG TIN ĐƠN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Cột trái: Trạng thái Database */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black-blod text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
                    Thuộc tính Đơn hàng
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-400 font-bold">Mã số:</span>
                      <span className="font-bold text-red-600">{selectedOrder.order_number}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-400 font-bold">Trạng thái:</span>
                      <span className="font-bold text-[#111827]">{getOrderStatusLabel(selectedOrder.status)}</span>
                    </div>
                  </div>
                </div>

                {/* Cột phải: Dòng tiền tài chính */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
                    Dòng tiền đơn hàng
                  </h4>
                  <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-400 font-bold">Tạm tính:</span>
                      <span className="font-bold text-gray-800">{Number(selectedOrder?.subtotal ?? 0).toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-400 font-bold">Giảm giá:</span>
                      <span className="font-bold text-green-600">-{Number(selectedOrder?.discount_amount ?? 0).toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-400 font-bold">Phí vận chuyển:</span>
                      <span className="font-bold text-gray-800">{Number(selectedOrder?.shipping_fee ?? 0).toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-50 text-sm">
                      <span className="text-gray-900 font-black">Tổng cộng (COD):</span>
                      <span className="font-black text-red-600">{Number(selectedOrder?.total_amount ?? 0).toLocaleString()}đ</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* PHÂN KHU GIAO HÀNG (SHIPPING INFO) */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Thông tin người nhận 
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-gray-50 p-5 rounded-3xl border border-gray-100">
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <User size={14} className="text-red-500" />
                      <strong>Người nhận:</strong> {selectedOrder.shipping_name}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone size={14} className="text-red-500" />
                      <strong>Số điện thoại:</strong> {selectedOrder.shipping_phone}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="flex items-start gap-2">
                      <MapPin size={14} className="text-red-500 shrink-0 mt-0.5" />
                      <span><strong>Địa chỉ:</strong> {selectedOrder.shipping_address}</span>
                    </p>
                    <p className="flex items-start gap-2 text-gray-500 italic">
                      <FileText size={14} className="text-gray-400 shrink-0 mt-0.5" />
                      <span><strong>notes:</strong> {selectedOrder.notes || "Không có ghi chú"}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* DANH SÁCH MẶT HÀNG CHI TIẾT */}
              {(selectedOrder?.items?.length ?? 0) > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Mặt hàng đặt trong đơn
                  </h4>
                  <div className="space-y-2">
                    {(selectedOrder?.items ?? []).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                        <Image src={item.snapshot?.image} alt={item.snapshot?.name} width={48} height={48} className="w-12 h-12 object-cover rounded-xl border border-gray-200 shrink-0" />
                        <div className="flex-grow min-w-0">
                          <h5 className="text-xs font-bold text-[#111827] truncate">{item.snapshot?.name}</h5>
                          <p className="text-[10px] text-gray-400 mt-0.5 font-bold">Đơn giá: {Number(item?.unit_price ?? 0).toLocaleString()}đ</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-red-500">x{item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LÝ DO HỦY (nếu đơn đã hủy) */}
              {selectedOrder.status === 'cancelled' && selectedOrder.cancel_reason && (
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest text-red-600">
                    Lý do hủy đơn
                  </h4>
                  <div className="bg-red-50 p-5 rounded-3xl border border-red-100">
                    <p className="text-sm font-bold text-red-800">{selectedOrder.cancel_reason}</p>
                  </div>
                </div>
              )}

              {/* CHI TIẾT THANH TOÁN (PAYMENT_PROOF_URL) */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Xác thực chuyển khoản
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  
                  {/* Bản tóm tắt trạng thái thanh toán */}
                  <div className="space-y-3 text-xs">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-bold">Trạng thái:</span>
                        <span className="font-bold text-gray-900">{getOrderStatusLabel(selectedOrder.status)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-bold">Số điện thoại:</span>
                        <span className="font-bold text-gray-900">{selectedOrder.payment_phone || "Chưa có"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-bold">Xác nhận thanh toán:</span>
                        <span className="font-bold text-gray-900">
                          {selectedOrder.payment_confirmed_at ? new Date(selectedOrder.payment_confirmed_at).toLocaleString() : "Chưa có"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-bold">Xác nhận bởi:</span>
                        <span className="font-semibold text-[10px] text-gray-800 truncate max-w-[140px]" title={selectedOrder.payment_confirmed_by}>
                          {selectedOrder.payment_confirmed_by || "Chưa có"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hiển thị hóa đơn chuyển khoản (payment_proof_url) */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-500 block">Minh chứng chuyển khoản:</span>
                    {selectedOrder.payment_proof_url ? (
                      <div className="relative group rounded-2xl overflow-hidden border border-gray-200 h-44 bg-slate-900 flex items-center justify-center shadow-inner">
                        <img 
                          src={selectedOrder.payment_proof_url} 
                          alt="Hóa đơn ngân hàng" 
                          className="w-full h-full object-contain"
                        />
                        <a 
                          href={selectedOrder.payment_proof_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="absolute bottom-2 right-2 bg-white/80 hover:bg-white text-gray-800 text-[10px] p-2 rounded-lg font-black uppercase tracking-wider shadow flex items-center gap-1.5 transition-colors"
                        >

                        </a>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-xs text-gray-400 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl italic">
                        Khách chưa tải ảnh minh chứng chuyển khoản.
                      </div>
                    )}
                  </div>

                </div>
              </div>

            </div>

            {/* Modal Footer (Chứa các nút CONFIRM / HỦY) */}
            <div className="p-8 border-t border-gray-100 bg-gray-50 sticky bottom-0 z-10">
              {isAwaitingPayment(selectedOrder.status) ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Nút Hủy đơn */}
                  <button
                    onClick={() => {
                      setCancelModal({ isOpen: true, orderId: selectedOrder.id });
                    }}
                    disabled={!!actionLoading[selectedOrder.id]}
                    className={`flex-1 py-4 ${actionLoading[selectedOrder.id] ? 'bg-red-400 cursor-wait' : 'bg-red-600 hover:bg-red-700'} active:scale-95 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition shadow-xl shadow-red-200 flex items-center justify-center gap-2`}
                  >
                    {actionLoading[selectedOrder.id] ? (
                      <span>Đang...</span>
                    ) : (
                      <>
                        <X size={18} strokeWidth={3} />
                        <span>HỦY ĐƠN HÀNG</span>
                      </>
                    )}
                  </button>

                  {/* Nút Phê duyệt */}
                  <button
                    onClick={async () => {
                      await handleApprovePayment(selectedOrder.id);
                      setSelectedOrder(null);
                    }}
                    disabled={!!actionLoading[selectedOrder.id]}
                    className={`flex-1 py-4 ${actionLoading[selectedOrder.id] ? 'bg-green-400 cursor-wait' : 'bg-green-600 hover:bg-green-700'} active:scale-95 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition shadow-xl shadow-green-200 flex items-center justify-center gap-2`}
                  >
                    {actionLoading[selectedOrder.id] ? (
                      <span>Đang...</span>
                    ) : (
                      <>
                        <Check size={18} strokeWidth={3} />
                        <span>PHÊ DUYỆT ĐƠN HÀNG</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center py-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                  {selectedOrder.status === 'cancelled'
                    ? 'Đơn hàng này đã bị hủy.'
                    : 'Đơn hàng này đã được phê duyệt.'}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 6. TOAST THÔNG BÁO POPUP */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111827] text-white py-3.5 px-6 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-gray-800 animate-slideUp">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modal nhập lý do hủy đơn */}
      {cancelModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-100 animate-slideUp">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <X size={28} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Hủy đơn hàng?</h3>
              <p className="text-gray-500 mb-6 leading-relaxed text-sm">
                Vui lòng nhập lý do hủy đơn. User sẽ nhìn thấy lý do này.
              </p>
              <textarea
                autoFocus
                placeholder="Nhập lý do hủy đơn..."
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-600 outline-none transition font-bold resize-none text-sm mb-6"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCancelModal({ isOpen: false, orderId: null });
                    setCancelReason('');
                  }}
                  className="flex-1 py-3 px-6 rounded-2xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all active:scale-[0.97]"
                >
                  Hủy thao tác
                </button>
                <button
                  onClick={confirmCancelOrder}
                  disabled={!cancelReason.trim()}
                  className={`flex-1 py-3 px-6 rounded-2xl font-semibold transition-all active:scale-[0.97] shadow-lg ${
                    cancelReason.trim()
                      ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-200'
                      : 'bg-red-200 text-white cursor-not-allowed'
                  }`}
                >
                  Xác nhận hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa đơn hàng */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-100 animate-slideUp">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <Trash2 size={28} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Xóa đơn hàng?</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Hành động này không thể hoàn tác. <br />
                Đơn hàng và tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ isOpen: false, orderId: null })}
                  className="flex-1 py-3 px-6 rounded-2xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all active:scale-[0.97]"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 px-6 rounded-2xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all active:scale-[0.97] shadow-lg shadow-red-200"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phong cách hoạt họa bổ sung */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98) translateY(5px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

    </div>
  );
}