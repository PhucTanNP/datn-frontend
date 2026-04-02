import { ProductCard } from './ProductCard';
import { Product } from '@/types/product';

interface ProductGridProps {
  products: Product[];
  className?: string;
}

export function ProductGrid({ products, className = '' }: ProductGridProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}