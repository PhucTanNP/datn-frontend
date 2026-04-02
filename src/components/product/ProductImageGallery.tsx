import Image from 'next/image';
import { Product } from '@/types/product';

interface ProductImageGalleryProps {
  images: string[];
  className?: string;
}

export function ProductImageGallery({ images, className = '' }: ProductImageGalleryProps) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-2 ${className}`}>
      {images.slice(0, 4).map((url, index) => (
        <div key={index} className="relative group overflow-hidden rounded-xl">
          <Image
            src={url}
            alt={`Product image ${index + 1}`}
            width={200}
            height={200}
            className="w-full h-48 object-cover transition-transform group-hover:scale-110"
          />
        </div>
      ))}
    </div>
  );
}