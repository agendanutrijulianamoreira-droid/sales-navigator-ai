import { Wallet, ArrowDownRight, TrendingDown, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NetProfitCardProps {
    grossRevenue: number;
    taxRate: number; // percentage
    fixedCosts: number;
}

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

export function NetProfitCard({ grossRevenue, taxRate, fixedCosts }: NetProfitCardProps) {
    const taxAmount = grossRevenue * (taxRate / 100);
    const netAfterTax = grossRevenue - taxAmount;
    const netProLabore = netAfterTax - fixedCosts;
    const proLaborePct = grossRevenue > 0 ? ((netProLabore / grossRevenue) * 100).toFixed(0) : '0';

    const isHealthy = netProLabore > 0;

    const rows = [
        {
            label: 'Faturamento Bruto',
            value: grossRevenue,
            icon: <TrendingDown className="h-3 w-3 text-slate-400" />,
            color: 'text-white',
            sub: null,
        },
        {
            label: `Impostos (${taxRate}%)`,
            value: -taxAmount,
            icon: <ArrowDownRight className="h-3 w-3 text-red-400" />,
            color: 'text-red-400',
            sub: 'Simples / DAS sobre venda',
        },
        {
            label: 'Custos Fixos',
            value: -fixedCosts,
            icon: <ArrowDownRight className="h-3 w-3 text-amber-400" />,
            color: 'text-amber-400',
            sub: 'Operação clínica',
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Lucro Líquido Real
                </span>
            </div>

            <div className="space-y-1">
                {rows.map((row, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            {row.icon}
                            <div>
                                <p className="text-[10px] font-bold text-slate-300">{row.label}</p>
                                {row.sub && <p className="text-[8px] text-slate-600">{row.sub}</p>}
                            </div>
                        </div>
                        <span className={cn('text-sm font-black', row.color)}>
                            {row.value >= 0 ? '' : ''}{formatCurrency(Math.abs(row.value))}
                        </span>
                    </div>
                ))}
            </div>

            {/* Pro-labore result */}
            <div
                className={cn(
                    'flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-500',
                    isHealthy
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                )}
            >
                <div className="flex items-center gap-2">
                    <CheckCircle2 className={cn('h-5 w-5', isHealthy ? 'text-emerald-400' : 'text-red-400')} />
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Pro-labore Real</p>
                        <p className="text-[8px] text-slate-500">{proLaborePct}% do faturamento</p>
                    </div>
                </div>
                <span className={cn('text-2xl font-black', isHealthy ? 'text-emerald-400' : 'text-red-400')}>
                    {formatCurrency(netProLabore)}
                </span>
            </div>

            {!isHealthy && (
                <p className="text-[9px] text-red-300/80 font-medium text-center">
                    Seus custos superam sua meta. Suba o ticket ou corte despesas operacionais.
                </p>
            )}
        </div>
    );
}
