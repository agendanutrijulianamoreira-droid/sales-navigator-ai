import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import type { CalendarItem } from "@/hooks/useCalendarItems";
import { FORMATS, STATUSES, getFormat, type FormatKey } from "./formats";
import { useProducts } from "@/hooks/useProducts";

export interface IdeaValues {
  titulo: string;
  data: string;
  tipo: FormatKey;
  status: string;
  notas: string;
  conteudo_corpo: string;
  horario: string;
  objetivo: string;
  etapa_funil: string;
  campanha: string;
  canal: string;
  produto: string;
  fonte: string;
}

export function IdeaDialog({ open, onOpenChange, item, defaultDate, onSave, onCreate, onDelete }: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  item?: CalendarItem | null;
  defaultDate: string;
  onSave: (v: IdeaValues) => Promise<void>;
  onCreate: (v: IdeaValues) => Promise<void>;
  onDelete?: () => void;
}) {
  const empty: IdeaValues = {
    titulo: "", data: defaultDate, tipo: "carrossel", status: "rascunho", notas: "", conteudo_corpo: "", horario: "",
    objetivo: "", etapa_funil: "", campanha: "", canal: "instagram", produto: "", fonte: "",
  };
  const { products } = useProducts();
  const [v, setV] = useState<IdeaValues>(empty);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (item) {
      const snap = (item.estrategia_snapshot ?? {}) as Record<string, unknown>;
      setV({
        titulo: item.titulo ?? "",
        data: item.data,
        tipo: (item.tipo === "levantada" ? "stories" : item.tipo) as FormatKey,
        status: STATUSES.some((s) => s.value === item.status) ? item.status! : "rascunho",
        notas: item.notas ?? "",
        conteudo_corpo: item.conteudo_corpo ?? "",
        horario: (snap.horario as string) ?? "",
        objetivo: item.objetivo ?? (snap.objetivo as string) ?? "",
        etapa_funil: item.etapa_funil ?? (snap.etapa_funil as string) ?? "",
        campanha: item.campanha ?? (snap.campanha as string) ?? "",
        canal: item.canal ?? "instagram",
        produto: item.produto ?? (snap.produto as string) ?? "",
        fonte: item.fonte ?? (snap.fonte as string) ?? "",
      });
    } else setV({ ...empty, data: defaultDate, objetivo: "", etapa_funil: "", campanha: "", canal: "instagram", produto: "", fonte: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item, defaultDate]);

  const f = getFormat(v.tipo);
  const Icon = f.icon;
  const run = async (fn: (v: IdeaValues) => Promise<void>) => {
    if (!v.titulo.trim()) return;
    setBusy(true);
    try { await fn(v); } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground" style={{ background: `hsl(var(${f.token}))` }}>
              <Icon className="h-5 w-5" />
            </span>
            {item ? "Editar ideia" : "Nova ideia"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Título da ideia</Label>
            <Input value={v.titulo} onChange={(e) => setV({ ...v, titulo: e.target.value })} placeholder="Ex: 5 sinais de que sua alimentação precisa de ajuste" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label>Data</Label>
              <Input type="date" value={v.data} onChange={(e) => setV({ ...v, data: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Horário</Label>
              <Input type="time" value={v.horario} onChange={(e) => setV({ ...v, horario: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Formato</Label>
              <Select value={v.tipo} onValueChange={(x) => setV({ ...v, tipo: x as FormatKey })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(FORMATS) as FormatKey[]).map((k) => <SelectItem key={k} value={k}>{FORMATS[k].label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={v.status} onValueChange={(x) => setV({ ...v, status: x })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Textarea rows={4} value={v.notas} onChange={(e) => setV({ ...v, notas: e.target.value })} placeholder="Sobre o que é este conteúdo?" />
          </div>
          <div className="space-y-1.5">
            <Label>Legenda / notas</Label>
            <Textarea rows={3} value={v.conteudo_corpo} onChange={(e) => setV({ ...v, conteudo_corpo: e.target.value })} placeholder="Anotações adicionais..." />
          </div>
          <div className="rounded-xl border bg-muted/20 p-3">
            <p className="mb-3 text-sm font-semibold">Contexto estratégico</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Objetivo</Label>
                <Select value={v.objetivo || "none"} onValueChange={(x) => setV({ ...v, objetivo: x === "none" ? "" : x })}>
                  <SelectTrigger><SelectValue placeholder="Selecionar objetivo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem objetivo</SelectItem>
                    <SelectItem value="engajamento">Engajamento</SelectItem>
                    <SelectItem value="crescer">Crescer</SelectItem>
                    <SelectItem value="vender">Vender</SelectItem>
                    <SelectItem value="relacionar">Relacionar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Etapa do funil</Label>
                <Select value={v.etapa_funil || "none"} onValueChange={(x) => setV({ ...v, etapa_funil: x === "none" ? "" : x })}>
                  <SelectTrigger><SelectValue placeholder="Selecionar etapa" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem etapa</SelectItem>
                    <SelectItem value="atrair">Atrair</SelectItem>
                    <SelectItem value="nutrir">Nutrir</SelectItem>
                    <SelectItem value="converter">Converter</SelectItem>
                    <SelectItem value="reter">Reter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Canal</Label>
                <Select value={v.canal} onValueChange={(x) => setV({ ...v, canal: x })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="site">Site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Produto/oferta</Label>
                <Select value={v.produto || "none"} onValueChange={(x) => setV({ ...v, produto: x === "none" ? "" : x })}>
                  <SelectTrigger><SelectValue placeholder="Selecionar produto" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Geral</SelectItem>
                    {products.map((product) => <SelectItem key={product.id} value={product.nome}>{product.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Campanha</Label>
                <Input value={v.campanha} onChange={(e) => setV({ ...v, campanha: e.target.value })} placeholder="Ex.: Desafio de 7 dias" />
              </div>
              <div className="space-y-1.5">
                <Label>Fonte/referência</Label>
                <Input value={v.fonte} onChange={(e) => setV({ ...v, fonte: e.target.value })} placeholder="Ex.: estudo, campanha ou ideia original" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            {item && onDelete && (
              <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Excluir"><Trash2 className="h-4 w-4" /></Button>
            )}
            <div className="flex-1" />
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button variant="secondary" disabled={busy || !v.titulo.trim()} onClick={() => run(onSave)}>Salvar</Button>
            <Button disabled={busy || !v.titulo.trim()} onClick={() => run(onCreate)}>Criar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
