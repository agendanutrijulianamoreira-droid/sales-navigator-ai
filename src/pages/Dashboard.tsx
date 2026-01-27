import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { UnifiedComposer } from "@/components/UnifiedComposer";
import { 
  Sparkles, Target, Calendar, ShoppingBag, 
  BarChart3, BookOpen, LogOut, User, Zap, Palette, Settings
} from "lucide-react";

const MODULES = [
  { title: "Planejador", description: "Calendário editorial", icon: Calendar, href: "/planner", color: "text-green-500" },
  { title: "Kit de Marca", description: "Sua identidade visual", icon: Palette, href: "/brand-kit", color: "text-primary" },
  { title: "Estratégia", description: "Posicionamento", icon: Target, href: "/strategy", color: "text-blue-500" },
  { title: "Produtos", description: "Escada de ofertas", icon: ShoppingBag, href: "/products", color: "text-purple-500" },
  { title: "Resultados", description: "GPS Financeiro", icon: BarChart3, href: "/results", color: "text-emerald-500" },
  { title: "Biblioteca", description: "Seus conteúdos", icon: BookOpen, href: "/library", color: "text-pink-500" },
];

export default function Dashboard() {
  const { profile } = useProfile();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">NutriSales OS</h1>
              <p className="text-xs text-muted-foreground">Command Center</p>
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

      <main className="container px-4 py-8">
        {/* Welcome */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Olá, {profile?.nome?.split(" ")[0] || "Nutri"}! 👋</h2>
          <p className="text-muted-foreground">O que vamos criar hoje?</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Unified Composer - The Star */}
            <UnifiedComposer />

            {/* Quick Action - Mentor */}
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Mentor IA</h3>
                    <p className="text-xs text-muted-foreground">Tire dúvidas ou peça estratégias</p>
                  </div>
                </div>
                <Button size="sm" asChild>
                  <Link to="/mentor">Conversar</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Brand Status */}
            {profile?.brand_locked ? (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Marca Configurada</span>
                    <Badge variant="secondary" className="text-xs">Travada</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Seus designs seguem automaticamente sua identidade visual
                  </p>
                  <Button variant="link" size="sm" className="p-0 h-auto mt-2" asChild>
                    <Link to="/brand-kit">Editar Kit →</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">Configure sua Marca</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Defina cores, fontes e estilos para designs automáticos
                  </p>
                  <Button size="sm" className="mt-3 w-full" asChild>
                    <Link to="/brand-kit">Configurar Kit</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Modules Grid */}
            <div className="grid grid-cols-2 gap-2">
              {MODULES.map((module) => (
                <Link key={module.href} to={module.href}>
                  <Card className="h-full hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group p-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center ${module.color} group-hover:scale-110 transition-transform`}>
                        <module.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{module.title}</p>
                        <p className="text-[10px] text-muted-foreground">{module.description}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Profile Summary */}
            {profile?.promessa_principal && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Sua Promessa</p>
                  <p className="text-sm font-medium line-clamp-2">"{profile.promessa_principal}"</p>
                  {profile.nicho && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {profile.nicho}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
