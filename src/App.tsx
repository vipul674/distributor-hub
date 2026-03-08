import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import UploadBills from "./pages/UploadBills";
import GenerateBills from "./pages/GenerateBills";
import StockManagement from "./pages/StockManagement";
import SalesAnalysis from "./pages/SalesAnalysis";
import DamagedProducts from "./pages/DamagedProducts";
import BusinessInsights from "./pages/BusinessInsights";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/upload-bills" element={<UploadBills />} />
          <Route path="/generate-bills" element={<GenerateBills />} />
          <Route path="/stock-management" element={<StockManagement />} />
          <Route path="/sales-analysis" element={<SalesAnalysis />} />
          <Route path="/damaged-products" element={<DamagedProducts />} />
          <Route path="/business-insights" element={<BusinessInsights />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
