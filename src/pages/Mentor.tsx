import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAISpecialist } from "@/hooks/useAISpecialist";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Send, Sparkles, User, Bot, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  specialist?: string;
}

export default function Mentor() {
  const { user } = useAuth();
  const { routeToSpecialist, isLoading } = useAISpecialist();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadOrCreateConversation();
    }
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadOrCreateConversation = async () => {
    // Get the most recent conversation
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user?.id)
      .eq("specialist", "mentor")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setConversationId(data.id);
      const loadedMessages = data.messages as unknown as Message[];
      setMessages(Array.isArray(loadedMessages) ? loadedMessages : []);
    }
  };

  const saveConversation = async (newMessages: Message[]) => {
    if (!user) return;

    if (conversationId) {
      await supabase
        .from("conversations")
        .update({ 
          messages: newMessages as any,
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
          messages: newMessages as any,
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
          specialist: response.specialist 
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

            {/* Input */}
            <div className="flex gap-2 pt-4 border-t">
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
                }}
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
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
