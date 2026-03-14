import { ShieldCheck, Truck, RotateCcw, Headphones, Award, Zap } from "lucide-react";

const features = [
  { icon: ShieldCheck, title: "১০০% নিরাপদ পেমেন্ট", desc: "bKash, Nagad, SSLCommerz ও COD সাপোর্ট", color: "text-emerald-600 bg-emerald-50" },
  { icon: Truck, title: "দ্রুত ডেলিভারি", desc: "Pathao, Steadfast ও RedX কুরিয়ারে সারা বাংলাদেশে", color: "text-blue-600 bg-blue-50" },
  { icon: RotateCcw, title: "সহজ রিটার্ন পলিসি", desc: "৭ দিনের মধ্যে কোনো প্রশ্ন ছাড়াই রিটার্ন করুন", color: "text-orange-600 bg-orange-50" },
  { icon: Headphones, title: "২৪/৭ কাস্টমার সাপোর্ট", desc: "ফোন, ইমেইল ও লাইভ চ্যাটে সহায়তা পান", color: "text-purple-600 bg-purple-50" },
  { icon: Award, title: "মানসম্পন্ন পণ্য", desc: "সকল পণ্য যাচাই করা ও বিশ্বস্ত বিক্রেতাদের থেকে", color: "text-amber-600 bg-amber-50" },
  { icon: Zap, title: "লয়্যালটি পয়েন্ট", desc: "প্রতিটি কেনাকাটায় পয়েন্ট অর্জন করুন ও ছাড় পান", color: "text-red-600 bg-red-50" },
];

export function WhyUnkora() {
  return (
    <section className="py-12 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            কেন Unkora বেছে নেবেন?
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">বাংলাদেশের সেরা অনলাইন শপিং অভিজ্ঞতা</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="flex flex-col items-center text-center gap-3 p-4 rounded-2xl hover:bg-gray-50 transition-colors group">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800 font-bangla leading-snug">{title}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed hidden sm:block font-bangla">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
