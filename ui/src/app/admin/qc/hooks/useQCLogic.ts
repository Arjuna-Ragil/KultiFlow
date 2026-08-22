import { useState, useRef, useEffect } from "react";
import type { BoundingBox, QCScanHistory, RecentDetection } from "../components/types";

const ZOOM_FACTOR = 0.5; // ambil 50% bagian tengah video sebelum di-crop ke 224x224 (setara zoom 2x)

export function useQCLogic() {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedFruit, setSelectedFruit] = useState("Apple (Gala)");

  const [batchScannedCount, setBatchScannedCount] = useState(0);
  const [batchPassCount, setBatchPassCount] = useState(0);
  const [batchDefectCount, setBatchDefectCount] = useState(0);

  const [currentResult, setCurrentResult] = useState<{ label: string; confidence: number } | null>(null);
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);
  const [recentDetections, setRecentDetections] = useState<RecentDetection[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [qcHistory, setQcHistory] = useState<QCScanHistory[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isScanning) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isScanning]);

  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const addNotification = (
    title: string,
    message: string,
    type: "success" | "warning" | "info" = "info"
  ) => {
    console.info(`[${type}] ${title}: ${message}`);
  };

  const startFrameInspection = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    let isRequestPending = false;

    scanIntervalRef.current = setInterval(async () => {
      if (isRequestPending) return;

      let isFreshResult = true;
      let confidenceScore = 92;

      if (
        videoRef.current &&
        canvasRef.current &&
        videoRef.current.readyState >= 2
      ) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (context) {
          const videoWidth = video.videoWidth || 640;
          const videoHeight = video.videoHeight || 480;

          // Determine the shortest side, then zoom in to a smaller center region
          const cropSize = Math.min(videoWidth, videoHeight) * ZOOM_FACTOR;

          // Calculate center coordinates for cropping
          const startX = (videoWidth - cropSize) / 2;
          const startY = (videoHeight - cropSize) / 2;

          // Target ML model dimensions to save bandwidth
          const targetSize = 224;
          canvas.width = targetSize;
          canvas.height = targetSize;

          // Crop from center and scale down to 224x224 directly on the canvas
          context.drawImage(
            video,
            startX, startY, cropSize, cropSize, // Source crop
            0, 0, targetSize, targetSize        // Destination (scaled to 224x224)
          );

          // Simpan hasil crop buat ditampilin di live preview panel
          setPreviewImage(canvas.toDataURL("image/jpeg", 0.8));

          try {
            const blob = await new Promise<Blob | null>((resolve) =>
              canvas.toBlob(resolve, "image/jpeg", 0.8)
            );

            if (blob) {
              const formData = new FormData();
              formData.append("file", blob, "frame.jpg");

              isRequestPending = true;
              const response = await fetch("http://localhost:8000/api/inspection/inspect", {
                method: "POST",
                body: formData,
              });

              if (response.ok) {
                const data = await response.json();
                console.log("QC API Response:", data); // Debugging log for detection output

                if (data.label && data.label.toLowerCase() !== "none") {
                  isFreshResult = data.label.toLowerCase() === "fresh";
                  confidenceScore = Math.round((data.confidence || 0.9) * 100);

                  setCurrentResult({
                    label: isFreshResult ? "Fresh" : "Defect",
                    confidence: confidenceScore / 100,
                  });

                  updateDetections(isFreshResult ? "Fresh" : "Defect", confidenceScore, selectedFruit);
                } else if (data.label && data.label.toLowerCase() === "none") {
                  setCurrentResult({ label: "None", confidence: 0 });
                }
              } else {
                console.error("Server returned an error", response.status);
                setCurrentResult(null);
              }
            }
          } catch (error) {
            console.error("API inspection call failed", error);
            setCurrentResult(null);
          } finally {
            isRequestPending = false;
          }
        }
      }
    }, 4000);
  };

  const updateDetections = (
    status: "Fresh" | "Defect",
    confidence: number,
    fruitFullName: string
  ) => {
    const fruitParts = fruitFullName.split(" ");
    const fruitName = fruitParts[0] || "Fruit";

    setBatchScannedCount((prev) => prev + 1);
    let defectsAdded = 0;
    if (status === "Fresh") {
      setBatchPassCount((prev) => prev + 1);
    } else {
      setBatchDefectCount((prev) => prev + 1);
      defectsAdded += 1;
    }

    const newDet: RecentDetection = {
      id: `det-${Date.now()}`,
      name: fruitFullName,
      code: `ID: ${fruitName[0]}-${Math.floor(1000 + Math.random() * 9000)}`,
      status,
      confidence,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };

    setRecentDetections((prev) => [newDet, ...prev.slice(0, 4)]);
  };

  const startBatchScan = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setIsCameraActive(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      }, 50);

      setIsScanning(true);
      setSeconds(0);
      setBatchScannedCount(0);
      setBatchPassCount(0);
      setBatchDefectCount(0);
      startFrameInspection();
    } catch (error) {
      console.warn("Webcam access error:", error);
      setCameraError("Failed to access camera. Please ensure permissions are granted.");
      setIsCameraActive(false);
      setIsScanning(false);
    }
  };

  const stopBatchScan = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (isScanning && (batchScannedCount > 0 || seconds > 0)) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      const totalItems = batchScannedCount || 1;
      const passItems = batchPassCount;
      const defectItems = batchDefectCount;
      const passRate = Math.round((passItems / totalItems) * 100);
      const isOverallFresh = passRate >= 75;

      const fruitParts = selectedFruit.split(" ");
      const fruitType = fruitParts[0] || "Apple";
      const fruitSubtype = (fruitParts[1] || "(Gala)").replace(/[()]/g, "");

      let thumbUrl =
        "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=200&auto=format&fit=crop";
      if (fruitType.toLowerCase().includes("banana")) {
        thumbUrl =
          "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=200&auto=format&fit=crop";
      } else if (fruitType.toLowerCase().includes("orange")) {
        thumbUrl =
          "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=200&auto=format&fit=crop";
      }

      const scanId = `#SC-09${Math.floor(22 + qcHistory.length)}`;
      const newScanRecord: QCScanHistory = {
        id: scanId,
        timestamp: timeStr,
        fruitType,
        fruitSubtype,
        result: isOverallFresh ? "Fresh" : "Bruised (Reject)",
        passCount: passItems,
        defectCount: defectItems,
        thumbnailUrl: thumbUrl,
      };

      setQcHistory((prev) => [newScanRecord, ...prev]);
      addNotification(
        "QC Scan Completed",
        `Batch ${scanId} finished: ${totalItems} items scanned (${passItems} Fresh, ${defectItems} Reject).`,
        isOverallFresh ? "success" : "warning"
      );

      const payload = {
        fruit_type: fruitType + (fruitSubtype ? " " + fruitSubtype : ""),
        pass_rate: (passRate / 100).toFixed(2),
      };

      fetch("http://localhost:8000/api/inspection/save-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(err => console.error("Failed to save QC batch result", err));
    }

    setIsScanning(false);
    setIsCameraActive(false);
    setCurrentResult(null);
    setPreviewImage(null);
  };

  const livePassRate =
    batchScannedCount > 0
      ? Math.round((batchPassCount / batchScannedCount) * 100)
      : 0;

  return {
    isCameraActive,
    isScanning,
    seconds,
    cameraError,
    selectedFruit,
    setSelectedFruit,
    batchScannedCount,
    livePassRate,
    currentResult,
    boundingBoxes,
    recentDetections,
    qcHistory,
    videoRef,
    canvasRef,
    startBatchScan,
    stopBatchScan,
    previewImage,
  };
}