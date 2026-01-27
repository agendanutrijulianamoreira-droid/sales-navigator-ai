import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Strategy from "./pages/Strategy";
import CalendarPage from "./pages/CalendarPage";
import ContentPlanner from "./pages/ContentPlanner";
import CarouselCreator from "./pages/CarouselCreator";
import BrandKitPage from "./pages/BrandKitPage";
import Products from "./pages/Products";
import Conversion from "./pages/Conversion";
import Results from "./pages/Results";
import Mentor from "./pages/Mentor";
import Library from "./pages/Library";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />

            <Route
              path="/onboarding"
              element={
                <ProtectedRoute requireOnboarding={false}>
                  <Onboarding />
                </ProtectedRoute>
              }
            />

            {/* Authenticated area */}
            <Route
              element={
                <ProtectedRoute>
                  <Outlet />
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
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
