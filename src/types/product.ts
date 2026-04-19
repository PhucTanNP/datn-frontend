import { Category } from './category';
import { ProductImage } from './productImage';

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
  // Thông số kỹ thuật chi tiết
  weight?: number;
  warrantyPeriod?: number;
  brand?: string;
  origin?: string;
  fuelEfficiency?: string;
  wetGrip?: string;
  noiseLevel?: number;
  aiLabel?: string;
  rating?: number;
  seasonType?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  images?: ProductImage[];
}

export type { Category } from './category';
export type { ProductImage } from './productImage';
