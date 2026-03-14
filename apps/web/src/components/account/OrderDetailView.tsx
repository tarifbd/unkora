"use client";

import Link from "next/link";
import { formatBDT, cn } from "@/lib/utils";
import { Package, Truck, CheckCircle, Clock, XCircle, MapPin, CreditCard } from "lucide-react";

const STATUS_STEPS = [
  { key: "PENDING",            label: "অর্ডার গ্রহণ",      icon: Clock },
  { key: "CONFIRMED",          label: "নিশ্চিত",           icon: CheckCircle },
  { key: "PROCESSING",         label: "প্রক্রিয়াকরণ",      icon: Package },
  { key: "HANDED_TO_COURIER",  label: "কুরিয়ারে",          icon: Truck },
  { key: "DELIVERED",          label: "ডেলিভারি",           icon: CheckCircle },
];

const STATUS_ORDER = ["PENDING","CONFIRMED","PROCESSING","PACKED","HANDED_TO_COURIER","SHIPPED","OUT_FOR_DELIVERY","DELIVERED"];

interface Order {
  order_number: string;
  status: string;
  total_amount: number;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  payment_method: string;
  payment_status: string;
  delivery_method: string;
  shipping_address: Record<string, string>;
  created_at: string;
  tracking_number?: string | null;
  courier?: string | null;
  items: { id: string; product_name_bn: string; product_name_en: string; quantity: number; unit_price: number; total_price: number; product_image: string }[];
  status_history: { status: string; note?: string | null; timestamp: string }[];
  delivery?: { tracking_url?: string | null; status: string; expected_delivery_date?: string | null } | null;
}

