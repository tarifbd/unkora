"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const slides = [
  {
    id: 1,
    title: "প্রিমিয়াম বাংলা ও ইসলামিক বই",
    subtitle: "হাজারো বইয়ের সংগ্রহ, দ্রুত ডেলিভারি সারা বাংলাদেশে",
    cta: "বই দেখুন",
    ctaHref: "/category/books",
    bg: "from-primary-800 via-primary-700 to-amber-600",
    emoji: "📚",
    badge: "নতুন সংযোজন",
  },
  {
    id: 2,
    title: "হ্যান্ডক্রাফটেড লেদার পণ্য",
    subtitle: "খাঁটি চামড়ার ওয়ালেট, ব্যাগ ও বেল্ট — টেকসই ও মার্জিত",
    cta: "লেদার পণ্য দেখুন",
    ctaHref: "/category/leather",
    bg: "from-charcoal-800 via-charcoal-700 to-amber-700",
    emoji: "👜",
    badge: "হ্যান্ডমেড",
  },
  {
    id: 3,
    title: "শিশুর জন্য সেরা পণ্য",
    subtitle: "BPA মুক্ত, নিরাপদ ও মানসম্পন্ন বেবি প্রোডাক্ট",
    cta: "বেবি পণ্য দেখুন",
    ctaHref: "/category/baby",
    bg: "from-secondary-700 via-secondary-600 to-teal-500",
    emoji: "🍼",
    badge: "সেফটি সার্টিফাইড",
  },
  {
    id: 4,
    title: "ইসলামিক লাইফস্টাইল",
    subtitle: "জায়নামায, তাসবিহ, আতর ও অন্যান্য ইসলামিক পণ্যের বিশাল সংগ্রহ",
    cta: "ইসলামিক পণ্য দেখুন",
    ctaHref: "/category/islamic",
    bg: "from-emerald-800 via-emerald-700 to-teal-600",
    emoji: "☪️",
    badge: "হালাল সার্টিফাইড",
  },
  {
    id: 5,
    title: "অর্গানিক ও প্রাকৃতিক ফুড",
    subtitle: "বিশুদ্ধ মধু, দেশি ঘি, মসলা ও আরো অনেক প্রাকৃতিক পণ্য",
    cta: "অর্গানিক ফুড দেখুন",
    ctaHref: "/category/organic",
    bg: "from-lime-700 via-green-600 to-emerald-500",
    emoji: "🌿",
    badge: "অর্গানিক সার্টিফাইড",
  },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [autoplay, next]);

  const slide = slides[current]!;

  return (
    <section
      className={cn(
        "relative overflow-hidden bg-gradient-to-br",
        slide.bg,
        "transition-all duration-700"
      )}
      onMouseEnter={() => setAutoplay(false)}
      onMouseLeave={() => setAutoplay(true)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="flex flex-col items-center text-center text-white">
          {/* Badge */}
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium mb-4 animate-fade-in">
            ✨ {slide.badge}
          </span>

          {/* Emoji */}
          <div className="text-7xl sm:text-8xl mb-6 animate-bounce-soft">
            {slide.emoji}
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight max-w-2xl animate-slide-in-up font-bangla">
            {slide.title}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-xl animate-slide-in-up font-bangla">
            {slide.subtitle}
          </p>

          {/* CTA */}
          <Link
            href={slide.ctaHref}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-primary-700 font-semibold rounded-2xl hover:bg-primary-50 transition-colors shadow-lg shadow-black/20 animate-slide-in-up"
          >
            {slide.cta} →
          </Link>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors flex items-center justify-center"
        aria-label="Previous"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors flex items-center justify-center"
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              "rounded-full transition-all duration-300",
              i === current ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/50 hover:bg-white/70"
            )}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
