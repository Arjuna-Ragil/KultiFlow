"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Send,
  Edit,
  CheckCircle2,
  X,
  ChevronDown,
  Clock,
  CheckCircle
} from "lucide-react";

export type InvoiceStage = "quotation" | "sent" | "order" | "completed";

interface InvoiceItem {
  id: string;
  name: string;
  qtyKg: number;
  pricePerKg: number;
  image: string;
}

interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  stage: InvoiceStage;
  status: "Draft" | "Pending" | "Paid" | "Sent";
  customer: {
    name: string;
    address: string;
    cityPostal: string;
    email: string;
    phone: string;
  };
  seller: {
    companyName: string;
    address: string;
    cityPostal: string;
    email: string;
  };
  items: InvoiceItem[];
  shippingFee: number;
}

const STAGES: { id: InvoiceStage; label: string; description: string }[] = [
  { id: "quotation", label: "Quotation", description: "Draft & Price Quotation" },
  { id: "sent", label: "Quotation Sent", description: "Dispatched to Customer Email" },
  { id: "order", label: "Sales Order", description: "Confirmed Sales Order" },
  { id: "completed", label: "Completed", description: "Delivered & Settled" },
];

const INITIAL_INVOICES: InvoiceData[] = [
  {
    invoiceNumber: "INV-2026-0842",
    issueDate: "24 Oct 2026",
    dueDate: "31 Oct 2026",
    stage: "order",
    status: "Pending",
    customer: {
      name: "Budi Santoso",
      address: "Perumahan Asri Blok C4",
      cityPostal: "Bandung, 40123",
      email: "budi.santoso@gmail.com",
      phone: "+62 812-3456-7890",
    },
    seller: {
      companyName: "FruitMarket KultiFlow",
      address: "Jl. Buah Segar No. 123",
      cityPostal: "Jakarta Selatan, 12345",
      email: "admin@kultiflow.co.id",
    },
    shippingFee: 25000,
    items: [
      {
        id: "item-1",
        name: "Valencia Oranges (Premium)",
        qtyKg: 5.0,
        pricePerKg: 35000,
        image: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=150&auto=format&fit=crop",
      },
      {
        id: "item-2",
        name: "Fuji Apples",
        qtyKg: 2.5,
        pricePerKg: 42000,
        image: "/fuji_apples.jpg",
      },
    ],
  },
  {
    invoiceNumber: "INV-2026-0843",
    issueDate: "25 Oct 2026",
    dueDate: "01 Nov 2026",
    stage: "completed",
    status: "Paid",
    customer: {
      name: "Dewi Sartika",
      address: "Jl. Riau No. 88",
      cityPostal: "Bandung, 40115",
      email: "dewi.sartika@gmail.com",
      phone: "+62 813-9876-5432",
    },
    seller: {
      companyName: "FruitMarket KultiFlow",
      address: "Jl. Buah Segar No. 123",
      cityPostal: "Jakarta Selatan, 12345",
      email: "admin@kultiflow.co.id",
    },
    shippingFee: 30000,
    items: [
      {
        id: "item-3",
        name: "Cavendish Bananas",
        qtyKg: 10.0,
        pricePerKg: 18500,
        image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=150&auto=format&fit=crop",
      },
      {
        id: "item-4",
        name: "SunGold Kiwi",
        qtyKg: 3.0,
        pricePerKg: 65000,
        image: "https://images.unsplash.com/photo-1585059895524-72359e06133a?q=80&w=150&auto=format&fit=crop",
      },
    ],
  },
  {
    invoiceNumber: "INV-2026-0844",
    issueDate: "26 Oct 2026",
    dueDate: "02 Nov 2026",
    stage: "quotation",
    status: "Draft",
    customer: {
      name: "Resto Segar Alam",
      address: "Jl. Dago Atas No. 102",
      cityPostal: "Bandung, 40135",
      email: "procurement@segaralam.com",
      phone: "+62 821-1122-3344",
    },
    seller: {
      companyName: "FruitMarket KultiFlow",
      address: "Jl. Buah Segar No. 123",
      cityPostal: "Jakarta Selatan, 12345",
      email: "admin@kultiflow.co.id",
    },
    shippingFee: 50000,
    items: [
      {
        id: "item-5",
        name: "Red Dragon Fruit",
        qtyKg: 20.0,
        pricePerKg: 24000,
        image: "https://images.unsplash.com/photo-1527325678964-54921661f888?q=80&w=150&auto=format&fit=crop",
      },
    ],
  },
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceData[]>(INITIAL_INVOICES);
  const [selectedInvoiceIndex, setSelectedInvoiceIndex] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSendSuccessModalOpen, setIsSendSuccessModalOpen] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/anomaly/invoices")
      .then((res) => res.json())
      .then((savedOrders) => {
        if (!Array.isArray(savedOrders)) return;
        
        const formattedOrders: InvoiceData[] = savedOrders.map((order: any) => ({
          invoiceNumber: order.orderNumber,
          issueDate: order.date,
          dueDate: order.date,
          stage: "order",
          status: "Pending",
          customer: {
            name: order.companyName || "Guest Company",
            address: order.deliveryAddress,
            cityPostal: "-",
            email: order.emailAddress || "guest@example.com",
            phone: order.phoneNumber || "-",
          },
          seller: {
            companyName: "FruitMarket KultiFlow",
            address: "Jl. Buah Segar No. 123",
            cityPostal: "Jakarta Selatan, 12345",
            email: "admin@kultiflow.co.id",
          },
          shippingFee: order.shippingFee || 1200000,
          items: order.items.map((item: any) => ({
            id: item.id || `item-${Math.random()}`,
            name: item.name,
            qtyKg: item.quantity || item.qtyKg || 1, // Fallback for diff payload structures
            pricePerKg: item.price || item.pricePerKg || 0,
            image: item.image || "",
          })),
        }));

        setInvoices((prev) => {
          const newInvoices = formattedOrders.filter(
            (fo) => !prev.some((p) => p.invoiceNumber === fo.invoiceNumber)
          );
          return [...newInvoices, ...prev];
        });
      })
      .catch((err) => console.error("Failed to fetch invoices", err));
  }, []);

  const currentInvoice = invoices[selectedInvoiceIndex] || invoices[0];

  // Editable temporary invoice state
  const [editInvoice, setEditInvoice] = useState<InvoiceData>(currentInvoice);

  const currentStageIndex = STAGES.findIndex((s) => s.id === currentInvoice.stage);
  const isProcessCompleted = currentInvoice.stage === "completed";

  const subtotal = currentInvoice.items.reduce(
    (acc, item) => acc + item.qtyKg * item.pricePerKg,
    0
  );
  const totalAmount = subtotal + currentInvoice.shippingFee;

  const handleStageChange = (newStage: InvoiceStage) => {
    const updated = [...invoices];
    updated[selectedInvoiceIndex] = {
      ...currentInvoice,
      stage: newStage,
      status:
        newStage === "completed"
          ? "Paid"
          : newStage === "sent"
            ? "Sent"
            : newStage === "quotation"
              ? "Draft"
              : "Pending",
    };
    setInvoices(updated);
  };

  const handleOpenEdit = () => {
    setEditInvoice(JSON.parse(JSON.stringify(currentInvoice)));
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = [...invoices];
    updated[selectedInvoiceIndex] = editInvoice;
    setInvoices(updated);
    setIsEditModalOpen(false);
  };

  const handleSendInvoice = () => {
    handleStageChange("sent");
    setIsSendSuccessModalOpen(true);
  };

  return (
    <div className="min-h-full bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 pt-2 pb-12 space-y-6">
        {/* Top Header & Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#71C168]">
              Invoice Preview
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Review details and procurement lifecycle before sending to customer.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Invoice Selector */}
            <div className="relative">
              <select
                value={selectedInvoiceIndex}
                onChange={(e) => setSelectedInvoiceIndex(Number(e.target.value))}
                className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-9 text-xs font-bold text-gray-700 shadow-2xs hover:bg-gray-50 focus:border-[#71C168] focus:outline-hidden cursor-pointer"
              >
                {invoices.map((inv, idx) => (
                  <option key={inv.invoiceNumber} value={idx}>
                    {inv.invoiceNumber} - {inv.customer.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            </div>

            <button
              onClick={handleOpenEdit}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#1F2937] shadow-2xs hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Edit className="h-4 w-4 text-gray-500" />
              <span>Edit Invoice</span>
            </button>

            <button
              onClick={handleSendInvoice}
              className="inline-flex items-center gap-2 rounded-xl bg-[#71C168] hover:bg-[#60ab58] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all transform active:scale-95 cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>Send to Customer</span>
            </button>
          </div>
        </div>

        {/* STAGES FILTER BAR - Pill Button Style matching benchmark */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs">
          <div className="flex flex-wrap items-center gap-2">
            {STAGES.map((stage) => {
              const isCurrent = currentInvoice.stage === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => handleStageChange(stage.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    isCurrent
                      ? "bg-[#1E7B34] text-white shadow-xs"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {stage.label}
                </button>
              );
            })}
          </div>

          {/* Stage status indicator badge on right */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400 font-medium">Stage Status:</span>
            {isProcessCompleted ? (
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full text-xs">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                Completed &amp; Paid
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full text-xs">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                In Progress ({STAGES[currentStageIndex]?.label})
              </span>
            )}
          </div>
        </div>

        {/* INVOICE PREVIEW CARD - Fit Width to Screen */}
        {isPreviewVisible ? (
          <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xs">
            {/* Preview Mode Top Gray Bar */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/90 px-6 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                  PREVIEW MODE
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
                    currentInvoice.status === "Paid"
                      ? "bg-emerald-100 text-emerald-800"
                      : currentInvoice.status === "Sent"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {currentInvoice.status.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => setIsPreviewVisible(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                title="Hide preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 sm:p-10 space-y-8">
              {/* Header: Company Info on Left, Invoice Details on Right */}
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#1E7B34]">
                    {currentInvoice.seller.companyName}
                  </h2>
                  <div className="mt-2 text-xs text-gray-600 space-y-0.5 leading-relaxed">
                    <p>{currentInvoice.seller.address}</p>
                    <p>{currentInvoice.seller.cityPostal}</p>
                    <p>{currentInvoice.seller.email}</p>
                  </div>
                </div>

                <div className="sm:text-right">
                  <h3 className="text-2xl font-extrabold tracking-tight text-[#1F2937] uppercase">
                    INVOICE
                  </h3>
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex items-center justify-between sm:justify-end gap-3 text-gray-600">
                      <span className="text-gray-400 font-medium">Invoice No:</span>
                      <span className="font-bold text-gray-800">
                        {currentInvoice.invoiceNumber}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 text-gray-600">
                      <span className="text-gray-400 font-medium">Date:</span>
                      <span className="font-semibold text-gray-800">
                        {currentInvoice.issueDate}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 text-gray-600">
                      <span className="text-gray-400 font-medium">Due Date:</span>
                      <span className="font-semibold text-gray-800">
                        {currentInvoice.dueDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billed To Section */}
              <div className="pt-2 border-t border-gray-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  BILLED TO
                </span>
                <h4 className="mt-1 text-base font-bold text-gray-900">
                  {currentInvoice.customer.name}
                </h4>
                <div className="mt-1 text-xs text-gray-600 space-y-0.5 leading-relaxed">
                  <p>{currentInvoice.customer.address}</p>
                  <p>{currentInvoice.customer.cityPostal}</p>
                  <p className="text-gray-500">{currentInvoice.customer.phone}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 font-semibold text-gray-600 border-b border-gray-100">
                    <tr>
                      <th className="py-3 px-4 font-bold text-gray-600">Item Description</th>
                      <th className="py-3 px-4 text-center font-bold text-gray-600">QTY (UNITS)</th>
                      <th className="py-3 px-4 text-right font-bold text-gray-600">UNIT PRICE</th>
                      <th className="py-3 px-4 text-right font-bold text-gray-600">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentInvoice.items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-10 w-10 rounded-lg object-cover border border-gray-200"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><rect width='100%' height='100%' fill='%23F3F4F6'/><text x='50%' y='50%' fill='%2371C168' font-size='10' font-family='sans-serif' font-weight='bold' text-anchor='middle'>Fruit</text></svg>";
                              }}
                            />
                            <span className="font-bold text-gray-800">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-700 font-medium">
                          {item.qtyKg.toFixed(1)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700 font-medium">
                          Rp {item.pricePerKg.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-gray-900">
                          Rp {(item.qtyKg * item.pricePerKg).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Subtotal, Shipping, and Total Section */}
              <div className="flex justify-end pt-2">
                <div className="w-full max-w-sm space-y-2 text-xs">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-800">
                      Rp {subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span>Shipping Fee</span>
                    <span className="font-semibold text-gray-800">
                      Rp {currentInvoice.shippingFee.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-sm">
                    <span className="text-base font-extrabold text-[#1E7B34]">Total Amount</span>
                    <span className="text-xl font-black text-[#1E7B34]">
                      Rp {totalAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoice Footer Note */}
              <div className="pt-8 border-t border-gray-100 text-center space-y-1">
                <p className="text-xs font-bold text-gray-600">
                  Thank you for your partnership with KultiFlow Fresh Produce.
                </p>
                <p className="text-[11px] text-gray-400">
                  Payment is due within 7 days of invoice date.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-3 text-base font-bold text-gray-800">Preview Closed</h3>
            <p className="mt-1 text-xs text-gray-500">
              Click the button below to re-open the invoice preview.
            </p>
            <button
              onClick={() => setIsPreviewVisible(true)}
              className="mt-4 rounded-xl bg-[#71C168] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#5fa957] cursor-pointer"
            >
              Show Invoice Preview
            </button>
          </div>
        )}

        {/* EDIT INVOICE MODAL */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-[#1F2937]">Edit Invoice Details</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-600">Invoice Number</label>
                    <input
                      type="text"
                      value={editInvoice.invoiceNumber}
                      onChange={(e) =>
                        setEditInvoice({ ...editInvoice, invoiceNumber: e.target.value })
                      }
                      className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-xs focus:border-[#71C168] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600">Due Date</label>
                    <input
                      type="text"
                      value={editInvoice.dueDate}
                      onChange={(e) =>
                        setEditInvoice({ ...editInvoice, dueDate: e.target.value })
                      }
                      className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-xs focus:border-[#71C168] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600">Purchase Stage</label>
                  <select
                    value={editInvoice.stage}
                    onChange={(e) =>
                      setEditInvoice({
                        ...editInvoice,
                        stage: e.target.value as InvoiceStage,
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-gray-200 p-2.5 text-xs focus:border-[#71C168] focus:outline-hidden cursor-pointer"
                  >
                    <option value="quotation">Quotation (Draft Quotation)</option>
                    <option value="sent">Quotation Sent (Dispatched)</option>
                    <option value="order">Sales Order (Confirmed Order)</option>
                    <option value="completed">Completed / Settled</option>
                  </select>
                </div>

                <div className="space-y-2 border-t border-gray-100 pt-3">
                  <span className="text-xs font-bold text-gray-700">Customer Details</span>
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={editInvoice.customer.name}
                    onChange={(e) =>
                      setEditInvoice({
                        ...editInvoice,
                        customer: { ...editInvoice.customer, name: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs focus:border-[#71C168] focus:outline-hidden"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={editInvoice.customer.address}
                    onChange={(e) =>
                      setEditInvoice({
                        ...editInvoice,
                        customer: { ...editInvoice.customer, address: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs focus:border-[#71C168] focus:outline-hidden"
                  />
                  <input
                    type="text"
                    placeholder="City, Postal Code"
                    value={editInvoice.customer.cityPostal}
                    onChange={(e) =>
                      setEditInvoice({
                        ...editInvoice,
                        customer: { ...editInvoice.customer, cityPostal: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs focus:border-[#71C168] focus:outline-hidden"
                  />
                </div>

                <div className="space-y-2 border-t border-gray-100 pt-3">
                  <span className="text-xs font-bold text-gray-700">Shipping Fee (Rp)</span>
                  <input
                    type="number"
                    value={editInvoice.shippingFee}
                    onChange={(e) =>
                      setEditInvoice({
                        ...editInvoice,
                        shippingFee: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs focus:border-[#71C168] focus:outline-hidden"
                  />
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="w-1/2 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 rounded-xl bg-[#71C168] py-2.5 text-xs font-bold text-white hover:bg-[#5fa957] cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SEND SUCCESS MODAL */}
        {isSendSuccessModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">Invoice Sent!</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Invoice <span className="font-bold">{currentInvoice.invoiceNumber}</span> has been dispatched to{" "}
                  <span className="font-bold text-gray-700">{currentInvoice.customer.email}</span>. Status updated to <strong>Quotation Sent</strong>.
                </p>
              </div>

              <button
                onClick={() => setIsSendSuccessModalOpen(false)}
                className="w-full rounded-xl bg-[#71C168] hover:bg-[#60ab58] py-2.5 text-xs font-bold text-white cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
