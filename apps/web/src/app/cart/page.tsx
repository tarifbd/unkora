"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatBDT } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, discountAmount, couponCode } = useCartStore();

  const shipping = subtotal >= 99900 ? 0 : 6000; // free shipping over ৳999
  const total = subtotal - discountAmount + shipping;

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 flex flex-col items-center text-center">
        <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
        <h2 className="font-serif text-2xl font-bold text-gray-700 mb-2 font-bangla">কার্ট খালি</h2>
        <p className="text-gray-400 mb-6 font-bangla">কিছু পণ্য যোগ করুন</p>
        <Link href="/products" className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors font-bangla">
          শপিং শুরু করুন
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-serif text-2xl font-bold text-gray-800 mb-6 font-bangla">শপিং কার্ট ({items.length} পণ্য)</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Items */}
        <div className="flex-1 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-card">
              <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
                <Image src={item.image} alt={item.name_en} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-800 text-sm leading-snug line-clamp-2 font-bangla">{item.name_bn}</h3>
                <p className="text-primary-600 font-bold mt-1">{formatBDT(item.unit_price)}</p>
                <div className="flex items-center justify-between mt-2">
                  {/* Qty */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity + 1)} disabled={item.quantity >= item.stock_quantity} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 disabled:opacity-40">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-800">{formatBDT(item.unit_price * item.quantity)}</span>
                    <button onClick={() => removeItem(item.product_id, item.variant_id)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 sticky top-24">
            <h2 className="font-semibold text-gray-800 mb-4 font-bangla">অর্ডার সারসংক্ষেপ</h2>

            {/* Coupon */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="কুপন কোড"
                className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 font-bangla"
              />
              <button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors font-bangla">
                প্রয়োগ
              </button>
            </div>

            {/* Totals */}
            <div className="space-y-2.5 text-sm border-t border-gray-100 pt-4">
              <div className="flex justify-between text-gray-600">
                <span className="font-bangla">পণ্যের মোট দাম</span>
                <span className="font-medium">{formatBDT(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span className="font-bangla">ছাড় ({couponCode})</span>
                  <span className="font-medium">-{formatBDT(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span className="font-bangla">ডেলিভারি চার্জ</span>
                <span className={shipping === 0 ? "text-emerald-600 font-medium" : "font-medium"}>
                  {shipping === 0 ? "বিনামূল্যে" : formatBDT(shipping)}
                </span>
              </div>
              {subtotal < 99900 && (
                <p className="text-xs text-gray-400 font-bangla">
                  আরো {formatBDT(99900 - subtotal)} যোগ করলে ফ্রি ডেলিভারি!
                </p>
              )}
              <div className="flex justify-between font-bold text-gray-800 border-t border-gray-100 pt-2.5 text-base">
                <span className="font-bangla">মোট পরিমাণ</span>
                <span className="text-primary-700">{formatBDT(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="mt-5 flex w-full items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors font-bangla"
            >
              চেকআউট করুন
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link href="/products" className="mt-3 flex justify-center text-sm text-gray-400 hover:text-primary-600 font-bangla">
              ← শপিং চালিয়ে যান
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
