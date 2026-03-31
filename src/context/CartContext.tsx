"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useAuth } from "@/context/AuthContext";

export interface CartItem {
  id: string;
  variant_id: string;
  quantity: number;
  variant: {
    grain_size: string | null;
    pack_size: string;
    price: number;
    in_stock: boolean;
    product: {
      name: string;
      slug: string;
      image_thumb: string;
    };
  };
}

type CartContextType = {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  loading: boolean;
  addItem: (variantId: string, qty?: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  updateQty: (cartItemId: string, qty: number) => Promise<void>;
};

const CartContext = createContext<CartContextType>({
  cartItems: [],
  cartCount: 0,
  cartTotal: 0,
  loading: false,
  addItem: async () => {},
  removeItem: async () => {},
  updateQty: async () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("cart_items")
      .select(`
        id,
        variant_id,
        quantity,
        variant:product_variants(
          grain_size,
          pack_size,
          price,
          in_stock,
          product:products(name, slug, image_thumb)
        )
      `)
      .order("created_at");
    setCartItems((data as unknown as CartItem[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (variantId: string, qty = 1) => {
    if (!user) return;
    const supabase = createClient();
    const existing = cartItems.find((i) => i.variant_id === variantId);
    if (existing) {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + qty })
        .eq("id", existing.id);
      if (error) { console.error("Cart update error:", error); return; }
    } else {
      const { error } = await supabase
        .from("cart_items")
        .insert({ user_id: user.id, variant_id: variantId, quantity: qty });
      if (error) { console.error("Cart insert error:", error); return; }
    }
    await fetchCart();
  };

  const removeItem = async (cartItemId: string) => {
    if (!user) return;
    const supabase = createClient();
    await supabase.from("cart_items").delete().eq("id", cartItemId);
    await fetchCart();
  };

  const updateQty = async (cartItemId: string, qty: number) => {
    if (!user) return;
    if (qty <= 0) return removeItem(cartItemId);
    const supabase = createClient();
    await supabase
      .from("cart_items")
      .update({ quantity: qty })
      .eq("id", cartItemId);
    await fetchCart();
  };

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.variant.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, cartCount, cartTotal, loading, addItem, removeItem, updateQty }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
