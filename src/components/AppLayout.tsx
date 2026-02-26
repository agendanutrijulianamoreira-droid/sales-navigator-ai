import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, Target, Calendar, ShoppingBag, MessageSquare, 
  BarChart3, BookOpen, LogOut, User, Zap, Home, ChevronLeft,
  Camera
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { title: "Command Center", icon: Home, href: "/" },
  { title: "Estratégia", icon: Target, href: "/strategy" },
  { title: "Calendário", icon: Calendar, href: "/planner" },
  { title: "Kit de Marca", icon: Zap, href: "/brand-kit" },
  { title: "Estúdio de Fotos", icon: Camera, href: "/photo-studio" },
  { title: "Produtos", icon: ShoppingBag, href: "/products" },
  { title: "Resultados", icon: BarChart3, href: "/results" },
  { title: "Mentor IA", icon: MessageSquare, href: "/mentor" },
  { title: "Biblioteca", icon: BookOpen, href: "/library" },
];

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function AppLayout({ children, title, description }: AppLayoutProps) {
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen mesh-background">
      {/* Header */}
      <header className="glass-card-elevated sticky top-0 z-50 border-b border-border/50">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            {location.pathname !== "/" && (
              <Button variant="ghost" size="icon" asChild className="mr-2 rounded-xl hover:bg-muted/50">
                <Link to="/"><ChevronLeft className="h-5 w-5" /></Link>
              </Button>
            )}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-lg text-foreground tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h1>
              {description && <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild className="rounded-xl hover:bg-muted/50">
              <Link to="/settings"><User className="h-4 w-4" /></Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => signOut()} className="rounded-xl hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="glass-card border-b border-border/50 overflow-x-auto">
        <div className="container px-4">
          <div className="flex gap-1 py-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap",
                  location.pathname === item.href
                    ? "bg-primary text-primary-foreground shadow-lg neon-glow-sm"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container px-4 py-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
