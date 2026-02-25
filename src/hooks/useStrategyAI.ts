import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StrategyProfile {
    targetAudience: string;
    painPoints: string[];
    desires: string[];
    objections: string[];
    brandVoice: string;
    bigIdea: string;
    maestroVerdict?: string;
    productLadder?: {
        tripwire: string;
        coreOffer: string;
        highTicket: string;
    };
}

export function useStrategyAI() {
    const [isGenerating, setIsGenerating] = useState(false);

    const generateProfile = async (nicheInput: string): Promise<StrategyProfile | null> => {
        if (!nicheInput.trim()) {
            toast.error("Por favor, informe seu nicho ou foco.");
            return null;
        }

        setIsGenerating(true);
        const toastId = toast.loading("A IA está analisando seu nicho e criando sua estratégia...");

        try {
            const { data, error } = await supabase.functions.invoke('generate-strategy', {
                body: { nicheInput }
            });

            if (error) throw error;

            toast.dismiss(toastId);
            toast.success("Estratégia gerada com sucesso!");
            return data as StrategyProfile;

        } catch (error: any) {
            console.error("Erro ao gerar estratégia:", error);
            toast.dismiss(toastId);
            toast.error(error.message || "Erro ao gerar estratégia. Tente novamente.");
            return null;
        } finally {
            setIsGenerating(false);
        }
    };

    return { generateProfile, isGenerating };
}
