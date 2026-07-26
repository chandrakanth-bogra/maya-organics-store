"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
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
    const res = await fetch("/api/cart");
    if (res.ok) {
      const { items } = await res.json();
      setCartItems(items ?? []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (variantId: string, qty = 1) => {
    if (!user) return;
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId, qty }),
    });
    if (!res.ok) { console.error("Cart add error:", await res.text()); return; }
    await fetchCart();
  };

  const removeItem = async (cartItemId: string) => {
    if (!user) return;
    await fetch(`/api/cart/${cartItemId}`, { method: "DELETE" });
    await fetchCart();
  };

  const updateQty = async (cartItemId: string, qty: number) => {
    if (!user) return;
    if (qty <= 0) return removeItem(cartItemId);
    await fetch(`/api/cart/${cartItemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: qty }),
    });
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
