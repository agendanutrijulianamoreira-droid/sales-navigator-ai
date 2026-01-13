import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { User, Mail, Shield, LogOut } from "lucide-react";
import { toast } from "sonner";

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
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={profile?.nome || ""}
                onChange={(e) => updateProfile({ nome: e.target.value })}
                placeholder="Seu nome"
              />
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
