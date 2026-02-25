import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

export function useStrategyContext() {
    const { user } = useAuth();

    const { data: strategy, isLoading } = useQuery({
        queryKey: ["active-strategy", user?.id],
        queryFn: async () => {
            if (!user) return null;

            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (error) {
                console.error("Error fetching strategy context:", error);
                return null;
            }

            return {
                niche: data.nicho,
                subNiche: data.sub_nicho,
                persona: data.persona_ideal,
                mainPain: data.dor_principal,
                mainDesire: data.desejo_principal,
                promise: data.promessa_principal,
                commonEnemy: data.inimigo_comum,
                objections: data.objecoes,
                brandVoice: data.tom_voz,
                productLadder: {
                    // These might be in product table or parsed from a JSON field in profile if we add it
                    tripwire: "Produto de Entrada",
                    coreOffer: "Oferta Principal",
                    highTicket: "Protocolo High-Ticket"
                }
            };
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return { strategy, isLoading };
}
