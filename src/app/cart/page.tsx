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
    <div className="min-h-screen py-12">
      <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left Column: Cart Items */}
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                Giỏ hàng của bạn
                <span className="text-sm font-medium bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
                  {items.length} Sản phẩm
                </span>
              </h1>
              <Link href="/products">
                <button className="text-gray-400 hover:text-red-600 text-sm font-bold flex items-center gap-2 transition">
                  <ChevronLeft size={16} /> Tiếp tục mua hàng
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
                
                <div className="mt-8 flex justify-end">
                   <button 
                    onClick={() => clearCart()}
                    className="text-gray-400 hover:text-red-600 text-sm font-semibold p-2 transition underline decoration-dotted"
                   >
                     Xóa tất cả sản phẩm
                   </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-100">
                <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Giỏ hàng trống!</h3>
                <p className="text-gray-500 mt-2 mb-8">Hãy quay lại cửa hàng và chọn những sản phẩm ưng ý.</p>
                <button className="bg-red-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-red-100 hover:bg-red-700 transition">
                  Quay lại cửa hàng
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:w-[400px] flex-shrink-0">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 sticky top-28">
              <h2 className="text-2xl font-black text-gray-900 mb-8 border-b border-gray-50 pb-4">Tổng kết đơn hàng</h2>
              
              <div className="space-y-5 mb-8">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Tạm tính:</span>
                  <span className="text-gray-900">{subtotal.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Phí vận chuyển:</span>
                  <span className={shipping === 0 ? "text-green-500 font-bold" : "text-gray-900"}>
                    {shipping === 0 ? "Miễn phí" : `${shipping.toLocaleString()}đ`}
                  </span>
                </div>
                <div className="h-px bg-gray-100 my-4"></div>
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold text-gray-900">Tổng cộng:</span>
                  <div className="text-right">
                    <p className="text-3xl font-black text-red-600 leading-none">{total.toLocaleString()}đ</p>
                    <p className="text-[10px] text-gray-400 mt-1 italic">(Đã bao gồm thuế VAT)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => {
                    if (user) {
                      router.push('/checkout');
                    } else {
                      router.push('/pleaselogin');
                    }
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-red-100 active:scale-[0.98]"
                >
                  Tiến hành thanh toán
                  <ArrowRight size={20} />
                </button>
                <div className="flex items-center justify-center gap-4 py-2 opacity-30 grayscale">
                  <CreditCard size={24} />
                  <span className="text-xs font-bold uppercase tracking-widest">Thanh toán an toàn</span>
                </div>
              </div>

              <div className="mt-8 bg-blue-50 p-4 rounded-2xl flex gap-3 items-start">
                 <div className="bg-blue-600 text-white p-1 rounded-md mt-0.5">
                    <MessageCircle size={14} />
                 </div>
                 <p className="text-xs text-blue-900 font-medium leading-relaxed">
                   <strong>Bạn cần hỗ trợ?</strong> Liên hệ ngay với chúng tôi để được tư vấn về vận chuyển và ưu đãi.
                 </p>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}