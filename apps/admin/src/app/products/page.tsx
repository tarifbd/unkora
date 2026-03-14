import type { Metadata } from "next";
import { Plus, Search, Edit, Eye, Trash2, Upload, Package } from "lucide-react";

export const metadata: Metadata = { title: "পণ্য ম্যানেজমেন্ট" };

const PRODUCTS = [
  { id:"1", name:"রিয়াযুস সালেহীন", sku:"BOO-RYZ-001", category:"বই", vendor:"ইসলামিক পাবলিশার", price:"৳450", stock:48, status:"PUBLISHED", sales:234, rating:4.8 },
  { id:"2", name:"প্রিমিয়াম চামড়ার মানিব্যাগ", sku:"LEA-WAL-001", category:"লেদার", vendor:"বাংলাদেশ লেদার", price:"৳950", stock:25, status:"PUBLISHED", sales:187, rating:4.6 },
  { id:"3", name:"খাঁটি সিদর মধু ৫০০গ্রাম", sku:"ORG-HON-001", category:"অর্গানিক", vendor:"হানি ফার্ম", price:"৳850", stock:12, status:"PUBLISHED", sales:156, rating:4.8 },
  { id:"4", name:"প্রিমিয়াম জায়নামায", sku:"ISL-MAT-001", category:"ইসলামিক", vendor:"ইসলামিক শপ", price:"৳720", stock:0, status:"PUBLISHED", sales:143, rating:4.9 },
  { id:"5", name:"নতুন বইয়ের ড্রাফট", sku:"BOO-NEW-001", category:"বই", vendor:"নতুন প্রকাশনী", price:"৳350", stock:50, status:"PENDING_REVIEW", sales:0, rating:0 },
];

const STATUS_STYLE: Record<string, string> = {
  PUBLISHED: "bg-emerald-500/20 text-emerald-400",
  DRAFT: "bg-slate-500/20 text-slate-400",
  PENDING_REVIEW: "bg-yellow-500/20 text-yellow-400",
  ARCHIVED: "bg-red-500/20 text-red-400",
};

export default function AdminProductsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">পণ্য ম্যানেজমেন্ট</h1>
          <p className="text-sm text-slate-400 mt-0.5">সকল পণ্য পরিচালনা করুন</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded-xl transition-colors">
            <Upload className="w-4 h-4" /> CSV আমদানি
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> নতুন পণ্য
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "মোট পণ্য", value: "234", icon: Package },
          { label: "পাবলিশড", value: "198" },
          { label: "রিভিউ অপেক্ষায়", value: "12" },
          { label: "স্টক শেষ", value: "8", alert: true },
        ].map(({ label, value, alert }) => (
          <div key={label} className="bg-slate-800 border border-slate-700 rounded-xl p-3">
            <p className="text-xs text-slate-400">{label}</p>
            <p className={`text-xl font-bold mt-0.5 ${alert ? "text-red-400" : "text-white"}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="search" placeholder="পণ্য নাম বা SKU..." className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
        </div>
        <select className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none">
          <option>সব ক্যাটাগরি</option>
          <option>বই</option>
          <option>লেদার</option>
          <option>বেবি</option>
          <option>ইসলামিক</option>
          <option>অর্গানিক</option>
        </select>
        <select className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none">
          <option>সব স্ট্যাটাস</option>
          <option>PUBLISHED</option>
          <option>DRAFT</option>
          <option>PENDING_REVIEW</option>
        </select>
      </div>

      {/* Products table */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-700/50 border-b border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left"><input type="checkbox" className="rounded border-slate-600 bg-slate-700" /></th>
                {["পণ্যের নাম", "SKU", "ক্যাটাগরি", "ভেন্ডর", "দাম", "স্টক", "বিক্রয়", "রেটিং", "স্ট্যাটাস", "অ্যাকশন"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {PRODUCTS.map(p => (
                <tr key={p.id} className="hover:bg-slate-700/30 transition-colors group">
                  <td className="px-4 py-3"><input type="checkbox" className="rounded border-slate-600 bg-slate-700" /></td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-200">{p.name}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{p.sku}</td>
                  <td className="px-4 py-3 text-slate-400">{p.category}</td>
                  <td className="px-4 py-3 text-xs text-slate-400 max-w-[120px] truncate">{p.vendor}</td>
                  <td className="px-4 py-3 font-bold text-amber-400">{p.price}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${p.stock === 0 ? "text-red-400" : p.stock < 15 ? "text-orange-400" : "text-slate-300"}`}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{p.sales}</td>
                  <td className="px-4 py-3 text-amber-400">{p.rating > 0 ? `${p.rating}★` : "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[p.status] ?? "bg-slate-700 text-slate-300"}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors" title="Edit"><Edit className="w-3.5 h-3.5" /></button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-600 text-slate-400 transition-colors" title="Preview"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-red-400 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-slate-700 flex items-center justify-between text-sm text-slate-400">
          <span>৫টি দেখাচ্ছে (মোট ২৩৪)</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors" disabled>← আগে</button>
            <button className="px-3 py-1.5 bg-amber-600 text-white rounded-lg">১</button>
            <button className="px-3 py-1.5 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">পরে →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
