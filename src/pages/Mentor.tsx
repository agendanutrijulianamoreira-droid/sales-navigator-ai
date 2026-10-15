import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAISpecialist } from "@/hooks/useAISpecialist";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CalendarDays, FilePlus2, Loader2, Send, Sparkles, User, Bot, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Json } from "@/integrations/supabase/types";
import type { AssistantAction } from "@/lib/assistantActions";

interface Message {
  role: "user" | "assistant";
  content: string;
  specialist?: string;
  actions?: AssistantAction[];
}

export default function Mentor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { routeToSpecialist, stopStreaming, isLoading } = useAISpecialist();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<AssistantAction | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadOrCreateConversation = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user.id)
      .eq("specialist", "mentor")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setConversationId(data.id);
      const loadedMessages = data.messages as unknown as Message[];
      setMessages(Array.isArray(loadedMessages) ? loadedMessages : []);
    }
  }, [user]);

  useEffect(() => {
    loadOrCreateConversation();
  }, [loadOrCreateConversation]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveConversation = async (newMessages: Message[]) => {
    if (!user) return;

    if (conversationId) {
      await supabase
        .from("conversations")
        .update({
          messages: newMessages as unknown as Json,
          updated_at: new Date().toISOString()
        })
        .eq("id", conversationId);
    } else {
      const { data } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          specialist: "mentor",
          titulo: "Conversa com Mentor",
          messages: newMessages as unknown as Json,
        })
        .select()
        .single();

      if (data) {
        setConversationId(data.id);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    try {
      const response = await routeToSpecialist(input);

      if (response) {
        const assistantMessage: Message = {
          role: "assistant",
          content: response.content,
          specialist: response.specialist,
          actions: response.actions,
        };
        const updatedMessages = [...newMessages, assistantMessage];
        setMessages(updatedMessages);
        await saveConversation(updatedMessages);
      }
    } catch (error) {
      toast.error("Erro ao enviar mensagem");
    }
  };

  const handleClear = async () => {
    setMessages([]);
    if (conversationId) {
      await supabase.from("conversations").delete().eq("id", conversationId);
      setConversationId(null);
    }
    toast.success("Conversa limpa!");
  };

  const getSpecialistLabel = (specialist?: string) => {
    const labels: Record<string, string> = {
      brand_architect: "Arquiteto de Marca",
      social_media_manager: "Social Media",
      cfo_strategist: "CFO Estrategista",
      vip_closer: "Closer VIP",
      challenge_coach: "Coach de Desafios",
      material_copywriter: "Copywriter",
      growth_strategist: "Estrategista de Crescimento",
      mentor_orchestrator: "Mentor",
    };
    return labels[specialist || ""] || "Mentor";
  };

  const getFallbackActions = (message: Message): AssistantAction[] => {
    if (message.role !== "assistant" || message.actions?.length) return [];
    const specialist = message.specialist || "";
    if (specialist.includes("growth") || specialist.includes("mentor")) {
      return [
        { type: "open_calendar", label: "Abrir calendário" },
        { type: "create_content", label: "Criar conteúdo" },
      ];
    }
    if (specialist.includes("social") || specialist.includes("copy") || specialist.includes("material")) {
      return [{ type: "create_content", label: "Criar conteúdo" }];
    }
    if (specialist.includes("cfo") || specialist.includes("sales") || specialist.includes("closer")) {
      return [{ type: "open_offers", label: "Ver ofertas" }];
    }
    return [];
  };

  const executeAction = async (action: AssistantAction) => {
    if (action.type === "open_calendar") {
      navigate("/planner");
      return;
    }
    if (action.type === "create_content") {
      navigate("/carousel-creator", { state: { topic: action.payload?.title || "Criar conteúdo a partir da conversa" } });
      return;
    }
    if (action.type === "open_offers") {
      navigate("/business-lab");
      return;
    }
    setPendingAction(action);
  };

  const confirmCalendarAction = async () => {
    if (!user || !pendingAction || pendingAction.type !== "create_calendar_item") return;
    const payload = pendingAction.payload || {};
    const title = payload.title?.trim();
    const date = payload.date && /^\d{4}-\d{2}-\d{2}$/.test(payload.date) ? payload.date : null;
    if (!title || !date) {
      toast.error("A ação não trouxe título e data válidos para o calendário.");
      return;
    }

    const { error } = await supabase.from("calendar_items").insert({
      user_id: user.id,
      data: date,
      tipo: payload.format || "post_unico",
      titulo: title,
      notas: payload.notes || null,
      conteudo_corpo: payload.content || null,
      status: "planejado",
      canal: "instagram",
      objetivo: null,
      etapa_funil: null,
      campanha: null,
      produto: null,
      fonte: "Mentor IA",
      estrategia_snapshot: { origem: "mentor", action: "create_calendar_item" },
    });
    if (error) {
      toast.error("Não foi possível adicionar ao calendário.");
      return;
    }
    setPendingAction(null);
    toast.success("Item adicionado ao calendário.");
  };

  return (
    <AppLayout title="Mentor IA" description="Seu conselheiro estratégico">
      <div className="max-w-4xl mx-auto">
        <Card className="h-[calc(100vh-280px)] flex flex-col">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Conversa com o Mentor
            </CardTitle>
            {messages.length > 0 && (
              <Button size="sm" variant="ghost" onClick={handleClear}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-hidden">
            {/* Messages */}
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 pb-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Bot className="h-16 w-16 mx-auto mb-4 text-primary/20" />
                    <h3 className="font-medium mb-2">Olá! Sou seu Mentor IA.</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Posso ajudar com estratégia de marca, conteúdo, vendas, finanças...
                      Faça sua pergunta e vou direcionar para o especialista certo!
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center mt-6">
                      {[
                        "Como definir meu nicho?",
                        "Ideias de conteúdo para essa semana",
                        "Como bater minha meta de faturamento?",
                        "Mensagem para reativar leads",
                      ].map((suggestion) => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          size="sm"
                          onClick={() => setInput(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex gap-3",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-3",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        {message.role === "assistant" && message.specialist && (
                          <p className="text-xs text-primary font-medium mb-1">
                            {getSpecialistLabel(message.specialist)}
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {[...(message.actions || []), ...getFallbackActions(message)].length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
                            {[...(message.actions || []), ...getFallbackActions(message)].map((action) => (
                              <Button
                                key={`${action.type}-${action.label}`}
                                size="sm"
                                variant="secondary"
                                onClick={() => void executeAction(action)}
                                className="gap-1.5"
                              >
                                {action.type === "open_calendar" || action.type === "create_calendar_item" ? <CalendarDays className="h-3.5 w-3.5" /> : <FilePlus2 className="h-3.5 w-3.5" />}
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                      {message.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {pendingAction?.type === "create_calendar_item" && (
              <div className="mb-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-semibold">Adicionar ao calendário?</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {pendingAction.payload?.title || "Conteúdo sugerido"} · {pendingAction.payload?.date || "data não informada"}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => void confirmCalendarAction()} className="gap-1.5"><Check className="h-4 w-4" />Confirmar</Button>
                  <Button size="sm" variant="outline" onClick={() => setPendingAction(null)} className="gap-1.5"><X className="h-4 w-4" />Cancelar</Button>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex flex-col gap-2 pt-4 border-t">
              {isLoading && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopStreaming}
                  className="self-center mb-2 text-destructive border-destructive/20 hover:bg-destructive/10"
                >
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                    Parar Geração (Esc)
                  </span>
                </Button>
              )}
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua dúvida, pedido de ajuda ou desabafo..."
                  className="min-h-[60px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                    if (e.key === "Escape" && isLoading) {
                      stopStreaming();
                    }
                  }}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="h-[60px] w-[60px]"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
