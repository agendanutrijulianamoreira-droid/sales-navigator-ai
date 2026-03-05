import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgendaViabilityProps {
    availableHours: number;
    neededHours: number;
}

export function AgendaViability({ availableHours, neededHours }: AgendaViabilityProps) {
    const percentage = availableHours > 0 ? Math.round((neededHours / availableHours) * 100) : 0;

    const getStatus = () => {
        if (percentage <= 70) return { label: "Saudável", color: "text-emerald-500", bg: "bg-emerald-500", icon: <CheckCircle2 className="h-4 w-4" /> };
        if (percentage <= 100) return { label: "No Limite", color: "text-amber-500", bg: "bg-amber-500", icon: <AlertCircle className="h-4 w-4" /> };
        return { label: "Risco de Burnout", color: "text-rose-500", bg: "bg-rose-500", icon: <Flame className="h-4 w-4" /> };
    };

    const status = getStatus();

    return (
        <Card className="p-6 border-none bg-white/5 backdrop-blur-md shadow-xl rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                {percentage > 100 ? <Flame className="w-24 h-24" /> : <CheckCircle2 className="w-24 h-24" />}
            </div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="font-black text-lg text-white tracking-tight">Viabilidade da Agenda</h3>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-0.5">Sua Meta vs. Tempo Disponível</p>
                </div>
                <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-wider", status.color)}>
                    {status.icon} {status.label}
                </div>
            </div>

            <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-baseline">
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">{neededHours.toFixed(0)}h</span>
                        <span className="text-xs font-bold text-slate-500">necessárias</span>
                    </div>
                    <div className="text-right">
                        <span className={cn("text-2xl font-black", status.color)}>{percentage}%</span>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Ocupação Real</p>
                    </div>
                </div>

                <div className="relative h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                    <div
                        className={cn("h-full rounded-full transition-all duration-1000 ease-out", status.bg)}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div className="text-center">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Capacidade</p>
                        <p className="text-lg font-black text-white">{availableHours.toFixed(0)}h<span className="text-[10px] text-slate-500">/mês</span></p>
                    </div>
                    <div className="text-center border-l border-white/5">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Carga Atual</p>
                        <p className="text-lg font-black text-white">{neededHours.toFixed(0)}h<span className="text-[10px] text-slate-500">/mês</span></p>
                    </div>
                </div>

                {percentage > 100 && (
                    <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex gap-3 items-start animate-pulse">
                        <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-rose-100 leading-relaxed font-medium">
                            <strong>ALERTA CRÍTICO:</strong> Para bater sua meta com este preço, você precisaria de <strong>{percentage - 100}% a mais</strong> de tempo do que seu limite definido. Isso é matematicamente insustentável. Suba seu ticket ou automatize processos.
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
}
