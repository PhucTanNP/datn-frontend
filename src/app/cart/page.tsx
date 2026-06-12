'use client';

import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ShoppingCart, ShoppingBag,CreditCard,MessageCircle } from 'lucide-react';
import { CartItem } from '@/components/cart/CartItem';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { PleaseLogin } from '@/app/pleaselogin/page';


export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();

  // Tính toán
  const subtotal = getTotal();
  const shipping = subtotal > 500000 ? 0 : 30000;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Illustration Container */}
          <div className="relative inline-block">
            <div className="w-48 h-48 md:w-64 md:h-64 bg-red-50 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <div className="relative">
                <ShoppingBag size={80} className="text-red-200" strokeWidth={1} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <ShoppingCart size={48} className="text-red-600" />
                </div>
              </div>
            </div>
            {/* Decorative dots */}
            <div className="absolute top-0 right-0 w-4 h-4 bg-red-400 rounded-full animate-bounce"></div>
            <div className="absolute bottom-10 left-0 w-3 h-3 bg-red-300 rounded-full animate-ping"></div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-black text-gray-900">Giỏ hàng đang trống!</h1>
            <p className="text-gray-500 text-lg">
              Có vẻ như bạn chưa chọn được sản phẩm nào. Đừng lo, hàng ngàn sản phẩm chất lượng đang chờ bạn khám phá.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Link href="/products">
              <button 
                className="w-full group flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white text-lg font-bold py-4 px-10 rounded-2xl shadow-xl shadow-red-200 transition-all active:scale-95"
              >
                Tiếp tục mua sắm ngay
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </Link>
            
            <button 
              onClick={() => window.history.back()}
              className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-red-600 font-medium transition py-2"
            >
              <ChevronLeft size={18} />
              Quay lại trang trước
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-gray-50/50">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6 sm:mb-8">
          <Link href="/" className="hover:text-red-600">Trang chủ</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Giỏ hàng</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          {/* Left Column: Cart Items */}
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-3">
                Giỏ hàng
                <span className="text-xs sm:text-sm font-medium bg-gray-200 text-gray-600 px-2.5 sm:px-3 py-1 rounded-full">
                  {items.length} sản phẩm
                </span>
              </h1>
              <Link href="/products">
                <button className="text-gray-400 hover:text-red-600 text-xs sm:text-sm font-bold flex items-center gap-1 sm:gap-2 transition">
                  <ChevronLeft size={14} className="sm:size-[16px]" /> Mua thêm
                </button>
              </Link>
            </div>

            {items.length > 0 ? (
              <div>
                {items.map(item => (
                  <CartItem
                    key={item.product_id}
                    item={item}
                    onUpdate={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
                <div className="flex justify-between items-center mt-4 sm:mt-6">
                  <button
                    onClick={() => clearCart()}
                    className="text-gray-400 hover:text-red-600 text-xs sm:text-sm font-semibold transition underline decoration-dotted"
                  >
                    Xóa tất cả
                  </button>
                  <p className="text-xs sm:text-sm text-gray-400">
                    {items.reduce((sum, i) => sum + i.quantity, 0)} sản phẩm
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-10 sm:p-20 text-center border-2 border-dashed border-gray-100">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <ShoppingBag size={28} className="sm:size-[40px]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Giỏ hàng trống!</h3>
                <p className="text-sm sm:text-base text-gray-500 mt-2 mb-6 sm:mb-8">Hãy quay lại cửa hàng và chọn những sản phẩm ưng ý.</p>
                <Link href="/products">
                  <button className="bg-red-600 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-2xl font-bold shadow-xl shadow-red-100 hover:bg-red-700 transition text-sm sm:text-base">
                    Quay lại cửa hàng
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          {items.length > 0 && (
            <div className="lg:w-[380px] xl:w-[400px] flex-shrink-0">
              <div className="bg-white rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 shadow-sm border border-gray-100 lg:sticky lg:top-28">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-6 border-b border-gray-50 pb-4">
                  Tổng kết
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm sm:text-base text-gray-500 font-medium">
                    <span>Tạm tính:</span>
                    <span className="text-gray-900">{subtotal.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base text-gray-500 font-medium">
                    <span>Phí vận chuyển:</span>
                    <span className={shipping === 0 ? "text-green-600 font-bold" : "text-gray-900"}>
                      {shipping === 0 ? "Miễn phí" : `${shipping.toLocaleString()}đ`}
                    </span>
                  </div>
                  {subtotal < 500000 && (
                    <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                      🚚 Còn <strong>{(500000 - subtotal).toLocaleString()}đ</strong> nữa là được miễn phí vận chuyển!
                    </p>
                  )}
                  <div className="h-px bg-gray-100 my-2"></div>
                  <div className="flex justify-between items-end">
                    <span className="text-base sm:text-lg font-bold text-gray-900">Tổng cộng:</span>
                    <div className="text-right">
                      <p className="text-2xl sm:text-3xl font-black text-red-600 leading-none">{total.toLocaleString()}đ</p>
                      <p className="text-[10px] text-gray-400 mt-1">(Đã bao gồm VAT)</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      if (user) {
                        router.push('/checkout');
                      } else {
                        router.push('/pleaselogin');
                      }
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-4 sm:py-5 rounded-2xl font-bold text-sm sm:text-lg flex items-center justify-center gap-2 sm:gap-3 transition-all shadow-xl shadow-red-100 active:scale-[0.98]"
                  >
                    Thanh toán
                    <ArrowRight size={18} className="sm:size-[20px]" />
                  </button>
                  <div className="flex items-center justify-center gap-2 sm:gap-4 py-1 sm:py-2 opacity-30">
                    <CreditCard size={20} className="sm:size-[24px]" />
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Thanh toán an toàn</span>
                  </div>
                </div>

                <div className="mt-6 bg-blue-50 p-3 sm:p-4 rounded-2xl flex gap-3 items-start">
                  <div className="bg-blue-600 text-white p-1 rounded-md mt-0.5 flex-shrink-0">
                    <MessageCircle size={12} className="sm:size-[14px]" />
                  </div>
                  <p className="text-[11px] sm:text-xs text-blue-900 font-medium leading-relaxed">
                    <strong>Bạn cần hỗ trợ?</strong> Liên hệ ngay để được tư vấn về vận chuyển và ưu đãi.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}