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
      <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col">
        <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100">
          <Image
            src={getProductImage(product)}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading="eager"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.salePrice && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-sm px-2 py-1 rounded-full font-bold">
              Sale
            </div>
          )}
        </div>
        <div className="p-6 flex flex-col flex-1">
          <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.name}</h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.size}</p>
          <div className="flex items-center justify-between mb-4 flex-1">
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {(product.salePrice || product.price).toLocaleString('vi-VN')}đ
                </span>
                {product.salePrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {product.price.toLocaleString('vi-VN')}đ
                  </span>
                )}
              </div>
              <span className="text-sm text-green-600 font-medium">Còn {product.stockQuantity} sản phẩm</span>
            </div>
          </div>
          <Button
            onClick={handleAddToCart}
            className="mt-auto w-full bg-red-600 hover:bg-red-700"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Thêm vào giỏ
          </Button>
        </div>
      </div>
    </Link>
  );
}