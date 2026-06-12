'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import api from '@/lib/api';
import { Product, Category } from '@/types/product';
import { Search, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import Loading from '@/app/loading';
import { NotFound } from '@/app/not-found';

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [size, setSize] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sort, setSort] = useState<string>('name:asc');
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadCategories = async () => {
    try {
      setError(null);
      setNotFound(false);
      const response = await api.get('/api/v1/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      setNotFound(true);
      return;
    }
  };

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setNotFound(false);
      // Build query params
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12', // 12 products per page
      });

      if (selectedCategory) params.append('category', selectedCategory);
      if (size) params.append('size', size);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      if (search) params.append('search', search);

      const response = await api.get(`/api/v1/products?${params.toString()}`);

      setProducts(response.data.data || []);
      setPagination(response.data.pagination);
    } catch (error) {
      setNotFound(true);
      return;
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory, size, minPrice, maxPrice, search]);

  // Products are now filtered by backend API
  const displayedProducts = products;

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSize('');
    setMinPrice('');
    setMaxPrice('');
    setSort('name:asc');
    setCurrentPage(1);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Debounced search: gõ xong 400ms mới gọi API
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, size, minPrice, maxPrice, sort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 400); // đợi 400ms sau lần thay đổi cuối

    return () => clearTimeout(timer);
  }, [loadProducts]);

  if (loading) {
    return <Loading />;
  }

  if (notFound) {
    return <NotFound />;
  }

  if (error) {
    return (
      <div className="container py-20 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-red-800 font-semibold mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => {
              loadCategories();
              loadProducts();
            }}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header + Search + Filters */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Tất cả sản phẩm
            </h1>
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-300 focus:border-red-400 text-sm outline-none transition-all"
                placeholder="Tìm kiếm sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Filters - scrollable ngang trên mobile */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-none">
            <select
              className="flex-shrink-0 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-300 focus:border-red-400 text-sm bg-white outline-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(category => (
                <option key={category.id} value={category.slug}>{category.name}</option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Giá từ"
              className="flex-shrink-0 w-20 sm:w-24 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-300 focus:border-red-400 text-sm outline-none"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <span className="text-gray-300 flex-shrink-0 hidden sm:inline">—</span>
            <input
              type="number"
              placeholder="Giá đến"
              className="flex-shrink-0 w-20 sm:w-24 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-300 focus:border-red-400 text-sm outline-none"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />

            <select
              className="flex-shrink-0 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-300 focus:border-red-400 text-sm bg-white outline-none"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="name:asc">Tên A-Z</option>
              <option value="name:desc">Tên Z-A</option>
              <option value="price:asc">Giá thấp → cao</option>
              <option value="price:desc">Giá cao → thấp</option>
            </select>

            <button onClick={clearFilters} className="flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-600 border border-gray-200 rounded-xl hover:border-red-200 transition-colors whitespace-nowrap">
              Xóa bộ lọc
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {displayedProducts.length === 0 && (
          <div className="text-center py-16 sm:py-20">
            <p className="text-base sm:text-xl text-gray-400 mb-4">Không tìm thấy sản phẩm nào.</p>
            <button onClick={clearFilters} className="text-red-600 hover:text-red-700 font-medium text-sm sm:text-base">
              Xóa bộ lọc và thử lại
            </button>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-12">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrev}
              className="flex items-center gap-1 px-3 sm:px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-200 hover:text-red-600 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Trước</span>
            </button>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Trang {pagination.page} / {pagination.totalPages}</span>
              <span className="hidden sm:inline">({pagination.total} sản phẩm)</span>
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
              disabled={!pagination.hasNext}
              className="flex items-center gap-1 px-3 sm:px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:border-red-200 hover:text-red-600 transition-colors"
            >
              <span className="hidden sm:inline">Sau</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Floating Cart Button */}
        <FloatingCartButton />
      </div>
    </div>
  );
}

// Floating Cart Button Component
function FloatingCartButton() {
  const cartItems = useCartStore((state) => state.items);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link
      href="/cart"
      className="fixed bottom-6 left-6 z-50 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-2xl shadow-red-600/30 transition-all duration-300 hover:scale-110 group"
    >
      <div className="relative">
        <ShoppingCart size={24} className="group-hover:scale-110 transition-transform" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-red-600 animate-pulse">
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}
      </div>
    </Link>
  );
}