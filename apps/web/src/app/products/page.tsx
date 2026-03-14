import type { Metadata } from "next";
import { ProductsGrid } from "@/components/product/ProductsGrid";
import { ProductFilters } from "@/components/product/ProductFilters";

export const metadata: Metadata = {
  title: "সকল পণ্য",
  description: "Unkora-তে সকল পণ্য ব্রাউজ করুন",
};

interface Props {
  searchParams: Promise<Record<string, string>>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar filters */}
        <aside className="lg:w-60 flex-shrink-0">
          <ProductFilters />
        </aside>

        {/* Products grid */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-gray-800 font-bangla">
              {params["category"] ? `${params["category"]} পণ্য` : "সকল পণ্য"}
            </h1>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-300">
              <option value="created_at">নতুন প্রথম</option>
              <option value="price_asc">দাম: কম থেকে বেশি</option>
              <option value="price_desc">দাম: বেশি থেকে কম</option>
              <option value="rating">সেরা রেটিং</option>
              <option value="sales_count">সর্বাধিক বিক্রিত</option>
            </select>
          </div>
          <ProductsGrid params={params} />
        </main>
      </div>
    </div>
  );
}
