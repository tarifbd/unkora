import type { Metadata } from "next";
import { VendorShell } from "@/components/layout/VendorShell";
import { TrendingUp, ShoppingBag, Star, DollarSign, Package, AlertTriangle } from "lucide-react";

export const metadata: Metadata = { title: "ড্যাশবোর্ড" };

function Kpi({ title, value, sub, icon: Icon, color }: { title: string; value: string; sub: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1 font-bangla">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-xs text-gray-400 mt-1 font-bangla">{sub}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function VendorDashboard() {
  return (
    <VendorShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 font-bangla">স্বাগতম! আপনার শপের সারসংক্ষেপ</h2>
          <p className="text-sm text-gray-500 mt-0.5 font-bangla">আজ, {new Date().toLocaleDateString("bn-BD")}</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Kpi title="এই মাসের আয়" value="৳12,450" sub="+18% গত মাসের চেয়ে" icon={TrendingUp} color="bg-emerald-500" />
          <Kpi title="মোট অর্ডার" value="87" sub="৭ পেন্ডিং" icon={ShoppingBag} color="bg-blue-500" />
          <Kpi title="মোট পণ্য" value="34" sub="3 ড্রাফটে" icon={Package} color="bg-purple-500" />
          <Kpi title="গড় রেটিং" value="4.7★" sub="১২৩ রিভিউ" icon={Star} color="bg-amber-500" />
          <Kpi title="পেন্ডিং পেআউট" value="৳3,200" sub="পরবর্তী: রবিবার" icon={DollarSign} color="bg-primary-600" />
          <Kpi title="কম স্টক" value="4" sub="আপডেট করুন" icon={AlertTriangle} color="bg-red-500" />
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 font-bangla">সাম্প্রতিক অর্ডার</h3>
            <a href="/orders" className="text-xs text-primary-600 hover:text-primary-700 font-bangla">সব দেখুন →</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  {["অর্ডার নং", "পণ্য", "পরিমাণ", "স্ট্যাটাস", "তারিখ"].map((h) => (
                    <th key={h} className="pb-3 font-medium text-gray-500 text-xs font-bangla">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { num: "UNK-20250314-A1B2C3", product: "রিয়াযুস সালেহীন", amount: "৳450", status: "CONFIRMED", date: "আজ" },
                  { num: "UNK-20250313-D4E5F6", product: "চামড়ার মানিব্যাগ", amount: "৳950", status: "SHIPPED", date: "গতকাল" },
                  { num: "UNK-20250312-G7H8I9", product: "সিদর মধু ৫০০গ্রা", amount: "৳850", status: "DELIVERED", date: "২ দিন আগে" },
                ].map((o) => (
                  <tr key={o.num} className="hover:bg-gray-50">
                    <td className="py-3 text-xs font-mono text-primary-600">{o.num}</td>
                    <td className="py-3 font-bangla">{o.product}</td>
                    <td className="py-3 font-bold text-gray-800">{o.amount}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        o.status === "DELIVERED" ? "bg-emerald-100 text-emerald-700" :
                        o.status === "SHIPPED" ? "bg-blue-100 text-blue-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>{o.status}</span>
                    </td>
                    <td className="py-3 text-gray-400 text-xs font-bangla">{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low stock alert */}
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700 font-bangla text-sm">স্টক কম সতর্কতা</p>
              <p className="text-xs text-red-500 font-bangla mt-0.5">৪টি পণ্যের স্টক ১০-এর নিচে। এখনই আপডেট করুন।</p>
              <a href="/products?filter=low_stock" className="text-xs font-medium text-red-600 hover:text-red-700 mt-2 inline-block font-bangla">পণ্য আপডেট করুন →</a>
            </div>
          </div>
        </div>
      </div>
    </VendorShell>
  );
}
