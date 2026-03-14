"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import { ProductCard } from "@/components/product/ProductCard";
import { cn } from "@/lib/utils";

function useCountdown(endTime: Date) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, endTime.getTime() - Date.now());
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);
  return timeLeft;
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600 rounded-xl flex items-center justify-center">
        <span className="text-white font-bold text-lg sm:text-xl tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-[10px] text-gray-500 mt-1">{label}</span>
    </div>
  );
}

export function FlashSaleSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["flash-sale"],
    queryFn: productsApi.getFlashSale,
    staleTime: 60_000,
  });

  const flashSale = data?.data;
  const endTime = flashSale ? new Date(flashSale.end_time) : new Date(Date.now() + 3600000 * 6);
  const timeLeft = useCountdown(endTime);

  if (!isLoading && !flashSale) return null;

  return (
    <section className="bg-gradient-to-r from-red-50 to-orange-50 border-y border-red-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-200">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-800">
                {flashSale?.name_bn ?? "ফ্ল্যাশ সেল"}
              </h2>
              <p className="text-xs text-red-500 font-medium">সীমিত সময়ের অফার!</p>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 mr-1">শেষ হবে:</span>
            <TimeBox value={timeLeft.h} label="ঘণ্টা" />
            <span className="text-red-500 font-bold text-lg -mt-4">:</span>
            <TimeBox value={timeLeft.m} label="মিনিট" />
            <span className="text-red-500 font-bold text-lg -mt-4">:</span>
            <TimeBox value={timeLeft.s} label="সেকেন্ড" />
          </div>
        </div>

        {/* Products */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="aspect-square bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {flashSale?.items?.slice(0, 5).map(
              (item: {
                id: string;
                product: {
                  id: string;
                  slug: string;
                  name_en: string;
                  name_bn: string;
                  base_price: number;
                  images?: { url: string }[];
                  rating_average: number;
                  rating_count: number;
                };
                sale_price: number;
                max_quantity: number;
                sold_count: number;
              }) => (
                <div key={item.id} className="relative">
                  <ProductCard
                    product={{
                      ...item.product,
                      sale_price: item.sale_price,
                    }}
                  />
                  {/* Stock bar */}
                  <div className="absolute bottom-0 left-0 right-0 px-3 pb-2">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (item.sold_count / item.max_quantity) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5 text-center">
                      {item.max_quantity - item.sold_count} টি বাকি
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        <div className="flex justify-center mt-6">
          <Link
            href="/flash-sale"
            className="px-8 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            সব ফ্ল্যাশ সেল দেখুন
          </Link>
        </div>
      </div>
    </section>
  );
}
