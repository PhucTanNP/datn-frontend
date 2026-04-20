'use client';

import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { MapPin, ChevronLeft, User, ShoppingBag, Phone, MessageCircle, ShieldCheck, QrCode } from 'lucide-react';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();

  const total = items.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);

  return (
       <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-gray-900">Thanh toán đơn hàng</h1>
          <Link href="/cart">
            <button className="text-gray-500 hover:text-red-600 flex items-center gap-2 text-sm font-bold transition">
              <ChevronLeft size={18} /> Quay lại giỏ hàng
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG */}
          <div className="lg:col-span-7 space-y-6">
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6 text-red-600">
                <MapPin size={24} strokeWidth={2.5} />
                <h2 className="text-xl font-bold text-gray-900">Thông tin giao hàng</h2>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Họ và tên đầy đủ"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition"
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="tel" 
                    placeholder="Số điện thoại liên lạc"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition"
                  />
                </div>

                <div className="relative">
                  <MapPin className="absolute left-4 top-6 text-gray-400" size={18} />
                  <textarea 
                    placeholder="Địa chỉ giao hàng chi tiết (Số nhà, đường, phường/xã...)"
                    rows={3}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition resize-none"
                  ></textarea>
                </div>

                <textarea 
                  placeholder="Ghi chú thêm về đơn hàng (Không bắt buộc)"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition resize-none"
                ></textarea>
              </div>
            </section>

            {/* Thông tin bảo mật */}
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-100 text-green-700 text-sm">
              <ShieldCheck size={20} />
              <p>Mọi thông tin cá nhân của bạn đều được DRC cam kết bảo mật tuyệt đối.</p>
            </div>
          </div>

          {/* CỘT PHẢI: TÓM TẮT & THANH TOÁN QR */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Tóm tắt đơn hàng */}
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Đơn hàng của bạn</h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product_id} className="flex justify-between items-center text-sm">
                    <div className="flex gap-2">
                      <span className="text-gray-900 font-semibold">{item.product?.name || 'Sản phẩm'}</span>
                      <span className="text-gray-400 font-medium">x{item.quantity}</span>
                    </div>
                    <span className="text-gray-900 font-bold">{((item.product?.price || 0) * item.quantity).toLocaleString()}đ</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-50 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Tổng tiền cần trả:</span>
                  <span className="text-2xl font-black text-red-600">{total.toLocaleString()}đ</span>
                </div>
              </div>

              {/* KHU VỰC DÁN QR THANH TOÁN (THEO YÊU CẦU) */}
              <div className="bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-red-600">
                  <QrCode size={24} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Thanh toán QR nhanh</h3>
                <p className="text-xs text-gray-500 mb-6 px-4">Quét mã bằng ứng dụng Ngân hàng hoặc Ví điện tử để thanh toán ngay.</p>
                
                {/* DÁN MÃ QR CỦA BẠN VÀO ĐÂY */}
                <div className="w-48 h-48 bg-white rounded-2xl border border-gray-100 flex items-center justify-center p-2 relative group overflow-hidden shadow-sm">
                   {/* Placeholder cho ảnh QR thực tế */}
                   <div className="w-full h-full bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 italic text-xs p-4">
                     [Dán hình ảnh mã QR của bạn tại đây]
                   </div>
                   
                   {/* Overlay trang trí */}
                   <div className="absolute inset-0 border-2 border-red-500/20 rounded-2xl pointer-events-none"></div>
                </div>
                
                <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nội dung: CK DRC [SĐT của bạn]</p>
              </div>

              <button
                onClick={() => {
                  alert('Thanh toán thành công! Giỏ hàng sẽ được xóa.');
                  clearCart();
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl font-bold text-lg mt-8 flex items-center justify-center gap-3 transition shadow-xl shadow-red-200 active:scale-[0.98]"
              >
                Xác nhận đã chuyển khoản
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}