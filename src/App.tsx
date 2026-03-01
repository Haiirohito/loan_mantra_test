// src/App.tsx
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "./components/PublicLayout";

// Lazy load pages
const Home = lazy(() => import("./pages/public/Home"));
const Calculators = lazy(() => import("./pages/public/Calculators"));
const IncomeTaxCalculator = lazy(() => import("./pages/public/IncomeTaxCalculator"));
const SIPCalculator = lazy(() => import("./pages/public/SIPCalculator"));
const FDCalculator = lazy(() => import("./pages/public/FDCalculator"));
const RDCalculator = lazy(() => import("./pages/public/RDCalculator"));
const GSTCalculator = lazy(() => import("./pages/public/GSTCalculator"));
const HomeLoanEMICalculator = lazy(() => import("./pages/public/HomeLoanEMICalculator"));
const PersonalLoanEMICalculator = lazy(() => import("./pages/public/PersonalLoanEMICalculator"));
const BusinessLoanEMICalculator = lazy(() => import("./pages/public/BusinessLoanEMICalculator"));
const BusinessLoanPrepaymentCalculator = lazy(() => import("./pages/public/BusinessLoanPrepaymentCalculator"));
const CompoundInterestCalculator = lazy(() => import("./pages/public/CompoundInterestCalculator"));
const Contact = lazy(() => import("./pages/public/Contact"));
const Loans = lazy(() => import("./pages/public/Loans"));
const ApplyLoanForm = lazy(() => import("./pages/public/ApplyLoanForm"));
const NotFound = lazy(() => import("./pages/public/NotFound"));
const SubmissionSuccess = lazy(() => import("./pages/public/SubmissionSuccess"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes wrapped in PublicLayout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/calculators" element={<Calculators />} />
              <Route path="/calculators/income-tax" element={<IncomeTaxCalculator />} />
              <Route path="/calculators/sip" element={<SIPCalculator />} />
              <Route path="/calculators/fd" element={<FDCalculator />} />
              <Route path="/calculators/rd" element={<RDCalculator />} />
              <Route path="/calculators/gst" element={<GSTCalculator />} />
              <Route path="/calculators/home-loan-emi" element={<HomeLoanEMICalculator />} />
              <Route path="/calculators/personal-loan-emi" element={<PersonalLoanEMICalculator />} />
              <Route path="/calculators/business-loan-emi" element={<BusinessLoanEMICalculator />} />
              <Route path="/calculators/business-loan-prepayment" element={<BusinessLoanPrepaymentCalculator />} />
              <Route path="/calculators/compound-interest" element={<CompoundInterestCalculator />} />
              <Route path="/loans" element={<Loans />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/apply/:categorySlug/:loanSlug" element={<ApplyLoanForm />} />
              <Route path="/success" element={<SubmissionSuccess />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
