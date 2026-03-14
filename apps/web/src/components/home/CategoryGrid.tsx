import Link from "next/link";

const CATEGORIES = [
  { slug: "books",    name: "বই",                 name_en: "Books",    emoji: "📚", color: "bg-amber-50   border-amber-200 hover:border-amber-400 hover:bg-amber-100",  count: "৫০০০+" },
  { slug: "leather",  name: "লেদার পণ্য",         name_en: "Leather",  emoji: "👜", color: "bg-stone-50   border-stone-200 hover:border-stone-400 hover:bg-stone-100",  count: "২০০+" },
  { slug: "baby",     name: "বেবি প্রোডাক্ট",    name_en: "Baby",     emoji: "🍼", color: "bg-pink-50    border-pink-200  hover:border-pink-400  hover:bg-pink-100",   count: "৩০০+" },
  { slug: "islamic",  name: "ইসলামিক লাইফস্টাইল", name_en: "Islamic", emoji: "☪️", color: "bg-emerald-50 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100", count: "৪০০+" },
  { slug: "organic",  name: "অর্গানিক ফুড",       name_en: "Organic",  emoji: "🌿", color: "bg-lime-50    border-lime-200  hover:border-lime-400  hover:bg-lime-100",   count: "১৫০+" },
];

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.slug}
          href={`/category/${cat.slug}`}
          className={`group flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl border-2 transition-all duration-200 ${cat.color}`}
        >
          <span className="text-4xl sm:text-5xl mb-3 group-hover:scale-110 transition-transform duration-200">
            {cat.emoji}
          </span>
          <span className="font-semibold text-sm sm:text-base text-gray-800 text-center font-bangla leading-tight">
            {cat.name}
          </span>
          <span className="text-xs text-gray-400 mt-1">{cat.count} পণ্য</span>
        </Link>
      ))}
    </div>
  );
}
