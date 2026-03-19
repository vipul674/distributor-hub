import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/upload-bills" element={<UploadBills />} />
            <Route path="/generate-bills" element={<GenerateBills />} />
            <Route path="/stock-management" element={<StockManagement />} />
            <Route path="/sales-analysis" element={<SalesAnalysis />} />
            <Route path="/damaged-products" element={<DamagedProducts />} />
            <Route path="/business-insights" element={<BusinessInsights />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
