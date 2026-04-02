'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Product } from '@/types/product';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col">
      <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100">
        <Image
          src={product.images?.[0]?.url || '/placeholder.svg'}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.sale_price && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
            Sale
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <Link href={`/products/${product.slug}`} className="hover:underline">
          <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.name}</h3>
        </Link>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.size} - {product.tire_type}</p>
        <div className="flex items-center justify-between mb-4 flex-1">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {product.sale_price?.toLocaleString('vi-VN')}đ
              </span>
              {product.sale_price && (
                <span className="text-sm text-muted-foreground line-through">
                  {product.price.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>
            <span className="text-xs text-green-600 font-medium">Còn {product.stock_quantity} sản phẩm</span>
          </div>
        </div>
        <Button 
          onClick={() => addItem(product)}
          className="mt-auto w-full group-hover:bg-primary/95"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Thêm vào giỏ
        </Button>
      </div>
    </div>
  );
}