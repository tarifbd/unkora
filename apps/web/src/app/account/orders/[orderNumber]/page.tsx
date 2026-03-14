import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderDetailView } from "@/components/account/OrderDetailView";

interface Props { params: Promise<{ orderNumber: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `অর্ডার ${orderNumber}` };
}

async function getOrder(orderNumber: string) {
  try {
    const apiUrl = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    const res = await fetch(`${apiUrl}/orders/${orderNumber}`, { next: { revalidate: 30 } });
    if (!res.ok) return null;
    const json = await res.json() as { data?: unknown };
    return json.data ?? null;
  } catch { return null; }
}

export default async function OrderDetailPage({ params }: Props) {
  const { orderNumber } = await params;
  const order = await getOrder(orderNumber);
  if (!order) notFound();
  return <OrderDetailView order={order as Record<string, unknown>} />;
}
