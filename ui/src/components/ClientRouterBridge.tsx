"use client";

import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import LandingPage from "@/app/page";
import AdminQCDashboard from "@/app/admin/qc/page";

function RouterSync() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path !== location.pathname) {
        navigate(path, { replace: true });
      }
    }
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin/qc" element={<AdminQCDashboard />} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

export default function ClientRouterBridge() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <BrowserRouter>
      <RouterSync />
    </BrowserRouter>
  );
}
