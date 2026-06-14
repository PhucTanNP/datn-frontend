import { Category } from './category';
import { ProductImage } from './productImage';

export interface Product {
  id: string;
  categoryId?: string;

  // Signature
  brand: string;
  size: string;
  sizeType?: 'METRIC' | 'INCH';
  pattern?: string;

  // Product type
  productType: 'motorcycle_tire' | 'bicycle_tire' | 'motorcycle_tube' | 'bicycle_tube';

  // Core
  sku: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  hasTube?: boolean;
  isActive: boolean;
  imageUrl?: string;

  // Specs (admin nhập → sinh description tự động)
  specs?: Record<string, unknown>;
  description?: string;

  createdAt: string;
  updatedAt: string;

  category?: Category;
  images?: ProductImage;
}

export type { Category } from './category';
export type { ProductImage } from './productImage';
