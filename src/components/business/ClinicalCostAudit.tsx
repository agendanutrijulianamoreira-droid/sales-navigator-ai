import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Monitor, Megaphone, Building2, GraduationCap, Receipt, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CostCategory {
    id: string;
    label: string;
    icon: React.ReactNode;
    color: string;
    examples: string;
    value: number;
}

interface ClinicalCostAuditProps {
    onChange: (total: number) => void;
    initialTotal?: number;
}

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

export function ClinicalCostAudit({ onChange, initialTotal = 0 }: ClinicalCostAuditProps) {
    const [expanded, setExpanded] = useState(false);
    const [categories, setCategories] = useState<CostCategory[]>([
        {
            id: 'software',
            label: 'Softwares',
            icon: <Monitor className="h-4 w-4" />,
            color: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
            examples: 'Dietbox, Nutrium, Lanche, Canva Pro',
            value: 0,
        },
        {
            id: 'marketing',
            label: 'Marketing',
            icon: <Megaphone className="h-4 w-4" />,
            color: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
            examples: 'Meta Ads, Google Ads, Linktree, Agendamento',
            value: 0,
        },
        {
            id: 'infra',
            label: 'Infraestrutura',
            icon: <Building2 className="h-4 w-4" />,
            color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
            examples: 'Aluguel/Sublocação, Internet, Celular',
            value: 0,
        },
        {
            id: 'educacao',
            label: 'Educação',
            icon: <GraduationCap className="h-4 w-4" />,
            color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
            examples: 'Pós-graduação, Cursos, Supervisões clínicas',
            value: 0,
        },
        {
            id: 'financeiro',
            label: 'Financeiro',
            icon: <Receipt className="h-4 w-4" />,
            color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
            examples: 'DAS/Simples Nacional, Taxas de cartão, Contador',
            value: 0,
        },
    ]);

    const handleChange = (id: string, raw: string) => {
        const num = parseFloat(raw.replace(',', '.')) || 0;
        const updated = categories.map((c) => (c.id === id ? { ...c, value: num } : c));
        setCategories(updated);
        const total = updated.reduce((sum, c) => sum + c.value, 0);
        onChange(total);
    };

    const total = categories.reduce((s, c) => s + c.value, 0);

    return (
        <div className="space-y-3">
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between group"
            >
                <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-primary" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">
                        Audit de Custos Clínicos
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">{formatCurrency(total)}</span>
                    {expanded ? (
                        <ChevronUp className="h-3 w-3 text-slate-500" />
                    ) : (
                        <ChevronDown className="h-3 w-3 text-slate-500" />
                    )}
                </div>
            </button>

            {expanded && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            className={cn(
                                'flex items-center gap-3 p-3 rounded-xl border bg-white/3 transition-all hover:bg-white/5',
                                cat.color
                            )}
                        >
                            <div className={cn('p-1.5 rounded-lg shrink-0 border', cat.color)}>
                                {cat.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black text-white">{cat.label}</p>
                                <p className="text-[8px] text-slate-500 truncate">{cat.examples}</p>
                            </div>
                            <div className="relative shrink-0">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold pointer-events-none">
                                    R$
                                </span>
                                <Input
                                    type="number"
                                    min={0}
                                    defaultValue={0}
                                    onChange={(e) => handleChange(cat.id, e.target.value)}
                                    className="w-24 h-7 pl-7 pr-2 text-[11px] font-bold bg-black/30 border-white/10 text-right rounded-lg"
                                />
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-between items-center px-2 pt-2 border-t border-white/5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Total Operacional</span>
                        <Badge className="bg-primary/20 text-primary border-primary/30 font-black text-sm px-3">
                            {formatCurrency(total)}
                        </Badge>
                    </div>
                </div>
            )}
        </div>
    );
}
