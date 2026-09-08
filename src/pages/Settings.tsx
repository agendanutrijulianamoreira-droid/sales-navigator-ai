import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { User, Mail, Shield, LogOut, MessageSquareWarning } from "lucide-react";
import { toast } from "sonner";

const INTENSIDADE_LABELS: Record<string, string> = {
  clinico: "Clínico — responsável, sem exagero",
  equilibrado: "Equilibrado — padrão recomendado",
  agressivo: "Alto impacto — neuromarketing pesado",
};

export default function Settings() {
  const { profile, updateProfile } = useProfile();
  const { user, signOut } = useAuth();

  const handleSave = async () => {
    toast.success("Configurações salvas!");
  };

  return (
    <AppLayout title="Configurações" description="Gerencie seu perfil">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Perfil
            </CardTitle>
            <CardDescription>Suas informações pessoais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Título profissional</Label>
                <Select
                  value={profile?.titulo_profissional || "nenhum"}
                  onValueChange={(v) => updateProfile({ titulo_profissional: v === "nenhum" ? "" : v })}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Sem título</SelectItem>
                    <SelectItem value="Dra.">Dra.</SelectItem>
                    <SelectItem value="Dr.">Dr.</SelectItem>
                    <SelectItem value="Nutricionista">Nutricionista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Registro (CRN)</Label>
                <Input
                  value={profile?.registro_profissional || ""}
                  onChange={(e) => updateProfile({ registro_profissional: e.target.value })}
                  placeholder="Ex: CRN-9 12345"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={profile?.nome || ""}
                onChange={(e) => updateProfile({ nome: e.target.value })}
                placeholder="Seu nome"
              />
              <p className="text-xs text-muted-foreground">
                Assinatura usada pela IA: <strong>{[profile?.titulo_profissional, profile?.nome || "Seu Nome"].filter(Boolean).join(" ")}{profile?.registro_profissional ? ` — ${profile.registro_profissional}` : ""}</strong>
              </p>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={user?.email || ""}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Experiências Marcantes</Label>
              <Textarea
                value={profile?.experiencias_marcantes || ""}
                onChange={(e) => updateProfile({ experiencias_marcantes: e.target.value })}
                placeholder="Suas histórias e experiências que moldam sua marca..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tom e ética da IA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareWarning className="h-5 w-5 text-primary" />
              Tom e Ética do Conteúdo Gerado por IA
            </CardTitle>
            <CardDescription>Controla o quanto a IA usa gatilhos de urgência/medo ao escrever para você</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Intensidade da linguagem</Label>
              <Select
                value={profile?.intensidade_tom || "equilibrado"}
                onValueChange={(v) => updateProfile({ intensidade_tom: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="clinico">Clínico — responsável, sem exagero nem alarme</SelectItem>
                  <SelectItem value="equilibrado">Equilibrado — envolvente, sem sensacionalismo</SelectItem>
                  <SelectItem value="agressivo">Alto impacto — neuromarketing pesado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Termos ou técnicas que a IA nunca deve usar</Label>
              <Textarea
                value={profile?.termos_proibidos || ""}
                onChange={(e) => updateProfile({ termos_proibidos: e.target.value })}
                placeholder="Ex: detox, milagre, cura, prometer emagrecimento sem esforço, comparar corpos"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Branding Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Resumo da Marca</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Nicho</span>
              <span className="font-medium">{profile?.nicho || "Não definido"}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sub-nicho</span>
              <span className="font-medium">{profile?.sub_nicho || "Não definido"}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Arquétipo</span>
              <span className="font-medium">{profile?.arquetipo || "Não definido"}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tom de Voz</span>
              <span className="font-medium capitalize">{profile?.tom_voz || "Não definido"}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Método</span>
              <span className="font-medium">{profile?.nome_metodo || "Não definido"}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Intensidade da IA</span>
              <span className="font-medium">{INTENSIDADE_LABELS[profile?.intensidade_tom || "equilibrado"]}</span>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sair da conta</p>
                <p className="text-sm text-muted-foreground">Encerrar sua sessão atual</p>
              </div>
              <Button variant="outline" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full">
          Salvar Alterações
        </Button>
      </div>
    </AppLayout>
  );
}
