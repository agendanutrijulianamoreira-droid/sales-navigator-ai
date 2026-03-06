import { Card, CardContent } from '@/components/ui/card';
import { PieChart, Zap, Crown, Sprout } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RevenueMixWidgetProps {
    totalGoal: number;
    currentPrice: number;
    hoursPerUnit: number;
}

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const tiers = [
    {
        id: 'entrada',
        label: 'Entrada',
        sub: 'E-books, Desafios',
        pct: 0.1,
        icon: Sprout,
        color: 'text-violet-400',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/20',
        bar: 'bg-violet-500',
        ticketMultiplier: 0.15, // typically low ticket ~15% of main price
    },
    {
        id: 'core',
        label: 'Core',
        sub: 'Consultas, Protocolos',
        pct: 0.6,
        icon: Zap,
        color: 'text-primary',
        bg: 'bg-primary/10',
        border: 'border-primary/20',
        bar: 'bg-primary',
        ticketMultiplier: 1.0,
    },
    {
        id: 'highticket',
        label: 'High-Ticket',
        sub: 'Mentoria, Programa VIP',
        pct: 0.3,
        icon: Crown,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        bar: 'bg-amber-500',
        ticketMultiplier: 4.0, // high-ticket is ~4x core price
    },
];

export function RevenueMixWidget({ totalGoal, currentPrice, hoursPerUnit }: RevenueMixWidgetProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Distribuição de Receita Ideal
                </span>
            </div>

            <div className="space-y-3">
                {tiers.map((tier) => {
                    const tierGoal = totalGoal * tier.pct;
                    const tierPrice = currentPrice * tier.ticketMultiplier;
                    const units = tierPrice > 0 ? Math.ceil(tierGoal / tierPrice) : 0;
                    const hours = (units * hoursPerUnit * tier.ticketMultiplier).toFixed(0);
                    const Icon = tier.icon;

                    return (
                        <div
                            key={tier.id}
                            className={cn(
                                'p-3 rounded-xl border transition-all hover:scale-[1.01] duration-300',
                                tier.bg,
                                tier.border
                            )}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Icon className={cn('h-3.5 w-3.5', tier.color)} />
                                    <div>
                                        <p className="text-[10px] font-black text-white">{tier.label}</p>
                                        <p className="text-[8px] text-slate-500">{tier.sub}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={cn('text-sm font-black', tier.color)}>{formatCurrency(tierGoal)}</p>
                                    <p className="text-[8px] text-slate-500">{(tier.pct * 100).toFixed(0)}% da meta</p>
                                </div>
                            </div>

                            {/* Progress bar representing share */}
                            <div className="h-1 rounded-full bg-white/5 overflow-hidden mb-2">
                                <div
                                    className={cn('h-full rounded-full', tier.bar)}
                                    style={{ width: `${tier.pct * 100}%` }}
                                />
                            </div>

                            <div className="flex justify-between text-[8px] text-slate-500 font-bold">
                                <span>{units} {units === 1 ? 'venda' : 'vendas'} · {formatCurrency(tierPrice)}/un</span>
                                <span>{hours}h/mês</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
