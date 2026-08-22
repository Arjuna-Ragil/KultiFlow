"use client";

import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Calendar, TrendingUp, Package } from "lucide-react";

export default function ForecastingPage() {
  const [selectedFruit, setSelectedFruit] = useState("Apples");
  const [price, setPrice] = useState(15.0);
  const [isPromo, setIsPromo] = useState(0);
  const [isHoliday, setIsHoliday] = useState(0);
  const [qualityScore, setQualityScore] = useState(0.9);
  
  // Default to tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [selectedDate, setSelectedDate] = useState(tomorrow.toISOString().split("T")[0]);

  const [predictedDemand, setPredictedDemand] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrediction();
  }, [selectedFruit, price, isPromo, isHoliday, qualityScore, selectedDate]);

  const fetchPrediction = async () => {
    setLoading(true);
    try {
      const dateObj = new Date(selectedDate);
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth() + 1; // 1-indexed
      const date = dateObj.getDate();
      
      // Calculate day of week (1 = Monday, ..., 7 = Sunday)
      let dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday
      dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
      
      const isWeekend = (dayOfWeek === 6 || dayOfWeek === 7) ? 1 : 0;

      const payload = {
        fruit_type: selectedFruit,
        price: Number(price),
        is_promo: Number(isPromo),
        is_holiday: Number(isHoliday),
        quality_score: Number(qualityScore),
        Tahun: year,
        Bulan: month,
        Tanggal: date,
        Hari_ke_berapa: dayOfWeek,
        Is_Weekend: isWeekend,
      };

      const res = await fetch("http://localhost:8000/api/sales/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to fetch prediction");
      const data = await res.json();
      
      setPredictedDemand(data.predicted_demand_qty || 0);
    } catch (error) {
      console.error(error);
      setPredictedDemand(null); // Clear on error
    }
    setLoading(false);
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#F9FAFB] p-8 overflow-y-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1F2937] font-serif">
            Daily Demand Forecasting
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Predictive AI model for precise daily warehouse stocking.
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Side: Input Form */}
        <div className="lg:col-span-7 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#1F2937] font-serif">
                Forecast Variables
              </h2>
              <p className="text-xs text-gray-500">
                Adjust parameters to simulate specific daily conditions
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
              <SlidersHorizontal className="h-4 w-4" />
              Live Sync
            </div>
          </div>
          
          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Target Date */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Target Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#71C168] focus:bg-white"
                  />
                </div>
              </div>

              {/* Fruit Type */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Fruit Type</label>
                <select 
                  value={selectedFruit}
                  onChange={(e) => setSelectedFruit(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-[#71C168] focus:bg-white"
                >
                  <option value="Apples">Apples</option>
                  <option value="Pineapples">Pineapples</option>
                  <option value="Bananas">Bananas</option>
                  <option value="Oranges">Oranges</option>
                </select>
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Expected Selling Price ($)</label>
              <input 
                type="number"
                step="0.5"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-[#71C168] focus:bg-white"
              />
            </div>

            {/* Quality Score */}
            <div>
              <label className="mb-1.5 flex justify-between text-sm font-medium text-gray-700">
                <span>Expected Batch Quality Score</span>
                <span className="text-[#71C168] font-bold">{qualityScore.toFixed(2)}</span>
              </label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={qualityScore}
                onChange={(e) => setQualityScore(Number(e.target.value))}
                className="w-full accent-[#71C168]"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Poor (0.0)</span>
                <span>Perfect (1.0)</span>
              </div>
            </div>

            {/* Toggles: Promo & Holiday */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div 
                onClick={() => setIsPromo(isPromo === 1 ? 0 : 1)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${isPromo ? 'border-[#71C168] bg-[#71C168]/5' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
              >
                <div className="text-sm font-bold text-gray-800">Active Promo Campaign</div>
                <div className={`mt-1 text-xs ${isPromo ? 'text-[#71C168]' : 'text-gray-500'}`}>
                  {isPromo ? 'Enabled (1)' : 'Disabled (0)'}
                </div>
              </div>
              
              <div 
                onClick={() => setIsHoliday(isHoliday === 1 ? 0 : 1)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${isHoliday ? 'border-[#71C168] bg-[#71C168]/5' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
              >
                <div className="text-sm font-bold text-gray-800">Public Holiday</div>
                <div className={`mt-1 text-xs ${isHoliday ? 'text-[#71C168]' : 'text-gray-500'}`}>
                  {isHoliday ? 'Enabled (1)' : 'Disabled (0)'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Prediction Output Card */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm flex-1 flex flex-col items-center justify-center relative overflow-hidden">
            
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <TrendingUp className="w-48 h-48" />
            </div>

            <div className="z-10 text-center w-full">
              <h2 className="text-lg font-bold text-[#1F2937] font-serif mb-2">
                Predicted Demand
              </h2>
              <p className="text-sm text-gray-500 mb-8">
                Estimated volume for <span className="font-bold text-gray-700">{selectedFruit}</span> on <br/>
                <span className="font-bold text-gray-700">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </p>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#166534] mb-4"></div>
                  <span className="text-sm text-gray-400 font-medium">Running ML Model...</span>
                </div>
              ) : predictedDemand !== null ? (
                <div className="py-6 flex flex-col items-center">
                  <div className="flex items-end gap-2 text-[#166534]">
                    <span className="text-7xl font-extrabold tracking-tighter">{predictedDemand}</span>
                    <span className="text-2xl font-bold mb-2">Units</span>
                  </div>
                  
                  <div className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-green-50 p-4 text-green-800 border border-green-100">
                    <Package className="h-5 w-5" />
                    <span className="text-sm font-medium">Optimal stocking target reached</span>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-gray-400 text-sm">
                  Prediction unavailable. Check backend connection.
                </div>
              )}
            </div>
          </div>
          
          <div className="rounded-2xl border border-gray-100 bg-linear-to-br from-[#1F2937] to-[#111827] p-6 shadow-sm text-white">
            <h3 className="font-bold mb-2 text-gray-100">Model Insights</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              This prediction is generated by the <span className="text-gray-300 font-medium">forecasting_pipeline.pkl</span> model trained on historical daily sales data. It accounts for weekend trends, holiday anomalies, and pricing elasticity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
