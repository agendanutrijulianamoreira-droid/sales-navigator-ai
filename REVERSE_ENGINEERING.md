# Engenharia reversa funcional — plataforma de crescimento para profissionais de saúde

> Documento de produto baseado nas telas fornecidas pelo usuário e na leitura do repositório atual. A análise reconstrói capacidades, fluxos e regras úteis; não reproduz marca, textos proprietários, imagens, personagens ou identidade visual da referência.

## 1. Como ler este documento

- **Observado**: aparece diretamente nas telas enviadas.
- **Verificado no código**: existe no repositório atual.
- **Inferido**: comportamento provável deduzido da interface; deve ser confirmado antes de virar regra de negócio.
- **Lacuna**: necessário para alcançar a experiência-alvo, mas não foi encontrado de forma equivalente.

Não foi localizado código-fonte público confiável da aplicação de referência. A busca pública no GitHub foi tentada em modo somente leitura, mas a API retornou `Forbidden`; portanto, nenhuma conclusão depende de acesso ao código externo.

## 2. Modelo mental do produto

A referência não é apenas um gerador de posts. Ela organiza o trabalho em um ciclo contínuo:

```text
identidade e objetivos
        ↓
planejamento assistido por especialistas
        ↓
pesquisa/fontes → ideias → calendário
        ↓
produção multimídia → revisão/aprovação → publicação
        ↓
páginas/ofertas → leads → conversão
        ↓
métricas → novo planejamento
```

O elemento central é a redução de decisões: a pessoa informa contexto uma vez, recebe opções concretas, aprova antes de consumir créditos e pode seguir o próximo passo por ações contextuais.

## 3. Mapa funcional reconstruído

### 3.1 Conta, onboarding e configuração da marca

**Observado**

- Cadastro com uma sequência guiada e progresso visível.
- Identidade profissional: nome, profissão, área, Instagram, logo e fotos.
- Objetivo, público, dificuldades, capacidade de produção e meta de curto prazo.
- Kit visual: cor principal, cor de apoio, papéis semânticos de cor, tipografia de título/corpo/manuscrita e fontes próprias.
- Guia de linguagem: tom em uma ou duas linhas e assuntos que a equipe pode abordar.
- Aviso de contraste insuficiente para acessibilidade.
- O kit é reaproveitado automaticamente em páginas, artes, vídeos e textos.

**Verificado no código**

- Onboarding em cinco passos: identidade, nicho, público, método e tom de voz.
- Perfil com Instagram, persona, dor, desejo, promessa, mecanismo, método, arquétipo e termos proibidos.
- `BrandKit` com logo, marca-d'água, cores, fontes de título/corpo e sugestão de paleta a partir do Instagram.

**Lacunas**

- Separar explicitamente voz, assuntos, restrições editoriais e preferências de interação em estrutura própria.
- Tipografia manuscrita e upload de fonte ainda não aparecem como fluxo equivalente.
- Papéis de cor completos (fundo, tinta, destaque, apoio e contraste) e validação WCAG precisam ser formalizados.
- Dados de capacidade de gravação, meta de 90 dias e objetivo comercial não estão claramente modelados como onboarding estruturado.

### 3.2 Início / cockpit

**Observado**

- Painel inicial com sugestões baseadas em fontes, resumo da semana e atalhos de produção.
- Ações diretas para vídeo, carrossel, stories, roteiro, calendário e conversa com a equipe.
- Estado da conta: configuração da marca, créditos, assinatura e pendências.
- Bloqueios de plano aparecem no contexto da ação, com chamada para assinar.

**Verificado no código**

- Dashboard, saldo de créditos, plano, checklist de implementação e sugestões de pesquisa.
- Atalhos para carrossel, roteiro, calendário, pesquisa, estratégia, conversão e foto.

**Lacunas**

- Unificar o painel em torno de “o que resolver hoje”, em vez de apenas expor módulos.
- Mostrar claramente origem da sugestão, custo, próximo passo e resultado esperado.

### 3.3 Equipe de especialistas e conversa orientada

**Observado**

