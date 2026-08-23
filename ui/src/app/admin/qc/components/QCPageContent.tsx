"use client";

import { BatchStatsCard } from "./BatchStatsCard";
import { CameraPanel } from "./CameraPanel";
import { FreshnessOverviewCard } from "./FreshnessOverviewCard";
import { RecentDetectionsCard } from "./RecentDetectionsCard";
import { RecentScansTable } from "./RecentScansTable";
import { useQCLogic } from "../hooks/useQCLogic";

export function QCPageContent() {
  const {
    isCameraActive,
    isScanning,
    seconds,
    cameraError,
    selectedFruit,
    setSelectedFruit,
    batchScannedCount,
    livePassRate,
    currentResult,
    recentDetections,
    qcHistory,
    videoRef,
    canvasRef,
    startBatchScan,
    stopBatchScan,
  } = useQCLogic();

  return (
    <div className="min-h-full bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 pt-2 pb-8 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#71C168]">
            AI Quality Control
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Live camera feed for automated produce scan & inspection.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <CameraPanel
            isCameraActive={isCameraActive}
            isScanning={isScanning}
            seconds={seconds}
            cameraError={cameraError}
            selectedFruit={selectedFruit}
            onFruitChange={setSelectedFruit}
            onStartScan={startBatchScan}
            onStopScan={stopBatchScan}
            videoRef={videoRef}
            canvasRef={canvasRef}
            currentResult={currentResult}
          />

          <div className="space-y-6 lg:col-span-4">
            <BatchStatsCard
              isScanning={isScanning}
              batchScannedCount={batchScannedCount}
              livePassRate={livePassRate}
            />
            <RecentDetectionsCard recentDetections={recentDetections} />
          </div>
        </div>

        <div className="space-y-8 pt-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-xs lg:col-span-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  TOTAL BATCH (TODAY)
                </span>
                <div className="mt-2 text-4xl font-black text-[#1F2937]">{qcHistory.length}</div>
              </div>
            </div>

            <FreshnessOverviewCard qcHistory={qcHistory} />
          </div>

          <RecentScansTable qcHistory={qcHistory} />
        </div>
      </div>
    </div>
  );
}
