import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Loader2 } from "lucide-react";
import { BrandProvider } from "@/contexts/BrandContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Componente de Loading Simples
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Lazy load das páginas pesadas
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const BrandHub = lazy(() => import("./pages/BrandHub"));
const BusinessLab = lazy(() => import("./pages/BusinessLab"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const ContentPlanner = lazy(() => import("./pages/ContentPlanner"));
const CarouselCreator = lazy(() => import("./pages/CarouselCreator"));
const Conversion = lazy(() => import("./pages/Conversion"));
const Results = lazy(() => import("./pages/Results"));
const Mentor = lazy(() => import("./pages/Mentor"));
const Settings = lazy(() => import("./pages/Settings"));
const PhotoStudio = lazy(() => import("./pages/PhotoStudio"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrandProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" expand={true} richColors />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />

              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute requireOnboarding={false}>
                    <Suspense fallback={<PageLoader />}>
                      <Onboarding />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              {/* Authenticated area */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Suspense fallback={<PageLoader />}>
                        <Outlet />
                      </Suspense>
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/brand-hub" element={<BrandHub />} />
                <Route path="/business-lab" element={<BusinessLab />} />
                <Route path="/planner" element={<ContentPlanner />} />
                <Route path="/carousel-creator" element={<CarouselCreator />} />
                <Route path="/conversion" element={<Conversion />} />
                <Route path="/results" element={<Results />} />
                <Route path="/mentor" element={<Mentor />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/photo-studio" element={<PhotoStudio />} />

                {/* Fallbacks/Redirects for old routes */}
                <Route path="/calendar" element={<ContentPlanner />} />
                <Route path="/strategy" element={<BrandHub />} />
                <Route path="/brand-kit" element={<BrandHub />} />
                <Route path="/products" element={<BusinessLab />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </BrandProvider>
  </QueryClientProvider>
);

export default App;
