'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cartStore';
import { ArrowLeft, ShoppingCart, Truck, Shield, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore((state) => state.addItem);

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/products/${slug}`);
      setProduct(response.data.data);
    } catch (error) {
      console.error('Failed to load product:', error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy sản phẩm</h1>
          <Link href="/products" className="text-blue-600 hover:underline">
            Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Back button */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách sản phẩm
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden">
              {product.images && product.images[selectedImage] ? (
                <Image
                  src={product.images[selectedImage].url}
                  alt={product.images[selectedImage].altText || product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Không có ảnh
                </div>
              )}
            </div>

            {/* Image thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.altText || `Product image ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-lg text-gray-600 mb-4">SKU: {product.sku}</p>

              {/* Category */}
              {product.category && (
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  {product.category.name}
                </Link>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold text-gray-900">
                {(product.salePrice || product.price).toLocaleString('vi-VN')}đ
              </span>
              {product.salePrice && (
                <span className="text-xl text-gray-500 line-through">
                  {product.price.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${product.stockQuantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}>
                {product.stockQuantity > 0 ? `Còn ${product.stockQuantity} sản phẩm` : 'Hết hàng'}
              </span>
            </div>

            {/* Specifications */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
              <div>
                <span className="text-sm text-gray-600">Kích thước</span>
                <p className="font-semibold">{product.size}</p>
              </div>
              {product.rimDiameter && (
                <div>
                  <span className="text-sm text-gray-600">Đường kính</span>
                  <p className="font-semibold">{product.rimDiameter}&quot;</p>
                </div>
              )}
              {product.loadIndex && (
                <div>
                  <span className="text-sm text-gray-600">Chỉ số tải</span>
                  <p className="font-semibold">{product.loadIndex}</p>
                </div>
              )}
              {product.speedRating && (
                <div>
                  <span className="text-sm text-gray-600">Tốc độ tối đa</span>
                  <p className="font-semibold">{product.speedRating}</p>
                </div>
              )}
              {product.tireType && (
                <div>
                  <span className="text-sm text-gray-600">Loại lốp</span>
                  <p className="font-semibold capitalize">{product.tireType}</p>
                </div>
              )}
            </div>

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
              className="w-full py-4 text-lg"
              size="lg"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {product.stockQuantity > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
            </Button>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center gap-3">
                <Truck className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-semibold text-sm">Miễn phí vận chuyển</p>
                  <p className="text-sm text-gray-600">Đơn hàng từ 500k</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-semibold text-sm">Bảo hành chính hãng</p>
                  <p className="text-xs text-gray-600">12 tháng</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="font-semibold text-sm">Đổi trả dễ dàng</p>
                  <p className="text-xs text-gray-600">30 ngày</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-16 pt-8 border-t">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Mô tả sản phẩm</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}