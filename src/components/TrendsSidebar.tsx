import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Zap,
    TrendingUp,
    Sparkles,
    Plus,
    RefreshCw,
    Loader2,
    CalendarPlus,
    ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ViralIdea {
    categoria: "Em Alta" | "Viral";
    titulo: string;
    trend: string;
    hook: string;
    tipo: "reels" | "carrossel" | "post_unico";
    descricao: string;
}

interface TrendsSidebarProps {
    onApplyIdea: (idea: ViralIdea) => void;
}

export function TrendsSidebar({ onApplyIdea }: TrendsSidebarProps) {
    const { profile } = useProfile();
    const [ideas, setIdeas] = useState<ViralIdea[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchIdeas = async () => {
        if (!profile) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke("get-viral-ideas", {
                body: { profile },
            });

            if (error) throw error;
            setIdeas(data);
        } catch (error) {
            console.error("Error fetching viral ideas:", error);
            toast.error("Erro ao buscar ideias virais");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchIdeas();
    }, [profile]);

    return (
        <div className="flex flex-col h-full bg-white border-l border-gray-100 w-80 shadow-[-4px_0_15px_rgba(0,0,0,0.02)]">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                            <Zap className="h-4 w-4 text-orange-600 fill-orange-600" />
                        </div>
                        <h2 className="font-bold text-gray-900">Trends & Viral</h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-primary transition-colors"
                        onClick={fetchIdeas}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    </Button>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    Sugestões estratégicas baseadas no seu nicho para aumentar seu alcance.
                </p>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            <p className="text-sm text-gray-500 font-medium">Analisando o mercado...</p>
                        </div>
                    ) : (
                        ideas.map((idea, index) => (
                            <Card
                                key={index}
                                className="group relative overflow-hidden border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all duration-300 bg-white"
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <Badge
                                            variant="secondary"
                                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${idea.categoria === "Viral"
                                                    ? "bg-purple-50 text-purple-600"
                                                    : "bg-blue-50 text-blue-600"
                                                }`}
                                        >
                                            {idea.categoria}
                                        </Badge>
                                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase">
                                            {idea.tipo === "carrossel" && <TrendingUp className="h-3 w-3" />}
                                            {idea.tipo}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-gray-900 text-sm mb-2 leading-snug group-hover:text-primary transition-colors">
                                        {idea.titulo}
                                    </h3>

                                    <div className="space-y-2 mb-4">
                                        <div className="p-2 rounded bg-gray-50 border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Gancho sugerido:</p>
                                            <p className="text-xs font-semibold text-gray-700 italic leading-tight">
                                                "{idea.hook}"
                                            </p>
                                        </div>
                                        <p className="text-[11px] text-gray-500 leading-normal">
                                            {idea.descricao}
                                        </p>
                                    </div>

                                    <Button
                                        className="w-full h-9 bg-gray-900 hover:bg-primary text-white font-bold transition-all text-xs"
                                        onClick={() => onApplyIdea(idea)}
                                    >
                                        <CalendarPlus className="h-4 w-4 mr-2" />
                                        Aplicar ao Calendário
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </ScrollArea>

            <div className="p-6 mt-auto border-t border-gray-100 bg-gray-50/30">
                <div className="flex items-center gap-3 text-primary bg-primary/5 p-3 rounded-lg border border-primary/10">
                    <Sparkles className="h-5 w-5 fill-primary" />
                    <p className="text-[11px] font-bold leading-tight">
                        Pronta para viralizar? Arraste as ideias para os dias de maior audiência!
                    </p>
                </div>
            </div>
        </div>
    );
}
