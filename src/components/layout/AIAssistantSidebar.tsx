import { useState, useRef, useEffect, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Sparkles, User, Loader2, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/useProfile";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIAssistantSidebar() {
  const { profile } = useProfile();
  const { products } = useProducts();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSpecialist, setCurrentSpecialist] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const parseSSEResponse = useCallback(async (response: Response): Promise<string> => {
    const reader = response.body?.getReader();
    if (!reader) return "";

    const decoder = new TextDecoder();
    let fullText = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullText += delta;
                // Live update the last message
                setMessages(prev => {
                  const updated = [...prev];
                  if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
                    updated[updated.length - 1] = { role: 'assistant', content: fullText };
                  }
                  return updated;
                });
              }
            } catch {
              // skip non-json lines
            }
          }
        }
      }
    } catch (err) {
      console.error("SSE parse error:", err);
    }

    return fullText;
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Step 1: Route the query to the right specialist
      const { data: routeData } = await supabase.functions.invoke('mentor-router', {
        body: { query: userMessage }
      });

      const specialist = routeData?.specialist || 'MENTOR_ORCHESTRATOR';
      setCurrentSpecialist(specialist);

      // Step 2: Build conversation history (last 10 messages)
      const conversationHistory = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));

      // Step 3: Call ai-specialist with streaming
      // Add placeholder assistant message for streaming
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-specialist`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            specialist,
            prompt: userMessage,
            profile,
            products,
            conversationHistory,
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro ao conectar com o mentor');
      }

      // Check if streaming (text/event-stream) or regular JSON
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('text/event-stream')) {
        await parseSSEResponse(response);
      } else {
        // Fallback for non-streaming response
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || data.response || 'Desculpe, não consegui processar sua pergunta.';
        setMessages(prev => {
          const updated = [...prev];
          if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
            updated[updated.length - 1] = { role: 'assistant', content: text };
          }
          return updated;
        });
      }
    } catch (error) {
      console.error("AI Assistant error:", error);
      setMessages(prev => {
        const updated = [...prev];
        // Remove empty assistant message or update with error
        if (updated.length > 0 && updated[updated.length - 1].role === 'assistant' && !updated[updated.length - 1].content) {
          updated[updated.length - 1] = {
            role: 'assistant',
            content: 'Desculpe, tive um problema ao responder. Tente novamente em alguns segundos.'
          };
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setCurrentSpecialist(null);
  };

  const SPECIALIST_LABELS: Record<string, string> = {
    COMMAND_CENTER: 'Mentor Estratégico',
    AUDIENCE_EXPERT: 'Especialista em Público',
    BRAND_ARCHITECT: 'Arquiteto de Marca',
    SOCIAL_MEDIA_MANAGER: 'Conteúdo Viral',
    HOOKS_COPYWRITER: 'Hooks & Copy',
    SALES_PAGE_BUILDER: 'Páginas de Vendas',
    VIDEO_SCRIPTWRITER: 'Roteiros de Vídeo',
    MINI_TRAINING_BUILDER: 'Mini Treinamentos',
    GROWTH_STRATEGIST: 'Estrategista de Funis',
    MATERIAL_COPYWRITER: 'Copywriter',
    CHALLENGE_COACH: 'Coach de Desafios',
    VIP_CLOSER: 'Closer de Vendas',
    CFO_STRATEGIST: 'CFO Estratégico',
    MENTOR_ORCHESTRATOR: 'Mentor',
  };

  const QUICK_PROMPTS = [
    "O que devo postar hoje?",
    "Cria 5 hooks para meu próximo post",
    "Me ajuda a montar uma oferta de acompanhamento",
    "Quem é meu público ideal?",
    "Monta um mini treinamento sobre meu nicho",
    "Roteiro de Reels de 30 segundos",
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="hidden md:flex fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 hover:scale-110 transition-all z-[100] border-none group"
          size="icon"
        >
          <MessageSquare className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[500px] flex flex-col h-full bg-background/95 backdrop-blur-md">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold">Mentor IA</span>
                <span className="text-xs text-muted-foreground font-normal flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  {currentSpecialist ? SPECIALIST_LABELS[currentSpecialist] || 'Mentor' : 'Pronto para ajudar'}
                </span>
              </div>
            </div>
            {messages.length > 0 && (
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 pr-4 mt-4">
          <div className="space-y-6 pb-4">
            {messages.length === 0 && (
              <div className="space-y-4 py-8">
                <div className="text-center">
                  <Sparkles className="h-10 w-10 text-primary/30 mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">Como posso te ajudar?</p>
                  <p className="text-xs text-muted-foreground mt-1">Pergunte sobre estratégia, conteúdo, vendas ou marca</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
                      className="p-3 rounded-xl border border-border/50 text-xs text-left hover:bg-muted/50 hover:border-primary/30 transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex items-start gap-3 ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${m.role === 'assistant'
                  ? 'bg-muted text-foreground rounded-tl-none'
                  : 'bg-primary text-primary-foreground rounded-tr-none'
                }`}>
                  {m.content || (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" /> Pensando...
                    </span>
                  )}
                </div>
                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}

            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="pt-4 border-t mt-auto">
          <div className="flex gap-2 bg-muted/50 p-2 rounded-2xl border focus-within:ring-2 ring-primary/20 transition-all">
            <Input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Pergunte ao mentor..."
              className="border-none bg-transparent focus-visible:ring-0 shadow-none h-10"
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              size="icon"
              className="rounded-xl shrink-0 h-10 w-10"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
