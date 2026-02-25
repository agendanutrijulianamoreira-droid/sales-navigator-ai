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

                const openAiKey = Deno.env.get('OPENAI_API_KEY')
                if (!openAiKey) throw new Error('OPENAI_API_KEY not configured')

                const systemPrompt = `Você é o MAESTRO — um mentor estratégico de elite, especializado em posicionamento de marca para nutricionistas que buscam o próximo nível de autoridade e lucro.

Seu framework segue a METODOLOGIA DE ELITE: foco visceral no Público Alvo, identificação do Problema Agudo (Dores da Alma), definição de um Mecanismo Único de Resolução e entrega de uma Promessa de 90 dias inegociável.

Suas diretrizes inegociáveis:
- Você opera no nível "Elite Clínica". Nunca use termos genéricos como "saúde", "bem-estar" ou "qualidade de vida". Prefira termos de impacto clínico e emocional como "inflamação subclínica", "fadiga adrenal", "resistência metabólica", "desregulação hormonal".
- O público-alvo padrão é sempre a MULHER EMPREENDEDORA / PROFISSIONAL MODERNA (30-50 anos) — a menos que o nicho do usuário indique outro perfil.
- Mecanismo Único: Você deve explicar a resolução do problema através de "Sua Metodologia de Elite", nunca cite nomes de métodos externos por direitos autorais.
- Suas respostas devem ter a profundidade de uma consultoria de R$15.000, não de um post de Instagram.
- Seja direto, provocador e estratégico. Sem floreios. Sem genericidades.`

                const userPrompt = `O nutricionista tem o seguinte foco/nicho: "${nicheInput}".

Gere um perfil estratégico PROFUNDO seguindo a Metodologia de Elite em JSON (sem markdown, sem crases) com EXATAMENTE esta estrutura:

{
  "targetAudience": "Nome magnético e específico para o segmento",
  "niche": "O nicho principal consolidado",
  "subNiche": "O sub-nicho específico para máxima autoridade",
  "persona": "Nome magnético para a persona (ex: 'A Executiva Inflamada') e descrição visceral de suas Dores da Alma (problemas agudos)",
  "mainPain": "A dor mais profunda e visceral que a persona sente hoje (conflito interno)",
  "mainDesire": "O desejo de identidade e status que ela busca alcançar",
  "promises": [
    "Opção 1: Promessa impactante com prazo (ex: 21 dias)",
    "Opção 2: Promessa impactante com prazo (ex: 45 dias)",
    "Opção 3: Promessa impactante com prazo (ex: 90 dias)"
  ],
  "commonEnemy": "O vilão narrativo (ex: a indústria dos ultraprocessados, a ditadura da restrição)",
  "objections": [
    "Objeção específica 1 (ex: 'meu caso é médico')",
    "Objeção específica 2 (ex: 'já tentei de tudo')",
    "Objeção específica 3 (ex: 'não tenho tempo para cozinhar')"
  ],
  "brandVoice": "O Mentor [Adjetivo] + [Adjetivo]",
  "maestroVerdict": "Um veredito direto e provocador no estilo mentoria de elite. Sem rodeios.",
  "productLadder": { "tripwire": "Oferta de entrada", "coreOffer": "Oferta principal", "highTicket": "Oferta de alto ticket" }
}

Responda APENAS o JSON. Sem explicações antes ou depois.`

                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                                'Authorization': `Bearer ${openAiKey}`,
                                'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                                model: 'gpt-4o',
                                messages: [
                                        { role: 'system', content: systemPrompt },
                                        { role: 'user', content: userPrompt }
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
