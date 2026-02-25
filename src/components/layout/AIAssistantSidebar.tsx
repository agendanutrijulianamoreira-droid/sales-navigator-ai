import { useState, useRef, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Sparkles, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export function AIAssistantSidebar() {
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
        { role: 'ai', content: 'Olá! Sou seu estrategista. O que acha de melhorarmos o gancho desse slide 2?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleSend = () => {
        if (!input.trim()) return;

        setMessages(prev => [...prev, { role: 'user', content: input }]);
        setInput('');
        setIsTyping(true);

        // Simulação de resposta rápida do mentor
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'ai', content: 'Ótima ideia. Isso aumentaria a retenção. Tente usar a palavra "Segredo" ou "Resultado" no título para atrair mais atenção.' }]);
            setIsTyping(false);
        }, 1500);
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 hover:scale-110 transition-all z-[100] border-none group"
                    size="icon"
                >
                    <MessageSquare className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
                    <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 border-2 border-white animate-bounce">1</Badge>
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[500px] flex flex-col h-full bg-background/95 backdrop-blur-md">
                <SheetHeader className="border-b pb-4">
                    <SheetTitle className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold">Brain Trust</span>
                            <span className="text-xs text-muted-foreground font-normal flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Mentor Estrategista Online
                            </span>
                        </div>
                    </SheetTitle>
                </SheetHeader>

                <ScrollArea className="flex-1 pr-4 mt-4">
                    <div className="space-y-6 pb-4">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex items-start gap-3 ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                                {m.role === 'ai' && (
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <Sparkles className="w-4 h-4 text-primary" />
                                    </div>
                                )}
                                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === 'ai'
                                        ? 'bg-muted text-foreground rounded-tl-none'
                                        : 'bg-primary text-primary-foreground rounded-tr-none'
                                    }`}>
                                    {m.content}
                                </div>
                                {m.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                                        <User className="w-4 h-4 text-primary-foreground" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex items-center gap-2 text-muted-foreground text-xs animate-pulse italic">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                    <Sparkles className="w-4 h-4 opacity-50" />
                                </div>
                                Mentor está digitando...
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                <div className="pt-4 border-t mt-auto">
                    <div className="flex gap-2 bg-muted/50 p-2 rounded-2xl border focus-within:ring-2 ring-primary/20 transition-all">
                        <Input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Pergunte ao mentor..."
                            className="border-none bg-transparent focus-visible:ring-0 shadow-none h-10"
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                        />
                        <Button onClick={handleSend} size="icon" className="rounded-xl shrink-0 h-10 w-10">
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground mt-3">
                        O Mentor IA pode cometer erros. Verifique informações importantes.
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    );
}
