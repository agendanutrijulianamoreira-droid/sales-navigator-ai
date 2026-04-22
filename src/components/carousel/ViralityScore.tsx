import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Zap, AlertTriangle, CheckCircle2, TrendingUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ViralityScoreProps {
  headline?: string;
}

const POWER_WORDS = [
  "segredo", "erro", "como", "por que", "nunca", "pare", "descubra", "guia", "passos", 
  "verdade", "mentira", "mito", "apenas", "único", "rápido", "fácil", "chocante", 
  "surpreendente", "cuidado", "atenção", "pior", "melhor", "motivos", "razões", "sinais"
];

const NEGATIVE_HOOKS = ["cuidado", "atenção", "pare", "pior", "erro", "nunca"];

export function ViralityScore({ headline = "" }: ViralityScoreProps) {
  
  const scoreData = useMemo(() => {
    if (!headline || headline.trim().length === 0) {
      return { score: 0, recommendations: ["Adicione um título focado no problema ou desejo."], hasNumber: false, hasPowerWord: false };
    }

    let points = 0;
    const recommendations: string[] = [];
    const text = headline.toLowerCase();
    const words = text.split(/\s+/).filter(w => w.length > 0);

    // 1. Length analysis (Ideal: 4-9 words)
    if (words.length >= 4 && words.length <= 9) {
      points += 25;
    } else if (words.length > 9) {
      points += 10;
      recommendations.push("O título está longo. Tente resumi-lo em até 9 palavras para maior impacto visual no feed.");
    } else {
      points += 5;
      recommendations.push("O título é muito curto. Adicione um gancho ou contexto para gerar mais curiosidade.");
    }

    // 2. Power Words Analysis
    const foundPowerWords = POWER_WORDS.filter(pw => text.includes(pw));
    if (foundPowerWords.length > 0) {
      points += 30;
    } else {
      recommendations.push("Use \"power words\" como 'Como', 'Erro', 'Segredo', ou 'Motivos' para despertar mais interesse imediato.");
    }

    // 3. Numbers presence
    const hasNumber = /\d/.test(text);
    if (hasNumber) {
      points += 25;
    } else {
      recommendations.push("Títulos com números (ex: '3 passos', '5 erros') recebem até 36% mais engajamento. Considere usar um número.");
    }

    // 4. Emotional / Curiosity / Negative trigger
    const foundNegative = NEGATIVE_HOOKS.filter(nh => text.includes(nh));
    if (foundNegative.length > 0) {
      points += 10;
    }

    // 5. Questions or Exclamations
    if (text.includes("?") || text.includes("!")) {
      points += 10;
    } else if (foundNegative.length === 0) {
       recommendations.push("Títulos no formato de pergunta instigam o leitor a deslizar para a resposta.");
    }

    // Cap at 100
    const finalScore = Math.min(100, points);

    return {
      score: finalScore,
      recommendations: recommendations.slice(0, 3), // Show max 3 recommendations
      hasNumber,
      hasPowerWord: foundPowerWords.length > 0
    };
  }, [headline]);

  const { score, recommendations } = scoreData;

  const colorConfig = useMemo(() => {
    if (score >= 80) return { bg: "bg-emerald-500", text: "text-emerald-700", light: "bg-emerald-50", border: "border-emerald-200", icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" /> };
    if (score >= 50) return { bg: "bg-amber-400", text: "text-amber-700", light: "bg-amber-50", border: "border-amber-200", icon: <AlertTriangle className="w-5 h-5 text-amber-600" /> };
    return { bg: "bg-red-500", text: "text-red-700", light: "bg-red-50", border: "border-red-200", icon: <Info className="w-5 h-5 text-red-600" /> };
  }, [score]);

  if (!headline) return null;

  return (
    <div className={cn("rounded-2xl p-4 border transition-all duration-500", colorConfig.light, colorConfig.border)}>
      <div className="flex items-start justify-between flex-wrap gap-4">
        
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-xl bg-white shadow-sm border", colorConfig.border)}>
            {colorConfig.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={cn("font-bold text-sm tracking-tight", colorConfig.text)}>Potencial Viral (Hook Score)</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className={cn("w-3.5 h-3.5 opacity-50", colorConfig.text)} />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    Baseado em heurísticas de atenção (palavras atrativas, números, tamanho do título). Algoritmo focado no consumo rápido de redes sociais.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="w-32 sm:w-48 h-2.5 rounded-full overflow-hidden bg-white/50 border border-black/5">
                <div 
                  className={cn("h-full transition-all duration-1000 ease-out", colorConfig.bg)}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className={cn("font-black text-lg leading-none", colorConfig.text)}>{score}/100</span>
            </div>
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="flex-1 min-w-[200px] border-l border-black/10 pl-4 py-1">
            <h4 className={cn("text-xs font-bold uppercase tracking-wider mb-2", colorConfig.text)}>Sugestões para melhorar:</h4>
            <ul className="space-y-1.5 focus-visible:outline-none">
              {recommendations.map((rec, i) => (
                <li key={i} className="text-xs text-gray-700 font-medium flex gap-1.5 items-start">
                  <TrendingUp className="w-3 h-3 shrink-0 mt-0.5 opacity-60 text-primary" /> 
                  <span className="opacity-90 leading-tight">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {score >= 80 && recommendations.length === 0 && (
          <div className="flex-1 min-w-[200px] border-l border-black/10 pl-4 py-2 flex items-center">
            <p className="text-xs font-bold text-emerald-800 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              Título (Gancho) altamente magnético!
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
