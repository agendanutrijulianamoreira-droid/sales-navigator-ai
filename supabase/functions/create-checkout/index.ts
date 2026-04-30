import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not configured. Configure suas chaves do Stripe primeiro.");

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) throw new Error("Not authenticated");

    const { plan_slug, billing_cycle = "monthly" } = await req.json();
    if (!plan_slug) throw new Error("plan_slug required");

    // Buscar plano
    const { data: plan } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("slug", plan_slug)
      .eq("is_active", true)
      .single();

    if (!plan) throw new Error("Plano não encontrado");

    const priceId = billing_cycle === "yearly" ? plan.stripe_price_id_yearly : plan.stripe_price_id_monthly;
    const amount = billing_cycle === "yearly" ? plan.price_yearly : plan.price_monthly;

    // Buscar/criar customer
    let customerId: string | undefined;
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingSub?.stripe_customer_id) {
      customerId = existingSub.stripe_customer_id;
    } else {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    const origin = req.headers.get("origin") || "https://app.lovable.dev";

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      client_reference_id: user.id,
      mode: "subscription",
      payment_method_types: ["card", "boleto"], // Pix requer ativação manual no Stripe BR
      line_items: [
        priceId
          ? { price: priceId, quantity: 1 }
          : {
              price_data: {
                currency: "brl",
                product_data: {
                  name: `${plan.name} (${billing_cycle === "yearly" ? "Anual" : "Mensal"})`,
                  description: plan.description || undefined,
                },
                unit_amount: Math.round(Number(amount) * 100),
                recurring: { interval: billing_cycle === "yearly" ? "year" : "month" },
              },
              quantity: 1,
            },
      ],
      metadata: {
        user_id: user.id,
        plan_id: plan.id,
        plan_slug: plan.slug,
        billing_cycle,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_id: plan.id,
          plan_slug: plan.slug,
          billing_cycle,
        },
      },
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing`,
      locale: "pt-BR",
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-checkout error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
