import { useMemo } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useGenerations } from "@/hooks/useGenerations";
import { useCalendarItems } from "@/hooks/useCalendarItems";
import { useProducts } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link, useNavigate } from "react-router-dom";
import { ImplementationGPS } from "@/components/ImplementationGPS";
import {
  Sparkles, Calendar, ShoppingBag,
  BarChart3, Zap, Palette, Camera,
  ArrowRight, Crown, Target, Users,
  FileText, Plus, Clock, CheckCircle2,
  AlertCircle, TrendingUp, Layers,
  MessageSquare, Trophy, Image
} from "lucide-react";

const QUICK_ACTIONS = [
  { label: "Carrossel", icon: Layers, format: "carousel", emoji: "🎠", color: "from-blue-500 to-indigo-600" },
  { label: "Post Único", icon: Image, format: "single_post", emoji: "📸", color: "from-emerald-500 to-teal-600" },
  { label: "Stories", icon: FileText, format: "stories", emoji: "📱", color: "from-orange-500 to-amber-600" },
  { label: "Roteiro Reels", icon: Camera, format: "reels_script", emoji: "🎬", color: "from-purple-500 to-pink-600" },
];

const MODULES = [
  { title: "Brand Hub", description: "Marca e Estratégia", icon: Crown, href: "/brand-hub", color: "text-primary", bg: "bg-primary/10" },
  { title: "Business Lab", description: "Produtos e Finanças", icon: ShoppingBag, href: "/business-lab", color: "text-purple-500", bg: "bg-purple-500/10" },
  { title: "Funis de Vendas", description: "Captação e conversão", icon: Target, href: "/funnels", color: "text-rose-500", bg: "bg-rose-500/10" },
  { title: "Lista VIP", description: "Leads e DMs", icon: Users, href: "/vip-list", color: "text-amber-500", bg: "bg-amber-500/10" },
  { title: "Resultados", description: "GPS Financeiro", icon: BarChart3, href: "/results", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { title: "Desafios", description: "Gamificação", icon: Trophy, href: "/challenge-creator", color: "text-orange-500", bg: "bg-orange-500/10" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { generations, loading: loadingGen } = useGenerations();
  const { items: calendarItems, isLoading: loadingCal } = useCalendarItems();
  const { products } = useProducts();

  // Recent content (last 5)
  const recentContent = useMemo(() =>
    generations?.slice(0, 5) || [], [generations]
  );

  // Upcoming calendar items (next 7 days)
  const upcomingItems = useMemo(() => {
    if (!calendarItems) return [];
    const now = new Date();
    const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return calendarItems
      .filter(item => {
        const d = new Date(item.data);
        return d >= now && d <= weekAhead;
      })
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
      .slice(0, 5);
  }, [calendarItems]);

  // Profile completeness
  const profileCompleteness = useMemo(() => {
    if (!profile) return 0;
    const fields = ['nome', 'nicho', 'persona_ideal', 'mecanismo_unico', 'promessa_principal', 'tom_voz', 'dor_principal'];
    const filled = fields.filter(f => !!(profile as Record<string, unknown>)[f]).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  // Navigate to creator with format preselected
  const handleQuickCreate = (format: string) => {
    navigate('/carousel-creator', { state: { preselectedFormat: format } });
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  };

  const stats = useMemo(() => {
    // Conteúdo gerado pela IA (posts, carrosséis, etc)
    const criados = generations?.length || 0;
    
    // Itens no calendário que ainda não foram publicados
    const agendados = calendarItems?.filter(i => 
      i.status === 'agendado' || 
      i.status === 'planejado' || 
      (!i.status && new Date(i.data) > new Date())
    ).length || 0;
    
    // Itens marcados explicitamente como publicados
    const publicados = calendarItems?.filter(i => i.status === 'publicado').length || 0;
    
    return { criados, agendados, publicados };
  }, [generations, calendarItems]);

  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <div className="relative overflow-hidden rounded-3xl premium-gradient p-8 md:p-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-primary-foreground/60 text-sm font-medium tracking-wide uppercase mb-1">Command Center</p>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground tracking-tight">
              {greeting()}, {profile?.nome?.split(" ")[0] || "Nutri"}!
            </h1>
            <p className="text-primary-foreground/70 text-base mt-1 max-w-lg">
              {recentContent.length > 0
                ? `Você já criou ${generations?.length || 0} conteúdos. Vamos continuar?`
                : "Pronta para criar conteúdo que converte?"}
            </p>
          </div>
          <Button
            size="lg"
            className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm rounded-2xl px-6 gap-2"
            variant="outline"
            onClick={() => navigate('/carousel-creator')}
          >
            <Plus className="h-5 w-5" /> Criar Conteúdo
          </Button>
        </div>
      </div>

      {/* Seu Planejamento (Métricas) */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" /> Seu Planejamento
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-primary/10 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Criados</p>
                <h3 className="text-3xl font-black text-foreground">{stats.criados}</h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-2xl group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-primary/10 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Agendados</p>
                <h3 className="text-3xl font-black text-foreground">{stats.agendados}</h3>
              </div>
              <div className="p-3 bg-amber-50 rounded-2xl group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-primary/10 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Publicados</p>
                <h3 className="text-3xl font-black text-foreground">{stats.publicados}</h3>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Ações por Categoria (Quadrantes) */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quadrante 1: Posts */}
        <Card className="border-primary/10 shadow-md">
          <CardHeader className="pb-3 border-b border-gray-50 mb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Posts e Conteúdo
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 pt-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.format}
                onClick={() => handleQuickCreate(action.format)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 hover:border-primary/30 hover:bg-primary/[0.02] transition-all group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{action.emoji}</span>
                <span className="text-xs font-bold text-gray-700">{action.label}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Quadrante 2: Mentoria e Estratégia */}
        <Card className="border-primary/10 shadow-md">
          <CardHeader className="pb-3 border-b border-gray-50 mb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" /> Mentoria e Estratégia
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 pt-2">
            <Link to="/mentor" className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 hover:border-purple-300 hover:bg-purple-50 transition-all group">
              <Zap className="h-6 w-6 text-purple-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-gray-700">Mentor IA</span>
            </Link>
            <Link to="/brand-hub" className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 hover:border-purple-300 hover:bg-purple-50 transition-all group">
              <Crown className="h-6 w-6 text-purple-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-gray-700">Brand Hub</span>
            </Link>
          </CardContent>
        </Card>

        {/* Quadrante 3: Desafios */}
        <Card className="border-primary/10 shadow-md">
          <CardHeader className="pb-3 border-b border-gray-50 mb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-orange-500" /> Desafios
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 pt-2">
            <Link to="/challenge-creator" className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 hover:border-orange-300 hover:bg-orange-50 transition-all group">
              <Trophy className="h-6 w-6 text-orange-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-gray-700">Criar Desafio</span>
            </Link>
            <div className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 opacity-50 cursor-not-allowed">
              <Zap className="h-6 w-6 text-orange-300" />
              <span className="text-xs font-bold text-gray-400">Gamificação</span>
            </div>
          </CardContent>
        </Card>

        {/* Quadrante 4: CRM e Vendas */}
        <Card className="border-primary/10 shadow-md">
          <CardHeader className="pb-3 border-b border-gray-50 mb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-500" /> CRM e Vendas
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 pt-2">
            <Link to="/vip-list" className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50 transition-all group">
              <Users className="h-6 w-6 text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-gray-700">Lista VIP</span>
            </Link>
            <Link to="/results" className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50 transition-all group">
              <BarChart3 className="h-6 w-6 text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-gray-700">Resultados</span>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* GPS do Consultório */}
      <ImplementationGPS />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Conteúdo Recente */}
          <Card className="glass-card border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Conteúdo Recente
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-primary" asChild>
                  <Link to="/planner">Ver tudo →</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {loadingGen ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">Carregando...</div>
              ) : recentContent.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Nenhum conteúdo criado ainda</p>
                  <Button size="sm" className="mt-3 rounded-xl" onClick={() => navigate('/carousel-creator')}>
                    <Plus className="h-4 w-4 mr-1" /> Criar Primeiro Conteúdo
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentContent.map((gen) => (
                    <div
                      key={gen.id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group cursor-pointer"
                      onClick={() => navigate('/carousel-creator')}
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{gen.titulo || 'Sem título'}</p>
                        <p className="text-xs text-muted-foreground">
                          {gen.subtipo && <span className="capitalize">{gen.subtipo}</span>}
                          {gen.created_at && ` · ${new Date(gen.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Próximos Agendamentos */}
          <Card className="glass-card border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Próximos 7 Dias
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-primary" asChild>
                  <Link to="/planner">Calendário →</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {loadingCal ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">Carregando...</div>
              ) : upcomingItems.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Nenhum conteúdo agendado</p>
                  <Button size="sm" variant="outline" className="mt-3 rounded-xl" asChild>
                    <Link to="/planner"><Plus className="h-4 w-4 mr-1" /> Planejar Semana</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingItems.map((item) => {
                    const itemDate = new Date(item.data);
                    const isToday = itemDate.toDateString() === new Date().toDateString();
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl transition-colors",
                          isToday ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/50"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 text-center",
                          isToday ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}>
                          <span className="text-[10px] font-bold uppercase leading-none">
                            {itemDate.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                          </span>
                          <span className="text-sm font-black leading-none">{itemDate.getDate()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.titulo}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[10px] py-0 h-4 capitalize">{item.tipo}</Badge>
                            {isToday && <Badge className="text-[10px] py-0 h-4 bg-primary/20 text-primary border-none">Hoje</Badge>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

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
                  Conversar <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Profile Completeness */}
          <Card className={cn("glass-card", profileCompleteness < 100 ? "border-amber-200" : "neon-border")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {profileCompleteness >= 100
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    : <AlertCircle className="h-4 w-4 text-amber-500" />}
                  <span className="text-sm font-medium text-foreground">
                    {profileCompleteness >= 100 ? "Perfil Completo" : "Complete seu Perfil"}
                  </span>
                </div>
                <span className="text-xs font-bold text-muted-foreground">{profileCompleteness}%</span>
              </div>
              <Progress value={profileCompleteness} className="h-2 mb-3" />
              {profileCompleteness < 100 ? (
                <p className="text-xs text-muted-foreground mb-2">
                  Perfis completos geram conteúdo 3x mais relevante.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mb-2">
                  Todos os dados estão configurados para a IA.
                </p>
              )}
              <Button variant="link" size="sm" className="p-0 h-auto text-primary text-xs" asChild>
                <Link to="/brand-hub">{profileCompleteness < 100 ? "Completar agora →" : "Editar perfil →"}</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Brand Status */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {profile?.brand_locked ? "Marca Configurada" : "Configure sua Marca"}
                </span>
                {profile?.brand_locked && (
                  <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-0">Ativa</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {profile?.brand_locked
                  ? "Designs seguem sua identidade automaticamente"
                  : "Cores, fontes e estilos para seus designs"}
              </p>
              <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-primary text-xs" asChild>
                <Link to="/brand-hub">{profile?.brand_locked ? "Editar →" : "Configurar →"}</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Products Summary */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-foreground">Produtos</span>
                <Badge variant="secondary" className="text-[10px] bg-purple-500/10 text-purple-500 border-0">
                  {products?.length || 0}
                </Badge>
              </div>
              {products && products.length > 0 ? (
                <div className="space-y-1.5 mt-2">
                  {products.slice(0, 3).map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-xs">
                      <span className="truncate text-muted-foreground">{p.nome}</span>
                      <span className="font-semibold text-foreground ml-2">R$ {p.ticket}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Nenhum produto cadastrado</p>
              )}
              <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-purple-500 text-xs" asChild>
                <Link to="/business-lab">{products?.length ? "Gerenciar →" : "Cadastrar →"}</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Modules Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {MODULES.map((module) => (
              <Link key={module.href} to={module.href}>
                <Card className="h-full glass-card hover:glass-card-elevated hover:neon-border transition-all duration-300 cursor-pointer group p-3.5">
                  <div className="flex flex-col gap-2.5">
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300", module.bg)}>
                      <module.icon className={cn("h-4 w-4", module.color)} />
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

          {/* Promessa */}
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
