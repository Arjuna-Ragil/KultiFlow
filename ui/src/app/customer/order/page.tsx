"use client";

import { useState, useMemo, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Trash2,
  Plus,
  Search,
  ChevronDown,
  Download,
  Calendar,
  Sparkles,
  ArrowLeft,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { useCart, CartItem } from "../context/CartContext";
import { dummyProducts, Product } from "../products/page";

function OrderFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNowMode = searchParams.get("mode") === "buynow";

  const {
    items: cartItems,
    directOrderItem,
    clearCart,
    clearBuyNow,
    showToast,
  } = useCart();

  // Local state for Order Lines
  const [orderLines, setOrderLines] = useState<CartItem[]>([]);

  // Logistics Form State
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [shippingDate, setShippingDate] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("Standard Freight (3-5 Days)");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  // Search / Add Product state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Modal / Feedback State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState("");

  // Initialize Order Lines based on mode
  useEffect(() => {
    if (isBuyNowMode) {
      if (directOrderItem) {
        setOrderLines([directOrderItem]);
      } else if (typeof window !== "undefined") {
        const saved = sessionStorage.getItem("kf_buy_now_item");
        if (saved) {
          try {
            setOrderLines([JSON.parse(saved)]);
            return;
          } catch {}
        }
        // Fallback
        setOrderLines([
          {
            id: dummyProducts[0].id,
            name: dummyProducts[0].name,
            price: dummyProducts[0].price,
            originalPrice: dummyProducts[0].price,
            unit: dummyProducts[0].unit.replace("/", ""),
            image: dummyProducts[0].image,
            quantity: 1,
            stockStatus: "In Stock",
          },
        ]);
      }
    } else {
      // Cart mode
      if (cartItems.length > 0) {
        setOrderLines(cartItems);
      } else {
        setOrderLines([
          {
            id: dummyProducts[0].id,
            name: dummyProducts[0].name,
            price: dummyProducts[0].price,
            originalPrice: dummyProducts[0].price,
            unit: dummyProducts[0].unit.replace("/", ""),
            image: dummyProducts[0].image,
            quantity: 500,
            stockStatus: "In Stock",
          },
        ]);
      }
    }
  }, [isBuyNowMode, directOrderItem, cartItems]);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Shipping cost based on delivery method
  const shippingCost = useMemo(() => {
    if (deliveryMethod.includes("Express")) return 2400000;
    if (deliveryMethod.includes("Same Day")) return 3500000;
    return 1200000; // Standard Freight
  }, [deliveryMethod]);

  // Calculations
  const untaxedAmount = useMemo(() => {
    return orderLines.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [orderLines]);

  const taxAmount = useMemo(() => {
    return Math.round(untaxedAmount * 0.11);
  }, [untaxedAmount]);

  const totalAmount = useMemo(() => {
    return untaxedAmount + taxAmount + (orderLines.length > 0 ? shippingCost : 0);
  }, [untaxedAmount, taxAmount, shippingCost, orderLines.length]);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filter products for Search box
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return dummyProducts.slice(0, 6);
    return dummyProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleUpdateOrderLineQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveOrderLine(id);
      return;
    }
    setOrderLines((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  const handleRemoveOrderLine = (id: string) => {
    setOrderLines((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddProductFromSearch = (product: Product) => {
    const newItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.price,
      unit: product.unit.replace("/", ""),
      image: product.image,
      quantity: isBuyNowMode ? 1 : 100,
      stockStatus: product.tag === "Low Stock" ? "Low Stock" : "In Stock",
    };
    setOrderLines((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + newItem.quantity,
        };
        return updated;
      }
      return [...prev, newItem];
    });
    setSearchQuery("");
    setIsSearchDropdownOpen(false);
    showToast(`${product.name} ditambahkan ke Order Lines`);
  };

  const handleConfirmOrder = () => {
    if (orderLines.length === 0) {
      showToast("Harap tambahkan minimal 1 produk kedalam Order Lines");
      return;
    }
    const newOrderId = `#ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    setConfirmedOrderId(newOrderId);

    if (typeof window !== "undefined") {
      const newOrder = {
        id: `ord-${Date.now()}`,
        orderNumber: newOrderId,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        status: "Processing",
        totalAmount,
        deliveryMethod,
        deliveryAddress: deliveryAddress || "Alamat Kantor / Gudang Utama",
        items: orderLines.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
          price: i.price,
          image: i.image,
        })),
      };
      const existing = JSON.parse(sessionStorage.getItem("kf_placed_orders") || "[]");
      sessionStorage.setItem("kf_placed_orders", JSON.stringify([newOrder, ...existing]));
    }

    if (!isBuyNowMode) {
      clearCart();
    } else {
      clearBuyNow();
    }

    setIsConfirmModalOpen(true);
  };

  const handleSaveDraft = () => {
    if (typeof window !== "undefined") {
      const draftData = {
        companyName,
        contactPerson,
        emailAddress,
        phoneNumber,
        shippingDate,
        deliveryMethod,
        deliveryAddress,
        internalNotes,
        items: orderLines,
        isBuyNowMode,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("kf_order_draft", JSON.stringify(draftData));
    }
    showToast("Draft pesanan berhasil disimpan!");
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 pt-2 pb-8 space-y-6">
      {/* Header Section */}
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={() => router.push("/customer/products")}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-[#71C168] transition-colors shadow-2xs cursor-pointer"
          title="Kembali ke Katalog"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#71C168]">
              Order Form
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {isBuyNowMode
              ? "Direct Single-Product Logistics Order (Independent from Cart)"
              : "Procurement & Direct Logistics Order Placement"}
          </p>
        </div>
      </div>

      {/* Main Grid: Left (Forms) & Right (Order Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Main Form: 8 Columns */}
        <div className="lg:col-span-8 space-y-4">
          {/* Card 1: Logistics Details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-2xs">
            <h2 className="text-base sm:text-lg font-bold text-[#1F2937] border-b border-gray-100 pb-2.5 mb-3.5">
              Logistics Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
              {/* Company Name */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Fresh Foods Inc."
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs sm:text-sm text-[#1F2937] placeholder-gray-400 focus:border-[#71C168] focus:ring-1.5 focus:ring-[#71C168]/20 transition-all outline-none"
                />
              </div>

              {/* Contact Person */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Full Name"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs sm:text-sm text-[#1F2937] placeholder-gray-400 focus:border-[#71C168] focus:ring-1.5 focus:ring-[#71C168]/20 transition-all outline-none"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="billing@company.com"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs sm:text-sm text-[#1F2937] placeholder-gray-400 focus:border-[#71C168] focus:ring-1.5 focus:ring-[#71C168]/20 transition-all outline-none"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+62 812-XXXX-XXXX"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs sm:text-sm text-[#1F2937] placeholder-gray-400 focus:border-[#71C168] focus:ring-1.5 focus:ring-[#71C168]/20 transition-all outline-none"
                />
              </div>

              {/* Requested Shipping Date */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Requested Shipping Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={shippingDate}
                    onChange={(e) => setShippingDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs sm:text-sm text-[#1F2937] focus:border-[#71C168] focus:ring-1.5 focus:ring-[#71C168]/20 transition-all outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Delivery Method */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Delivery Method
                </label>
                <div className="relative">
                  <select
                    value={deliveryMethod}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs sm:text-sm text-[#1F2937] focus:border-[#71C168] focus:ring-1.5 focus:ring-[#71C168]/20 transition-all outline-none cursor-pointer pr-8"
                  >
                    <option value="Standard Freight (3-5 Days)">Standard Freight (3-5 Days)</option>
                    <option value="Express Cold Chain (1-2 Days)">Express Cold Chain (1-2 Days)</option>
                    <option value="Same Day Fleet (Urgent B2B)">Same Day Fleet (Urgent B2B)</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Delivery Address */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Delivery Address
                </label>
                <textarea
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter complete warehouse or store address..."
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs sm:text-sm text-[#1F2937] placeholder-gray-400 focus:border-[#71C168] focus:ring-1.5 focus:ring-[#71C168]/20 transition-all outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Order Lines */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#1F2937]">Order Lines</h2>
                <span className="text-xs font-semibold text-gray-400">({orderLines.length} Items)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsSearchDropdownOpen((prev) => !prev)}
                className="text-xs font-bold text-[#1E7B34] hover:text-[#195328] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Product Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    <th className="pb-2.5 pl-1">PRODUCT</th>
                    <th className="pb-2.5 text-center">QTY (KG)</th>
                    <th className="pb-2.5 text-right">UNIT PRICE</th>
                    <th className="pb-2.5 text-right">SUBTOTAL</th>
                    <th className="pb-2.5 text-right pr-1 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orderLines.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-xs text-gray-400">
                        Belum ada produk di order lines. Gunakan &quot;+ Add Product&quot; atau cari produk di bawah.
                      </td>
                    </tr>
                  ) : (
                    orderLines.map((item) => (
                      <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                        {/* Product Info with Thumbnail */}
                        <td className="py-3 pl-1">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl object-cover border border-gray-200 shrink-0"
                            />
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-[#1F2937] leading-tight">
                                {item.name}
                              </p>
                              {item.isNegotiated && (
                                <span className="inline-flex items-center gap-1 mt-0.5 rounded bg-[#71C168]/15 px-1.5 py-0.5 text-[9px] font-bold text-[#1E7B34]">
                                  <Sparkles className="h-2.5 w-2.5" /> Nego Price
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* QTY Input Box */}
                        <td className="py-3 text-center">
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              handleUpdateOrderLineQuantity(item.id, isNaN(val) ? 0 : val);
                            }}
                            className="w-18 sm:w-20 rounded-md border border-gray-300 bg-white px-2 py-1 text-center text-xs sm:text-sm font-semibold text-[#1F2937] focus:border-[#71C168] focus:ring-1.5 focus:ring-[#71C168]/20 transition-all outline-none mx-auto inline-block"
                          />
                        </td>

                        {/* Unit Price */}
                        <td className="py-3 text-right text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
                          {formatPrice(item.price)}
                        </td>

                        {/* Subtotal */}
                        <td className="py-3 text-right text-xs sm:text-sm font-bold text-[#1F2937] whitespace-nowrap">
                          {formatPrice(item.price * item.quantity)}
                        </td>

                        {/* Delete Action */}
                        <td className="py-3 text-right pr-1">
                          <button
                            type="button"
                            onClick={() => handleRemoveOrderLine(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded cursor-pointer"
                            title="Hapus item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Quick Product Search / Add Bar */}
            <div className="mt-3 pt-2.5 border-t border-gray-100 relative" ref={searchContainerRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsSearchDropdownOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchDropdownOpen(true);
                  }}
                  placeholder="Search product..."
                  className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-xs sm:text-sm text-[#1F2937] placeholder-gray-400 focus:border-[#71C168] focus:ring-1.5 focus:ring-[#71C168]/20 transition-all outline-none"
                />
              </div>

              {/* Dropdown Suggestions */}
              {isSearchDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150 max-h-56 overflow-y-auto">
                  <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Pilih Produk untuk Ditambahkan
                  </div>
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleAddProductFromSearch(product)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#71C168]/10 text-left transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-8 w-8 rounded-lg object-cover border border-gray-200"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#1F2937]">{product.name}</p>
                          <span className="text-[10px] text-gray-400">{product.category}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#1E7B34]">{product.priceStr}</span>
                        <span className="text-[10px] text-gray-400 ml-1">{product.unit}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Internal Notes & Terms */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-2xs">
            <h2 className="text-base sm:text-lg font-bold text-[#1F2937] border-b border-gray-100 pb-2.5 mb-3.5">
              Internal Notes &amp; Terms
            </h2>
            <textarea
              rows={3}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="e.g. Forklift required at unloading dock, temperature log certificate required upon receipt..."
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs sm:text-sm text-[#1F2937] placeholder-gray-400 focus:border-[#71C168] focus:ring-1.5 focus:ring-[#71C168]/20 transition-all outline-none resize-none"
            />
          </div>
        </div>

        {/* Right Sticky Sidebar: 4 Columns (Dark Card Order Summary) */}
        <div className="lg:col-span-4 sticky top-6">
          <div className="rounded-2xl bg-[#1E293B] p-5 sm:p-6 text-white shadow-xl space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white border-b border-gray-700 pb-3">
              Order Summary
            </h2>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 text-xs sm:text-sm text-gray-300">
              <div className="flex justify-between items-center">
                <span>Untaxed Amount</span>
                <span className="font-semibold text-white">{formatPrice(untaxedAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Taxes (11%)</span>
                <span className="font-semibold text-white">{formatPrice(taxAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-white">
                  {orderLines.length > 0 ? formatPrice(shippingCost) : "Rp 0"}
                </span>
              </div>
            </div>

            {/* Total Row */}
            <div className="pt-3.5 border-t border-gray-700 flex justify-between items-baseline">
              <span className="text-sm sm:text-base font-bold text-white">Total</span>
              <span className="text-lg sm:text-2xl font-black text-[#4ADE80]">
                {formatPrice(totalAmount)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleConfirmOrder}
                className="w-full py-3 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirm Order</span>
              </button>

              <button
                type="button"
                onClick={handleSaveDraft}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-700 bg-transparent hover:bg-gray-800 text-gray-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer text-center"
              >
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsConfirmModalOpen(false)}
          />

          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-7 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2.5">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#71C168]/20 text-[#1E7B34]">
                <CheckCircle2 className="h-7 w-7 text-[#1E7B34]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1F2937]">Order Placed Successfully!</h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Pesanan pengadaan Anda telah dikonfirmasi dan langsung dijadwalkan ke armada logistik cold-chain.
              </p>
            </div>

            <div className="mt-5 rounded-xl bg-gray-50 p-3.5 border border-gray-200 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between py-1 border-b border-gray-200/70">
                <span className="font-semibold text-gray-500">Order ID</span>
                <span className="font-bold text-[#1E7B34]">{confirmedOrderId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/70">
                <span className="font-semibold text-gray-500">Company</span>
                <span className="font-semibold text-[#1F2937]">{companyName || "Fresh Foods Inc."}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/70">
                <span className="font-semibold text-gray-500">Shipping Date</span>
                <span className="font-semibold text-[#1F2937]">{shippingDate || "As Scheduled"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/70">
                <span className="font-semibold text-gray-500">Delivery Method</span>
                <span className="font-semibold text-[#1F2937]">{deliveryMethod}</span>
              </div>
              <div className="flex justify-between py-1 pt-2 font-bold text-sm text-[#1F2937]">
                <span>Total Amount</span>
                <span className="text-[#1E7B34]">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  router.push("/customer/products");
                }}
                className="w-full py-2.5 rounded-xl bg-[#71C168] hover:bg-[#60ab58] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                Kembali ke Katalog Produk
              </button>

              <button
                type="button"
                onClick={() => {
                  showToast("Invoice PDF sedang disiapkan untuk diunduh...");
                }}
                className="w-full py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Unduh Surat Jalan / Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderFormPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-400">Loading Order Form...</div>}>
      <OrderFormContent />
    </Suspense>
  );
}
