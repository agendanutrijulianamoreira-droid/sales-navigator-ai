import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface FinancialSettings {
    monthly_income_goal: number;
    fixed_costs: number;
    tax_rate: number;
    work_days_week: number;
    work_hours_day: number;
}

export function useFinancialSettings() {
    const { user } = useAuth();
    const [settings, setSettings] = useState<FinancialSettings | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSettings = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('financial_settings')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setSettings({
                    monthly_income_goal: data.monthly_income_goal || 5000,
                    fixed_costs: data.fixed_costs || 1000,
                    tax_rate: data.tax_rate || 10,
                    work_days_week: data.work_days_week || 5,
                    work_hours_day: data.work_hours_day || 6
                });
            }
        } catch (error: any) {
            console.error('Error fetching financial settings:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const updateSettings = async (newSettings: Partial<FinancialSettings>) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('financial_settings')
                .upsert({
                    user_id: user.id,
                    ...settings,
                    ...newSettings,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            setSettings(prev => prev ? { ...prev, ...newSettings } : (newSettings as FinancialSettings));
            toast.success("Configurações financeiras salvas!");
        } catch (error: any) {
            console.error('Error updating financial settings:', error);
            toast.error("Erro ao salvar configurações.");
        }
    };

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return { settings, loading, updateSettings };
}
