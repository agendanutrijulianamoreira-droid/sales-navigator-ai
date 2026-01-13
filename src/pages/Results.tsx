import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useProducts } from "@/hooks/useProducts";
import { useAISpecialist } from "@/hooks/useAISpecialist";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Sparkles, TrendingUp, Target, DollarSign, Calculator, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

interface FinancialGoal {
  id: string;
  meta_mensal: number;
  faturado: number;
  mes_ano: string;
  produtos_vendidos: any;
}

export default function Results() {
  const { user } = useAuth();
  const { products } = useProducts();
  const { generateContent, isLoading, streamedContent } = useAISpecialist();
  const [goal, setGoal] = useState<FinancialGoal | null>(null);
  const [newGoal, setNewGoal] = useState("");
  const [newRevenue, setNewRevenue] = useState("");

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  useEffect(() => {
    if (user) {
      fetchGoal();
    }
  }, [user]);

  const fetchGoal = async () => {
    const { data, error } = await supabase
      .from("financial_goals")
      .select("*")
      .eq("user_id", user?.id)
      .eq("mes_ano", currentMonth)
      .single();

    if (data) {
      setGoal(data);
      setNewGoal(data.meta_mensal.toString());
      setNewRevenue(data.faturado.toString());
    }
  };

  const handleSaveGoal = async () => {
    if (!user) return;

    const goalValue = parseFloat(newGoal) || 0;
    const revenueValue = parseFloat(newRevenue) || 0;

    if (goal) {
      const { error } = await supabase
        .from("financial_goals")
        .update({ meta_mensal: goalValue, faturado: revenueValue })
        .eq("id", goal.id);

      if (!error) {
        setGoal({ ...goal, meta_mensal: goalValue, faturado: revenueValue });
        toast.success("Meta atualizada!");
      }
    } else {
      const { data, error } = await supabase
        .from("financial_goals")
        .insert({
          user_id: user.id,
          mes_ano: currentMonth,
          meta_mensal: goalValue,
          faturado: revenueValue,
        })
        .select()
        .single();

      if (data) {
        setGoal(data);
        toast.success("Meta criada!");
      }
    }
  };

  const handleGenerateAnalysis = async () => {
    await generateContent("cfo_strategist", "analise", {
      meta: goal?.meta_mensal || parseFloat(newGoal),
      faturado: goal?.faturado || parseFloat(newRevenue),
      produtos: products,
      mes: currentMonth,
    });
  };

  const progress = goal ? (goal.faturado / goal.meta_mensal) * 100 : 0;
  const remaining = goal ? goal.meta_mensal - goal.faturado : 0;

  return (
    <AppLayout title="Resultados" description="GPS Financeiro">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Goal Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Meta do Mês
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Meta Mensal (R$)</Label>
                  <Input
                    type="number"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="10000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Faturado até agora (R$)</Label>
                  <Input
                    type="number"
                    value={newRevenue}
                    onChange={(e) => setNewRevenue(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              <Button onClick={handleSaveGoal}>Salvar</Button>

              {goal && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-3" />
                  <div className="flex justify-between">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        R$ {goal.faturado.toLocaleString("pt-BR")}
                      </p>
                      <p className="text-xs text-muted-foreground">Faturado</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        R$ {goal.meta_mensal.toLocaleString("pt-BR")}
                      </p>
                      <p className="text-xs text-muted-foreground">Meta</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${remaining > 0 ? "text-orange-500" : "text-green-500"}`}>
                        R$ {Math.abs(remaining).toLocaleString("pt-BR")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {remaining > 0 ? "Falta" : "Excedeu!"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Analysis */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Análise do CFO
                  </CardTitle>
                  <CardDescription>Engenharia reversa da sua meta</CardDescription>
                </div>
                <Button onClick={handleGenerateAnalysis} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {streamedContent ? (
                <div className="prose prose-sm max-w-none whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                  {streamedContent}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Clique no botão para gerar a análise financeira</p>
                  <p className="text-xs mt-2">O CFO vai calcular exatamente quantos produtos você precisa vender</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Resumo Rápido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ticket Médio</span>
                <span className="font-medium">
                  R$ {products && products.length > 0 
                    ? Math.round(products.reduce((a, b) => a + b.ticket, 0) / products.length).toLocaleString("pt-BR")
                    : "0"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Produtos Cadastrados</span>
                <span className="font-medium">{products?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Dias Restantes</span>
                <span className="font-medium">
                  {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Products Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Seus Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              {products && products.length > 0 ? (
                <div className="space-y-3">
                  {products.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center justify-between text-sm">
                      <span className="truncate">{product.nome}</span>
                      <span className="font-medium text-primary">
                        R$ {product.ticket.toLocaleString("pt-BR")}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Cadastre seus produtos na aba Produtos
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Dica do CFO
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Foque em aumentar o ticket médio antes de buscar mais clientes. 
                Vender para quem já confia em você é 5x mais fácil.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
