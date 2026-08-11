export function FreshnessOverviewCard() {
  const ranges = [
    { label: "Apples", value: "92% Fresh / 8% Reject", width: "92%" },
    { label: "Oranges", value: "85% Fresh / 15% Reject", width: "85%" },
    { label: "Bananas", value: "78% Fresh / 22% Reject", width: "78%" },
  ];

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs lg:col-span-8">
      <h2 className="text-lg font-bold text-[#1F2937]">Overall Freshness</h2>

      <div className="space-y-4">
        {ranges.map((item) => (
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
        ))}
      </div>
    </div>
  );
}
