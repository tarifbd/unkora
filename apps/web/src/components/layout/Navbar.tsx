"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart, Search, User, Menu, X, ChevronDown,
  Heart, Bell, Globe, Sun, Moon, Zap,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const categories = [
  {
    name: "বই", name_en: "Books", slug: "books",
    icon: "📚",
    sub: [
      { name: "বাংলা বই", slug: "bangla-books" },
      { name: "ইসলামিক বই", slug: "islamic-books" },
      { name: "ইংরেজি বই", slug: "english-books" },
      { name: "আরবি বই", slug: "arabic-books" },
      { name: "শিশু বই", slug: "children-books" },
    ],
  },
  {
    name: "লেদার পণ্য", name_en: "Leather", slug: "leather",
    icon: "👜",
    sub: [
      { name: "ওয়ালেট", slug: "wallets" },
      { name: "ব্যাগ", slug: "bags" },
      { name: "বেল্ট", slug: "belts" },
      { name: "মানিব্যাগ", slug: "money-bag" },
    ],
  },
  {
    name: "বেবি প্রোডাক্ট", name_en: "Baby", slug: "baby",
    icon: "🍼",
    sub: [
      { name: "ডায়াপার", slug: "diapers" },
      { name: "খেলনা", slug: "toys" },
      { name: "পোশাক", slug: "baby-clothing" },
      { name: "খাবার", slug: "baby-food" },
    ],
  },
  {
    name: "ইসলামিক লাইফস্টাইল", name_en: "Islamic", slug: "islamic",
    icon: "☪️",
    sub: [
      { name: "জায়নামায", slug: "prayer-mat" },
      { name: "তাসবিহ", slug: "tasbih" },
      { name: "আতর", slug: "attar" },
      { name: "হিজাব", slug: "hijab" },
    ],
  },
  {
    name: "অর্গানিক ফুড", name_en: "Organic", slug: "organic",
    icon: "🌿",
    sub: [
      { name: "মধু", slug: "honey" },
      { name: "ঘি", slug: "ghee" },
      { name: "মসলা", slug: "spices" },
      { name: "চাল", slug: "rice" },
    ],
  },
];

export function Navbar() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const cartCount = useCartStore((s) => s.totalItems);
  const { user } = useAuthStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    },
    [searchQuery, router]
  );

  const closeMegaMenu = useCallback(() => setActiveCategory(null), []);

  return (
    <>
      {/* Top bar */}
      <div className="bg-primary-700 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="hidden sm:inline">🚚 ৳999+ অর্ডারে বিনামূল্যে ডেলিভারি সারা বাংলাদেশে</span>
          <span className="sm:hidden">বিনামূল্যে ডেলিভারি ৳999+</span>
          <div className="flex items-center gap-3">
            <Link href="/track" className="hover:underline">অর্ডার ট্র্যাক করুন</Link>
            <span>|</span>
            <Link href="/help" className="hover:underline">সাহায্য</Link>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <header
        className={cn(
          "sticky top-0 z-50 bg-white transition-shadow duration-200",
          scrolled ? "shadow-navbar" : "shadow-none border-b border-gray-100"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <span className="font-serif text-xl font-bold text-primary-800 hidden sm:block">
                Unkora
              </span>
            </Link>

            {/* Desktop category nav */}
            <nav className="hidden lg:flex items-center gap-1 flex-1 ml-4" ref={megaMenuRef}>
              {categories.map((cat) => (
                <div key={cat.slug} className="relative group">
                  <button
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      "hover:bg-primary-50 hover:text-primary-700",
                      activeCategory === cat.slug
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-700"
                    )}
                    onMouseEnter={() => setActiveCategory(cat.slug)}
                    onMouseLeave={closeMegaMenu}
                    onClick={() => router.push(`/category/${cat.slug}`)}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </button>

                  {/* Mega menu */}
                  {activeCategory === cat.slug && (
                    <div
                      className="absolute top-full left-0 pt-2 z-50"
                      onMouseEnter={() => setActiveCategory(cat.slug)}
                      onMouseLeave={closeMegaMenu}
                    >
                      <div className="bg-white rounded-xl shadow-card-hover border border-gray-100 p-4 min-w-[200px] animate-fade-in">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                          {cat.name_en}
                        </p>
                        {cat.sub.map((sub) => (
                          <Link
                            key={sub.slug}
                            href={`/category/${cat.slug}/${sub.slug}`}
                            className="block px-2 py-1.5 rounded-lg text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                            onClick={closeMegaMenu}
                          >
                            {sub.name}
                          </Link>
                        ))}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <Link
                            href={`/category/${cat.slug}`}
                            className="text-xs font-medium text-primary-600 hover:text-primary-700"
                            onClick={closeMegaMenu}
                          >
                            সব দেখুন →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <Link
                href="/flash-sale"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <Zap className="w-3.5 h-3.5 fill-red-500" />
                ফ্ল্যাশ সেল
              </Link>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 ml-auto">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-primary-700 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Theme toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors hidden sm:flex"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Wishlist */}
              <Link
                href="/account/wishlist"
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-primary-700 transition-colors hidden sm:flex"
              >
                <Heart className="w-5 h-5" />
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-primary-700 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 animate-scale-in">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {/* User */}
              {user ? (
                <Link
                  href="/account"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name_en}
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                      {user.name_en[0]}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[100px] truncate">
                    {user.name_en}
                  </span>
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">লগইন</span>
                </Link>
              )}

              {/* Mobile menu */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors lg:hidden"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar dropdown */}
        {searchOpen && (
          <div className="border-t border-gray-100 bg-white px-4 py-3 animate-slide-in-up">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="বই, পণ্য বা ব্র্যান্ড খুঁজুন..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                খুঁজুন
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white max-h-[70vh] overflow-y-auto animate-slide-in-up">
            <div className="px-4 py-2">
              {categories.map((cat) => (
                <div key={cat.slug}>
                  <button
                    onClick={() =>
                      setActiveCategory(activeCategory === cat.slug ? null : cat.slug)
                    }
                    className="w-full flex items-center justify-between px-2 py-3 text-sm font-medium text-gray-700 hover:text-primary-700"
                  >
                    <span className="flex items-center gap-2">
                      {cat.icon} {cat.name}
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform",
                        activeCategory === cat.slug && "rotate-180"
                      )}
                    />
                  </button>
                  {activeCategory === cat.slug && (
                    <div className="ml-6 mb-2 space-y-1">
                      {cat.sub.map((sub) => (
                        <Link
                          key={sub.slug}
                          href={`/category/${cat.slug}/${sub.slug}`}
                          className="block px-2 py-2 text-sm text-gray-600 hover:text-primary-700 rounded-lg hover:bg-primary-50"
                          onClick={() => setMobileOpen(false)}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link
                href="/flash-sale"
                className="flex items-center gap-2 px-2 py-3 text-sm font-medium text-red-600"
                onClick={() => setMobileOpen(false)}
              >
                <Zap className="w-4 h-4 fill-red-500" />
                ফ্ল্যাশ সেল
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
