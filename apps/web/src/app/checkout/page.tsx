"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { ordersApi, paymentsApi } from "@/lib/api";
import { formatBDT, cn } from "@/lib/utils";
import { toast } from "sonner";
import { Check, ChevronRight } from "lucide-react";

type Step = "address" | "delivery" | "payment" | "review";

const STEPS: { id: Step; label: string }[] = [
  { id: "address", label: "ঠিকানা" },
  { id: "delivery", label: "ডেলিভারি" },
  { id: "payment", label: "পেমেন্ট" },
  { id: "review", label: "নিশ্চিত করুন" },
];

const PAYMENT_METHODS = [
  { id: "BKASH", label: "bKash", emoji: "🟣", desc: "মোবাইল ব্যাংকিং" },
  { id: "NAGAD", label: "Nagad", emoji: "🟠", desc: "মোবাইল ব্যাংকিং" },
  { id: "SSLCOMMERZ", label: "কার্ড / নেট ব্যাংকিং", emoji: "💳", desc: "Visa, Mastercard, DBBL" },
  { id: "COD", label: "ক্যাশ অন ডেলিভারি", emoji: "💵", desc: "ডেলিভারির সময় টাকা দিন" },
];

const BD_DIVISIONS = ["ঢাকা", "চট্টগ্রাম", "সিলেট", "রাজশাহী", "খুলনা", "বরিশাল", "রংপুর", "ময়মনসিংহ"];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discountAmount, clearCart } = useCartStore();

  const [step, setStep] = useState<Step>("address");
  const [submitting, setSubmitting] = useState(false);

  const [address, setAddress] = useState({
    recipient_name: "", phone: "", division: "ঢাকা", district: "",
    upazila: "", street: "", postal_code: "",
  });
  const [deliveryMethod, setDeliveryMethod] = useState<"STANDARD" | "EXPRESS">("STANDARD");
  const [paymentMethod, setPaymentMethod] = useState("BKASH");
  const [notes, setNotes] = useState("");

  const shipping = subtotal >= 99900 ? 0 : (deliveryMethod === "EXPRESS" ? 15000 : 6000);
  const total = subtotal - discountAmount + shipping;

  const stepIdx = STEPS.findIndex((s) => s.id === step);

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    try {
      const order = await ordersApi.checkout({
        payment_method: paymentMethod,
        shipping_address_id: "temp", // would come from saved addresses
        delivery_method: deliveryMethod,
        notes,
      });

      if (paymentMethod !== "COD") {
        const payment = await paymentsApi.initiate(order.data.id as string, paymentMethod);
        if (payment.data?.payment_url) {
          window.location.href = payment.data.payment_url as string;
          return;
        }
      }

      clearCart();
      toast.success("অর্ডার সফলভাবে সম্পন্ন হয়েছে!");
      router.push(`/account/orders/${order.data.order_number as string}`);
    } catch {
      toast.error("অর্ডার দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-serif text-2xl font-bold text-gray-800 mb-6 font-bangla">চেকআউট</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-1">
        {STEPS.map(({ id, label }, i) => (
          <div key={id} className="flex items-center min-w-0">
            <button
              onClick={() => i < stepIdx && setStep(id)}
              disabled={i > stepIdx}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap",
                step === id ? "bg-primary-600 text-white" : i < stepIdx ? "bg-primary-50 text-primary-600 hover:bg-primary-100" : "text-gray-300 cursor-not-allowed"
              )}
            >
              <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0", step === id ? "bg-white text-primary-600" : i < stepIdx ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-400")}>
                {i < stepIdx ? <Check className="w-3 h-3" /> : i + 1}
              </span>
              {label}
            </button>
            {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300 mx-1 flex-shrink-0" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step content */}
        <div className="lg:col-span-2">
          {/* ADDRESS */}
          {step === "address" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 space-y-4">
              <h2 className="font-semibold text-gray-800 font-bangla">ডেলিভারি ঠিকানা</h2>
              {[
                { key: "recipient_name", label: "প্রাপকের নাম", type: "text" },
                { key: "phone", label: "মোবাইল নম্বর", type: "tel", placeholder: "+8801XXXXXXXXX" },
                { key: "street", label: "সড়ক / বাড়ি নম্বর", type: "text" },
                { key: "district", label: "জেলা", type: "text" },
                { key: "upazila", label: "উপজেলা / থানা", type: "text" },
                { key: "postal_code", label: "পোস্টাল কোড", type: "text" },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 font-bangla">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={address[key as keyof typeof address]}
                    onChange={(e) => setAddress((a) => ({ ...a, [key]: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 font-bangla"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 font-bangla">বিভাগ</label>
                <select
                  value={address.division}
                  onChange={(e) => setAddress((a) => ({ ...a, division: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 font-bangla"
                >
                  {BD_DIVISIONS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <button onClick={() => setStep("delivery")} className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors font-bangla">
                পরবর্তী: ডেলিভারি
              </button>
            </div>
          )}

          {/* DELIVERY */}
          {step === "delivery" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 space-y-4">
              <h2 className="font-semibold text-gray-800 font-bangla">ডেলিভারি পদ্ধতি</h2>
              {[
                { id: "STANDARD" as const, label: "স্ট্যান্ডার্ড ডেলিভারি", desc: "২-৪ কার্যদিবস", price: 6000, tag: "সাশ্রয়ী" },
                { id: "EXPRESS" as const, label: "এক্সপ্রেস ডেলিভারি", desc: "১-২ কার্যদিবস", price: 15000, tag: "দ্রুত" },
              ].map((opt) => (
                <label key={opt.id} className={cn("flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors", deliveryMethod === opt.id ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-gray-300")}>
                  <input type="radio" name="delivery" value={opt.id} checked={deliveryMethod === opt.id} onChange={() => setDeliveryMethod(opt.id)} className="text-primary-600" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800 font-bangla">{opt.label}</span>
                      <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">{opt.tag}</span>
                    </div>
                    <p className="text-sm text-gray-500 font-bangla">{opt.desc}</p>
                  </div>
                  <span className="font-bold text-gray-700">{subtotal >= 99900 ? "বিনামূল্যে" : formatBDT(opt.price)}</span>
                </label>
              ))}
              <div className="flex gap-3">
                <button onClick={() => setStep("address")} className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors font-bangla">পিছনে</button>
                <button onClick={() => setStep("payment")} className="flex-1 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors font-bangla">পরবর্তী: পেমেন্ট</button>
              </div>
            </div>
          )}

          {/* PAYMENT */}
          {step === "payment" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 space-y-4">
              <h2 className="font-semibold text-gray-800 font-bangla">পেমেন্ট পদ্ধতি</h2>
              {PAYMENT_METHODS.map((pm) => (
                <label key={pm.id} className={cn("flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors", paymentMethod === pm.id ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-gray-300")}>
                  <input type="radio" name="payment" value={pm.id} checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id)} className="text-primary-600" />
                  <span className="text-2xl">{pm.emoji}</span>
                  <div>
                    <p className="font-medium text-gray-800 font-bangla">{pm.label}</p>
                    <p className="text-xs text-gray-500 font-bangla">{pm.desc}</p>
                  </div>
                </label>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 font-bangla">অর্ডার নোট (ঐচ্ছিক)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="কোনো বিশেষ নির্দেশনা থাকলে লিখুন..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none font-bangla"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep("delivery")} className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors font-bangla">পিছনে</button>
                <button onClick={() => setStep("review")} className="flex-1 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors font-bangla">রিভিউ করুন</button>
              </div>
            </div>
          )}

          {/* REVIEW */}
          {step === "review" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 space-y-4">
              <h2 className="font-semibold text-gray-800 font-bangla">অর্ডার নিশ্চিত করুন</h2>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 font-bangla">{item.name_bn} × {item.quantity}</span>
                    <span className="font-medium">{formatBDT(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep("payment")} className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors font-bangla">পিছনে</button>
                <button
                  onClick={() => void handlePlaceOrder()}
                  disabled={submitting}
                  className="flex-1 py-3 bg-primary-600 disabled:opacity-70 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors font-bangla"
                >
                  {submitting ? "প্রসেস হচ্ছে..." : "অর্ডার দিন"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 sticky top-24">
            <h3 className="font-semibold text-gray-800 mb-3 font-bangla">মোট সারসংক্ষেপ</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span className="font-bangla">সাবটোটাল</span><span>{formatBDT(subtotal)}</span></div>
              {discountAmount > 0 && <div className="flex justify-between text-emerald-600"><span className="font-bangla">ছাড়</span><span>-{formatBDT(discountAmount)}</span></div>}
              <div className="flex justify-between text-gray-600"><span className="font-bangla">ডেলিভারি</span><span>{shipping === 0 ? "বিনামূল্যে" : formatBDT(shipping)}</span></div>
              <div className="flex justify-between font-bold text-gray-800 border-t border-gray-100 pt-2"><span className="font-bangla">মোট</span><span className="text-primary-700">{formatBDT(total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
