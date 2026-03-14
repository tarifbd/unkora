import type { Metadata } from "next";
import { SearchResults } from "@/components/product/SearchResults";

interface Props {
  searchParams: Promise<{ q?: string; page?: string; category?: string; sort?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `"${q}" — অনুসন্ধান ফলাফল` : "অনুসন্ধান",
    description: q ? `"${q}" এর জন্য Unkora-তে অনুসন্ধান করুন` : "Unkora-তে পণ্য খুঁজুন",
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q ?? "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {q ? (
        <>
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-gray-800 font-bangla">
              &ldquo;<span className="text-primary-600">{q}</span>&rdquo; এর ফলাফল
            </h1>
          </div>
          <SearchResults query={q} params={params} />
        </>
      ) : (
        <div className="flex flex-col items-center py-20 text-center">
          <span className="text-6xl mb-4">🔍</span>
          <h2 className="font-serif text-2xl font-bold text-gray-700 mb-2 font-bangla">কী খুঁজছেন?</h2>
          <p className="text-gray-400 font-bangla">উপরের সার্চ বারে লিখুন</p>
        </div>
      )}
    </div>
  );
}
