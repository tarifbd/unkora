"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

const PRICE_RANGES = [
  { label: "৳০ – ৳৫০০", min: 0, max: 50000 },
  { label: "৳৫০০ – ৳১,০০০", min: 50000, max: 100000 },
  { label: "৳১,০০০ – ৳২,৫০০", min: 100000, max: 250000 },
  { label: "৳২,৫০০ – ৳৫,০০০", min: 250000, max: 500000 },
  { label: "৳৫,০০০+", min: 500000, max: undefined },
];

const RATINGS = [5, 4, 3];

export function ProductFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const [openSections, setOpenSections] = useState({ price: true, rating: true, availability: true });

  const toggle = (key: keyof typeof openSections) =>
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  const apply = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(sp.toString());
    if (value === undefined) params.delete(key);
    else params.set(key, value);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const clear = () => router.push("?");

  const hasFilters = sp.has("min_price") || sp.has("max_price") || sp.has("rating") || sp.has("in_stock");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 font-bangla">ফিল্টার</h3>
        {hasFilters && (
          <button onClick={clear} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600">
            <X className="w-3 h-3" /> সব মুছুন
          </button>
        )}
      </div>

      {/* Price Range */}
      <div>
        <button
          onClick={() => toggle("price")}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-2"
        >
          দাম
          <ChevronDown className={cn("w-4 h-4 transition-transform", openSections.price && "rotate-180")} />
        </button>
        {openSections.price && (
          <div className="space-y-1.5">
            {PRICE_RANGES.map((r) => {
              const active = sp.get("min_price") === String(r.min);
              return (
                <button
                  key={r.label}
                  onClick={() => {
                    apply("min_price", active ? undefined : String(r.min));
                    apply("max_price", active ? undefined : r.max !== undefined ? String(r.max) : undefined);
                  }}
                  className={cn(
                    "w-full text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors font-bangla",
                    active ? "bg-primary-50 text-primary-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100" />

      {/* Rating */}
      <div>
        <button
          onClick={() => toggle("rating")}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-2"
        >
          রেটিং
          <ChevronDown className={cn("w-4 h-4 transition-transform", openSections.rating && "rotate-180")} />
        </button>
        {openSections.rating && (
          <div className="space-y-1.5">
            {RATINGS.map((r) => {
              const active = sp.get("rating") === String(r);
              return (
                <button
                  key={r}
                  onClick={() => apply("rating", active ? undefined : String(r))}
                  className={cn(
                    "w-full flex items-center gap-2 text-sm px-2.5 py-1.5 rounded-lg transition-colors",
                    active ? "bg-primary-50 text-primary-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <span className="text-amber-400">{"★".repeat(r)}{"☆".repeat(5 - r)}</span>
                  <span className="font-bangla">{r}+ তারা</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100" />

      {/* Availability */}
      <div>
        <button
          onClick={() => toggle("availability")}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-2"
        >
          প্রাপ্যতা
          <ChevronDown className={cn("w-4 h-4 transition-transform", openSections.availability && "rotate-180")} />
        </button>
        {openSections.availability && (
          <label className="flex items-center gap-2.5 px-2.5 py-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={sp.get("in_stock") === "true"}
              onChange={(e) => apply("in_stock", e.target.checked ? "true" : undefined)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600 font-bangla">শুধু স্টকে আছে</span>
          </label>
        )}
      </div>

      <div className="border-t border-gray-100" />

      {/* Special filters */}
      <div className="space-y-1.5">
        {[
          { label: "ফিচার্ড পণ্য", key: "is_featured", value: "true" },
          { label: "হালাল সার্টিফাইড", key: "is_halal_certified", value: "true" },
          { label: "অর্গানিক সার্টিফাইড", key: "is_organic_certified", value: "true" },
        ].map(({ label, key, value }) => (
          <label key={key} className="flex items-center gap-2.5 px-2.5 py-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={sp.get(key) === value}
              onChange={(e) => apply(key, e.target.checked ? value : undefined)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600 font-bangla">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
