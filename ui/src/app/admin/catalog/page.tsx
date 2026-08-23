"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Package,
  Layers,
  Sparkles,
  AlertTriangle,
  ShoppingBag,
} from "lucide-react";
import { UNIFIED_PRODUCTS, PRODUCT_CATEGORIES, ProductItem } from "@/lib/products";

export default function AdminCatalogPage() {
  const [catalog, setCatalog] = useState<ProductItem[]>(UNIFIED_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Fruits");
  const [selectedGrade, setSelectedGrade] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  // New item form state
  const [newItem, setNewItem] = useState({
    name: "",
    category: "Apples" as ProductItem["category"],
    sku: "",
    price: "",
    stockKg: "",
    grade: "Grade A+" as "Grade A+" | "Grade A" | "Grade B",
    desc: "",
  });

  const filteredItems = catalog.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.origin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Fruits" || item.category === selectedCategory;
    const matchesGrade = selectedGrade === "All" || item.grade === selectedGrade;
    return matchesSearch && matchesCategory && matchesGrade;
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price || !newItem.stockKg) return;

    const priceNum = Number(newItem.price);
    const stockNum = Number(newItem.stockKg);

    const item: ProductItem = {
      id: `fruit-${Date.now().toString().slice(-4)}`,
      name: newItem.name,
      category: newItem.category,
      sku: newItem.sku || `SKU-${Date.now().toString().slice(-4)}`,
      desc: newItem.desc || "Hand-harvested fresh produce, inspected with AI Quality Control.",
      origin: "Local Farm Partner",
      price: priceNum,
      priceStr: `Rp ${priceNum.toLocaleString("id-ID")}`,
      basePrice: Math.round(priceNum * 0.75),
      stockKg: stockNum,
      stockStatus: stockNum > 50 ? "In Stock" : "Low Stock",
      unit: "/kg",
      grade: newItem.grade,
      freshnessScore: Math.floor(Math.random() * 10) + 90,
      harvestDate: "Harvested Today",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?q=80&w=400&auto=format&fit=crop",
    };

    setCatalog((prev) => [item, ...prev]);
    setShowAddModal(false);
    setNewItem({
      name: "",
      category: "Apples",
      sku: "",
      price: "",
      stockKg: "",
      grade: "Grade A+",
      desc: "",
    });
  };

  const totalStockKg = catalog.reduce((acc, curr) => acc + curr.stockKg, 0);
  const lowStockCount = catalog.filter((item) => item.stockStatus === "Low Stock").length;
  const gradeAPercentage = Math.round(
    (catalog.filter((i) => i.grade.includes("Grade A")).length / catalog.length) * 100
  );

  return (
    <div className="min-h-full bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 pt-2 pb-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#71C168]">
              Fruit Catalog
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage fruit varieties, real-time stock levels, pricing, and AI quality grading.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#71C168] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#5fa957] transition-all transform active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Fruit</span>
          </button>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">Total Items</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#71C168]/10 text-[#71C168]">
                <Package className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#1F2937]">{catalog.length}</span>
              <span className="text-xs text-gray-500">varieties listed</span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">Total Stock</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Layers className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#1F2937]">{totalStockKg.toLocaleString()}</span>
              <span className="text-xs text-gray-500">units available</span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">Low Stock Alerts</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600">{lowStockCount}</span>
              <span className="text-xs text-gray-500">items need restock</span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">Grade A Quality</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600">{gradeAPercentage}%</span>
              <span className="text-xs text-gray-500">premium standard</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs md:flex-row md:items-center md:justify-between">
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

          <div className="flex flex-wrap items-center gap-2">
            {/* Categories matching benchmark */}
            <div className="flex flex-wrap gap-2">
              {PRODUCT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
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

            {/* Grade filter */}
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 focus:border-[#71C168] focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Grades</option>
              <option value="Grade A+">Grade A+</option>
              <option value="Grade A">Grade A</option>
              <option value="Grade B">Grade B</option>
            </select>
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs hover:shadow-md hover:border-gray-300 transition-all duration-200"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative mb-3.5 aspect-4/3 w-full overflow-hidden rounded-xl bg-[#F3F4F6] flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2.5 left-2.5 flex gap-1">
                    <span className="rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-bold text-[#1E7B34] shadow-2xs backdrop-blur-xs">
                      {item.grade}
                    </span>
                    <span className="rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold text-white">
                      {item.freshnessScore}% Fresh
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold shadow-xs ${
                        item.stockStatus === "In Stock"
                          ? "bg-[#4CAF50] text-white"
                          : "bg-amber-500 text-white"
                      }`}
                    >
                      {item.stockStatus}
                    </span>
                  </div>
                </div>

                {/* Title & SKU */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {item.category} • {item.sku}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-[#1F2937] group-hover:text-[#71C168] transition-colors mt-0.5 leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price & Stock Stats */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-[11px] text-gray-400">Price / Unit</span>
                    <p className="text-base font-black text-[#1E7B34]">
                      {item.priceStr}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-gray-400">Stock</span>
                    <p className="text-xs font-bold text-gray-700">{item.stockKg} units</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-3 text-sm font-bold text-gray-900">No fruits found</h3>
            <p className="mt-1 text-xs text-gray-500">
              Try adjusting your search query or filter to find what you&apos;re looking for.
            </p>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-[#1F2937]">Add Fruit to Catalog</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddItem} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-600">Fruit Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Honey Sweet Mango"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-xs focus:border-[#71C168] focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-600">Category</label>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                      className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-xs focus:border-[#71C168] focus:outline-hidden"
                    >
                      <option value="Apples">Apples</option>
                      <option value="Citrus">Citrus</option>
                      <option value="Berries">Berries</option>
                      <option value="Tropical">Tropical</option>
                      <option value="Mangoes">Mangoes</option>
                      <option value="Avocados">Avocados</option>
                      <option value="Exotic">Exotic</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600">QC Grade</label>
                    <select
                      value={newItem.grade}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          grade: e.target.value as "Grade A+" | "Grade A" | "Grade B",
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-xs focus:border-[#71C168] focus:outline-hidden"
                    >
                      <option value="Grade A+">Grade A+</option>
                      <option value="Grade A">Grade A</option>
                      <option value="Grade B">Grade B</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-600">Price / Unit (Rp)</label>
                    <input
                      type="number"
                      required
                      placeholder="25000"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-xs focus:border-[#71C168] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600">Initial Stock (Units)</label>
                    <input
                      type="number"
                      required
                      placeholder="100"
                      value={newItem.stockKg}
                      onChange={(e) => setNewItem({ ...newItem, stockKg: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-xs focus:border-[#71C168] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="w-1/2 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 rounded-xl bg-[#71C168] py-2.5 text-xs font-bold text-white hover:bg-[#5fa957] cursor-pointer"
                  >
                    Save Fruit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
