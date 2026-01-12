import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products">;

export function useProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!user) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)
        .order("ordem", { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao carregar produtos"));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async (product: Omit<Product, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) return { error: new Error("Usuário não autenticado") };

    try {
      const { error } = await supabase
        .from("products")
        .insert({ ...product, user_id: user.id });

      if (error) throw error;
      await fetchProducts();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Erro ao adicionar produto") };
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (!user) return { error: new Error("Usuário não autenticado") };

    try {
      const { error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      await fetchProducts();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Erro ao atualizar produto") };
    }
  };

  const deleteProduct = async (id: string) => {
    if (!user) return { error: new Error("Usuário não autenticado") };

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      await fetchProducts();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Erro ao remover produto") };
    }
  };

  return { products, loading, error, addProduct, updateProduct, deleteProduct, refetch: fetchProducts };
}
