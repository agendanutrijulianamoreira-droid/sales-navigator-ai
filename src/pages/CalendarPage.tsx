import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAISpecialist } from "@/hooks/useAISpecialist";
import { useGenerations } from "@/hooks/useGenerations";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Calendar, Plus, Copy, Check, Image, FileText, Video, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const POST_TYPES = [
  { value: "carrossel", label: "Carrossel", icon: Image, description: "Educativo e engajador" },
  { value: "reels", label: "Reels/Vídeo", icon: Video, description: "Viral e dinâmico" },
  { value: "stories", label: "Stories", icon: MessageCircle, description: "Conexão diária" },
  { value: "post_unico", label: "Post Único", icon: FileText, description: "Impacto direto" },
];

const CONTENT_PILLARS = [
  "Educativo", "Autoridade", "Bastidores", "Prova Social",
  "Entretenimento", "Oferta", "Conexão"
];

export default function CalendarPage() {
  const { generateContent, isLoading, streamedContent } = useAISpecialist();
  const { saveGeneration } = useGenerations();
  const [postType, setPostType] = useState("carrossel");
  const [pillar, setPillar] = useState("");
  const [topic, setTopic] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic) {
      toast.error("Digite o tema do post");
      return;
    }

    await generateContent("social_media_manager", postType, {
      tipo: postType,
      pilar: pillar,
      tema: topic,
    });
  };

  const handleCopy = () => {
    if (streamedContent) {
      navigator.clipboard.writeText(streamedContent);
      setCopied(true);
      toast.success("Copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = async () => {
    if (streamedContent) {
      await saveGeneration({
        tipo: "post",
        subtipo: postType,
        specialist: "social_media_manager",
        output_content: streamedContent,
        titulo: topic,
        input_data: { pillar, topic, postType },
        favorito: false,
        tags: [],
      });
      toast.success("Salvo com sucesso!");
    }
  };

  return (
    <AppLayout title="Calendário" description="Social Media Manager">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Generator */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Criar Conteúdo
              </CardTitle>
              <CardDescription>Gere posts que convertem seguidores em clientes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Post Type */}
              <div className="space-y-2">
                <Label>Tipo de Conteúdo</Label>
                <div className="grid grid-cols-2 gap-2">
                  {POST_TYPES.map((type) => (
                    <div
                      key={type.value}
                      onClick={() => setPostType(type.value)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${postType === type.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        <span className="font-medium text-sm">{type.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pillar */}
              <div className="space-y-2">
                <Label>Pilar de Conteúdo</Label>
                <div className="flex flex-wrap gap-2">
                  {CONTENT_PILLARS.map((p) => (
                    <Badge
                      key={p}
                      variant={pillar === p ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setPillar(p)}
                    >
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Topic */}
              <div className="space-y-2">
                <Label>Tema do Post</Label>
                <Textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Sobre o que você quer falar? (Ex: Por que contar calorias não funciona)"
                  rows={3}
                />
              </div>

              <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Gerar Conteúdo
              </Button>
            </CardContent>
          </Card>

          {/* Quick Ideas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ideias Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[
                  "Mito vs Verdade",
                  "Antes e Depois",
                  "Dia na minha rotina",
                  "Erro comum",
                  "Dica prática",
                  "Depoimento de paciente",
                ].map((idea) => (
                  <Badge
                    key={idea}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setTopic(idea)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {idea}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output */}
        <Card className="h-fit">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Conteúdo Gerado
              </CardTitle>
              {streamedContent && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleSave}>
                    Salvar
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {streamedContent ? (
              <div className="prose prose-sm max-w-none whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                {streamedContent}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Seu conteúdo aparecerá aqui</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
