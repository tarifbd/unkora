"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { cn, formatBDT, discountPercent } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name_en: string;
    name_bn: string;
    base_price: number;
    sale_price?: number | null;
    rating_average: number;
    rating_count: number;
    stock_quantity?: number;
    images?: { url: string; alt_text?: string | null }[];
    category?: { name_en: string; name_bn: string; slug: string } | null;
    brand?: { name: string } | null;
  };
  className?: string;
  priority?: boolean;
}

export function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const image = product.images?.[0];
  const price = product.sale_price ?? product.base_price;
  const hasDiscount = !!product.sale_price && product.sale_price < product.base_price;
  const discount = hasDiscount ? discountPercent(product.base_price, product.sale_price!) : 0;
  const inStock = (product.stock_quantity ?? 1) > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    addItem({
      product_id: product.id,
      name_en: product.name_en,
      name_bn: product.name_bn,
      image: image?.url ?? "/placeholder.jpg",
      sku: product.id,
      unit_price: price,
      stock_quantity: product.stock_quantity ?? 99,
    });
    toast.success(`"${product.name_bn}" কার্টে যোগ হয়েছে`, {
      description: formatBDT(price),
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "উইশলিস্ট থেকে সরানো হয়েছে" : "উইশলিস্টে যোগ হয়েছে");
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "group relative flex flex-col bg-white rounded-2xl overflow-hidden",
        "border border-gray-100 hover:border-primary-200",
        "shadow-card hover:shadow-card-hover transition-all duration-300",
        className
      )}
    >
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {image && !imgError ? (
          <Image
            src={image.url}
            alt={image.alt_text ?? product.name_en}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority={priority}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Eye className="w-10 h-10" />
          </div>
        )}

        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-lg">
              -{discount}%
            </span>
          )}
          {!inStock && (
            <span className="px-2 py-0.5 bg-gray-800 text-white text-xs font-medium rounded-lg">
              স্টক শেষ
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={cn(
            "absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center",
            "bg-white/90 backdrop-blur-sm shadow-sm",
            "opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0",
            "transition-all duration-200",
            isWishlisted ? "text-red-500" : "text-gray-400 hover:text-red-500"
          )}
          aria-label="উইশলিস্টে যোগ করুন"
        >
          <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
        </button>

        {/* Quick add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className={cn(
            "absolute bottom-2 left-2 right-2 py-2 rounded-xl",
            "bg-primary-600 text-white text-sm font-medium",
            "opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0",
            "transition-all duration-200",
            "flex items-center justify-center gap-2",
            !inStock && "bg-gray-400 cursor-not-allowed"
          )}
        >
          <ShoppingCart className="w-4 h-4" />
          {inStock ? "কার্টে যোগ করুন" : "স্টক নেই"}
        </button>
      </div>

      {/* Product info */}
      <div className="flex-1 flex flex-col p-3 gap-1.5">
        {product.category && (
          <span className="text-xs text-primary-600 font-medium">
            {product.category.name_bn}
          </span>
        )}

        <h3 className="text-sm font-medium text-gray-800 leading-snug line-clamp-2 font-bangla">
          {product.name_bn}
        </h3>

        {/* Rating */}
        {product.rating_count > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "w-3 h-3",
                    star <= Math.round(product.rating_average)
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-200 fill-gray-200"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">({product.rating_count})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-auto pt-1">
          <span className="text-base font-bold text-primary-700">{formatBDT(price)}</span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              {formatBDT(product.base_price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
