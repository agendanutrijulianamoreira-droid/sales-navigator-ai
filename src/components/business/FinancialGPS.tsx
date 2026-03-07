import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useFinancialSettings } from "@/hooks/useFinancialSettings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    TrendingUp, Target, DollarSign, Users, Zap, ArrowRight, Trophy,
    AlertTriangle, CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Forecast {
    entry: { units: number; revenue: number };
    high: { units: number; revenue: number };
    hybridTotal: number;
    percentOfGoal: number;
}

export function FinancialGPS() {
    const { products } = useProducts();
    const { settings } = useFinancialSettings();

    const [monthlyGoal, setMonthlyGoal] = useState(settings?.monthly_income_goal?.toString() || "10000");
    const [currentRevenue, setCurrentRevenue] = useState("0");
    const [conversionRate, setConversionRate] = useState([10]);
    const [forecast, setForecast] = useState<Forecast | null>(null);

    const goal = parseFloat(monthlyGoal) || 10000;
    const current = parseFloat(currentRevenue) || 0;
    const progressPercent = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;

    const handleCalculate = () => {
        const entryProduct = products?.find(p => p.tipo_produto === "entrada");
        const highProduct = products?.find(p => p.tipo_produto === "premium") || products?.find(p => p.tipo_produto === "servico");

        const entryPrice = entryProduct?.ticket || 47;
        const highPrice = highProduct?.ticket || 2500;
        const conv = conversionRate[0] / 100;

        // Reverse engineering: how many entry sales to hit the goal
        // Revenue = entryUnits * entryPrice + (entryUnits * conv) * highPrice
        // Revenue = entryUnits * (entryPrice + conv * highPrice)
        const entryUnits = Math.ceil(goal / (entryPrice + conv * highPrice));
        const highUnits = Math.ceil(entryUnits * conv);

        const entryRevenue = entryUnits * entryPrice;
        const highRevenue = highUnits * highPrice;
        const hybridTotal = entryRevenue + highRevenue;

        setForecast({
            entry: { units: entryUnits, revenue: entryRevenue },
            high: { units: highUnits, revenue: highRevenue },
            hybridTotal,
            percentOfGoal: (hybridTotal / goal) * 100,
        });

        toast.success("GPS calculado!");
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Goal Progress */}
            <Card className="border-none shadow-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30">
                            <TrendingUp className="h-5 w-5 text-emerald-400" />
                        </div>
                        <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[10px] uppercase font-black tracking-widest">
                            GPS Financeiro
                        </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Meta Mensal</Label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-xl">R$</span>
                                    <Input
                                        type="number"
                                        value={monthlyGoal}
                                        onChange={(e) => setMonthlyGoal(e.target.value)}
                                        className="pl-14 h-16 text-3xl font-black bg-white/5 border-white/10 text-white rounded-2xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Faturado Até Agora</Label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                                    <Input
                                        type="number"
                                        value={currentRevenue}
                                        onChange={(e) => setCurrentRevenue(e.target.value)}
                                        className="pl-14 h-12 text-xl font-bold bg-white/5 border-white/10 text-white rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center items-center">
                            <div className="relative w-40 h-40">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="42" stroke="currentColor" className="text-white/10" strokeWidth="8" fill="none" />
                                    <circle
                                        cx="50" cy="50" r="42"
                                        stroke="url(#gradient)"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={`${progressPercent * 2.64} 264`}
                                        className="transition-all duration-1000"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#10b981" />
                                            <stop offset="100%" stopColor="#34d399" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black">{progressPercent.toFixed(0)}%</span>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">da meta</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Reverse Engineering */}
            <Card className="glass-card-elevated">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Engenharia Reversa</CardTitle>
                    </div>
                    <CardDescription>
                        Descubra quantas vendas você precisa com base nos seus produtos cadastrados.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-semibold">Conversão: Entrada → High Ticket</Label>
                            <Badge variant="outline" className="font-bold text-primary">{conversionRate}%</Badge>
                        </div>
                        <Slider
                            value={conversionRate}
                            onValueChange={setConversionRate}
                            max={50}
                            step={1}
                            className="py-2"
                        />
                        <p className="text-xs text-muted-foreground">
                            De cada 100 alunos do desafio/produto de entrada, {conversionRate}% compram o high-ticket.
                        </p>
                    </div>

                    <Button onClick={handleCalculate} className="w-full h-12 rounded-xl font-bold">
                        <Zap className="h-4 w-4 mr-2" /> Calcular Rota
                    </Button>

                    {/* Forecast Results */}
                    {forecast && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid md:grid-cols-2 gap-4">
                                <Card className="border-emerald-200/50 bg-emerald-50/30">
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Users className="h-4 w-4 text-emerald-600" />
                                            <span className="font-bold text-sm text-emerald-700">Produto de Entrada</span>
                                        </div>
                                        <div className="text-3xl font-black text-emerald-700">{forecast.entry.units}</div>
                                        <p className="text-xs text-emerald-600 mt-1">
                                            vendas × R$ {products?.find(p => p.tipo_produto === "entrada")?.ticket || 47} = R$ {forecast.entry.revenue.toLocaleString("pt-BR")}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-purple-200/50 bg-purple-50/30">
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Trophy className="h-4 w-4 text-purple-600" />
                                            <span className="font-bold text-sm text-purple-700">High Ticket</span>
                                        </div>
                                        <div className="text-3xl font-black text-purple-700">{forecast.high.units}</div>
                                        <p className="text-xs text-purple-600 mt-1">
                                            vendas × R$ {(products?.find(p => p.tipo_produto === "premium") || products?.find(p => p.tipo_produto === "servico"))?.ticket || 2500} = R$ {forecast.high.revenue.toLocaleString("pt-BR")}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Hybrid Result */}
                            <Card className={cn(
                                "border-none shadow-xl",
                                forecast.percentOfGoal >= 100
                                    ? "bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500"
                                    : "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500"
                            )}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <DollarSign className="h-5 w-5" />
                                                <span className="font-bold">Efeito Híbrido</span>
                                            </div>
                                            <div className="text-3xl font-black">
                                                R$ {forecast.hybridTotal.toLocaleString("pt-BR")}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {forecast.percentOfGoal.toFixed(0)}% da sua meta com este funil
                                            </p>
                                        </div>
                                        {forecast.percentOfGoal >= 100 ? (
                                            <CheckCircle className="h-10 w-10 text-emerald-500" />
                                        ) : (
                                            <AlertTriangle className="h-10 w-10 text-amber-500" />
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Strategy Tip */}
                            <div className="p-4 bg-muted/30 rounded-2xl border">
                                <div className="flex items-start gap-3">
                                    <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-sm mb-1">Diagnóstico da Estratégia</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Com uma conversão de {conversionRate}%, você alcança {forecast.percentOfGoal.toFixed(0)}% da sua meta apenas com este funil híbrido.
                                            {forecast.percentOfGoal < 100
                                                ? " Considere aumentar a conversão, o preço do high-ticket, ou adicionar um produto recorrente."
                                                : " Excelente! Este funil cobre sua meta. Foque em tráfego e otimização."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
