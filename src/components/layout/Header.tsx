'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { ShoppingBag, Phone, MapPin, LogOut, Menu, X } from 'lucide-react';

export function Header() {
  const { user, logout, initialize } = useAuthStore();
  const { items } = useCartStore();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  // Ẩn cart khi ở trang products (shop routes)
  const hideCart = pathname?.startsWith('/products') || pathname?.startsWith('/checkout') || isAdmin;

  useEffect(() => {
    initialize().catch(console.error);
  }, [initialize]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const navItems = [
    { name: 'Trang chủ', href: '/', active: pathname === '/' },
    { name: 'Sản phẩm', href: '/products', active: pathname?.startsWith('/products') },
    { name: 'Công nghệ', href: '/inspect', active: pathname?.startsWith('/inspect') },
    { name: 'Liên hệ', href: '/contact', active: pathname?.startsWith('/contact') }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      {!isAdmin && (
      <div className="bg-red-600 text-white py-1 text-xs sm:text-sm px-4 flex justify-between items-center font-medium">
        <div className="flex gap-2 sm:gap-4">
          <a href="tel:0905033776" className="flex items-center gap-1 hover:underline">
            <Phone size={14} /> 0905 033 776
          </a>
          <span className="hidden sm:flex items-center gap-1"><MapPin size={14} /> Đà Nẵng, Việt Nam</span>
        </div>
        <div className="flex gap-2 sm:gap-4 items-center">
          <button className="hover:underline text-[11px] sm:text-xs">English</button>
          <img src="https://flagcdn.com/w20/vn.png" alt="VN" className="w-4 h-3 sm:w-5 sm:h-3 object-cover shadow-sm" />
        </div>
      </div>
      )}

      {/* Main nav */}
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center cursor-pointer group flex-shrink-0">
          <div className="flex flex-col items-center">
            <img src="/full-logo.png" alt="DRC" className="w-28 sm:w-36 h-auto object-contain group-hover:scale-110 transition-transform" />
            <span className="text-[8px] sm:text-[10px] font-bold text-gray-400 tracking-tighter">CAO SU ĐÀ NẴNG</span>
          </div>
        </Link>

        {!isAdmin && (
        <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`relative text-[13px] font-bold uppercase tracking-widest transition-all duration-300 group ${
                item.active ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
              }`}
            >
              {item.name}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-red-600 transition-all duration-300 ${
                item.active ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
          ))}
        </nav>
        )}

        {/* Right section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {!hideCart && (
            <Link href="/cart" className="relative p-1.5 sm:p-2 text-gray-600 hover:text-red-600 transition-colors">
              <ShoppingBag size={22} className="sm:size-[24px]" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white text-[9px] sm:text-[10px] font-black rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          )}
          
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href={user.role === 'admin' ? '/admin' : '/profile'}
                className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-full pr-3 sm:pr-4"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-tr from-red-600 to-red-400 rounded-full flex items-center justify-center text-white font-black text-[10px] sm:text-xs">
                  {user.email?.[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm font-bold text-gray-700">
                  {user.role === 'admin' ? 'Quản trị' : 'Cá nhân'}
                </span>
              </Link>
              <button onClick={logout} className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600">
                <LogOut size={16} className="sm:size-[18px]" />
              </button>
            </div>
          ) : (
            !pathname.startsWith('/login') && !pathname.startsWith('/register') ? (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all active:scale-95"
              >
                Đăng nhập
              </Link>
            ) : null
          )}

          {/* Hamburger button - mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 text-gray-600 hover:text-red-600 transition-colors"
            aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Menu panel */}
          <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-xl z-50 lg:hidden animate-slide-down">
            <div className="px-4 py-4 space-y-1">
              {!isAdmin && navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`block px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                    item.active
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile user section */}
              <div className="border-t border-gray-100 pt-3 mt-3">
                {user ? (
                  <div className="space-y-2">
                    <Link
                      href={user.role === 'admin' ? '/admin' : '/profile'}
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-9 h-9 bg-gradient-to-tr from-red-600 to-red-400 rounded-full flex items-center justify-center text-white font-black text-sm">
                        {user.email?.[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {user.full_name || user.email}
                        </p>
                        <p className="text-xs text-gray-400">
                          {user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                        </p>
                      </div>
                    </Link>
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"                      onClick={closeMobileMenu}                    className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors active:scale-[0.98]"
                  >
                    Đăng nhập
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Keyframes for mobile menu animation */}
      <style>{`
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
}