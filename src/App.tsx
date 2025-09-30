import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { ProtectedRoute } from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
