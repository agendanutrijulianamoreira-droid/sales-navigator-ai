import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calculator, DollarSign, Clock, TrendingUp, AlertCircle, Save, Loader2, Lightbulb, Target, Sparkles, PieChart, Crown, Trash2, Package, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useFinancialSettings } from '@/hooks/useFinancialSettings';
import { useStrategyContext } from '@/hooks/useStrategyContext';
import { useMaestroPricing, PricingAdvice } from '@/hooks/useMaestroPricing';
import { useAISpecialist } from '@/hooks/useAISpecialist';
import { useProducts } from '@/hooks/useProducts';
import { ProductLadder } from './ProductLadder';
import { ProfitScenarios } from './ProfitScenarios';
import { AgendaViability } from './AgendaViability';
import { ClinicalCostAudit } from './ClinicalCostAudit';
import { RevenueMixWidget } from './RevenueMixWidget';
import { NetProfitCard } from './NetProfitCard';

// Tipos
type FinancialData = {
    incomeGoal: number;
    fixedCosts: number;
    taxRate: number;
    daysPerWeek: number;
    hoursPerDay: number;
};

type ProductData = {
    name: string;
    type: 'consulta' | 'protocolo' | 'acompanhamento' | 'desafio';
    hoursSpent: number;
    materialCost: number;
    desiredMargin: number;
};

