import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2022-11-15',
})

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { status: 200 })
    }

    const signature = req.headers.get('stripe-signature')
    if (!signature) {
        return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), { status: 400 })
    }

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
        return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), { status: 500 })
    }

    let event: Stripe.Event
    try {
        const body = await req.text()
        event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Invalid signature'
        return new Response(JSON.stringify({ error: message }), { status: 400 })
    }

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id
        if (userId) {
            await supabase
                .from('user_roles')
                .upsert({ user_id: userId, role: 'elite' }, { onConflict: 'user_id' })
        }
    }

    return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
    })
})
