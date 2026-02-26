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
      postType, contentPillar, customInstructions, profile, products
    } = await req.json()

    const apiKey = Deno.env.get('LOVABLE_API_KEY') || Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) throw new Error('API Key (LOVABLE or OPENAI) not configured')

    const niche = strategyContext?.niche || profile?.nicho || 'Saúde/Nutrição';
    const persona = strategyContext?.persona || 'Público Geral';
    const voice = tone || strategyContext?.brandVoice || 'Profissional';
    const brandColors = profile?.primary_color ? `Cores: ${profile.primary_color}, ${profile.secondary_color}` : '';
    const brandFonts = profile?.font_heading ? `Fontes: ${profile.font_heading}, ${profile.font_body}` : '';

    let prompt = '';
    if (mode === 'shorter' || mode === 'punchy' || mode === 'professional') {
      prompt = `
          Você é um redator publicitário de elite para nutricionistas.
          Sua tarefa é refinar o seguinte texto: "${currentText}"
          
          OBJETIVO: ${mode === 'shorter' ? 'Encurtar o texto mantendo o sentido central.' : mode === 'punchy' ? 'Tornar o texto extremamente impactante, visceral e persuasivo.' : 'Tornar o texto mais profissional, elegante e técnico.'}
          
          REGRAS:
          1. Considere que o nicho é "${niche}" e a persona é "${persona}".
          2. O tom deve ser "${voice}".
          3. Retorne APENAS o texto refinado, sem aspas, explicações ou introduções.
          4. Se for encurtar, seja direto ao ponto.
          5. Mantenha a essência estratégica.
        `;
    } else {
      prompt = `
          Você é um Estrategista de Conteúdo de Elite especializado em Marketing para Nutricionistas.
          Sua missão é criar um carrossel de alto impacto e conversão sobre: "${topic}".
          
          ESTRATÉGIA ATIVA (Siga isso à risca):
          - Persona: ${persona}
          - Voz: ${voice}
          - Inimigo Comum: ${strategyContext?.commonEnemy || 'Desinformação'}
          - Promessa Principal (CTA): ${strategyContext?.promise || 'Consulta Personalizada'}
          - Objeções (Quebre estas dores): ${strategyContext?.objections || 'Falta de tempo'}

          ESTRATÉGIA DO POST:
          - Tipo: ${postType || format || 'Educativo'} (os tipos elite são: Storytelling de Resultado, Contra-intuitivo, Quebra de Objeção, Lista de Autoridade, Comparativo de Elite, Antes e Depois Conceitual, CTA Direto)
          - Pilar: ${contentPillar || 'Autoridade'}
          - Público: Pacientes/Clientes de Nutrição no nicho "${niche}"
          
          REGRAS DE OURO:
          1. O conteúdo deve ser 100% alinhado com a Persona acima.
          2. Use uma linguagem visceral e persuasiva.
          3. Foque em transformar a autoridade do nutricionista em solução desejada.
          4. Cada slide DEVE ter um campo "layout" que pode ser: "capa", "topicos" ou "cta".
          5. Limite o texto para ser legível em dispositivos móveis.
          6. No slide de CTA, use a Promessa Principal do nutricionista.
          7. ${mode === 'shorter' ? 'Resuma o conteúdo mantendo a essência.' : ''}
          8. ${mode === 'punchy' ? 'Torne-o extremamente impactante e use emojis estrategicamente.' : ''}
          9. ${customInstructions || ''}

          IDENTIDADE VISUAL (Siga estas diretrizes de copy):
          - ${brandColors}
          - ${brandFonts}

          RETORNE APENAS UM JSON VÁLIDO NO FORMATO:
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
              ... slides seguintes ...
            ],
            "legenda": "Copy completa da legenda",
            "cta_stories": "Sugestão de sequência de Stories"
          }
        `;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: 'Você é um estrategista de conteúdo para nutricionistas experiente em marketing no Instagram.' }, { role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    })

    const rawText = await response.text()
    if (!response.ok) throw new Error(`API error ${response.status}: ${rawText.substring(0, 200)}`)

    const data = JSON.parse(rawText)
    const content = data.choices[0].message.content.trim();

    if (mode === 'shorter' || mode === 'punchy' || mode === 'professional') {
      return new Response(JSON.stringify({ text: content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("Resposta da IA não contém JSON válido")
    const parsed = JSON.parse(jsonMatch[0])

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido"
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
