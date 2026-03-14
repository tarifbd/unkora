import type { Metadata } from "next";
import { VendorShell } from "@/components/layout/VendorShell";
import { Store, CreditCard, Bell, Moon, Globe } from "lucide-react";

export const metadata: Metadata = { title: "সেটিংস" };

export default function VendorSettingsPage() {
  return (
    <VendorShell>
      <div className="max-w-2xl space-y-6">
        <h2 className="text-lg font-bold text-gray-800 font-bangla">সেটিংস</h2>

        {/* Shop info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Store className="w-4 h-4 text-primary-600" />
            <h3 className="font-semibold text-gray-800 font-bangla">শপের তথ্য</h3>
          </div>
          {[
            { label: "শপের নাম (বাংলা)", placeholder: "আপনার শপের নাম", defaultValue: "আমার শপ" },
            { label: "শপের নাম (English)", placeholder: "Shop name", defaultValue: "My Shop" },
            { label: "বিবরণ", placeholder: "শপ সম্পর্কে লিখুন...", defaultValue: "", multiline: true },
          ].map(({ label, placeholder, defaultValue, multiline }) => (
            <div key={label}>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 font-bangla">{label}</label>
              {multiline ? (
                <textarea rows={3} placeholder={placeholder} defaultValue={defaultValue} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none font-bangla" />
              ) : (
                <input type="text" placeholder={placeholder} defaultValue={defaultValue} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 font-bangla" />
              )}
            </div>
          ))}
          {/* Vacation mode */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700 font-bangla">ভ্যাকেশন মোড</p>
              <p className="text-xs text-gray-400 font-bangla">চালু করলে নতুন অর্ডার আসবে না</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
            </label>
          </div>
        </div>

        {/* Bank info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-primary-600" />
            <h3 className="font-semibold text-gray-800 font-bangla">ব্যাংকিং তথ্য</h3>
          </div>
          {[
            { label: "ব্যাংকের নাম", placeholder: "যেমন: Dutch Bangla Bank" },
            { label: "অ্যাকাউন্ট নম্বর", placeholder: "১২৩৪৫৬৭৮৯০" },
            { label: "অ্যাকাউন্টের নাম", placeholder: "আপনার নাম" },
            { label: "bKash নম্বর", placeholder: "+8801XXXXXXXXX" },
          ].map(({ label, placeholder }) => (
            <div key={label}>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 font-bangla">{label}</label>
              <input type="text" placeholder={placeholder} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 font-bangla" />
            </div>
          ))}
          <p className="text-xs text-gray-400 font-bangla">⚠️ ব্যাংকিং তথ্য পরিবর্তন করলে পুনরায় যাচাই প্রয়োজন হবে।</p>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-primary-600" />
            <h3 className="font-semibold text-gray-800 font-bangla">নোটিফিকেশন</h3>
          </div>
          {[
            { label: "নতুন অর্ডার SMS", checked: true },
            { label: "কম স্টক সতর্কতা", checked: true },
            { label: "পেআউট নোটিফিকেশন", checked: true },
            { label: "রিভিউ নোটিফিকেশন", checked: false },
            { label: "মার্কেটিং ইমেইল", checked: false },
          ].map(({ label, checked }) => (
            <div key={label} className="flex items-center justify-between py-1">
              <span className="text-sm text-gray-700 font-bangla">{label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={checked} className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600" />
              </label>
            </div>
          ))}
        </div>

        {/* Save button */}
        <button className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors font-bangla">
          সংরক্ষণ করুন
        </button>
      </div>
    </VendorShell>
  );
}