export function PricingCalculator() {
    const { settings, loading: loadingSettings, updateSettings, autoSave } = useFinancialSettings();
    const { strategy } = useStrategyContext();
    const { advice } = useMaestroPricing();
    const { products, addProduct, updateProduct, deleteProduct } = useProducts();
    const { generateContent, isLoading: isGeneratingAI, streamedContent } = useAISpecialist();


    const [hourlyRate, setHourlyRate] = useState(0);
    const [suggestedPrice, setSuggestedPrice] = useState(0);
    const [breakEvenPrice, setBreakEvenPrice] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    // Form de Configurações Globais
    const financialForm = useForm<FinancialData>({
        defaultValues: {
            incomeGoal: 10000,
            fixedCosts: 2500,
            taxRate: 12,
            daysPerWeek: 5,
            hoursPerDay: 6
        }
    });

    // Atualizar form quando carregar do banco
    useEffect(() => {
        if (settings) {
            financialForm.reset({
                incomeGoal: settings.monthly_income_goal,
                fixedCosts: settings.fixed_costs,
                taxRate: settings.tax_rate,
                daysPerWeek: settings.work_days_week,
                hoursPerDay: settings.work_hours_day
            });
        }
    }, [settings, financialForm]);

    // Form do Produto que está sendo modelado
    const productForm = useForm<ProductData>({
        defaultValues: {
            name: 'Consulta Premium',
            type: 'consulta',
            hoursSpent: 1.5,
            materialCost: 0,
            desiredMargin: 30
        }
    });


    // Ajustar margem baseado no Contexto Estratégico (Command Center)
    useEffect(() => {
        if (strategy?.persona) {
            const isPremium = /premium|elite|high-ticket|executiva|empresária/i.test(strategy.persona);
            if (isPremium) {
                productForm.setValue('desiredMargin', 50);
                productForm.setValue('name', `Protocolo Elite: ${strategy.subNiche || ''}`);
            }
        }
    }, [strategy, productForm]);

    const financials = financialForm.watch();
    const product = productForm.watch();

    // 1. Calcular Custo da Hora Clínica
    useEffect(() => {
        const { incomeGoal, fixedCosts, daysPerWeek, hoursPerDay } = financials;
        const monthlyHours = Number(daysPerWeek) * Number(hoursPerDay) * 4.33; // 4.33 semanas por mês (média anual)
        const totalNeeded = Number(incomeGoal) + Number(fixedCosts);
        const rate = totalNeeded / (monthlyHours || 1);
        setHourlyRate(rate);
    }, [financials]);

    // 2. Calcular Preço do Produto (Markup Formula Elite)
    useEffect(() => {
        const { hoursSpent, materialCost, desiredMargin } = product;
        const { taxRate } = financials;

        const serviceBaseCost = (Number(hoursSpent) * hourlyRate) + Number(materialCost);
        const taxDecimal = Number(taxRate) / 100;
        const marginDecimal = Number(desiredMargin) / 100;

        // Formula Elite: Preço = Custo / (1 - Imposto - Margem)
        // Limitamos a soma das taxas + margem a 90% para evitar divisão por zero ou preços infinitos
        const totalDeductions = Math.min(taxDecimal + marginDecimal, 0.9);
        const divisor = 1 - totalDeductions;
        const finalPrice = serviceBaseCost / divisor;

        // Ponto de Equilíbrio: Preço que cobre apenas custo + impostos sobre o preço final
        const breakEven = 1 - taxDecimal > 0 ? serviceBaseCost / (1 - taxDecimal) : serviceBaseCost;

        setBreakEvenPrice(breakEven);
        setSuggestedPrice(finalPrice > 0 ? finalPrice : 0);
    }, [hourlyRate, product, financials.taxRate]);

    const handleSaveFoundation = async () => {
        const vals = financialForm.getValues();
        await updateSettings({
            monthly_income_goal: Number(vals.incomeGoal),
            fixed_costs: Number(vals.fixedCosts),
            tax_rate: Number(vals.taxRate),
            work_days_week: Number(vals.daysPerWeek),
            work_hours_day: Number(vals.hoursPerDay)
        });
    };

    // Auto-save when financial values change
    const watchedFinancials = financialForm.watch();
    useEffect(() => {
        if (!settings || loadingSettings) return;
        const vals = watchedFinancials;
        const hasChanged =
            Number(vals.incomeGoal) !== settings.monthly_income_goal ||
            Number(vals.fixedCosts) !== settings.fixed_costs ||
            Number(vals.taxRate) !== settings.tax_rate ||
            Number(vals.daysPerWeek) !== settings.work_days_week ||
            Number(vals.hoursPerDay) !== settings.work_hours_day;

        if (hasChanged) {
            autoSave({
                monthly_income_goal: Number(vals.incomeGoal),
                fixed_costs: Number(vals.fixedCosts),
                tax_rate: Number(vals.taxRate),
                work_days_week: Number(vals.daysPerWeek),
                work_hours_day: Number(vals.hoursPerDay)
            });
        }
    }, [watchedFinancials.incomeGoal, watchedFinancials.fixedCosts, watchedFinancials.taxRate, watchedFinancials.daysPerWeek, watchedFinancials.hoursPerDay]);

    const applyMaestroValues = (advice: PricingAdvice) => {
        productForm.setValue('desiredMargin', advice.suggestedMargin);
        const currentHours = productForm.getValues('hoursSpent');
        productForm.setValue('hoursSpent', Number((currentHours * advice.prepTimeMultiplier).toFixed(1)));

        // Se a meta de salário estiver muito baixa para um nicho elite, sugerimos subir
        const currentGoal = financialForm.getValues('incomeGoal');
        if (advice.hourlyMultiplier > 1.5 && currentGoal < 15000) {
            // financialForm.setValue('incomeGoal', 15000); // Opcional: sugestão proativa
        }
    };

    const handleSaveProduct = async () => {
        setIsSaving(true);
        const vals = productForm.getValues();

        try {
            const productData = {
                nome: vals.name,
                tipo_produto: vals.type as any,
                ticket: Number(suggestedPrice.toFixed(2)),
                descricao: `Margem: ${vals.desiredMargin}% | Horas: ${vals.hoursSpent}h | Custo material: R$${vals.materialCost}`,
                tipo_cliente: 'inconformado' as any,
                ativo: true,
                ordem: 0
            } as any;

            if (selectedProductId) {
                await updateProduct(selectedProductId, productData);
            } else {
                await addProduct(productData);
            }
            toast.success("Produto salvo com sucesso!");
        } catch (err) {
            toast.error("Erro ao salvar produto.");
        } finally {
            setIsSaving(false);
        }
    };

    const loadProduct = (p: any) => {
        setSelectedProductId(p.id);
        productForm.reset({
            name: p.nome,
            type: p.tipo_produto,
            hoursSpent: p.hours_spent || 1,
            materialCost: p.material_cost || 0,
            desiredMargin: p.desired_margin || 30
        });
    };

    const handleGenerateProductStrategy = async () => {
        const vals = productForm.getValues();
        await generateContent("cfo_strategist", "estrategia_produto", {
            produto: vals.name,
            preco: suggestedPrice,
            margem: vals.desiredMargin,
            custo_hora: hourlyRate,
            meta_mensal: financials.incomeGoal,
            custos_fixos: financials.fixedCosts
        });
    };

    const netContribution = suggestedPrice * (product.desiredMargin / 100);
    const unitsNeeded = netContribution > 0 ? Math.ceil((Number(financials.incomeGoal) + Number(financials.fixedCosts)) / netContribution) : 0;

    // Lucro por Hora Dedicada
    const profitPerHour = product.hoursSpent > 0 ? netContribution / product.hoursSpent : 0;

    const monthlyHoursNeeded = unitsNeeded * product.hoursSpent;
    const weeklyHoursNeeded = monthlyHoursNeeded / 4.33;
    const isBurnoutRisk = weeklyHoursNeeded > 40;

    // Total available monthly hours (based on Foundation inputs)
    const availableMonthlyHours = financials.daysPerWeek * financials.hoursPerDay * 4.33;

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    if (loadingSettings) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-700">
            {/* Recommendation Block - ELITE MAESTRO */}
            {advice && strategy && (
                <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden border border-white/10 group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
                        <Crown className="w-32 h-32" />
                    </div>
                    <TrendingUp className="absolute -left-8 -bottom-8 w-48 h-48 opacity-5 -rotate-12" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-primary/20 p-2 rounded-xl backdrop-blur-md border border-primary/30">
                                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                            </div>
                            <h4 className="font-black text-xs uppercase tracking-widest text-primary-foreground/70">Maestro Pricing Insight</h4>
                            <Badge variant="outline" className="ml-auto bg-primary text-white border-none px-4 py-1 rounded-full text-[10px] font-black shadow-lg shadow-primary/20">
                                {advice.label}
                            </Badge>
                        </div>

                        <p className="text-xl font-medium text-slate-200 mb-6 leading-relaxed max-w-2xl">
                            "No nicho de <span className="text-primary font-black underline decoration-primary/30">{strategy.niche}</span>, seu valor está na **transformação**, não nas horas. Recomendamos uma margem de <span className="text-white font-black underline decoration-primary">{advice.suggestedMargin}%</span>. {advice.reasoning}"
                        </p>

                        <Button
                            size="lg"
                            variant="secondary"
                            className="bg-white text-indigo-900 hover:bg-primary hover:text-white border-none font-black px-8 h-12 shadow-xl hover:shadow-primary/20 transition-all rounded-xl active:scale-95"
                            onClick={() => applyMaestroValues(advice)}
                        >
                            Blindar Meus Parâmetros
                        </Button>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-12 gap-8 items-start">

                {/* COLUNA 1: FUNDAÇÃO (3 colunas) */}
                <Card className="lg:col-span-3 border-none shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="bg-blue-500/20 p-2 rounded-xl">
                                <Calculator className="w-5 h-5 text-blue-500" />
                            </div>
                            <CardTitle className="text-lg font-black tracking-tight">Fundação</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Meta Salarial (Net)</Label>
                            <div className="relative group/input">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">R$</span>
                                <Input type="number" className="pl-12 h-12 text-lg font-black bg-white/5 border-white/10 rounded-xl group-focus-within/input:border-primary transition-all" {...financialForm.register('incomeGoal')} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Custos Fixos</Label>
                            <ClinicalCostAudit
                                onChange={(total) => financialForm.setValue('fixedCosts', total)}
                                initialTotal={Number(financials.fixedCosts)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dias/Sem</Label>
                                <Input type="number" className="h-10 font-bold rounded-xl bg-white/5 border-white/10" max={7} {...financialForm.register('daysPerWeek')} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Horas/Dia</Label>
                                <Input type="number" className="h-10 font-bold rounded-xl bg-white/5 border-white/10" max={24} {...financialForm.register('hoursPerDay')} />
                            </div>
                        </div>

                        <div className="space-y-3 pt-2 bg-muted/20 p-4 rounded-2xl border border-white/5">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Imposto (%)</Label>
                                <Badge className="bg-primary text-white font-black text-[10px]">{financials.taxRate}%</Badge>
                            </div>
                            <Slider
                                value={[financials.taxRate]}
                                max={30}
                                step={0.5}
                                onValueChange={(val) => financialForm.setValue('taxRate', val[0])}
                            />
                        </div>

                        <Button variant="outline" size="sm" className="w-full h-10 gap-2 border-white/10 hover:bg-primary/10 hover:border-primary/50 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all" onClick={handleSaveFoundation}>
                            <Save className="h-3 w-3" /> Salvar Base
                        </Button>

                        <div className="pt-4 border-t border-white/5 text-center">
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-50">Sua Hora Clínica</span>
                            <div className="text-2xl font-black text-primary tracking-tighter">
                                {formatCurrency(hourlyRate)}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* COLUNA 2: ENGENHARIA (5 colunas) */}
                <Card className="lg:col-span-5 border-none shadow-2xl bg-slate-900 text-white rounded-[2rem] overflow-hidden relative group">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-500/20 p-2 rounded-xl">
                                <TrendingUp className="w-5 h-5 text-green-500" />
                            </div>
                            <CardTitle className="text-xl font-black tracking-tight">Engenharia</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nome da Oferta</Label>
                            <Input {...productForm.register('name')} className="h-12 font-bold bg-white/5 border-white/10 rounded-xl text-md focus:ring-green-500 focus:border-green-500" placeholder="Ex: Protocolo VIP" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {['consulta', 'protocolo', 'acompanhamento', 'desafio'].map((t) => (
                                <div
                                    key={t}
                                    onClick={() => productForm.setValue('type', t as any)}
                                    className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase cursor-pointer border transition-all text-center ${product.type === t ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'}`}
                                >
                                    {t}
                                </div>
                            ))}
                        </div>

                        <div className="space-y-5 p-5 border rounded-2xl bg-white/5 border-white/10">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <Clock className="h-3 w-3" /> Horas/Cliente
                                </Label>
                                <span className="text-md font-black text-primary">{product.hoursSpent}h</span>
                            </div>
                            <Slider
                                value={[product.hoursSpent]}
                                max={20}
                                step={0.5}
                                onValueChange={(val) => productForm.setValue('hoursSpent', val[0])}
                            />
                        </div>

                        <div className="space-y-5 p-5 border rounded-2xl bg-green-500/5 border-green-500/10">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-green-400">Margem (%)</Label>
                                <span className="text-lg font-black text-green-500">{product.desiredMargin}%</span>
                            </div>
                            <Slider
                                value={[product.desiredMargin]}
                                max={90}
                                step={1}
                                onValueChange={(val) => productForm.setValue('desiredMargin', val[0])}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Custo Material (Opcional)</Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                                <Input type="number" className="pl-12 h-12 font-bold bg-white/5 border-white/10 rounded-xl" {...productForm.register('materialCost')} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* COLUNA 3: VEREDITO (4 colunas) */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-none shadow-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-[2rem] overflow-hidden">
                        <CardHeader className="text-center pb-0 pt-8">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Preço Sugerido (Elite)</span>
                            <div className="text-5xl font-black text-primary mt-2 tracking-tighter drop-shadow-xl">
                                {formatCurrency(suggestedPrice)}
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                                    <div className="text-[8px] font-black text-primary uppercase mb-1">Lucro / Hora</div>
                                    <div className="text-lg font-black">{formatCurrency(profitPerHour)}</div>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                                    <div className="text-[8px] font-black text-primary uppercase mb-1">Total Clientes</div>
                                    <div className="text-lg font-black">x{unitsNeeded}</div>
                                </div>
                            </div>

                            <AgendaViability
                                availableHours={availableMonthlyHours}
                                neededHours={monthlyHoursNeeded}
                            />

                            <Button
                                onClick={handleSaveProduct}
                                disabled={isSaving}
                                className="w-full h-14 bg-primary text-white hover:bg-primary/90 font-black text-md rounded-xl shadow-xl transition-all"
                            >
                                {isSaving ? <Loader2 className="animate-spin h-5 w-5" /> : (selectedProductId ? 'Atualizar Oferta' : 'Cunhar Nova Oferta')}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* CFO Insight (Small) */}
                    <Card className="border-none bg-slate-800/50 backdrop-blur-md text-white p-6 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Insight Maestro</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed italic">
                            Nutri, para ganhar {formatCurrency(Number(financials.incomeGoal) + Number(financials.fixedCosts))} com este produto de {formatCurrency(suggestedPrice)}, você terá que atender {unitsNeeded} pessoas. Sua hora líquida está saindo por {formatCurrency(profitPerHour)}. {weeklyHoursNeeded > 40 ? "Isso está sufocando sua liberdade física!" : "Vale a pena?"}
                        </p>
                    </Card>

                    {/* Justificativa do Maestro por Nicho */}
                    {advice && (
                        <Card className={cn(
                            "border-none p-5 rounded-2xl border space-y-3",
                            advice.suggestedMargin >= 45
                                ? "bg-emerald-500/10 border-emerald-500/20"
                                : "bg-amber-500/10 border-amber-500/20"
                        )}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Crown className={cn('h-4 w-4', advice.suggestedMargin >= 45 ? 'text-emerald-400' : 'text-amber-400')} />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Justificativa do Nicho</span>
                                </div>
                                <Badge className={cn('text-[9px] font-black', advice.suggestedMargin >= 45 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30')}>
                                    {advice.label}
                                </Badge>
                            </div>
                            <p className="text-[10px] text-slate-300 leading-relaxed">{advice.reasoning}</p>
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full text-[9px] font-black uppercase tracking-widest h-8 border-white/10 hover:bg-white/10 transition-all"
                                onClick={() => applyMaestroValues(advice)}
                            >
                                Aplicar Margem de {advice.suggestedMargin}%
                            </Button>
                        </Card>
                    )}
                </div>

                {/* MY CATALOG - FULL WIDTH (12 colunas) - MOVIDO PARA BAIXO COMO ACERVO */}
                <div className="lg:col-span-12 mt-8 pt-8 border-t border-white/5">
                    <div className="flex items-center justify-between mb-6 px-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-500/20 p-2 rounded-xl">
                                <Crown className="w-5 h-5 text-amber-500" />
                            </div>
                            <h2 className="text-xl font-black tracking-tight">Seu Acervo de Ofertas</h2>
                        </div>
                        <Badge variant="secondary" className="font-black px-4 py-1">{products.length} Itens</Badge>
                    </div>

                    {products.length === 0 ? (
                        <div className="border-2 border-dashed border-white/10 bg-white/5 rounded-3xl p-10 flex flex-col items-center justify-center opacity-40">
                            <Package className="w-12 h-12 mb-3" />
                            <p className="font-bold text-sm italic">Nenhum produto modelado.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {products.map((p: any) => (
                                <div
                                    key={p.id}
                                    onClick={() => loadProduct(p)}
                                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative group flex flex-col justify-between ${selectedProductId === p.id ? 'border-primary bg-primary/5 shadow-lg' : 'border-white/5 bg-card/40 backdrop-blur-md hover:border-white/20'}`}
                                >
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-start">
                                            <Badge variant="outline" className="text-[7px] font-black uppercase p-0 px-1.5 border-white/20">
                                                {p.tipo_produto}
                                            </Badge>
                                            <div className="text-sm font-black text-primary">{formatCurrency(p.ticket)}</div>
                                        </div>
                                        <h4 className="font-bold text-xs leading-tight truncate">{p.nome}</h4>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between opacity-60 group-hover:opacity-100 transition-opacity">
                                        <div className="text-[8px] font-bold text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-2.5 h-2.5" /> {p.hours_spent}h
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 rounded-lg text-destructive hover:bg-destructive/10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteProduct(p.id);
                                            }}
                                        >
                                            <Trash2 className="h-3.3 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Row 2: Revenue Mix + Net Profit */}
            <div className="grid md:grid-cols-2 gap-8 mt-4 pt-8 border-t border-white/5">
                <Card className="border-none bg-card/60 backdrop-blur-xl rounded-[2rem] overflow-hidden p-6 shadow-xl">
                    <RevenueMixWidget
                        totalGoal={Number(financials.incomeGoal) + Number(financials.fixedCosts)}
                        currentPrice={suggestedPrice}
                        hoursPerUnit={product.hoursSpent}
                    />
                </Card>
                <Card className="border-none bg-card/60 backdrop-blur-xl rounded-[2rem] overflow-hidden p-6 shadow-xl">
                    <NetProfitCard
                        grossRevenue={Number(financials.incomeGoal) + Number(financials.fixedCosts)}
                        taxRate={Number(financials.taxRate)}
                        fixedCosts={Number(financials.fixedCosts)}
                    />
                </Card>
            </div>

            {/* Comparador de Cenários */}
            <div className="mt-12 pt-12 border-t border-white/5">
                <ProfitScenarios currentPrice={suggestedPrice} goal={Number(financials.incomeGoal) + Number(financials.fixedCosts)} />
            </div>
        </div>
    );
};
