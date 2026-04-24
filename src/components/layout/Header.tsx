'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { ShoppingBag, Phone, MapPin, LogOut } from 'lucide-react';

export function Header() {
  const { user, logout, initialize } = useAuthStore();
  const { items } = useCartStore();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const pathname = usePathname();

  // Ẩn cart khi ở trang products (shop routes)
  const hideCart = pathname?.startsWith('/products') || pathname?.startsWith('/checkout');

  useEffect(() => {
    initialize().catch(console.error);
  }, [initialize]);

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

        <nav className="hidden lg:flex items-center gap-10">
          {[
            { name: 'Trang chủ', href: '/', active: pathname === '/' },
            { name: 'Sản phẩm', href: '/products', active: pathname?.startsWith('/products') },
            { name: 'Công nghệ', href: '/inspect', active: pathname?.startsWith('/inspect') },
            { name: 'Liên hệ', href: '/contact', active: pathname?.startsWith('/contact') }
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`relative text-[13px] font-bold uppercase tracking-widest transition-all duration-300 group ${
                item.active ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
              }`}
            >
              {item.name}
              {/* Hiệu ứng gạch chân khi hover */}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-red-600 transition-all duration-300 ${
                item.active ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {!hideCart && (
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-red-600 transition-colors">
              <ShoppingBag size={24} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>
          )}
          
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
            !pathname.startsWith('/login') && !pathname.startsWith('/register') ? (
              <Link href="/login" className="...">
                Đăng nhập
              </Link>
            ) : null
          )}
        </div>
      </div>
    </nav>
  );
}