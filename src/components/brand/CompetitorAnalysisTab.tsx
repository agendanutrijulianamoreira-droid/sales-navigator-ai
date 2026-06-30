import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Swords, Users } from "lucide-react";
import { useCompetitors } from "@/hooks/useCompetitors";
import { CompetitorType, PositioningStrength, emptyCompetitorDraft } from "@/types/competitor";

export function CompetitorAnalysisTab() {
  const { competitors, addCompetitor, updateCompetitor, deleteCompetitor } = useCompetitors();

  return (
    <div className="space-y-6">
      <Card className="border-primary/10 bg-primary/5">
        <CardContent className="pt-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Swords className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Análise de Concorrência</h3>
              <p className="text-xs text-muted-foreground">
                Acompanhe perfis de referência (diretos ou de inspiração) para entender posicionamento e ritmo de postagem.
              </p>
            </div>
          </div>
          <Button size="sm" className="gap-2" onClick={() => addCompetitor(emptyCompetitorDraft())}>
            <Plus className="h-4 w-4" /> Adicionar concorrente
          </Button>
        </CardContent>
      </Card>

      {competitors.length === 0 && (
        <Card className="border-dashed border-primary/20">
          <CardContent className="py-10 flex flex-col items-center text-center gap-2">
            <Users className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Nenhum concorrente cadastrado ainda.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {competitors.map((c) => (
          <Card key={c.id} className="border-primary/10">
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
                <div className="space-y-1">
                  <Label className="text-[11px]">Nome</Label>
                  <Input value={c.nome} onChange={(e) => updateCompetitor(c.id, { nome: e.target.value })} placeholder="Ex: Luiza Barreto" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px]">@handle</Label>
                  <Input value={c.handle} onChange={(e) => updateCompetitor(c.id, { handle: e.target.value })} placeholder="@perfil" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px]">Seguidores</Label>
                  <Input value={c.seguidores} onChange={(e) => updateCompetitor(c.id, { seguidores: e.target.value })} placeholder="Ex: 18k" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px]">Frequência</Label>
                  <Input value={c.frequencia} onChange={(e) => updateCompetitor(c.id, { frequencia: e.target.value })} placeholder="Ex: 3x/semana" />
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500 shrink-0" onClick={() => deleteCompetitor(c.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="space-y-1.5">
                  <Label className="text-[11px]">Tipo</Label>
                  <RadioGroup
                    value={c.tipo}
                    onValueChange={(v) => updateCompetitor(c.id, { tipo: v as CompetitorType })}
                    className="flex gap-4"
                  >
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="direto" id={`tipo-direto-${c.id}`} />
                      <Label htmlFor={`tipo-direto-${c.id}`} className="text-xs cursor-pointer">Direto</Label>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="inspiracao" id={`tipo-insp-${c.id}`} />
                      <Label htmlFor={`tipo-insp-${c.id}`} className="text-xs cursor-pointer">Inspiração</Label>
                    </div>
                  </RadioGroup>
                </div>
                <Badge variant={c.tipo === "direto" ? "default" : "secondary"} className="text-[10px]">
                  {c.tipo === "direto" ? "Concorrente direto" : "Referência de inspiração"}
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px]">O que esse perfil vende?</Label>
                  <Input value={c.oQueVende} onChange={(e) => updateCompetitor(c.id, { oQueVende: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px]">Diferencial percebido</Label>
                  <Input value={c.diferencial} onChange={(e) => updateCompetitor(c.id, { diferencial: e.target.value })} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px]">Classificação do posicionamento</Label>
                <RadioGroup
                  value={c.classificacao}
                  onValueChange={(v) => updateCompetitor(c.id, { classificacao: v as PositioningStrength })}
                  className="flex gap-4"
                >
                  {[
                    { value: "forte", label: "Forte" },
                    { value: "generico", label: "Genérico" },
                    { value: "confuso", label: "Confuso" },
                  ].map((opt) => (
                    <div key={opt.value} className="flex items-center gap-1.5">
                      <RadioGroupItem value={opt.value} id={`class-${opt.value}-${c.id}`} />
                      <Label htmlFor={`class-${opt.value}-${c.id}`} className="text-xs cursor-pointer">{opt.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px]">Observações / recomendações</Label>
                <Textarea
                  rows={2}
                  value={c.observacoes}
                  onChange={(e) => updateCompetitor(c.id, { observacoes: e.target.value })}
                  placeholder="O que dá pra aprender ou se diferenciar..."
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
