import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, Target, Calendar, ShoppingBag, MessageSquare, 
  BarChart3, BookOpen, LogOut, User, Zap, Home, ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { title: "Command Center", icon: Home, href: "/" },
  { title: "Estratégia", icon: Target, href: "/strategy" },
  { title: "Calendário", icon: Calendar, href: "/calendar" },
  { title: "Produtos", icon: ShoppingBag, href: "/products" },
  { title: "Conversão", icon: MessageSquare, href: "/conversion" },
  { title: "Resultados", icon: BarChart3, href: "/results" },
  { title: "Mentor IA", icon: Zap, href: "/mentor" },
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            {location.pathname !== "/" && (
              <Button variant="ghost" size="icon" asChild className="mr-2">
                <Link to="/"><ChevronLeft className="h-5 w-5" /></Link>
              </Button>
            )}
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">{title}</h1>
              {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/settings"><User className="h-4 w-4" /></Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-background/50 overflow-x-auto">
        <div className="container px-4">
          <div className="flex gap-1 py-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  location.pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
      <main className="container px-4 py-8">
        {children}
      </main>
    </div>
  );
}
