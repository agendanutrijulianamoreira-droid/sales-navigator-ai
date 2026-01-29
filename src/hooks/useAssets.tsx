import { useState, useCallback, useEffect } from "react";
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
    if (!user) {
      setAssets([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error("Error fetching assets:", error);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const addAsset = async (asset: Omit<Asset, "id" | "user_id" | "created_at">) => {
    if (!user) return { data: null, error: new Error("Not authenticated") };

    try {
      const { data, error } = await supabase
        .from("assets")
        .insert({
          user_id: user.id,
          tipo: asset.tipo,
          subtipo: asset.subtipo,
          url: asset.url,
          metadata: asset.metadata || {}
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setAssets(prev => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error("Error adding asset:", error);
      return { data: null, error: error as Error };
    }
  };

  const deleteAsset = async (id: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const { error } = await supabase
        .from("assets")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      
      // Update local state
      setAssets(prev => prev.filter(a => a.id !== id));
      return { error: null };
    } catch (error) {
      console.error("Error deleting asset:", error);
      return { error: error as Error };
    }
  };

  return { assets, loading, addAsset, deleteAsset, refetch: fetchAssets };
}
