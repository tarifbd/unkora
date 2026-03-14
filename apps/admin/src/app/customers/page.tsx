import type { Metadata } from "next";
import { Search, UserX, Shield } from "lucide-react";

export const metadata: Metadata = { title: "কাস্টমার ম্যানেজমেন্ট" };

const CUSTOMERS = [
  { id:"1", name:"রহিম সাহেব", phone:"+8801700000001", email:"rahim@example.com", orders:23, spent:"৳34,500", tier:"GOLD", status:"ACTIVE", joined:"জানু ২০২৫" },
  { id:"2", name:"করিম মিয়া", phone:"+8801700000002", email:null, orders:7, spent:"৳8,200", tier:"SILVER", status:"ACTIVE", joined:"ফেব্রু ২০২৫" },
  { id:"3", name:"সালমা বেগম", phone:"+8801700000003", email:"salma@example.com", orders:45, spent:"৳82,000", tier:"PLATINUM", status:"ACTIVE", joined:"ডিসে ২০২৪" },
  { id:"4", name:"আবু সায়েম", phone:"+8801700000004", email:null, orders:2, spent:"৳1,200", tier:"BRONZE", status:"SUSPENDED", joined:"মার্চ ২০২৫" },
];

const TIER_STYLE: Record<string, string> = {
  BRONZE: "text-amber-600 bg-amber-500/20",
  SILVER: "text-slate-300 bg-slate-500/20",
  GOLD: "text-yellow-400 bg-yellow-500/20",
  PLATINUM: "text-purple-400 bg-purple-500/20",
};

export default function AdminCustomersPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">কাস্টমার ম্যানেজমেন্ট</h1>
          <p className="text-sm text-slate-400 mt-0.5">সকল কাস্টমার পরিচালনা করুন</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:"মোট কাস্টমার", value:"12,847" },
          { label:"এই মাসে নতুন", value:"347" },
          { label:"সক্রিয় কাস্টমার", value:"8,234" },
          { label:"সাসপেন্ডেড", value:"23", alert:true },
        ].map(({ label, value, alert }) => (
          <div key={label} className="bg-slate-800 border border-slate-700 rounded-xl p-3">
            <p className="text-xs text-slate-400">{label}</p>
            <p className={`text-xl font-bold mt-0.5 ${alert ? "text-red-400" : "text-white"}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="search" placeholder="নাম, ফোন বা ইমেইল..." className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
        </div>
        <select className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none">
          <option>সব স্ট্যাটাস</option>
          <option>ACTIVE</option>
          <option>SUSPENDED</option>
          <option>BANNED</option>
        </select>
        <select className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none">
          <option>সব টায়ার</option>
          <option>PLATINUM</option>
          <option>GOLD</option>
          <option>SILVER</option>
          <option>BRONZE</option>
        </select>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-700/50 border-b border-slate-700">
            <tr>
              {["কাস্টমার", "ফোন / ইমেইল", "অর্ডার", "মোট খরচ", "টায়ার", "স্ট্যাটাস", "যোগ দিয়েছেন", "অ্যাকশন"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {CUSTOMERS.map(c => (
              <tr key={c.id} className="hover:bg-slate-700/30 transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-600/30 text-primary-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{c.name[0]}</div>
                    <span className="font-medium text-slate-200">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-slate-300 text-xs">{c.phone}</p>
                  {c.email && <p className="text-slate-500 text-xs">{c.email}</p>}
                </td>
                <td className="px-4 py-3 text-slate-400">{c.orders}</td>
                <td className="px-4 py-3 font-bold text-amber-400">{c.spent}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TIER_STYLE[c.tier] ?? ""}`}>{c.tier}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>{c.status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{c.joined}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-600 text-slate-400 transition-colors" title="View"><Shield className="w-3.5 h-3.5" /></button>
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-red-400 transition-colors" title="Suspend"><UserX className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-slate-700 flex items-center justify-between text-sm text-slate-400">
          <span>৪টি দেখাচ্ছে (মোট ১২,৮৪৭)</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-amber-600 text-white rounded-lg">১</button>
            <button className="px-3 py-1.5 bg-slate-700 rounded-lg hover:bg-slate-600">পরে →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
