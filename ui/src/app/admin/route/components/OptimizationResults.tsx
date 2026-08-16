interface OptimizationResultsProps {
  loading: boolean;
  results: any;
}

export function OptimizationResults({ loading, results }: OptimizationResultsProps) {
  return (
    <div className="col-span-12 md:col-span-7">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs sticky top-8">
        <h2 className="text-lg font-bold text-[#1F2937] mb-6 border-b border-gray-100 pb-4">Optimization Results</h2>
        
        {!results && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-gray-50 p-4">
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-gray-900">No Routes Generated</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm">Configure your fleet and locations on the left, then click Generate to calculate optimal paths.</p>
          </div>
        )}
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-pulse">
            <div className="mb-4 h-12 w-12 rounded-full border-4 border-[#71C168]/30 border-t-[#71C168] animate-spin"></div>
            <h3 className="text-sm font-bold text-gray-900">Calculating Routes</h3>
            <p className="mt-1 text-sm text-gray-500">The AI is crunching the numbers...</p>
          </div>
        )}
        
        {results && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</div>
                <div className="text-lg font-bold text-[#71C168]">{results.status || "—"}</div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Travel Time</div>
                <div className="text-lg font-bold text-[#1F2937]">{results.total_waktu_menit ?? "0"} <span className="text-sm font-normal text-gray-500">min</span></div>
              </div>
            </div>

            {results.toko_di_drop && results.toko_di_drop.length > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <h4 className="text-sm font-bold text-red-800 mb-2">Unfulfilled Destinations (Capacity Exceeded)</h4>
                <ul className="list-disc pl-5 text-sm text-red-600 space-y-1">
                  {results.toko_di_drop.map((dn: string) => (<li key={dn}>{dn}</li>))}
                </ul>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-bold text-[#1F2937] border-b border-gray-100 pb-2">Vehicle Assignments</h3>
              <div className="grid grid-cols-1 gap-4">
                {(results.rute_kendaraan || []).map((v: any, idx: number) => (
                  <div key={idx} className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                      <div className="font-bold text-[#1F2937] flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        Vehicle {v.id_kendaraan ?? idx + 1}
                      </div>
                      <div className="text-xs font-semibold text-gray-500">
                        Load: <span className="text-gray-900">{v.total_muatan ?? "0"}</span> • 
                        Time: <span className="text-gray-900">{v.waktu_tempuh_kendaraan ?? "0"}m</span>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      {(v.detail_rute || []).map((r: any, i: number) => (
                        <div key={i} className={`flex items-start gap-4 ${results.toko_di_drop?.includes(r.lokasi) ? "opacity-50" : ""}`}>
                          <div className="flex flex-col items-center">
                            <div className="h-3 w-3 rounded-full border-2 border-[#71C168] bg-white mt-1"></div>
                            {i !== (v.detail_rute.length - 1) && <div className="w-0.5 h-full bg-gray-200 mt-1 mb-1"></div>}
                          </div>
                          <div className="flex-1 pb-3">
                            <div className={`text-sm font-bold ${results.toko_di_drop?.includes(r.lokasi) ? "line-through text-red-500" : "text-[#1F2937]"}`}>{r.lokasi}</div>
                            <div className="text-xs text-gray-500 mt-0.5">Arrives at <span className="font-semibold text-gray-700">{r.tiba_menit_ke}m</span> | Load change: {r.muatan_bawaan}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {results.pesan_dispatcher_ai && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  AI Dispatcher Analysis
                </h4>
                <div className="text-sm text-blue-900 whitespace-pre-wrap">{results.pesan_dispatcher_ai}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
