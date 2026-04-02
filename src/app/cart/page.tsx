'use client';

import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Trash2, Minus, Plus } from 'lucide-react';
import Image from 'next/image';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-20 flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống</h2>
          <Link href="/products">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Mua sắm ngay
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-8">Giỏ hàng của bạn</h1>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product_id} className="flex gap-6 p-6 bg-white rounded-2xl shadow-lg">
                  <Image
                    src={item.product?.images?.[0]?.url || '/placeholder.svg'}
                    alt={item.product?.name || 'Sản phẩm'}
                    width={120}
                    height={120}
                    className="object-cover rounded-xl flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product?.slug}`} className="font-bold text-lg hover:underline block mb-1">
                      {item.product?.name}
                    </Link>
                    <p className="text-sm text-muted-foreground mb-4">{item.product?.size}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-mono font-bold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{item.total_price.toLocaleString('vi-VN')}đ</p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.product_id)}
                    className="flex-shrink-0"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-80 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold mb-6">Tổng kết</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Tạm tính:</span>
                  <span>{getTotal().toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Phí ship:</span>
                  <span>30.000đ</span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng:</span>
                  <span>{(getTotal() + 30000).toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
              <Link href="/checkout">
                <Button className="w-full h-14 text-lg">Tiến hành thanh toán</Button>
              </Link>
            </div>
            <Button variant="outline" className="w-full" onClick={clearCart}>
              Xóa tất cả
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}