"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

export default function InspectionPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);
  const [result, setResult] = useState<{ label: string; confidence: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Interval reference
  const inspectionInterval = useRef<NodeJS.Timeout | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
        setError(null);
      }
    } catch (err) {
      setError("Failed to access camera. Please ensure permissions are granted.");
      console.error("Camera access error:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
      stopInspection();
    }
  };

  const captureAndInspect = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame onto the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to Blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");

      try {
        const response = await fetch("http://localhost:8000/api/inspection/inspect", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to inspect frame");
        }

        const data = await response.json();
        if (data.error) {
          setError(data.error);
        } else {
          setResult({
            label: data.label,
            confidence: data.confidence,
          });
          setError(null);
        }
      } catch (err: any) {
        console.error("Inspection error:", err);
        // Only show error if we're not currently displaying a valid result
        // to avoid flashing errors on temporary network blips
      }
    }, "image/jpeg", 0.8);
  }, [isCameraActive]);

  const toggleInspection = () => {
    if (isInspecting) {
      stopInspection();
    } else {
      startInspection();
    }
  };

  const startInspection = () => {
    setIsInspecting(true);
    // Capture immediately, then every 2 seconds
    captureAndInspect();
    inspectionInterval.current = setInterval(() => {
      captureAndInspect();
    }, 2000);
  };

  const stopInspection = () => {
    setIsInspecting(false);
    if (inspectionInterval.current) {
      clearInterval(inspectionInterval.current);
      inspectionInterval.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-indigo-500 selection:text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/20 blur-[120px] pointer-events-none" />

      <div className="z-10 w-full max-w-4xl flex flex-col items-center gap-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
            Real-Time Quality Inspection
          </h1>
          <p className="text-neutral-400 max-w-lg mx-auto">
            Position the product in front of the camera. Our AI will automatically analyze it in real-time.
          </p>
        </div>

        {/* Camera Container */}
        <div className="relative w-full max-w-2xl aspect-[4/3] bg-neutral-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-sm group">
          
          {!isCameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-neutral-900/80 z-20">
              <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <button 
                onClick={startCamera}
                className="px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-neutral-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                Enable Camera
              </button>
            </div>
          )}

          <video 
            ref={videoRef} 
            className="w-full h-full object-cover" 
            playsInline 
            muted 
          />
          
          {/* Hidden canvas for frame extraction */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Overlay scanning effect */}
          {isInspecting && (
            <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500/80 shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
          )}

          {/* Result Overlay */}
          {result && isCameraActive && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm">
              <div className={`p-4 rounded-2xl backdrop-blur-xl border flex items-center justify-between shadow-2xl transition-all duration-300 ${
                result.label.toLowerCase() === 'fresh' 
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100' 
                  : 'bg-rose-500/20 border-rose-500/50 text-rose-100'
              }`}>
                <div className="flex flex-col">
                  <span className="text-sm font-medium opacity-80 uppercase tracking-wider">Status</span>
                  <span className="text-2xl font-bold capitalize">{result.label}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium opacity-80 uppercase tracking-wider">Confidence</span>
                  <span className="text-xl font-semibold">{(result.confidence * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          {isCameraActive && (
            <>
              <button
                onClick={toggleInspection}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 ${
                  isInspecting 
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20 focus:ring-rose-500/50' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 focus:ring-indigo-600/50'
                }`}
              >
                {isInspecting ? "Stop Inspection" : "Start Inspection"}
              </button>
              <button
                onClick={stopCamera}
                className="px-6 py-3 rounded-full font-medium bg-neutral-800 hover:bg-neutral-700 text-white border border-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500"
              >
                Stop Camera
              </button>
            </>
          )}
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm max-w-lg text-center">
            {error}
          </div>
        )}

      </div>
      
      {/* Global styles for animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0%, 100% { top: 5%; }
          50% { top: 95%; }
        }
      `}} />
    </div>
  );
}
