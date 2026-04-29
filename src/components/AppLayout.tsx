import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Sparkles } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

/**
 * Wrapper de página leve. Não renderiza header/nav próprios,
 * pois o DashboardLayout (sidebar) já é o layout principal.
 * Mantém apenas título e descrição da página.
 */
export function AppLayout({ children, title, description }: AppLayoutProps) {
  const location = useLocation();

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        {location.pathname !== "/" && (
          <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-muted/50 md:hidden">
            <Link to="/"><ChevronLeft className="h-5 w-5" /></Link>
          </Button>
        )}
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center shrink-0">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1
            className="font-semibold text-2xl text-foreground tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {title}
          </h1>
          {description && (
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
