"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  Search,
  ChevronDown,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  PackageCheck,
  Download
} from "lucide-react";

interface MonthlyHistoricalData {
  month: string;
  primary: number;
  secondary: number;
}

interface MonthlyPredictedData {
  month: string;
  predicted: number;
  upperBound: number;
  lowerBound: number;
}

interface FruitForecastDataset {
  name: string;
  category: string;
  historicalUnit: string;
  historical: MonthlyHistoricalData[];
  predicted: MonthlyPredictedData[];
  confidenceScore: number;
  projectedGrowth: string;
  optimalReorder: string;
  modelAccuracy: string;
}

const FRUIT_FORECAST_DATA: Record<string, FruitForecastDataset> = {
  Apples: {
    name: "Apples",
    category: "Temperate",
    historicalUnit: "Tons",
    confidenceScore: 96.2,
    projectedGrowth: "+18.4%",
    optimalReorder: "240 Tons / Month",
    modelAccuracy: "97.1%",
    historical: [
      { month: "Jan", primary: 120, secondary: 80 },
      { month: "Feb", primary: 135, secondary: 75 },
      { month: "Mar", primary: 125, secondary: 85 },
      { month: "Apr", primary: 145, secondary: 90 },
      { month: "May", primary: 160, secondary: 110 },
      { month: "Jun", primary: 150, secondary: 130 },
      { month: "Jul", primary: 170, secondary: 140 },
      { month: "Aug", primary: 185, secondary: 135 },
      { month: "Sep", primary: 175, secondary: 120 },
      { month: "Oct", primary: 190, secondary: 105 },
      { month: "Nov", primary: 210, secondary: 95 },
      { month: "Dec", primary: 205, secondary: 85 },
    ],
    predicted: [
      { month: "Jan (Next)", predicted: 208, upperBound: 228, lowerBound: 188 },
      { month: "Feb", predicted: 224, upperBound: 240, lowerBound: 202 },
      { month: "Mar", predicted: 214, upperBound: 234, lowerBound: 196 },
      { month: "Apr", predicted: 234, upperBound: 252, lowerBound: 208 },
      { month: "May", predicted: 248, upperBound: 268, lowerBound: 222 },
      { month: "Jun", predicted: 258, upperBound: 286, lowerBound: 228 },
    ],
  },
  Pineapples: {
    name: "Pineapples",
    category: "Tropical",
    historicalUnit: "Tons",
    confidenceScore: 94.8,
    projectedGrowth: "+12.1%",
    optimalReorder: "145 Tons / Month",
    modelAccuracy: "95.5%",
    historical: [
      { month: "Jan", primary: 80, secondary: 120 },
      { month: "Feb", primary: 75, secondary: 135 },
      { month: "Mar", primary: 85, secondary: 125 },
      { month: "Apr", primary: 90, secondary: 145 },
      { month: "May", primary: 110, secondary: 160 },
      { month: "Jun", primary: 130, secondary: 150 },
      { month: "Jul", primary: 140, secondary: 170 },
      { month: "Aug", primary: 135, secondary: 185 },
      { month: "Sep", primary: 120, secondary: 175 },
      { month: "Oct", primary: 105, secondary: 190 },
      { month: "Nov", primary: 95, secondary: 210 },
      { month: "Dec", primary: 85, secondary: 205 },
    ],
    predicted: [
      { month: "Jan (Next)", predicted: 95, upperBound: 115, lowerBound: 80 },
      { month: "Feb", predicted: 105, upperBound: 125, lowerBound: 90 },
      { month: "Mar", predicted: 120, upperBound: 140, lowerBound: 105 },
      { month: "Apr", predicted: 135, upperBound: 155, lowerBound: 118 },
      { month: "May", predicted: 150, upperBound: 170, lowerBound: 132 },
      { month: "Jun", predicted: 160, upperBound: 185, lowerBound: 140 },
    ],
  },
  Bananas: {
    name: "Bananas",
    category: "Tropical",
    historicalUnit: "Tons",
    confidenceScore: 98.0,
    projectedGrowth: "+24.5%",
    optimalReorder: "320 Tons / Month",
    modelAccuracy: "98.4%",
    historical: [
      { month: "Jan", primary: 150, secondary: 90 },
      { month: "Feb", primary: 165, secondary: 95 },
      { month: "Mar", primary: 180, secondary: 100 },
      { month: "Apr", primary: 190, secondary: 110 },
      { month: "May", primary: 210, secondary: 115 },
      { month: "Jun", primary: 225, secondary: 120 },
      { month: "Jul", primary: 240, secondary: 125 },
      { month: "Aug", primary: 235, secondary: 130 },
      { month: "Sep", primary: 220, secondary: 120 },
      { month: "Oct", primary: 215, secondary: 110 },
      { month: "Nov", primary: 230, secondary: 105 },
      { month: "Dec", primary: 245, secondary: 100 },
    ],
    predicted: [
      { month: "Jan (Next)", predicted: 250, upperBound: 275, lowerBound: 230 },
      { month: "Feb", predicted: 265, upperBound: 290, lowerBound: 245 },
      { month: "Mar", predicted: 275, upperBound: 300, lowerBound: 250 },
      { month: "Apr", predicted: 290, upperBound: 315, lowerBound: 265 },
      { month: "May", predicted: 310, upperBound: 335, lowerBound: 285 },
      { month: "Jun", predicted: 325, upperBound: 350, lowerBound: 295 },
    ],
  },
  Oranges: {
    name: "Oranges",
    category: "Citrus",
    historicalUnit: "Tons",
    confidenceScore: 95.1,
    projectedGrowth: "+15.8%",
    optimalReorder: "190 Tons / Month",
    modelAccuracy: "96.0%",
    historical: [
      { month: "Jan", primary: 110, secondary: 70 },
      { month: "Feb", primary: 120, secondary: 75 },
      { month: "Mar", primary: 130, secondary: 80 },
      { month: "Apr", primary: 140, secondary: 85 },
      { month: "May", primary: 155, secondary: 95 },
      { month: "Jun", primary: 165, secondary: 105 },
      { month: "Jul", primary: 175, secondary: 115 },
      { month: "Aug", primary: 170, secondary: 110 },
      { month: "Sep", primary: 160, secondary: 100 },
      { month: "Oct", primary: 155, secondary: 90 },
      { month: "Nov", primary: 165, secondary: 85 },
      { month: "Dec", primary: 180, secondary: 80 },
    ],
    predicted: [
      { month: "Jan (Next)", predicted: 185, upperBound: 205, lowerBound: 165 },
      { month: "Feb", predicted: 195, upperBound: 215, lowerBound: 175 },
      { month: "Mar", predicted: 205, upperBound: 228, lowerBound: 182 },
      { month: "Apr", predicted: 220, upperBound: 242, lowerBound: 198 },
      { month: "May", predicted: 230, upperBound: 255, lowerBound: 205 },
      { month: "Jun", predicted: 240, upperBound: 268, lowerBound: 215 },
    ],
  },
  Mangoes: {
    name: "Mangoes",
    category: "Tropical",
    historicalUnit: "Tons",
    confidenceScore: 93.6,
    projectedGrowth: "+28.2%",
    optimalReorder: "175 Tons / Month",
    modelAccuracy: "94.8%",
    historical: [
      { month: "Jan", primary: 60, secondary: 50 },
      { month: "Feb", primary: 70, secondary: 55 },
      { month: "Mar", primary: 85, secondary: 65 },
      { month: "Apr", primary: 110, secondary: 80 },
      { month: "May", primary: 145, secondary: 100 },
      { month: "Jun", primary: 180, secondary: 120 },
      { month: "Jul", primary: 195, secondary: 130 },
      { month: "Aug", primary: 185, secondary: 125 },
      { month: "Sep", primary: 150, secondary: 105 },
      { month: "Oct", primary: 115, secondary: 85 },
      { month: "Nov", primary: 90, secondary: 70 },
      { month: "Dec", primary: 75, secondary: 60 },
    ],
    predicted: [
      { month: "Jan (Next)", predicted: 85, upperBound: 105, lowerBound: 70 },
      { month: "Feb", predicted: 100, upperBound: 122, lowerBound: 82 },
      { month: "Mar", predicted: 125, upperBound: 150, lowerBound: 105 },
      { month: "Apr", predicted: 160, upperBound: 185, lowerBound: 138 },
      { month: "May", predicted: 200, upperBound: 230, lowerBound: 175 },
      { month: "Jun", predicted: 230, upperBound: 260, lowerBound: 200 },
    ],
  },
};

