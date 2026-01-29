import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Asset {
  id: string;
  user_id: string;
  tipo: string;
  subtipo: string | null;
  url: string;
  metadata: any;
  created_at: string;
}

export function useAssets() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssets = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (err) {
      console.error("Error fetching assets:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const addAsset = async (asset: Omit<Asset, "id" | "user_id" | "created_at">) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const { data, error } = await supabase
        .from("assets")
        .insert([{ ...asset, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setAssets(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error("Error adding asset") };
    }
  };

  const deleteAsset = async (id: string) => {
    try {
      const { error } = await supabase
        .from("assets")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setAssets(prev => prev.filter(a => a.id !== id));
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Error deleting asset") };
    }
  };

  return { assets, loading, addAsset, deleteAsset, refetch: fetchAssets };
}
