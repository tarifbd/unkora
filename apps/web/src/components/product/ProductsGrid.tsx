"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { productsApi } from "@/lib/api";
import { ProductCard } from "./ProductCard";
import { Loader2 } from "lucide-react";

interface Props {
  params?: Record<string, string>;
}

export function ProductsGrid({ params = {} }: Props) {
  const loaderRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["products", params],
      queryFn: ({ pageParam = 1 }) =>
        productsApi.list({ ...params, page: pageParam as number, per_page: 20 }),
      getNextPageParam: (last: { meta?: { has_next?: boolean; page?: number } }) =>
        last?.meta?.has_next ? (last.meta.page ?? 1) + 1 : undefined,
      initialPageParam: 1,
    });

  // Infinite scroll observer
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-white rounded-2xl animate-pulse border border-gray-100" />
        ))}
      </div>
    );
  }

  const allProducts = data?.pages.flatMap((p: { data?: unknown[] }) => p.data ?? []) ?? [];

  if (!allProducts.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl mb-4">🔍</span>
        <h3 className="text-lg font-semibold text-gray-700 mb-2 font-bangla">কোনো পণ্য পাওয়া যায়নি</h3>
        <p className="text-sm text-gray-400 font-bangla">অন্য ফিল্টার দিয়ে চেষ্টা করুন</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {(allProducts as Parameters<typeof ProductCard>[0]["product"][]).map((product, i) => (
          <ProductCard key={product.id} product={product} priority={i < 8} />
        ))}
      </div>

      {/* Infinite scroll loader */}
      <div ref={loaderRef} className="flex justify-center mt-8 h-12">
        {isFetchingNextPage && (
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
        )}
        {!hasNextPage && allProducts.length > 0 && (
          <p className="text-sm text-gray-400 font-bangla">সব পণ্য দেখানো হয়েছে</p>
        )}
      </div>
    </>
  );
}
