import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calculator, DollarSign, Clock, TrendingUp, AlertCircle, Save, Loader2, Lightbulb, Target, Sparkles, PieChart, Crown } from 'lucide-react';
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
    const { settings, loading: loadingSettings, updateSettings } = useFinancialSettings();
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
                descricao: '',
                tipo_cliente: 'inconformado' as any,
                // Custom simulation fields (casted because types are not yet updated)
                hours_spent: Number(vals.hoursSpent),
                material_cost: Number(vals.materialCost),
                desired_margin: Number(vals.desiredMargin),
                ativo: true,
                ordem: 0
            } as any;

            if (selectedProductId) {
                await updateProduct(selectedProductId, productData);
            } else {
                await addProduct(productData);
            }
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
        <div className="space-y-6 pb-12">
            {/* Recommendation Block */}
            {advice && strategy && (
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden animate-in fade-in slide-in-from-top duration-500">
                    <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />

                    <div className="flex items-center gap-2 mb-3">
                        <div className="bg-white/20 p-1.5 rounded-lg">
                            <Lightbulb className="w-5 h-5 text-yellow-300 animate-pulse" />
                        </div>
                        <h4 className="font-bold text-xs uppercase tracking-widest">Recomendação do Maestro</h4>
                        <Badge variant="outline" className="ml-auto text-white border-white/20 text-[10px]">
                            {advice.label}
                        </Badge>
                    </div>

                    <p className="text-indigo-50 text-sm mb-5 leading-relaxed">
                        "Para seu nicho em <span className="font-bold text-white underline decoration-indigo-400">{strategy.niche}</span>,
                        não aceite menos que <span className="text-white font-bold">{advice.suggestedMargin}% de margem</span>. {advice.reasoning}"
                    </p>

                    <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white text-indigo-900 hover:bg-white/90 border-none font-bold px-6 h-10 shadow-lg"
                        onClick={() => applyMaestroValues(advice)}
                    >
                        Aplicar Parâmetros Propostos
                    </Button>
                </div>
            )}

            <div className="grid lg:grid-cols-12 gap-6 animate-in fade-in duration-500">

                {/* LADO A: FUNDAÇÃO (4 colunas) */}
                <Card className="lg:col-span-4 h-fit border-l-4 border-l-blue-500 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Calculator className="w-5 h-5 text-blue-500" />
                            Sua Hora Clínica
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">Defina seus custos e metas mensais.</p>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Meta de Pro-Labore (Salário)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-muted-foreground text-sm font-medium">R$</span>
                                <Input type="number" className="pl-10 h-11" {...financialForm.register('incomeGoal')} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Custos Fixos (Geral)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-muted-foreground text-sm font-medium">R$</span>
                                <Input type="number" className="pl-10 h-11" {...financialForm.register('fixedCosts')} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Dias/Sem.</Label>
                                <Input type="number" className="h-11" max={7} {...financialForm.register('daysPerWeek')} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Horas/Dia</Label>
                                <Input type="number" className="h-11" max={24} {...financialForm.register('hoursPerDay')} />
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="flex justify-between items-center bg-muted/50 p-2 rounded-lg">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Imposto (%)</Label>
                                <span className="font-mono font-bold text-primary">{financials.taxRate}%</span>
                            </div>
                            <Slider
                                value={[financials.taxRate]}
                                max={30}
                                step={0.5}
                                onValueChange={(val) => financialForm.setValue('taxRate', val[0])}
                            />
                        </div>

                        <Button variant="outline" className="w-full gap-2 border-primary/20 hover:bg-primary/5" onClick={handleSaveFoundation}>
                            <Save className="h-4 w-4" /> Salvar Fundação
                        </Button>

                    </CardContent>
                    <CardFooter className="bg-primary/5 flex flex-col items-center justify-center p-6 border-t border-primary/10">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Custo da sua Hora</span>
                        <div className="text-4xl font-black text-primary mt-1 tracking-tight">
                            {formatCurrency(hourlyRate)}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-3 text-center px-4 leading-relaxed">
                            Este é o valor mínimo que sua hora clínica precisa gerar para cobrir as contas e atingir sua meta.
                        </p>
                    </CardFooter>
                </Card>

                {/* LADO B: SIMULADOR DE PRODUTO (8 colunas) */}
                <Card className="lg:col-span-8 h-fit border-l-4 border-l-green-500 shadow-xl bg-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            Modelador de Lucro
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">Crie o preço ideal para transformar esforço em resultado.</p>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="consulta" className="w-full">
                            <TabsList className="grid w-full grid-cols-4 mb-8 bg-muted/50 p-1 rounded-xl">
                                <TabsTrigger value="consulta" onClick={() => productForm.setValue('type', 'consulta')} className="rounded-lg">Consulta</TabsTrigger>
                                <TabsTrigger value="protocolo" onClick={() => productForm.setValue('type', 'protocolo')} className="rounded-lg">Protocolo</TabsTrigger>
                                <TabsTrigger value="acompanhamento" onClick={() => productForm.setValue('type', 'acompanhamento')} className="rounded-lg">Mensal</TabsTrigger>
                                <TabsTrigger value="desafio" onClick={() => productForm.setValue('type', 'desafio')} className="rounded-lg">Desafio</TabsTrigger>
                            </TabsList>

                            <div className="grid md:grid-cols-2 gap-10">
                                {/* Coluna Inputs do Produto */}
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Nome do Serviço/Produto</Label>
                                        <Input {...productForm.register('name')} className="h-11 font-medium" placeholder="Ex: Protocolo Menopausa 90D" />
                                    </div>

                                    <div className="space-y-4 p-4 border rounded-2xl bg-muted/20">
                                        <div className="flex justify-between items-center mb-1">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                                <Clock className="h-3 w-3" /> Dedicação (Horas)
                                            </Label>
                                            <span className="text-sm font-black text-primary">{product.hoursSpent}h</span>
                                        </div>
                                        <Slider
                                            value={[product.hoursSpent]}
                                            max={20}
                                            step={0.5}
                                            onValueChange={(val) => productForm.setValue('hoursSpent', val[0])}
                                        />
                                        <p className="text-[10px] text-muted-foreground italic leading-tight">
                                            Conte tudo: preparo + atendimento + suporte WhatsApp + pós-venda.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Custos Extras Diretos (Plataformas, Apps)</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-muted-foreground text-sm font-medium">R$</span>
                                            <Input type="number" className="pl-10 h-11" {...productForm.register('materialCost')} />
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-4 border rounded-2xl bg-green-500/5">
                                        <div className="flex justify-between items-center mb-1">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Margem de Lucro Desejada</Label>
                                            <span className="text-sm font-black text-green-600">{product.desiredMargin}%</span>
                                        </div>
                                        <Slider
                                            value={[product.desiredMargin]}
                                            max={90}
                                            step={5}
                                            className="py-2"
                                            onValueChange={(val) => productForm.setValue('desiredMargin', val[0])}
                                        />
                                        <p className="text-[10px] text-muted-foreground">Este lucro é o que sobra livre no seu bolso após pagar sua hora e impostos.</p>
                                    </div>
                                </div>

                                {/* Coluna Resultados Visuais */}
                                <div className="bg-primary/5 rounded-3xl p-8 flex flex-col justify-between border border-primary/10 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                        <DollarSign className="w-32 h-32" />
                                    </div>

                                    <div className="relative z-10">
                                        <h3 className="font-bold text-lg mb-6 text-center text-primary">Raio-X da Venda</h3>

                                        {/* Gráfico de Barra Empilhada */}
                                        <div className="space-y-3 mb-8">
                                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                                                <span>Custo + Imposto</span>
                                                <span>Lucro Líquido</span>
                                            </div>
                                            <div className="h-5 w-full bg-slate-200 rounded-full overflow-hidden flex border border-inner">
                                                <div className="h-full bg-slate-400 transition-all duration-500" style={{ width: `${100 - product.desiredMargin}%` }} />
                                                <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${product.desiredMargin}%` }} />
                                            </div>
                                        </div>

                                        <div className="space-y-5">
                                            <div className="flex justify-between items-center text-sm border-b pb-2 border-primary/5">
                                                <span className="flex items-center gap-1.5 text-muted-foreground font-medium"><Clock className="w-3.5 h-3.5" /> Esforço (Tempo):</span>
                                                <span className="font-bold">{formatCurrency(product.hoursSpent * hourlyRate)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm border-b pb-2 border-primary/5">
                                                <span className="flex items-center gap-1.5 text-muted-foreground font-medium"><DollarSign className="w-3.5 h-3.5" /> Impostos ({financials.taxRate}%):</span>
                                                <span className="font-bold">{formatCurrency(suggestedPrice * (financials.taxRate / 100))}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-green-600/10 p-3 rounded-xl">
                                                <span className="font-bold text-green-700 text-sm">Seu Lucro Real ({product.desiredMargin}%):</span>
                                                <span className="font-black text-green-700 text-lg">{formatCurrency(suggestedPrice * (product.desiredMargin / 100))}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 relative z-10">
                                        <div className="text-center">
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Preço de Venda Sugerido</span>
                                            <div className="text-5xl font-black text-primary mt-2 flex items-baseline justify-center gap-1">
                                                {formatCurrency(suggestedPrice)}
                                            </div>

                                            {suggestedPrice > 0 && (
                                                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 shadow-sm animate-pulse-slow">
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    Ponto de Equilíbrio: {formatCurrency(breakEvenPrice)}
                                                </div>
                                            )}
                                        </div>

                                        <Button
                                            onClick={handleSaveProduct}
                                            disabled={isSaving}
                                            className="w-full mt-8 h-14 rounded-2xl font-black text-lg gap-2 shadow-lg shadow-primary/20 hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            {isSaving ? <Loader2 className="animate-spin h-5 w-5" /> : (selectedProductId ? 'Atualizar no Catálogo' : 'Salvar no Meu Catálogo')}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* ENGENHARIA REVERSA */}
                            <div className="mt-12 pt-8 border-t border-dashed grid md:grid-cols-2 gap-8 items-center">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Target className="w-5 h-5 font-bold" />
                                        <h3 className="font-black text-sm uppercase tracking-wider">Engenharia Reversa de Metas</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Para atingir sua meta de <span className="font-bold text-foreground">{formatCurrency(Number(financials.incomeGoal) + Number(financials.fixedCosts))}</span> (Pro-Labore + Custos),
                                        considerando o ticket de <span className="font-bold text-foreground">{formatCurrency(suggestedPrice)}</span>:
                                    </p>
                                    <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl text-center">
                                        <span className="text-[10px] font-black uppercase text-amber-700 tracking-widest block mb-1">Volume de Vendas Necessário</span>
                                        <div className="text-5xl font-black text-amber-600">
                                            {unitsNeeded} <span className="text-sm font-bold opacity-70">unidades/mês</span>
                                        </div>
                                        <p className="text-[10px] text-amber-700/70 mt-3 italic">
                                            Isso representa {formatCurrency(unitsNeeded * suggestedPrice)} em faturamento bruto mensal.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                            <Sparkles className="w-16 h-16" />
                                        </div>
                                        <div className="relative z-10">
                                            <h4 className="font-black text-xs uppercase tracking-widest text-amber-400 mb-2">Estratégia de Escala</h4>
                                            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                                                Vender {unitsNeeded} unidades sozinho pode ser desafiador. Clique abaixo para que a IA crie um funil de escala para este produto.
                                            </p>
                                            <Button
                                                variant="secondary"
                                                className="w-full bg-white text-slate-900 hover:bg-amber-400 hover:text-slate-900 font-bold gap-2"
                                                onClick={handleGenerateProductStrategy}
                                                disabled={isGeneratingAI}
                                            >
                                                {isGeneratingAI ? <Loader2 className="animate-spin h-4 w-4" /> : <PieChart className="h-4 w-4" />}
                                                {isGeneratingAI ? 'Gerando Análise...' : 'Ver Insight do CFO IA'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* AI Insight Area */}
                            {streamedContent && (
                                <div className="mt-8 p-6 bg-slate-50 rounded-3xl border-2 border-slate-200 animate-in slide-in-from-bottom duration-500">
                                    <div className="flex items-center gap-2 mb-4 text-slate-900">
                                        <Sparkles className="h-4 w-4" />
                                        <span className="font-black uppercase text-[10px] tracking-widest">Plano de Escala Sugerido</span>
                                    </div>
                                    <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-700">
                                        {streamedContent}
                                    </div>
                                </div>
                            )}
                        </Tabs>

                        {/* Product Ladder Section */}
                        <ProductLadder corePrice={suggestedPrice} />
                    </CardContent>
                </Card>

                {/* MEU CATÁLOGO */}
                <Card className="lg:col-span-12 border-t-4 border-t-amber-500 bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Crown className="w-6 h-6 text-amber-500" />
                            Seu Catálogo & Estimativas
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">Clique em um produto para carregar os valores e comparar.</p>
                    </CardHeader>
                    <CardContent>
                        {products.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground italic bg-muted/20 rounded-2xl border-2 border-dashed">
                                Nenhum produto salvo ainda.
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {products.map((p: any) => (
                                    <div
                                        key={p.id}
                                        onClick={() => loadProduct(p)}
                                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all hover:border-primary/50 group relative ${selectedProductId === p.id ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-card'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant="outline" className="text-[10px] uppercase">{p.tipo_produto}</Badge>
                                            <div className="text-xs font-black text-primary">{formatCurrency(p.ticket)}</div>
                                        </div>
                                        <h4 className="font-bold text-sm mb-3 group-hover:text-primary transition-colors">{p.nome}</h4>
                                        <div className="flex gap-4 text-[10px] text-muted-foreground font-medium">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {p.hours_spent}h</span>
                                            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {p.desired_margin}%</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive shadow-sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteProduct(p.id);
                                            }}
                                        >
                                            ×
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