- Chat persistente com especialistas por função: estratégia, roteiro, edição, design, ofertas e páginas.
- Uma conversa pode encaminhar a tarefa para outro especialista.
- O assistente faz perguntas de desambiguação antes de produzir.
- Respostas podem ter botões de decisão, resumo, plano de 30 dias e ações para abrir calendário ou criar conteúdo.
- Antes da geração de uma arte, mostra o texto exato e o custo em créditos para aprovação.

**Verificado no código**

- `Mentor`, `AIAssistantSidebar`, `useAISpecialist`, `mentor-router` e `ai-specialist`.
- Conversas persistidas existem no banco; há streaming e roteamento para especialista.

**Lacunas**

- Catálogo de especialistas, disponibilidade, contexto compartilhado e histórico de tarefas precisam ser entidades explícitas.
- Mensagens estruturadas com opções, prévias, confirmação de custo e ações de navegação não estão consolidadas em um protocolo único.
- Falta uma visão de “chat do time” com participantes, handoff e status de execução.

### 3.4 Pesquisa e inteligência editorial

**Observado**

- Sugestões exibem título, tipo de evidência, fonte, data, identificador e resumo.
- A sugestão pode virar carrossel, roteiro ou e-book.
- A pesquisa alimenta o plano editorial sem obrigar a pessoa a procurar pauta do zero.

**Verificado no código**

- `ResearchHub`, `fetch-research-items`, `get-viral-ideas`, `research_items` e `TrendsSidebar`.
- Geração de conteúdo recebe perfil, produtos e contexto de pesquisa.

**Lacunas**

- Proveniência precisa acompanhar cada conteúdo gerado: fonte, evidência usada, data de consulta e grau de confiança.
- Falta revisão explícita para temas sensíveis, especialmente saúde, medicação e alegações clínicas.

### 3.5 Planejamento e calendário

**Observado**

- Visões semanal, mensal e lista.
- Status e camadas visuais distinguem ideia, produção, aprovação, publicação e itens externos.
- É possível adicionar ideia por dia, gerar plano por cadência e abrir o item no editor.
- O plano é organizado por temas semanais e objetivos do funil.

**Verificado no código**

- Calendário com visões semana/mês, criação, edição, exclusão e geração em lote.
- Formatos: carrossel, reels, post único e stories.
- Status: rascunho, produção, publicado e arquivado.
- Edge function `generate-month-plan` e tabela `calendar_items`.

**Lacunas**

- Estados de aprovação, revisão, agendamento e falha de publicação precisam ser separados.
- Falta camada editorial explícita: objetivo, etapa do funil, campanha, fonte, produto e canal.
- Não há publicação social verificável no fluxo atual.

### 3.6 Fábrica de conteúdo

**Observado**

- Escolha de formato e estilo a partir de uma referência ou objetivo.
- Geração de texto, edição antes da geração visual e prévia por lâmina.
- Custos de crédito visíveis; o usuário aprova o conteúdo literal antes da geração.
- Exportação, salvamento e envio ao calendário.

**Verificado no código**

- `CarouselCreator`, `useCarouselGenerator`, `generate-carousel-text`, `generate-design`, persistência de carrosséis e refinamento de texto.
- `PhotoStudio`, biblioteca de assets e geração de fotos.

**Lacunas**

- Unificar todos os formatos em um objeto de conteúdo com versões, aprovação e custo.
- Criar pipeline assíncrono com fila, progresso, retry e idempotência.
- Reaproveitar o mesmo conteúdo entre post, story, roteiro, página e mensagem.

### 3.7 Vídeo e editor avançado

**Observado**

- Estúdio recebe vídeo bruto, permite partir de roteiro ou referência e oferece estilos visuais.
- Editor mostra status de validação, preview, música, legendas, cortes, motion e exportação.
- Estilos são apresentados por cards com exemplo e descrição do efeito.

**Verificado no código**

- Há `PhotoStudio`, assets e estrutura de geração; não foi encontrada uma rota equivalente a um editor de vídeo completo.

**Lacuna prioritária**

