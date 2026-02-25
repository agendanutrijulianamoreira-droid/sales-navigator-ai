import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Sparkles, Trophy, ShoppingBag } from "lucide-react";

interface CreditTopUpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PACKAGES = [
    {
        id: "starter",
        name: "Starter",
        credits: 10,
        price: "R$ 29",
        features: ["10 Gerações de Carrossel", "Reescrita Mágica Ilimitada", "Suporte Prioritário"],
        icon: Zap,
        color: "text-blue-500",
        highlight: false
    },
    {
        id: "pro",
        name: "Pro",
        credits: 50,
        price: "R$ 97",
        badge: "Mais Popular",
        features: ["50 Gerações de Carrossel", "Kit de Marca Premium", "Exportação em HD", "Chat Mentoria IA"],
        icon: Sparkles,
        color: "text-purple-500",
        highlight: true
    },
    {
        id: "elite",
        name: "Elite",
        credits: 200,
        price: "R$ 297",
        features: ["200 Gerações de Carrossel", "Tudo do Pro", "Acesso Antecipado", "Consultoria Estratégica"],
        icon: Trophy,
        color: "text-amber-500",
        highlight: false
    }
];

export function CreditTopUpModal({ isOpen, onClose }: CreditTopUpModalProps) {
    const handlePurchase = (pkgId: string) => {
        // No futuro, aqui redirecionamos para o Stripe/LemonSqueezy
        window.open("https://buy.stripe.com/test_placeholder", "_blank");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-card/50 backdrop-blur-xl border-primary/10">
                <div className="grid md:grid-cols-3 divide-x divide-primary/5">
                    {PACKAGES.map((pkg) => (
                        <div
                            key={pkg.id}
                            className={`p-8 flex flex-col transition-all duration-300 ${pkg.highlight ? "bg-primary/5 relative scale-105 z-10 shadow-2xl" : "hover:bg-primary/5"}`}
                        >
                            {pkg.badge && (
                                <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                                    {pkg.badge}
                                </Badge>
                            )}
                            <div className={`w-12 h-12 rounded-2xl ${pkg.highlight ? "bg-primary text-primary-foreground" : "bg-muted"} flex items-center justify-center mb-6`}>
                                <pkg.icon className="h-6 w-6" />
                            </div>

                            <h3 className="text-xl font-bold mb-1">{pkg.name}</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-3xl font-bold">{pkg.price}</span>
                                <span className="text-muted-foreground text-sm">/único</span>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {pkg.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                onClick={() => handlePurchase(pkg.id)}
                                className={`w-full gap-2 py-6 rounded-xl font-bold ${pkg.highlight ? "bg-gradient-to-r from-primary to-purple-600 shadow-lg shadow-primary/30" : ""}`}
                                variant={pkg.highlight ? "default" : "outline"}
                            >
                                <ShoppingBag className="h-4 w-4" /> Comprar Agora
                            </Button>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
