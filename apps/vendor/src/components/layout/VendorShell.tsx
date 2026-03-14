"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Truck, DollarSign, BarChart2, Settings, Store } from "lucide-react";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "ড্যাশবোর্ড" },
  { href: "/products", icon: Package, label: "পণ্য" },
  { href: "/orders", icon: ShoppingBag, label: "অর্ডার" },
  { href: "/delivery", icon: Truck, label: "ডেলিভারি" },
  { href: "/earnings", icon: DollarSign, label: "আয়" },
  { href: "/analytics", icon: BarChart2, label: "অ্যানালিটিক্স" },
  { href: "/settings", icon: Settings, label: "সেটিংস" },
];

export function VendorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-52 flex-shrink-0 bg-white border-r border-gray-100 sticky top-0 h-screen flex flex-col shadow-sm">
        <div className="h-14 flex items-center gap-2 px-4 border-b border-gray-100">
          <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center"><span className="text-white text-xs font-bold">U</span></div>
          <div>
            <p className="text-xs font-bold text-gray-800">Unkora Vendor</p>
            <p className="text-[10px] text-gray-400">পোর্টাল</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${active ? "bg-primary-50 text-primary-700" : "text-gray-600 hover:bg-gray-50"}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-gray-600">
            <Store className="w-3.5 h-3.5" /> স্টোর দেখুন
          </Link>
        </div>
      </aside>
      {/* Content */}
      <main className="flex-1 min-w-0 bg-gray-50">
        <div className="h-14 bg-white border-b border-gray-100 flex items-center px-6 sticky top-0 z-10">
          <h1 className="text-sm font-semibold text-gray-800">{NAV.find(n => pathname.startsWith(n.href))?.label ?? "ভেন্ডর পোর্টাল"}</h1>
          <div className="ml-auto flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">V</div>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