- Upload → transcrição → seleção de trechos → legendas → estilo → revisão → exportação/agendamento.
- Necessita armazenamento de mídia, jobs, thumbnails, renderização e controle de custo.

### 3.8 Produtos, ofertas e páginas

**Observado**

- Produtos incluem consulta, acompanhamento, e-book, curso, desafio, evento e outros formatos.
- Cada página nasce de um template por objetivo: vender, capturar contato, quiz/calculadora, institucional ou link na bio.
- Templates têm preview, variações de tema e quantidade de fotos a trocar.
- A página já usa marca, cores, logo e fotos; o assistente ajusta o restante.

**Verificado no código**

- `BusinessLab`, `products`, produtos/ofertas e geração de funil.
- `Funnels`, `Conversion`, `VipListManager` cobrem partes da conversão.

**Lacunas prioritárias**

- Não há catálogo de templates de páginas nem editor de páginas publicado.
- Não há modelo de blocos, tema, SEO, domínio/link, formulários e versões.
- Não há quiz/calculadora como produto de página reutilizável.

### 3.9 Leads, atribuição e WhatsApp

**Observado**

- Área de leads filtra por página e período e permite baixar planilha.
- Cada lead guarda página de origem, campanha, visitas e contato.
- Integração comercial promete recepcionista, agenda e número verificado via WhatsApp oficial.

**Verificado no código**

- Existem scripts de conversão e menções a WhatsApp; não foi verificada integração oficial de mensagens/agendamento.

**Lacunas prioritárias**

- Tabelas de leads, eventos de visita, origem/campanha, consentimento, exportação e status do lead.
- Integração oficial com provedor, templates, opt-in, handoff humano, auditoria e agenda.

### 3.10 Métricas

**Observado**

- Períodos de 7/30/90 dias.
- Indicadores por formato: vídeos, artes, carrosséis, stories, páginas, e-books.
- Visitas, contatos, conversão e desempenho por página/conteúdo.

**Verificado no código**

- `Results`, métricas de conteúdo e estruturas financeiras/estratégicas.

**Lacunas**

- Falta um modelo unificado de eventos de publicação, visita, clique, formulário, lead e venda.
- O painel precisa ligar métrica a decisão: manter, adaptar, promover ou arquivar.

### 3.11 Créditos, assinatura e educação do usuário

**Observado**

- Cada geração informa custo; o plano mostra saldo e renovação.
- Recursos bloqueados exibem motivo e upgrade.
- Tours passo a passo destacam navegação, templates, leads e equipe; podem ser pulados e retomados.

**Verificado no código**

- Créditos, top-up, planos Stripe, portal do cliente, assinatura, onboarding e checklist.

**Riscos/lacunas**

- `useCredits` faz decremento direto no cliente, embora exista RPC `consume_ai_credit`; a cobrança deve ser transacional e server-side.
- Falta telemetria consistente de tours, conclusão por etapa e experimentos.

## 4. Modelo de domínio recomendado

| Domínio | Entidades mínimas | Relações importantes |
|---|---|---|
| Workspace | workspace, member, role | usuário pertence a um workspace |
| Marca | brand_profile, brand_asset, color_role, font, voice_guide | marca é aplicada a toda geração |
| Estratégia | goal, audience, offer, campaign, funnel_stage | estratégia alimenta calendário |
| Assistência | specialist, conversation, message, action, handoff | ação pode criar/editar outro recurso |
| Pesquisa | source, evidence, topic, citation | conteúdo conserva sua proveniência |
| Conteúdo | content_item, version, format, approval, asset | item possui versões e custo |
| Calendário | calendar_item, channel, schedule, status | item referencia conteúdo/campanha |
| Página | page, template, block, theme, form, quiz | formulário gera lead |
| CRM | lead, lead_event, attribution, consent | lead nasce de uma página/campanha |
| Operação | job, render, export, notification | jobs são idempotentes e reprocessáveis |
| Monetização | plan, subscription, credit_ledger, usage_event | uso gera lançamento auditável |
| Educação | tour, tour_step, completion | progresso por workspace/usuário |

## 5. Matriz de cobertura do repositório atual

