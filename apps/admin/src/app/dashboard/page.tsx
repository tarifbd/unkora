import type { Metadata } from "next";
import {
  ShoppingCart, Users, TrendingUp, Package,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle,
} from "lucide-react";

export const metadata: Metadata = { title: "ড্যাশবোর্ড" };

function KpiCard({ title, value, change, icon: Icon, trend, color }: {
  title: string; value: string; change: string; icon: React.ElementType;
  trend: "up" | "down"; color: string;
}) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className={`flex items-center gap-1 mt-3 text-sm ${trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
        {trend === "up" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        <span>{change} গত মাসের তুলনায়</span>
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-400",
    CONFIRMED: "bg-blue-500/20 text-blue-400",
    DELIVERED: "bg-emerald-500/20 text-emerald-400",
    CANCELLED: "bg-red-500/20 text-red-400",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? "bg-slate-700 text-slate-300"}`}>
      {status}
    </span>
  );
}

// Mock data — replace with real API calls
const RECENT_ORDERS = [
  { id: "1", number: "UNK-20250314-A1B2C3", customer: "রহিম সাহেব", amount: "৳1,250", status: "CONFIRMED", time: "২ মিনিট আগে" },
  { id: "2", number: "UNK-20250314-D4E5F6", customer: "করিম মিয়া", amount: "৳3,800", status: "PENDING", time: "১৫ মিনিট আগে" },
  { id: "3", number: "UNK-20250314-G7H8I9", customer: "সালমা বেগম", amount: "৳650", status: "DELIVERED", time: "১ ঘণ্টা আগে" },
  { id: "4", number: "UNK-20250313-J0K1L2", customer: "আবু সায়েম", amount: "৳2,100", status: "CANCELLED", time: "৩ ঘণ্টা আগে" },
];

const TOP_PRODUCTS = [
  { rank: 1, name: "রিয়াযুস সালেহীন", category: "বই", sales: 234, revenue: "৳10,530" },
  { rank: 2, name: "প্রিমিয়াম চামড়ার মানিব্যাগ", category: "লেদার", sales: 187, revenue: "৳17,765" },
  { rank: 3, name: "খাঁটি সিদর মধু", category: "অর্গানিক", sales: 156, revenue: "৳13,260" },
  { rank: 4, name: "প্রিমিয়াম জায়নামায", category: "ইসলামিক", sales: 143, revenue: "৳10,296" },
  { rank: 5, name: "BPA মুক্ত বেবি বোতল", category: "বেবি", sales: 128, revenue: "৳8,320" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">ড্যাশবোর্ড</h1>
          <p className="text-sm text-slate-400 mt-0.5">Unkora — সার্বিক পরিসংখ্যান</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Clock className="w-4 h-4" />
          <span>আজ, {new Date().toLocaleDateString("bn-BD")}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="মোট বিক্রয়" value="৳2,84,350" change="+12.5%" icon={TrendingUp} trend="up" color="bg-amber-600" />
        <KpiCard title="মোট অর্ডার" value="1,284" change="+8.2%" icon={ShoppingCart} trend="up" color="bg-blue-600" />
        <KpiCard title="নতুন কাস্টমার" value="347" change="-3.1%" icon={Users} trend="down" color="bg-purple-600" />
        <KpiCard title="পেন্ডিং অর্ডার" value="89" change="+21%" icon={Package} trend="up" color="bg-red-600" />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "আজকের রাজস্ব", value: "৳18,430", icon: "💰" },
          { label: "ডেলিভারি অপেক্ষায়", value: "43", icon: "🚚" },
          { label: "স্টক কম", value: "12টি পণ্য", icon: "⚠️" },
          { label: "নতুন রিভিউ", value: "27", icon: "⭐" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
            <span className="text-xl">{icon}</span>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-sm font-semibold text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">সাম্প্রতিক অর্ডার</h2>
            <a href="/orders" className="text-xs text-amber-400 hover:text-amber-300">সব দেখুন →</a>
          </div>
          <div className="space-y-3">
            {RECENT_ORDERS.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-white">{order.customer}</p>
                  <p className="text-xs text-slate-500">{order.number} · {order.time}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-amber-400">{order.amount}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">সর্বাধিক বিক্রিত পণ্য</h2>
            <a href="/products" className="text-xs text-amber-400 hover:text-amber-300">সব দেখুন →</a>
          </div>
          <div className="space-y-3">
            {TOP_PRODUCTS.map((p) => (
              <div key={p.rank} className="flex items-center gap-3 py-2 border-b border-slate-700/50 last:border-0">
                <span className="w-5 text-sm font-bold text-slate-500">#{p.rank}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.category} · {p.sales} বিক্রি</p>
                </div>
                <span className="text-sm font-semibold text-emerald-400">{p.revenue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order fulfilment status */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
        <h2 className="font-semibold text-white mb-4">অর্ডার ফালফিলমেন্ট পাইপলাইন</h2>
        <div className="flex items-center gap-1 flex-wrap">
          {[
            { label: "পেন্ডিং", count: 89, color: "bg-yellow-500" },
            { label: "কনফার্মড", count: 156, color: "bg-blue-500" },
            { label: "প্যাকড", count: 72, color: "bg-indigo-500" },
            { label: "শিপড", count: 234, color: "bg-purple-500" },
            { label: "ডেলিভারড", count: 733, color: "bg-emerald-500" },
            { label: "বাতিল", count: 45, color: "bg-red-500" },
          ].map(({ label, count, color }) => (
            <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-700/50 text-sm">
              <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
              <span className="text-slate-300">{label}</span>
              <span className="font-bold text-white ml-1">{count}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 h-2.5 bg-slate-700 rounded-full overflow-hidden flex">
          {[
            { pct: 6.8, color: "bg-yellow-500" },
            { pct: 12, color: "bg-blue-500" },
            { pct: 5.5, color: "bg-indigo-500" },
            { pct: 18, color: "bg-purple-500" },
            { pct: 56.3, color: "bg-emerald-500" },
            { pct: 3.4, color: "bg-red-500" },
          ].map(({ pct, color }, i) => (
            <div key={i} className={`${color} h-full`} style={{ width: `${pct}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
