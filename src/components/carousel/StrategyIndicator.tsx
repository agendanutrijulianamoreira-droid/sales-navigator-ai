import { useStrategyContext } from "@/hooks/useStrategyContext";
import { Brain, CheckCircle2, Loader2 } from "lucide-react";

export function StrategyIndicator() {
    const { strategy, isLoading } = useStrategyContext();

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg mb-6 border border-dashed animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Sincronizando com o Brand Hub...</span>
            </div>
        );
    }

    if (!strategy || !strategy.persona) return null;

    return (
        <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl mb-6 shadow-sm animate-in fade-in zoom-in duration-500">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-md">
                <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-0.5">
                    Estratégia Mestre Ativa
                </p>
                <p className="text-xs text-indigo-700 font-bold truncate">
                    Público: {strategy.persona.split(',')[0]}
                </p>
                <p className="text-[10px] text-indigo-500 italic mt-0.5">
                    O Maestro está guiando esta geração.
                </p>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-full border border-indigo-200 shadow-inner">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                <span className="text-[10px] font-bold text-green-700 uppercase">Sincronizado</span>
            </div>
        </div>
    );
}
