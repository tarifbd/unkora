import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl mb-6">🔍</div>
      <h1 className="font-serif text-4xl font-bold text-gray-800 mb-3 font-bangla">পৃষ্ঠা পাওয়া যায়নি</h1>
      <p className="text-gray-500 mb-8 max-w-md font-bangla">
        আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি হয়তো সরিয়ে নেওয়া হয়েছে বা আর পাওয়া যাচ্ছে না।
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Link
          href="/"
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors font-bangla"
        >
          হোমপেজে ফিরুন
        </Link>
        <Link
          href="/products"
          className="px-6 py-3 border-2 border-gray-200 hover:border-primary-300 text-gray-700 font-semibold rounded-xl transition-colors font-bangla"
        >
          পণ্য দেখুন
        </Link>
      </div>
    </div>
  );
}
