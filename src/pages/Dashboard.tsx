import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Sparkles, Target, Calendar, ShoppingBag, MessageSquare, 
  BarChart3, BookOpen, LogOut, User, Zap
} from "lucide-react";

const MODULES = [
  { title: "Estratégia", description: "Brand Hub & Business Lab", icon: Target, href: "/strategy", color: "text-blue-500" },
  { title: "Calendário", description: "Planeje seu conteúdo", icon: Calendar, href: "/calendar", color: "text-green-500" },
  { title: "Produtos", description: "Materiais & Desafios", icon: ShoppingBag, href: "/products", color: "text-purple-500" },
  { title: "Conversão", description: "Lista VIP & Mensagens", icon: MessageSquare, href: "/conversion", color: "text-orange-500" },
  { title: "Resultados", description: "GPS Financeiro", icon: BarChart3, href: "/results", color: "text-emerald-500" },
  { title: "Biblioteca", description: "Tudo que você gerou", icon: BookOpen, href: "/library", color: "text-pink-500" },
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Olá, {profile?.nome?.split(" ")[0] || "Nutri"}! 👋</h2>
          <p className="text-muted-foreground">O que vamos conquistar hoje?</p>
        </div>

        {/* Quick Action - Mentor */}
        <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Mentor IA</h3>
                <p className="text-sm text-muted-foreground">Tire dúvidas, peça ajuda ou estratégias</p>
              </div>
            </div>
            <Button asChild>
              <Link to="/mentor">Conversar</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Modules Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((module) => (
            <Link key={module.href} to={module.href}>
              <Card className="h-full hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
                <CardHeader className="pb-2">
                  <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${module.color} group-hover:scale-110 transition-transform`}>
                    <module.icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Profile Summary */}
        {profile?.promessa_principal && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Sua Promessa</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">"{profile.promessa_principal}"</p>
              {profile.nicho && (
                <p className="text-sm text-muted-foreground mt-2">
                  Nicho: {profile.nicho} {profile.sub_nicho && `• ${profile.sub_nicho}`}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
