'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import api from '@/lib/api';
import { Product, Category } from '@/types/product';
import { Button } from '@/components/ui/Button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ProductsResponse {
  products: Product[];
  pagination: PaginationData;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [tireType, setTireType] = useState<string>('');
  const [size, setSize] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sort, setSort] = useState<string>('name:asc');
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadCategories = async () => {
    try {
      setError(null);
      console.log('Loading categories...');
      const response = await api.get('/api/v1/categories');
      console.log('Categories response:', response.data);
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setError('Không thể tải danh mục sản phẩm. Vui lòng thử lại sau.');
      // Thử endpoint khác
      try {
        const fallbackResponse = await api.get('/categories');
        console.log('Fallback categories response:', fallbackResponse.data);
        setCategories(fallbackResponse.data.data || []);
        setError(null);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }
  };

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading products with filters:', {
        currentPage, selectedCategory, tireType, size, minPrice, maxPrice, search
      });

      // Build query params
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12', // 12 products per page
      });

      if (selectedCategory) params.append('category', selectedCategory);
      if (tireType) params.append('tire_type', tireType);
      if (size) params.append('size', size);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      if (search) params.append('search', search);

      const response = await api.get(`/api/v1/products?${params.toString()}`);
      console.log('Products response:', response.data);

      setProducts(response.data.data || []);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to load products:', error);
      setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
      // Thử fallback endpoint
      try {
        const fallbackParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: '12'
        });
        if (search) fallbackParams.append('search', search);

        const fallbackResponse = await api.get(`/products?${fallbackParams.toString()}`);
        console.log('Fallback products response:', fallbackResponse.data);

        setProducts(fallbackResponse.data.data || []);
        setPagination(fallbackResponse.data.pagination);
        setError(null);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory, tireType, size, minPrice, maxPrice, search]);

  // Products are now filtered by backend API
  const displayedProducts = products;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setTireType('');
    setSize('');
    setMinPrice('');
    setMaxPrice('');
    setSort('name:asc');
    setCurrentPage(1);
    loadProducts();
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  if (loading) {
    return <div className="container py-20 text-center">Đang tải...</div>;
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
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Tất cả sản phẩm
          </h1>
          {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              className="w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline">Tìm kiếm</Button>
        </form>

        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <select
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(category => (
              <option key={category.id} value={category.slug}>{category.name}</option>
            ))}
          </select>

          <select
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            value={tireType}
            onChange={(e) => setTireType(e.target.value)}
          >
            <option value="">Tất cả loại lốp</option>
            <option value="motorcycle">Lốp xe máy</option>
            <option value="passenger">Lốp xe hơi</option>
            <option value="SUV">Lốp SUV</option>
            <option value="truck">Lốp xe tải</option>
          </select>

          <input
            type="number"
            placeholder="Giá từ"
            className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            type="number"
            placeholder="Giá đến"
            className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />

          <select
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="name:asc">Tên A-Z</option>
            <option value="name:desc">Tên Z-A</option>
            <option value="price:asc">Giá thấp → cao</option>
            <option value="price:desc">Giá cao → thấp</option>
          </select>

          <Button onClick={clearFilters} variant="outline" size="sm">
            Xóa bộ lọc
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {displayedProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground mb-4">Không tìm thấy sản phẩm nào.</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrev}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Trước
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <span className="text-sm text-muted-foreground">
                ({pagination.total} sản phẩm)
              </span>
            </div>

            <Button
              onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
              disabled={!pagination.hasNext}
              variant="outline"
              size="sm"
            >
              Sau
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}