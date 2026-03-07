import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { UnifiedComposer } from "@/components/UnifiedComposer";
import {
  Sparkles, Target, Calendar, ShoppingBag,
  BarChart3, LogOut, User, Zap, Palette,
  Camera, ArrowRight, Crown,
  Users, MessageSquare, FileText, DollarSign
} from "lucide-react";

const MODULES = [
  { title: "Brand Hub", description: "Design & Estratégia", icon: Crown, href: "/brand-hub", gradient: "from-primary/10 to-accent/10", iconColor: "text-primary" },
  { title: "Business Lab", description: "Produtos & Finanças", icon: ShoppingBag, href: "/business-lab", gradient: "from-purple-500/10 to-pink-500/10", iconColor: "text-purple-500" },
  { title: "Planejador", description: "Calendário editorial", icon: Calendar, href: "/planner", gradient: "from-emerald-500/10 to-teal-500/10", iconColor: "text-emerald-500" },
  { title: "Resultados", description: "GPS Financeiro", icon: BarChart3, href: "/results", gradient: "from-emerald-500/10 to-green-500/10", iconColor: "text-emerald-500" },
  { title: "Estúdio Fotos", description: "Fotos Profissionais", icon: Camera, href: "/photo-studio", gradient: "from-orange-500/10 to-amber-500/10", iconColor: "text-orange-500" },
];

const FUNNEL_METRICS = [
  { label: "Leads Hoje", icon: Users, color: "text-blue-400", bg: "from-blue-500/10 to-blue-600/5", borderColor: "border-blue-500/20" },
  { label: "Conversas Ativas", icon: MessageSquare, color: "text-amber-400", bg: "from-amber-500/10 to-amber-600/5", borderColor: "border-amber-500/20" },
  { label: "Propostas Enviadas", icon: FileText, color: "text-purple-400", bg: "from-purple-500/10 to-purple-600/5", borderColor: "border-purple-500/20" },
  { label: "Vendas no Mês", icon: DollarSign, color: "text-emerald-400", bg: "from-emerald-500/10 to-emerald-600/5", borderColor: "border-emerald-500/20" },
];

export default function Dashboard() {
  const { profile } = useProfile();
  const [leadsHoje] = useState(0);
  const [conversasAtivas] = useState(0);
  const [propostasEnviadas] = useState(0);
  const [vendasMes] = useState(0);

  const funnelValues = [leadsHoje, conversasAtivas, propostasEnviadas, vendasMes];

  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <div className="relative overflow-hidden rounded-3xl premium-gradient p-8 md:p-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        <div className="relative z-10">
          <p className="text-primary-foreground/60 text-sm font-medium tracking-wide uppercase mb-2">Command Center</p>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Olá, {profile?.nome?.split(" ")[0] || "Nutri"}! ✨
          </h1>
          <p className="text-primary-foreground/70 text-base mt-2 max-w-lg">
            Sua estratégia de elite está pronta para escalar.
          </p>
        </div>
      </div>

      {/* Pulso do Funil */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 pl-1">Pulso do Funil</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {FUNNEL_METRICS.map((metric, i) => (
            <Card key={metric.label} className={`glass-card border ${metric.borderColor} hover:glass-card-elevated transition-all duration-300`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-muted-foreground font-medium">{metric.label}</p>
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${metric.bg} flex items-center justify-center`}>
                    <metric.icon className={`h-3.5 w-3.5 ${metric.color}`} />
                  </div>
                </div>
                <p className={`text-3xl font-bold tracking-tight ${metric.color}`}>
                  {funnelValues[i]}
                </p>
                <Badge variant="secondary" className="mt-2 text-[10px] bg-muted/50 text-muted-foreground border-0 font-normal">
                  +0 hoje
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <UnifiedComposer />

          {/* Mentor CTA */}
          <Card className="glass-card-elevated neon-border overflow-hidden group hover:shadow-lg transition-all duration-300">
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Mentor IA</h3>
                  <p className="text-xs text-muted-foreground">Consultoria estratégica instantânea</p>
                </div>
              </div>
              <Button size="sm" className="rounded-xl gap-2 group-hover:gap-3 transition-all" asChild>
                <Link to="/mentor">
                  Conversar
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Brand Status */}
          {profile?.brand_locked ? (
            <Card className="glass-card neon-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Marca Configurada</span>
                  <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-0">Travada</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Designs seguem sua identidade visual automaticamente
                </p>
                <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-primary" asChild>
                  <Link to="/brand-hub">Editar Hub →</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card border-accent/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium text-foreground">Configure sua Marca</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Defina cores, fontes e estilos para designs automáticos
                </p>
                <Button size="sm" className="mt-3 w-full rounded-xl" asChild>
                  <Link to="/brand-hub">Configurar Hub</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Modules Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {MODULES.map((module) => (
              <Link key={module.href} to={module.href}>
                <Card className="h-full glass-card hover:glass-card-elevated hover:neon-border transition-all duration-300 cursor-pointer group p-3.5">
                  <div className="flex flex-col gap-2.5">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${module.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <module.icon className={`h-4 w-4 ${module.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{module.title}</p>
                      <p className="text-[10px] text-muted-foreground">{module.description}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Profile Summary */}
          {profile?.promessa_principal && (
            <Card className="glass-card">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">Sua Promessa</p>
                <p className="text-sm font-medium text-foreground line-clamp-2 italic">"{profile.promessa_principal}"</p>
                {profile.nicho && (
                  <Badge variant="outline" className="mt-2.5 text-[10px] border-primary/20 text-primary">
                    {profile.nicho}
                  </Badge>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
