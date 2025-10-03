import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import VapiAssistant from "./components/VapiAssistant";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import BioAmp from "./pages/BioAmp";
import Screening from "./pages/Screening";
import SpiralDrawing from "./pages/screening/SpiralDrawing";
import FingerTapping from "./pages/screening/FingerTapping";
import MemoryTest from "./pages/screening/MemoryTest";
import StroopTest from "./pages/screening/StroopTest";
import TrailMaking from "./pages/screening/TrailMaking";
import DinoGame from "./pages/screening/DinoGame";
import PHQ9 from "./pages/screening/PHQ9";
import GAD7 from "./pages/screening/GAD7";
import PSS from "./pages/screening/PSS";
import AUDIT from "./pages/screening/AUDIT";
import { ProtectedRoute } from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <VapiAssistant />
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/wellness" element={<Index />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/bioamp" 
          element={
            <ProtectedRoute>
              <BioAmp onBack={() => window.location.href = '/dashboard'} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/screening" 
          element={
            <ProtectedRoute>
              <Screening />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/screening/spiral" 
          element={
            <ProtectedRoute>
              <SpiralDrawing />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/screening/finger-tap" 
          element={
            <ProtectedRoute>
              <FingerTapping />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/screening/memory" 
          element={
            <ProtectedRoute>
              <MemoryTest />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/screening/stroop" 
          element={
            <ProtectedRoute>
              <StroopTest />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/screening/trail-making" 
          element={
            <ProtectedRoute>
              <TrailMaking />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/screening/dino" 
          element={
            <ProtectedRoute>
              <DinoGame />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/screening/phq9" 
          element={
            <ProtectedRoute>
              <PHQ9 />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/screening/gad7" 
          element={
            <ProtectedRoute>
              <GAD7 />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/screening/pss" 
          element={
            <ProtectedRoute>
              <PSS />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/screening/audit" 
          element={
            <ProtectedRoute>
              <AUDIT />
            </ProtectedRoute>
          } 
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
