'use client';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { ShoppingBag, Phone, MapPin, LogOut } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="bg-red-600 text-white py-1 text-xs sm:text-sm px-4 flex justify-between items-center font-medium">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><Phone size={14} /> 1900 1234</span>
          <span className="hidden sm:flex items-center gap-1"><MapPin size={14} /> Đà Nẵng, Việt Nam</span>
        </div>
        <div className="flex gap-4 items-center">
          <button className="hover:underline">English</button>
          <img src="https://flagcdn.com/w20/vn.png" alt="VN" className="w-5 h-3 object-cover shadow-sm" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center cursor-pointer group">
          <div className="flex flex-col items-center">
            <img src="/full-logo.png" alt="DRC" className="w-30 h-8 object-contain group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-gray-400 tracking-tighter">CAO SU ĐÀ NẴNG</span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-8 text-sm font-bold uppercase text-gray-700">
          <Link href="/" className="hover:text-red-600 transition-colors relative pb-1">
            Trang chủ
          </Link>
          <Link href="/products" className="hover:text-red-600 transition-colors relative pb-1">
            Sản phẩm
          </Link>
          <Link href="/inspect" className="hover:text-red-600 transition-colors relative pb-1">
            Công nghệ
          </Link>
          <button className="hover:text-red-600">Liên hệ</button>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative p-2 text-gray-600 hover:text-red-600 transition-colors">
            <ShoppingBag size={24} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>
          
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href={user.role === 'admin' ? '/admin' : '/profile'}
                className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-full pr-4"
              >
                <div className="w-8 h-8 bg-gradient-to-tr from-red-600 to-red-400 rounded-full flex items-center justify-center text-white font-black text-xs">
                  {user.email?.[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm font-bold text-gray-700">
                  {user.role === 'admin' ? 'Quản trị' : 'Cá nhân'}
                </span>
              </Link>
              <button onClick={logout} className="p-2 text-gray-400 hover:text-red-600"><LogOut size={18} /></button>
            </div>
          ) : (
            <Link href="/login" className="px-5 py-2.5 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all text-xs uppercase tracking-widest shadow-lg shadow-red-100">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}