import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

serve(async (req) => {
        if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

        try {
                const { nicheInput } = await req.json()
                if (!nicheInput) throw new Error('Nicho não informado')

                const apiKey = Deno.env.get('LOVABLE_API_KEY') || Deno.env.get('OPENAI_API_KEY')
                if (!apiKey) throw new Error('API Key (LOVABLE or OPENAI) not configured')

                const prompt = `
      Você é o "MAESTRO", o mentor estratégico mais caro do mercado para nutricionistas. 
      Sua especialidade é criar o "Brand Hub & Business Lab" para profissionais que querem sair do amadorismo e aplicar o "Funil Infinito".

      CONTEXTO DO USUÁRIO: "${nicheInput}"

      SUA MISSÃO: Gerar uma estratégia de elite EXATAMENTE neste nível de profundidade e estrutura:

      DIRETRIZES DE OURO:
      1. NUNCA use termos genéricos como "ter mais saúde" ou "comer melhor". Use "intestino previsível", "redução de inchaço inflamatório", "clareza mental", "biologia sob controle".
      2. FOCO CLÍNICO + ROTINA: Misture sintomas clínicos (ex: resistência à insulina, ferritina, acne tardia) com dores de rotina (ex: empreendedora sem tempo, mãe cansada).
      3. OBJEÇÕES REAIS: Não foque apenas em "dinheiro". Foque em "medo de falhar de novo", "medo de dieta engessada", "medo de nutrição não resolver caso médico complexo".

      Gere um perfil estratégico em JSON com os campos:
      - targetAudience: Nome magnético e específico para o segmento.
      - subNiche: O ângulo clínico ou situacional específico.
      - persona: Descrição detalhada da mulher real e seu conflito de rotina.
      - mainPain: Dor aguda que a impede de dormir.
      - mainDesire: O resultado aspiracional final menos o sacrifício.
      - promises: Lista com exatamente 3 opções de Promessas Fortes (USPs) com prazo ou mecanismo (ex: "Em 90 dias...", "Através do Protocolo X...").
      - commonEnemy: O que você combate (ex: Indústria de suplementos inúteis, dietas de gaveta).
      - objections: Lista de 3 maiores travas mentais específicas.
      - brandVoice: "O Mentor [Adjetivo] + [Adjetivo]".
      - maestroVerdict: Conselho direto, tático e motivador do mentor sobre este nicho. "Tapa na cara" necessário.
      - productLadder: { "tripwire": string, "coreOffer": string, "highTicket": string }.

      Responda APENAS o JSON. Sem explicações antes ou depois. Sem markdown.`

                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                                'Authorization': `Bearer ${apiKey}`,
                                'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                                model: 'gpt-4o',
                                messages: [
                                        { role: 'system', content: 'Você é o Maestro, mentor estrategista de elite. Responda apenas em JSON.' },
                                        { role: 'user', content: prompt }
                                ],
                                temperature: 0.7,
                        }),
                })

                const rawText = await response.text()
                if (!response.ok) throw new Error(`API error ${response.status}: ${rawText.substring(0, 200)}`)

                const data = JSON.parse(rawText)
                const content = data.choices[0].message.content

                const jsonMatch = content.match(/\{[\s\S]*\}/)
                if (!jsonMatch) throw new Error("Resposta da IA não contém JSON válido")
                const parsed = JSON.parse(jsonMatch[0])

                return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

        } catch (error: unknown) {
                const message = error instanceof Error ? error.message : "Erro desconhecido"
                return new Response(JSON.stringify({ error: message }), {
                        status: 500,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                })
        }
})
