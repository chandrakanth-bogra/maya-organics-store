import type { Metadata } from "next";
import CartClient from "./CartClient";

export const metadata: Metadata = {
  title: "Cart | Maya Organics",
};

export default function CartPage() {
  return <CartClient />;
}
