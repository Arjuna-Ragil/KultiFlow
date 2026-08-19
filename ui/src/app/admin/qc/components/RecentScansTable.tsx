import { Eye, Filter, CheckCircle2, Info, Inbox } from "lucide-react";
import type { QCScanHistory } from "./types";

interface RecentScansTableProps {
  qcHistory: QCScanHistory[];
}

export function RecentScansTable({ qcHistory }: RecentScansTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
      <div className="flex items-center justify-between border-b border-gray-100 p-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-[#1F2937]">Recent QC Scans</h2>
          {qcHistory.length > 0 && (
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
              {qcHistory.length} total scan(s)
            </span>
          )}
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-500 transition-colors hover:text-[#71C168]">
          <Filter className="h-3.5 w-3.5" />
          <span>Filter</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        {qcHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
            <Inbox className="h-10 w-10 text-gray-300 mb-2" />
            <p className="text-sm font-semibold text-gray-600">No QC scans recorded yet</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm">
              Activate the webcam and click Start to begin scanning produce. Inspection records will appear here automatically.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs font-bold uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3.5">Scan ID</th>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">Fruit Type</th>
                <th className="px-6 py-3.5">AI Result</th>
                <th className="px-6 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {qcHistory.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-gray-50/80">
                  <td className="px-6 py-4 font-mono font-bold text-[#1F2937]">{row.id}</td>
                  <td className="px-6 py-4 text-gray-500">{row.timestamp}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={row.thumbnailUrl}
                        alt={row.fruitType}
                        className="h-8 w-8 rounded-lg border border-gray-200 object-cover"
                      />
                      <span className="font-semibold text-[#1F2937]">
                        {row.fruitType} ({row.fruitSubtype})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                        row.result === "Fresh"
                          ? "bg-[#71C168]/20 text-[#71C168]"
                          : "bg-[#DC2626]/20 text-[#DC2626]"
                      }`}
                    >
                      {row.result === "Fresh" ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#71C168]" />
                          <span>Fresh</span>
                        </>
                      ) : (
                        <>
                          <Info className="h-4 w-4 shrink-0 text-[#DC2626]" />
                          <span>Bruised (Reject)</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#71C168]">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
