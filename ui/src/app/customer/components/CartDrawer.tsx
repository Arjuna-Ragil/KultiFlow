"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { X, Trash2, Plus, Minus, ShoppingBag, Sparkles, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";

export function CartDrawer() {
  const router = useRouter();
  const {
    isCartOpen,
    setIsCartOpen,
    items,
    updateQuantity,
    removeFromCart,
    totalPrice,
    totalItems,
    clearBuyNow,
  } = useCart();

  if (!isCartOpen) return null;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCheckout = () => {
    clearBuyNow();
    setIsCartOpen(false);
    router.push("/customer/order?mode=cart");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#71C168]/15 text-[#71C168]">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1F2937]">Shopping Cart</h2>
                <p className="text-xs text-gray-500">{totalItems} items in your basket</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
              title="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className={`flex-1 overflow-y-auto p-6 ${items.length === 0 ? "flex items-center justify-center" : "space-y-4"}`}>
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center text-gray-400 my-auto">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 border border-gray-100 mb-4 shadow-2xs">
                  <ShoppingBag className="h-8 w-8 stroke-1 text-gray-300" />
                </div>
                <p className="text-base font-bold text-gray-700">Your cart is empty</p>
                <p className="text-xs text-gray-400 mt-1.5 max-w-xs leading-relaxed">
                  Ask AgroBot in AI Negotiator to find and negotiate the freshest deals!
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3.5 rounded-2xl border border-gray-100 bg-[#F9FAFB]/80 hover:bg-[#F9FAFB] transition-colors"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 rounded-xl object-cover border border-gray-200"
                  />
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-[#1F2937] truncate">{item.name}</h4>
                        {item.isNegotiated && (
                          <span className="inline-flex items-center gap-1 mt-0.5 rounded-md bg-[#71C168]/15 px-2 py-0.5 text-[10px] font-bold text-[#1E7B34]">
                            <Sparkles className="h-3 w-3" /> Nego Deal
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <span className="text-sm font-black text-[#1E7B34]">
                          {formatPrice(item.price)}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">/{item.unit}</span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1 shadow-2xs">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-gray-500 hover:text-[#71C168] transition-colors cursor-pointer"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-xs font-bold text-gray-700 min-w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-gray-500 hover:text-[#71C168] transition-colors cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-white space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Estimated Delivery</span>
                  <span className="text-[#71C168] font-semibold">Standard / Express Available</span>
                </div>
                <div className="flex justify-between text-base font-black text-[#1F2937] pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-[#1E7B34]">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3.5 rounded-xl bg-[#71C168] hover:bg-[#60ab58] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Form Order</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
