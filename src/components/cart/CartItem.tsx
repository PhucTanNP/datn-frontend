// src/components/cart/CartItem.tsx
import { CartItem as CartItemType } from '@/types/cart'; // Import type từ types/cart.ts
import { Minus, Plus, Trash2 } from 'lucide-react'; // Icons từ lucide-react
import Image from 'next/image'; // Để hiển thị hình ảnh

interface CartItemProps {
  item: CartItemType; // Dữ liệu sản phẩm
  onUpdate: (productId: string, quantity: number) => void; // Hàm cập nhật số lượng
  onRemove: (productId: string) => void; // Hàm xóa
}

export function CartItem({ item, onUpdate, onRemove }: CartItemProps) {
  const { product, quantity, unit_price, total_price } = item; // Bóc dữ liệu từ item

  if (!product) return null; // Nếu không có product, không render gì

  return (
    <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-gray-50 flex gap-6">
      {/* Hình ảnh sản phẩm */}
      <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
        <Image
          src={Array.isArray(product?.images) && product.images[0]?.url ? product.images[0].url : '/placeholder.jpg'} // Hình đầu tiên hoặc placeholder
          alt={product.name}
          width={96}
          height={96}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thông tin sản phẩm */}
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">
              {product.name} {/* Tên sản phẩm */}
            </h3>
            <p className="text-gray-500 text-sm">
              {product.brand} • {product.size} {/* Thương hiệu và kích cỡ */}
            </p>
          </div>
          {/* Button xóa */}
          <button
            onClick={() => onRemove(product.id)}
            className="text-gray-300 hover:text-red-500 transition p-1"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Controls số lượng và giá */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Button giảm */}
            <button
              onClick={() => onUpdate(product.id, quantity - 1)}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition"
            >
              <Minus size={16} />
            </button>
            <span className="font-semibold text-gray-900 min-w-[2rem] text-center">
              {quantity} {/* Số lượng hiện tại */}
            </span>
            {/* Button tăng */}
            <button
              onClick={() => onUpdate(product.id, quantity + 1)}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Giá */}
          <div className="text-right">
            <p className="font-bold text-gray-900 text-lg">
              {total_price.toLocaleString()}đ {/* Tổng giá cho số lượng này */}
            </p>
            <p className="text-gray-500 text-sm">
              {unit_price.toLocaleString()}đ / cái {/* Giá đơn vị */}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}