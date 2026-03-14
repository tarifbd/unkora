"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Store,
  CreditCard, Star, Tag, Zap, Image, Truck, BarChart2,
  Settings, LogOut, ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NAV = [
  { section: "ওভারভিউ", items: [
    { href: "/dashboard", icon: LayoutDashboard, label: "ড্যাশবোর্ড" },
  ]},
  { section: "ক্যাটালগ", items: [
    { href: "/products", icon: Package, label: "পণ্য" },
    { href: "/categories", icon: Tag, label: "ক্যাটাগরি" },
  ]},
  { section: "বিক্রয়", items: [
    { href: "/orders", icon: ShoppingCart, label: "অর্ডার" },
    { href: "/payments", icon: CreditCard, label: "পেমেন্ট" },
    { href: "/delivery", icon: Truck, label: "ডেলিভারি" },
  ]},
  { section: "ব্যবহারকারী", items: [
    { href: "/customers", icon: Users, label: "কাস্টমার" },
    { href: "/vendors", icon: Store, label: "ভেন্ডর" },
  ]},
  { section: "মার্কেটিং", items: [
    { href: "/reviews", icon: Star, label: "রিভিউ" },
    { href: "/coupons", icon: Tag, label: "কুপন" },
    { href: "/flash-sales", icon: Zap, label: "ফ্ল্যাশ সেল" },
    { href: "/banners", icon: Image, label: "ব্যানার" },
  ]},
  { section: "অ্যানালিটিক্স", items: [
    { href: "/analytics", icon: BarChart2, label: "রিপোর্ট" },
  ]},
  { section: "সিস্টেম", items: [
    { href: "/settings", icon: Settings, label: "সেটিংস" },
  ]},
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "flex-shrink-0 h-screen sticky top-0 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-56"
    )}>
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-slate-800">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">U</span>
            </div>
            <span className="font-bold text-white text-sm">Unkora Admin</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors ml-auto"
        >
          <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
        {NAV.map(({ section, items }) => (
          <div key={section}>
            {!collapsed && (
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 mb-1">
                {section}
              </p>
            )}
            {items.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  title={collapsed ? label : undefined}
                  className={cn(
                    "flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-amber-600/20 text-amber-400"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-slate-800">
        <button className="flex items-center gap-3 w-full px-2 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>লগআউট</span>}
        </button>
      </div>
    </aside>
  );
}
