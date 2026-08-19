import { CheckCircle2, Info, ScanLine } from "lucide-react";
import type { RecentDetection } from "./types";

interface RecentDetectionsCardProps {
  recentDetections: RecentDetection[];
}

export function RecentDetectionsCard({ recentDetections }: RecentDetectionsCardProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#1F2937]">Recent Detections</h2>
        {recentDetections.length > 0 && (
          <span className="text-xs font-bold text-gray-400">Live</span>
        )}
      </div>

      <div className="space-y-3">
        {recentDetections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
            <ScanLine className="h-8 w-8 text-gray-300 mb-2" />
            <p className="text-xs font-semibold text-gray-600">No live detections yet</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Start webcam inspection to detect items</p>
          </div>
        ) : (
          recentDetections.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3.5 transition-all hover:bg-white hover:shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    item.status === "Fresh"
                      ? "bg-[#71C168]/15 text-[#71C168]"
                      : "bg-[#DC2626]/15 text-[#DC2626]"
                  }`}
                >
                  {item.status === "Fresh" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Info className="h-5 w-5" />
                  )}
                </div>

                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#1F2937]">{item.name}</span>
                  <span className="font-mono text-xs text-gray-400">{item.code}</span>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span
                  className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    item.status === "Fresh"
                      ? "bg-[#71C168]/20 text-[#71C168]"
                      : "bg-[#DC2626]/20 text-[#DC2626]"
                  }`}
                >
                  {item.status === "Fresh" ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 shrink-0" />
                      Fresh
                    </>
                  ) : (
                    <>
                      <Info className="h-3 w-3 shrink-0" />
                      Defect
                    </>
                  )}
                </span>
                <span className="mt-0.5 text-[11px] text-gray-400">
                  {item.confidence}% Conf.
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
