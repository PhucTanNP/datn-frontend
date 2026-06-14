'use client';
import { Home, ArrowLeft, Search } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full text-center">
        {/* Minh họa số 404 lớn với hiệu ứng vết bánh xe */}
        <div className="relative inline-block mb-8">
          <h1 className="text-[150px] md:text-[200px] font-black text-gray-100 leading-none select-none">
            404
          </h1>
          
          {/* Lớp phủ nội dung phía trên số 404 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-red-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/50 animate-bounce">
               <Search size={48} className="text-white" />
            </div>
          </div>

          {/* Vết bánh xe trang trí phía sau (SVG) */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-full opacity-10 pointer-events-none">
             <svg viewBox="0 0 400 50" className="w-full">
               <path 
                d="M0,25 Q50,5 100,25 T200,25 T300,25 T400,25" 
                fill="none" 
                stroke="black" 
                strokeWidth="8" 
                strokeDasharray="15,10"
               />
             </svg>
          </div>
        </div>

        {/* Thông báo lỗi */}
        <div className="space-y-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Úi! Đường này cụt rồi...
          </h2>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển sang một cung đường khác.
          </p>
        </div>

        {/* Các nút hành động */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-8 py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 w-full sm:w-auto justify-center"
          >
            <ArrowLeft size={20} />
            Quay lại
          </button>
          
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 px-8 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 shadow-xl shadow-red-200 transition-all active:scale-95 w-full sm:w-auto justify-center"
          >
            <Home size={20} />
            Về trang chủ
          </button>
        </div>

        {/* Footer trang lỗi */}
        <div className="mt-16 pt-8 border-t border-gray-100">
          <p className="text-gray-400 text-sm italic">
            Mọi sự cố vui lòng liên hệ Hotline: <span className="text-red-600 font-semibold">0905 033 776</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return <NotFound />;
}