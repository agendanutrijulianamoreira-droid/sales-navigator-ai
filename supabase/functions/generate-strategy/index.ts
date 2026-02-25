import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const { nicheInput } = await req.json()

        // Validar input
        if (!nicheInput) throw new Error('Nicho não informado')

        const openAiKey = Deno.env.get('OPENAI_API_KEY')
        if (!openAiKey) throw new Error('OpenAI Key not configured')

        const prompt = `
      Atue como um estrategista de marca sênior para nutricionistas.
      O usuário é um nutricionista com o seguinte foco: "${nicheInput}".
      
      Gere um perfil estratégico completo em JSON (sem markdown) com os campos:
      - targetAudience: Nome criativo para o público (ex: "Mães Atletas").
      - painPoints: Lista de 3 dores profundas/agudas desse público.
      - desires: Lista de 3 sonhos/desejos desse público.
      - objections: Lista de 2 objeções comuns à compra da consulta.
      - brandVoice: Sugestão de tom de voz (ex: "Empático e Científico").
      - bigIdea: Uma frase de posicionamento único.
      
      Responda APENAS o JSON.
    `

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openAiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'system', content: 'Você é um estrategista de marca sênior para nutricionistas.' }, { role: 'user', content: prompt }],
                temperature: 0.7,
            }),
        })

        const data = await response.json()
        if (data.error) throw new Error(data.error.message || "Erro na OpenAI")

        const content = data.choices[0].message.content
        // Limpeza básica caso a IA mande ```json ... ```
        const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim()

        return new Response(jsonStr, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
