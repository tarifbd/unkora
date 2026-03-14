import { ProductCard } from "@/components/product/ProductCard";

async function getFeaturedProducts() {
  try {
    const apiUrl = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    const res = await fetch(`${apiUrl}/products/featured`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = await res.json() as { data?: unknown[] };
    return json.data ?? [];
  } catch {
    return MOCK_PRODUCTS;
  }
}

export async function FeaturedProducts() {
  const products = (await getFeaturedProducts()) as ProductType[];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={i < 4} />
      ))}
    </div>
  );
}

interface ProductType {
  id: string;
  slug: string;
  name_en: string;
  name_bn: string;
  base_price: number;
  sale_price?: number | null;
  rating_average: number;
  rating_count: number;
  stock_quantity?: number;
  images?: { url: string; alt_text?: string | null }[];
  category?: { name_en: string; name_bn: string; slug: string } | null;
}

// Mock data for dev / build time
const MOCK_PRODUCTS: ProductType[] = [
  { id: "1", slug: "riyazus-saliheen", name_en: "Riyazus Saliheen", name_bn: "রিয়াযুস সালেহীন", base_price: 45000, sale_price: 38000, rating_average: 4.8, rating_count: 124, stock_quantity: 50, images: [], category: { name_en: "Books", name_bn: "বই", slug: "books" } },
  { id: "2", slug: "premium-leather-wallet", name_en: "Premium Leather Wallet", name_bn: "প্রিমিয়াম চামড়ার মানিব্যাগ", base_price: 120000, sale_price: 95000, rating_average: 4.6, rating_count: 89, stock_quantity: 25, images: [], category: { name_en: "Leather", name_bn: "লেদার পণ্য", slug: "leather" } },
  { id: "3", slug: "bpa-free-baby-bottle", name_en: "BPA Free Baby Bottle", name_bn: "বিপিএ মুক্ত বেবি বোতল", base_price: 65000, rating_average: 4.7, rating_count: 203, stock_quantity: 75, images: [], category: { name_en: "Baby", name_bn: "বেবি প্রোডাক্ট", slug: "baby" } },
  { id: "4", slug: "premium-prayer-mat", name_en: "Premium Prayer Mat", name_bn: "প্রিমিয়াম জায়নামায", base_price: 85000, sale_price: 72000, rating_average: 4.9, rating_count: 567, stock_quantity: 30, images: [], category: { name_en: "Islamic", name_bn: "ইসলামিক লাইফস্টাইল", slug: "islamic" } },
  { id: "5", slug: "pure-sidr-honey", name_en: "Pure Sidr Honey", name_bn: "খাঁটি সিদর মধু", base_price: 95000, sale_price: 85000, rating_average: 4.8, rating_count: 341, stock_quantity: 60, images: [], category: { name_en: "Organic", name_bn: "অর্গানিক ফুড", slug: "organic" } },
];
