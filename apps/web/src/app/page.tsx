import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { FlashSaleSection } from "@/components/home/FlashSaleSection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { WhyUnkora } from "@/components/home/WhyUnkora";

export const metadata: Metadata = {
  title: "Unkora — আপনার বিশ্বস্ত অনলাইন শপ",
};

export const revalidate = 300;

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FlashSaleSection />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="font-serif text-2xl font-bold text-gray-800 mb-6">ক্যাটাগরি অনুযায়ী শপিং করুন</h2>
        <CategoryGrid />
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-bold text-gray-800">বিশেষ পণ্য সমূহ</h2>
          <a href="/products?is_featured=true" className="text-sm font-medium text-primary-600 hover:text-primary-700">সব দেখুন →</a>
        </div>
        <FeaturedProducts />
      </section>
      <WhyUnkora />
    </div>
  );
}
