export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  created_at: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  cloudinaryId: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Product {
  id: string;
  categoryId: string;
  sku: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  size?: string;
  rimDiameter?: number;
  loadIndex?: string;
  speedRating?: string;
  tireType?: 'passenger' | 'SUV' | 'truck' | 'motorcycle';
  aiLabel?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  images?: ProductImage[];
}

export interface ProductFilters {
  category?: string;
  tire_type?: string;
  size?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
