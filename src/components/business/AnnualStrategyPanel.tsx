import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMarketingStrategy, MonthStrategy } from "@/hooks/useMarketingStrategy";
import { useProducts } from "@/hooks/useProducts";
import { Sparkles, Calendar, Save, Loader2, Edit3, Target, Package, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function AnnualStrategyPanel() {
  const { strategy, isLoading, saveStrategy, generateWithAI } = useMarketingStrategy();
  const { products } = useProducts();
  const [editableStrategy, setEditableStrategy] = useState<MonthStrategy[]>([]);
  const [isEditing, setIsEditing] = useState<number | null>(null);

  useEffect(() => {
    if (strategy) {
      setEditableStrategy(strategy);
    } else if (!isLoading) {
      // Inicializar com 12 meses vazios se não houver nada
      const empty = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        theme: "",
        goal: "",
        product_id: null,
        hooks: []
      }));
      setEditableStrategy(empty);
    }
  }, [strategy, isLoading]);

  const handleUpdateMonth = (monthIndex: number, field: keyof MonthStrategy, value: any) => {
    const updated = [...editableStrategy];
    updated[monthIndex] = { ...updated[monthIndex], [field]: value };
    setEditableStrategy(updated);
  };

  const handleSaveAll = async () => {
    await saveStrategy(editableStrategy);
    setIsEditing(null);
  };

  const handleGenerate = async () => {
    const confirm = window.confirm("Isso irá sobrescrever seu planejamento atual. Deseja continuar?");
    if (!confirm) return;
    await generateWithAI();
  };

  if (isLoading && !strategy) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-bold tracking-widest text-xs uppercase">Consultando o Maestro Estrategista...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 p-3 rounded-2xl border border-primary/30">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tighter">Planejamento Estratégico de 12 Meses</h2>
            <p className="text-slate-400 text-sm">Sua visão macro de vendas, sazonalidade e conteúdo para o ano completo.</p>
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <Button 
            variant="outline" 
            className="flex-1 md:flex-none border-dashed border-primary/50 text-primary hover:bg-primary/5 font-bold rounded-xl h-12"
            onClick={handleGenerate}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Gerar com IA
          </Button>
          <Button 
            className="flex-1 md:flex-none bg-primary hover:bg-primary/90 font-bold rounded-xl h-12"
            onClick={handleSaveAll}
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Tudo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {editableStrategy.map((month, idx) => (
          <Card 
            key={idx} 
            className={cn(
              "group relative overflow-hidden border-white/10 bg-card/40 backdrop-blur-md transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/30",
              isEditing === idx ? "ring-2 ring-primary border-primary/50" : ""
            )}
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <Zap className="w-16 h-16" />
            </div>

            <CardHeader className="pb-3 border-b border-white/5 bg-white/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-black tracking-tight">{MONTH_NAMES[idx]}</CardTitle>
                <Badge variant="outline" className="bg-primary/10 text-primary border-none text-[10px] uppercase font-black">{idx + 1}º Mês</Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-4">
              {/* Tema */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1.5">
                  <Edit3 className="h-3 w-3" /> Tema do Mês
                </Label>
                <Input 
                  value={month.theme}
                  onChange={(e) => handleUpdateMonth(idx, 'theme', e.target.value)}
                  placeholder="Ex: Detox de Verão"
                  className="bg-white/5 border-white/10 focus:ring-primary rounded-xl h-10 text-sm font-medium"
                />
              </div>

              {/* Objetivo */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1.5">
                  <Target className="h-3 w-3" /> Objetivo Principal
                </Label>
                <Input 
                  value={month.goal}
                  onChange={(e) => handleUpdateMonth(idx, 'goal', e.target.value)}
                  placeholder="Ex: Vender 20 mentorias"
                  className="bg-white/5 border-white/10 focus:ring-primary rounded-xl h-10 text-sm font-medium"
                />
              </div>

              {/* Produto Foco */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1.5">
                  <Package className="h-3 w-3" /> Produto em Foco
                </Label>
                <Select 
                  value={month.product_id || ""} 
                  onValueChange={(v) => handleUpdateMonth(idx, 'product_id', v)}
                >
                  <SelectTrigger className="h-10 bg-white/5 border-white/10 rounded-xl text-sm">
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                    ))}
                    <SelectItem value="null">Nenhum produto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ganchos */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1.5">
                  <Zap className="h-3 w-3" /> Ideias de Ganchos
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {month.hooks?.map((hook, hIdx) => (
                    <Badge key={hIdx} variant="secondary" className="text-[9px] py-1 bg-white/5 hover:bg-white/10 border-white/10 font-medium">
                      {hook}
                    </Badge>
                  ))}
                  {!month.hooks?.length && <p className="text-[10px] italic text-slate-600">Sem ideias geradas ainda.</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
