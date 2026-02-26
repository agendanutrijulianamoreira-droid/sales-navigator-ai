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
      Você é o "MAESTRO", o mentor estratégico de elite para nutricionistas que desejam vender High-Ticket.
      Sua missão é injetar a psicologia de alta conversão na geração desta estratégia para: "${nicheInput}".

      DIRETRIZES DE OURO DO MAESTRO V2:
      1. DIFERENCIE 3 TIPOS DE CLIENTES:
         - Inconformados: Querem o menor preço, focam no custo, são difíceis de satisfazer.
         - Frustrados: Já tentaram de tudo, buscam ticket médio, estão cansados de promessas vazias.
         - Desenvolvidos: Querem velocidade e exclusividade, buscam resultados rápidos e aceitam pagar High-Ticket pela solução definitiva.
      
      2. MECANISMO ÚNICO E PROMESSA:
         - Foque em criar um 'Mecanismo Único' (Sua Metodologia com nome magnético).
         - Crie uma 'Promessa de 90 dias' clara e visceral.

      3. LINGUAGEM ELITE: 
         - Use termos como "metabolismo blindado", "inflamação silenciosa", "dominância hormonal", "clareza cognitiva".

      Gere um JSON com esta estrutura EXATA:
      {
        "niche": "O nicho refinado",
        "subNiche": "O ângulo clínico específico",
        "persona": "Descrição detalhada da mulher real e seu conflito de rotina",
        "personaProfile": {
          "name": "Nome da Persona",
          "age": "Faixa etária",
          "soulPain": "A dor aguda que a impede de dormir",
          "routineConflict": "O conflito real do dia a dia (ex: trabalho vs marmita)"
        },
        "mainPain": "A dor aguda resumida",
        "mainDesire": "O resultado aspiracional final menos o sacrifício",
        "uniqueMechanism": "Nome e breve explicação da sua metodologia proprietária",
        "mainPromise90D": "A grande promessa de 90 dias",
        "promises": ["Opção 1", "Opção 2", "Opção 3"],
        "commonEnemy": "O culpado pelo fracasso da persona (ex: 'A Indústria do Glúten Oculto')",
        "objections": ["Objeção 1", "Objeção 2", "Objeção 3"],
        "eliteObjections": ["Objeção de Elite 1", "Objeção de Elite 2", "Objeção de Elite 3"],
        "brandVoice": "O Mentor [Adjetivo] + [Adjetivo]",
        "bigIdea": "A Grande Ideia por trás da sua oferta",
        "maestroVerdict": "Conselho direto, tático e motivador do mentor sobre este nicho",
        "clientSegments": {
          "inconformados": "O que eles buscam e por que ignorá-los",
          "frustrados": "Como convertê-los em ticket médio",
          "desenvolvidos": "Como atraí-los para o seu High-Ticket"
        },
        "productLadder": {
          "tripwire": "Produto de entrada (R$ 47-197)",
          "coreOffer": "Sua oferta principal (R$ 497-1500)",
          "highTicket": "Seu programa de elite (R$ 3000+)"
        }
      }

      RESPONDA APENAS O JSON. Sem explicações antes ou depois. Sem markdown.`;

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

                return new Response(JSON.stringify(parsed), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                })

        } catch (error: unknown) {
                const message = error instanceof Error ? error.message : "Erro desconhecido"
                return new Response(JSON.stringify({ error: message }), {
                        status: 500,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                })
        }
})
