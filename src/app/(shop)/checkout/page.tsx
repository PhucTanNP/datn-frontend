'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { MapPin, ChevronLeft, User, Phone, ShieldCheck, QrCode } from 'lucide-react';
import api from '@/lib/api';
import type { Order } from '@/types/order';
import {Loading} from '@/app/loading';
import { NotFound } from '@/app/not-found';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState<Order | null>(null);
  const [paymentImage, setPaymentImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedProof, setUploadedProof] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    shippingName: '',
    shippingPhone: '',
    shippingAddress: '',
    notes: ''
  });

  const total = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const shippingFee = total >= 500000 ? 0 : 30000;
  const grandTotal = total + shippingFee;

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    try {
      setLoading(true);
      const response = await api.post('/api/v1/orders', {
        items: items.map(item => ({ productId: item.product_id, quantity: item.quantity })),
        ...form
      });
      setOrderCreated(response.data.data);
      clearCart();
    } catch (error) {
      alert('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Chỉ hỗ trợ JPG, PNG hoặc PDF');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File không quá 5MB');
      return;
    }
    setPaymentImage(file);
    setUploadError(null);
  };

  useEffect(() => {
    // Auto-upload when order exists and a file is selected
    const doUpload = async () => {
      if (!orderCreated || !paymentImage) return;
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('image', paymentImage);

        const res = await api.post(`/api/v1/orders/${orderCreated.id}/payment-proof`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        setUploadedProof(res.data?.data || res.data?.proofUrl || null);
        // redirect to orders page after successful upload
        window.location.href = '/orders';
      } catch (err) {
        setUploadError('Không thể tải ảnh lên. Vui lòng thử lại.');
      } finally {
        setUploading(false);
      }
    };

    doUpload();
  }, [orderCreated, paymentImage]);

  

  if (loading) return <Loading />;

  return (
       <div className="min-h-screen bg-slate-50 font-sans pb-20 italic">
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-gray-900 uppercase italic">Thanh toán đơn hàng</h1>
          {!orderCreated && (
            <Link href="/cart">
              <button className="text-gray-500 hover:text-red-600 flex items-center gap-2 text-sm font-bold transition">
                <ChevronLeft size={18} /> Quay lại giỏ hàng
              </button>
            </Link>
          )}
        </div>

        {!orderCreated ? (
          <form onSubmit={handleCreateOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG */}
            <div className="lg:col-span-7 space-y-6">
              <section className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-100">
                <div className="flex items-center gap-3 mb-8 text-red-600">
                  <MapPin size={24} strokeWidth={2.5} />
                  <h2 className="text-2xl font-black text-gray-900 uppercase italic">Thông tin nhận hàng</h2>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    <input 
                      required
                      type="text" 
                      placeholder="Họ và tên đầy đủ"
                      value={form.shippingName}
                      onChange={e => setForm({...form, shippingName: e.target.value})}
                      className="w-full pl-16 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-3xl focus:ring-4 focus:ring-red-100 focus:bg-white focus:border-red-600 outline-none transition font-bold"
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    <input 
                      required
                      type="tel" 
                      placeholder="Số điện thoại liên lạc"
                      value={form.shippingPhone}
                      onChange={e => setForm({...form, shippingPhone: e.target.value})}
                      className="w-full pl-16 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-3xl focus:ring-4 focus:ring-red-100 focus:bg-white focus:border-red-600 outline-none transition font-bold"
                    />
                  </div>

                  <div className="relative">
                    <MapPin className="absolute left-6 top-7 text-gray-300" size={20} />
                    <textarea 
                      required
                      placeholder="Địa chỉ giao hàng chi tiết..."
                      rows={3}
                      value={form.shippingAddress}
                      onChange={e => setForm({...form, shippingAddress: e.target.value})}
                      className="w-full pl-16 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-3xl focus:ring-4 focus:ring-red-100 focus:bg-white focus:border-red-600 outline-none transition font-bold resize-none"
                    ></textarea>
                  </div>

                  <textarea 
                    placeholder="Ghi chú thêm về đơn hàng (Không bắt buộc)"
                    rows={2}
                    value={form.notes}
                    onChange={e => setForm({...form, notes: e.target.value})}
                    className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-3xl focus:ring-4 focus:ring-red-100 focus:bg-white focus:border-red-600 outline-none transition font-bold resize-none"
                  ></textarea>
                </div>
              </section>

              <div className="p-6 bg-green-50 rounded-3xl border border-green-100 text-green-700 text-sm font-bold flex items-center gap-4">
                <ShieldCheck size={24} />
                <p>Thanh toán an toàn & Bảo mật 100% dữ liệu khách hàng.</p>
              </div>
            </div>

            {/* CỘT PHẢI: TÓM TẮT */}
            <div className="lg:col-span-5">
              <section className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-100 sticky top-10">
                <h2 className="text-xl font-black text-gray-900 mb-8 uppercase italic border-b pb-4">Tóm tắt đơn hàng</h2>
                <div className="space-y-5 mb-8">
                  {items.map((item) => (
                    <div key={item.product_id} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-black uppercase text-xs tracking-tight">{item.product?.name}</span>
                        <span className="text-red-600 font-bold text-[10px]">SỐ LƯỢNG: {item.quantity}</span>
                      </div>
                      <span className="text-gray-900 font-black">{(item.unit_price * item.quantity).toLocaleString()}đ</span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3 border-t pt-6 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-bold uppercase text-[10px]">Tạm tính:</span>
                    <span className="text-gray-900 font-black">{total.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-bold uppercase text-[10px]">Phí vận chuyển:</span>
                    <span className="text-gray-900 font-black">{shippingFee === 0 ? 'MIỄN PHÍ' : shippingFee.toLocaleString() + 'đ'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-dashed">
                    <span className="text-gray-900 font-black uppercase italic tracking-tighter">Tổng cộng:</span>
                    <span className="text-4xl font-black text-red-600 tracking-tighter italic">{grandTotal.toLocaleString()}đ</span>
                  </div>
                </div>

                {/* QR image + upload (visible before order creation) */}
                <div className="my-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  {process.env.NEXT_PUBLIC_PAYMENT_QR_IMAGE_URL ? (
                    <div className="mb-4">
                      <img src={process.env.NEXT_PUBLIC_PAYMENT_QR_IMAGE_URL} alt="VietQR" className="w-40 mx-auto object-contain" />
                      <p className="text-center text-sm text-gray-500 mt-2">Quét mã để thanh toán hoặc tải ảnh biên lai lên</p>
                    </div>
                  ) : (
                    <div className="mb-4 text-center text-red-700 font-bold">Có lỗi với mã QR. Vui lòng liên hệ đại lý để được hỗ trợ.</div>
                  )}

                  <label className="block text-xs font-bold mb-2">
                          Tải lên ảnh đã thanh toán (JPG/PNG/PDF, ≤5MB)
                        </label>

                        <label className="flex items-center justify-center gap-3 w-full h-16 border-2 border-dashed border-red-200 rounded-xl cursor-pointer bg-white hover:bg-red-50 transition-all">
                        <span className="text-xl">📤</span>

                        <div>
                          <p className="font-bold text-sm text-gray-700">
                            {paymentImage ? paymentImage.name : "Chọn ảnh hoặc PDF"}
                          </p>

                          {!paymentImage && (
                            <p className="text-[11px] text-gray-500">
                              Nhấn để tải lên
                            </p>
                          )}
                        </div>

                        <input
                          type="file"
                          accept="image/jpeg,image/png,application/pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>

                        {uploadError && (
                          <p className="text-sm text-red-600 mt-2">
                            {uploadError}
                          </p>
                        )}

                        {uploading && (
                          <p className="text-sm text-gray-500 mt-2">
                            Đang tải lên...
                          </p>
                        )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-gray-900 hover:bg-black text-white py-6 rounded-3xl font-black text-lg flex items-center justify-center gap-3 transition shadow-2xl active:scale-[0.98] uppercase tracking-widest italic"
                >
                  Xác nhận đặt hàng
                </button>
              </section>
            </div>
          </form>
        ) : (
          <div className="max-w-2xl mx-auto">
            <section className="bg-white rounded-[50px] p-12 shadow-2xl border border-gray-100 text-center space-y-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 text-green-500 rounded-full mb-4">
                <ShieldCheck size={40} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900 uppercase italic tracking-tight">Đã khởi tạo đơn hàng!</h2>
                <p className="text-gray-700 font-bold uppercase text-[20px] tracking-widest mt-2">Mã đơn: #{orderCreated.order_number}</p>
              </div>

              

              {/* UPLOAD BIÊN LAI */}
              <div className="mt-6">
                <Link href="/">
                  <button className="w-full py-4 bg-white text-gray-900 border border-gray-200 rounded-3xl font-black hover:bg-gray-50 transition">Trở về trang sản phẩm</button>
                </Link>
              </div>

            </section>
          </div>
        )}
      </main>
    </div>
  );
}