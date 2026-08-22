"use client";

import { useState, useRef, useEffect } from "react";
import {
  Leaf,
  SendHorizontal,
  Image as ImageIcon,
  ShoppingCart,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Handshake,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { UNIFIED_PRODUCTS, ProductItem } from "@/lib/products";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  showProducts?: boolean;
  dealInfo?: {
    isDeal: boolean;
    price: number;
    turnsLeft: number;
    productName: string;
  };
}

const defaultInitialMessages: ChatMessage[] = [
  {
    id: "m-1",
    sender: "bot",
    text: "Hello! I'm your KultiFlow AI assistant. Looking for something specific, or need wholesale recommendations on today's freshest harvests?",
    timestamp: "10:30 AM",
  },
  {
    id: "m-2",
    sender: "user",
    text: "Find me fresh Apples",
    timestamp: "10:31 AM",
  },
  {
    id: "m-3",
    sender: "bot",
    text: "Here are the freshest apples currently in stock from our local orchards:",
    timestamp: "10:31 AM",
    showProducts: true,
  },
];

export default function AINegotiatorPage() {
  const { addToCart } = useCart();
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("kf_customer_chat");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return defaultInitialMessages;
  });

  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeNegoProduct, setActiveNegoProduct] = useState<ProductItem | null>(null);
  const [sessionId] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("kf_nego_sess_id");
      if (saved) return saved;
      const newId = `sess_${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem("kf_nego_sess_id", newId);
      return newId;
    }
    return `sess_${Math.random().toString(36).slice(2, 9)}`;
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    if (typeof window !== "undefined") {
      sessionStorage.setItem("kf_customer_chat", JSON.stringify(messages));
    }
  }, [messages, loading]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = (product: ProductItem, customPrice?: number, isNegotiated?: boolean) => {
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: customPrice ?? product.price,
        originalPrice: product.price,
        isNegotiated: isNegotiated ?? false,
        unit: product.unit.replace("/", ""),
        image: product.image,
        stockStatus: product.stockStatus,
      },
      1
    );
    showToast(`Added ${product.name} to cart!`);
  };

  const startNego = (product: ProductItem) => {
    setActiveNegoProduct(product);
    setInputVal(`I would like to offer ${product.name} at Rp `);
    inputRef.current?.focus();
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputVal.trim() || loading) return;

    const userText = inputVal.trim();
    const currentProduct = activeNegoProduct || UNIFIED_PRODUCTS[0];

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setLoading(true);

    try {
      const res = await fetch("/api/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          user_message: userText,
          product_name: currentProduct.name,
          base_price: currentProduct.basePrice,
          urgency_score: currentProduct.stockStatus === "Low Stock" ? 0.6 : 0.2,
        }),
      });

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: "bot",
        text: data.pesan_untuk_pembeli || "Your offer is being evaluated by AgroBot.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        dealInfo: {
          isDeal: Boolean(data.deal),
          price: data.harga_terakhir || currentProduct.price,
          turnsLeft: data.sisa_kesempatan ?? 2,
          productName: currentProduct.name,
        },
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Negotiation error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: "bot",
          text: "Sorry, an error occurred while processing your negotiation offer. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#F9FAFB] relative overflow-hidden">
      {/* Page Header */}
      <div className="px-6 sm:px-8 pt-2 pb-3 bg-white border-b border-gray-100 shrink-0">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#71C168]">
          AI Negotiator
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Smart bargaining assistant for wholesale &amp; bulk fresh produce orders.
        </p>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2 rounded-xl bg-[#1F2937] px-4 py-3 text-sm font-semibold text-white shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="h-4 w-4 text-[#71C168]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Chat Stream Container */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 w-full space-y-4">
        {messages.map((msg) => {
          if (msg.sender === "bot") {
            return (
              <div key={msg.id} className="flex items-start gap-3 w-full">
                {/* Bot Green Leaf Avatar */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#71C168] text-white shadow-xs">
                  <Leaf className="h-4 w-4" />
                </div>

                <div className="space-y-2 flex-1">
                  {/* Bot Message Bubble */}
                  <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-4 py-2.5 text-sm text-[#1F2937] shadow-xs leading-relaxed inline-block">
                    {msg.text}
                  </div>

                  {/* Deal Banner if Deal accepted or in negotiation */}
                  {msg.dealInfo && (
                    <div
                      className={`rounded-2xl border p-3.5 transition-all inline-block max-w-xl w-full ${
                        msg.dealInfo.isDeal
                          ? "border-[#71C168]/40 bg-[#71C168]/10"
                          : "border-gray-200 bg-white shadow-2xs"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          {msg.dealInfo.isDeal ? (
                            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#71C168] text-white">
                              <Handshake className="h-3.5 w-3.5" />
                            </div>
                          ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                              <Sparkles className="h-3.5 w-3.5" />
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-semibold text-gray-500">
                              {msg.dealInfo.isDeal ? "Deal Reached!" : "Current AI Offer"}
                            </p>
                            <p className="text-sm font-bold text-[#1F2937]">
                              {msg.dealInfo.productName} •{" "}
                              <span className="text-[#1E7B34]">
                                Rp {msg.dealInfo.price.toLocaleString("id-ID")}/kg
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!msg.dealInfo.isDeal && (
                            <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                              Turns left: {msg.dealInfo.turnsLeft}
                            </span>
                          )}
                          <button
                            onClick={() => {
                              const found =
                                UNIFIED_PRODUCTS.find((p) => p.name === msg.dealInfo?.productName) ||
                                UNIFIED_PRODUCTS[0];
                              handleAddToCart(found, msg.dealInfo?.price, msg.dealInfo?.isDeal);
                            }}
                            className="flex items-center gap-1.5 rounded-xl bg-[#71C168] hover:bg-[#60ab58] px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            <span>Add at this Price</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Product Cards Grid (Consistent Unified Benchmark Styling) */}
                  {msg.showProducts && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-1 w-full">
                      {UNIFIED_PRODUCTS.slice(0, 4).map((product) => (
                        <div
                          key={product.id}
                          className="flex flex-col bg-white rounded-2xl p-4 shadow-2xs border border-gray-200/80 hover:shadow-md hover:border-gray-300 transition-all group relative"
                        >
                          {/* Image Container with Grade & Stock Badges */}
                          <div className="relative w-full aspect-4/3 bg-[#F3F4F6] rounded-xl flex items-center justify-center overflow-hidden mb-3.5">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {/* Grade Badge */}
                            <div className="absolute top-2.5 left-2.5">
                              <span className="rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-bold text-[#1E7B34] shadow-2xs backdrop-blur-xs">
                                {product.grade}
                              </span>
                            </div>
                            {/* Stock Badge */}
                            <div className="absolute top-2.5 right-2.5">
                              {product.stockStatus === "In Stock" ? (
                                <span className="rounded-md bg-[#4CAF50] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                                  In Stock
                                </span>
                              ) : (
                                <span className="rounded-md bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                                  Low Stock
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="font-bold text-[#1F2937] text-sm sm:text-base leading-tight">
                                {product.name}
                              </h3>
                              <p className="text-xs text-gray-500 mb-3 mt-1 line-clamp-2 leading-relaxed">
                                {product.desc}
                              </p>
                              <div className="flex items-baseline gap-1">
                                <span className="font-black text-[#1E7B34] text-base">
                                  {product.priceStr}
                                </span>
                                <span className="text-xs font-medium text-gray-400">
                                  {product.unit}
                                </span>
                              </div>
                            </div>

                            {/* Actions: Add to Cart and Nego */}
                            <div className="space-y-2 pt-3 mt-3 border-t border-gray-100">
                              <button
                                onClick={() => handleAddToCart(product)}
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#71C168] hover:bg-[#60ab58] py-2 px-3 text-xs font-bold text-white transition-all shadow-md hover:shadow-lg cursor-pointer"
                              >
                                <ShoppingCart className="h-3.5 w-3.5" />
                                <span>Add to Cart</span>
                              </button>

                              <button
                                onClick={() => startNego(product)}
                                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 py-1.5 px-3 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                              >
                                <Handshake className="h-3.5 w-3.5 text-[#71C168]" />
                                <span>Negotiate Wholesale / Bulk Price</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // User message bubble (#71C168 Green Pill)
          return (
            <div key={msg.id} className="flex items-center justify-end gap-3 pl-12">
              <div className="rounded-2xl bg-[#71C168] px-4 py-2.5 text-sm font-medium text-white shadow-xs leading-relaxed">
                {msg.text}
              </div>

              {/* User Avatar */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white overflow-hidden shadow-2xs">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop"
                  alt="User"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start gap-3 w-full animate-in fade-in duration-150">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#71C168] text-white shadow-xs">
              <Leaf className="h-4 w-4 animate-pulse" />
            </div>
            <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-4 py-2 text-xs text-gray-500 shadow-xs flex items-center gap-2 inline-block">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#71C168]" />
              <span>AgroBot is calculating pricing policy &amp; fresh inventory...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Area at Bottom */}
      <div className="border-t border-gray-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3 shrink-0">
        <div className="w-full space-y-2">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3 w-full">
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => showToast("Produce image analysis ready for QC negotiation.")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-[#71C168] transition-colors cursor-pointer"
              title="Attach Produce Photo"
            >
              <ImageIcon className="h-4 w-4" />
            </button>

            {/* Input Box */}
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask about fruits, stock, or bulk negotiation..."
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-[#1F2937] placeholder-gray-400 shadow-2xs focus:border-[#71C168] focus:outline-none focus:ring-2 focus:ring-[#71C168]/20 transition-all"
              />
            </div>

            {/* Send Button (#71C168) */}
            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#71C168] hover:bg-[#60ab58] disabled:opacity-50 text-white shadow-xs transition-all cursor-pointer"
              title="Send Message"
            >
              <SendHorizontal className="h-4 w-4" />
            </button>
          </form>

          {/* Disclaimer text below input */}
          <p className="text-center text-[11px] text-gray-400">
            AI responses may occasionally vary based on current live inventory and market conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
