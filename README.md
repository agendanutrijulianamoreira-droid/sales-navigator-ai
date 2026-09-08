# Sales Navigator AI

Beleza — mas antes de você jogar isso no Lovable e torcer pro universo, vale um puxãozinho de orelha técnico: o seu “sistema” hoje está mais perto de um painel front-end com IA do que de um produto completo. As “funções” quebravam porque estavam presas em process.env no client, com backend/edge functions soltas e Supabase em modo “mock silencioso”. Migrar pro Lovable é ótimo se você pedir as alterações certas (senão você só muda o lugar onde o problema mora).

Abaixo eu te digo (1) o que você quer com esse sistema (visão clara e vendável) e (2) o que pedir pro Lovable alterar (lista objetiva), e no fim deixo um prompt pronto pra você colar lá.

1) O que você quer com esse sistema (visão que não vira Frankenstein)

Pelo teu código, a alma do produto é:

Um “Sales OS” para nutricionistas (começa com você como usuária) que faz 3 coisas:

Transforma método/oferta em assets de venda

escada de produtos (produto de entrada → comunidade → consulta → plano)

mensagens VIP (WhatsApp/DM)

estratégia semanal de conteúdo

Gera conteúdo com consistência e padrão

posts (carrossel, legenda, roteiro)

variações por objetivo (atração, objeção, autoridade, venda)

reaproveitamento do que já funciona

Suporte “ao vivo” de decisão (tipo copiloto)

“o que eu respondo pra esse lead?”

“que conteúdo eu posto hoje com base nisso?”

“qual oferta eu empurro sem ficar forçado?”

O que ele não é (ainda): uma agenda médica completa, prontuário, financeiro, etc. Se você misturar tudo agora, vira um monstro impossível de terminar. O jogo é: MVP = Vendas + Conteúdo + Conversão.
2) O que pedir pro Lovable alterar (o que destrava de verdade)
A. Transformar o app em full-stack “de verdade”

Pedido: “Criar backend e mover a integração com Gemini para o servidor.”

Por quê: sua chave do Gemini não pode ficar no front-end.
Então o Lovable precisa criar uma rota tipo:

POST /api/generate (server) → chama Gemini com chave secreta → retorna resultado

E o front chama essa rota.

B. Unificar e padronizar todas as chamadas de IA

Pedido: “Criar um serviço único de IA com endpoints por função:**

generatePostContent

generateProductLadder

generateVipMessage

generateStrategy

liveSupport (se mantiver)

Sem duplicação, sem process.env no client, sem gambiarra.

C. Trocar env vars do Vite e remover mocks silenciosos

Pedido: “Remover qualquer mock automático do Supabase e falhar com mensagem clara se credenciais não existirem.”

Hoje você tem o risco clássico: “parece que salvou, mas não salvou nada”.

D. Adicionar persistência (Supabase) do que importa

Pedido: “Implementar banco e salvar histórico do que foi gerado, com tags e busca.”

Tabelas mínimas:

profiles (nutri, método, nicho, promessa, tom de voz)

generations (tipo: post/vip/escada; input; output; data; objetivo; status)

templates (opcional)

leads (opcional fase 2)

E. Autenticação

Pedido: “Login por e-mail (magic link) e cada usuária só vê seus dados.”

F. UX que não engole erro

Pedido: “Mostrar erro na tela (toast/alert) e logs no backend.”

Porque hoje você fica no “não funciona” em vez do “faltou chave / deu 429 / deu CORS / deu 500”.

G. Páginas e fluxos claros

Pedido: “Organizar o app em 4 áreas:**

Perfil & Método

Conteúdo (gerar + biblioteca)

Conversão (mensagens VIP)

Estratégia (escada + plano semanal)

E deixar o “Live support” como extra, não como núcleo.

H. Entregáveis do MVP (aceitação)

Pedido: “Considerar pronto quando:**

Consigo cadastrar meu perfil e método

Gerar post e salvar no histórico

Gerar mensagem VIP e salvar

Gerar escada de produtos e salvar

Abrir histórico, filtrar por tipo, copiar resultado

Tudo com login e sem expor chave da IA no browser

Prompt pronto para colar no Lovable

(Cola do jeitinho que está.)

Quero migrar meu projeto React/TypeScript (Vite) para um app full-stack no Lovable.

OBJETIVO DO SISTEMA
Criar um “Sales OS” para nutricionistas (MVP começando para mim), que transforma meu método e minha oferta em:
1) Conteúdo (post/carrossel/legenda/roteiro)
2) Mensagens VIP (DM/WhatsApp) para converter leads
3) Escada de produtos + plano semanal de conteúdo

REQUISITOS OBRIGATÓRIOS (MVP)
- Autenticação por e-mail (magic link)
- Perfil do usuário: nicho, persona, promessa 90 dias, método, tom de voz, produtos e preços
- Geração via IA: gerar post, mensagem VIP, escada de produtos, estratégia semanal
- Biblioteca/Historico: salvar todas as gerações com data, tipo, objetivo e tags; permitir busca e filtro
- UX: botões de copiar, loading states e mensagens de erro visíveis (toast/alert)
- Segurança: NUNCA expor a chave do Gemini no front-end

