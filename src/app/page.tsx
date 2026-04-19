'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';




export default function Home() {
  return (
    <div>
      <section className="relative h-[550px] bg-white">
        <img src="/background-home.jpg" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 flex items-center container mx-auto px-4 text-white">
          <div className="max-w-xl">
            <h1 className="text-6xl font-black mb-6 leading-tight uppercase italic">Sức mạnh<br/><span className="text-red-600 not-italic">Lốp DRC</span></h1>
            <p className="text-xl mb-10 text-gray-300">Công nghệ cao su hàng đầu Việt Nam, đồng hành cùng bạn trên mọi nẻo đường.</p>
            <Link href="/products" className="bg-red-600 px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-red-700 transition-all inline-flex items-center gap-3 shadow-xl shadow-red-900/40">
              Mua ngay <ChevronRight size={24} />
            </Link>
          </div>
        </div>
      </section>

      <div className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-black uppercase mb-10 text-center">Sản phẩm tiêu biểu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* {mockProducts.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)} */}
        </div>
      </div>
      
    </div>
  );
}
