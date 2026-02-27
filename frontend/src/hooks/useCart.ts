import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FolderOffer } from '../backend';

interface CartItem {
  offer: FolderOffer;
  quantity: number;
}

interface CartStore {
  cartItems: CartItem[];
  addToCart: (offer: FolderOffer) => void;
  removeFromCart: (offerId: bigint) => void;
  updateQuantity: (offerId: bigint, quantity: number) => void;
  clearCart: () => void;
  isInCart: (offerId: bigint) => boolean;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],
      
      addToCart: (offer) => {
        const items = get().cartItems;
        const existingItem = items.find(item => item.offer.id === offer.id);
        
        if (existingItem) {
          set({
            cartItems: items.map(item =>
              item.offer.id === offer.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ cartItems: [...items, { offer, quantity: 1 }] });
        }
      },
      
      removeFromCart: (offerId) => {
        set({
          cartItems: get().cartItems.filter(item => item.offer.id !== offerId),
        });
      },
      
      updateQuantity: (offerId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(offerId);
          return;
        }
        
        set({
          cartItems: get().cartItems.map(item =>
            item.offer.id === offerId ? { ...item, quantity } : item
          ),
        });
      },
      
      clearCart: () => {
        set({ cartItems: [] });
      },
      
      isInCart: (offerId) => {
        return get().cartItems.some(item => item.offer.id === offerId);
      },
      
      getTotalItems: () => {
        return get().cartItems.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        return get().cartItems.reduce((total, item) => {
          const actionPrice = item.offer.originalPrice / 2;
          return total + (actionPrice * item.quantity);
        }, 0);
      },
    }),
    {
      name: 'buddydeals-cart',
    }
  )
);
