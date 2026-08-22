"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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
  MapPin,
  MessageSquareText,
  Plus,
  Leaf,
  ChevronRight,
  Flame,
} from "lucide-react";
import { useCart } from "../context/CartContext";

interface ProductCatalogItem {
  id: string;
  name: string;
  category: "Apel" | "Mangga" | "Jeruk" | "Pisang" | "Alpukat" | "Eksotis";
  grade: "Grade A+" | "Grade A" | "Grade B+";
  origin: string;
  price: number;
  originalPrice: number;
  unit: string;
  stockStatus: "In Stock" | "Low Stock" | "Panen Baru";
  image: string;
  harvestDate: string;
  rating: number;
  dealDiscount?: number;
  isNegotiable?: boolean;
}

const PRODUCE_CATALOG: ProductCatalogItem[] = [
  {
    id: "fuji-apples-batu",
    name: "Apel Fuji Batu Premium",
    category: "Apel",
    grade: "Grade A+",
    origin: "Batu, Malang",
    price: 45000,
    originalPrice: 52000,
    unit: "kg",
    stockStatus: "In Stock",
    image: "/fuji_apples.jpg",
    harvestDate: "Panen Kemarin",
    rating: 4.9,
    dealDiscount: 15,
    isNegotiable: true,
  },
  {
    id: "granny-smith-malang",
    name: "Apel Malang Granny Smith",
    category: "Apel",
    grade: "Grade A",
    origin: "Poncokusumo, Malang",
    price: 48000,
    originalPrice: 56000,
    unit: "kg",
    stockStatus: "In Stock",
    image: "/granny_smith.jpg",
    harvestDate: "Panen Pagi Ini",
    rating: 4.8,
    dealDiscount: 14,
    isNegotiable: true,
  },
  {
    id: "mangga-arumanis-probolinggo",
    name: "Mangga Arumanis 143",
    category: "Mangga",
    grade: "Grade A+",
    origin: "Tongas, Probolinggo",
    price: 32000,
    originalPrice: 38000,
    unit: "kg",
    stockStatus: "Panen Baru",
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=600&auto=format&fit=crop",
    harvestDate: "Panen Pagi Ini",
    rating: 5.0,
    dealDiscount: 16,
    isNegotiable: true,
  },
  {
    id: "pisang-cavendish-sunpride",
    name: "Pisang Cavendish Super",
    category: "Pisang",
    grade: "Grade A+",
    origin: "Lampung Timur",
    price: 24000,
    originalPrice: 28000,
    unit: "sisir",
    stockStatus: "In Stock",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=600&auto=format&fit=crop",
    harvestDate: "2 hari lalu",
    rating: 4.9,
    isNegotiable: false,
  },
  {
    id: "alpukat-mentega-miki",
    name: "Alpukat Mentega Super Miki",
    category: "Alpukat",
    grade: "Grade A+",
    origin: "Cikembar, Sukabumi",
    price: 42000,
    originalPrice: 50000,
    unit: "kg",
    stockStatus: "Low Stock",
    image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=600&auto=format&fit=crop",
    harvestDate: "Kemarin Sore",
    rating: 4.9,
    dealDiscount: 16,
    isNegotiable: true,
  },
  {
    id: "jeruk-medan-berastagi",
    name: "Jeruk Manis Berastagi",
    category: "Jeruk",
    grade: "Grade A",
    origin: "Berastagi, Sumut",
    price: 29000,
    originalPrice: 34000,
    unit: "kg",
    stockStatus: "In Stock",
    image: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=600&auto=format&fit=crop",
    harvestDate: "Panen Pagi Ini",
    rating: 4.7,
    isNegotiable: true,
  },
  {
    id: "naga-merah-banyuwangi",
    name: "Buah Naga Merah Organik",
    category: "Eksotis",
    grade: "Grade A+",
    origin: "Pesanggaran, Banyuwangi",
    price: 26000,
    originalPrice: 30000,
    unit: "kg",
    stockStatus: "Panen Baru",
    image: "https://images.unsplash.com/photo-1527325678964-54921661f888?q=80&w=600&auto=format&fit=crop",
    harvestDate: "Kemarin",
    rating: 4.8,
    isNegotiable: false,
  },
  {
    id: "melon-golden-alisha",
    name: "Melon Golden Inthanon Hidroponik",
    category: "Eksotis",
    grade: "Grade A+",
    origin: "Kediri Greenhouse",
    price: 38000,
    originalPrice: 45000,
    unit: "kg",
    stockStatus: "Low Stock",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=600&auto=format&fit=crop",
    harvestDate: "Hari Ini",
    rating: 5.0,
    dealDiscount: 15,
    isNegotiable: true,
  },
];

