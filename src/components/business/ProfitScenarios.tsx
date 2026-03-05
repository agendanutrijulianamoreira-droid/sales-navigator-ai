import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertCircle, CheckCircle2, Crown, UserMinus, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScenarioProps {
    currentPrice: number;
    goal: number;
}

export function ProfitScenarios({ currentPrice, goal }: ScenarioProps) {
    const amadorPrice = currentPrice * 0.6; // 40% cheaper
    const amadorUnits = Math.ceil(goal / (amadorPrice * 0.3)); // Assuming 30% margin for amateur
    const eliteUnits = Math.ceil(goal / (currentPrice * 0.5)); // Assuming 50% margin for elite

    const scenarios = [
        {
            name: "Cenário Amador",
            price: amadorPrice,
            volume: amadorUnits,
            burnoutRisk: amadorUnits > 30 ? "Crítico" : "Alto",
            icon: UserPlus,
            color: "text-slate-400",
            bg: "bg-slate-500/10",
            border: "border-slate-500/20",
            badge: "bg-slate-500/20 text-slate-400",
            description: "Muitos clientes, pouco lucro. Sua agenda é escrava do volume."
        },
        {
            name: "Cenário Elite (Nutri Sales)",
            price: currentPrice,
            volume: eliteUnits,
            burnoutRisk: eliteUnits > 25 ? "Médio" : "Baixo",
            icon: Crown,
            color: "text-primary",
            bg: "bg-primary/10",
            border: "border-primary/20",
            badge: "bg-primary text-white",
            description: "Menos clientes, ticket alto. Foco total em entrega e liberdade."
        }
    ];

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-black tracking-tight">Comparador de Cenários</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {scenarios.map((s, i) => (
                    <Card key={i} className={cn("border-2 relative overflow-hidden transition-all duration-500 hover:scale-[1.02]", s.bg, s.border)}>
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                                <div className={cn("p-2 rounded-xl mb-3", s.bg)}>
                                    <s.icon className={cn("w-6 h-6", s.color)} />
                                </div>
                                <Badge className={cn("font-black tracking-widest uppercase text-[9px]", s.badge)}>
                                    Risco: {s.burnoutRisk}
                                </Badge>
                            </div>
                            <CardTitle className="text-lg font-black">{s.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Ticket Médio</span>
                                    <div className="text-2xl font-black">{formatCurrency(s.price)}</div>
                                </div>
                                <div className="text-right space-y-1">
                                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Volume Necessário</span>
                                    <div className="text-2xl font-black text-white">x{s.volume}</div>
                                </div>
                            </div>

                            <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                {s.description}
                            </p>

                            <div className="flex items-center gap-2 pt-2">
                                {s.burnoutRisk === "Baixo" || s.burnoutRisk === "Médio" ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                ) : (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                    {s.burnoutRisk === "Baixo" || s.burnoutRisk === "Médio" ? "Viabilidade Sustentável" : "Risco de Burnout Elevado"}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
