"use client";

import React, { createContext, useContext, useState } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  isNegotiated?: boolean;
  quantity: number;
  unit: string;
  image: string;
  stockStatus?: "In Stock" | "Low Stock" | "Out of Stock";
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  directOrderItem: CartItem | null;
  setDirectOrderItem: (item: CartItem | null) => void;
  startBuyNow: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  clearBuyNow: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  toggleCart: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [directOrderItem, setDirectOrderItemState] = useState<CartItem | null>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("kf_buy_now_item");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return null;
  });

  const setDirectOrderItem = (item: CartItem | null) => {
    setDirectOrderItemState(item);
    if (typeof window !== "undefined") {
      if (item) {
        sessionStorage.setItem("kf_buy_now_item", JSON.stringify(item));
      } else {
        sessionStorage.removeItem("kf_buy_now_item");
      }
    }
  };

  const startBuyNow = (newItem: Omit<CartItem, "quantity">, quantity: number = 1) => {
    const item: CartItem = { ...newItem, quantity };
    setDirectOrderItem(item);
  };

  const clearBuyNow = () => {
    setDirectOrderItem(null);
  };
  const [items, setItems] = useState<CartItem[]>([
    {
      id: "hass-avocado",
      name: "Organic Hass Avocados",
      price: 45000,
      originalPrice: 45000,
      quantity: 500,
      unit: "kg",
      image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=400&auto=format&fit=crop",
      stockStatus: "Low Stock",
    },
    {
      id: "premium-strawberry",
      name: "Premium Strawberries",
      price: 85000,
      originalPrice: 85000,
      quantity: 200,
      unit: "kg",
      image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=400&auto=format&fit=crop",
      stockStatus: "In Stock",
    },
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  };

  const addToCart = (newItem: Omit<CartItem, "quantity">, quantity: number = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === newItem.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          price: newItem.price,
          isNegotiated: newItem.isNegotiated ?? updated[existingIndex].isNegotiated,
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [...prev, { ...newItem, quantity }];
    });
    showToast(`${newItem.name} added to cart`);
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const toggleCart = () => setIsCartOpen((prev) => !prev);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        setItems,
        directOrderItem,
        setDirectOrderItem,
        startBuyNow,
        clearBuyNow,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        toggleCart,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

