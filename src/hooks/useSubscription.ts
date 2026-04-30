import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string | null;
  status: string;
  billing_cycle: string | null;
  ai_credits_remaining: number;
  ai_credits_reset_at: string | null;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  plan?: {
    name: string;
    slug: string;
    ai_credits_monthly: number;
    features: any;
  };
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const refresh = async () => {
    if (!user) {
      setSubscription(null);
      setHasAccess(false);
      setLoading(false);
      return;
    }

    try {
      // Check role-based access (admin/elite/teste = bypass)
      const { data: hasActive } = await supabase.rpc("has_active_subscription", {
        _user_id: user.id,
      });
      setHasAccess(!!hasActive);

      const { data } = await supabase
        .from("subscriptions")
        .select("*, plan:subscription_plans(name, slug, ai_credits_monthly, features)")
        .eq("user_id", user.id)
        .maybeSingle();

      setSubscription(data as any);
    } catch (e) {
      console.error("useSubscription error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [user?.id]);

  return { subscription, loading, hasAccess, refresh };
}
