import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

const Landing = lazy(() => import("./pages/Landing"));
const Index = lazy(() => import("./pages/Index"));
const UploadBills = lazy(() => import("./pages/UploadBills"));
const GenerateBills = lazy(() => import("./pages/GenerateBills"));
const StockManagement = lazy(() => import("./pages/StockManagement"));
const SalesAnalysis = lazy(() => import("./pages/SalesAnalysis"));
const DamagedProducts = lazy(() => import("./pages/DamagedProducts"));
const BusinessInsights = lazy(() => import("./pages/BusinessInsights"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background px-6 text-sm text-muted-foreground">
    Loading distributor hub...
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload-bills"
                element={
                  <ProtectedRoute>
                    <UploadBills />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/generate-bills"
                element={
                  <ProtectedRoute>
                    <GenerateBills />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stock-management"
                element={
                  <ProtectedRoute>
                    <StockManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sales-analysis"
                element={
                  <ProtectedRoute>
                    <SalesAnalysis />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/damaged-products"
                element={
                  <ProtectedRoute>
                    <DamagedProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business-insights"
                element={
                  <ProtectedRoute>
                    <BusinessInsights />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
