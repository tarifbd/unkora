import type { Metadata } from "next";
import { VendorShell } from "@/components/layout/VendorShell";
import { DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react";

export const metadata: Metadata = { title: "আয় ও পেআউট" };

const PAYOUTS = [
  { id: "1", period: "১–৭ মার্চ ২০২৫", gross: "৳8,450", commission: "৳845 (10%)", net: "৳7,605", status: "PAID", paid_at: "১০ মার্চ" },
  { id: "2", period: "৮–১৪ মার্চ ২০২৫", gross: "৳12,300", commission: "৳1,230 (10%)", net: "৳11,070", status: "PAID", paid_at: "১৭ মার্চ" },
  { id: "3", period: "১৫–২১ মার্চ ২০২৫", gross: "৳9,800", commission: "৳980 (10%)", net: "৳8,820", status: "PROCESSING", paid_at: "—" },
  { id: "4", period: "২২–২৮ মার্চ ২০২৫", gross: "৳6,200", commission: "৳620 (10%)", net: "৳5,580", status: "PENDING", paid_at: "—" },
];

export default function VendorEarningsPage() {
  return (
    <VendorShell>
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-gray-800 font-bangla">আয় ও পেআউট</h2>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "মোট আয় (এই মাস)", value: "৳36,750", icon: DollarSign, color: "bg-emerald-500", sub: "গ্রস" },
            { label: "নেট আয়", value: "৳33,075", icon: DollarSign, color: "bg-primary-600", sub: "কমিশন বাদে" },
            { label: "পেন্ডিং পেআউট", value: "৳14,400", icon: Clock, color: "bg-amber-500", sub: "পরবর্তী রবিবার" },
            { label: "মোট পরিশোধিত", value: "৳1,84,250", icon: CheckCircle, color: "bg-blue-500", sub: "সব সময়" },
          ].map(({ label, value, icon: Icon, color, sub }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-bangla">{label}</p>
                  <p className="text-xl font-bold text-gray-800 mt-1">{value}</p>
                  <p className="text-[10px] text-gray-400 font-bangla mt-0.5">{sub}</p>
                </div>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Commission breakdown */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <h3 className="font-semibold text-blue-800 text-sm font-bangla mb-2">কমিশন কাঠামো</h3>
          <div className="grid grid-cols-3 gap-4 text-xs font-bangla">
            <div><p className="text-blue-600 font-medium">গ্রস বিক্রয়</p><p className="text-blue-800 font-bold mt-0.5">৳36,750</p></div>
            <div><p className="text-blue-600 font-medium">Unkora কমিশন (10%)</p><p className="text-blue-800 font-bold mt-0.5">৳3,675</p></div>
            <div><p className="text-blue-600 font-medium">গেটওয়ে ফি (2%)</p><p className="text-blue-800 font-bold mt-0.5">৳735</p></div>
          </div>
        </div>

        {/* Payout table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 font-bangla">পেআউট ইতিহাস</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["পিরিয়ড", "গ্রস", "কমিশন", "নেট পেআউট", "স্ট্যাটাস", "পরিশোধিত"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 font-bangla">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {PAYOUTS.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700 font-bangla text-xs">{p.period}</td>
                  <td className="px-4 py-3 font-bold text-gray-800">{p.gross}</td>
                  <td className="px-4 py-3 text-red-500 text-xs">{p.commission}</td>
                  <td className="px-4 py-3 font-bold text-emerald-600">{p.net}</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium w-fit ${
                      p.status === "PAID" ? "bg-emerald-100 text-emerald-700" :
                      p.status === "PROCESSING" ? "bg-blue-100 text-blue-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {p.status === "PAID" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-bangla">{p.paid_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Withdrawal request */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 font-bangla mb-4">পেআউট অনুরোধ</h3>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1.5 font-bangla">পরিমাণ (ন্যূনতম ৳500)</label>
              <input type="number" placeholder="0" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1.5 font-bangla">পেমেন্ট পদ্ধতি</label>
              <select className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 font-bangla">
                <option>bKash</option>
                <option>ব্যাংক ট্রান্সফার</option>
              </select>
            </div>
            <button className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors font-bangla">
              অনুরোধ করুন
            </button>
          </div>
        </div>
      </div>
    </VendorShell>
  );
}
