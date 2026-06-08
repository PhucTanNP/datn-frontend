'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Product } from '@/types/product';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart, Truck, Shield, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import Loading from '@/app/loading';
import { NotFound } from '@/app/not-found';


export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      setNotFound(false);
      const response = await api.get(`/api/v1/products/${slug}`);
      setProduct(response.data.data);
    } catch (error) {
      console.error('Failed to load product:', error);
      setNotFound(true);
      
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
  if (notFound) {
    return <NotFound />;
  }


  if (loading) {
    return <Loading />;
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-red-600 transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-red-600 transition-colors">Sản phẩm</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href={`/products?category=${product.category.slug}`} className="hover:text-red-600 transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 font-semibold truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-3xl overflow-hidden shadow-xl shadow-gray-100 border border-gray-50 group">
              {product.images?.url ? (
                <>
                  <Image
                    src={product.images.url}
                    alt={product.images.altText || product.name}
                    width={700}
                    height={700}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">
                  <div className="text-center">
                    <ShoppingCart size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">Chưa có ảnh</p>
                  </div>
                </div>
              )}
              {product.salePrice && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                  GIẢM {Math.round((1 - product.salePrice / product.price) * 100)}%
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
                  {product.name}
                </h1>
              </div>
              <div className="flex items-center flex-wrap gap-3">
                <span className="text-sm font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  SKU: {product.sku}
                </span>
                {product.category && (
                  <Link
                    href={`/products?category=${product.category.slug}`}
                    className="text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full transition-colors"
                  >
                    {product.category.name}
                  </Link>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100 border border-gray-50">
              <div className="flex items-baseline gap-4">
                <span className="text-4xl lg:text-5xl font-black text-red-600 tracking-tight">
                  {(product.salePrice || product.price).toLocaleString('vi-VN')}₫
                </span>
                {product.salePrice && (
                  <span className="text-xl text-gray-400 line-through font-medium">
                    {product.price.toLocaleString('vi-VN')}₫
                  </span>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border ${
              (product.stockQuantity ?? 0) > 0
                ? 'bg-green-50 border-green-100'
                : 'bg-red-50 border-red-100'
            }`}>
              <div className={`w-3 h-3 rounded-full animate-pulse ${
                (product.stockQuantity ?? 0) > 0 ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <div>
                <span className={`font-bold text-sm ${
                  (product.stockQuantity ?? 0) > 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {(product.stockQuantity ?? 0) > 0
                    ? `Còn ${product.stockQuantity} sản phẩm trong kho`
                    : 'Hết hàng'}
                </span>
                <p className="text-xs text-gray-400 mt-0.5">
                  {(product.stockQuantity ?? 0) > 0 ? 'Đặt hàng ngay trước khi hết' : 'Vui lòng quay lại sau'}
                </p>
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-3xl shadow-lg shadow-gray-100 border border-gray-50 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50">
                <h3 className="font-black text-gray-900 uppercase text-sm tracking-wider">Thông số kỹ thuật</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Kích thước</p>
                    <p className="font-bold text-gray-900 text-lg">{product.size || '---'}</p>
                  </div>
                  {product.rimDiameter && (
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Đường kính vành</p>
                      <p className="font-bold text-gray-900 text-lg">{product.rimDiameter}&quot;</p>
                    </div>
                  )}
                  {product.loadIndex && (
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Chỉ số tải</p>
                      <p className="font-bold text-gray-900 text-lg">{product.loadIndex}</p>
                    </div>
                  )}
                  {product.speedRating && (
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Tốc độ tối đa</p>
                      <p className="font-bold text-gray-900 text-lg">{product.speedRating}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={(product.stockQuantity ?? 0) === 0}
              className="w-full bg-gray-900 hover:bg-black text-white py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-2xl shadow-gray-900/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 uppercase tracking-wider"
            >
              <ShoppingCart size={22} />
              {(product.stockQuantity ?? 0) > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
            </button>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 bg-blue-50 rounded-2xl p-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Truck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">Miễn phí vận chuyển</p>
                  <p className="text-xs text-gray-500">Đơn từ 500k</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-green-50 rounded-2xl p-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">Bảo hành chính hãng</p>
                  <p className="text-xs text-gray-500">12 tháng</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-orange-50 rounded-2xl p-4">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <RotateCcw className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">Đổi trả dễ dàng</p>
                  <p className="text-xs text-gray-500">30 ngày</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-16 lg:mt-20">
            <div className="bg-white rounded-[40px] shadow-xl shadow-gray-100 border border-gray-50 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50">
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Mô tả sản phẩm</h2>
              </div>
              <div className="px-8 py-8">
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}