import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, DollarSign, Clock, TrendingUp, AlertCircle, Save, Loader2 } from 'lucide-react';
import { useFinancialSettings } from '@/hooks/useFinancialSettings';

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
    const [hourlyRate, setHourlyRate] = useState(0);
    const [suggestedPrice, setSuggestedPrice] = useState(0);
    const [breakEvenPrice, setBreakEvenPrice] = useState(0);

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

    const financials = financialForm.watch();
    const product = productForm.watch();

    // 1. Calcular Custo da Hora Clínica
    useEffect(() => {
        const { incomeGoal, fixedCosts, daysPerWeek, hoursPerDay } = financials;
        const monthlyHours = daysPerWeek * hoursPerDay * 4.2;
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

        // Markup: Preço = Custo / (1 - (Imposto + Margem))
        const divisor = 1 - (taxDecimal + marginDecimal);
        const finalPrice = divisor > 0 ? serviceBaseCost / divisor : serviceBaseCost * 2; // Fallback seguro

        const breakEven = taxDecimal < 1 ? serviceBaseCost / (1 - taxDecimal) : serviceBaseCost;

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
        <div className="grid lg:grid-cols-12 gap-6 animate-in fade-in duration-500 pb-12">

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
                                            <span className="font-bold text-green-700 text-sm">Seu Lucro Real:</span>
                                            <span className="font-black text-green-700 text-lg">{formatCurrency(suggestedPrice - breakEvenPrice)}</span>
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

                                    <Button className="w-full mt-8 h-14 rounded-2xl font-black text-lg gap-2 shadow-lg shadow-primary/20 hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                                        Salvar no Meu Catálogo
                                    </Button>
                                </div>
                            </div>
                        </div>

                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
