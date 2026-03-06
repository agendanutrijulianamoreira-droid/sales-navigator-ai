import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useFinancialSettings } from '@/hooks/useFinancialSettings';
import { useStrategyContext } from '@/hooks/useStrategyContext';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    Crown, Loader2, Sparkles, AlertCircle, CheckCircle2, Flame,
    Calendar, Target, TrendingUp, Save, RefreshCw, Sprout, Zap, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProductMixItem {
    name: string;
    ladder: 'isca' | 'entrada' | 'core' | 'premium';
    suggestedPrice: number;
    unitsNeeded: number;
    hoursPerUnit: number;
    revenueShare: number;
    rationale: string;
}

interface CalendarMonth {
    month: string;
    theme: string;
    focus: 'isca' | 'entrada' | 'core' | 'premium';
    campaign: string;
}

interface BusinessPlan {
    summary: string;
    maestroVerdict: string;
    viability: 'safe' | 'limit' | 'burnout';
    weeklyLoad: number;
    freeHours: number;
    productMix: ProductMixItem[];
    annualCalendar: CalendarMonth[];
}

interface FormData {
    goal: number;
    weeklyCap: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SERVICES = ['consultas', 'protocolos', 'acompanhamento', 'desafios', 'mentoria', 'e-book', 'curso online'];

const LADDER_CONFIG = {
    isca: { label: 'Isca', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: Sprout },
    entrada: { label: 'Entrada', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', icon: Star },
    core: { label: 'Core', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', icon: Zap },
    premium: { label: 'Premium', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Crown },
};

const VIABILITY_CONFIG = {
    safe: { label: 'Sustentável', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2 },
    limit: { label: 'No Limite', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: AlertCircle },
    burnout: { label: 'Risco Burnout', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: Flame },
};

const MONTH_COLORS = {
    isca: 'bg-slate-500',
    entrada: 'bg-violet-500',
    core: 'bg-primary',
    premium: 'bg-amber-500',
};

const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

// ─── Sub-components ───────────────────────────────────────────────────────────
function ProductCard({ item }: { item: ProductMixItem }) {
    const cfg = LADDER_CONFIG[item.ladder];
    const Icon = cfg.icon;
    return (
        <div className={cn('p-5 rounded-2xl border transition-all hover:scale-[1.02] duration-300 space-y-3', cfg.bg, cfg.border)}>
            <div className="flex items-start justify-between gap-3">
                <div className={cn('p-2 rounded-xl', cfg.bg, 'border', cfg.border)}>
                    <Icon className={cn('h-4 w-4', cfg.color)} />
                </div>
                <Badge className={cn('text-[8px] font-black uppercase', cfg.bg, cfg.color, 'border', cfg.border)}>
                    {cfg.label}
                </Badge>
            </div>
            <h4 className="font-black text-sm text-white leading-tight">{item.name}</h4>
            <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                    <p className="text-[7px] font-black uppercase tracking-widest text-slate-500">Ticket</p>
                    <p className={cn('text-sm font-black', cfg.color)}>{formatCurrency(item.suggestedPrice)}</p>
                </div>
                <div className="text-center border-x border-white/5">
                    <p className="text-[7px] font-black uppercase tracking-widest text-slate-500">Volume</p>
                    <p className="text-sm font-black text-white">x{item.unitsNeeded}</p>
                </div>
                <div className="text-center">
                    <p className="text-[7px] font-black uppercase tracking-widest text-slate-500">Horas/un</p>
                    <p className="text-sm font-black text-white">{item.hoursPerUnit}h</p>
                </div>
            </div>
            {/* Revenue share bar */}
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[7px] font-black text-slate-600 uppercase">Participação</span>
                    <span className={cn('text-[8px] font-black', cfg.color)}>{item.revenueShare}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className={cn('h-full rounded-full', MONTH_COLORS[item.ladder])} style={{ width: `${item.revenueShare}%` }} />
                </div>
            </div>
            <p className="text-[9px] text-slate-500 leading-relaxed italic">{item.rationale}</p>
        </div>
    );
}

function CalendarGrid({ months }: { months: CalendarMonth[] }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {months.map((m, i) => {
                const color = MONTH_COLORS[m.focus] || 'bg-slate-500';
                const cfg = LADDER_CONFIG[m.focus];
                return (
                    <div key={i} className={cn('p-4 rounded-xl border space-y-2 transition-all hover:scale-[1.02] duration-200', cfg.bg, cfg.border)}>
                        <div className="flex items-center justify-between">
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{m.month}</span>
                            <div className={cn('w-2 h-2 rounded-full', color)} />
                        </div>
                        <p className="text-[9px] font-black text-white leading-tight">{m.theme}</p>
                        <p className="text-[8px] text-slate-400 italic leading-tight">{m.campaign}</p>
                        <Badge className={cn('text-[7px] font-black mt-1', cfg.bg, cfg.color, 'border', cfg.border)}>
                            {cfg.label}
                        </Badge>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function CFOConsultant() {
    const { settings } = useFinancialSettings();
    const { strategy } = useStrategyContext();
    const { addProduct } = useProducts();
    const { user } = useAuth();

    const [selectedServices, setSelectedServices] = useState<string[]>(['consultas', 'protocolos']);
    const [plan, setPlan] = useState<BusinessPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const { register, handleSubmit, watch } = useForm<FormData>({
        defaultValues: {
            goal: settings?.monthly_income_goal || 10000,
            weeklyCap: (settings?.work_days_week || 5) * (settings?.work_hours_day || 6),
        }
    });

    const toggleService = (s: string) => {
        setSelectedServices(prev =>
            prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
        );
    };

    const onSubmit = async (data: FormData) => {
        if (selectedServices.length === 0) {
            toast.error('Selecione ao menos um serviço.');
            return;
        }
        setIsLoading(true);
        setPlan(null);
        try {
            const { data: fnData, error } = await supabase.functions.invoke('generate-business-plan', {
                body: {
                    goal: Number(data.goal),
                    services: selectedServices,
                    niche: strategy?.niche || '',
                    subNiche: strategy?.subNiche || '',
                    weeklyCap: Number(data.weeklyCap),
                    fixedCosts: settings?.fixed_costs || 0,
                    taxRate: settings?.tax_rate || 10,
                }
            });
            if (error) throw error;
            setPlan(fnData as BusinessPlan);
        } catch (err: any) {
            toast.error(`Erro ao gerar plano: ${err.message || 'Tente novamente.'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const savePlan = async () => {
        if (!plan || !user) return;
        setIsSaving(true);
        try {
        for (const item of plan.productMix) {
                await addProduct({
                    nome: item.name,
                    tipo_produto: item.ladder === 'premium' ? 'acompanhamento' : item.ladder === 'core' ? 'consulta' : 'protocolo',
                    ticket: item.suggestedPrice,
                    descricao: `[${item.ladder}] ${item.rationale} | Horas/un: ${item.hoursPerUnit} | Volume: ${item.unitsNeeded}`,
                    tipo_cliente: 'desenvolvido',
                    ativo: true,
                    ordem: 0,
                } as any);
            }
            toast.success('Plano salvo! Produtos adicionados ao seu acervo.');
        } catch (err: any) {
            toast.error('Erro ao salvar plano.');
        } finally {
            setIsSaving(false);
        }
    };

    const viabilityCfg = plan ? VIABILITY_CONFIG[plan.viability] : null;

    return (
        <div className="space-y-10 pb-16 animate-in fade-in duration-700">

            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 rounded-[2rem] p-8 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Crown className="w-40 h-40" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-primary/20 p-2 rounded-xl border border-primary/30">
                            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Consultoria CFO</span>
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight mb-2">Arquiteto de Faturamento IA</h2>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Defina sua meta e seus serviços. O CFO vai calcular o mix ideal de produtos, a viabilidade da sua agenda e gerar um calendário de campanhas para os próximos 12 meses.
                    </p>
                </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-none bg-card/60 backdrop-blur-xl rounded-2xl shadow-xl p-6 space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Target className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Meta Financeira</span>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Meta Líquida Mensal</Label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">R$</span>
                                    <Input type="number" {...register('goal')} className="pl-10 h-12 text-lg font-black bg-white/5 border-white/10 rounded-xl" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Cap Semanal de Horas</Label>
                                <div className="relative">
                                    <Input type="number" {...register('weeklyCap')} className="h-10 font-bold bg-white/5 border-white/10 rounded-xl pr-10" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">h/sem</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="border-none bg-card/60 backdrop-blur-xl rounded-2xl shadow-xl p-6 space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Serviços que você oferece</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {SERVICES.map(s => (
                                <button
                                    type="button"
                                    key={s}
                                    onClick={() => toggleService(s)}
                                    className={cn(
                                        'px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide border transition-all',
                                        selectedServices.includes(s)
                                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                        {strategy?.niche && (
                            <div className="pt-2 flex items-center gap-2 text-[9px] text-slate-500 font-bold">
                                <Sparkles className="h-3 w-3 text-primary" />
                                Nicho detectado: <span className="text-primary">{strategy.niche}</span>
                            </div>
                        )}
                    </Card>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-md rounded-2xl shadow-xl transition-all active:scale-[0.98]"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Calculando seu Plano de Voo...</span>
                    ) : (
                        <span className="flex items-center gap-2"><Sparkles className="h-5 w-5" /> Gerar Plano de Voo</span>
                    )}
                </Button>
            </form>

            {/* Plan Dashboard */}
            {plan && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

                    {/* Summary + Viability */}
                    <Card className={cn('border-none p-8 rounded-[2rem] space-y-4', viabilityCfg?.bg, viabilityCfg?.border, 'border-2')}>
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2">
                                    <Crown className={cn('h-5 w-5', viabilityCfg?.color)} />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Veredito do Maestro CFO</span>
                                </div>
                                <p className="text-white font-bold text-sm leading-relaxed">{plan.maestroVerdict}</p>
                                <p className="text-slate-400 text-xs italic">{plan.summary}</p>
                            </div>
                            <div className="shrink-0 text-center space-y-1">
                                <Badge className={cn('px-4 py-1.5 font-black text-[10px]', viabilityCfg?.bg, viabilityCfg?.color, 'border', viabilityCfg?.border)}>
                                    {viabilityCfg?.label}
                                </Badge>
                                <div className="text-center space-y-0.5">
                                    <p className="text-[8px] text-slate-500 uppercase tracking-widest">Carga Semanal</p>
                                    <p className={cn('text-2xl font-black', viabilityCfg?.color)}>{plan.weeklyLoad}h</p>
                                    {plan.freeHours > 0 && (
                                        <p className="text-[8px] text-emerald-400 font-bold">{plan.freeHours}h livres</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Product Mix */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            <h3 className="text-xl font-black tracking-tight">Mix de Produtos</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            {plan.productMix.map((item, i) => <ProductCard key={i} item={item} />)}
                        </div>
                    </div>

                    {/* Annual Calendar */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            <h3 className="text-xl font-black tracking-tight">Calendário de Campanhas Anual</h3>
                        </div>
                        <CalendarGrid months={plan.annualCalendar} />
                    </div>

                    {/* Save + Regenerate */}
                    <div className="grid md:grid-cols-2 gap-4 pt-4">
                        <Button
                            onClick={savePlan}
                            disabled={isSaving}
                            className="h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl gap-2"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Salvar Plano no Acervo
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setPlan(null)}
                            className="h-12 border-white/10 hover:bg-white/5 font-black rounded-2xl gap-2"
                        >
                            <RefreshCw className="h-4 w-4" /> Gerar Novo Plano
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
