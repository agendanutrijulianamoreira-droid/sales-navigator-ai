import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { useCredits } from './useCredits';

export function useMagicWriter() {
    const [isWriting, setIsWriting] = useState(false);
    const { consumeCredit } = useCredits();

    const rewriteText = async (currentText: string, mode: 'shorter' | 'punchy' | 'professional') => {
        // 1. Verificar Créditos
        const hasCredit = await consumeCredit(1);
        if (!hasCredit) return currentText;

        if (!currentText.trim()) {
            toast.error("O texto está vazio!");
            return currentText;
        }

        setIsWriting(true);
        const toastId = toast.loading("A IA está reescrevendo...");

        try {
            const { data, error } = await supabase.functions.invoke('generate-carousel-text', {
                body: { currentText, mode }
            });

            if (error) throw error;

            toast.dismiss(toastId);
            toast.success("Texto atualizado com sucesso!");
            return data.text || currentText;
        } catch (error) {
            console.error("Erro na Reescrita Mágica:", error);
            toast.dismiss(toastId);
            toast.error("Erro ao reescrever texto. Tente novamente.");
            return currentText;
        } finally {
            setIsWriting(false);
        }
    };

    return { rewriteText, isWriting };
}
