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