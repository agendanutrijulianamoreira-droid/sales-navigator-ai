import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
  requireSubscription?: boolean;
}

export function ProtectedRoute({
  children,
  requireOnboarding = true,
  requireSubscription = true,
}: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { hasAccess, loading: subLoading } = useSubscription();
  const location = useLocation();

  if (authLoading || profileLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Onboarding check
  if (requireOnboarding && (!profile || !profile.onboarding_completed)) {
    if (location.pathname !== "/onboarding") {
      return <Navigate to="/onboarding" replace />;
    }
  }

  if (location.pathname === "/onboarding" && profile?.onboarding_completed) {
    return <Navigate to="/" replace />;
  }

  // Subscription check (skipped for /billing routes)
  const isBillingRoute = location.pathname.startsWith("/billing");
  if (requireSubscription && !hasAccess && !isBillingRoute) {
    return <Navigate to="/billing" replace />;
  }

  return <>{children}</>;
}
