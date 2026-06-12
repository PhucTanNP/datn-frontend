// src/components/cart/CartItem.tsx
import { CartItem as CartItemType } from '@/types/cart';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface CartItemProps {
  item: CartItemType;
  onUpdate: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export function CartItem({ item, onUpdate, onRemove }: CartItemProps) {
  const { product, quantity, unit_price, total_price } = item;

  if (!product) return null;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 mb-3 sm:mb-4 shadow-sm border border-gray-50 flex gap-3 sm:gap-6">
      {/* Hình ảnh */}
      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
        <Image
          src={product.images?.url || '/placeholder.jpg'}
          alt={product.name}
          width={96}
          height={96}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thông tin */}
      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <div className="min-w-0 flex-1 mr-2">
            <h3 className="font-bold text-gray-900 text-sm sm:text-lg leading-tight mb-1 truncate">
              {product.name}
            </h3>
          </div>
          <button
            onClick={() => onRemove(product.id)}
            className="text-gray-300 hover:text-red-500 transition p-1 flex-shrink-0"
          >
            <Trash2 size={16} className="sm:size-[18px]" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onUpdate(product.id, quantity - 1)}
              className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition active:scale-90"
            >
              <Minus size={14} className="sm:size-[16px]" />
            </button>
            <span className="font-semibold text-gray-900 min-w-[1.5rem] sm:min-w-[2rem] text-center text-sm sm:text-base">
              {quantity}
            </span>
            <button
              onClick={() => onUpdate(product.id, quantity + 1)}
              className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition active:scale-90"
            >
              <Plus size={14} className="sm:size-[16px]" />
            </button>
          </div>

          <div className="text-right">
            <p className="font-bold text-gray-900 text-sm sm:text-lg">
              {total_price.toLocaleString()}đ
            </p>
            <p className="text-gray-500 text-[11px] sm:text-sm">
              {unit_price.toLocaleString()}đ / cái
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}