import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

async function getPlanFromMetadata(metadata: Record<string, string> | null | undefined) {
  if (!metadata) return null;
  if (metadata.plan_id) {
    const { data } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", metadata.plan_id)
      .maybeSingle();
    if (data) return data;
  }
  if (metadata.plan_slug) {
    const { data } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("slug", metadata.plan_slug)
      .maybeSingle();
    return data;
  }
  return null;
}

async function upsertSubscription(params: {
  userId: string;
  customerId: string;
  subscription: Stripe.Subscription;
  plan: any;
  billingCycle: string;
}) {
  const { userId, customerId, subscription, plan, billingCycle } = params;

  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      plan_id: plan?.id ?? null,
      status: subscription.status === "trialing" ? "trialing" : subscription.status === "active" ? "active" : subscription.status,
      billing_cycle: billingCycle,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      ai_credits_remaining: plan?.ai_credits_monthly ?? 0,
      ai_credits_reset_at: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
      current_period_start: subscription.current_period_start
        ? new Date(subscription.current_period_start * 1000).toISOString()
        : null,
      current_period_end: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { status: 200 });

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    return new Response(JSON.stringify({ error: "Missing signature or secret" }), { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature error:", err);
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
  }

  console.log(`[Webhook] ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.user_id;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;

        if (userId && session.subscription && customerId) {
          const subscription = await stripe.subscriptions.retrieve(
            typeof session.subscription === "string" ? session.subscription : session.subscription.id
          );
          const plan = await getPlanFromMetadata(session.metadata as any);
          const billingCycle = (session.metadata?.billing_cycle as string) || "monthly";

          await upsertSubscription({ userId, customerId, subscription, plan, billingCycle });

          await supabase.from("payment_events").insert({
            user_id: userId,
            stripe_event_id: event.id,
            event_type: event.type,
            amount: session.amount_total ? session.amount_total / 100 : null,
            currency: session.currency,
            status: session.payment_status,
            payload: session as any,
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          const plan = await getPlanFromMetadata(subscription.metadata as any);
          const billingCycle = (subscription.metadata?.billing_cycle as string) || "monthly";
          await upsertSubscription({ userId, customerId, subscription, plan, billingCycle });
        } else {
          // Buscar pelo customerId
          const { data: existing } = await supabase
            .from("subscriptions")
            .select("user_id, plan_id")
            .eq("stripe_customer_id", customerId)
            .maybeSingle();
          if (existing) {
            await supabase
              .from("subscriptions")
              .update({
                status: subscription.status,
                current_period_start: subscription.current_period_start
                  ? new Date(subscription.current_period_start * 1000).toISOString()
                  : null,
                current_period_end: subscription.current_period_end
                  ? new Date(subscription.current_period_end * 1000).toISOString()
                  : null,
                canceled_at: subscription.canceled_at
                  ? new Date(subscription.canceled_at * 1000).toISOString()
                  : null,
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", existing.user_id);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;

        if (subId) {
          // Renovar créditos no início de cada ciclo
          const { data: sub } = await supabase
            .from("subscriptions")
            .select("user_id, plan_id, subscription_plans(ai_credits_monthly)")
            .eq("stripe_subscription_id", subId)
            .maybeSingle();

          if (sub?.user_id) {
            const credits = (sub as any).subscription_plans?.ai_credits_monthly ?? 0;
            await supabase
              .from("subscriptions")
              .update({
                status: "active",
                ai_credits_remaining: credits,
                ai_credits_reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", sub.user_id);

            await supabase.from("payment_events").insert({
              user_id: sub.user_id,
              stripe_event_id: event.id,
              event_type: event.type,
              amount: invoice.amount_paid / 100,
              currency: invoice.currency,
              status: "paid",
              payload: invoice as any,
            });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
        if (subId) {
          await supabase
            .from("subscriptions")
            .update({ status: "past_due", updated_at: new Date().toISOString() })
            .eq("stripe_subscription_id", subId);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response(JSON.stringify({ error: "Handler error" }), { status: 500 });
  }
});
