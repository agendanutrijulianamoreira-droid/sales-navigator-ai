import { useState } from "react";
import { CalendarDays, Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type GenerationPeriod = "single" | "weekly" | "biweekly" | "monthly";

export const GENERATION_PERIODS: Record<GenerationPeriod, { label: string; detail: string; days: number; posts: number }> = {
  single: { label: "1 post", detail: "Uma ideia prioritária para o próximo dia", days: 1, posts: 1 },
  weekly: { label: "Semanal", detail: "3 rascunhos distribuídos em 7 dias", days: 7, posts: 3 },
  biweekly: { label: "Quinzenal", detail: "6 rascunhos distribuídos em 15 dias", days: 15, posts: 6 },
  monthly: { label: "Mensal", detail: "12 rascunhos distribuídos em 30 dias", days: 30, posts: 12 },
};

interface GeneratePostsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (period: GenerationPeriod) => Promise<void>;
  isGenerating: boolean;
  progress?: string;
  hasStrategy: boolean;
}

export function GeneratePostsDialog({
  open,
  onOpenChange,
  onGenerate,
  isGenerating,
  progress,
  hasStrategy,
}: GeneratePostsDialogProps) {
  const [selected, setSelected] = useState<GenerationPeriod>("weekly");

  return (
    <Dialog open={open} onOpenChange={(next) => !isGenerating && onOpenChange(next)}>
      <DialogContent className="sm:max-w-2xl overflow-hidden p-0">
        <div className="border-b bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-6 py-6">
          <DialogHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <CalendarDays className="h-5 w-5" />
            </div>
            <DialogTitle className="text-2xl">Gerar rascunhos estratégicos</DialogTitle>
            <DialogDescription className="max-w-xl text-sm leading-relaxed">
              O Maestro cruza o período com seu posicionamento, produtos e estratégia do Laboratório. Os conteúdos entram no calendário como rascunhos editáveis.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-5 px-6 py-5">
          {!hasStrategy && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Ainda não há estratégia anual salva. A IA usará o perfil e os produtos do Laboratório; você poderá gerar uma estratégia depois para deixar o calendário ainda mais preciso.
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.entries(GENERATION_PERIODS) as Array<[GenerationPeriod, typeof GENERATION_PERIODS[GenerationPeriod]]>).map(([key, option]) => {
              const active = selected === key;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={isGenerating}
                  onClick={() => setSelected(key)}
                  className={cn(
                    "relative rounded-2xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    active
                      ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                      : "border-border bg-background hover:border-primary/40 hover:bg-muted/30",
                  )}
                >
                  <span className="block pr-8 text-base font-bold text-foreground">{option.label}</span>
                  <span className="mt-1 block text-sm leading-snug text-muted-foreground">{option.detail}</span>
                  <span className={cn(
                    "absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border",
                    active ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30",
                  )}>
                    {active && <Check className="h-3.5 w-3.5" />}
                  </span>
                </button>
              );
            })}
          </div>

          {isGenerating && (
            <div className="flex items-center gap-3 rounded-xl bg-muted/60 px-4 py-3 text-sm font-medium">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              {progress || "Criando rascunhos..."}
            </div>
          )}
        </div>

        <DialogFooter className="border-t bg-muted/20 px-6 py-4 sm:justify-between">
          <p className="hidden text-xs text-muted-foreground sm:block">
            Você poderá editar título, texto, identidade e imagens antes de publicar.
          </p>
          <Button onClick={() => onGenerate(selected)} disabled={isGenerating} className="gap-2 sm:min-w-44">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Gerar {GENERATION_PERIODS[selected].posts} {GENERATION_PERIODS[selected].posts === 1 ? "rascunho" : "rascunhos"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
