import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface CalendarItem {
  id: string;
  data: string;
  tipo: string;
  titulo: string | null;
  notas: string | null;
  status: string | null;
  generation_id: string | null;
  created_at: string;
}

export function useCalendarItems() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("calendar_items")
        .select("*")
        .eq("user_id", user.id)
        .order("data", { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching calendar items:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addBatchItems = useCallback(async (itemsList: {
    data: string;
    tipo: string;
    titulo?: string;
    notas?: string;
    generation_id?: string;
  }[]) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from("calendar_items")
        .insert(
          itemsList.map(item => ({
            user_id: user.id,
            data: item.data,
            tipo: item.tipo,
            titulo: item.titulo || null,
            notas: item.notas || null,
            generation_id: item.generation_id || null,
            status: "planejado",
          }))
        )
        .select();

      if (error) throw error;

      setItems(prev => [...prev, ...data]);
      toast({ title: `${data.length} itens adicionados ao calendário!` });
      return data;
    } catch (error) {
      console.error("Error adding batch calendar items:", error);
      toast({ variant: "destructive", title: "Erro ao agendar itens" });
      return null;
    }
  }, [user?.id, toast]);

  const addItem = useCallback(async (item: {
    data: string;
    tipo: string;
    titulo?: string;
    notas?: string;
    generation_id?: string;
  }) => {
    return addBatchItems([item]).then(res => res ? res[0] : null);
  }, [addBatchItems]);

  const updateItem = useCallback(async (id: string, updates: Partial<CalendarItem>) => {
    try {
      const { error } = await supabase
        .from("calendar_items")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      setItems(prev => prev.map(item =>
        item.id === id ? { ...item, ...updates } : item
      ));
      return true;
    } catch (error) {
      console.error("Error updating calendar item:", error);
      toast({ variant: "destructive", title: "Erro ao atualizar" });
      return false;
    }
  }, [toast]);

  const deleteItem = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("calendar_items")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
      toast({ title: "Removido do calendário" });
      return true;
    } catch (error) {
      console.error("Error deleting calendar item:", error);
      toast({ variant: "destructive", title: "Erro ao remover" });
      return false;
    }
  }, [toast]);

  const getItemsForDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return items.filter(item => item.data === dateStr);
  }, [items]);

  const getItemsForMonth = useCallback((year: number, month: number) => {
    return items.filter(item => {
      const itemDate = new Date(item.data);
      return itemDate.getFullYear() === year && itemDate.getMonth() === month;
    });
  }, [items]);

  return {
    items,
    isLoading,
    addItem,
    addBatchItems,
    updateItem,
    deleteItem,
    getItemsForDate,
    getItemsForMonth,
    refetch: fetchItems,
  };
}
