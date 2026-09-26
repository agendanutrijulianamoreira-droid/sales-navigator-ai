# Novo calendário de conteúdo (inspirado nos prints)

Vou reorganizar o planejador em uma página só, com o mesmo fluxo dos prints. Uso o nosso próprio visual, sem copiar a marca nem os textos do CreatorMed.

## O que você vai ver

1. **Topo**
   - Duas abas: **Calendário** e **Conteúdos** (a sua biblioteca).
   - Seletor **Semana / Mês**, botão **+ Nova ideia**, botão **Gerar calendário** e navegação entre meses.

2. **Faixa da semana (ou grade do mês)**
   - Cada dia mostra blocos coloridos por formato: Carrossel (verde-água), Reels (dourado), Post (roxo), Stories (azul).
   - O dia de hoje fica destacado.
   - Os horários agendados aparecem com um contorno tracejado.
   - Ao passar o mouse, aparece um cartão com o formato, o status, o título e o começo da descrição.

3. **Janela "Gerar calendário"**
   - Período: Semanal ou Mensal.
   - Cadência: Baixa (3x), Média (5x) ou Alta (7x por semana).
   - Objetivo: Engajamento, Vender, Crescer ou Todos.
   - Formatos: Stories, Carrossel, Post, Reels ou Todos.
   - Ao clicar em **Gerar**, a IA preenche os dias usando o seu perfil, a sua linha de Neuromarketing e estudos científicos reais (PubMed) já salvos no app.

4. **Janela "Editar ideia"**
   - Campos: título, data, formato, status (Rascunho, Em produção, Publicado, Arquivado), descrição e notas.
   - Botões: **Salvar** (guarda a ideia) e **Criar** (gera o conteúdo completo).

5. **Criar a partir da ideia**
   - Aparece a tela "Criando seu carrossel...". Depois você segue para o criador de carrossel, que já existe, com o roteiro pronto.
   - No criador, você escolhe o estilo das imagens: **Minha foto**, **Descrever** ou **Referência**.

6. **Parte de baixo**
   - Filtros por formato: Feed, Stories, Posts, Carrosséis e Reels.
   - Prévia do feed do Instagram em grade 3x3, com as capas.
   - Ao lado, **Notas rápidas**: você anota ideias soltas, e elas ficam salvas.

## Detalhes técnicos
- Reescrever `ContentPlanner.tsx` e separar as partes em componentes: WeekStrip, MonthGrid, IdeaHoverCard, GenerateCalendarDialog, IdeaDialog, FeedPreview, QuickNotes.
- Usar a tabela `calendar_items` que já existe. Status: rascunho, producao, publicado, arquivado. O horário fica em `estrategia_snapshot.horario`.
- Criar uma nova tabela `quick_notes` (user_id, conteudo), com permissões de acesso e regras para que cada pessoa veja só as próprias notas.
- Atualizar `generate-month-plan` para receber período, cadência, objetivo e formatos, e para usar trechos de `research_items` como base científica. O modelo continua `google/gemini-3-flash-preview`, conforme a memória do projeto.
- O botão "Criar" envia a ideia para `/carousel-creator` em modo de geração automática. Na etapa de imagens, o criador passa a mostrar as 3 opções de estilo.
