"use client";

import Link from "next/link";
import { ScanLine, Grid, Truck, TrendingUp } from "lucide-react";
import GradientWaves from "@/components/GradientWaves";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1F2937] flex flex-col font-sans">
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/kultiflow-logo.png" alt="KultiFlow Logo" className="h-6 object-contain" />
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-[#1F2937] hover:bg-gray-50 transition-colors shadow-xs"
            >
              Login as Admin
            </Link>
            <Link
              href="/customer/dashboard"
              className="px-5 py-2.5 rounded-lg bg-[#71C168] hover:bg-[#60ab58] text-white text-sm font-semibold transition-colors shadow-xs"
            >
              Login as Customer
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#F5F5F5] border-b border-gray-200 py-16 md:py-24 min-h-150 flex items-center">
        <div className="absolute inset-0 z-0 w-full h-full">
          <GradientWaves
            horizonColor="#84CC16"
            waveColor="#86CA7F"
            crestColor="#FFFFFF"
            canvasBackground="#FFFFFF"
            speed={0.4}
            amplitude={2.5}
            waveScale={0.6}
            waveRatio={0.9}
            swell={35}
            turbulence={20}
            tilt={1.11}
            zoom={1.4}
            height={5.5}
            fogDepth={15}
            detail="medium"
            brightness={1}
            opacity={1}
            grain
            grainIntensity={0.05}
            mouseInteraction
            parallaxStrength={0.5}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pointer-events-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pointer-events-auto">
            <div className="lg:col-span-6 space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1F2937] leading-tight tracking-tight">
                Freshness Meets{" "}
                <span className="text-[#86CA7F]">Intelligence</span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl">
                The ultimate portal ecosystem. Seamlessly connecting high-efficiency
                operational fruit management with an elegant, fresh retail experience.
              </p>

              <div className="pt-2">
                <Link
                  href="/customer/dashboard"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg bg-[#71C168] hover:bg-[#60ab58] text-white font-bold text-base shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  Explore Catalog
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 relative flex justify-center items-center">
              <div className="w-full max-h-125 overflow-hidden rounded-2xl flex items-center justify-center shadow-xl border border-gray-100 bg-gray-50/80 backdrop-blur-xs p-2">
                <img
                  src="/floating_fruits.png"
                  alt="Fresh fruits produce warehouse"
                  className="w-full h-110 object-cover rounded-xl shadow-md border border-white/60"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'><rect width='100%' height='100%' fill='%23E5E7EB'/><text x='50%' y='50%' fill='%2371C168' font-size='28' font-family='Roboto' font-weight='bold' text-anchor='middle'>Fresh Fruit Warehouse & Market</text></svg>";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#F9FAFB] flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] tracking-tight">
              The Future of Freshness Management
            </h2>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              A unified intelligence layer for the entire fruit supply chain,
              maximizing freshness from warehouse to table through advanced
              automation and data-driven insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow flex flex-col items-start gap-4 group">
              <div className="p-3.5 rounded-xl bg-[#86CA7F]/10 text-[#86CA7F] group-hover:bg-[#86CA7F] group-hover:text-white transition-colors">
                <ScanLine className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#1F2937]">
                AI Quality Control
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Automated scanning and computer vision ensure only the highest grade
                produce enters the ecosystem, reducing waste and guaranteeing premium
                quality.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow flex flex-col items-start gap-4 group">
              <div className="p-3.5 rounded-xl bg-[#86CA7F]/10 text-[#86CA7F] group-hover:bg-[#86CA7F] group-hover:text-white transition-colors">
                <Grid className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#1F2937]">
                Intelligent Catalog
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Real-time stock visibility and high-fidelity imagery provide a seamless
                browsing experience for retail and bulk buyers alike.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow flex flex-col items-start gap-4 group">
              <div className="p-3.5 rounded-xl bg-[#86CA7F]/10 text-[#86CA7F] group-hover:bg-[#86CA7F] group-hover:text-white transition-colors">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#1F2937]">
                Smart Logistics
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Dynamic route optimization and cold-chain monitoring minimize transit
                times, ensuring fruit arrives at peak freshness.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow flex flex-col items-start gap-4 group">
              <div className="p-3.5 rounded-xl bg-[#86CA7F]/10 text-[#86CA7F] group-hover:bg-[#86CA7F] group-hover:text-white transition-colors">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#1F2937]">
                Demand Forecasting
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Predictive analytics anticipate market needs, allowing for precise
                inventory management and a more sustainable supply chain.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/kultiflow-logo.png" alt="KultiFlow Logo" className="h-6 object-contain" />
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 font-medium">
            <a href="#" className="hover:text-[#86CA7F] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-[#86CA7F] transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-[#86CA7F] transition-colors">
              Contact Support
            </a>
            <a href="#" className="hover:text-[#86CA7F] transition-colors">
              About Us
            </a>
          </div>

          <div className="text-sm text-gray-500 font-normal">
            © 2026 KultiFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
