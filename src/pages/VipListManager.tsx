import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useCredits } from "@/hooks/useCredits";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Loader2, Crown, Copy, Check, Sparkles, Heart, DollarSign, RefreshCw, MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VipWeek {
    week: number;
    type: "CONTENT" | "OFFER";
    headline: string;
    script: string;
}

export default function VipListManager() {
    const { profile } = useProfile();
    const { consumeCredit } = useCredits();
    const { toast } = useToast();

    const [isGenerating, setIsGenerating] = useState(false);
    const [weeks, setWeeks] = useState<VipWeek[]>([]);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleGenerate = async () => {
        const hasCredit = await consumeCredit(1);
        if (!hasCredit) return;

        setIsGenerating(true);
        setWeeks([]);

        try {
            const { data, error } = await supabase.functions.invoke("generate-vip-strategy", {
                body: { profile },
            });

            if (error) throw error;

            const parsed = data?.weeks || [];
            setWeeks(parsed);
            toast({
                title: "Estratégia VIP gerada! 👑",
                description: `${parsed.length} semanas planejadas`,
            });
        } catch (err) {
            console.error("VIP generation error:", err);
            toast({
                variant: "destructive",
                title: "Erro ao gerar estratégia",
                description: err instanceof Error ? err.message : "Tente novamente",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = async (text: string, index: number) => {
        await navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
        toast({ title: "Mensagem copiada!" });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 rounded-full">
                    <Crown className="h-8 w-8 text-amber-600" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Lista VIP 👑</h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    Transforme seu WhatsApp em uma máquina de vendas íntima.
                </p>
            </div>

            {/* Strategy Explanation */}
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <Card className="glass-card border-blue-200/50">
                    <CardContent className="p-5 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                            <Heart className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Semana de Conteúdo</h3>
                            <p className="text-xs text-muted-foreground mt-1">Nutrir, conectar e gerar valor puro.</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-green-200/50">
                    <CardContent className="p-5 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                            <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Semana de Oferta</h3>
                            <p className="text-xs text-muted-foreground mt-1">Recall do tema anterior e venda direta.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Generate Button */}
            <div className="flex justify-center">
                <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="h-14 px-8 rounded-2xl font-bold shadow-xl bg-gradient-to-r from-amber-500 to-amber-700 text-white hover:from-amber-600 hover:to-amber-800 transition-all"
                >
                    {isGenerating ? (
                        <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Gerando 8 Semanas...</>
                    ) : weeks.length > 0 ? (
                        <><RefreshCw className="h-5 w-5 mr-2" /> Regenerar 8 Semanas</>
                    ) : (
                        <><Sparkles className="h-5 w-5 mr-2" /> Gerar Planejamento de 8 Semanas</>
                    )}
                </Button>
            </div>

            {/* Week Cards */}
            {weeks.length > 0 && (
                <div className="space-y-6 max-w-3xl mx-auto">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Cronograma Bimestral</h2>
                        <Badge variant="outline" className="text-xs">
                            <MessageSquare className="h-3 w-3 mr-1" /> Lista de Transmissão
                        </Badge>
                    </div>

                    <div className="grid gap-4">
                        {weeks.map((week, idx) => {
                            const isContent = week.type === "CONTENT";
                            return (
                                <Card
                                    key={idx}
                                    className={cn(
                                        "glass-card transition-all duration-300 hover:shadow-lg",
                                        isContent ? "border-blue-200/50" : "border-green-200/50"
                                    )}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm",
                                                    isContent
                                                        ? "bg-gradient-to-br from-blue-500 to-blue-700"
                                                        : "bg-gradient-to-br from-green-500 to-green-700"
                                                )}>
                                                    S{week.week}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold">{week.headline}</h3>
                                                    </div>
                                                    <Badge
                                                        variant="secondary"
                                                        className={cn(
                                                            "text-[10px] mt-1",
                                                            isContent
                                                                ? "bg-blue-100 text-blue-700"
                                                                : "bg-green-100 text-green-700"
                                                        )}
                                                    >
                                                        {isContent ? "📚 Conteúdo" : "💰 Oferta"}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCopy(week.script, idx)}
                                                className="shrink-0"
                                            >
                                                {copiedIndex === idx ? (
                                                    <><Check className="h-4 w-4 mr-1 text-green-500" /> Copiado</>
                                                ) : (
                                                    <><Copy className="h-4 w-4 mr-1" /> Copiar</>
                                                )}
                                            </Button>
                                        </div>

                                        <div className={cn(
                                            "p-4 rounded-xl text-sm leading-relaxed whitespace-pre-line",
                                            isContent ? "bg-blue-50/50" : "bg-green-50/50"
                                        )}>
                                            {week.script}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {weeks.length === 0 && !isGenerating && (
                <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="text-sm">Gere seu planejamento bimestral para começar.</p>
                    <p className="text-xs mt-1">2 meses de estratégia completa, alternando conteúdo e vendas.</p>
                </div>
            )}
        </div>
    );
}
