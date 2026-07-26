import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";

export async function getSession() {
  return getAuth().api.getSession({ headers: await headers() });
}

export function isAdminEmail(email: string | null | undefined) {
  return !!email && email === process.env.ADMIN_EMAIL;
}

export async function requireAdminPage() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login?next=/admin");
  if (!isAdminEmail(session.user.email)) redirect("/");
  return session;
}
