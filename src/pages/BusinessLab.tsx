import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProducts } from "@/hooks/useProducts";
import { Badge } from "@/components/ui/badge";
import {
    Sparkles, Package, Trophy,
    Plus, Trash2, BarChart3, Target, TrendingUp,
    AlertTriangle, Clock, Calculator, BrainCircuit, Wallet
} from "lucide-react";
import { toast } from "sonner";
import { PricingCalculator } from "@/components/business/PricingCalculator";
import { CFOConsultant } from "@/components/business/CFOConsultant";
import { FinancialPanel } from "@/components/business/FinancialPanel";
import { OfferBuilder } from "@/components/business/OfferBuilder";
import { useFinancialSettings } from "@/hooks/useFinancialSettings";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

export default function BusinessLab() {
    const { products, addProduct, deleteProduct } = useProducts();
    const { settings } = useFinancialSettings();
    const [activeTab, setActiveTab] = useState("finance");
    const [showOfferBuilder, setShowOfferBuilder] = useState(false);

    // Sliders for conversion
    const [convLeadToCore, setConvLeadToCore] = useState([10]);
    const [convCoreToPremium, setConvCoreToPremium] = useState([1]);

    const [revenueGoal, setRevenueGoal] = useState("");
    const [calculatedTargets, setCalculatedTargets] = useState<{ tripwire: number, core: number, premium: number, viability: any } | null>(null);

    // Unify real goal from settings if available
    const monthlyGoal = settings?.monthly_income_goal || 10000;

    // New product form
    const [newProduct, setNewProduct] = useState({
        nome: "",
        ticket: "",
        tipo_produto: "consultoria",
        tipo_cliente: "frustrado",
        ladder_stage: "core",
        descricao: "",
        hours_spent: "0",
    });

    const handleAddProduct = async () => {
        if (!newProduct.nome || !newProduct.ticket) {
            toast.error("Preencha nome e valor do produto");
            return;
        }
        await addProduct({
            nome: newProduct.nome,
            ticket: parseFloat(newProduct.ticket),
            tipo_produto: newProduct.tipo_produto,
            tipo_cliente: newProduct.tipo_cliente,
            descricao: newProduct.descricao,
            ativo: true,
            ordem: products?.length || 0,
            ladder_stage: newProduct.ladder_stage,
        } as any);
        setNewProduct({
            nome: "",
            ticket: "",
            tipo_produto: "consultoria",
            tipo_cliente: "frustrado",
            ladder_stage: "core",
            descricao: "",
            hours_spent: "0"
        });
        toast.success("Produto adicionado!");
    };

    const calculateViability = (salesNeeded: any) => {
        // Mocking hours if not in product object yet, but preparing for schema
        // We'll use a default of 2h for core and 10h for premium if hours_spent is missing
        const hTrip = 0.5;
        const hCore = 2;
        const hPremium = 10;

        const totalHoursNeeded = (salesNeeded.tripwire * hTrip) + (salesNeeded.core * hCore) + (salesNeeded.premium * hPremium);
        const weeklyHours = (settings?.work_days_week || 5) * (settings?.work_hours_day || 6);
        const availableHours = weeklyHours * 4.33;

        return {
            needed: totalHoursNeeded.toFixed(1),
            available: availableHours.toFixed(1),
            isPossible: totalHoursNeeded <= availableHours
        };
    };

    const handleCalculateSplit = () => {
        const goal = revenueGoal ? parseFloat(revenueGoal) : monthlyGoal;

        if (isNaN(goal) || goal <= 0) {
            toast.error("Insira uma meta válida");
            return;
        }

        // Search for product prices by ladder_stage
        const pTrip = products?.find(p => (p as any).ladder_stage === 'entrada')?.ticket || 47;
        const pCore = products?.find(p => (p as any).ladder_stage === 'core')?.ticket || 497;
        const pPremium = products?.find(p => (p as any).ladder_stage === 'premium')?.ticket || 2500;

        const cCore = convLeadToCore[0] / 100;
        const cPremium = convCoreToPremium[0] / 100;

        // Formula: X * pTrip + (cCore * X) * pCore + (cPremium * cCore * X) * pPremium = goal
        // X * (pTrip + cCore * pCore + cPremium * cCore * pPremium) = goal
        const x = goal / (pTrip + (cCore * pCore) + (cPremium * cCore * pPremium));

        const targets = {
            tripwire: Math.ceil(x),
            core: Math.ceil(x * cCore),
            premium: Math.ceil(x * cCore * cPremium)
        };

        setCalculatedTargets({
            ...targets,
            viability: calculateViability(targets)
        });

        toast.success("Estratégia calculada!");
    };

    return (
        <AppLayout title="Business Lab" description="Venda o Invisível. Preocupe-se com a Estratégia, não com a Planilha.">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(120,119,198,0.1),transparent)] pointer-events-none" />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8 relative z-10">
                <div className="flex justify-center mb-8">
                    <TabsList className="grid grid-cols-4 w-full max-w-3xl bg-muted/30 backdrop-blur-md border border-white/10 p-1 rounded-2xl h-14">
                        <TabsTrigger value="finance" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300">
                            <Wallet className="h-4 w-4" />
                            <span className="font-bold hidden sm:inline">Painel Financeiro</span>
                        </TabsTrigger>
                        <TabsTrigger value="ladder" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300">
                            <Package className="h-4 w-4" />
                            <span className="font-bold hidden sm:inline">Escada de Ofertas</span>
                        </TabsTrigger>
                        <TabsTrigger value="simulator" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300">
                            <Calculator className="h-4 w-4" />
                            <span className="font-bold hidden sm:inline">Simulador</span>
                        </TabsTrigger>
                        <TabsTrigger value="cfo" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300">
                            <BrainCircuit className="h-4 w-4" />
                            <span className="font-bold hidden sm:inline">Consultoria CFO</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Painel Financeiro (NEW - Real Data) */}
                <TabsContent value="finance" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <FinancialPanel />
                </TabsContent>

                {/* Product Ladder / Revenue Roadmap */}
                <TabsContent value="ladder" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Toggle: Offer Builder vs Regular View */}
                    <div className="flex items-center justify-center gap-3">
                        <Button
                            variant={!showOfferBuilder ? "default" : "outline"}
                            onClick={() => setShowOfferBuilder(false)}
                            className="rounded-xl gap-2"
                        >
                            <Package className="h-4 w-4" /> Catálogo & Simulador
                        </Button>
                        <Button
                            variant={showOfferBuilder ? "default" : "outline"}
                            onClick={() => setShowOfferBuilder(true)}
                            className="rounded-xl gap-2"
                        >
                            <Sparkles className="h-4 w-4" /> Construir Nova Oferta
                        </Button>
                    </div>

                    {showOfferBuilder ? (
                        <OfferBuilder />
                    ) : (
                    <>
                    <div className="grid gap-8 lg:grid-cols-12">
                        {/* Revenue Goal Simulator - LEFT SIDE (7 columns) */}
                        <Card className="lg:col-span-7 border-none shadow-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                                <Sparkles className="w-64 h-64" />
                            </div>

                            <CardHeader className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="bg-primary/20 p-1.5 rounded-lg backdrop-blur-md border border-primary/30">
                                        <Target className="h-5 w-5 text-primary" />
                                    </div>
                                    <Badge variant="outline" className="text-primary-foreground/70 border-primary-foreground/20 text-[10px] uppercase font-black tracking-widest">Revenue Roadmap</Badge>
                                </div>
                                <CardTitle className="text-3xl font-black tracking-tighter">O Caminho do $ 1 Mi</CardTitle>
                                <CardDescription className="text-slate-400">Quanto você quer faturar hoje? Simule sua escala de forma visual.</CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-8 relative z-10 pb-8">
                                <div className="space-y-4">
                                    <Label className="text-xs font-black uppercase text-slate-500 tracking-widest">Sua Meta Mensal Desejada</Label>
                                    <div className="relative group/input">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-2xl group-focus-within/input:scale-110 transition-transform">R$</div>
                                        <Input
                                            type="number"
                                            placeholder={monthlyGoal.toString()}
                                            className="pl-14 h-20 text-4xl font-black bg-white/5 border-white/10 text-white focus:ring-primary focus:border-primary rounded-2xl transition-all hover:bg-white/10"
                                            value={revenueGoal}
                                            onChange={(e) => setRevenueGoal(e.target.value)}
                                        />
                                        <Button
                                            size="lg"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 h-14 px-8 font-black text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 rounded-xl"
                                            onClick={handleCalculateSplit}
                                        >
                                            Simular Roadmap
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8 pt-4">
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Conversão: Lead → Core</Label>
                                                <Badge variant="outline" className="text-primary border-primary/30 font-black">{convLeadToCore}%</Badge>
                                            </div>
                                            <Slider
                                                value={convLeadToCore}
                                                onValueChange={setConvLeadToCore}
                                                max={100}
                                                step={1}
                                                className="py-4"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Conversão: Core → Premium</Label>
                                                <Badge variant="outline" className="text-purple-400 border-purple-500/30 font-black">{convCoreToPremium}%</Badge>
                                            </div>
                                            <Slider
                                                value={convCoreToPremium}
                                                onValueChange={setConvCoreToPremium}
                                                max={20}
                                                step={0.5}
                                                className="py-4"
                                            />
                                        </div>
                                    </div>

                                    {calculatedTargets && (
                                        <Card className={cn(
                                            "border-none shadow-xl backdrop-blur-md transition-all duration-500",
                                            calculatedTargets.viability.isPossible
                                                ? "bg-emerald-500/10 border-l-4 border-l-emerald-500"
                                                : "bg-red-500/10 border-l-4 border-l-red-500"
                                        )}>
                                            <CardContent className="p-6 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "p-2 rounded-lg",
                                                        calculatedTargets.viability.isPossible ? "bg-emerald-500/20" : "bg-red-500/20"
                                                    )}>
                                                        <Clock className={cn(
                                                            "h-5 w-5",
                                                            calculatedTargets.viability.isPossible ? "text-emerald-500" : "text-red-500"
                                                        )} />
                                                    </div>
                                                    <h4 className="font-black text-xs uppercase tracking-widest">Viabilidade de Agenda</h4>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="text-3xl font-black flex items-baseline gap-2">
                                                        {calculatedTargets.viability.needed}h
                                                        <span className="text-sm font-normal text-slate-500">/ {calculatedTargets.viability.available}h mensais</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-medium">Capacidade baseada no seu perfil.</p>
                                                </div>

                                                {!calculatedTargets.viability.isPossible && (
                                                    <div className="flex items-start gap-2 p-3 bg-red-500/20 rounded-xl border border-red-500/30">
                                                        <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                                        <p className="text-[10px] text-red-200 leading-tight">
                                                            **ALERTA DE BURNOUT:** Esta meta exige mais horas do que você tem disponível. Considere aumentar os preços ou automatizar processos.
                                                        </p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>

                                {calculatedTargets ? (
                                    <div className="pt-4">
                                        <div className="relative h-64 w-full flex items-end justify-center gap-2 mb-8 pt-10">
                                            {/* Visual Funnel simulation using CSS bars */}
                                            <div className="flex flex-col items-center flex-1 group/bar">
                                                <div className="text-[10px] font-black mb-2 opacity-50 uppercase tracking-tighter">Vendas</div>
                                                <div className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-700 hover:scale-x-105"
                                                    style={{ height: '140px', minHeight: '40px' }}>
                                                    <div className="h-full w-full flex items-center justify-center font-black text-3xl">x{calculatedTargets.tripwire}</div>
                                                </div>
                                                <Badge className="mt-4 bg-emerald-500/20 text-emerald-400 border-none px-4 py-1 rounded-full text-xs font-black group-hover/bar:bg-emerald-500 group-hover/bar:text-white transition-all">ENTRADA (100%)</Badge>
                                            </div>

                                            <div className="flex flex-col items-center flex-1 group/bar">
                                                <div className="text-[10px] font-black mb-2 opacity-50 uppercase tracking-tighter">Vendas</div>
                                                <div className="w-full bg-gradient-to-t from-primary to-blue-400 rounded-t-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-700 hover:scale-x-105"
                                                    style={{ height: '180px', minHeight: '60px' }}>
                                                    <div className="h-full w-full flex items-center justify-center font-black text-3xl">x{calculatedTargets.core}</div>
                                                </div>
                                                <Badge className="mt-4 bg-primary/20 text-primary border-none px-4 py-1 rounded-full text-xs font-black group-hover/bar:bg-primary group-hover/bar:text-white transition-all">CORE (10%)</Badge>
                                            </div>

                                            <div className="flex flex-col items-center flex-1 group/bar">
                                                <div className="text-[10px] font-black mb-2 opacity-50 uppercase tracking-tighter">Vendas</div>
                                                <div className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-2xl shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-700 hover:scale-x-105"
                                                    style={{ height: '220px', minHeight: '80px' }}>
                                                    <div className="h-full w-full flex items-center justify-center font-black text-3xl">x{calculatedTargets.premium}</div>
                                                </div>
                                                <Badge className="mt-4 bg-purple-500/20 text-purple-400 border-none px-4 py-1 rounded-full text-xs font-black group-hover/bar:bg-purple-500 group-hover/bar:text-white transition-all">VIP (1%)</Badge>
                                            </div>
                                        </div>

                                        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md flex items-start gap-4 hover:border-primary/50 transition-colors">
                                            <div className="bg-primary/20 p-2 rounded-xl">
                                                <Trophy className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-sm text-white">Estratégia do Maestro Pro:</h4>
                                                <p className="text-xs text-slate-400 leading-relaxed">
                                                    Para bater R$ {parseFloat(revenueGoal).toLocaleString('pt-BR')} você não precisa de milhares de clientes VIP.
                                                    O segredo está no volume da **Base (Entrada)** que financia seu tráfego, enquanto o **Lucro Real** vem da conversão de 10% para o Core e 1% para o VIP.
                                                    *Este é um modelo de faturamento previsível.*
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                                        <div className="w-20 h-20 rounded-full border-2 border-dashed border-white flex items-center justify-center">
                                            <TrendingUp className="h-8 w-8" />
                                        </div>
                                        <p className="text-sm italic">Insira sua meta acima para ver o seu roadmap de escala visualmente.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Product Management - RIGHT SIDE (5 columns) */}
                        <div className="lg:col-span-5 space-y-6">
                            <Card className="border-none shadow-xl bg-card/60 backdrop-blur-xl">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-xl font-bold">Catálogo Direto</CardTitle>
                                            <CardDescription>Produtos cadastrados na sua escada.</CardDescription>
                                        </div>
                                        <Badge variant="secondary" className="font-bold">{products?.length || 0} Itens</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {products && products.length > 0 ? (
                                            products
                                                .sort((a, b) => a.ticket - b.ticket)
                                                .map((product) => (
                                                    <div key={product.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-primary/40 hover:bg-white/10 transition-all group">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-sm">{product.nome}</span>
                                                                <Badge className="text-[8px] h-4 uppercase tracking-tighter" variant="outline">
                                                                    {(product as any).ladder_stage || product.tipo_produto}
                                                                </Badge>
                                                                {(product as any).ladder_stage === 'premium' && (
                                                                    <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] text-muted-foreground line-clamp-1">{product.descricao || 'Sem descrição'}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-black text-primary text-sm">
                                                                R$ {product.ticket.toLocaleString("pt-BR")}
                                                            </span>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 transition-all"
                                                                onClick={() => deleteProduct(product.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))
                                        ) : (
                                            <div className="text-center py-10 opacity-30">
                                                <Package className="h-10 w-10 mx-auto mb-2" />
                                                <p className="text-xs italic">Nenhum produto na sua escada.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Add Product Inline Trigger/Form */}
                                    <Button variant="outline" className="w-full border-dashed py-6 gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all rounded-2xl" onClick={() => setActiveTab("ladder")} onClickCapture={() => document.getElementById('product-form-section')?.scrollIntoView({ behavior: 'smooth' })}>
                                        <Plus className="h-4 w-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Adicionar Nova Oferta</span>
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-lg bg-emerald-500/5 border border-emerald-500/10">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-emerald-500/20 p-2 rounded-lg">
                                            <Target className="h-5 w-5 text-emerald-500" />
                                        </div>
                                        <h4 className="font-black text-xs uppercase tracking-widest text-emerald-600">Dica de Precificação</h4>
                                    </div>
                                    <p className="text-[11px] text-emerald-700/70 leading-relaxed italic">
                                        "Produtos de entrada devem ter valor percebido 10x maior que o preço de etiqueta.
                                        Preços terminados em **.00** transmitem sofisticação; terminados em **.90** transmitem oportunidade."
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Quick Add Product Form */}
                    <Card id="product-form-section" className="border-white/10 bg-card/40 backdrop-blur-md overflow-hidden">
                        <div className="bg-primary/5 p-4 border-b border-white/5 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <h4 className="text-sm font-black uppercase tracking-widest">Cadastrar Novo Produto</h4>
                        </div>
                        <CardContent className="p-8">
                            <div className="grid gap-6 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nome do Produto</Label>
                                    <Input
                                        value={newProduct.nome}
                                        onChange={(e) => setNewProduct({ ...newProduct, nome: e.target.value })}
                                        placeholder="Ex: Consultoria Nutri Express"
                                        className="h-12 bg-white/5 border-white/10 focus:ring-primary rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Preço (R$)</Label>
                                    <Input
                                        type="number"
                                        value={newProduct.ticket}
                                        onChange={(e) => setNewProduct({ ...newProduct, ticket: e.target.value })}
                                        placeholder="997"
                                        className="h-12 bg-white/5 border-white/10 focus:ring-primary rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tipo de Produto</Label>
                                    <Select value={newProduct.tipo_produto} onValueChange={(v) => setNewProduct({ ...newProduct, tipo_produto: v })}>
                                        <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="consultoria">Consultoria</SelectItem>
                                            <SelectItem value="mentoria">Mentoria</SelectItem>
                                            <SelectItem value="curso">Curso</SelectItem>
                                            <SelectItem value="grupo">Grupo</SelectItem>
                                            <SelectItem value="desafio">Desafio</SelectItem>
                                            <SelectItem value="ebook">E-book / PDF</SelectItem>
                                            <SelectItem value="outro">Outro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Papel na Escada</Label>
                                    <Select value={newProduct.ladder_stage} onValueChange={(v) => setNewProduct({ ...newProduct, ladder_stage: v })}>
                                        <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="isca">Isca (Grátis/Baixo)</SelectItem>
                                            <SelectItem value="entrada">Entrada (Tripwire)</SelectItem>
                                            <SelectItem value="core">Core (Serviço Principal)</SelectItem>
                                            <SelectItem value="premium">Premium (VIP/High Ticket)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Horas por Atendimento</Label>
                                    <Input
                                        type="number"
                                        value={newProduct.hours_spent}
                                        onChange={(e) => setNewProduct({ ...newProduct, hours_spent: e.target.value })}
                                        placeholder="2"
                                        className="h-12 bg-white/5 border-white/10 focus:ring-primary rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">&nbsp;</Label>
                                    <Button onClick={handleAddProduct} className="w-full h-12 font-black uppercase tracking-widest rounded-xl transition-all active:scale-[0.98]">
                                        <Plus className="h-4 w-4 mr-2" /> Cadastrar Produto
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    </>
                    )}
                </TabsContent>

                {/* Simulador (PricingCalculator) */}
                <TabsContent value="simulator" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <PricingCalculator />
                </TabsContent>

                {/* CFO Consultant */}
                <TabsContent value="cfo" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <CFOConsultant />
                </TabsContent>
            </Tabs>
        </AppLayout>
    );
}
