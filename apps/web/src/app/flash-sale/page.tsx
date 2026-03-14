"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { productsApi } from "@/lib/api";
import { ProductCard } from "@/components/product/ProductCard";
import { Zap, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function useCountdown(endTime: string | null) {
  const [t, setT] = useState({ h: 0, m: 0, s: 0, expired: false });
  useEffect(() => {
    if (!endTime) return;
    const tick = () => {
      const diff = Math.max(0, new Date(endTime).getTime() - Date.now());
      setT({ h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000), expired: diff === 0 });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);
  return t;
}

function Digit({ v, label }: { v: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200">
        <span className="text-white font-bold text-2xl tabular-nums">{String(v).padStart(2, "0")}</span>
      </div>
      <span className="text-xs text-gray-400 mt-1 font-bangla">{label}</span>
    </div>
  );
}

export default function FlashSalePage() {
  const { data, isLoading } = useQuery({ queryKey: ["flash-sale"], queryFn: productsApi.getFlashSale });
  const sale = data?.data as {
    id: string; name_bn: string; name_en: string; end_time: string; is_active: boolean;
    items: { id: string; sale_price: number; max_quantity: number; sold_count: number; product: { id: string; slug: string; name_en: string; name_bn: string; base_price: number; rating_average: number; rating_count: number; images?: { url: string }[] } }[];
  } | null;
  const countdown = useCountdown(sale?.end_time ?? null);

  if (isLoading) return (
    <div className="flex justify-center py-32"><Loader2 className="w-10 h-10 animate-spin text-red-500" /></div>
  );

  if (!sale || !sale.is_active || countdown.expired) return (
    <div className="max-w-lg mx-auto px-4 py-32 text-center">
      <Zap className="w-16 h-16 text-gray-200 mx-auto mb-4" />
      <h2 className="font-serif text-2xl font-bold text-gray-700 font-bangla">বর্তমানে কোনো ফ্ল্যাশ সেল নেই</h2>
      <p className="text-gray-400 mt-2 font-bangla">পরবর্তী ফ্ল্যাশ সেলের জন্য অপেক্ষা করুন</p>
    </div>
  );

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 py-12 text-white text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="w-6 h-6 fill-white" />
          <span className="text-sm font-semibold uppercase tracking-wider opacity-90">সীমিত সময়ের অফার</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2 font-bangla">{sale.name_bn}</h1>
        <p className="text-white/70 text-sm mb-8 font-bangla">{sale.items.length}টি পণ্যে বিশেষ ছাড়</p>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-3">
          <Digit v={countdown.h} label="ঘণ্টা" />
          <span className="text-3xl font-bold text-white/70 mb-4">:</span>
          <Digit v={countdown.m} label="মিনিট" />
          <span className="text-3xl font-bold text-white/70 mb-4">:</span>
          <Digit v={countdown.s} label="সেকেন্ড" />
        </div>
      </div>

      {/* Products grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sale.items.map((item) => {
            const soldPct = Math.min(100, (item.sold_count / item.max_quantity) * 100);
            const remaining = item.max_quantity - item.sold_count;
            return (
              <div key={item.id} className="relative group">
                <ProductCard
                  product={{ ...item.product, sale_price: item.sale_price }}
                />
                {/* Stock bar */}
                <div className="bg-white border-x border-b border-gray-100 rounded-b-2xl px-3 pb-3 -mt-1">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", soldPct > 80 ? "bg-red-500" : "bg-orange-400")} style={{ width: `${soldPct}%` }} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 font-bangla">
                    {remaining > 0 ? `মাত্র ${remaining}টি বাকি` : "স্টক শেষ!"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
