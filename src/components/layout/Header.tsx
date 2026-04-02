import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart, User, LogIn, LogOut } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-4 hidden md:flex">
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            DRC Tires
          </span>
        </Link>
        <Link href="/" className="mr-6 flex md:hidden">
          DRC
        </Link>
        <nav className="flex flex-1 items-center space-x-4 md:space-x-6 lg:space-x-8">
          <Link href="/products" className="text-sm font-medium transition-colors hover:text-foreground/80">
            Sản phẩm
          </Link>
          <Link href="/inspect" className="text-sm font-medium transition-colors hover:text-foreground/80">
            Kiểm tra lốp
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Link href="/cart" className="relative p-2">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center space-x-2">
              <Link href={user.role === 'admin' ? '/admin' : '/profile'}>
                <User className="h-5 w-5" />
              </Link>
              <button onClick={logout} className="p-2">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="p-2">
              <LogIn className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}