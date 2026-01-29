import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAssets } from "@/hooks/useAssets";
import { supabase } from "@/integrations/supabase/client";
import { 
  Camera, Upload, Sparkles, Image as ImageIcon, 
  CheckCircle2, AlertCircle, Loader2, Trash2, Download,
  User, Briefcase, GraduationCap
} from "lucide-react";
import { toast } from "sonner";

const PHOTO_PACKS = [
  { 
    id: "headshot", 
    label: "Perfil Profissional", 
    description: "Fotos de rosto com fundo neutro para perfil e autoridade.",
    icon: User,
    prompts: ["Fundo cinza editorial", "Fundo escritório moderno", "Fundo degradê da marca"]
  },
  { 
    id: "consultorio", 
    label: "No Consultório", 
    description: "Você em um ambiente de atendimento, transmitindo confiança.",
    icon: Briefcase,
    prompts: ["Mesa de atendimento", "Estante de livros", "Ambiente clean e iluminado"]
  },
  { 
    id: "conteudo", 
    label: "Ensinando", 
    description: "Fotos dinâmicas para usar em posts educativos e carrosséis.",
    icon: GraduationCap,
    prompts: ["Segurando tablet", "Apontando para o lado", "Expressão explicativa"]
  },
];

export default function PhotoStudio() {
  const { assets, loading: assetsLoading, addAsset, deleteAsset } = useAssets();
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedPack, setSelectedPack] = useState("headshot");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `base-photos/${fileName}`;

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
        metadata: { originalName: selectedFile.name }
      });

      toast.success("Foto base carregada com sucesso!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao carregar foto");
    } finally {
      setIsUploading(false);
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
      const { data, error: functionError } = await supabase.functions.invoke('generate-photo', {
        body: {
          basePhotoUrl: basePhoto.url,
          pack: selectedPack,
        },
      });

      if (functionError) throw functionError;

      const { imageUrl } = data;
      
      await addAsset({
        tipo: 'foto_profissional',
        subtipo: selectedPack,
        url: imageUrl,
        metadata: { generatedBy: 'AI', pack: selectedPack, basePhotoId: basePhoto.id }
      });

      toast.success("Foto profissional gerada com sucesso!");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Erro ao gerar foto profissional. Tente novamente.");
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
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all ${
                  previewUrl ? "border-primary/50 bg-primary/5" : "border-muted"
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

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Boa iluminação
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Rosto centralizado
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertCircle className="h-3 w-3 text-amber-500" />
                  Evite óculos escuros ou chapéus
                </div>
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
                    className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                      selectedPack === pack.id 
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
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90" 
                size="lg"
                disabled={!selectedFile || isGenerating}
                onClick={handleGenerate}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Gerar Fotos Profissionais
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
