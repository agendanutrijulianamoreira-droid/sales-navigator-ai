import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Tables } from "@/integrations/supabase/types";

export type Generation = Tables<"generations">;

export function useGenerations() {
  const { user } = useAuth();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGenerations = useCallback(async () => {
    if (!user) {
      setGenerations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("generations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGenerations(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao carregar gerações"));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGenerations();
  }, [fetchGenerations]);

  const saveGeneration = async (generation: Omit<Generation, "id" | "user_id" | "created_at">) => {
    if (!user) return { error: new Error("Usuário não autenticado"), data: null };

    try {
      const { data, error } = await supabase
        .from("generations")
        .insert({ ...generation, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      await fetchGenerations();
      return { error: null, data };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Erro ao salvar geração"), data: null };
    }
  };

  const toggleFavorite = async (id: string, favorito: boolean) => {
    if (!user) return { error: new Error("Usuário não autenticado") };

    try {
      const { error } = await supabase
        .from("generations")
        .update({ favorito })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      await fetchGenerations();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Erro ao atualizar favorito") };
    }
  };

  const deleteGeneration = async (id: string) => {
    if (!user) return { error: new Error("Usuário não autenticado") };

    try {
      const { error } = await supabase
        .from("generations")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      await fetchGenerations();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Erro ao remover geração") };
    }
  };

  return { generations, loading, error, saveGeneration, toggleFavorite, deleteGeneration, refetch: fetchGenerations };
}
