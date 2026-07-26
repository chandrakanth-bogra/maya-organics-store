import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { requireUser } from "@/lib/api-auth";

export async function GET() {
  const db = getDb();
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const rows = await db
    .select({
      id: orders.id,
      status: orders.status,
      total: orders.total,
      created_at: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.userId, auth.user.id))
    .orderBy(desc(orders.createdAt));

  return NextResponse.json({ orders: rows });
}
