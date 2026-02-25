import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { CarouselData } from '@/hooks/useCarouselGenerator';

export function useCarouselPersistence() {
    const [isSaving, setIsSaving] = useState(false);

    const saveCarousel = async (carousel: CarouselData, userId: string, brandSnapshot?: any) => {
        if (!userId) {
            toast.error("Usuário não autenticado.");
            return null;
        }

        setIsSaving(true);
        const toastId = toast.loading("Salvando carrossel na nuvem...");

        try {
            // Usamos o título do carrossel ou um padrão
            const { data, error } = await supabase
                .from('carousels')
                .upsert({
                    id: carousel.id, // Se tiver ID, atualiza. Se não, gera novo.
                    user_id: userId,
                    title: carousel.titulo || 'Novo Carrossel',
                    slides: carousel.slides as any,
                    branding_snapshot: brandSnapshot as any,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            toast.dismiss(toastId);
            toast.success("Carrossel salvo com sucesso!");
            return data;
        } catch (error) {
            console.error("Erro ao salvar carrossel:", error);
            toast.dismiss(toastId);
            toast.error("Erro ao salvar. Tente novamente.");
            return null;
        } finally {
            setIsSaving(false);
        }
    };

    return { saveCarousel, isSaving };
}
