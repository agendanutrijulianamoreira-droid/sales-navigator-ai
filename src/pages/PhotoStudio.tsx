import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAssets } from "@/hooks/useAssets";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import {
  Camera, Upload, Sparkles, Image as ImageIcon,
  CheckCircle2, AlertCircle, Loader2, Trash2, Download,
  User, Briefcase, GraduationCap, Building2, Shirt, Save
} from "lucide-react";
import { toast } from "sonner";

const PHOTO_PACKS = [
  {
    id: "headshot",
    label: "Perfil Editorial",
    description: "Foco no rosto, fundo neutro, iluminação de estúdio. Ideal para LinkedIn e perfis.",
    icon: User,
  },
  {
    id: "consultorio",
    label: "No Consultório",
    description: "Ambiente clínico moderno, transmitindo autoridade e acolhimento.",
    icon: Briefcase,
  },
  {
    id: "palestra",
    label: "Palestrante",
    description: "Você no palco, transmitindo máximo de autoridade e conhecimento.",
    icon: GraduationCap,
  },
  {
    id: "conteudo",
    label: "Criação de Conteúdo",
    description: "Fotos dinâmicas e expressivas, perfeitas para sobrepor textos em posts.",
    icon: Sparkles,
  },
  {
    id: "lifestyle",
    label: "Lifestyle Profissional",
    description: "Momentos naturais em cafés ou ambientes modernos. Estética clean.",
    icon: ImageIcon,
  },
];

const SUCCESS_TIPS = [
  "Use uma foto com o rosto bem iluminado",
  "Evite sombras fortes ou contra-luz",
  "Olhe diretamente para a câmera",
  "Evite acessórios que cubram o rosto (óculos, chapéus)",
  "O fundo da foto original deve ser o mais simples possível"
];

