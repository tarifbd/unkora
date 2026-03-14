"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, Star, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Plus, Minus, Share2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { cn, formatBDT, discountPercent } from "@/lib/utils";
import { toast } from "sonner";

interface Variant { id: string; name: string; name_bn?: string | null; price_modifier: number; stock_quantity: number; attributes: Record<string, string>; }
interface ProductImage { id: string; url: string; alt_text?: string | null; }

export function ProductDetail({ product }: { product: Record<string, unknown> }) {
  const images = (product.images as ProductImage[]) ?? [];
  const variants = (product.variants as Variant[]) ?? [];

  const [currentImg, setCurrentImg] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(variants[0] ?? null);
  const [qty, setQty] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imgZoomed, setImgZoomed] = useState(false);

  const addItem = useCartStore((s) => s.addItem);

  const basePrice = product.base_price as number;
  const salePrice = product.sale_price as number | null;
  const variantMod = selectedVariant?.price_modifier ?? 0;
  const effectivePrice = (salePrice ?? basePrice) + variantMod;
  const originalPrice = basePrice + variantMod;
  const hasDiscount = salePrice !== null && salePrice !== undefined && salePrice < basePrice;
  const discount = hasDiscount ? discountPercent(originalPrice, effectivePrice) : 0;
  const stockQty = selectedVariant?.stock_quantity ?? (product.stock_quantity as number) ?? 0;
  const inStock = stockQty > 0;

  const handleAddToCart = () => {
    addItem({
      product_id: product.id as string,
      variant_id: selectedVariant?.id ?? null,
      name_en: product.name_en as string,
      name_bn: product.name_bn as string,
      image: images[0]?.url ?? "/placeholder.jpg",
      sku: product.sku as string,
      unit_price: effectivePrice,
      stock_quantity: stockQty,
      quantity: qty,
    });
    toast.success(`"${product.name_bn as string}" কার্টে যোগ হয়েছে`, { description: `${qty}টি × ${formatBDT(effectivePrice)}` });
  };

  const nextImg = () => setCurrentImg((c) => (c + 1) % images.length);
  const prevImg = () => setCurrentImg((c) => (c - 1 + images.length) % images.length);

  // Group variant attributes
  const attributeKeys = [...new Set(variants.flatMap((v) => Object.keys(v.attributes)))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6 font-bangla">
        <Link href="/" className="hover:text-primary-600">হোম</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href={`/category/${(product.category as { slug: string }).slug}`} className="hover:text-primary-600">
              {(product.category as { name_bn: string }).name_bn}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-700 line-clamp-1">{product.name_bn as string}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image gallery */}
        <div className="space-y-3">
          {/* Main image */}
          <div
            className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden cursor-zoom-in"
            onClick={() => setImgZoomed(!imgZoomed)}
          >
            {images.length > 0 ? (
              <Image
                src={images[currentImg]?.url ?? ""}
                alt={images[currentImg]?.alt_text ?? (product.name_en as string)}
                fill
                className={cn("object-cover transition-transform duration-300", imgZoomed && "scale-150")}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-200 text-8xl">
                {product.category ? "📦" : "🛍️"}
              </div>
            )}

            {images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prevImg(); }} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); nextImg(); }} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {hasDiscount && (
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white text-sm font-bold rounded-lg">
                -{discount}%
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setCurrentImg(i)}
                  className={cn(
                    "flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors",
                    i === currentImg ? "border-primary-500" : "border-gray-100 hover:border-gray-300"
                  )}
                >
                  <Image src={img.url} alt={img.alt_text ?? ""} width={64} height={64} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-4">
          {/* Brand & category */}
          <div className="flex items-center gap-2 flex-wrap">
            {product.brand && (
              <Link href={`/brand/${(product.brand as { slug: string }).slug}`} className="text-xs font-medium text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full hover:bg-primary-100">
                {(product.brand as { name: string }).name}
              </Link>
            )}
            {product.is_halal_certified && (
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">☾ হালাল</span>
            )}
            {product.is_organic_certified && (
              <span className="text-xs font-medium text-lime-600 bg-lime-50 px-2.5 py-1 rounded-full">🌿 অর্গানিক</span>
            )}
          </div>

          {/* Name */}
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-800 leading-tight font-bangla">
            {product.name_bn as string}
          </h1>
          <p className="text-gray-500 text-sm">{product.name_en as string}</p>

          {/* Rating */}
          {(product.rating_count as number) > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={cn("w-4 h-4", s <= Math.round(product.rating_average as number) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200")} />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">{(product.rating_average as number).toFixed(1)}</span>
              <span className="text-sm text-gray-400">({product.rating_count as number} রিভিউ)</span>
              <span className="text-sm text-gray-300">•</span>
              <span className="text-sm text-gray-500">{product.sales_count as number} বিক্রি</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-primary-700">{formatBDT(effectivePrice)}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatBDT(originalPrice)}</span>
                <span className="text-sm font-bold text-red-500">-{discount}%</span>
              </>
            )}
          </div>

          {/* Short description */}
          {product.short_description_bn && (
            <p className="text-gray-600 text-sm leading-relaxed font-bangla border-t border-gray-100 pt-4">
              {product.short_description_bn as string}
            </p>
          )}

          {/* Variants */}
          {attributeKeys.map((attrKey) => {
            const options = [...new Set(variants.map((v) => v.attributes[attrKey]))].filter(Boolean);
            if (!options.length) return null;
            return (
              <div key={attrKey}>
                <p className="text-sm font-medium text-gray-700 mb-2 capitalize">{attrKey}</p>
                <div className="flex gap-2 flex-wrap">
                  {options.map((opt) => {
                    const matchingVariant = variants.find((v) => v.attributes[attrKey] === opt);
                    const active = selectedVariant?.attributes[attrKey] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => matchingVariant && setSelectedVariant(matchingVariant)}
                        disabled={!matchingVariant || matchingVariant.stock_quantity === 0}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all",
                          active ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-700 hover:border-gray-300",
                          (!matchingVariant || matchingVariant.stock_quantity === 0) && "opacity-40 cursor-not-allowed line-through"
                        )}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Stock indicator */}
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", inStock ? "bg-emerald-500" : "bg-red-400")} />
            <span className={cn("text-sm font-medium", inStock ? "text-emerald-600" : "text-red-500")}>
              {inStock ? `স্টকে আছে (${stockQty} টি বাকি)` : "স্টক শেষ"}
            </span>
          </div>

          {/* Quantity & Add to cart */}
          <div className="flex items-center gap-3 pt-2">
            {/* Qty selector */}
            <div className="flex items-center gap-0 border-2 border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-10 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center text-sm font-semibold">{qty}</span>
              <button
                onClick={() => setQty(Math.min(stockQty, qty + 1))}
                disabled={qty >= stockQty}
                className="w-10 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="flex-1 h-11 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors font-bangla"
            >
              <ShoppingCart className="w-5 h-5" />
              {inStock ? "কার্টে যোগ করুন" : "স্টক নেই"}
            </button>

            {/* Wishlist */}
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={cn(
                "w-11 h-11 flex items-center justify-center rounded-xl border-2 transition-all",
                isWishlisted ? "border-red-300 bg-red-50 text-red-500" : "border-gray-200 text-gray-400 hover:border-gray-300"
              )}
              aria-label="উইশলিস্ট"
            >
              <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />
            </button>

            <button className="w-11 h-11 flex items-center justify-center rounded-xl border-2 border-gray-200 text-gray-400 hover:border-gray-300 transition-colors" aria-label="শেয়ার করুন">
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
            {[
              { icon: Truck, label: "দ্রুত ডেলিভারি", sub: "১-৩ দিন" },
              { icon: Shield, label: "নিরাপদ পেমেন্ট", sub: "SSL সুরক্ষিত" },
              { icon: RotateCcw, label: "সহজ রিটার্ন", sub: "৭ দিনের মধ্যে" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center text-center p-2.5 bg-gray-50 rounded-xl">
                <Icon className="w-4 h-4 text-primary-600 mb-1" />
                <span className="text-xs font-medium text-gray-700 font-bangla">{label}</span>
                <span className="text-[10px] text-gray-400 font-bangla">{sub}</span>
              </div>
            ))}
          </div>

          {/* SKU */}
          <p className="text-xs text-gray-400">SKU: {product.sku as string}</p>
        </div>
      </div>

      {/* Description tabs */}
      <div className="mt-12">
        <h2 className="font-serif text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3 font-bangla">পণ্যের বিবরণ</h2>
        <div
          className="prose prose-sm max-w-none text-gray-600 font-bangla leading-relaxed"
          dangerouslySetInnerHTML={{ __html: (product.description_bn as string) ?? (product.description_en as string) ?? "" }}
        />
      </div>
    </div>
  );
}
