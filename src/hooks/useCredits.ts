import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useProfile } from "./useProfile";
import { toast } from "sonner";

export function useCredits() {
    const { user } = useAuth();
    const [credits, setCredits] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const { profile } = useProfile();
    const isAdmin = (profile as any)?.role === 'admin';

    const fetchCredits = useCallback(async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from("user_credits")
                .select("credits")
                .eq("user_id", user.id)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setCredits(data.credits);
            } else {
                setCredits(0);
            }
        } catch (err) {
            console.error("Erro ao carregar créditos:", err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchCredits();
    }, [fetchCredits]);

    const consumeCredit = async (amount: number = 1): Promise<boolean> => {
        if (!user || credits === null) return false;

        // Admins have infinite credits (bypass consumption)
        if (isAdmin || user.email === 'agendanutrijulianamoreira@gmail.com') {
            return true;
        }

        if (credits < amount) {
            toast.error("Créditos insuficientes. Recarregue sua conta.");
            return false;
        }

        try {
            const { error } = await supabase
                .from("user_credits")
                .update({ credits: credits - amount })
                .eq("user_id", user.id);

            if (error) throw error;

            setCredits(prev => (prev !== null ? prev - amount : null));
            return true;
        } catch (err) {
            console.error("Erro ao consumir créditos:", err);
            toast.error("Erro ao processar créditos.");
            return false;
        }
    };

    return {
        credits: isAdmin || user?.email === 'agendanutrijulianamoreira@gmail.com' ? 999999 : credits,
        loading,
        consumeCredit,
        refreshCredits: fetchCredits,
        isAdmin
    };
}
