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
        if (!nicheInput) throw new Error('Nicho não informado')

        const openAiKey = Deno.env.get('OPENAI_API_KEY')
        // Se estiver no Lovable Cloud, ele pode injetar a chave automaticamente ou via secret

        const examples = `
  EXEMPLO DE QUALIDADE ESPERADA:
  Input: "Nutricionista para gestantes"
  Output: {
    "targetAudience": "Gestantes de Alta Performance (Carreiristas)",
    "painPoints": ["Medo de perder o cargo por 'brain fog' gestacional", "Insegurança com a mudança estética do corpo vs imagem profissional", "Falta de tempo para rotinas de autocuidado complexas"],
    "desires": ["Manter a clareza mental para decisões executivas", "Ter uma recuperação pós-parto 'atleta'", "Sentir-se no controle da biologia"],
    "objections": ["Acha que o acompanhamento vai tomar muito tempo", "Medo de restrições que afetem a produtividade"],
    "brandVoice": "O Mentor Científico e Provocador",
    "bigIdea": "O Protocolo Gestação Lucrativa: Como manter a clareza mental e a energia de execução enquanto nutre o desenvolvimento épico do seu bebê.",
    "maestroVerdict": "Seu nicho é ouro líquido. Gaste menos tempo falando de vitaminas e mais tempo falando de performance cognitiva. Essas mulheres não querem apenas um bebê saudável, elas querem o bebê saudável E a promoção no trabalho simultaneamente.",
    "productLadder": {
      "tripwire": "Guia de Nutrição Produtiva para o Primeiro Trimestre",
      "coreOffer": "Acompanhamento Gestação de Elite 40 Semanas",
      "highTicket": "Programa Mentoria VIP Pós-Parto Redux"
    }
  }
`;

        const prompt = `
          Você é o "Maestro", o Mentor Chefe do "Brain Trust" de uma elite de nutricionistas empresárias. 
          Sua especialidade é transformar nutricionistas clínicos em donos de negócios lucrativos através do framework "Funil Infinito".

          DIRETRIZES DE PENSAMENTO:
          1. BRAND HUB: Foque em diferenciação. Não aceite o comum. Se o nicho é "Emagrecimento", busque o ângulo clínico específico (ex: resistência à insulina, inflamação subclínica).
          2. BUSINESS LAB: Pense em "Escada de Produtos". Não sugira apenas consulta; sugira o "Produto de Entrada", o "Oferta Principal" e o "High-Ticket".
          3. COPY CLÍNICO: Use terminologia que misture autoridade científica com desejo comercial.

          ${examples}

          ENTRADA DO USUÁRIO: "${nicheInput}"

          Gere um perfil estratégico em JSON com os campos:
          - targetAudience: Nome magnético para o segmento.
          - painPoints: 3 dores latentes.
          - desires: 3 desejos aspiracionais.
          - objections: 2 objeções à compra.
          - brandVoice: "O Mentor [Adjetivo] + [Adjetivo]".
          - bigIdea: Uma promessa única (USP).
          - maestroVerdict: Um parágrafo de 3 linhas dando um conselho "tapa na cara" e motivador ao nutricionista.
          - productLadder: { "tripwire": string, "coreOffer": string, "highTicket": string }.

          RESPOSTA APENAS EM JSON, SEM TEXTO ADICIONAL.
        `;

        // Usando o Lovable AI Gateway conforme solicitado pelo usuário
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openAiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o', // Maestro merece o GPT-4o
                messages: [
                    { role: 'system', content: 'Você é o Maestro, mentor estrategista de negócios para nutricionistas elite.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.8,
            }),
        })

        const data = await response.json()
        if (data.error) throw new Error(data.error.message || "Erro no gateway Lovable")

        const content = data.choices[0].message.content
        const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim()

        return new Response(jsonStr, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
