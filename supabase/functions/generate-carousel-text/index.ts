import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { topic, tone, format, mode, currentText, strategyContext, postType, contentPillar, customInstructions, profile, products } = await req.json()

    // Pegar a chave das variáveis de ambiente do Supabase
    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) throw new Error('OpenAI Key not configured')

    // System prompt context based on Profile Elite
    const niche = profile?.nicho || 'Saúde/Nutrição';
    const brandColors = profile?.primary_color ? `Cores: ${profile.primary_color}, ${profile.secondary_color}` : '';
    const brandFonts = profile?.font_heading ? `Fontes: ${profile.font_heading}, ${profile.font_body}` : '';

    let prompt = '';
    if (mode === 'shorter' || mode === 'punchy' || mode === 'professional') {
      // Reescrita Mágica
      prompt = `
          Atue como um estrategista de conteúdo para nutricionistas.
          Reescreva o seguinte texto para um slide de carrossel no Instagram.
          Modo: ${mode}.
          Texto original: "${currentText}".
          
          CONTEXTO DA MARCA (Opcional):
          - Persona: ${strategyContext?.persona || 'Público Geral'}
          - Tom de Voz: ${strategyContext?.brandVoice || 'Profissional'}
          
          Regras:
          - Se mode for 'shorter', resuma mantendo a essência.
          - Se mode for 'punchy', torne-o impactante e use emojis estrategicamente.
          - Se mode for 'professional', mantenha um tom autoritário e técnico.
          
          Retorne APENAS o texto reescrito.
        `;
    } else {
      // Geração Completa de Carrossel (Maestro v2 Strategy Injection)
      prompt = `
          Você é um Estrategista de Conteúdo de Elite especializado em Marketing para Nutricionistas.
          Sua missão é criar um carrossel de alto impacto e conversão sobre: "${topic}".
          
          ESTRATÉGIA ATIVA (Siga isso à risca):
          - Persona: ${strategyContext?.persona || 'Nutrição Geral'}
          - Voz: ${strategyContext?.brandVoice || 'Profissional'}
          - Inimigo Comum: ${strategyContext?.commonEnemy || 'Desinformação'}
          - Promessa Principal (CTA): ${strategyContext?.promise || 'Consulta Personalizada'}
          - Objeções (Quebre estas dores): ${strategyContext?.objections || 'Falta de tempo'}

          ESTRATÉGIA DO POST:
          - Tipo: ${postType || 'Educativo'} (os tipos elite são: Storytelling de Resultado, Contra-intuitivo, Quebra de Objeção, Lista de Autoridade, Comparativo de Elite, Antes e Depois Conceitual, CTA Direto)
          - Pilar: ${contentPillar || 'Autoridade'}
          - Público: Pacientes/Clientes de Nutrição no nicho "${niche}"
          
          REGRAS DE OURO:
          1. O conteúdo deve ser 100% alinhado com a Persona acima.
          2. Use uma linguagem visceral e persuasiva.
          3. Foque em transformar a autoridade do nutricionista em solução desejada.
          4. Cada slide DEVE ter um campo "layout" que pode ser: "capa", "topicos" ou "cta".
          5. Limite o texto para ser legível em dispositivos móveis.
          6. No slide de CTA, use a Promessa Principal do nutricionista.
          7. ${customInstructions || ''}

          IDENTIDADE VISUAL (Siga estas diretrizes de copy):
          - ${brandColors}
          - ${brandFonts}

          RETORNE UM JSON VÁLIDO:
          {
            "titulo": "Título Interno da Estratégia",
            "slides": [
              {
                "numero": 1,
                "layout": "capa",
                "headline": "Título da Capa Impactante",
                "subtexto": "Chamada de curiosidade",
                "destaque": "Frase curta de impacto"
              },
              {
                "numero": 2,
                "layout": "topicos",
                "headline": "Título do Slide de Conteúdo",
                "subtexto": "Item 1\\nItem 2\\nItem 3",
                "destaque": ""
              },
              {
                "numero": 3,
                "layout": "cta",
                "headline": "O Ponto de Virada",
                "subtexto": "Instrução clara para o próximo passo",
                "destaque": "CTA (ex: Comente 'EU QUERO')"
              }
            ],
            "legenda": "Copy completa da legenda (com blocos, hashtags e CTAs)",
            "cta_stories": "Sugestão de sequência de Stories para reforçar este post"
          }
        `;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: 'Você é um estrategista de conteúdo para nutricionistas experiente em marketing no Instagram.' }, { role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    })

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error.message || "Erro na OpenAI");
    }

    const content = data.choices[0].message.content.trim();

    // Se for reescrita, retorna texto puro, se for geração completa tenta extrair JSON
    if (mode) {
      return new Response(JSON.stringify({ text: content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("Resposta da IA não contém JSON válido")
    const jsonStr = jsonMatch[0]

    return new Response(jsonStr, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
