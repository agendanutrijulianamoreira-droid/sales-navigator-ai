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
const Strategy = lazy(() => import("./pages/Strategy"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const ContentPlanner = lazy(() => import("./pages/ContentPlanner"));
const CarouselCreator = lazy(() => import("./pages/CarouselCreator"));
const BrandKitPage = lazy(() => import("./pages/BrandKitPage"));
const Products = lazy(() => import("./pages/Products"));
const Conversion = lazy(() => import("./pages/Conversion"));
const Results = lazy(() => import("./pages/Results"));
const Mentor = lazy(() => import("./pages/Mentor"));
const Library = lazy(() => import("./pages/Library"));
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
                <Route path="/strategy" element={<Strategy />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/planner" element={<ContentPlanner />} />
                <Route path="/carousel-creator" element={<CarouselCreator />} />
                <Route path="/brand-kit" element={<BrandKitPage />} />
                <Route path="/products" element={<Products />} />
                <Route path="/conversion" element={<Conversion />} />
                <Route path="/results" element={<Results />} />
                <Route path="/mentor" element={<Mentor />} />
                <Route path="/library" element={<Library />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/photo-studio" element={<PhotoStudio />} />
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
