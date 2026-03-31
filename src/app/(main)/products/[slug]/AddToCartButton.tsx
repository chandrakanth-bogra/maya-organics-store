"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ productId, inStock }: { productId: string; inStock: boolean }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  const handleClick = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setAdding(true);
    await addItem(productId);
    setAdding(false);
  };

  if (!inStock) {
    return (
      <button
        disabled
        className="btn btn-primary"
        style={{ width: "100%", opacity: 0.5, cursor: "not-allowed", marginBottom: "var(--space-3)", fontSize: "14px", padding: "16px 32px" }}
      >
        Out of Stock
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={adding}
      className="btn btn-primary"
      style={{ width: "100%", marginBottom: "var(--space-3)", fontSize: "14px", padding: "16px 32px" }}
    >
      {adding ? "Adding..." : "Add to Cart"}
    </button>
  );
}
