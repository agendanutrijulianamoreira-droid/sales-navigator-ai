import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Loader2, Sparkles, Zap, Crown, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface Plan {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  ai_credits_monthly: number;
  features: string[];
  highlighted: boolean;
}

const planIcons: Record<string, any> = {
  starter: Sparkles,
  pro: Zap,
  premium: Crown,
};

export default function Billing() {
  const { user } = useAuth();
  const { subscription, refresh } = useSubscription();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => setPlans((data as any) || []));
  }, []);

  const handleSubscribe = async (slug: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setLoading(slug);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan_slug: slug, billing_cycle: cycle },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (e: any) {
      toast.error(e.message || "Erro ao iniciar checkout");
    } finally {
      setLoading(null);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setPortalLoading(false);
    }
  };

  const isCurrentPlan = (slug: string) =>
    subscription?.status === "active" && subscription?.plan?.slug === slug;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            Escolha seu plano
          </h1>
          <p className="text-lg text-muted-foreground">
            Acesso completo à plataforma. Cancele quando quiser.
          </p>
        </div>

        {subscription?.status === "active" && (
          <Card className="mb-8 border-primary/30 bg-primary/5">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <Badge variant="default" className="mb-2">Assinatura ativa</Badge>
                <p className="font-semibold">
                  Plano {subscription.plan?.name} • {subscription.ai_credits_remaining} créditos AI restantes
                </p>
                {subscription.current_period_end && (
                  <p className="text-sm text-muted-foreground">
                    Próxima cobrança: {new Date(subscription.current_period_end).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>
              <Button onClick={handlePortal} disabled={portalLoading} variant="outline">
                {portalLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ExternalLink className="h-4 w-4 mr-2" />}
                Gerenciar
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center mb-8">
          <Tabs value={cycle} onValueChange={(v) => setCycle(v as any)}>
            <TabsList>
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
              <TabsTrigger value="yearly">
                Anual <Badge variant="secondary" className="ml-2">-17%</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = planIcons[plan.slug] || Sparkles;
            const price = cycle === "yearly" ? plan.price_yearly : plan.price_monthly;
            const monthlyEquiv = cycle === "yearly" ? plan.price_yearly / 12 : plan.price_monthly;
            const isCurrent = isCurrentPlan(plan.slug);

            return (
              <Card
                key={plan.id}
                className={`relative ${plan.highlighted ? "border-primary border-2 shadow-lg scale-105" : ""}`}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Mais popular</Badge>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-6 w-6 text-primary" />
                    <CardTitle>{plan.name}</CardTitle>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">R$ {monthlyEquiv.toFixed(0)}</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                    {cycle === "yearly" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        R$ {price.toFixed(0)} cobrados anualmente
                      </p>
                    )}
                  </div>

                  <div className="text-sm font-semibold text-primary">
                    {plan.ai_credits_monthly.toLocaleString()} créditos AI/mês
                  </div>

                  <ul className="space-y-2">
                    {(plan.features || []).map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                    disabled={loading === plan.slug || isCurrent}
                    onClick={() => handleSubscribe(plan.slug)}
                  >
                    {loading === plan.slug ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isCurrent ? (
                      "Plano atual"
                    ) : (
                      "Assinar agora"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Pagamento via Stripe • Cartão e Boleto • Pix em breve • Cancele quando quiser
        </p>
      </div>
    </div>
  );
}
