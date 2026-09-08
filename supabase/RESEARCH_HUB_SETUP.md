# Research Hub: publicação e atualização automática

O Research Hub usa a Edge Function `fetch-research-items` para consultar PubMed e três feeds RSS. A função grava os resultados em `research_items`, com cache de 12 horas e cooldown de 5 minutos para atualização manual.

## Publicar

Com o projeto Supabase já vinculado:

```bash
supabase db push --linked
supabase functions deploy fetch-research-items --use-api
supabase functions deploy generate-carousel-text get-viral-ideas generate-photo --use-api
```

As funções continuam com `verify_jwt = true`; chamadas do navegador exigem uma sessão autenticada.

## Ativar o cron duas vezes ao dia

A migration cria o job automaticamente quando estes dois segredos já existem no Vault:

- `project_url`: URL do projeto, por exemplo `https://SEU-PROJETO.supabase.co`
- `service_role_key`: JWT legado da service role. Ele fica somente no Vault e nunca deve ir para o frontend.

Se os segredos forem adicionados depois da migration, execute no SQL Editor o bloco `DO $schedule$ ... $schedule$;` que está no fim de `20260908124600_research_hub_and_photo_preferences.sql`.

O job `refresh-research-hub-twice-daily` roda às 08:15 e 20:15 UTC. A Edge Function aplica o próprio cache/cooldown, então uma atualização manual próxima desse horário não duplica chamadas externas.

## Limites e curadoria

- PubMed: duas chamadas em lote por atualização, abaixo do limite sem API key do NCBI.
- RSS: Organização Mundial da Saúde, ScienceDaily Nutrition e Medical Xpress.
- A interface sempre preserva o link original e diferencia notícia de artigo científico.
- A geração usa somente o resumo recebido como base factual e instrui o modelo a não inventar dados ausentes.
