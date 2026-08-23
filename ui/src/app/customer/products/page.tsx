"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, ShoppingCart, Search, Leaf, MessageSquareText } from "lucide-react";
import { useCart } from "../context/CartContext";
import { UNIFIED_PRODUCTS, PRODUCT_CATEGORIES, ProductItem } from "@/lib/products";

export default function CustomerProductsPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>("All Fruits");
  const [searchQuery, setSearchQuery] = useState("");
  const { addToCart, startBuyNow } = useCart();

  const filteredProducts = UNIFIED_PRODUCTS.filter((product) => {
    const matchCategory =
      activeCategory === "All Fruits" || product.category === activeCategory;
    const matchSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleAddToCart = (product: ProductItem) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.price,
      unit: product.unit.replace("/", ""),
      image: product.image,
      stockStatus: product.stockStatus,
    });
  };

  const handleBuyNow = (product: ProductItem) => {
    startBuyNow(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.price,
        unit: product.unit.replace("/", ""),
        image: product.image,
        stockStatus: product.stockStatus,
      },
      1
    );
    router.push("/customer/order?mode=buynow");
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 pt-2 pb-8 space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#71C168]">
          Fresh Arrivals
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Discover our hand-picked selection of organic, seasonal fruits sourced directly from local farmers.
        </p>
      </div>

      {/* Standardized Search & Filter Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs md:flex-row md:items-center md:justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search fruit by name, category, origin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pl-10 pr-9 text-xs font-medium text-gray-700 placeholder-gray-400 focus:border-[#71C168] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#71C168]/20 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Categories Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {PRODUCT_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                activeCategory === category
                  ? "bg-[#1E7B34] text-white shadow-xs"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="flex flex-col bg-white rounded-2xl p-4 shadow-2xs border border-gray-200/80 hover:shadow-md hover:border-gray-300 transition-all group relative"
          >
            {/* Image Box */}
            <div className="relative w-full aspect-4/3 bg-[#F3F4F6] rounded-xl flex items-center justify-center overflow-hidden mb-3.5">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Grade Badge */}
              <div className="absolute top-2.5 left-2.5 flex gap-1">
                <span className="rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-bold text-[#1E7B34] shadow-2xs backdrop-blur-xs">
                  {product.grade}
                </span>
              </div>

              {/* Stock Status Tag */}
              <div className="absolute top-2.5 right-2.5">
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold shadow-xs ${
                    product.stockStatus === "In Stock"
                      ? "bg-[#4CAF50] text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {product.stockStatus}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-[#1F2937] text-sm sm:text-base leading-tight">
                    {product.name}
                  </h3>
                  {product.isFeatured && (
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0 mt-0.5" />
                  )}
                </div>

                <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                  {product.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100/80 space-y-3">
                <div className="flex items-baseline gap-1">
                  <span className="font-black text-[#1E7B34] text-base">{product.priceStr}</span>
                  <span className="text-xs font-medium text-gray-400">{product.unit}</span>
                </div>

                {/* Actions: Buy Now + Cart Icon */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleBuyNow(product);
                    }}
                    className="flex-1 rounded-xl bg-[#71C168] hover:bg-[#60ab58] px-3 py-2 text-xs font-bold text-white transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Buy Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className="h-9 w-9 rounded-xl bg-[#71C168]/15 text-[#1E7B34] hover:bg-[#71C168]/25 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    title="Add to Cart"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>

                  <Link
                    href="/customer/negotiator"
                    className="h-9 w-9 rounded-xl bg-[#71C168]/15 text-[#1E7B34] hover:bg-[#71C168]/25 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                    title="Negotiate Price with AI"
                  >
                    <MessageSquareText className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <Leaf className="mx-auto h-10 w-10 text-gray-300 stroke-1" />
            <p className="mt-3 text-sm font-bold text-gray-700">No fruits found</p>
            <p className="mt-1 text-xs text-gray-400">
              Try adjusting your search query or switching categories.
            </p>
            <button
              onClick={() => {
                setActiveCategory("All Fruits");
                setSearchQuery("");
              }}
              className="mt-4 rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
