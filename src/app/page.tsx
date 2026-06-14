'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <div>
      {/* Hero Section - Responsive */}
      <section className="relative h-[350px] sm:h-[450px] md:h-[550px] bg-black">
        <img
          src="/background-home.jpg"
          className="w-full h-full object-cover opacity-50 sm:opacity-60"
          alt="DRC Tires background"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-center container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg sm:max-w-xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 leading-tight uppercase italic text-white">
              Sức mạnh<br/>
              <span className="text-red-500 not-italic">Lốp DRC</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-10 text-gray-300 max-w-md sm:max-w-lg">
              Công nghệ cao su hàng đầu Việt Nam, đồng hành cùng bạn trên mọi nẻo đường.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 sm:gap-3 bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base font-black uppercase tracking-widest px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all shadow-xl shadow-red-900/40 active:scale-95"
            >
              Mua ngay <ChevronRight size={20} className="sm:size-[24px]" />
            </Link>
          </div>
        </div>
      </section>


      {/* Trust badges */}
      <section className="bg-gray-50 py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: '🏭', title: 'Sản xuất tại Việt Nam', desc: 'Nhà máy Đà Nẵng' },
              { icon: '🌱', title: 'Thân thiện môi trường', desc: 'Công nghệ xanh' },
              { icon: '🏆', title: 'Chất lượng ISO', desc: 'Tiêu chuẩn quốc tế' },
              { icon: '🚚', title: 'Giao hàng toàn quốc', desc: 'Miễn phí đơn 500k+' },
            ].map((badge) => (
              <div key={badge.title} className="text-center p-4 sm:p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <span className="text-2xl sm:text-3xl mb-2 sm:mb-3 block">{badge.icon}</span>
                <h3 className="font-bold text-gray-900 text-xs sm:text-sm">{badge.title}</h3>
                <p className="text-[11px] sm:text-xs text-gray-400 mt-1">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
