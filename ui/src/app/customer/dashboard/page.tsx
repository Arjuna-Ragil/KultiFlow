"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  TrendingUp,
  Truck,
  ShieldCheck,
  ShoppingCart,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  MessageSquareText,
  Flame,
  ChevronRight,
  Leaf,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { UNIFIED_PRODUCTS, PRODUCT_CATEGORIES, ProductItem } from "@/lib/products";

interface FlashDeal {
  id: string;
  title: string;
  description: string;
  negotiatedPrice: number;
  regularPrice: number;
  unit: string;
  discountPercent: number;
  stockLeftKg: number;
  image: string;
  tags: string[];
  expiresIn: string;
}

const FLASH_DEALS: FlashDeal[] = [];

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { addToCart, toggleCart, startBuyNow } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>("All Fruits");
  const [searchQuery, setSearchQuery] = useState("");
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredProducts = useMemo(() => {
    return UNIFIED_PRODUCTS.filter((item) => {
      const matchCategory =
        selectedCategory === "All Fruits" || item.category === selectedCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleAddToCart = (product: ProductItem) => {
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.price,
        isNegotiated: !!product.dealDiscount,
        unit: product.unit.replace("/", ""),
        image: product.image,
        stockStatus: product.stockStatus,
      },
      1
    );

    setAddedToast(`${product.name} added to cart!`);
    setTimeout(() => {
      setAddedToast(null);
    }, 3000);
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

  const handleAddDealToCart = (deal: (typeof FLASH_DEALS)[0]) => {
    addToCart(
      {
        id: `nego-${deal.id}`,
        name: deal.title,
        price: deal.negotiatedPrice,
        originalPrice: deal.regularPrice,
        isNegotiated: true,
        unit: deal.unit.replace("/", ""),
        image: deal.image,
        stockStatus: "In Stock",
      },
      5
    );

    setAddedToast(`Deal ${deal.title} (5 ${deal.unit}) added to cart!`);
    setTimeout(() => {
      setAddedToast(null);
    }, 3000);
  };

  return (
    <div className="min-h-full bg-gray-50 pb-16">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-5 py-4 shadow-xl ring-1 ring-black/5 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#71C168]/20 text-[#1E7B34]">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#1F2937]">{addedToast}</p>
            <p className="text-[11px] text-gray-500">View shopping basket in the top right</p>
          </div>
          <button
            onClick={toggleCart}
            className="ml-2 rounded-lg bg-[#71C168] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#60ab58] transition-colors cursor-pointer"
          >
            View Cart
          </button>
        </div>
      )}

      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 pt-2 space-y-6">
        {/* Standard Page Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#71C168]">
            Customer Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome to KultiFlow Fresh Produce Hub. Monitor live shipments, smart AI negotiations, and fresh harvests.
          </p>
        </div>

        {/* HERO BANNER */}
        <section className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-[#EAF6E8] via-[#F4FAF2] to-white p-6 sm:p-8 md:p-10 shadow-2xs">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-72 w-72 rounded-full bg-[#71C168]/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 -mb-20 h-64 w-64 rounded-full bg-emerald-200/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1F2937] leading-tight">
              Welcome to the Fresh Produce Hub,{" "}
              <span className="text-[#1E7B34]">KultiFlow Customer</span> 👋
            </h2>

            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Track cold-chain deliveries in real time, unlock exclusive wholesale discounts negotiated by AgroBot AI, and order directly from certified orchard partners.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/customer/negotiator"
                className="inline-flex items-center gap-2 rounded-xl bg-[#71C168] hover:bg-[#60ab58] px-5 py-3 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <MessageSquareText className="h-4 w-4" />
                <span>Start AI Price Negotiation</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <button
                onClick={() => {
                  const elem = document.getElementById("harvest-catalog");
                  elem?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white/90 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-white transition-all shadow-2xs hover:border-[#71C168] cursor-pointer"
              >
                <Search className="h-4 w-4 text-gray-500" />
                <span>Explore Harvest Catalog</span>
              </button>

              <button
                onClick={toggleCart}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm font-semibold text-[#1E7B34] hover:bg-emerald-100/70 transition-colors cursor-pointer"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>View Cart</span>
              </button>
            </div>
          </div>
        </section>

        {/* METRICS & KEY KPI STATS */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="group relative rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs transition-all hover:border-[#71C168] hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">AI Negotiation Savings</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#1E7B34] group-hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-[#1F2937] tracking-tight">
                Rp 1.450.000
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-xs">
                <span className="inline-flex items-center text-emerald-600 font-bold">
                  <TrendingUp className="mr-0.5 h-3.5 w-3.5" /> +18.4%
                </span>
                <span className="text-gray-400">from 12 deal sessions</span>
              </div>
            </div>
          </div>

          <div className="group relative rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs transition-all hover:border-[#71C168] hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">Cold-Chain Deliveries</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
                <Truck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-[#1F2937] tracking-tight">
                2 Shipments
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <span>1 In Transit, 1 Ready to Load</span>
              </div>
            </div>
          </div>

          <div className="group relative rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs transition-all hover:border-[#71C168] hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">AI QC Quality Index</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#71C168]/15 text-[#71C168] group-hover:scale-105 transition-transform">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-[#1F2937] tracking-tight">
                98.6% Grade A+
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                <span className="font-semibold text-[#1E7B34]">Passed KultiFlow Standard</span>
              </div>
            </div>
          </div>
        </section>

        {/* AI NEGOTIATOR FLASH DEALS */}
        <section className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg sm:text-xl font-extrabold text-[#71C168]">
                  AI Negotiator Special Deals (Flash Deals)
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Negotiated bot price deals exclusively locked for your account
              </p>
            </div>

            <Link
              href="/customer/negotiator"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#1E7B34] hover:underline"
            >
              <span>Open AI Negotiator Chat</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {FLASH_DEALS.map((deal) => (
              <div
                key={deal.id}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs transition-all hover:border-[#71C168] hover:shadow-md flex flex-col justify-between"
              >
                <div className="flex gap-4">
                  <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-[#F3F4F6]">
                    <img
                      src={deal.image}
                      alt={deal.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute top-1.5 left-1.5 rounded-md bg-[#DC2626] px-1.5 py-0.5 text-[10px] font-black text-white shadow-xs">
                      -{deal.discountPercent}%
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                        <Clock className="h-3.5 w-3.5" /> Remaining {deal.expiresIn}
                      </span>
                      <span className="rounded-full bg-[#71C168]/15 px-2 py-0.5 text-[10px] font-bold text-[#1E7B34]">
                        Locked
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#1F2937] leading-snug group-hover:text-[#1E7B34] transition-colors">
                      {deal.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {deal.description}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {deal.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[9px] font-semibold text-gray-600"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100 pt-3">
                  <div>
                    <span className="text-[10px] text-gray-400 line-through mr-2">
                      {formatIDR(deal.regularPrice)}{deal.unit}
                    </span>
                    <span className="text-base font-black text-[#1E7B34]">
                      {formatIDR(deal.negotiatedPrice)}
                    </span>
                    <span className="text-xs text-gray-500">{deal.unit}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href="/customer/negotiator"
                      className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                      title="Negotiate More"
                    >
                      Negotiate
                    </Link>
                    <button
                      onClick={() => handleAddDealToCart(deal)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#71C168] hover:bg-[#60ab58] px-4 py-2 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      <span>Claim &amp; Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PRODUCE CATALOG SECTION */}
        <section id="harvest-catalog" className="space-y-4 pt-4">
          <div className="border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-[#71C168]" />
              <h2 className="text-lg sm:text-xl font-extrabold text-[#71C168]">
                Fresh Produce Harvest Catalog
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              QC-verified fresh inventory, ready for integrated cold-chain delivery
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
              {PRODUCT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[#1E7B34] text-white shadow-xs"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <Leaf className="mx-auto h-10 w-10 text-gray-300 stroke-1" />
              <p className="mt-3 text-sm font-bold text-gray-700">No fruits found</p>
              <p className="mt-1 text-xs text-gray-400">
                Try adjusting your search query or switching categories.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("All Fruits");
                  setSearchQuery("");
                }}
                className="mt-4 rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          ) : (
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
                      </div>

                      <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                        {product.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-100/80 space-y-3">
                      <div className="flex items-baseline gap-1">
                        <span className="font-black text-[#1E7B34] text-base">
                          {formatIDR(product.price)}
                        </span>
                        <span className="text-xs font-medium text-gray-400">{product.unit}</span>
                      </div>

                      {/* Actions: Buy Now + Add to Cart / Nego */}
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
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
