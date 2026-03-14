import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CartItem {
  id: string;
  product_id: string;
  variant_id?: string | null;
  name_en: string;
  name_bn: string;
  image: string;
  sku: string;
  unit_price: number;
  quantity: number;
  stock_quantity: number;
}

interface CartStore {
  items: CartItem[];
  couponCode: string | null;
  totalItems: number;
  subtotal: number;
  discountAmount: number;

  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, variantId?: string | null) => void;
  updateQuantity: (productId: string, variantId: string | null | undefined, quantity: number) => void;
  clearCart: () => void;
  setCoupon: (code: string | null) => void;
  setDiscount: (amount: number) => void;
  _recalculate: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      totalItems: 0,
      subtotal: 0,
      discountAmount: 0,

      addItem: (item) => {
        const items = get().items;
        const existing = items.find(
          (i) => i.product_id === item.product_id && i.variant_id === item.variant_id
        );
        if (existing) {
          const newQty = Math.min(
            existing.quantity + (item.quantity ?? 1),
            existing.stock_quantity
          );
          set({
            items: items.map((i) =>
              i.product_id === item.product_id && i.variant_id === item.variant_id
                ? { ...i, quantity: newQty }
                : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, id: `${item.product_id}-${item.variant_id ?? ""}`, quantity: item.quantity ?? 1 }] });
        }
        get()._recalculate();
      },

      removeItem: (productId, variantId) => {
        set({ items: get().items.filter((i) => !(i.product_id === productId && i.variant_id === variantId)) });
        get()._recalculate();
      },

      updateQuantity: (productId, variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.product_id === productId && i.variant_id === variantId
              ? { ...i, quantity: Math.min(quantity, i.stock_quantity) }
              : i
          ),
        });
        get()._recalculate();
      },

      clearCart: () => set({ items: [], couponCode: null, totalItems: 0, subtotal: 0, discountAmount: 0 }),

      setCoupon: (code) => set({ couponCode: code }),
      setDiscount: (amount) => set({ discountAmount: amount }),

      _recalculate: () => {
        const items = get().items;
        set({
          totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
          subtotal: items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0),
        });
      },
    }),
    {
      name: "unkora-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
