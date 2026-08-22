"use client";

import { useState } from "react";
import {
  ShoppingBag,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Tag,
  Package,
  Layers,
  Edit3,
  Trash2
} from "lucide-react";

interface FruitItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  pricePerKg: number;
  stockKg: number;
  grade: "Grade A" | "Grade B" | "Grade C";
  freshnessScore: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  image: string;
}

const INITIAL_CATALOG: FruitItem[] = [
  {
    id: "FRU-001",
    name: "Cavendish Bananas",
    category: "Tropical",
    sku: "BAN-CAV-01",
    pricePerKg: 18500,
    stockKg: 420,
    grade: "Grade A",
    freshnessScore: 94,
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "FRU-002",
    name: "Fuji Apples",
    category: "Temperate",
    sku: "APP-FUJ-02",
    pricePerKg: 35000,
    stockKg: 180,
    grade: "Grade A",
    freshnessScore: 91,
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "FRU-003",
    name: "Harumanis Mango",
    category: "Tropical",
    sku: "MAN-HRM-03",
    pricePerKg: 42000,
    stockKg: 45,
    grade: "Grade A",
    freshnessScore: 88,
    status: "Low Stock",
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "FRU-004",
    name: "Valencia Oranges",
    category: "Citrus",
    sku: "ORG-VAL-04",
    pricePerKg: 28000,
    stockKg: 310,
    grade: "Grade B",
    freshnessScore: 82,
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "FRU-005",
    name: "Red Dragon Fruit",
    category: "Tropical",
    sku: "DRA-RED-05",
    pricePerKg: 24000,
    stockKg: 20,
    grade: "Grade B",
    freshnessScore: 78,
    status: "Low Stock",
    image: "https://images.unsplash.com/photo-1527325678964-54921661f888?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: "FRU-006",
    name: "SunGold Kiwi",
    category: "Exotic",
    sku: "KIW-GLD-06",
    pricePerKg: 65000,
    stockKg: 95,
    grade: "Grade A",
    freshnessScore: 96,
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1585059895524-72359e06133a?q=80&w=300&auto=format&fit=crop",
  },
];

export default function AdminCatalogPage() {
  const [catalog, setCatalog] = useState<FruitItem[]>(INITIAL_CATALOG);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedGrade, setSelectedGrade] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  // New item form state
  const [newItem, setNewItem] = useState({
    name: "",
    category: "Tropical",
    sku: "",
    pricePerKg: "",
    stockKg: "",
    grade: "Grade A" as "Grade A" | "Grade B" | "Grade C",
  });

  const categories = ["All", "Tropical", "Temperate", "Citrus", "Exotic"];

  const filteredItems = catalog.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesGrade = selectedGrade === "All" || item.grade === selectedGrade;
    return matchesSearch && matchesCategory && matchesGrade;
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.pricePerKg || !newItem.stockKg) return;

    const item: FruitItem = {
      id: `FRU-${String(catalog.length + 1).padStart(3, "0")}`,
      name: newItem.name,
      category: newItem.category,
      sku: newItem.sku || `SKU-${Date.now().toString().slice(-4)}`,
      pricePerKg: Number(newItem.pricePerKg),
      stockKg: Number(newItem.stockKg),
      grade: newItem.grade,
      freshnessScore: Math.floor(Math.random() * 15) + 85,
      status: Number(newItem.stockKg) > 50 ? "In Stock" : "Low Stock",
      image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?q=80&w=300&auto=format&fit=crop",
    };

    setCatalog((prev) => [item, ...prev]);
    setShowAddModal(false);
    setNewItem({
      name: "",
      category: "Tropical",
      sku: "",
      pricePerKg: "",
      stockKg: "",
      grade: "Grade A",
    });
  };

  const totalStockKg = catalog.reduce((acc, curr) => acc + curr.stockKg, 0);
  const lowStockCount = catalog.filter((item) => item.status === "Low Stock").length;
  const gradeAPercentage = Math.round(
    (catalog.filter((i) => i.grade === "Grade A").length / catalog.length) * 100
  );

  return (
    <div className="min-h-full bg-gray-50 p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#71C168]">
            <Layers className="h-4 w-4" />
            <span>Produce Inventory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] mt-1">
            Fruit Catalog & Produce Hub
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage fruit varieties, real-time stock levels, pricing, and AI quality grading.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#71C168] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#5fa957] transition-all transform active:scale-95"
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
            <span className="text-xs text-gray-500">kg available</span>
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
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search fruit by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-[#71C168] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#71C168]/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Categories */}
          <div className="flex items-center gap-1 rounded-xl bg-gray-100/80 p-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-white text-[#71C168] shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
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
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 focus:border-[#71C168] focus:outline-hidden"
          >
            <option value="All">All Grades</option>
            <option value="Grade A">Grade A</option>
            <option value="Grade B">Grade B</option>
            <option value="Grade C">Grade C</option>
          </select>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs hover:shadow-md transition-all duration-200"
          >
            <div>
              {/* Image & Badges */}
              <div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl bg-gray-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='100%' height='100%' fill='%23F3F4F6'/><text x='50%' y='50%' fill='%2371C168' font-size='20' font-family='sans-serif' font-weight='bold' text-anchor='middle'>Fresh Fruit</text></svg>";
                  }}
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold shadow-xs ${
                      item.grade === "Grade A"
                        ? "bg-emerald-500 text-white"
                        : item.grade === "Grade B"
                          ? "bg-amber-500 text-white"
                          : "bg-orange-500 text-white"
                    }`}
                  >
                    {item.grade}
                  </span>
                  <span className="rounded-lg bg-black/60 backdrop-blur-xs px-2.5 py-1 text-xs font-semibold text-white">
                    {item.freshnessScore}% Fresh
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold shadow-xs ${
                      item.status === "In Stock"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-red-50 text-red-600 border border-red-200"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Title & SKU */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    {item.category} • {item.sku}
                  </span>
                  <h3 className="text-lg font-bold text-[#1F2937] group-hover:text-[#71C168] transition-colors">
                    {item.name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Price & Stock Stats */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-xs text-gray-500">Price / Kg</span>
                  <p className="text-lg font-black text-[#1F2937]">
                    Rp {item.pricePerKg.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">Available Stock</span>
                  <p className="text-sm font-bold text-gray-700">{item.stockKg} kg</p>
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
                className="text-gray-400 hover:text-gray-600 font-bold"
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
                  className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:border-[#71C168] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:border-[#71C168] focus:outline-hidden"
                  >
                    <option value="Tropical">Tropical</option>
                    <option value="Temperate">Temperate</option>
                    <option value="Citrus">Citrus</option>
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
                        grade: e.target.value as "Grade A" | "Grade B" | "Grade C",
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:border-[#71C168] focus:outline-hidden"
                  >
                    <option value="Grade A">Grade A</option>
                    <option value="Grade B">Grade B</option>
                    <option value="Grade C">Grade C</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600">Price / Kg (Rp)</label>
                  <input
                    type="number"
                    required
                    placeholder="25000"
                    value={newItem.pricePerKg}
                    onChange={(e) => setNewItem({ ...newItem, pricePerKg: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:border-[#71C168] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600">Initial Stock (Kg)</label>
                  <input
                    type="number"
                    required
                    placeholder="100"
                    value={newItem.stockKg}
                    onChange={(e) => setNewItem({ ...newItem, stockKg: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:border-[#71C168] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 rounded-xl bg-[#71C168] py-2.5 text-sm font-bold text-white hover:bg-[#5fa957]"
                >
                  Save Fruit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
