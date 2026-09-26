import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { FORMATS, type FormatKey } from "./formats";

export interface GenerateOptions {
  period: "weekly" | "monthly";
  perWeek: number;
  objective: string;
  formats: FormatKey[];
}

const CADENCES = [
  { v: 3, label: "Baixa (3x/sem)" },
  { v: 5, label: "Média (5x/sem)" },
  { v: 7, label: "Alta (7x/sem)" },
];
const OBJECTIVES = [
  { v: "engajamento", label: "Engajamento" },
  { v: "vender", label: "Vender" },
  { v: "crescer", label: "Crescer" },
  { v: "todos", label: "Todos" },
];

function Chip({ active, onClick, children, pill }: { active: boolean; onClick: () => void; children: React.ReactNode; pill?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-4 py-2 text-sm font-medium transition-colors ${pill ? "rounded-full" : "rounded-lg"} ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"}`}
    >
      {children}
    </button>
  );
}

export function GenerateCalendarDialog({ open, onOpenChange, onGenerate, loading, progress }: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onGenerate: (o: GenerateOptions) => void;
  loading: boolean;
  progress?: string;
}) {
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const [perWeek, setPerWeek] = useState(5);
  const [objective, setObjective] = useState<string | null>(null);
  const [formats, setFormats] = useState<FormatKey[]>([]);
  const allKeys = Object.keys(FORMATS) as FormatKey[];

  const toggleFormat = (k: FormatKey) =>
    setFormats((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
  const allSelected = formats.length === allKeys.length;
  const ready = objective && formats.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl"><Sparkles className="h-5 w-5 text-primary" />Gerar calendário</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <section className="space-y-2">
            <p className="text-sm font-semibold">Período</p>
            <div className="flex gap-2">
              <Chip active={period === "weekly"} onClick={() => setPeriod("weekly")}>Semanal</Chip>
              <Chip active={period === "monthly"} onClick={() => setPeriod("monthly")}>Mensal</Chip>
            </div>
          </section>
          <section className="space-y-2">
            <p className="text-sm font-semibold">Cadência</p>
            <div className="grid grid-cols-3 gap-2">
              {CADENCES.map((c) => <Chip key={c.v} active={perWeek === c.v} onClick={() => setPerWeek(c.v)}>{c.label}</Chip>)}
            </div>
          </section>
          <section className="space-y-2">
            <p className="text-sm font-semibold">Objetivo</p>
            <div className="flex flex-wrap gap-2">
              {OBJECTIVES.map((o) => <Chip pill key={o.v} active={objective === o.v} onClick={() => setObjective(o.v)}>{o.label}</Chip>)}
            </div>
          </section>
          <section className="space-y-2">
            <p className="text-sm font-semibold">Formatos</p>
            <div className="flex flex-wrap gap-2">
              {allKeys.map((k) => <Chip pill key={k} active={formats.includes(k)} onClick={() => toggleFormat(k)}>{FORMATS[k].label}</Chip>)}
              <Chip pill active={allSelected} onClick={() => setFormats(allSelected ? [] : allKeys)}>Todos</Chip>
            </div>
          </section>
          {loading && progress && <p className="text-sm text-muted-foreground">{progress}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
            <Button disabled={!ready || loading} onClick={() => objective && formats.length && onGenerate({ period, perWeek, objective, formats })}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Gerar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
