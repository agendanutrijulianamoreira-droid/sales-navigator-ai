import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    Sparkles, Target, Calendar, ShoppingBag, MessageSquare,
    BarChart3, BookOpen, User, Zap, Home, Camera, Settings, LogOut, Plus, Coins, Crown, Trophy, TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { Button } from "@/components/ui/button";
import { AIAssistantSidebar } from "./AIAssistantSidebar";
import { CreditTopUpModal } from "../CreditTopUpModal";

const NAV_ITEMS = [
    { title: "Command Center", icon: Home, href: "/" },
    { title: "Brand Hub", icon: Crown, href: "/brand-hub" },
    { title: "Business Lab", icon: ShoppingBag, href: "/business-lab" },
    { title: "Calendário", icon: Calendar, href: "/planner" },
    { title: "Conteúdo IA", icon: Sparkles, href: "/carousel-creator" },
    { title: "Funis de Vendas", icon: Target, href: "/funnels" },
    { title: "Lista VIP", icon: MessageSquare, href: "/vip-list" },
    { title: "Acelerador de Vendas", icon: TrendingUp, href: "/conversion" },
    { title: "Fábrica de Desafios", icon: Trophy, href: "/challenge-creator" },
    { title: "Estúdio de Fotos", icon: Camera, href: "/photo-studio" },
    { title: "Resultados", icon: BarChart3, href: "/results" },
    { title: "Mentor IA", icon: Zap, href: "/mentor" },
];

const MOBILE_NAV_ITEMS = [
    { title: "Início", icon: Home, href: "/" },
    { title: "Funis", icon: Target, href: "/funnels" },
    { title: "Conteúdo", icon: Sparkles, href: "/carousel-creator" },
    { title: "VIP", icon: Crown, href: "/vip-list" },
    { title: "Mentor", icon: MessageSquare, href: "/mentor" },
];

export default function DashboardLayout({ children }: { children?: React.ReactNode }) {
    const { signOut } = useAuth();
    const { credits, loading: loadingCredits } = useCredits();
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="flex h-screen overflow-hidden mesh-background">
            {/* Sidebar */}
            <aside className="hidden w-64 glass-sidebar md:flex flex-col relative">
                {/* Logo */}
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl premium-gradient flex items-center justify-center neon-glow-sm">
                        <Sparkles className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                        <span className="font-bold text-lg tracking-tight text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            Nutri.AI
                        </span>
                        <p className="text-[9px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Elite System</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                                    isActive
                                        ? "glass-card-elevated neon-border text-primary shadow-lg"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <item.icon className={cn("h-[18px] w-[18px] transition-colors", isActive && "text-primary")} />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div className="p-3 space-y-3 border-t border-border/50">
                    {/* Credits */}
                    <div className="glass-card rounded-2xl px-4 py-3">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Créditos</span>
                            <Coins className="h-3.5 w-3.5 text-accent" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-bold text-foreground">
                                    {loadingCredits ? "..." : (credits >= 999999 ? "∞" : credits)}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                    {credits >= 999999 ? "ilimitados" : "restantes"}
                                </span>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 rounded-full bg-accent/10 hover:bg-accent hover:text-accent-foreground transition-all"
                                onClick={() => setIsTopUpOpen(true)}
                            >
                                <Plus className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>

                    {/* Settings & Logout */}
                    <div className="space-y-0.5">
                        <Link
                            to="/settings"
                            className={cn(
                                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                                location.pathname === "/settings"
                                    ? "glass-card neon-border text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            <Settings className="h-[18px] w-[18px]" />
                            Configurações
                        </Link>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 px-4 py-2.5 h-auto font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                            onClick={() => signOut()}
                        >
                            <LogOut className="h-[18px] w-[18px]" />
                            Sair
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative">
                <div className="container mx-auto p-4 pb-24 md:p-8 max-w-7xl animate-fade-in">
                    {children || <Outlet />}
                </div>

                <AIAssistantSidebar />
                <CreditTopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
            </main>

            {/* Mobile Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-sidebar border-t border-border/50 flex justify-around py-3 z-50 px-2 backdrop-blur-xl">
                {MOBILE_NAV_ITEMS.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1.5 px-1 transition-all duration-300",
                                isActive ? "text-primary scale-110" : "text-muted-foreground"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5 transition-colors", isActive && "text-primary")} />
                            <span className={cn("text-[9px] font-bold uppercase tracking-tight", isActive && "text-primary")}>
                                {item.title}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
