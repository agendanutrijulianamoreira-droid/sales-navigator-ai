import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

type AppRole = "admin" | "elite" | "teste" | "user";

export function useUserRole() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRoles = useCallback(async () => {
    if (!user?.id) {
      setRoles([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) throw error;
      setRoles((data || []).map((r: any) => r.role as AppRole));
    } catch (error) {
      console.error("Error fetching user roles:", error);
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const hasRole = useCallback((role: AppRole) => {
    if (user?.email === 'agendanutrijulianamoreira@gmail.com') return true;
    return roles.includes(role);
  }, [roles, user?.email]);

  const hasPremiumAccess = useCallback(
    () => {
      if (user?.email === 'agendanutrijulianamoreira@gmail.com') return true;
      return roles.some((r) => ["admin", "elite", "teste"].includes(r));
    },
    [roles, user?.email]
  );

  return { roles, isLoading, hasRole, hasPremiumAccess, refetch: fetchRoles };
}
