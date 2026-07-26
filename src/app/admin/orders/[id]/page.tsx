import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { requireAdminPage } from "@/lib/session";
import OrderDetailClient from "./OrderDetailClient";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const db = getDb();
  const { id } = await params;

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: {
      user: { columns: { name: true, email: true, phone: true } },
      items: {
        with: {
          variant: {
            columns: { grainSize: true, packSize: true },
            with: { product: { columns: { name: true, slug: true } } },
          },
        },
      },
    },
  });

  if (!order) notFound();
  return <OrderDetailClient order={order} />;
}
