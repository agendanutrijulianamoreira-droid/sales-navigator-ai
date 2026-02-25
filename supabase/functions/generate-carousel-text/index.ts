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
        const { topic, tone, format, mode, currentText, strategyContext } = await req.json()

        // Pegar a chave das variáveis de ambiente do Supabase
        const openAiKey = Deno.env.get('OPENAI_API_KEY')
        if (!openAiKey) throw new Error('OpenAI Key not configured')

        let prompt = "";

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
          Você é o Gerente de Social Media do "Brain Trust" de nutricionistas.
          Sua missão é criar um carrossel baseado na ESTRATÉGIA MESTRE do nutricionista.

          ESTRATÉGIA ATIVA (Siga isso à risca):
          - Persona: ${strategyContext?.persona || 'Nutrição Geral'}
          - Voz: ${strategyContext?.brandVoice || 'Profissional'}
          - Inimigo Comum: ${strategyContext?.commonEnemy || 'Desinformação'}
          - Promessa Principal (CTA): ${strategyContext?.promise || 'Consulta Personalizada'}
          - Objeções (Quebre estas dores): ${strategyContext?.objections || 'Falta de tempo'}

          TÓPICO DO POST: "${topic}"
          TOM DE VOZ: ${tone || strategyContext?.brandVoice || 'Profissional'}.
          FORMATO: ${format || 'Educativo'}.
          
          DIRETRIZES:
          1. O conteúdo deve ser 100% alinhado com a Persona acima.
          2. Use o tom de voz definido. Fuja do óbvio.
          3. No slide de CTA, use a Promessa Principal do nutricionista.

          Retorne APENAS um JSON válido no formato:
          {
            "titulo": "...",
            "slides": [
              {"numero": 1, "tipo": "CAPA", "headline": "...", "subtexto": "...", "destaque": "..."},
              {"numero": 2, "tipo": "CONTEUDO", "headline": "...", "subtexto": "...", "destaque": "..."}
            ],
            "legenda": "...",
            "cta_stories": "..."
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

        const jsonStr = content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1)

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
