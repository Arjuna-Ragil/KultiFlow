interface BatchStatsCardProps {
  isScanning: boolean;
  batchScannedCount: number;
  livePassRate: number;
}

export function BatchStatsCard({
  isScanning,
  batchScannedCount,
  livePassRate,
}: BatchStatsCardProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
      <h2 className="text-lg font-bold text-[#1F2937]">Batch Statistics</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col rounded-xl border border-gray-100 bg-gray-50 p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Total Scanned
          </span>
          <span className="mt-1 text-3xl font-black text-[#71C168]">
            {batchScannedCount.toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col rounded-xl border border-gray-100 bg-gray-50 p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Pass Rate
          </span>
          <span className="mt-1 text-3xl font-black text-[#1F2937]">
            {batchScannedCount > 0 ? `${livePassRate}%` : "0%"}
          </span>
        </div>
      </div>
    </div>
  );
}
