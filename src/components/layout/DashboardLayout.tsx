import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    Sparkles, Target, Calendar, ShoppingBag, MessageSquare,
    BarChart3, BookOpen, User, Zap, Home, Camera, Settings, LogOut, Plus, Coins
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { Button } from "@/components/ui/button";
import { AIAssistantSidebar } from "./AIAssistantSidebar";
import { CreditTopUpModal } from "../CreditTopUpModal";

const NAV_ITEMS = [
    { title: "Dashboard", icon: Home, href: "/" },
    { title: "Estratégia", icon: Target, href: "/strategy" },
    { title: "Calendário", icon: Calendar, href: "/planner" },
    { title: "Gerador de Carrossel", icon: Sparkles, href: "/carousel-creator" },
    { title: "Kit de Marca", icon: Zap, href: "/brand-kit" },
    { title: "Estúdio de Fotos", icon: Camera, href: "/photo-studio" },
    { title: "Produtos", icon: ShoppingBag, href: "/products" },
    { title: "Resultados", icon: BarChart3, href: "/results" },
    { title: "Mentor IA", icon: MessageSquare, href: "/mentor" },
    { title: "Biblioteca", icon: BookOpen, href: "/library" },
];

export default function DashboardLayout({ children }: { children?: React.ReactNode }) {
    const { signOut } = useAuth();
    const { credits, loading: loadingCredits } = useCredits();
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar - Área Esquerda */}
            <aside className="hidden w-64 border-r bg-card md:block relative overflow-y-auto">
                <div className="p-6 flex items-center gap-2 font-bold text-xl text-primary">
                    <Sparkles className="h-6 w-6" />
                    Nutri.AI
                </div>
                <nav className="p-4 space-y-2">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                location.pathname === item.href
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.title}
                        </Link>
                    ))}
                </nav>

                <div className="absolute bottom-0 w-64 p-4 border-t bg-card space-y-4">
                    {/* Credit Status Card */}
                    <div className="px-4 py-3 bg-primary/5 rounded-2xl border border-primary/10">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Seu Saldo</span>
                            <Coins className="h-3 w-3 text-primary" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-primary">{loadingCredits ? "..." : credits}</span>
                                <span className="text-[10px] text-muted-foreground">créditos</span>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 rounded-full hover:bg-primary hover:text-primary-foreground"
                                onClick={() => setIsTopUpOpen(true)}
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Link
                            to="/settings"
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                location.pathname === "/settings"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Settings className="h-5 w-5" />
                            Configurações
                        </Link>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 px-4 py-3 h-auto font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                            onClick={() => signOut()}
                        >
                            <LogOut className="h-5 w-5" />
                            Sair
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Conteúdo Principal - Área Direita */}
            <main className="flex-1 overflow-y-auto relative scroll-smooth bg-muted/5">
                <div className="container mx-auto p-4 md:p-8 max-w-7xl animate-in fade-in duration-500">
                    {children || <Outlet />}
                </div>

                {/* Assistente Flutuante */}
                <AIAssistantSidebar />

                {/* Modal de Créditos */}
                <CreditTopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
            </main>
        </div>
    );
}
