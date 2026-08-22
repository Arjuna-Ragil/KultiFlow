"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";

const categories = ["All Fruits", "Citrus", "Berries", "Tropical"];

export type Product = {
  id: string;
  name: string;
  desc: string;
  price: number;
  priceStr: string;
  unit: string;
  tag?: string;
  tagColor?: string;
  category: string;
  image: string;
  isFeatured?: boolean;
};

export const dummyProducts: Product[] = [
  {
    id: "prod-avocado",
    name: "Organic Hass Avocados",
    desc: "Rich, nutty flavor with a creamy texture. Harvested at peak ripeness.",
    price: 45000,
    priceStr: "Rp 45.000",
    unit: "/kg",
    tag: "BEST SELLER",
    tagColor: "bg-[#71C168] text-white",
    category: "Tropical",
    image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=400&auto=format&fit=crop",
    isFeatured: true,
  },
  {
    id: "prod-strawberry",
    name: "Premium Strawberries",
    desc: "Plump, vibrant red, and naturally sweet highland strawberries.",
    price: 85000,
    priceStr: "Rp 85.000",
    unit: "/kg",
    tag: "FRESH HARVEST",
    tagColor: "bg-[#1E7B34] text-white",
    category: "Berries",
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=400&auto=format&fit=crop",
    isFeatured: true,
  },
  {
    id: "1",
    name: "Premium Fuji Apple",
    desc: "Crisp, sweet, and perfectly balanced direct from Malang highland orchards.",
    price: 45000,
    priceStr: "Rp 45.000",
    unit: "/kg",
    tag: "FEATURED SEASON",
    tagColor: "bg-[#71C168] text-white",
    category: "Berries",
    image: "/fuji_apples.jpg",
    isFeatured: true,
  },
  {
    id: "2",
    name: "Valencia Orange",
    desc: "Juicy and sweet, perfect for fresh pressing and bulk retail.",
    price: 32000,
    priceStr: "Rp 32.000",
    unit: "/kg",
    tag: "In Stock",
    tagColor: "bg-gray-200 text-gray-700",
    category: "Citrus",
    image: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "3",
    name: "Honeygold Pineapple",
    desc: "Exceptionally sweet core, practically zero acidity, ready to slice.",
    price: 55000,
    priceStr: "Rp 55.000",
    unit: "/pcs",
    tag: "Low Stock",
    tagColor: "bg-amber-100 text-amber-800",
    category: "Tropical",
    image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "4",
    name: "Cavendish Banana",
    desc: "Classic, versatile, and packed with natural sweetness and energy.",
    price: 22000,
    priceStr: "Rp 22.000",
    unit: "/kg",
    tag: "In Stock",
    tagColor: "bg-gray-200 text-gray-700",
    category: "Tropical",
    image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "granny-smith",
    name: "Granny Smith Apple",
    desc: "Tart, firm, and excellent for gourmet culinary & juice blends.",
    price: 52000,
    priceStr: "Rp 52.000",
    unit: "/kg",
    tag: "Low Stock",
    tagColor: "bg-amber-100 text-amber-800",
    category: "Citrus",
    image: "/granny_smith.jpg",
  },
];

export default function CustomerProductsPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All Fruits");
  const { addToCart, startBuyNow } = useCart();

  const filteredProducts = dummyProducts.filter((product) =>
    activeCategory === "All Fruits" ? true : product.category === activeCategory
  );

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.price,
      unit: product.unit.replace("/", ""),
      image: product.image,
      stockStatus: product.tag === "Low Stock" ? "Low Stock" : "In Stock",
    });
  };

  const handleBuyNow = (product: Product) => {
    startBuyNow(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.price,
        unit: product.unit.replace("/", ""),
        image: product.image,
        stockStatus: product.tag === "Low Stock" ? "Low Stock" : "In Stock",
      },
      1
    );
    router.push("/customer/order?mode=buynow");
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 pt-2 pb-8 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#71C168]">
            Fresh Arrivals
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Discover our hand-picked selection of organic, seasonal fruits sourced directly from local farmers
          </p>
        </div>

        {/* Categories Filter - Aligned with the subtext on the baseline */}
        <div className="flex flex-wrap gap-2 md:pb-0.5 shrink-0">
          {categories.map((category) => (
            <button
              key={category}
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

              {/* Tag */}
              {product.tag && (
                <div
                  className={`absolute top-2.5 right-2.5 px-2 py-0.5 text-[10px] font-bold rounded-md z-10 shadow-xs ${product.tagColor}`}
                >
                  {product.tag}
                </div>
              )}
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
                    title="Tambah ke Keranjang"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            No fruits found in this category.
          </div>
        )}
      </div>
    </div>
  );
}

