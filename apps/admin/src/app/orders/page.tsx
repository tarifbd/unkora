import type { Metadata } from "next";
import { Search, Filter, Download } from "lucide-react";

export const metadata: Metadata = { title: "অর্ডার ম্যানেজমেন্ট" };

const STATUSES = ["PENDING","CONFIRMED","PROCESSING","PACKED","SHIPPED","DELIVERED","CANCELLED","RETURN_REQUESTED"];

const ORDERS = [
  { id:"1", num:"UNK-20250314-A1B2C3", customer:"রহিম সাহেব", phone:"+8801700000001", items:3, amount:"৳2,450", payment:"bKash", status:"CONFIRMED", fraud:12, date:"১৪ মার্চ, ১০:৩২" },
  { id:"2", num:"UNK-20250314-D4E5F6", customer:"করিম মিয়া", phone:"+8801700000002", items:1, amount:"৳950", payment:"COD", status:"PENDING", fraud:65, date:"১৪ মার্চ, ০৯:১৫" },
  { id:"3", num:"UNK-20250313-G7H8I9", customer:"সালমা বেগম", phone:"+8801700000003", items:2, amount:"৳1,570", payment:"SSLCommerz", status:"SHIPPED", fraud:8, date:"১৩ মার্চ, ১৫:০০" },
  { id:"4", num:"UNK-20250313-J0K1L2", customer:"আবু সায়েম", phone:"+8801700000004", items:5, amount:"৳8,200", payment:"Nagad", status:"DELIVERED", fraud:22, date:"১৩ মার্চ, ০৮:৪৫" },
  { id:"5", num:"UNK-20250312-M3N4O5", customer:"তানিয়া আক্তার", phone:"+8801700000005", items:1, amount:"৳450", payment:"bKash", status:"CANCELLED", fraud:5, date:"১২ মার্চ, ১৬:৩০" },
];

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-300",
  CONFIRMED: "bg-blue-500/20 text-blue-300",
  PROCESSING: "bg-indigo-500/20 text-indigo-300",
  PACKED: "bg-violet-500/20 text-violet-300",
  SHIPPED: "bg-purple-500/20 text-purple-300",
  DELIVERED: "bg-emerald-500/20 text-emerald-300",
  CANCELLED: "bg-red-500/20 text-red-300",
  RETURN_REQUESTED: "bg-orange-500/20 text-orange-300",
};

function FraudBadge({ score }: { score: number }) {
  const color = score >= 70 ? "text-red-400" : score >= 40 ? "text-amber-400" : "text-emerald-400";
  const label = score >= 70 ? "HIGH" : score >= 40 ? "MED" : "LOW";
  return <span className={`text-xs font-bold ${color}`}>{label} ({score})</span>;
}

export default function AdminOrdersPage() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">অর্ডার ম্যানেজমেন্ট</h1>
          <p className="text-sm text-slate-400 mt-0.5">সকল অর্ডার পরিচালনা করুন</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded-xl transition-colors">
          <Download className="w-4 h-4" /> CSV Export
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "আজকের অর্ডার", value: "47", delta: "+12%" },
          { label: "পেন্ডিং", value: "23", delta: "action needed" },
          { label: "আজকের রাজস্ব", value: "৳38,450", delta: "+8%" },
          { label: "সফল ডেলিভারি", value: "94.2%", delta: "last 30d" },
        ].map(({ label, value, delta }) => (
          <div key={label} className="bg-slate-800 border border-slate-700 rounded-xl p-3">
            <p className="text-xs text-slate-400">{label}</p>
            <p className="text-lg font-bold text-white mt-0.5">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{delta}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="অর্ডার নম্বর বা কাস্টমার..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>
        <select className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none">
          <option value="">সব স্ট্যাটাস</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none">
          <option>সব পেমেন্ট</option>
          <option>bKash</option>
          <option>Nagad</option>
          <option>SSLCommerz</option>
          <option>COD</option>
        </select>
        <select className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none">
          <option>আজ</option>
          <option>গত ৭ দিন</option>
          <option>গত ৩০ দিন</option>
          <option>এই মাস</option>
        </select>
      </div>

      {/* Orders table */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-700/50 border-b border-slate-700">
              <tr>
                {["অর্ডার নং", "কাস্টমার", "পণ্য", "মোট", "পেমেন্ট", "ফ্রড স্কোর", "স্ট্যাটাস", "তারিখ", "অ্যাকশন"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {ORDERS.map(order => (
                <tr key={order.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-amber-400 whitespace-nowrap">{order.num}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-200">{order.customer}</p>
                    <p className="text-xs text-slate-500">{order.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{order.items}টি পণ্য</td>
                  <td className="px-4 py-3 font-bold text-amber-400">{order.amount}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{order.payment}</span>
                  </td>
                  <td className="px-4 py-3"><FraudBadge score={order.fraud} /></td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[order.status] ?? "bg-slate-700 text-slate-300"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{order.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button className="px-2.5 py-1 text-xs text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/10 transition-colors">
                        দেখুন
                      </button>
                      <select className="text-xs bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-slate-300 focus:outline-none">
                        <option>স্ট্যাটাস</option>
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-slate-700 flex items-center justify-between text-sm text-slate-400">
          <span>৫টি দেখাচ্ছে (মোট ১,২৮৪)</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-40" disabled>← আগে</button>
            <button className="px-3 py-1.5 bg-amber-600 text-white rounded-lg font-medium">১</button>
            <button className="px-3 py-1.5 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">২</button>
            <button className="px-3 py-1.5 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">পরে →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
