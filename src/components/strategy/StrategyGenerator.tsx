import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useStrategyAI, StrategyProfile } from '@/hooks/useStrategyAI';
import { Card, CardContent } from '@/components/ui/card';

interface StrategyGeneratorProps {
    onProfileGenerated: (profile: StrategyProfile) => void;
}

export function StrategyGenerator({ onProfileGenerated }: StrategyGeneratorProps) {
    const [niche, setNiche] = useState('');
    const { generateProfile, isGenerating } = useStrategyAI();

    const handleGenerate = async () => {
        if (!niche.trim()) return;
        const profile = await generateProfile(niche);
        if (profile) {
            onProfileGenerated(profile);
            setNiche(''); // Limpar após gerar
        }
    };

    return (
        <Card className="mb-8 border-primary/20 bg-primary/5 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Sparkles className="w-24 h-24 text-primary" />
            </div>

            <CardContent className="pt-6 relative z-10">
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold">
                        <Sparkles className="w-5 h-5" />
                        <span>Preenchimento Inteligente com IA</span>
                    </div>

                    <p className="text-sm text-muted-foreground max-w-2xl">
                        Pare de olhar para a tela em branco. Diga qual é o seu nicho ou foco principal e nós criaremos sua persona, dores e posicionamento estratégico em segundos.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                            placeholder="Ex: Nutrição para mulheres com SOP ou Nutri Esportiva para Triatletas..."
                            value={niche}
                            onChange={(e) => setNiche(e.target.value)}
                            className="bg-background/80 backdrop-blur-sm border-primary/20 flex-1 h-12"
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating || !niche.trim()}
                            className="h-12 px-8 font-bold gap-2 transition-all hover:shadow-lg active:scale-95"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Gerando...
                                </>
                            ) : (
                                <>
                                    Gerar Estratégia
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
