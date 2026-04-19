export interface ProductFilters {
  category?: string;
  tire_type?: string;
  size?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}