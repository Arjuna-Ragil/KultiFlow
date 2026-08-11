import { Camera, CheckCircle2, Info } from "lucide-react";
import type { RefObject } from "react";
import type { BoundingBox } from "./types";

interface CameraPanelProps {
  isCameraActive: boolean;
  isScanning: boolean;
  seconds: number;
  cameraError: string | null;
  selectedFruit: string;
  onFruitChange: (value: string) => void;
  onStartScan: () => void;
  onStopScan: () => void;
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  boundingBoxes: BoundingBox[];
}

export function CameraPanel({
  isCameraActive,
  isScanning,
  seconds,
  cameraError,
  selectedFruit,
  onFruitChange,
  onStartScan,
  onStopScan,
  videoRef,
  canvasRef,
  boundingBoxes,
}: CameraPanelProps) {
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs lg:col-span-8">
      <div className="flex items-center justify-between border-b border-gray-100 bg-white p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onStartScan}
            disabled={isScanning}
            className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold text-white shadow-xs transition-colors ${
              isScanning
                ? "cursor-not-allowed bg-gray-300 opacity-60"
                : "bg-[#71C168] hover:bg-[#62b059]"
            }`}
          >
            Start
          </button>
          <button
            onClick={onStopScan}
            disabled={!isScanning}
            className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold text-white shadow-xs transition-colors ${
              !isScanning
                ? "cursor-not-allowed bg-gray-300 opacity-60"
                : "bg-[#DC2626] hover:bg-[#b91c1c]"
            }`}
          >
            Stop
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <span>Batch Time</span>
          <span className="font-mono text-base font-bold text-[#1F2937]">
            {formatTime(seconds)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3">
        <div className="text-sm font-medium text-gray-600">
          {cameraError ? "Camera fallback mode enabled" : "Live inspection stream"}
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-xs">
          <span className="text-xs font-bold uppercase text-gray-500">Target:</span>
          <select
            value={selectedFruit}
            onChange={(event) => onFruitChange(event.target.value)}
            className="cursor-pointer bg-transparent text-sm font-bold text-[#1F2937] focus:outline-none"
          >
            <option value="Apple (Gala)">Apple (Gala)</option>
            <option value="Banana (Cavendish)">Banana (Cavendish)</option>
            <option value="Orange (Valencia)">Orange (Valencia)</option>
          </select>
        </div>
      </div>

      <div className="relative flex aspect-16/10 w-full items-center justify-center overflow-hidden bg-[#1F2937] group">
        {!isCameraActive ? (
          <button
            onClick={onStartScan}
            className="z-10 flex items-center gap-3 rounded-2xl bg-[#71C168] px-8 py-4 text-xl font-black text-white shadow-xl transition-all hover:scale-105 hover:bg-[#62b059]"
          >
            <Camera className="h-8 w-8" />
            <span>Activate WebCam</span>
          </button>
        ) : (
          <div className="relative h-full w-full">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              playsInline
              muted
              autoPlay
            />
            <canvas ref={canvasRef} className="hidden" />

            {boundingBoxes.map((box) => (
              <div
                key={box.id}
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`,
                }}
                className={`pointer-events-none absolute flex flex-col justify-between rounded-xl border-4 p-2 transition-all duration-300 ${
                  box.type === "fresh"
                    ? "border-[#71C168] bg-[#71C168]/15 shadow-[0_0_18px_rgba(113,193,104,0.4)]"
                    : "border-dashed border-[#DC2626] bg-[#DC2626]/15 shadow-[0_0_18px_rgba(220,38,38,0.4)]"
                }`}
              >
                <div className="self-start">
                  <span
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-black text-white shadow-md ${
                      box.type === "fresh" ? "bg-[#71C168]" : "bg-[#DC2626]"
                    }`}
                  >
                    {box.type === "fresh" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <Info className="h-3.5 w-3.5 shrink-0" />
                    )}
                    {box.name}
                  </span>
                </div>
              </div>
            ))}

            <div className="absolute left-0 right-0 top-0 h-1 bg-[#71C168] shadow-[0_0_14px_#71C168] animate-scanline" />
          </div>
        )}
      </div>

      {cameraError && (
        <div className="border-t border-gray-100 bg-[#fef2f2] px-4 py-2 text-sm text-[#b91c1c]">
          {cameraError}
        </div>
      )}
    </div>
  );
}
