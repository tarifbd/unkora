"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl mb-6">⚠️</div>
      <h2 className="font-serif text-3xl font-bold text-gray-800 mb-3 font-bangla">
        কিছু সমস্যা হয়েছে
      </h2>
      <p className="text-gray-500 mb-8 max-w-md font-bangla">
        দুঃখিত, একটি ত্রুটি ঘটেছে। পুনরায় চেষ্টা করুন বা হোমপেজে ফিরুন।
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors font-bangla"
        >
          পুনরায় চেষ্টা করুন
        </button>
        <Link
          href="/"
          className="px-6 py-3 border-2 border-gray-200 hover:border-primary-300 text-gray-700 font-semibold rounded-xl transition-colors font-bangla"
        >
          হোমপেজে ফিরুন
        </Link>
      </div>
      {process.env.NODE_ENV === "development" && (
        <pre className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl text-xs text-left text-red-700 max-w-xl overflow-auto">
          {error.message}
        </pre>
      )}
    </div>
  );
}
