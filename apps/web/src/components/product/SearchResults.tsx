"use client";

import { useQuery } from "@tanstack/react-query";
import { searchApi } from "@/lib/api";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductFilters } from "@/components/product/ProductFilters";
import { Loader2, AlertCircle } from "lucide-react";

interface Props {
  query: string;
  params: { page?: string; category?: string; sort?: string };
}

export function SearchResults({ query, params }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["search", query, params],
    queryFn: () => searchApi.search({ q: query, page: parseInt(params.page ?? "1"), ...params }),
    enabled: query.length > 0,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-16 text-center gap-3">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-gray-500 font-bangla">অনুসন্ধানে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।</p>
      </div>
    );
  }

  const { hits = [], total = 0, suggestion } = data?.data ?? {};

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <aside className="lg:w-60 flex-shrink-0">
        <ProductFilters />
      </aside>

      <div className="flex-1">
        {/* Result count + suggestion */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 font-bangla">
            {total > 0 ? `${total}টি ফলাফল পাওয়া গেছে` : "কোনো ফলাফল পাওয়া যায়নি"}
          </p>
          {suggestion && (
            <p className="text-sm text-gray-500 mt-1 font-bangla">
              আপনি কি খুঁজছিলেন:{" "}
              <a href={`?q=${encodeURIComponent(suggestion)}`} className="text-primary-600 hover:underline font-medium">
                {suggestion}
              </a>
              ?
            </p>
          )}
        </div>

        {hits.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="text-5xl mb-4">😔</span>
            <h3 className="text-lg font-semibold text-gray-700 font-bangla">কোনো পণ্য পাওয়া যায়নি</h3>
            <p className="text-sm text-gray-400 font-bangla mt-1">অন্য শব্দ দিয়ে চেষ্টা করুন</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {(hits as Parameters<typeof ProductCard>[0]["product"][]).map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 4} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
