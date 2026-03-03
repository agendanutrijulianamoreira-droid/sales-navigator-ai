import { useState, useEffect } from 'react';
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

    // 2. Calcular Preço do Produto (Markup Formula)
    useEffect(() => {
        const { hoursSpent, materialCost, desiredMargin } = product;
        const { taxRate } = financials;

        const serviceBaseCost = (Number(hoursSpent) * hourlyRate) + Number(materialCost);
        const taxDecimal = Number(taxRate) / 100;
        const marginDecimal = Number(desiredMargin) / 100;

        // Formula correta: Preço = Custo / (1 - Imposto - Margem)
        const divisor = 1 - (taxDecimal + marginDecimal);
        const finalPrice = divisor > 0 ? serviceBaseCost / divisor : serviceBaseCost * 2;

        // Ponto de Equilíbrio: Preço que cobre apenas custo + impostos sobre esse preço
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

    const netContribution = suggestedPrice * (1 - (financials.taxRate / 100)) - product.materialCost;
    const unitsNeeded = netContribution > 0 ? Math.ceil((Number(financials.incomeGoal) + Number(financials.fixedCosts)) / netContribution) : 0;

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

                {/* LADO A: FUNDAÇÃO CLÍNICA (4 colunas) */}
                <Card className="lg:col-span-4 border-none shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="bg-blue-500/20 p-2 rounded-xl">
                                <Calculator className="w-5 h-5 text-blue-500" />
                            </div>
                            <CardTitle className="text-xl font-black tracking-tight">Custo Operacional</CardTitle>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">Sua base financeira para não trabalhar de graça.</p>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Meta de Pro-Labore Net</Label>
                            <div className="relative group/input">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">R$</span>
                                <Input type="number" className="pl-12 h-14 text-xl font-black bg-white/5 border-white/10 rounded-2xl group-focus-within/input:border-primary transition-all" {...financialForm.register('incomeGoal')} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Custos Fixos Médios</Label>
                            <div className="relative group/input">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                                <Input type="number" className="pl-12 h-14 text-xl font-black bg-white/5 border-white/10 rounded-2xl group-focus-within/input:border-blue-400 transition-all" {...financialForm.register('fixedCosts')} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dias Úteis</Label>
                                <Input type="number" className="h-12 font-bold rounded-2xl bg-white/5 border-white/10" max={7} {...financialForm.register('daysPerWeek')} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Horas Focadas</Label>
                                <Input type="number" className="h-12 font-bold rounded-2xl bg-white/5 border-white/10" max={24} {...financialForm.register('hoursPerDay')} />
                            </div>
                        </div>

                        <div className="space-y-4 pt-2 bg-muted/20 p-4 rounded-3xl border border-white/5">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Imposto Estimado</Label>
                                <Badge className="bg-primary text-white font-black">{financials.taxRate}%</Badge>
                            </div>
                            <Slider
                                value={[financials.taxRate]}
                                max={30}
                                step={0.5}
                                onValueChange={(val) => financialForm.setValue('taxRate', val[0])}
                            />
                        </div>

                        <Button variant="outline" className="w-full h-12 gap-2 border-white/10 hover:bg-primary/10 hover:border-primary/50 text-xs font-black uppercase tracking-widest rounded-2xl transition-all" onClick={handleSaveFoundation}>
                            <Save className="h-4 w-4" /> Atualizar Fundação
                        </Button>
                    </CardContent>
                    <CardFooter className="bg-primary/10 flex flex-col items-center justify-center p-8 border-t border-primary/10">
                        <span className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-2 opacity-70">Sua Hora Vale</span>
                        <div className="text-5xl font-black text-primary tracking-tighter drop-shadow-sm">
                            {formatCurrency(hourlyRate)}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-4 text-center px-6 leading-relaxed font-medium">
                            Este é o limite crítico. Cobrar abaixo disso significa pagar para trabalhar.
                        </p>
                    </CardFooter>
                </Card>

                {/* LADO B: MODELADOR DE MARGEM (8 colunas) */}
                <Card className="lg:col-span-8 border-none shadow-2xl bg-slate-900 text-white rounded-[2.5rem] overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                        <DollarSign className="w-64 h-64" />
                    </div>

                    <CardHeader className="pb-8 border-b border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="bg-green-500/20 p-2 rounded-xl">
                                        <TrendingUp className="w-5 h-5 text-green-500" />
                                    </div>
                                    <CardTitle className="text-2xl font-black tracking-tight">Engenharia de Lucro</CardTitle>
                                </div>
                                <p className="text-sm text-slate-400">Desenhe o preço que gera liberdade, não apenas faturamento.</p>
                            </div>
                            <Tabs value={product.type} className="bg-white/5 p-1 rounded-2xl border border-white/10 hidden md:block">
                                <div className="flex gap-1">
                                    {['consulta', 'protocolo', 'acompanhamento', 'desafio'].map((t) => (
                                        <div
                                            key={t}
                                            onClick={() => productForm.setValue('type', t as any)}
                                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase cursor-pointer transition-all ${product.type === t ? 'bg-primary text-white shadow-lg' : 'hover:bg-white/5 text-slate-500'}`}
                                        >
                                            {t}
                                        </div>
                                    ))}
                                </div>
                            </Tabs>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-10">
                        <div className="grid md:grid-cols-2 gap-12">
                            {/* Inputs do Produto */}
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">O que você está vendendo?</Label>
                                    <Input {...productForm.register('name')} className="h-14 font-bold bg-white/5 border-white/10 rounded-2xl text-lg focus:ring-green-500 focus:border-green-500" placeholder="Ex: Protocolo VIP de Emagrecimento" />
                                </div>

                                <div className="space-y-5 p-6 border rounded-[1.5rem] bg-white/5 border-white/10 relative overflow-hidden group/item">
                                    <div className="flex justify-between items-center mb-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                            <Clock className="h-3 w-3" /> Horas de Dedicação
                                        </Label>
                                        <span className="text-lg font-black text-primary">{product.hoursSpent}h</span>
                                    </div>
                                    <Slider
                                        value={[product.hoursSpent]}
                                        max={20}
                                        step={0.5}
                                        className="py-4"
                                        onValueChange={(val) => productForm.setValue('hoursSpent', val[0])}
                                    />
                                    <p className="text-[10px] text-slate-500 italic leading-snug">
                                        Tempo total por cliente: preparo + execução + atenção pós-venda.
                                    </p>
                                </div>

                                <div className="space-y-5 p-6 border rounded-[1.5rem] bg-green-500/10 border-green-500/20">
                                    <div className="flex justify-between items-center mb-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-green-400">Margem de Lucro (Desejada)</Label>
                                        <span className="text-2xl font-black text-green-500">{product.desiredMargin}%</span>
                                    </div>
                                    <Slider
                                        value={[product.desiredMargin]}
                                        max={90}
                                        step={5}
                                        className="py-4"
                                        onValueChange={(val) => productForm.setValue('desiredMargin', val[0])}
                                    />
                                    <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase">
                                        <span>Sobrevivência</span>
                                        <span>Equilíbrio</span>
                                        <span>Elite (Lucro Real)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Resultados Visuais */}
                            <div className="bg-white/5 rounded-[2rem] p-8 border border-white/10 flex flex-col justify-between shadow-inner">
                                <div className="space-y-8">
                                    <div className="text-center">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Ticket Sugerido</span>
                                        <div className="text-6xl font-black text-white mt-3 tracking-tighter flex items-baseline justify-center gap-1 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                                            {formatCurrency(suggestedPrice)}
                                        </div>

                                        <div className="mt-6 flex justify-center gap-2">
                                            <Badge className="bg-amber-500/20 text-amber-500 border-none px-3 py-1 text-[9px] font-black uppercase tracking-widest">
                                                Ponto Equilíbrio: {formatCurrency(breakEvenPrice)}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Price Psychology Block */}
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <Target className="w-3 h-3 text-primary" /> Psicologia de Preço
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <div className="bg-slate-800 px-3 py-1.5 rounded-xl text-[10px] font-medium border border-white/5 text-slate-300">
                                                Elite: <span className="text-white font-black">R$ {Math.floor(suggestedPrice)}.00</span>
                                            </div>
                                            <div className="bg-slate-800 px-3 py-1.5 rounded-xl text-[10px] font-medium border border-white/5 text-slate-300">
                                                Varejo: <span className="text-white font-black">R$ {Math.floor(suggestedPrice - 1)}.90</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-xs font-medium text-slate-400 px-1">
                                            <span>Composição de Custos</span>
                                            <span>{100 - product.desiredMargin}%</span>
                                        </div>
                                        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex p-0.5 border border-white/10">
                                            <div className="h-full bg-slate-600 rounded-full transition-all duration-700" style={{ width: `${100 - product.desiredMargin}%` }} />
                                            <div className="h-full bg-green-500 rounded-full transition-all duration-700 ml-auto" style={{ width: `${product.desiredMargin}%` }} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="bg-slate-800/50 p-3 rounded-2xl text-center">
                                                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Custo + Imp.</div>
                                                <div className="text-sm font-bold text-slate-300">{formatCurrency(suggestedPrice - (suggestedPrice * product.desiredMargin / 100))}</div>
                                            </div>
                                            <div className="bg-green-500/10 p-3 rounded-2xl text-center border border-green-500/20">
                                                <div className="text-[8px] font-black text-green-500 uppercase tracking-widest mb-1">Lucro Retido</div>
                                                <div className="text-sm font-black text-green-400">{formatCurrency(suggestedPrice * (product.desiredMargin / 100))}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleSaveProduct}
                                    disabled={isSaving}
                                    className="w-full mt-12 h-16 bg-primary text-primary-foreground hover:bg-primary/90 font-black text-xl rounded-2xl shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {isSaving ? <Loader2 className="animate-spin h-6 w-6" /> : (selectedProductId ? 'Atualizar Catálogo' : 'Cravar Preço no Catálogo')}
                                </Button>
                            </div>
                        </div>

                        {/* Engenharia Reversa Metas */}
                        <div className="mt-16 pt-10 border-t border-white/5">
                            <div className="grid md:grid-cols-2 gap-12 items-center">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-amber-500/20 p-2 rounded-xl">
                                            <PieChart className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <h3 className="font-black text-sm uppercase tracking-[0.2em] text-amber-500">Reverse Engineering</h3>
                                    </div>
                                    <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                        Para cobrir seu operacional e faturar o salário de <span className="text-white font-bold">{formatCurrency(Number(financials.incomeGoal) + Number(financials.fixedCosts))}</span> com este ticket:
                                    </p>
                                    <div className="relative group/goal">
                                        <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 p-10 rounded-[2.5rem] text-center backdrop-blur-md">
                                            <div className="text-7xl font-black text-amber-500 decoration-amber-500/20 underline underline-offset-8">
                                                {unitsNeeded}
                                            </div>
                                            <span className="text-xs font-black uppercase text-amber-600 mt-4 block tracking-widest">Unidades / Mês</span>
                                        </div>
                                        <div className="absolute -top-4 -right-4 bg-white text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black shadow-xl shadow-amber-500/20 -rotate-12 group-hover:rotate-0 transition-transform">
                                            {formatCurrency(unitsNeeded * suggestedPrice)} FAT. BRUTO
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-gradient-to-br from-slate-800 to-slate-950 p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
                                        <Sparkles className="absolute -right-4 -top-4 w-24 h-24 opacity-5" />
                                        <h4 className="font-black text-[10px] uppercase tracking-widest text-primary mb-4">CFO Vision IA</h4>
                                        <p className="text-xs text-slate-400 mb-8 leading-relaxed italic">
                                            "Com o seu ticket de {formatCurrency(suggestedPrice)}, bater {unitsNeeded} vendas mensais exige um funil de escala. Clique abaixo para ver o mapa de canais e conversão."
                                        </p>
                                        <Button
                                            variant="secondary"
                                            className="w-full h-14 bg-white text-slate-900 hover:bg-primary hover:text-white font-black text-sm transition-all rounded-xl shadow-lg"
                                            onClick={handleGenerateProductStrategy}
                                            disabled={isGeneratingAI}
                                        >
                                            {isGeneratingAI ? <Loader2 className="animate-spin h-5 w-5" /> : <TrendingUp className="h-5 w-5 mr-2" />}
                                            {isGeneratingAI ? 'Analisando Fluxo...' : 'Gerar Estratégia de Escala'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Streamed Result Area */}
                        {streamedContent && (
                            <div className="mt-12 p-8 bg-white text-slate-900 rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom-10 duration-700 relative overflow-hidden border-4 border-primary">
                                <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-primary/20 p-2 rounded-xl">
                                            <Lightbulb className="w-5 h-5 text-primary" />
                                        </div>
                                        <span className="font-black text-xs uppercase tracking-widest">Estratégia de Produto Sugerida</span>
                                    </div>
                                    <Badge className="bg-primary text-white font-black">AI INSIGHT</Badge>
                                </div>
                                <div className="prose prose-sm max-w-none text-slate-700 font-medium leading-relaxed">
                                    {streamedContent}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* MY CATALOG - FULL WIDTH (12 colunas) */}
                <div className="lg:col-span-12 mt-8">
                    <div className="flex items-center justify-between mb-6 px-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-500/20 p-2 rounded-xl">
                                <Crown className="w-6 h-6 text-amber-500" />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight">Acervo de Ofertas Ativas</h2>
                        </div>
                        <Badge variant="secondary" className="font-black px-4 py-1">{products.length} Produtos</Badge>
                    </div>

                    {products.length === 0 ? (
                        <Card className="border-2 border-dashed border-white/10 bg-white/5 rounded-3xl p-16 flex flex-col items-center justify-center opacity-40">
                            <Package className="w-16 h-16 mb-4" />
                            <p className="font-bold text-center italic">Seu catálogo está vazio. Comece forjando sua primeira oferta acima.</p>
                        </Card>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {products.map((p: any) => (
                                <div
                                    key={p.id}
                                    onClick={() => loadProduct(p)}
                                    className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 relative group flex flex-col justify-between min-h-[160px] ${selectedProductId === p.id ? 'border-primary bg-primary/5 shadow-2xl scale-[1.02]' : 'border-white/5 bg-card/40 backdrop-blur-md hover:border-white/20 hover:bg-white/5'}`}
                                >
                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between items-start">
                                            <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest ${selectedProductId === p.id ? 'border-primary text-primary' : ''}`}>
                                                {p.tipo_produto}
                                            </Badge>
                                            <div className="text-lg font-black text-primary">{formatCurrency(p.ticket)}</div>
                                        </div>
                                        <h4 className="font-black text-sm leading-tight group-hover:text-primary transition-colors pr-6">{p.nome}</h4>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                                                <Clock className="w-3 h-3" /> {p.hours_spent}h
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                                                <TrendingUp className="w-3 h-3" /> {p.desired_margin}%
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-xl bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteProduct(p.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {selectedProductId === p.id && (
                                        <div className="absolute -top-2 -right-2 bg-primary text-white p-1 rounded-full shadow-lg">
                                            <Check className="h-4 w-4" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