ARQUITETURA
- Frontend React/TS
- Backend com endpoints /api/* que chamam a IA no servidor
- Banco Supabase (ou equivalente) com tabelas:
  profiles (user_id, nicho, persona, promessa, metodo, tom_voz, produtos_json)
  generations (user_id, type, objective, input_json, output_text, created_at, tags)
- RLS/segurança: cada user vê somente seus dados

ENDPOINTS
- POST /api/generate/post
- POST /api/generate/vip-message
- POST /api/generate/product-ladder
- POST /api/generate/weekly-strategy
Cada endpoint valida input, chama Gemini com chave server-side, retorna texto estruturado.

PÁGINAS
1) /onboarding (criar perfil e método)
2) /content (gerar conteúdo + salvar no histórico)
3) /vip (gerar mensagens para conversão)
4) /strategy (escada de produtos + plano semanal)
5) /library (histórico, busca e filtros)

CRITÉRIO DE PRONTO
- Usuário loga, preenche perfil, gera um post e ele aparece na Library
- Usuário gera uma mensagem VIP e aparece na Library
- Usuário gera escada e estratégia e aparece na Library
- Erros aparecem na UI
- A chave de IA não aparece no bundle do navegador


Se você seguir esse roteiro, o Lovable não vai “recriar seu app”; ele vai consertar a natureza do app: de painel solto para sistema com backend, persistência e segurança.
Quero migrar meu projeto para o Lovable e transformar em um app full-stack (MVP) com geração de conteúdo/estratégia e mensagens de conversão para nutricionistas.

OBJETIVO DO SISTEMA (MVP)
Criar um “Sales OS” para nutricionistas (começando para mim) que:
1) Gera conteúdo (carrossel/legenda/roteiro) a partir do meu método e do objetivo do post
2) Gera mensagens VIP (WhatsApp/DM) para converter leads
3) Gera Escada de Produtos + plano semanal de conteúdo
4) Salva tudo em uma biblioteca com busca/filtros e permite copiar

REQUISITOS OBRIGATÓRIOS
- Autenticação por e-mail (magic link)
- Onboarding para preencher perfil e método (nicho, persona, promessa 90 dias, tom de voz, produtos e preços)
- Biblioteca/Historico: salvar todas as gerações (tipo, objetivo, input, output, data, tags)
- UX: loading states, botões de copiar, e erros visíveis na tela (toast/alert)
- Segurança: NUNCA expor chaves de IA no front-end
- Backend com endpoints /api/* chamando IA no servidor

PONTO CRÍTICO: ARQUITETURA MULTI-MODELO (PRECISO DISSO)
Quero usar Gemini como padrão por custo, mas o sistema NÃO pode depender de um único modelo.
Implemente uma camada “LLM Router” no backend com:
- Interface única: generate(taskType, payload, options)
- Providers suportados:
  - Gemini (default)
  - OpenAI (fallback opcional)
  - Anthropic (fallback opcional)
- Configuração por função (taskType) definindo modelo default e fallback:
  - post_content: default gemini flash; fallback openai gpt-4.1 mini (ou sonnet)
  - vip_message: default gemini flash; fallback openai
  - product_ladder: default gemini pro (ou flash); fallback openai/anthropic
  - weekly_strategy: default gemini pro; fallback openai/anthropic
- Fallback automático: se provider default falhar (429/5xx/timeouts), tentar fallback e registrar logs
- Logging: armazenar provider usado, latência, status e erro (se houver) na tabela generations

CONFIGURAÇÕES E CHAVES
- Chaves ficam somente no backend:
  - GEMINI_API_KEY
  - OPENAI_API_KEY (opcional)
  - ANTHROPIC_API_KEY (opcional)
- O front-end nunca recebe essas chaves
- Criar tela/admin setting simples (ou tabela settings) para escolher provider/modelo por taskType

BANCO (SUPABASE OU EQUIVALENTE)
Tabelas mínimas:
- profiles: user_id, nicho, persona, promessa_90d, metodo, tom_voz, produtos_json, created_at
- generations: user_id, type, objective, input_json, output_text, tags, provider_used, model_used, latency_ms, status_code, created_at
- settings (opcional): user_id, taskType, default_provider, default_model, fallback_provider, fallback_model

ENDPOINTS (BACKEND)
- POST /api/generate/post
- POST /api/generate/vip-message
- POST /api/generate/product-ladder
- POST /api/generate/weekly-strategy
Todos chamam o LLM Router e salvam o resultado em generations.

PÁGINAS
1) /onboarding (perfil + método)
2) /content (gerar conteúdo + salvar)
3) /vip (gerar mensagens + salvar)
4) /strategy (escada + plano semanal + salvar)
5) /library (histórico, busca, filtros, copiar)
6) /settings (opcional, para escolher provider/modelo por taskType)

CRITÉRIO DE PRONTO
- Usuário loga, preenche perfil, gera um post e ele aparece na Library
- Usuário gera mensagem VIP e aparece na Library
- Usuário gera escada e estratégia e aparecem na Library
- UI mostra erros claramente (não só console)
- Gemini é default, mas se falhar há fallback e isso fica registrado
- Nenhuma chave de IA aparece no bundle do navegador

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://sales-os-scribe.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9f452db5-dc5f-4d42-a894-111afdb52310).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
