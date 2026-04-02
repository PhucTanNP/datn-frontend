import { create } from 'zustand';
import type { Product } from '@/types/product';
import type { CartItem } from '@/types/order';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (product, quantity = 1) => {
    const currentItems = get().items;
    const existingItem = currentItems.find(item => item.product_id === product.id);
    if (existingItem) {
      set({
        items: currentItems.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      });
    } else {
      set({
        items: [...currentItems, {
          product_id: product.id,
          quantity,
          unit_price: product.price,
          total_price: product.price * quantity,
          product,
        }],
      });
    }
  },
  updateQuantity: (productId, quantity) => {
    set({
      items: get().items.map(item =>
        item.product_id === productId
          ? { ...item, quantity, total_price: item.unit_price * quantity }
          : item
      ).filter(item => item.quantity > 0),
    });
  },
  removeItem: (productId) => {
    set({
      items: get().items.filter(item => item.product_id !== productId),
    });
  },
  clearCart: () => set({ items: [] }),
  getTotal: () => {
    return get().items.reduce((sum, item) => sum + item.total_price, 0);
  },
}));