export default function PhotoStudio() {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { assets, loading: assetsLoading, addAsset, deleteAsset } = useAssets();
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedPack, setSelectedPack] = useState("headshot");
  const [scenarioFile, setScenarioFile] = useState<File | null>(null);
  const [scenarioPreviewUrl, setScenarioPreviewUrl] = useState<string | null>(null);
  const [clothingStyle, setClothingStyle] = useState("");
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  useEffect(() => {
    setClothingStyle(profile?.clothing_style_description || "");
  }, [profile?.clothing_style_description]);

  useEffect(() => {
    if (scenarioFile || !profile?.photo_scenario_reference) return;
    let active = true;
    supabase.storage
      .from("assets")
      .createSignedUrl(profile.photo_scenario_reference, 3600)
      .then(({ data }) => {
        if (active && data?.signedUrl) setScenarioPreviewUrl(data.signedUrl);
      });
    return () => { active = false; };
  }, [profile?.photo_scenario_reference, scenarioFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;
    setIsUploading(true);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/base-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      await addAsset({
        tipo: 'foto_base',
        subtipo: null,
        url: publicUrl,
        metadata: { originalName: selectedFile.name, storagePath: filePath }
      });

      toast.success("Foto base carregada com sucesso!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao carregar foto");
    } finally {
      setIsUploading(false);
    }
  };

  const handleScenarioFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Escolha uma imagem para o cenário");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem do cenário deve ter até 5 MB");
      return;
    }
    setScenarioFile(file);
    setScenarioPreviewUrl(URL.createObjectURL(file));
  };

  const handleSavePhotoPreferences = async () => {
    if (!user) return;
    setIsSavingPreferences(true);
    try {
      let scenarioPath = profile?.photo_scenario_reference || null;
      if (scenarioFile) {
        const fileExt = scenarioFile.name.split(".").pop() || "jpg";
        scenarioPath = `${user.id}/photo-scenarios/${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("assets")
          .upload(scenarioPath, scenarioFile, { contentType: scenarioFile.type, upsert: false });
        if (uploadError) throw uploadError;
      }

      const { error } = await updateProfile({
        photo_scenario_reference: scenarioPath,
        clothing_style_description: clothingStyle.trim() || null,
      });
      if (error) throw error;
      setScenarioFile(null);
      toast.success("Direção visual salva para os próximos ensaios");
    } catch (error) {
      console.error("Photo preferences error:", error);
      toast.error("Não foi possível salvar cenário e roupa");
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleGenerate = async () => {
    const basePhoto = assets.find(a => a.tipo === 'foto_base');
    if (!basePhoto) {
      toast.error("Por favor, envie e confirme uma foto base primeiro.");
      return;
    }

    setIsGenerating(true);
    try {
      if (!basePhoto) {
        toast.error("Nenhuma foto base encontrada. Faça upload e confirme antes.");
        return;
      }

      const storagePath = typeof basePhoto.metadata?.storagePath === "string" ? basePhoto.metadata.storagePath : null;
      let basePhotoUrl = basePhoto.url;
      if (storagePath) {
        const { data: signedBase, error: signedBaseError } = await supabase.storage
          .from("assets")
          .createSignedUrl(storagePath, 900);
        if (signedBaseError) throw signedBaseError;
        basePhotoUrl = signedBase.signedUrl;
      }

      let scenarioReferenceUrl: string | undefined;
      if (profile?.photo_scenario_reference) {
        const { data: signedScenario, error: signedScenarioError } = await supabase.storage
          .from("assets")
          .createSignedUrl(profile.photo_scenario_reference, 900);
        if (signedScenarioError) throw signedScenarioError;
        scenarioReferenceUrl = signedScenario.signedUrl;
      }

      const { data, error: functionError } = await supabase.functions.invoke('generate-photo', {
        body: {
          basePhotoUrl,
          pack: selectedPack,
          scenarioReferenceUrl,
          clothingStyleDescription: profile?.clothing_style_description || undefined,
        },
      });

      if (functionError) {
        console.error("[PhotoStudio] generate-photo error detail:", functionError);
        // supabase.functions.invoke returns an object with "message" when failure occurs
        toast.error(functionError.message || "Erro ao gerar foto profissional. Veja os logs da função.");
        throw functionError;
      }

      const { imageUrl } = data;

      if (!imageUrl) {
        toast.error("A função não retornou URL da imagem");
        return;
      }

      await addAsset({
        tipo: 'foto_profissional',
        subtipo: selectedPack,
        url: imageUrl,
        metadata: { generatedBy: 'AI', pack: selectedPack, basePhotoId: basePhoto.id }
      });

      toast.success("Foto profissional gerada com sucesso!");
    } catch (error: unknown) {
      console.error("Generation error:", error);
      // supabase-js returns a generic message when network fails
      const errorMessage = error instanceof Error ? error.message : "";
      if (errorMessage.includes("Failed to send a request")) {
        toast.error(
          "Não foi possível alcançar a função. Verifique se ela está implantada e se o SUPABASE_URL está correto."
        );
      } else {
        toast.error("Erro ao gerar foto profissional. Tente novamente.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const generatedPhotos = assets.filter(a => a.tipo === 'foto_profissional');

  return (
    <AppLayout
      title="Estúdio de Fotos IA"
      description="Transforme uma foto simples em um ensaio profissional para sua marca"
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Coluna de Upload e Configuração */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Sua Foto Base
              </CardTitle>
              <CardDescription>
                Envie uma foto sua com boa iluminação e rosto visível.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all ${previewUrl ? "border-primary/50 bg-primary/5" : "border-muted"
                  }`}
              >
                {previewUrl ? (
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-center">Clique para enviar</p>
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      JPG ou PNG até 5MB
                    </p>
                    <Input
                      type="file"
                      className="hidden"
                      id="photo-upload"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <Label
                      htmlFor="photo-upload"
                      className="absolute inset-0 cursor-pointer"
                    />
                  </>
                )}
              </div>

              <div className="space-y-3 bg-muted/30 p-4 rounded-xl">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Sparkles className="h-3 w-3" />
                  Dicas para o sucesso
                </p>
                {SUCCESS_TIPS.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground leading-tight">
                    <CheckCircle2 className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                    {tip}
                  </div>
                ))}
              </div>

              <Button
                className="w-full"
                disabled={!selectedFile || isUploading}
                onClick={handleUpload}
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                Confirmar Foto Base
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/15">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-primary" />
                Direção visual persistente
              </CardTitle>
              <CardDescription>
                Configure uma vez. A IA reaproveita o ambiente e o estilo de roupa em todos os ensaios.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="scenario-upload" className="text-sm font-medium">
                  Cenário de referência
                </Label>
                <label
                  htmlFor="scenario-upload"
                  className="relative flex min-h-36 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-primary/25 bg-primary/[0.03] focus-within:ring-2 focus-within:ring-ring"
                >
                  {scenarioPreviewUrl ? (
                    <img src={scenarioPreviewUrl} alt="Cenário de referência" className="h-40 w-full object-cover" />
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <Building2 className="mx-auto h-7 w-7 text-primary/60" />
                      <p className="mt-2 text-sm font-medium">Enviar foto do consultório ou ambiente</p>
                      <p className="mt-1 text-xs text-muted-foreground">JPG ou PNG até 5 MB</p>
                    </div>
                  )}
                  <Input
                    id="scenario-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleScenarioFileChange}
                  />
                </label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clothing-style" className="flex items-center gap-2 text-sm font-medium">
                  <Shirt className="h-4 w-4 text-primary" />
                  Estilo de roupa
                </Label>
                <Textarea
                  id="clothing-style"
                  value={clothingStyle}
                  onChange={(event) => setClothingStyle(event.target.value)}
                  maxLength={600}
                  rows={4}
                  placeholder="Ex.: alfaiataria vinho e bege, tecidos sem estampas, joias douradas discretas, sem jaleco."
                />
                <p className="text-right text-[10px] text-muted-foreground">{clothingStyle.length}/600</p>
              </div>

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleSavePhotoPreferences}
                disabled={isSavingPreferences}
              >
                {isSavingPreferences ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar direção visual
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Escolha o Estilo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {PHOTO_PACKS.map((pack) => (
                  <button
                    key={pack.id}
                    onClick={() => setSelectedPack(pack.id)}
                    className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${selectedPack === pack.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:bg-muted"
                      }`}
                  >
                    <div className={`p-2 rounded-md ${selectedPack === pack.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                      <pack.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{pack.label}</p>
                      <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                        {pack.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <Button
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 py-6"
                size="lg"
                disabled={(!selectedFile && !assets.some((asset) => asset.tipo === "foto_base")) || isGenerating}
                onClick={handleGenerate}
              >
                {isGenerating ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-5 w-5 animate-spin mb-1" />
                    <span className="text-[10px] animate-pulse">Revelando foto...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    <span>Gerar Ensaio Profissional</span>
                  </div>
                )}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground">
                Consome 5 créditos de IA por geração
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Coluna de Resultados */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="min-h-[600px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle className="text-xl">Sua Galeria Profissional</CardTitle>
                <CardDescription>
                  Fotos prontas para usar em seus posts e materiais.
                </CardDescription>
              </div>
              <Badge variant="outline" className="h-6">
                {generatedPhotos.length} fotos
              </Badge>
            </CardHeader>
            <CardContent className="flex-1 p-6">
              {assetsLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : generatedPhotos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {generatedPhotos.map((photo) => (
                    <div key={photo.id} className="group relative aspect-[3/4] rounded-xl overflow-hidden border bg-muted">
                      <img
                        src={photo.url}
                        alt="Gerada"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="icon" variant="secondary" className="h-9 w-9" asChild>
                          <a href={photo.url} download target="_blank" rel="noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="h-9 w-9"
                          onClick={() => deleteAsset(photo.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <Badge className="bg-white/90 text-black hover:bg-white/90 text-[10px] h-5">
                          {PHOTO_PACKS.find(p => p.id === photo.subtipo)?.label}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">Nenhuma foto gerada ainda</p>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      Envie sua foto base e escolha um estilo para começar a criar sua galeria profissional.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
