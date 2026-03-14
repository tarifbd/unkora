"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ordersApi, wishlistApi } from "@/lib/api";
import { formatBDT, cn } from "@/lib/utils";
import { User, ShoppingBag, Heart, Star, MapPin, LogOut, Award } from "lucide-react";
import Link from "next/link";

type Tab = "orders" | "wishlist" | "loyalty" | "addresses" | "profile";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "orders", label: "অর্ডার", icon: ShoppingBag },
  { id: "wishlist", label: "উইশলিস্ট", icon: Heart },
  { id: "loyalty", label: "লয়্যালটি", icon: Award },
  { id: "addresses", label: "ঠিকানা", icon: MapPin },
  { id: "profile", label: "প্রোফাইল", icon: User },
];

const TIER_COLORS: Record<string, string> = {
  BRONZE: "text-amber-700 bg-amber-50",
  SILVER: "text-slate-600 bg-slate-100",
  GOLD: "text-yellow-600 bg-yellow-50",
  PLATINUM: "text-purple-600 bg-purple-50",
};
const TIER_NAMES: Record<string, string> = { BRONZE: "ব্রোঞ্জ", SILVER: "সিলভার", GOLD: "গোল্ড", PLATINUM: "প্লাটিনাম" };

export default function AccountPage() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("orders");

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* User header */}
      <div className="flex items-center gap-4 mb-8 bg-white rounded-2xl border border-gray-100 shadow-card p-5">
        <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold flex-shrink-0">
          {user.name_en[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-gray-800 font-bangla">{user.name_bn ?? user.name_en}</h1>
          <p className="text-sm text-gray-500">{user.email ?? user.phone}</p>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${TIER_COLORS[user.loyalty_tier] ?? ""}`}>
            {TIER_NAMES[user.loyalty_tier] ?? user.loyalty_tier} · {user.loyalty_points} পয়েন্ট
          </span>
        </div>
        <button
          onClick={() => { clearAuth(); router.push("/"); }}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors font-bangla"
        >
          <LogOut className="w-4 h-4" /> লগআউট
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Tab sidebar */}
        <aside className="sm:w-44 flex-shrink-0">
          <nav className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors",
                  tab === id ? "bg-primary-50 text-primary-700" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          {tab === "orders" && <OrdersTab />}
          {tab === "wishlist" && <WishlistTab />}
          {tab === "loyalty" && <LoyaltyTab user={user} />}
          {tab === "profile" && <ProfileTab user={user} />}
          {tab === "addresses" && <AddressesTab />}
        </div>
      </div>
    </div>
  );
}

function OrdersTab() {
  const { data, isLoading } = useQuery({ queryKey: ["orders"], queryFn: () => ordersApi.list() });
  const orders = data?.data ?? [];

  if (isLoading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 skeleton rounded-2xl" />)}</div>;
  if (!orders.length) return (
    <div className="text-center py-16">
      <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
      <p className="text-gray-500 font-bangla">কোনো অর্ডার নেই</p>
      <Link href="/products" className="mt-3 inline-block text-sm text-primary-600 font-bangla">শপিং শুরু করুন →</Link>
    </div>
  );

  return (
    <div className="space-y-3">
      {(orders as { id: string; order_number: string; total_amount: number; status: string; created_at: string; items: { product_name_bn: string; quantity: number; product_image: string }[] }[]).map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.order_number}`}
          className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-card p-4 hover:border-primary-200 transition-colors"
        >
          <div className="flex -space-x-2">
            {order.items.slice(0, 3).map((item, i) => (
              <div key={i} className="w-10 h-10 rounded-xl bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-bangla overflow-hidden">
                {item.product_name_bn[0]}
              </div>
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-gray-400">{order.order_number}</p>
            <p className="text-sm text-gray-700 font-bangla truncate">{order.items.map(i => i.product_name_bn).join(", ")}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-primary-700">{formatBDT(order.total_amount)}</p>
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", order.status === "DELIVERED" ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700")}>
              {order.status}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function WishlistTab() {
  const { data } = useQuery({ queryKey: ["wishlist"], queryFn: wishlistApi.get });
  const items = data?.data ?? [];

  if (!items.length) return (
    <div className="text-center py-16">
      <Heart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
      <p className="text-gray-500 font-bangla">উইশলিস্ট খালি</p>
    </div>
  );

  return <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{/* product cards */}</div>;
}

function LoyaltyTab({ user }: { user: { loyalty_points: number; loyalty_tier: string } }) {
  const tiers = [
    { id: "BRONZE", name: "ব্রোঞ্জ", min: 0, max: 499 },
    { id: "SILVER", name: "সিলভার", min: 500, max: 1999 },
    { id: "GOLD", name: "গোল্ড", min: 2000, max: 4999 },
    { id: "PLATINUM", name: "প্লাটিনাম", min: 5000, max: Infinity },
  ];
  const currentTier = tiers.find(t => t.id === user.loyalty_tier);
  const nextTier = tiers[tiers.findIndex(t => t.id === user.loyalty_tier) + 1];

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-primary-700 to-amber-600 rounded-2xl p-5 text-white">
        <p className="text-sm opacity-80 font-bangla">আপনার পয়েন্ট</p>
        <p className="text-4xl font-bold mt-1">{user.loyalty_points}</p>
        <p className="text-sm opacity-80 font-bangla mt-1">{TIER_NAMES[user.loyalty_tier] ?? ""} স্তর</p>
        {nextTier && (
          <p className="text-xs opacity-70 font-bangla mt-3">
            {nextTier.name} স্তরে যেতে আরো {nextTier.min - user.loyalty_points} পয়েন্ট দরকার
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
        <h3 className="font-semibold text-gray-800 mb-3 font-bangla">স্তর সুবিধা</h3>
        <div className="space-y-2">
          {[
            { tier: "ব্রোঞ্জ", desc: "প্রতি কেনাকাটায় পয়েন্ট অর্জন করুন", active: true },
            { tier: "সিলভার", desc: "২% অতিরিক্ত ছাড়", active: user.loyalty_points >= 500 },
            { tier: "গোল্ড", desc: "৫% ছাড় + বিনামূল্যে ডেলিভারি", active: user.loyalty_points >= 2000 },
            { tier: "প্লাটিনাম", desc: "১০% ছাড় + প্রিয়রিটি সাপোর্ট", active: user.loyalty_points >= 5000 },
          ].map(({ tier, desc, active }) => (
            <div key={tier} className={cn("flex items-start gap-3 p-3 rounded-xl", active ? "bg-primary-50" : "bg-gray-50 opacity-50")}>
              <span className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", active ? "bg-primary-500" : "bg-gray-300")} />
              <div>
                <p className={cn("text-sm font-medium", active ? "text-primary-700" : "text-gray-400")} >{tier}</p>
                <p className="text-xs text-gray-500 font-bangla">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ user }: { user: { name_en: string; name_bn?: string | null; email?: string | null; phone?: string | null } }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 space-y-4">
      <h3 className="font-semibold text-gray-800 font-bangla">প্রোফাইল সম্পাদনা</h3>
      {[
        { label: "নাম (বাংলা)", value: user.name_bn ?? "", placeholder: "আপনার নাম বাংলায়" },
        { label: "নাম (English)", value: user.name_en, placeholder: "Your name in English" },
        { label: "ইমেইল", value: user.email ?? "", placeholder: "email@example.com" },
        { label: "মোবাইল", value: user.phone ?? "", placeholder: "+8801XXXXXXXXX" },
      ].map(({ label, value, placeholder }) => (
        <div key={label}>
          <label className="block text-xs font-medium text-gray-500 mb-1.5 font-bangla">{label}</label>
          <input defaultValue={value} placeholder={placeholder} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 font-bangla" />
        </div>
      ))}
      <button className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors text-sm font-bangla">
        সংরক্ষণ করুন
      </button>
    </div>
  );
}

function AddressesTab() {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 font-bangla">
          + নতুন ঠিকানা
        </button>
      </div>
      <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-card">
        <MapPin className="w-10 h-10 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400 font-bangla text-sm">কোনো ঠিকানা নেই</p>
      </div>
    </div>
  );
}