export default function ForecastingPage() {
  const [selectedFruit, setSelectedFruit] = useState("Apples");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    month: string;
    value: number;
    type: string;
  } | null>(null);

  const fruitOptions = Object.keys(FRUIT_FORECAST_DATA);

  const currentDataset = useMemo(() => {
    return FRUIT_FORECAST_DATA[selectedFruit] || FRUIT_FORECAST_DATA.Apples;
  }, [selectedFruit]);

  // Filter fruit list based on search query
  const filteredFruits = fruitOptions.filter((f) =>
    f.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // SVG Chart Calculation Helpers for Left Chart (Historical 12 Months)
  // Chart viewBox: 520 x 240, margins: left 35, right 20, top 20, bottom 30
  const chartW = 520;
  const chartH = 240;
  const padLeft = 35;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;
  const plotW = chartW - padLeft - padRight;
  const plotH = chartH - padTop - padBottom;

  const yMaxHistorical = 250;
  const historicalXStep = plotW / (currentDataset.historical.length - 1);

  const historicalPoints = currentDataset.historical.map((d, i) => ({
    x: padLeft + i * historicalXStep,
    yPrimary: padTop + plotH - (d.primary / yMaxHistorical) * plotH,
    ySecondary: padTop + plotH - (d.secondary / yMaxHistorical) * plotH,
    month: d.month,
    primary: d.primary,
    secondary: d.secondary,
  }));

  // Path generator for historical primary line
  const primaryPath = historicalPoints.reduce(
    (acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x},${pt.yPrimary}`,
    ""
  );

  // Area path for gradient fill under primary line
  const primaryAreaPath = `${primaryPath} L ${
    historicalPoints[historicalPoints.length - 1].x
  },${padTop + plotH} L ${historicalPoints[0].x},${padTop + plotH} Z`;

  // Path for secondary dashed line
  const secondaryPath = historicalPoints.reduce(
    (acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x},${pt.ySecondary}`,
    ""
  );

  // SVG Chart Calculation Helpers for Right Chart (Predicted 6 Months)
  const yMaxPredicted = 300;
  const predictedCount = currentDataset.predicted.length;
  const colWidth = plotW / predictedCount;
  const barWidth = 36;

  const predictedPoints = currentDataset.predicted.map((d, i) => {
    const centerX = padLeft + i * colWidth + colWidth / 2;
    const barHeight = (d.predicted / yMaxPredicted) * plotH;
    const barY = padTop + plotH - barHeight;
    const upperY = padTop + plotH - (d.upperBound / yMaxPredicted) * plotH;
    const lowerY = padTop + plotH - (d.lowerBound / yMaxPredicted) * plotH;

    return {
      month: d.month,
      centerX,
      barX: centerX - barWidth / 2,
      barY,
      barHeight,
      barWidth,
      predicted: d.predicted,
      upperBound: d.upperBound,
      lowerBound: d.lowerBound,
      upperY,
      lowerY,
    };
  });

  const upperBoundPath = predictedPoints.reduce(
    (acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.centerX},${pt.upperY}`,
    ""
  );

  const lowerBoundPath = predictedPoints.reduce(
    (acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.centerX},${pt.lowerY}`,
    ""
  );

  return (
    <div className="min-h-full bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 pt-2 pb-8 space-y-6">
        {/* Top Header & Search Bar */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#71C168]">
              Sales &amp; Demand Forecasting
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Predictive analytics for optimized warehouse stocking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  const match = fruitOptions.find((f) =>
                    f.toLowerCase().includes(e.target.value.toLowerCase())
                  );
                  if (match) setSelectedFruit(match);
                }}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 shadow-2xs focus:border-[#71C168] focus:outline-hidden focus:ring-2 focus:ring-[#71C168]/20 transition-all"
              />
            </div>

            <button
              onClick={() => alert(`Exporting ML Forecast data for ${selectedFruit} (CSV)...`)}
              className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-2xs hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4 text-gray-500" />
              <span>Export Data</span>
            </button>
          </div>
        </div>

        {/* Main 2-Column Forecast Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT CARD: Sales Trend (Historical) */}
          <div className="flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-6 sm:p-7 shadow-xs relative">
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-[#1F2937]">
                    Sales Trend (Historical)
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Past 12 Months - Actual Volume
                  </p>
                </div>

              {/* Fruit Selector Dropdown */}
              <div className="relative">
                <select
                  value={selectedFruit}
                  onChange={(e) => setSelectedFruit(e.target.value)}
                  aria-label="Select fruit for historical sales trend"
                  className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-gray-700 shadow-2xs hover:border-gray-300 focus:border-[#1E5E2F] focus:outline-hidden cursor-pointer"
                >
                  {fruitOptions.map((fruit) => (
                    <option key={fruit} value={fruit}>
                      {fruit}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* SVG Historical Line Chart */}
            <div className="relative w-full aspect-21/10 min-h-60 mt-2 select-none">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full h-full overflow-visible"
              >
                <defs>
                  {/* Subtle Forest Green Gradient for Area Under Curve */}
                  <linearGradient id="historicalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E5E2F" stopOpacity="0.22" />
                    <stop offset="70%" stopColor="#1E5E2F" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#1E5E2F" stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid Lines & Y-Axis Labels */}
                {[250, 200, 150, 100, 50, 0].map((val) => {
                  const y = padTop + plotH - (val / yMaxHistorical) * plotH;
                  return (
                    <g key={val}>
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={chartW - padRight}
                        y2={y}
                        stroke="#E5E7EB"
                        strokeWidth="1"
                      />
                      <text
                        x={padLeft - 8}
                        y={y + 4}
                        textAnchor="end"
                        fontSize="10"
                        fill="#6B7280"
                        fontWeight="500"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Gradient Area under Primary Line */}
                <path d={primaryAreaPath} fill="url(#historicalGradient)" />

                {/* Secondary Dashed Line (e.g. Pineapples benchmark) */}
                <path
                  d={secondaryPath}
                  fill="none"
                  stroke="#4B7B75"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Primary Solid Dark Forest Green Line */}
                <path
                  d={primaryPath}
                  fill="none"
                  stroke="#1E5E2F"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Secondary Data Points */}
                {historicalPoints.map((pt, idx) => (
                  <circle
                    key={`sec-${idx}`}
                    cx={pt.x}
                    cy={pt.ySecondary}
                    r="3.5"
                    fill="#FFFFFF"
                    stroke="#4B7B75"
                    strokeWidth="1.8"
                    className="transition-transform hover:scale-125 cursor-pointer"
                    onMouseEnter={() =>
                      setHoveredPoint({
                        x: pt.x,
                        y: pt.ySecondary,
                        month: pt.month,
                        value: pt.secondary,
                        type: "Pineapples (Benchmark)",
                      })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}

                {/* Primary Data Points */}
                {historicalPoints.map((pt, idx) => (
                  <circle
                    key={`pri-${idx}`}
                    cx={pt.x}
                    cy={pt.yPrimary}
                    r="4"
                    fill="#FFFFFF"
                    stroke="#1E5E2F"
                    strokeWidth="2.5"
                    className="transition-transform hover:scale-150 cursor-pointer drop-shadow-xs"
                    onMouseEnter={() =>
                      setHoveredPoint({
                        x: pt.x,
                        y: pt.yPrimary,
                        month: pt.month,
                        value: pt.primary,
                        type: `${selectedFruit} (Actual)`,
                      })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}

                {/* X-Axis Month Labels */}
                {historicalPoints.map((pt) => (
                  <text
                    key={pt.month}
                    x={pt.x}
                    y={chartH - 6}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#4B5563"
                    fontWeight="500"
                  >
                    {pt.month}
                  </text>
                ))}
              </svg>

              {/* Interactive Hover Tooltip */}
              {hoveredPoint && (
                <div
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-12 z-20 rounded-xl bg-gray-900/95 px-3 py-1.5 text-xs text-white shadow-xl backdrop-blur-xs transition-all"
                  style={{
                    left: `${(hoveredPoint.x / chartW) * 100}%`,
                    top: `${(hoveredPoint.y / chartH) * 100}%`,
                  }}
                >
                  <p className="font-bold text-[#86CA7F]">{hoveredPoint.month}</p>
                  <p className="font-medium text-gray-200">
                    {hoveredPoint.type}: <span className="font-bold text-white">{hoveredPoint.value} Tons</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Legend */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-gray-100 text-xs font-semibold text-gray-700">
            <div className="flex items-center gap-2">
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-[#1E5E2F] bg-white" />
              <span>{selectedFruit} (Tons)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-dashed border-[#4B7B75] bg-white" />
              <span>Pineapples (Tons)</span>
            </div>
          </div>
        </div>

        {/* RIGHT CARD: Demand Forecast (Predicted) */}
        <div className="flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-6 sm:p-7 shadow-xs relative">
          <div>
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#1F2937]">
                  Demand Forecast (Predicted)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Next 6 Months - Machine Learning Model
                </p>
              </div>

              {/* Fruit Selector Dropdown */}
              <div className="relative">
                <select
                  value={selectedFruit}
                  onChange={(e) => setSelectedFruit(e.target.value)}
                  aria-label="Select fruit for predicted demand forecast"
                  className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-gray-700 shadow-2xs hover:border-gray-300 focus:border-[#1E5E2F] focus:outline-hidden cursor-pointer"
                >
                  {fruitOptions.map((fruit) => (
                    <option key={fruit} value={fruit}>
                      {fruit}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* SVG Predicted Demand Bar Chart with Confidence Bands */}
            <div className="relative w-full aspect-21/10 min-h-60 mt-2 select-none">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full h-full overflow-visible"
              >
                {/* Horizontal Grid Lines & Y-Axis Labels */}
                {[300, 250, 200, 150, 100, 50, 0].map((val) => {
                  const y = padTop + plotH - (val / yMaxPredicted) * plotH;
                  return (
                    <g key={val}>
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={chartW - padRight}
                        y2={y}
                        stroke="#E5E7EB"
                        strokeWidth="1"
                      />
                      <text
                        x={padLeft - 8}
                        y={y + 4}
                        textAnchor="end"
                        fontSize="10"
                        fill="#6B7280"
                        fontWeight="500"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Vertical Forest Green Bars */}
                {predictedPoints.map((pt, idx) => (
                  <rect
                    key={`bar-${idx}`}
                    x={pt.barX}
                    y={pt.barY}
                    width={pt.barWidth}
                    height={pt.barHeight}
                    rx="4"
                    fill="#1E5E2F"
                    className="transition-all duration-200 hover:brightness-110 cursor-pointer"
                    onMouseEnter={() =>
                      setHoveredPoint({
                        x: pt.centerX,
                        y: pt.barY,
                        month: pt.month,
                        value: pt.predicted,
                        type: `Predicted Demand (${selectedFruit})`,
                      })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}

                {/* Upper Confidence Bound Dotted Line */}
                <path
                  d={upperBoundPath}
                  fill="none"
                  stroke="#84CC16"
                  strokeWidth="1.5"
                  strokeDasharray="2 3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Lower Confidence Bound Dotted Line */}
                <path
                  d={lowerBoundPath}
                  fill="none"
                  stroke="#99D5C9"
                  strokeWidth="1.5"
                  strokeDasharray="2 3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* X-Axis Month Labels */}
                {predictedPoints.map((pt) => (
                  <text
                    key={pt.month}
                    x={pt.centerX}
                    y={chartH - 6}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#4B5563"
                    fontWeight="500"
                  >
                    {pt.month}
                  </text>
                ))}
              </svg>

              {/* Hover Tooltip */}
              {hoveredPoint && (
                <div
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-12 z-20 rounded-xl bg-gray-900/95 px-3 py-1.5 text-xs text-white shadow-xl backdrop-blur-xs transition-all"
                  style={{
                    left: `${(hoveredPoint.x / chartW) * 100}%`,
                    top: `${(hoveredPoint.y / chartH) * 100}%`,
                  }}
                >
                  <p className="font-bold text-[#86CA7F]">{hoveredPoint.month}</p>
                  <p className="font-medium text-gray-200">
                    {hoveredPoint.type}:{" "}
                    <span className="font-bold text-white">{hoveredPoint.value} Tons</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Legend */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-5 pt-4 border-t border-gray-100 text-xs font-semibold text-gray-700">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#84CC16]" />
              <span>Confidence Upper Bound</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#99D5C9]" />
              <span>Confidence Lower Bound</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#1E5E2F]" />
              <span>Predicted Demand ({selectedFruit})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Model Intelligence & Stocking Recommendation Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#71C168]/15 text-[#1E5E2F]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Model Accuracy
            </span>
            <p className="text-xl font-black text-[#1F2937]">
              {currentDataset.modelAccuracy} Confidence
            </p>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <Sparkles className="h-3.5 w-3.5" /> High Precision Ensemble Model
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ArrowUpRight className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              6-Month Growth
            </span>
            <p className="text-xl font-black text-[#1F2937]">
              {currentDataset.projectedGrowth} YoY
            </p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Demand trending upward through summer
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <PackageCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Optimal Reorder Stock
            </span>
            <p className="text-xl font-black text-[#1F2937]">
              {currentDataset.optimalReorder}
            </p>
            <p className="text-xs text-amber-700 font-medium mt-0.5">
              Suggested warehouse allocation
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
