"use client";

import { useState, useRef, useEffect } from "react";
import {
  Leaf,
  SendHorizontal,
  Image as ImageIcon,
  ShoppingCart,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Handshake,
  ArrowRight,
} from "lucide-react";
import { useCart } from "../context/CartContext";

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

interface ProductItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  stockStatus: "In Stock" | "Low Stock";
  image: string;
  basePrice: number;
}

const initialProducts: ProductItem[] = [
  {
    id: "fuji-apples",
    name: "Fuji Apples",
    price: 45000,
    unit: "kg",
    stockStatus: "In Stock",
    image: "/fuji_apples.jpg",
    basePrice: 35000,
  },
  {
    id: "granny-smith",
    name: "Granny Smith",
    price: 52000,
    unit: "kg",
    stockStatus: "Low Stock",
    image: "/granny_smith.jpg",
    basePrice: 40000,
  },
];

const defaultInitialMessages: ChatMessage[] = [
  {
    id: "m-1",
    sender: "bot",
    text: "Hello! I'm your FruitMarket assistant. Looking for something specific, or need recommendations on today's freshest arrivals?",
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
  const { addToCart, setIsCartOpen } = useCart();
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
        unit: product.unit,
        image: product.image,
        stockStatus: product.stockStatus,
      },
      1
    );
    showToast(`Added ${product.name} to cart!`);
  };

  const startNego = (product: ProductItem) => {
    setActiveNegoProduct(product);
    setInputVal(`Saya ingin tawar ${product.name} di harga Rp `);
    inputRef.current?.focus();
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputVal.trim() || loading) return;

    const userText = inputVal.trim();
    const currentProduct = activeNegoProduct || initialProducts[0];

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
        text: data.pesan_untuk_pembeli || "Tawaran Anda sedang diproses oleh AgroBot.",
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
          text: "Maaf, terjadi kendala saat memproses penawaran Anda. Silakan coba lagi.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#F9FAFB] relative overflow-hidden">
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
                      className={`rounded-2xl border p-3 transition-all inline-block max-w-xl w-full ${
                        msg.dealInfo.isDeal
                          ? "border-[#71C168]/40 bg-[#71C168]/10"
                          : "border-gray-200 bg-white shadow-xs"
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
                                initialProducts.find((p) => p.name === msg.dealInfo?.productName) ||
                                initialProducts[0];
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

                  {/* Product Cards Grid (Matching screenshot layout) */}
                  {msg.showProducts && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-1 w-full">
                      {initialProducts.map((product) => (
                        <div
                          key={product.id}
                          className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs transition-all hover:shadow-md hover:border-gray-300 flex flex-col"
                        >
                          {/* Image Container with Stock Badge */}
                          <div className="relative aspect-4/3 w-full bg-gray-100 overflow-hidden">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                            {/* Stock Badge matching screenshot */}
                            <div className="absolute top-3 left-3">
                              {product.stockStatus === "In Stock" ? (
                                <span className="rounded-md bg-[#4CAF50] px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs">
                                  In Stock
                                </span>
                              ) : (
                                <span className="rounded-md bg-[#84CC16] px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs">
                                  Low Stock
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Product Info */}
                          <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                            <div>
                              <h3 className="text-base font-bold text-[#1F2937]">{product.name}</h3>
                              <div className="mt-1 flex items-baseline gap-1">
                                <span className="text-lg font-black text-[#1E7B34]">
                                  Rp {product.price.toLocaleString("id-ID")}
                                </span>
                                <span className="text-xs font-medium text-gray-500">
                                  /{product.unit}
                                </span>
                              </div>
                            </div>

                            {/* Actions: Add to Cart and Nego */}
                            <div className="space-y-2 pt-1">
                              <button
                                onClick={() => handleAddToCart(product)}
                                className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#71C168] bg-white py-2 px-3 text-xs font-bold text-[#1E7B34] transition-colors hover:bg-[#71C168]/10 cursor-pointer shadow-2xs"
                              >
                                <ShoppingCart className="h-3.5 w-3.5" />
                                <span>Add to Cart</span>
                              </button>

                              <button
                                onClick={() => startNego(product)}
                                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gray-50 py-1.5 px-3 text-[11px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                              >
                                <Handshake className="h-3.5 w-3.5 text-[#71C168]" />
                                <span>Nego Harga Grosir / Bulk</span>
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

          // User message bubble (Forest Green Pill matching screenshot)
          return (
            <div key={msg.id} className="flex items-center justify-end gap-3 pl-12">
              <div className="rounded-2xl bg-[#195328] px-4 py-2 text-sm font-medium text-white shadow-xs">
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
              <span>AgroBot is calculating pricing policy & fresh inventory...</span>
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
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-[#71C168] transition-colors"
              title="Attach Produce Photo"
            >
              <ImageIcon className="h-4 w-4" />
            </button>

            {/* Input Box matching screenshot */}
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask about fruits, stock, or delivery..."
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-[#1F2937] placeholder-gray-400 shadow-2xs focus:border-[#71C168] focus:outline-none focus:ring-2 focus:ring-[#71C168]/20 transition-all"
              />
            </div>

            {/* Send Button matching screenshot */}
            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#195328] hover:bg-[#134220] disabled:opacity-50 text-white shadow-xs transition-all cursor-pointer"
              title="Send Message"
            >
              <SendHorizontal className="h-4 w-4" />
            </button>
          </form>

          {/* Disclaimer text below input */}
          <p className="text-center text-[11px] text-gray-400">
            AI responses may occasionally be inaccurate. Please verify stock in the main catalog.
          </p>
        </div>
      </div>
    </div>
  );
}
