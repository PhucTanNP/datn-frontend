'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Product } from '@/types/product';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart } from 'lucide-react';

// Helper function to get product image or fallback
const getProductImage = (product: Product): string => {
  return product.images?.url || '/placeholder.svg';
};

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  return (
    <Link href={`/products/${product.slug}`} className="block h-full">
      <div className="group relative bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-lg hover:shadow-md sm:hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col">
        <div className="relative h-40 sm:h-48 lg:h-56 xl:h-64 bg-gradient-to-br from-gray-50 to-gray-100">
          <Image
            src={getProductImage(product)}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.salePrice && (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white text-[10px] sm:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-bold">
              Sale
            </div>
          )}

          {/* Category badge */}
          {product.category && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-[10px] sm:text-xs shadow-sm border border-gray-100">
              {product.category.imageUrl ? (
                <Image
                  src={product.category.imageUrl}
                  alt=""
                  width={16}
                  height={16}
                  className="rounded-full w-3.5 h-3.5 sm:w-4 sm:h-4 object-cover"
                />
              ) : (
                <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
                </span>
              )}
              <span className="text-gray-600 font-medium truncate max-w-[60px] sm:max-w-[80px]">
                {product.category.name}
              </span>
            </div>
          )}
        </div>
        <div className="p-3 sm:p-4 lg:p-6 flex flex-col flex-1">
          <h3 className="font-bold text-xs sm:text-sm lg:text-base xl:text-lg mb-1 sm:mb-2 line-clamp-2 leading-tight">{product.name}</h3>
          <p className="text-[11px] sm:text-sm text-gray-500 mb-2 sm:mb-3 line-clamp-1">{product.size}</p>
          <div className="flex items-center justify-between mb-3 sm:mb-4 flex-1">
            <div className="space-y-0.5 sm:space-y-1">
              <div className="flex items-baseline gap-1 sm:gap-2">
                <span className="text-sm sm:text-base lg:text-lg xl:text-2xl font-bold text-gray-900">
                  {(product.salePrice || product.price).toLocaleString('vi-VN')}đ
                </span>
                {product.salePrice && (
                  <span className="text-[10px] sm:text-sm text-gray-400 line-through">
                    {product.price.toLocaleString('vi-VN')}đ
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-sm text-green-600 font-medium block">
                Còn {product.stockQuantity}
              </span>
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            className="mt-auto w-full bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 sm:gap-2"
          >
            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Thêm vào giỏ</span>
            <span className="sm:hidden">Mua</span>
          </button>
        </div>
      </div>
    </Link>
  );
}