const FLASH_DEALS = [
  {
    id: "deal-1",
    title: "Batch Panen Raya Apel Fuji Malang",
    description: "Harga khusus borongan min. 30kg langsung dari kebun mitra KultiFlow Batu.",
    negotiatedPrice: 38500,
    regularPrice: 52000,
    unit: "kg",
    discountPercent: 26,
    stockLeftKg: 140,
    image: "/fuji_apples.jpg",
    tags: ["Grade A+", "Nego Deal Locked", "Cold Storage Ready"],
    expiresIn: "03:24:15",
  },
  {
    id: "deal-2",
    title: "Mangga Arumanis 143 Super Matang Pohon",
    description: "Tingkat brix kemanisan 16.5°, dipetik subuh tadi dan lolos scan AI QC.",
    negotiatedPrice: 27000,
    regularPrice: 38000,
    unit: "kg",
    discountPercent: 29,
    stockLeftKg: 85,
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=600&auto=format&fit=crop",
    tags: ["Grade A", "AI QC 99.2%", "Fresh Arrival"],
    expiresIn: "01:45:00",
  },
];

const CATEGORIES = ["Semua", "Apel", "Mangga", "Jeruk", "Pisang", "Alpukat", "Eksotis"] as const;

export default function CustomerDashboardPage() {
  const { addToCart, toggleCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
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
    return PRODUCE_CATALOG.filter((item) => {
      const matchCategory =
        selectedCategory === "Semua" || item.category === selectedCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleAddToCart = (product: ProductCatalogItem) => {
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        isNegotiated: !!product.dealDiscount,
        unit: product.unit,
        image: product.image,
        stockStatus: product.stockStatus === "Low Stock" ? "Low Stock" : "In Stock",
      },
      1
    );

    setAddedToast(`${product.name} berhasil ditambahkan ke keranjang!`);
    setTimeout(() => {
      setAddedToast(null);
    }, 3000);
  };

  const handleAddDealToCart = (deal: (typeof FLASH_DEALS)[0]) => {
    addToCart(
      {
        id: `nego-${deal.id}`,
        name: deal.title,
        price: deal.negotiatedPrice,
        originalPrice: deal.regularPrice,
        isNegotiated: true,
        unit: deal.unit,
        image: deal.image,
        stockStatus: "In Stock",
      },
      5 // default bundle 5kg
    );

    setAddedToast(`Deal ${deal.title} (5 ${deal.unit}) ditambahkan ke keranjang!`);
    setTimeout(() => {
      setAddedToast(null);
    }, 3000);
  };

  return (
    <div className="min-h-full bg-[#F9FAFB] pb-16">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-5 py-4 shadow-xl ring-1 ring-black/5 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#71C168]/20 text-[#1E7B34]">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#1F2937]">{addedToast}</p>
            <p className="text-[11px] text-gray-500">Buka keranjang belanja di pojok kanan atas</p>
          </div>
          <button
            onClick={toggleCart}
            className="ml-2 rounded-lg bg-[#71C168] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#60ab58] transition-colors cursor-pointer"
          >
            Lihat Keranjang
          </button>
        </div>
      )}

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 space-y-8">
        {/* HERO BANNER */}
        <section className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-[#EAF6E8] via-[#F4FAF2] to-white p-6 sm:p-8 md:p-10 shadow-xs">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-72 w-72 rounded-full bg-[#71C168]/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 -mb-20 h-64 w-64 rounded-full bg-emerald-200/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <div className="space-y-4 lg:col-span-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#71C168]/30 bg-white/80 px-3.5 py-1 text-xs font-bold text-[#1E7B34] backdrop-blur-xs shadow-2xs">
                <span className="flex h-2 w-2 rounded-full bg-[#71C168] animate-ping" />
                <Leaf className="h-3.5 w-3.5" />
                <span>Panen Segar Mitra Kebun KultiFlow • Hari Ini</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#1F2937] leading-tight">
                Selamat Datang di Hub Buah Segar,{" "}
                <span className="text-[#1E7B34]">Customer KultiFlow</span> 👋
              </h1>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl">
                Pantau pengiriman cold-chain secara real-time, nikmati diskon khusus hasil negosiasi cerdas dengan AgroBot AI, dan pesan langsung dari petani terverifikasi.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/customer/negotiator"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#71C168] hover:bg-[#60ab58] px-5 py-3 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  <MessageSquareText className="h-4 w-4" />
                  <span>Mulai Nego Harga AI</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <button
                  onClick={() => {
                    const elem = document.getElementById("katalog-panen");
                    elem?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white/90 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-white transition-all shadow-2xs hover:border-[#71C168] cursor-pointer"
                >
                  <Search className="h-4 w-4 text-gray-500" />
                  <span>Jelajahi Panen Segar</span>
                </button>

                <button
                  onClick={toggleCart}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm font-semibold text-[#1E7B34] hover:bg-emerald-100/70 transition-colors cursor-pointer"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Buka Keranjang</span>
                </button>
              </div>
            </div>

            {/* Quick Live Status Card */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Truck className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">Status Armada Aktif</p>
                      <p className="text-[10px] text-gray-500">Resi #KF-92841</p>
                    </div>
                  </div>
                  <span className="shrink-0 whitespace-nowrap rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                    Otw Lokasi
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Estimasi Tiba:</span>
                    <span className="font-bold text-[#1F2937]">Hari ini, 16:45 WIB</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Suhu Cold Truck:</span>
                    <span className="font-bold text-emerald-600">4.2°C (Optimal Segar)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Muatan:</span>
                    <span className="font-semibold text-gray-700">50kg Fuji + 25kg Pisang</span>
                  </div>
                </div>

                {/* Mini Step progress */}
                <div className="pt-2">
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-[#71C168] to-blue-500" />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>Malang Hub</span>
                    <span className="text-blue-600 font-bold">Tol Trans-Jawa</span>
                    <span>Tujuan</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* METRICS & KEY KPI STATS */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="group relative rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs transition-all hover:border-[#71C168] hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Hemat dari AI Nego</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#1E7B34] group-hover:scale-105 transition-transform">
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
                <span className="text-gray-400">dari 12 sesi deal</span>
              </div>
            </div>
          </div>

          <div className="group relative rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs transition-all hover:border-[#71C168] hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Pengiriman Cold-Chain</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
                <Truck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-[#1F2937] tracking-tight">
                2 Pengiriman
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <span>1 Dalam Rute, 1 Siap Muat</span>
              </div>
            </div>
          </div>

          <div className="group relative rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs transition-all hover:border-[#71C168] hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Indeks Kualitas AI QC</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#71C168]/15 text-[#71C168] group-hover:scale-105 transition-transform">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-[#1F2937] tracking-tight">
                98.6% Grade A+
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                <span className="font-semibold text-[#1E7B34]">Lolos Standar KultiFlow</span>
              </div>
            </div>
          </div>
        </section>

        {/* AI NEGOTIATOR FLASH DEALS */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg sm:text-xl font-extrabold text-[#1F2937]">
                  Penawaran Khusus Nego AI (Flash Deals)
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Kesepakatan harga bot negosiasi yang terkunci khusus untuk akun Anda
              </p>
            </div>

            <Link
              href="/customer/negotiator"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#1E7B34] hover:underline"
            >
              <span>Buka Chat AI Negotiator</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {FLASH_DEALS.map((deal) => (
              <div
                key={deal.id}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition-all hover:border-[#71C168] hover:shadow-md flex flex-col justify-between"
              >
                <div className="flex gap-4">
                  <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100">
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
                        <Clock className="h-3.5 w-3.5" /> Sisa {deal.expiresIn}
                      </span>
                      <span className="rounded-full bg-[#71C168]/15 px-2 py-0.5 text-[10px] font-bold text-[#1E7B34]">
                        Terkunci
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
                      {formatIDR(deal.regularPrice)}/{deal.unit}
                    </span>
                    <span className="text-base font-black text-[#1E7B34]">
                      {formatIDR(deal.negotiatedPrice)}
                    </span>
                    <span className="text-xs text-gray-500">/{deal.unit}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href="/customer/negotiator"
                      className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                      title="Nego Lebih Lanjut"
                    >
                      Nego Lagi
                    </Link>
                    <button
                      onClick={() => handleAddDealToCart(deal)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#71C168] hover:bg-[#60ab58] px-4 py-2 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      <span>Klaim & Tambah</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PRODUCE CATALOG (FILTERABLE & SEARCHABLE) */}
        <section id="katalog-panen" className="space-y-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-[#71C168]" />
                <h2 className="text-lg sm:text-xl font-extrabold text-[#1F2937]">
                  Katalog Panen Buah Segar Petani
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Stok komoditas terverifikasi QC, siap kirim dengan cold-chain terpadu
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari apel, mangga, kebun..."
                className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-10 pr-4 text-xs font-medium text-gray-800 placeholder-gray-400 focus:border-[#71C168] focus:outline-hidden focus:ring-2 focus:ring-[#71C168]/20 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#71C168] text-white shadow-xs"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <Leaf className="mx-auto h-10 w-10 text-gray-300 stroke-1" />
              <p className="mt-3 text-sm font-bold text-gray-700">Komoditas tidak ditemukan</p>
              <p className="mt-1 text-xs text-gray-400">
                Coba gunakan kata kunci pencarian lain atau ganti kategori.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("Semua");
                  setSearchQuery("");
                }}
                className="mt-4 rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs transition-all hover:border-[#71C168] hover:shadow-md"
                >
                  <div>
                    {/* Image Box */}
                    <div className="relative h-44 w-full overflow-hidden rounded-xl bg-gray-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute top-2 left-2 rounded-lg bg-white/95 px-2 py-0.5 text-[10px] font-bold text-[#1E7B34] shadow-2xs backdrop-blur-xs">
                        {product.grade}
                      </span>
                      <span className="absolute top-2 right-2 rounded-lg bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                        {product.harvestDate}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center gap-1 text-[11px] text-gray-400">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span>{product.origin}</span>
                      </div>

                      <h3 className="text-sm font-bold text-[#1F2937] leading-snug group-hover:text-[#1E7B34] transition-colors">
                        {product.name}
                      </h3>

                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-base font-black text-[#1E7B34]">
                          {formatIDR(product.price)}
                        </span>
                        <span className="text-xs text-gray-400">/{product.unit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#71C168] hover:bg-[#60ab58] py-2.5 text-xs font-bold text-white shadow-2xs transition-all cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Keranjang</span>
                    </button>

                    {product.isNegotiable && (
                      <Link
                        href="/customer/negotiator"
                        className="inline-flex items-center justify-center rounded-xl border border-[#71C168]/40 bg-[#71C168]/10 p-2.5 text-[#1E7B34] hover:bg-[#71C168]/20 transition-colors"
                        title="Nego dengan AI"
                      >
                        <MessageSquareText className="h-4 w-4" />
                      </Link>
                    )}
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
