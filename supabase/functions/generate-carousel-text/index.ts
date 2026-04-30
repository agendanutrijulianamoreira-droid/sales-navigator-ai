import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      topic, tone, format, mode, currentText, strategyContext,
      postType, contentPillar, funnelStage, ctaStyle, narrativeElement,
      contentFormat, customInstructions, profile, products
    } = await req.json()

    const apiKey = Deno.env.get('LOVABLE_API_KEY') || Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) throw new Error('API Key (LOVABLE or OPENAI) not configured')

    const niche = strategyContext?.niche || profile?.nicho || 'Saúde/Nutrição';
    const persona = strategyContext?.persona || profile?.persona || 'Mulheres 30-55 anos que buscam saúde e qualidade de vida';
    const voice = tone || strategyContext?.brandVoice || profile?.tom_voz || 'Profissional e acolhedor';
    const brandColors = profile?.primary_color ? `Cores: ${profile.primary_color}, ${profile.secondary_color}` : '';
    const brandFonts = profile?.font_heading ? `Fontes: ${profile.font_heading}, ${profile.font_body}` : '';
    const productsList = products?.length ? products.map((p: any) => `- ${p.nome}: ${p.descricao || ''} (R$${p.preco || ''})`).join('\n') : 'Não definidos';

    // ── MODO REFINAMENTO ──
    if (mode === 'shorter' || mode === 'punchy' || mode === 'professional') {
      const refinePrompt = `
Você é um copywriter de elite especializado em nutrição e saúde feminina.
Refine o seguinte texto: "${currentText}"

OBJETIVO: ${mode === 'shorter' ? 'Encurtar mantendo impacto. Máximo 15 palavras.' : mode === 'punchy' ? 'Tornar visceral, direto, impossível de ignorar. Use linguagem que provoca ação.' : 'Tornar elegante, técnico e com autoridade científica.'}

REGRAS:
1. Nicho: "${niche}" | Persona: "${persona}"
2. Tom: "${voice}"
3. Retorne APENAS o texto refinado, sem aspas ou explicações.
4. Para slides, o texto deve ser CURTO e de alto impacto visual.
5. Use uma das técnicas: metáfora, paradoxo, contraste, pergunta retórica ou dado impactante.
`;

      const isLovableKey = !!Deno.env.get('LOVABLE_API_KEY');
      const apiUrl = isLovableKey
        ? 'https://ai.gateway.lovable.dev/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';
      const model = isLovableKey ? 'google/gemini-3-flash-preview' : 'gpt-4o-mini';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'Você é um copywriter de elite. Retorne APENAS o texto refinado.' },
            { role: 'user', content: refinePrompt }
          ],
          temperature: 0.7,
        }),
      });

      const rawText = await response.text();
      if (!response.ok) throw new Error(`API error ${response.status}: ${rawText.substring(0, 200)}`);
      const data = JSON.parse(rawText);
      const content = data.choices[0].message.content.trim();

      return new Response(JSON.stringify({ text: content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── CONFIGURAÇÃO DE FUNIL ──
    const FUNNEL_CONFIG: Record<string, { objetivo: string; cta: string; mecanismo: string }> = {
      ALCANCE: {
        objetivo: 'Atrair novos seguidores com conteúdo viral e compartilhável',
        cta: 'Salve este post | Compartilhe com uma amiga | Me siga para mais',
        mecanismo: 'Conteúdo de topo de funil que gera curiosidade e identificação rápida'
      },
      EVENTOS_DOR: {
        objetivo: 'Gerar engajamento profundo tocando em dores reais e criando desejo',
        cta: 'Comente [PALAVRA-CHAVE] para receber | Responda nos Stories',
        mecanismo: 'Levantada de mão: o seguidor se identifica com a dor e pede ajuda'
      },
      PRINCIPIOS_VALORES: {
        objetivo: 'Doutrinar e criar conexão profunda com seus valores e método',
        cta: 'Link na bio | Agende sua consulta | Conheça o método',
        mecanismo: 'Conteúdo de fundo de funil que posiciona como a única solução'
      },
      VENDA_DIRETA: {
        objetivo: 'Converter seguidores em clientes com oferta clara',
        cta: 'Comente [PALAVRA] e receba o link | Clique no link da bio | Envie DM',
        mecanismo: 'Oferta irresistível com prova social e escassez real'
      }
    };

    // ── TIPOS DE POST ESTRATÉGICOS ──
    const POST_TYPES: Record<string, string> = {
      STORYTELLING_RESULTADO: `STORYTELLING DE RESULTADO: Conte a história de transformação de uma paciente/cliente.
        Estrutura: Situação anterior (dor) → O que tentou antes → O momento da virada → O resultado alcançado → A lição/método por trás.
        Use DIÁLOGO simulado e IMERSÃO SENSORIAL para tornar real.`,

      CONTRA_INTUITIVO: `CONTRA-INTUITIVO: Quebre uma crença popular do nicho com um fato surpreendente.
        Estrutura: Afirmação chocante (headline) → Por que todos acreditam no contrário → A verdade por trás → Prova/dado → Convite para repensar.
        Use PARADOXO e PLOT TWIST como elementos narrativos.`,

      QUEBRA_OBJECAO: `QUEBRA DE OBJEÇÃO: Destrua a principal desculpa que impede a pessoa de agir.
        Estrutura: A objeção em formato de fala ("Não tenho tempo para...") → Validação empática → Reformulação da crença → Exemplo prático → Novo caminho.
        Use ANTAGONISMO (a crença limitante é o inimigo) e ANALOGIA.`,

      LISTA_AUTORIDADE: `LISTA DE AUTORIDADE: Entregue valor denso em formato de lista numerada.
        Estrutura: Promessa no título (ex: "5 sinais de que seu intestino precisa de atenção") → Itens com mini-explicação → Conexão com seu método → CTA.
        Use EXAGERO INTENCIONAL nos títulos e EUFEMISMO na solução.`,

      COMPARATIVO_ELITE: `COMPARATIVO DE ELITE: Compare dois caminhos — o comum vs. o ideal.
        Estrutura: "A maioria faz X" vs "Quem tem resultado faz Y" → Detalhe as diferenças → Mostre as consequências de cada caminho → Posicione seu método como o caminho Y.
        Use ESTÍMULOS OPOSTOS e IRONIA.`,

      ANTES_DEPOIS_CONCEITUAL: `ANTES E DEPOIS CONCEITUAL: Mostre a transformação sem antes/depois de corpo.
        Estrutura: "Antes" (mindset, hábitos, crenças antigas) → "Depois" (novos hábitos, resultados, qualidade de vida) → O que mudou entre os dois pontos → Seu método como ponte.
        Use CONFLITO entre os dois estados e SIMBOLISMO.`,

      CTA_DIRETO: `CTA DIRETO / OFERTA: Post focado em conversão com oferta clara.
        Estrutura: Dor urgente (headline) → Por que agora é o momento → O que você entrega → Prova social rápida → CTA direto e claro.
        Use SUSPENSE nos primeiros slides e JORNADA DO HERÓI simplificada.`,

      MITO_VS_VERDADE: `MITO VS VERDADE: Desmistifique informações erradas do nicho.
        Estrutura: "Mito" apresentado como verdade popular → Explicação de por que é errado → A verdade científica/prática → Como aplicar corretamente.
        Use SARCASMO sutil, SETUP E PUNCHLINE.`,

      ROTINA_PRATICA: `ROTINA PRÁTICA: Mostre como aplicar algo no dia a dia da paciente.
        Estrutura: O desafio real (ex: "Trabalha 10h por dia e não sabe o que comer") → Solução prática → Passo a passo visual → Resultado esperado.
        Use CRÔNICA e EXPERIÊNCIA PESSOAL.`
    };

    // ── ELEMENTOS NARRATIVOS (Playbook de Escrita) ──
    const NARRATIVE_ELEMENTS: Record<string, string> = {
      metafora: 'METÁFORA: Compare conceitos do nicho com imagens do cotidiano para tornar palpável (ex: "Seu intestino é como um jardim")',
      analogia: 'ANALOGIA: Conecte algo complexo a algo simples que a pessoa já entende (ex: "Cuidar dos hormônios é como afinar um instrumento")',
      plot_twist: 'PLOT TWIST: Surpreenda com uma reviravolta na narrativa que muda a perspectiva sobre o tema',
      conflito: 'CONFLITO: Apresente um embate entre o que a pessoa acredita e o que realmente funciona',
      paradoxo: 'PARADOXO: Use contradições aparentes para gerar curiosidade (ex: "Comer mais para emagrecer")',
      experiencia_pessoal: 'EXPERIÊNCIA PESSOAL: Incorpore vivências reais para criar autenticidade e conexão emocional',
      suspense: 'SUSPENSE: Revele informações aos poucos, mantendo curiosidade até o final do carrossel',
      ironia: 'IRONIA: Use de forma sutil para destacar absurdos nos hábitos comuns',
      dialogo: 'DIÁLOGO: Simule conversas reais entre profissional e paciente para gerar identificação',
      jornada_heroi: 'JORNADA DO HERÓI: Leve a pessoa do problema à solução seguindo a estrutura clássica de transformação',
    };

    const selectedFunnel = FUNNEL_CONFIG[funnelStage || 'EVENTOS_DOR'];
    const selectedPostType = POST_TYPES[postType || 'LISTA_AUTORIDADE'] || POST_TYPES['LISTA_AUTORIDADE'];
    const selectedNarrative = narrativeElement && narrativeElement !== 'auto' && NARRATIVE_ELEMENTS[narrativeElement]
      ? NARRATIVE_ELEMENTS[narrativeElement]
      : 'Escolha automaticamente o melhor elemento narrativo entre: metáfora, analogia, plot twist, conflito, paradoxo, experiência pessoal, suspense, ironia, diálogo ou jornada do herói — o que for mais impactante para o tema.';

    // ── CTA STYLES ──
    const CTA_STYLES: Record<string, string> = {
      PALAVRA_CHAVE: 'Peça para a pessoa comentar uma palavra específica relacionada ao tema (ex: "Comente PROTOCOLO"). Isso ativa automação de DM e gera engajamento.',
      LINK_BIO: 'Direcione para o link na bio com urgência (ex: "O link está na bio. Mas corre, são poucas vagas.").',
      DM: 'Peça para enviar DM direta (ex: "Me manda um DM com \'quero\' que eu te explico tudo").',
      SALVAR_COMPARTILHAR: 'Peça para salvar, compartilhar ou marcar amiga (ex: "Salva esse post e manda pra aquela amiga que precisa ouvir isso").',
      LEVANTADA_MAO: 'Use enquete, figurinha ou botão nos Stories para identificar leads quentes. No post, gere desejo e direcione para os Stories.',
    };

    const selectedCta = ctaStyle && CTA_STYLES[ctaStyle]
      ? CTA_STYLES[ctaStyle]
      : 'Escolha o CTA mais adequado ao objetivo e funil.';

    // ── PROMPT PRINCIPAL (MÉTODO ISCAA) ──
    const prompt = `
Você é um Estrategista de Conteúdo de Elite para profissionais de Nutrição.
Sua missão: criar um carrossel de Instagram de ALTO IMPACTO sobre: "${topic}"

═══ CONTEXTO DA PROFISSIONAL ═══
- Nicho: ${niche}
- Persona/público-alvo: ${persona}
- Tom de voz: ${voice}
- Produtos/Serviços:
${productsList}
${brandColors ? `- ${brandColors}` : ''}
${brandFonts ? `- ${brandFonts}` : ''}
${customInstructions ? `- Instruções extras: ${customInstructions}` : ''}

═══ ESTRATÉGIA DO FUNIL ═══
Estágio: ${funnelStage || 'EVENTOS_DOR'}
- Objetivo: ${selectedFunnel.objetivo}
- Mecanismo: ${selectedFunnel.mecanismo}
- Modelo de CTA: ${selectedFunnel.cta}

═══ TIPO DE POST ═══
${selectedPostType}

═══ ELEMENTO NARRATIVO ═══
${selectedNarrative}

═══ ESTRATÉGIA DE CTA ═══
${selectedCta}

${contentFormat === 'single_post' ? `
═══ FORMATO: POST ÚNICO (1 imagem + legenda) ═══
- Gere APENAS 1 slide que deve funcionar sozinho.
- O slide deve ter: headline impactante (máx 10 palavras), subtexto (máx 20 palavras), e destaque/CTA.
- Layout: "capa" (sempre).
- A legenda deve contar a história completa: HOOK → CORPO (3-6 parágrafos curtos) → CTA → HASHTAGS.
- Use o método ISCAA condensado na legenda.
- cta_stories: sugira 3-4 Stories para amplificar o post.

═══ RESPOSTA — APENAS JSON VÁLIDO (sem markdown) ═══
{
  "titulo": "Título interno",
  "slides": [
    {
      "numero": 1, "tipo": "unico", "layout": "capa",
      "headline": "Frase de impacto máximo",
      "subtexto": "Complemento",
      "destaque": "CTA visual 3-6 palavras"
    }
  ],
  "legenda": "Copy completa com HOOK + corpo + CTA + hashtags",
  "cta_stories": "Sugestão de Stories"
}`

: contentFormat === 'stories' ? `
═══ FORMATO: SEQUÊNCIA DE STORIES (5-7 stories) ═══
Gere uma sequência estratégica de Stories que leva o seguidor do gancho até a ação.

ESTRUTURA:
- Story 1 (layout "capa"): GANCHO — enquete, pergunta ou afirmação chocante para capturar atenção
- Story 2-3 (layout "topicos"): CONTEÚDO — entregue valor rápido, educação ou revelação
- Story 4-5 (layout "topicos"): CONEXÃO — mostre empatia, bastidores ou exemplo prático
- Story 6 (layout "topicos"): AUTORIDADE — prova social, resultado ou dado
- Story 7 (layout "cta"): AÇÃO — CTA direto (link, DM, palavra-chave, caixinha)

REGRAS PARA STORIES:
1. Cada story = 1 tela vertical (9:16). Textos BEM CURTOS (máx 3-4 linhas).
2. Headline: máximo 8 palavras. Subtexto: máximo 15 palavras.
3. Sugira elementos interativos no campo "destaque": ENQUETE, CAIXINHA, QUIZ, SLIDER, LINK, ou NENHUM.
4. A legenda é a descrição interna da sequência (não vai para o Instagram).
5. cta_stories não se aplica aqui, coloque um resumo da estratégia.

═══ RESPOSTA — APENAS JSON VÁLIDO (sem markdown) ═══
{
  "titulo": "Título interno da sequência",
  "slides": [
    {
      "numero": 1, "tipo": "story", "layout": "capa",
      "headline": "Texto principal curto",
      "subtexto": "Complemento",
      "destaque": "ENQUETE: Opção A / Opção B"
    }
  ],
  "legenda": "Descrição interna da estratégia de Stories",
  "cta_stories": "Resumo: o que essa sequência de Stories busca alcançar"
}`

: contentFormat === 'reels_script' ? `
═══ FORMATO: ROTEIRO DE REELS / VÍDEO (30-60 segundos) ═══
Gere um roteiro profissional para vídeo/Reels.

ESTRUTURA DO ROTEIRO (cada "slide" = uma seção do vídeo):
- Slide 1 (layout "capa"): GANCHO (0-3s) — headline = texto na tela, subtexto = o que falar, destaque = tipo de abertura (ex: "TALKING HEAD" ou "VOZ OFF + IMAGEM")
- Slide 2-3 (layout "topicos"): DESENVOLVIMENTO — headline = texto na tela, subtexto = script falado, destaque = indicação de corte/transição
- Slide 4 (layout "topicos"): PONTO DE VIRADA — headline = texto na tela impactante, subtexto = script falado, destaque = efeito/transição
- Slide 5 (layout "cta"): FECHAMENTO + CTA — headline = CTA na tela, subtexto = script falado, destaque = sugestão de áudio/trend

REGRAS PARA ROTEIRO:
1. O campo "headline" = TEXTO QUE APARECE NA TELA durante aquele trecho.
2. O campo "subtexto" = O QUE A PESSOA FALA (script narrado).
3. O campo "destaque" = INDICAÇÕES TÉCNICAS (corte, transição, áudio, efeito).
4. Duração total: 30-60 segundos. Gancho nos primeiros 3 segundos.
5. Script conversacional, natural, como se estivesse falando com uma amiga.
6. A legenda é a do Reels: HOOK + 1-2 frases + CTA + HASHTAGS.
7. cta_stories: sugira como amplificar o Reels nos Stories.

═══ RESPOSTA — APENAS JSON VÁLIDO (sem markdown) ═══
{
  "titulo": "Título interno do roteiro",
  "slides": [
    {
      "numero": 1, "tipo": "gancho", "layout": "capa",
      "headline": "Texto na tela (curto)",
      "subtexto": "Script falado neste trecho",
      "destaque": "TALKING HEAD | Corte rápido"
    }
  ],
  "legenda": "Legenda do Reels com hook + CTA + hashtags",
  "cta_stories": "Como amplificar nos Stories"
}`

: `
═══ MÉTODO ISCAA — ESTRUTURA OBRIGATÓRIA DOS SLIDES ═══

** I — INFORMAÇÃO (Slides 1-2) — HOOK + CONTEXTO **
   - Slide 1 (CAPA): Headline IMPOSSÍVEL de ignorar. Máximo 8-12 palavras.
     Toque na DOR mais profunda ou faça uma PROMESSA ousada.
     Técnicas: pergunta provocativa, afirmação contraintuitiva, dado chocante.
   - Slide 2: Aprofunde o gancho. Explique "por que isso importa AGORA".

** S — SOLUÇÃO (Slides 3-5) — VALOR + MÉTODO **
   - Entregue valor REAL e quebre o padrão de pensamento.
   - Apresente a solução conectada ao método/diferencial da profissional.
   - Cada slide: UMA ideia principal, texto CURTO e impactante.

** C — CONEXÃO (Slides 6-7) — EMPATIA + IDENTIFICAÇÃO **
   - Mostre que entende a ROTINA e DESAFIOS da persona.
   - Histórias ou exemplos práticos do cotidiano que geram identificação.

** A — AUTORIDADE (Slide 8) — PROVA + CREDIBILIDADE **
   - Provas sociais: resultados de pacientes, depoimentos, dados.

** A — AÇÃO (Slides 9-10) — CTA + FECHAMENTO **
   - CTA claro, direto e ÚNICO.
   - Crie URGÊNCIA sem ser apelativo.

═══ REGRAS DE COPY (NEUROMARKETING + NEUROVENDAS) ═══
1. GANCHO em 3 segundos no slide 1 — pattern interrupt, contradição, número específico ou pergunta provocativa. Se falhar aqui, o resto não importa.
2. EFEITO ZEIGARNIK: cada slide entrega 1 micro-recompensa E abre um loop para o próximo ("mas tem um detalhe...", "e o pior vem agora...", "isso muda no slide 5"). NUNCA entregue tudo de uma vez.
3. UMA ideia por slide. Carga cognitiva baixa = retenção alta.
4. Frases curtas (máx 12 palavras). Quebra de linha com ritmo.
5. Linguagem SENSORIAL e CONCRETA (cérebro processa imagem, não abstração). Ex: "barriga inchada após o almoço" > "desconforto digestivo".
6. Storytelling em 1ª pessoa sempre que possível (neurônios-espelho ativam empatia).
7. Aversão à perda > promessa de ganho. "O que você está perdendo ao..." converte mais que "ganhe...".
8. Ancoragem por contraste: situação atual (dor) x desejada (transformação).
9. Destaque palavras-emoção em **negrito**: medo, alívio, descoberta, finalmente, segredo, errado, verdade.
10. Headline máx 12 palavras, subtexto máx 25. Máx 1-2 emojis funcionais por slide.
11. Layouts: "capa" (slide 1), "topicos" (2-8), "cta" (9-10).
12. Legenda COMPLEMENTA (não repete). Use AIDA condensado + 5-10 hashtags.
13. CTA único, comando direto + benefício imediato + baixo atrito ("Comenta X e te mando Y agora").
14. cta_stories: 3-5 Stories que abrem novo loop apontando para o post.

═══ RESPOSTA — APENAS JSON VÁLIDO (sem markdown) ═══
{
  "titulo": "Título interno",
  "slides": [
    {
      "numero": 1, "tipo": "informacao", "layout": "capa",
      "headline": "Texto principal curto e impactante",
      "subtexto": "Complemento ou curiosidade",
      "destaque": "Frase destaque 3-6 palavras"
    }
  ],
  "legenda": "Copy completa com hashtags",
  "cta_stories": "Sequência sugerida de Stories"
}`}
`;

    const isLovableKey = !!Deno.env.get('LOVABLE_API_KEY');
    const apiUrl = isLovableKey
      ? 'https://ai.gateway.lovable.dev/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';
    const model = isLovableKey ? 'google/gemini-2.0-flash-exp' : 'gpt-4o-mini';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'Você é um estrategista de conteúdo de elite para nutricionistas. Domina copywriting persuasivo, marketing no Instagram e técnicas narrativas avançadas. SEMPRE responda em JSON válido quando solicitado. NUNCA inclua markdown como ```json — apenas o JSON puro.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.75,
      }),
    });

    const rawText = await response.text();
    if (!response.ok) throw new Error(`API error ${response.status}: ${rawText.substring(0, 200)}`);

    const data = JSON.parse(rawText);
    const content = data.choices[0].message.content.trim();

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Resposta da IA não contém JSON válido");
    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.titulo || !parsed.slides || !Array.isArray(parsed.slides) || parsed.slides.length < 3) {
      throw new Error("Resposta da IA incompleta ou malformada");
    }

    // Garantir estrutura de todos os slides
    parsed.slides = parsed.slides.map((slide: any, i: number) => ({
      ...slide,
      numero: i + 1,
      layout: slide.layout || (i === 0 ? 'capa' : i >= parsed.slides.length - 2 ? 'cta' : 'topicos'),
      headline: slide.headline || '',
      subtexto: slide.subtexto || '',
    }));

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
