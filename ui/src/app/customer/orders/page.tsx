"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  X,
  Plus,
  MapPin,
  AlertCircle,
  Download,
} from "lucide-react";
import { useCart } from "../context/CartContext";

type OrderStatus = "Processing" | "Delivered" | "In Transit" | "Cancelled";

interface OrderItem {
  name: string;
  quantity: number;
  unit: string;
  price: number;
  image: string;
}

interface CustomerOrder {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  totalAmount: number;
  deliveryMethod: string;
  deliveryAddress: string;
  items: OrderItem[];
}

const initialOrders: CustomerOrder[] = [
  {
    id: "ord-1",
    orderNumber: "#ORD-7721",
    date: "Oct 24, 2026",
    status: "Processing",
    totalAmount: 145000,
    deliveryMethod: "Standard Freight (3-5 Days)",
    deliveryAddress: "Jl. Raya Kebon Jeruk No. 88, Blok B-4, West Jakarta",
    items: [
      {
        name: "Organic Hass Avocados",
        quantity: 2,
        unit: "unit",
        price: 45000,
        image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=400&auto=format&fit=crop",
      },
      {
        name: "Valencia Orange",
        quantity: 1.5,
        unit: "unit",
        price: 32000,
        image: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?q=80&w=400&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "ord-2",
    orderNumber: "#ORD-7689",
    date: "Oct 18, 2026",
    status: "Delivered",
    totalAmount: 320500,
    deliveryMethod: "Express Cold Chain (1-2 Days)",
    deliveryAddress: "Komp. Pergudangan Marunda Center Blok C-12, North Jakarta",
    items: [
      {
        name: "Premium Strawberries",
        quantity: 2,
        unit: "unit",
        price: 85000,
        image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=400&auto=format&fit=crop",
      },
      {
        name: "Premium Fuji Apple",
        quantity: 2,
        unit: "unit",
        price: 45000,
        image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=400&auto=format&fit=crop",
      },
      {
        name: "Honeygold Pineapple",
        quantity: 1,
        unit: "unit",
        price: 55000,
        image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?q=80&w=400&auto=format&fit=crop",
      },
      {
        name: "Cavendish Banana",
        quantity: 1,
        unit: "unit",
        price: 22000,
        image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=400&auto=format&fit=crop",
      },
    ],
  },
];

export default function CustomerOrdersPage() {
  const [activeTab, setActiveTab] = useState<"All Orders" | "Active" | "Completed" | "Cancelled">("All Orders");
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [dynamicOrders, setDynamicOrders] = useState<CustomerOrder[]>([]);
  const { showToast, addToCart } = useCart();

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetch("http://localhost:8000/api/anomaly/invoices")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setDynamicOrders(data);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch orders from Postgres API", err);
        });
    }
  }, []);

  const allOrders = useMemo(() => {
    return [...dynamicOrders, ...initialOrders];
  }, [dynamicOrders]);

  const tabs: Array<"All Orders" | "Active" | "Completed" | "Cancelled"> = [
    "All Orders",
    "Active",
    "Completed",
    "Cancelled",
  ];

  const filteredOrders = useMemo(() => {
    if (activeTab === "All Orders") return allOrders;
    if (activeTab === "Active") {
      return allOrders.filter(
        (o) => o.status === "Processing" || o.status === "In Transit"
      );
    }
    if (activeTab === "Completed") {
      return allOrders.filter((o) => o.status === "Delivered");
    }
    if (activeTab === "Cancelled") {
      return allOrders.filter((o) => o.status === "Cancelled");
    }
    return allOrders;
  }, [activeTab, allOrders]);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Processing":
      case "In Transit":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#E0F2FE] px-2.5 py-0.5 text-xs font-semibold text-[#0284C7]">
            <Clock className="h-3 w-3" />
            <span>Processing</span>
          </span>
        );
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-xs font-semibold text-[#16A34A]">
            <CheckCircle2 className="h-3 w-3" />
            <span>Delivered</span>
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
            <AlertCircle className="h-3 w-3" />
            <span>Cancelled</span>
          </span>
        );
    }
  };

  const handleReorder = (order: CustomerOrder) => {
    order.items.forEach((item) => {
      addToCart({
        id: `reorder-${item.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: item.name,
        price: item.price,
        originalPrice: item.price,
        unit: item.unit,
        image: item.image,
        stockStatus: "In Stock",
      }, item.quantity);
    });
    showToast("All items from this order added to your cart!");
    setSelectedOrder(null);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 pt-2 pb-8 space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#71C168]">
          My Orders
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Track and manage your commercial fruit deliveries and procurement records.
        </p>
      </div>

      {/* Tabs Filter - Matching Benchmark Pill Style */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === tab
                ? "bg-[#1E7B34] text-white shadow-xs"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Order Cards List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="py-10 text-center bg-white rounded-2xl border border-gray-200 p-8 space-y-3 shadow-2xs">
            <Package className="h-12 w-12 text-gray-300 mx-auto stroke-1" />
            <h3 className="text-sm font-bold text-gray-700">No orders found</h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              There is no order history for &quot;{activeTab}&quot;.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-4"
            >
              {/* Card Top Row: Icon + Order ID/Date + Price + Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 border border-gray-100 text-gray-700">
                    {order.status === "Processing" ? (
                      <Truck className="h-5 w-5 text-[#0284C7]" />
                    ) : (
                      <Package className="h-5 w-5 text-[#16A34A]" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1F2937] leading-tight">
                      {order.orderNumber}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Placed on {order.date} • {order.items.length} {order.items.length === 1 ? "Item" : "Items"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pl-13 sm:pl-0">
                  <span className="text-sm sm:text-base font-bold text-[#1F2937]">
                    {formatPrice(order.totalAmount)}
                  </span>
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Card Bottom Row: Thumbnails + View Details Button */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                {/* Product Thumbnails Stack */}
                <div className="flex items-center gap-1.5 pl-1">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <img
                      key={idx}
                      src={item.image}
                      alt={item.name}
                      title={item.name}
                      className="h-8 w-8 rounded-lg object-cover border border-gray-200 shadow-2xs"
                    />
                  ))}
                  {order.items.length > 3 && (
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 border border-gray-200 text-[11px] font-bold text-gray-600">
                      +{order.items.length - 3}
                    </span>
                  )}
                </div>

                {/* View Details Button */}
                <button
                  type="button"
                  onClick={() => setSelectedOrder(order)}
                  className="rounded-lg border border-gray-300 bg-white hover:bg-gray-50 px-3.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors shadow-2xs cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedOrder(null)}
          />

          {/* Dialog */}
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 sm:p-7 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#1F2937]">
                    Order Details: {selectedOrder.orderNumber}
                  </h3>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Placed on {selectedOrder.date} • Method: {selectedOrder.deliveryMethod}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Delivery Info */}
            <div className="mt-4 p-3.5 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2 text-xs">
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin className="h-4 w-4 text-[#71C168] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-gray-700">Delivery Address:</span>
                  <p className="text-gray-500 mt-0.5">{selectedOrder.deliveryAddress}</p>
                </div>
              </div>
            </div>

            {/* Itemized List */}
            <div className="mt-4 space-y-2.5">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Product Items ({selectedOrder.items.length})
              </h4>
              <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-10 w-10 rounded-lg object-cover border border-gray-200"
                      />
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-[#1F2937]">{item.name}</p>
                        <p className="text-[11px] text-gray-400">
                          {item.quantity} {item.unit} × {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[#1E7B34]">
                      {formatPrice(item.quantity * item.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Summary */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-baseline justify-between">
              <span className="text-sm font-bold text-gray-700">Total Payment</span>
              <span className="text-lg font-black text-[#1E7B34]">
                {formatPrice(selectedOrder.totalAmount)}
              </span>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleReorder(selectedOrder)}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#71C168] hover:bg-[#60ab58] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Reorder Items</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  showToast(`Invoice for ${selectedOrder.orderNumber} downloading...`);
                }}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Invoice (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
