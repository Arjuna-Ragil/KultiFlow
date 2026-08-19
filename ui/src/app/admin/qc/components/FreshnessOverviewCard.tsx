import type { QCScanHistory } from "./types";

interface FreshnessOverviewCardProps {
  qcHistory: QCScanHistory[];
}

export function FreshnessOverviewCard({ qcHistory }: FreshnessOverviewCardProps) {
  const fruitStats: Record<string, { pass: number; defect: number }> = {};
  
  qcHistory.forEach((scan) => {
    if (!fruitStats[scan.fruitType]) {
      fruitStats[scan.fruitType] = { pass: 0, defect: 0 };
    }
    fruitStats[scan.fruitType].pass += scan.passCount;
    fruitStats[scan.fruitType].defect += scan.defectCount;
  });

  const ranges = Object.entries(fruitStats).map(([label, stats]) => {
    const total = stats.pass + stats.defect;
    const freshPercent = total > 0 ? Math.round((stats.pass / total) * 100) : 0;
    const rejectPercent = total > 0 ? 100 - freshPercent : 0;
    
    return {
      label,
      value: `${freshPercent}% Fresh / ${rejectPercent}% Reject`,
      width: `${freshPercent}%`,
    };
  });

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs lg:col-span-8">
      <h2 className="text-lg font-bold text-[#1F2937]">Overall Freshness</h2>

      <div className="space-y-4">
        {ranges.length === 0 ? (
          <div className="text-sm text-gray-500 py-4">No scan data available today.</div>
        ) : (
          ranges.map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-gray-600">
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-red-100">
                <div
                  className="h-full rounded-full bg-[#71C168]"
                  style={{ width: item.width }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