| Capacidade | Estado atual |
|---|---|
| Autenticação e rotas protegidas | Existente; login por e-mail/senha |
| Onboarding estratégico | Parcial; perfil rico, mas sem todo o fluxo operacional observado |
| Kit de marca | Parcial/forte; logo, cores e fontes básicas |
| Assistente especialista | Parcial; roteamento e streaming existem |
| Chat persistente multi-especialista | Parcial; falta protocolo de handoff e ações estruturadas |
| Pesquisa baseada em fontes | Existente/parcial; precisa proveniência por conteúdo |
| Calendário editorial | Existente; precisa mais estados/camadas/canais |
| Carrossel e geração visual | Existente |
| Foto/asset studio | Existente |
| Vídeo/editor avançado | Lacuna |
| Produtos e ofertas | Existente/parcial |
| Templates de páginas | Lacuna |
| Formulários, quizzes e calculadoras | Lacuna como plataforma de páginas |
| Leads e atribuição | Lacuna |
| WhatsApp oficial e agenda | Lacuna não verificada |
| Métricas de conteúdo/páginas | Parcial |
| Créditos e Stripe | Existente, com risco de concorrência no débito |
| Tours guiados | Lacuna como sistema reutilizável |

## 6. Backlog priorizado

### P0 — fundação do ciclo principal

1. **Contrato unificado de conteúdo**: formatos, versões, custo, aprovação, status, fonte e destino.
2. **Ledger de créditos server-side**: substituir decremento direto por operação transacional com idempotência e log.
3. **Chat de especialistas com ações**: mensagens com botões, confirmação, handoff e criação de itens no calendário.
4. **Camada de estratégia/campanha no calendário**: objetivo, funil, produto, fonte, canal e status de aprovação.
5. **Kit de marca completo**: papéis semânticos de cor, contraste, fontes e guia de voz/assuntos.

### P1 — aquisição e conversão

6. Templates de landing pages por objetivo com editor de blocos e preview responsivo.
7. Formulários, quiz/calculadoras e captura de leads com consentimento.
8. Atribuição de origem/campanha e exportação.
9. Integração oficial de mensagens somente após definir provedor, opt-in, agenda e handoff.
10. Métricas de funil ligadas a visitas, cliques, leads, vendas e conteúdo.

### P2 — escala de produção

11. Pipeline de vídeo com jobs, transcrição, cortes, legendas e renderização.
12. Editor de estilos com presets configuráveis e validação antes de renderizar.
13. Sistema de tours reutilizável com retomada e telemetria.
14. Recomendações do painel baseadas em eventos e resultados, não apenas em conteúdo novo.

## 7. Critérios de aceite do produto-alvo

- Uma nova conta consegue concluir identidade, marca, voz, objetivo e público sem abandonar o fluxo.
- O painel mostra uma próxima ação concreta e permite executá-la sem descobrir a arquitetura interna.
- Toda geração informa custo antes da cobrança e deixa claro o texto que será usado.
- Toda peça gerada mantém fonte, versão, aprovação e destino editorial.
- Uma conversa pode criar plano, calendário, conteúdo, oferta ou página através de ações rastreáveis.
- A pessoa consegue sair de uma ideia para publicação e, depois, enxergar seu impacto em métricas.
- Leads têm origem, consentimento, histórico e exportação.
- Recursos indisponíveis explicam o motivo e oferecem o próximo passo sem interromper o restante do trabalho.
- Nenhuma identidade, marca, texto, ilustração ou personagem da referência é incorporada ao produto.

## 8. Próxima sequência de implementação

1. Criar o contrato de conteúdo, estados e ledger de créditos.
2. Consolidar o chat orientado com ações e handoff.
3. Completar o kit de marca e aplicar seus tokens em todos os geradores.
4. Construir páginas, formulários e leads como novo domínio.
5. Integrar métricas e só então priorizar WhatsApp oficial e editor de vídeo.

Este documento é a linha de base funcional; cada item deve virar uma história técnica com telas, eventos, permissões, estados vazios, erros, telemetria e critérios de aceite antes da implementação.
