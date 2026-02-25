import { useMaestroPricing } from "@/hooks/useMaestroPricing";
import { ArrowUpRight, ShieldCheck, Zap, Star } from "lucide-react";

interface ProductLadderProps {
    corePrice: number;
}

export function ProductLadder({ corePrice }: ProductLadderProps) {
    const { advice, strategy } = useMaestroPricing();

    // Se não tiver preço base (0), usamos um valor padrão para simular
    const basePrice = corePrice > 0 ? corePrice : 450;

    const ladder = [
        {
            level: "Entrada (Tripwire)",
            icon: <Zap className="w-4 h-4 text-yellow-500" />,
            suggestedPrice: `R$ ${(basePrice * 0.1).toFixed(2)} a R$ ${(basePrice * 0.2).toFixed(2)}`,
            strategy: `Um produto digital focado em resolver UMA dor específica da sua persona (${strategy?.niche || 'Nicho'}).`,
            example: "E-book: 10 Receitas Anti-inflamatórias para Crises."
        },
        {
            level: "Oferta Central",
            icon: <ShieldCheck className="w-4 h-4 text-green-500" />,
            suggestedPrice: `R$ ${basePrice.toFixed(2)}`,
            strategy: "Sua consulta ou protocolo clínico principal. O motor do seu faturamento.",
            example: `Protocolo ${strategy?.persona || 'Individual'}`
        },
        {
            level: "High Ticket / VIP",
            icon: <Star className="w-4 h-4 text-purple-500" />,
            suggestedPrice: `R$ ${(basePrice * 4).toFixed(2)}+`,
            strategy: "Acompanhamento próximo com suporte diário. Foco total em conveniência e velocidade.",
            example: `Mentoria VIP: 90 dias de Remissão de Sintomas.`
        }
    ];

    return (
        <div className="space-y-4 mt-8 animate-in fade-in slide-in-from-bottom duration-700">
            <h3 className="text-lg font-bold flex items-center gap-2 px-1">
                <ArrowUpRight className="w-5 h-5 text-primary" /> Escada de Produtos Recomendada
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
                {ladder.map((item, idx) => (
                    <div key={idx} className="bg-card border rounded-xl p-5 hover:border-primary/50 transition-all group shadow-sm hover:shadow-md">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                                {item.icon}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.level}</span>
                        </div>
                        <div className="text-2xl font-black mb-2 group-hover:text-primary transition-colors">
                            {item.suggestedPrice}
                        </div>
                        <p className="text-sm font-semibold mb-2">{item.example}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                            "{item.strategy}"
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
