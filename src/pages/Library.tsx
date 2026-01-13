import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGenerations } from "@/hooks/useGenerations";
import { 
  BookOpen, Search, Star, StarOff, Trash2, Copy, Check, 
  Calendar, FileText, MessageSquare, Trophy, Filter
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  post: { label: "Posts", icon: Calendar, color: "text-green-500" },
  material: { label: "Materiais", icon: FileText, color: "text-blue-500" },
  desafio: { label: "Desafios", icon: Trophy, color: "text-purple-500" },
  mensagem_vip: { label: "Mensagens VIP", icon: MessageSquare, color: "text-orange-500" },
};

export default function Library() {
  const { generations, toggleFavorite, deleteGeneration, isLoading } = useGenerations();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredGenerations = generations?.filter((gen) => {
    const matchesSearch = 
      gen.titulo?.toLowerCase().includes(search.toLowerCase()) ||
      gen.output_content.toLowerCase().includes(search.toLowerCase());
    
    const matchesTab = activeTab === "all" || 
      (activeTab === "favorites" && gen.favorito) ||
      gen.tipo === activeTab;

    return matchesSearch && matchesTab;
  });

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success("Copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir?")) {
      await deleteGeneration(id);
      toast.success("Excluído!");
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <AppLayout title="Biblioteca" description="Tudo que você gerou">
      <div className="space-y-6">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título ou conteúdo..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="all">
              Todos ({generations?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              Favoritos
            </TabsTrigger>
            {Object.entries(TYPE_CONFIG).map(([key, config]) => (
              <TabsTrigger key={key} value={key} className="flex items-center gap-1">
                <config.icon className={cn("h-3 w-3", config.color)} />
                {config.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredGenerations && filteredGenerations.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredGenerations.map((gen) => {
                  const typeConfig = TYPE_CONFIG[gen.tipo] || { 
                    label: gen.tipo, 
                    icon: FileText, 
                    color: "text-gray-500" 
                  };
                  const TypeIcon = typeConfig.icon;

                  return (
                    <Card key={gen.id} className="flex flex-col">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <TypeIcon className={cn("h-4 w-4", typeConfig.color)} />
                            <Badge variant="secondary" className="text-xs">
                              {typeConfig.label}
                            </Badge>
                            {gen.subtipo && (
                              <Badge variant="outline" className="text-xs">
                                {gen.subtipo}
                              </Badge>
                            )}
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => toggleFavorite(gen.id, !gen.favorito)}
                          >
                            {gen.favorito ? (
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <CardTitle className="text-sm line-clamp-1">
                          {gen.titulo || "Sem título"}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {formatDate(gen.created_at)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <div className="flex-1 bg-muted/50 rounded-lg p-3 mb-4 max-h-40 overflow-y-auto">
                          <p className="text-xs whitespace-pre-wrap line-clamp-6">
                            {gen.output_content}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleCopy(gen.id, gen.output_content)}
                          >
                            {copiedId === gen.id ? (
                              <Check className="h-4 w-4 mr-1" />
                            ) : (
                              <Copy className="h-4 w-4 mr-1" />
                            )}
                            Copiar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(gen.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-16 w-16 text-muted-foreground/20 mb-4" />
                  <h3 className="font-medium mb-2">
                    {search ? "Nenhum resultado encontrado" : "Biblioteca vazia"}
                  </h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    {search 
                      ? "Tente buscar por outros termos" 
                      : "Comece a gerar conteúdo e tudo será salvo aqui automaticamente!"
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
