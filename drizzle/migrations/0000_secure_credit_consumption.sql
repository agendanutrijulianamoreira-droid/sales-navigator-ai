-- Make credit consumption atomic for both authenticated clients and trusted Edge Functions.
-- The caller can only consume credits for itself unless it is the service role.
CREATE OR REPLACE FUNCTION public.consume_ai_credit(
  _user_id UUID,
  _feature TEXT,
  _credits INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _subscription RECORD;
  _wallet RECORD;
BEGIN
  IF _credits IS NULL OR _credits < 1 OR _credits > 100 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_amount');
  END IF;

  IF auth.uid() IS DISTINCT FROM _user_id AND auth.role() <> 'service_role' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unauthorized');
  END IF;

  IF has_role(_user_id, 'admin'::app_role)
     OR has_role(_user_id, 'elite'::app_role)
     OR has_role(_user_id, 'teste'::app_role) THEN
    INSERT INTO public.ai_usage_log(user_id, feature, credits_used)
    VALUES (_user_id, _feature, _credits);
    RETURN jsonb_build_object('ok', true, 'unlimited', true);
  END IF;

  -- Paid subscriptions are the primary wallet when present and active.
  SELECT * INTO _subscription
  FROM public.subscriptions
  WHERE user_id = _user_id
    AND status IN ('active', 'trialing')
    AND (current_period_end IS NULL OR current_period_end > now())
  FOR UPDATE;

  IF FOUND THEN
    IF _subscription.ai_credits_remaining < _credits THEN
      RETURN jsonb_build_object(
        'ok', false,
        'reason', 'insufficient_credits',
        'remaining', _subscription.ai_credits_remaining
      );
    END IF;

    UPDATE public.subscriptions
    SET ai_credits_remaining = ai_credits_remaining - _credits,
        updated_at = now()
    WHERE user_id = _user_id;

    INSERT INTO public.ai_usage_log(user_id, feature, credits_used)
    VALUES (_user_id, _feature, _credits);
    RETURN jsonb_build_object(
      'ok', true,
      'remaining', _subscription.ai_credits_remaining - _credits,
      'wallet', 'subscription'
    );
  END IF;

  -- Free/trial accounts use the legacy wallet until migrated to subscriptions.
  SELECT * INTO _wallet
  FROM public.user_credits
  WHERE user_id = _user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'no_wallet');
  END IF;

  IF _wallet.credits < _credits THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'insufficient_credits', 'remaining', _wallet.credits);
  END IF;

  UPDATE public.user_credits
  SET credits = credits - _credits, updated_at = now()
  WHERE user_id = _user_id;

  INSERT INTO public.ai_usage_log(user_id, feature, credits_used)
  VALUES (_user_id, _feature, _credits);
  RETURN jsonb_build_object(
    'ok', true,
    'remaining', _wallet.credits - _credits,
    'wallet', 'free'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.consume_ai_credit(uuid, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_credit(uuid, text, integer) TO service_role;
