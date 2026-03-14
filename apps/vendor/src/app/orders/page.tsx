import type { Metadata } from "next";
import { VendorShell } from "@/components/layout/VendorShell";
import { Search, Filter } from "lucide-react";

export const metadata: Metadata = { title: "অর্ডার" };

const ORDERS = [
  { id: "1", number: "UNK-20250314-A1B2C3", customer: "রহিম সাহেব", items: "রিয়াযুস সালেহীন × ২", amount: "৳900", status: "CONFIRMED", payment: "bKash", date: "আজ ১০:৩২" },
  { id: "2", number: "UNK-20250313-D4E5F6", customer: "করিম মিয়া", items: "চামড়ার মানিব্যাগ × ১", amount: "৳950", status: "PACKED", payment: "COD", date: "গতকাল ১৫:১৪" },
  { id: "3", number: "UNK-20250313-G7H8I9", customer: "সালমা বেগম", items: "সিদর মধু × ১, জায়নামায × ১", amount: "৳1,570", status: "SHIPPED", payment: "SSLCommerz", date: "গতকাল ০৯:০৫" },
  { id: "4", number: "UNK-20250312-J0K1L2", customer: "আবু সায়েম", items: "বেবি বোতল × ৩", amount: "৳1,950", status: "DELIVERED", payment: "Nagad", date: "২ দিন আগে" },
];

const STATUS_STYLE: Record<string, string> = {
  CONFIRMED: "bg-blue-100 text-blue-700",
  PACKED: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-amber-100 text-amber-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function VendorOrdersPage() {
  return (
    <VendorShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800 font-bangla">আমার অর্ডার</h2>
            <p className="text-xs text-gray-500 font-bangla mt-0.5">{ORDERS.length}টি অর্ডার</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="search" placeholder="অর্ডার নং বা কাস্টমার খুঁজুন" className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 font-bangla" />
          </div>
          <select className="text-sm border border-gray-200 rounded-xl px-3 py-2 font-bangla focus:outline-none">
            <option>সব স্ট্যাটাস</option>
            <option>CONFIRMED</option><option>PACKED</option>
            <option>SHIPPED</option><option>DELIVERED</option>
          </select>
          <select className="text-sm border border-gray-200 rounded-xl px-3 py-2 font-bangla focus:outline-none">
            <option>সব পেমেন্ট</option>
            <option>bKash</option><option>Nagad</option>
            <option>SSLCommerz</option><option>COD</option>
          </select>
        </div>

        {/* Stats pills */}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "পেন্ডিং প্যাক", count: 7, color: "bg-yellow-100 text-yellow-700" },
            { label: "শিপমেন্ট বাকি", count: 3, color: "bg-indigo-100 text-indigo-700" },
            { label: "ডেলিভারি চলছে", count: 12, color: "bg-purple-100 text-purple-700" },
            { label: "আজ ডেলিভারড", count: 8, color: "bg-emerald-100 text-emerald-700" },
          ].map(({ label, count, color }) => (
            <span key={label} className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${color} font-bangla`}>
              {label}: {count}
            </span>
          ))}
        </div>

        {/* Orders table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["অর্ডার নং", "কাস্টমার", "পণ্য", "মোট", "পেমেন্ট", "স্ট্যাটাস", "তারিখ", "অ্যাকশন"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 font-bangla">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ORDERS.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs font-mono text-primary-600">{o.number}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 font-bangla">{o.customer}</td>
                  <td className="px-4 py-3 text-gray-500 font-bangla text-xs max-w-[160px] truncate">{o.items}</td>
                  <td className="px-4 py-3 font-bold text-gray-800">{o.amount}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{o.payment}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[o.status] ?? "bg-gray-100 text-gray-500"}`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-bangla">{o.date}</td>
                  <td className="px-4 py-3">
                    <button className="px-3 py-1 text-xs text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 font-bangla">বিস্তারিত</button>
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