export function OrderDetailView({ order }: { order: Record<string, unknown> }) {
  const o = order as unknown as Order;
  const currentStepIdx = STATUS_ORDER.indexOf(o.status);
  const isCancelled = ["CANCELLED", "RETURN_REQUESTED", "RETURN_APPROVED", "REFUNDED"].includes(o.status);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/account" className="hover:text-primary-600">অ্যাকাউন্ট</Link>
        <span>/</span>
        <Link href="/account" className="hover:text-primary-600">অর্ডার</Link>
        <span>/</span>
        <span className="text-gray-700 font-mono">{o.order_number}</span>
      </nav>

      {/* Status banner */}
      <div className={cn(
        "rounded-2xl p-4 mb-6 flex items-center gap-3",
        isCancelled ? "bg-red-50 border border-red-100" :
        o.status === "DELIVERED" ? "bg-emerald-50 border border-emerald-100" :
        "bg-primary-50 border border-primary-100"
      )}>
        {isCancelled ? (
          <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
        ) : o.status === "DELIVERED" ? (
          <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
        ) : (
          <Clock className="w-6 h-6 text-primary-600 flex-shrink-0 animate-pulse" />
        )}
        <div>
          <p className={cn("font-semibold font-bangla", isCancelled ? "text-red-700" : o.status === "DELIVERED" ? "text-emerald-700" : "text-primary-700")}>
            {isCancelled ? "অর্ডার বাতিল" : o.status === "DELIVERED" ? "ডেলিভারি সম্পন্ন" : "অর্ডার প্রক্রিয়াধীন"}
          </p>
          {o.delivery?.expected_delivery_date && !isCancelled && o.status !== "DELIVERED" && (
            <p className="text-sm text-gray-500 font-bangla">
              আনুমানিক ডেলিভারি: {new Date(o.delivery.expected_delivery_date).toLocaleDateString("bn-BD")}
            </p>
          )}
        </div>
        {o.delivery?.tracking_url && (
          <a href={o.delivery.tracking_url} target="_blank" rel="noopener noreferrer"
            className="ml-auto text-sm text-primary-600 hover:text-primary-700 font-bangla font-medium">
            ট্র্যাক করুন →
          </a>
        )}
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 mb-5">
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-100 mx-8 z-0" />
            <div
              className="absolute left-8 top-5 h-0.5 bg-primary-500 z-0 transition-all duration-700"
              style={{ width: `calc(${Math.max(0, (currentStepIdx / (STATUS_STEPS.length - 1))) * 100}% - 4rem)` }}
            />
            {STATUS_STEPS.map(({ key, label, icon: Icon }, i) => {
              const done = STATUS_ORDER.indexOf(o.status) >= STATUS_ORDER.indexOf(key);
              const active = key === o.status;
              return (
                <div key={key} className="flex flex-col items-center gap-2 z-10 flex-1">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                    done ? "bg-primary-600 border-primary-600" :
                    active ? "bg-white border-primary-400 shadow-md shadow-primary-100" :
                    "bg-white border-gray-200"
                  )}>
                    <Icon className={cn("w-4 h-4", done ? "text-white" : active ? "text-primary-500" : "text-gray-300")} />
                  </div>
                  <span className={cn("text-[10px] text-center font-bangla leading-tight", done ? "text-primary-600 font-medium" : "text-gray-400")}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {/* Order info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm font-bangla">অর্ডার তথ্য</h3>
          <dl className="space-y-2 text-sm">
            {[
              { label: "অর্ডার নং", value: <span className="font-mono text-xs">{o.order_number}</span> },
              { label: "তারিখ", value: new Date(o.created_at).toLocaleDateString("bn-BD") },
              { label: "ডেলিভারি", value: o.delivery_method === "EXPRESS" ? "এক্সপ্রেস" : "স্ট্যান্ডার্ড" },
              ...(o.tracking_number ? [{ label: "ট্র্যাকিং", value: <span className="font-mono text-xs">{o.tracking_number}</span> }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <dt className="text-gray-500 font-bangla">{label}</dt>
                <dd className="font-medium text-gray-800">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Shipping address */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm font-bangla flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary-500" /> ডেলিভারি ঠিকানা
          </h3>
          <div className="text-sm space-y-0.5 font-bangla text-gray-600">
            <p className="font-semibold text-gray-800">{o.shipping_address["recipient_name"]}</p>
            <p>{o.shipping_address["phone"]}</p>
            <p>{o.shipping_address["street"]}</p>
            <p>{o.shipping_address["upazila"]}, {o.shipping_address["district"]}</p>
            <p>{o.shipping_address["division"]}</p>
          </div>
        </div>
      </div>

      {/* Order items */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 mb-5">
        <h3 className="font-semibold text-gray-800 mb-4 font-bangla">অর্ডারকৃত পণ্য</h3>
        <div className="space-y-3">
          {o.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                {item.product_name_bn[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 font-bangla truncate">{item.product_name_bn}</p>
                <p className="text-xs text-gray-400 font-bangla">পরিমাণ: {item.quantity}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-800">{formatBDT(item.total_price)}</p>
                <p className="text-xs text-gray-400">{formatBDT(item.unit_price)} × {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
          <div className="flex justify-between text-gray-500">
            <span className="font-bangla">সাবটোটাল</span><span>{formatBDT(o.subtotal)}</span>
          </div>
          {o.discount_amount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span className="font-bangla">ছাড়</span><span>-{formatBDT(o.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-500">
            <span className="font-bangla">ডেলিভারি</span>
            <span>{o.shipping_cost === 0 ? "বিনামূল্যে" : formatBDT(o.shipping_cost)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-800 text-base pt-2 border-t border-gray-100">
            <span className="font-bangla">মোট</span>
            <span className="text-primary-700">{formatBDT(o.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Payment info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 mb-5">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm font-bangla flex items-center gap-1.5">
          <CreditCard className="w-4 h-4 text-primary-500" /> পেমেন্ট তথ্য
        </h3>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">{o.payment_method === "BKASH" ? "🟣" : o.payment_method === "NAGAD" ? "🟠" : o.payment_method === "COD" ? "💵" : "💳"}</span>
            <span className="font-medium text-gray-700">{o.payment_method}</span>
          </div>
          <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", o.payment_status === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700")}>
            {o.payment_status === "PAID" ? "পরিশোধিত" : "অপরিশোধিত"}
          </span>
        </div>
      </div>

      {/* Status history */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
        <h3 className="font-semibold text-gray-800 mb-4 font-bangla">অর্ডার ইতিহাস</h3>
        <div className="space-y-3">
          {o.status_history.slice().reverse().map((h, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-primary-500 flex-shrink-0 mt-1" />
                {i < o.status_history.length - 1 && <div className="w-0.5 bg-gray-100 flex-1 mt-1" />}
              </div>
              <div className="pb-3">
                <p className="text-sm font-medium text-gray-800">{h.status}</p>
                {h.note && <p className="text-xs text-gray-500 font-bangla">{h.note}</p>}
                <p className="text-xs text-gray-400 mt-0.5">{new Date(h.timestamp).toLocaleString("bn-BD")}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
