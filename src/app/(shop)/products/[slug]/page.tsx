'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cartStore';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (slug) {
      api.get(`/products/${slug}`)
        .then(res => setProduct(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return <div className="container py-20 text-center">Đang tải...</div>;
  }

  if (!product) {
    return <div className="container py-20 text-center">Sản phẩm không tồn tại.</div>;
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <Link href="/products" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-8">
          <ArrowLeft className="h-5 w-5" />
          Quay lại danh sách
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-50 rounded-2xl p-4">
              {product.images && product.images.length > 0 ? (
                product.images?.map((img) => (
                  <Image
                    key={img.id}
                    src={img.url}
                    alt={product.name}
                    width={600}
                    height={400}
                    className="w-full h-80 object-cover rounded-xl"
                  />
                ))
              ) : (
                <div className="w-full h-80 bg-gray-200 rounded-xl flex items-center justify-center">
                  Không có ảnh
                </div>
              )}
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-xl text-muted-foreground mb-4">SKU: {product.sku}</p>
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  {product.sale_price ? product.sale_price.toLocaleString('vi-VN') : product.price.toLocaleString('vi-VN')}đ
                </span>
                {product.sale_price && (
                  <span className="text-2xl text-muted-foreground line-through">
                    {product.price.toLocaleString('vi-VN')}đ
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <p><strong>Kích thước:</strong> {product.size}</p>
              <p><strong>Loại lốp:</strong> {product.tire_type}</p>
              <p><strong>Tồn kho:</strong> {product.stock_quantity > 0 ? `Còn ${product.stock_quantity}` : 'Hết hàng'}</p>
            </div>
            <div className="space-y-4">
              <Button onClick={() => addItem(product)} className="w-full h-14 text-lg" disabled={product.stock_quantity === 0}>
                <ShoppingCart className="mr-3 h-5 w-5" />
                {product.stock_quantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
              </Button>
            </div>
            <div className="prose max-w-none">
              <h3>Mô tả</h3>
              <p>{product.description || 'Không có mô tả.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}