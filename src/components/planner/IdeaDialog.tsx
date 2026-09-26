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

export interface IdeaValues {
  titulo: string;
  data: string;
  tipo: FormatKey;
  status: string;
  notas: string;
  conteudo_corpo: string;
  horario: string;
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
  const empty: IdeaValues = { titulo: "", data: defaultDate, tipo: "carrossel", status: "rascunho", notas: "", conteudo_corpo: "", horario: "" };
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
      });
    } else setV({ ...empty, data: defaultDate });
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
