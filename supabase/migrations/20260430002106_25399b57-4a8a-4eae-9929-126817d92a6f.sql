-- ============= SUBSCRIPTION PLANS =============
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly NUMERIC NOT NULL DEFAULT 0,
  price_yearly NUMERIC NOT NULL DEFAULT 0,
  ai_credits_monthly INTEGER NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  highlighted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans"
ON public.subscription_plans FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage plans"
ON public.subscription_plans FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= SUBSCRIPTIONS =============
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  plan_id UUID REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'pending', -- pending, active, past_due, canceled, expired
  billing_cycle TEXT, -- monthly | yearly
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  ai_credits_remaining INTEGER NOT NULL DEFAULT 0,
  ai_credits_reset_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own subscription"
ON public.subscriptions FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users insert own subscription"
ON public.subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins update any subscription"
ON public.subscriptions FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR auth.uid() = user_id);

CREATE TRIGGER subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= AI USAGE LOG =============
CREATE TABLE public.ai_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature TEXT NOT NULL, -- carousel, month_plan, photo, etc
  credits_used INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_usage_user ON public.ai_usage_log(user_id);
CREATE INDEX idx_ai_usage_date ON public.ai_usage_log(created_at);

ALTER TABLE public.ai_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own usage"
ON public.ai_usage_log FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System inserts usage"
ON public.ai_usage_log FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============= PAYMENT EVENTS =============
CREATE TABLE public.payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  subscription_id UUID REFERENCES public.subscriptions(id),
  stripe_event_id TEXT UNIQUE,
  event_type TEXT NOT NULL, -- checkout.completed, invoice.paid, subscription.updated, etc
  amount NUMERIC,
  currency TEXT DEFAULT 'brl',
  status TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_events_user ON public.payment_events(user_id);
CREATE INDEX idx_payment_events_date ON public.payment_events(created_at);

ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view all payment events"
ON public.payment_events FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users view own payment events"
ON public.payment_events FOR SELECT
USING (auth.uid() = user_id);

-- ============= FUNÇÃO: has_active_subscription =============
CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = _user_id
      AND status IN ('active', 'trialing')
      AND (current_period_end IS NULL OR current_period_end > now())
  ) OR has_role(_user_id, 'admin'::app_role)
    OR has_role(_user_id, 'elite'::app_role)
    OR has_role(_user_id, 'teste'::app_role)
$$;

-- ============= FUNÇÃO: consume_ai_credit (atômica) =============
CREATE OR REPLACE FUNCTION public.consume_ai_credit(
  _user_id UUID,
  _feature TEXT,
  _credits INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _sub RECORD;
  _is_unlimited BOOLEAN;
BEGIN
  -- Admin/elite/teste = ilimitado
  IF has_role(_user_id, 'admin'::app_role)
     OR has_role(_user_id, 'elite'::app_role)
     OR has_role(_user_id, 'teste'::app_role) THEN
    INSERT INTO public.ai_usage_log(user_id, feature, credits_used)
    VALUES (_user_id, _feature, _credits);
    RETURN jsonb_build_object('ok', true, 'unlimited', true);
  END IF;

  SELECT * INTO _sub FROM public.subscriptions
  WHERE user_id = _user_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'no_subscription');
  END IF;

  IF _sub.status NOT IN ('active', 'trialing') THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'inactive', 'status', _sub.status);
  END IF;

  IF _sub.ai_credits_remaining < _credits THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'insufficient_credits', 'remaining', _sub.ai_credits_remaining);
  END IF;

  UPDATE public.subscriptions
  SET ai_credits_remaining = ai_credits_remaining - _credits,
      updated_at = now()
  WHERE user_id = _user_id;

  INSERT INTO public.ai_usage_log(user_id, feature, credits_used)
  VALUES (_user_id, _feature, _credits);

  RETURN jsonb_build_object('ok', true, 'remaining', _sub.ai_credits_remaining - _credits);
END;
$$;

-- ============= SEED: planos genéricos iniciais (você edita preços depois) =============
INSERT INTO public.subscription_plans (slug, name, description, price_monthly, price_yearly, ai_credits_monthly, features, display_order, highlighted)
VALUES
  ('starter', 'Starter', 'Comece sua presença digital com o essencial.', 97, 970, 100,
    '["Calendário de conteúdo", "100 gerações IA/mês", "Brand Kit", "Suporte por e-mail"]'::jsonb, 1, false),
  ('pro', 'Pro', 'Para nutricionistas em crescimento que postam toda semana.', 197, 1970, 500,
    '["Tudo do Starter", "500 gerações IA/mês", "Photo Studio", "Mentor IA", "Plano mensal automático"]'::jsonb, 2, true),
  ('premium', 'Premium', 'Operação completa para clínicas e profissionais de alto ticket.', 397, 3970, 2000,
    '["Tudo do Pro", "2000 gerações IA/mês", "Estratégia avançada", "Suporte prioritário", "Acesso antecipado a novidades"]'::jsonb, 3, false);