import type { QCScanHistory } from "./types";

interface FreshnessOverviewCardProps {
  qcHistory?: QCScanHistory[];
}

export function FreshnessOverviewCard({ qcHistory = [] }: FreshnessOverviewCardProps) {
  const calculateFruitStats = (fruit: string) => {
    const fruitScans = qcHistory.filter((s) =>
      s.fruitType.toLowerCase().includes(fruit.toLowerCase())
    );
    if (fruitScans.length === 0) {
      return { freshPct: 0, rejectPct: 0, hasData: false };
    }
    const totalPass = fruitScans.reduce((sum, s) => sum + s.passCount, 0);
    const totalDefect = fruitScans.reduce((sum, s) => sum + s.defectCount, 0);
    const total = totalPass + totalDefect;
    if (total === 0) return { freshPct: 0, rejectPct: 0, hasData: false };
    const freshPct = Math.round((totalPass / total) * 100);
    return { freshPct, rejectPct: 100 - freshPct, hasData: true };
  };

  const apples = calculateFruitStats("Apple");
  const oranges = calculateFruitStats("Orange");
  const bananas = calculateFruitStats("Banana");

  const ranges = [
    {
      label: "Apples",
      value: apples.hasData
        ? `${apples.freshPct}% Fresh / ${apples.rejectPct}% Reject`
        : "0% Fresh / 0% Reject",
      width: `${apples.freshPct}%`,
      hasData: apples.hasData,
    },
    {
      label: "Oranges",
      value: oranges.hasData
        ? `${oranges.freshPct}% Fresh / ${oranges.rejectPct}% Reject`
        : "0% Fresh / 0% Reject",
      width: `${oranges.freshPct}%`,
      hasData: oranges.hasData,
    },
    {
      label: "Bananas",
      value: bananas.hasData
        ? `${bananas.freshPct}% Fresh / ${bananas.rejectPct}% Reject`
        : "0% Fresh / 0% Reject",
      width: `${bananas.freshPct}%`,
      hasData: bananas.hasData,
    },
  ];

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs lg:col-span-8">
      <h2 className="text-lg font-bold text-[#1F2937]">Overall Freshness</h2>

      <div className="space-y-4">
        {ranges.map((item) => (
          <div key={item.label} className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-gray-600">
              <span>{item.label}</span>
              <span className={item.hasData ? "text-[#1F2937]" : "text-gray-400 font-normal"}>
                {item.value}
              </span>
            </div>
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-[#71C168] transition-all duration-500"
                style={{ width: item.width }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
