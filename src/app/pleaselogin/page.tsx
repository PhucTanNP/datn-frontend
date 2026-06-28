'use client';

import { Lock, LogIn, Home, MessageCircle, ShoppingBag, ShieldCheck } from 'lucide-react';

export const PleaseLogin = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-[40px] p-10 md:p-16 shadow-xl shadow-gray-200/50 border border-gray-50 text-center relative overflow-hidden">
          
          {/* Decorative background circle */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-50 rounded-full opacity-50 pointer-events-none"></div>
          
          {/* Illustration Area */}
          <div className="relative mb-10 inline-block">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-red-600 rounded-[35%] flex items-center justify-center text-white shadow-2xl shadow-red-200 relative z-10 animate-pulse">
              <Lock size={56} strokeWidth={2.5} />
            </div>
            {/* Floating Shield Icon */}
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-green-500 z-20 border border-gray-50">
              <ShieldCheck size={24} />
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dừng lại một chút!</h1>
            <p className="text-gray-500 text-lg leading-relaxed">
              Bạn cần đăng nhập vào tài khoản <span className="font-bold text-red-600">DRC</span> để có thể xem thông tin cá nhân và quản lý đơn hàng của mình.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-12 flex flex-col gap-4 relative z-10">
            <button className="w-full bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-red-100 active:scale-95">
              <LogIn size={22} />
              Đăng nhập ngay
            </button>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="flex-grow flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold transition">
                Tạo tài khoản mới
              </button>
              <button className="flex items-center justify-center gap-2 px-8 bg-white border border-gray-100 hover:bg-gray-50 text-gray-400 py-4 rounded-2xl font-bold transition">
                <Home size={20} />
              </button>
            </div>
          </div>

          {/* Footer Note */}
          <p className="mt-10 text-xs text-gray-400 font-medium italic">
            Bằng cách đăng nhập, bạn đồng ý với các <a href="#" className="underline text-gray-500">Điều khoản & Chính sách</a> của DRC.
          </p>
        </div>
      </main>

      {/* Floating Buttons */}
      <div className="fixed bottom-8 left-8 z-50 group">
        <button className="w-16 h-16 bg-red-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-red-500/30">
          <ShoppingBag size={28} />
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">0</span>
        </button>
      </div>

      <div className="fixed bottom-8 right-8 z-50 group">
        <button className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-blue-500/30">
          <MessageCircle size={28} />
          <span className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      </div>
      
      <footer className="py-6 text-center text-gray-400 text-[10px] uppercase tracking-[0.2em] font-bold">
        DRC Quality Tires &middot; Since 1975
      </footer>
    </div>
  );
};

export default function App() {
  return <PleaseLogin />;
}