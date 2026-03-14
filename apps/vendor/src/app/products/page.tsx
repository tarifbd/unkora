import type { Metadata } from "next";
import { VendorShell } from "@/components/layout/VendorShell";
import { Plus, Search, Edit, Eye, Trash2 } from "lucide-react";

export const metadata: Metadata = { title: "পণ্য" };

const MOCK_PRODUCTS = [
  { id: "1", name: "রিয়াযুস সালেহীন", sku: "BOO-RYZ-001", price: "৳450", stock: 48, status: "PUBLISHED", sales: 234 },
  { id: "2", name: "সিদর মধু ৫০০গ্রাম", sku: "ORG-HON-001", price: "৳850", stock: 12, status: "PUBLISHED", sales: 156 },
  { id: "3", name: "চামড়ার মানিব্যাগ", sku: "LEA-WAL-001", price: "৳950", stock: 7, status: "PUBLISHED", sales: 89 },
  { id: "4", name: "প্রিমিয়াম জায়নামায", sku: "ISL-MAT-001", price: "৳720", stock: 0, status: "PUBLISHED", sales: 143 },
  { id: "5", name: "নতুন পণ্য ড্রাফট", sku: "BAB-TOY-001", price: "৳350", stock: 30, status: "DRAFT", sales: 0 },
];

export default function VendorProductsPage() {
  return (
    <VendorShell>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800 font-bangla">আমার পণ্য</h2>
            <p className="text-xs text-gray-500 font-bangla mt-0.5">{MOCK_PRODUCTS.length}টি পণ্য</p>
          </div>
          <a href="/products/new" className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-colors font-bangla">
            <Plus className="w-4 h-4" /> নতুন পণ্য
          </a>
        </div>

        {/* Search + filters */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="search" placeholder="পণ্য খুঁজুন..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 font-bangla" />
          </div>
          <select className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300 font-bangla">
            <option>সব স্ট্যাটাস</option>
            <option>PUBLISHED</option>
            <option>DRAFT</option>
            <option>PENDING_REVIEW</option>
          </select>
        </div>

        {/* Products table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["পণ্যের নাম", "SKU", "দাম", "স্টক", "বিক্রি", "স্ট্যাটাস", "অ্যাকশন"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 text-xs font-bangla">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_PRODUCTS.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800 font-bangla">{p.name}</td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-400">{p.sku}</td>
                  <td className="px-4 py-3 font-bold text-primary-700">{p.price}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${p.stock === 0 ? "text-red-500" : p.stock < 10 ? "text-orange-500" : "text-gray-700"}`}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.sales}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" :
                      p.status === "DRAFT" ? "bg-gray-100 text-gray-500" :
                      "bg-yellow-100 text-yellow-700"
                    } font-bangla`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="w-7 h-7 rounded-lg hover:bg-blue-50 text-blue-500 flex items-center justify-center" title="Edit"><Edit className="w-3.5 h-3.5" /></button>
                      <button className="w-7 h-7 rounded-lg hover:bg-gray-100 text-gray-400 flex items-center justify-center" title="Preview"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="w-7 h-7 rounded-lg hover:bg-red-50 text-red-400 flex items-center justify-center" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </VendorShell>
  );
}
