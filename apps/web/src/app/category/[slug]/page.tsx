import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductsGrid } from "@/components/product/ProductsGrid";
import { ProductFilters } from "@/components/product/ProductFilters";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string>>;
}

const CATEGORY_MAP: Record<string, { name: string; name_en: string; emoji: string; desc: string }> = {
  books:    { name: "বই", name_en: "Books",    emoji: "📚", desc: "বাংলা, ইসলামিক ও ইংরেজি বইয়ের বিশাল সংগ্রহ" },
  leather:  { name: "লেদার পণ্য", name_en: "Leather", emoji: "👜", desc: "হ্যান্ডক্রাফটেড চামড়ার ওয়ালেট, ব্যাগ ও বেল্ট" },
  baby:     { name: "বেবি প্রোডাক্ট", name_en: "Baby Products", emoji: "🍼", desc: "শিশুর জন্য নিরাপদ ও মানসম্পন্ন পণ্য" },
  islamic:  { name: "ইসলামিক লাইফস্টাইল", name_en: "Islamic Lifestyle", emoji: "☪️", desc: "জায়নামায, তাসবিহ, আতর ও ইসলামিক পণ্য" },
  organic:  { name: "অর্গানিক ফুড", name_en: "Organic Food", emoji: "🌿", desc: "খাঁটি মধু, দেশি ঘি ও প্রাকৃতিক খাবার" },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = CATEGORY_MAP[slug];
  if (!cat) return { title: "ক্যাটাগরি পাওয়া যায়নি" };
  return { title: cat.name, description: cat.desc };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const cat = CATEGORY_MAP[slug];
  if (!cat) notFound();

  return (
    <div>
      {/* Category hero */}
      <div className="bg-gradient-to-r from-primary-700 to-amber-600 py-10 px-4 text-white text-center">
        <div className="text-5xl mb-3">{cat.emoji}</div>
        <h1 className="font-serif text-3xl font-bold mb-2 font-bangla">{cat.name}</h1>
        <p className="text-white/80 text-sm font-bangla">{cat.desc}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-60 flex-shrink-0"><ProductFilters /></aside>
          <main className="flex-1 min-w-0">
            <ProductsGrid params={{ ...sp, category: slug }} />
          </main>
        </div>
      </div>
    </div>
  );
}
