import { Product } from './product';

export type OrderStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'paid_confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  snapshot: OrderItemSnapshot;
}

export interface OrderItemSnapshot {
  sku: string;
  name: string;
  image: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  total_amount: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  notes?: string;
  // Payment fields
  payment_phone?: string;
  payment_proof_url?: string;
  payment_confirmed_at?: string;
  payment_confirmed_by?: string;

  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface CreateOrderPayload {
  items: { product_id: string; quantity: number }[];
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  notes?: string;
}
