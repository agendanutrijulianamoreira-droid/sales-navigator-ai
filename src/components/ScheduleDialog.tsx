import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Loader2, Clock, Tag, FileText, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSchedule: (data: { date: string; tipo: string; titulo: string; notas?: string; status?: string; horario?: string }) => Promise<void>;
  defaultTitle?: string;
  defaultTipo?: string;
  defaultDate?: Date;
}

const CONTENT_TYPES = [
  { value: "carrossel", label: "Carrossel", color: "bg-violet-500", emoji: "🖼️" },
  { value: "post_unico", label: "Post Único", color: "bg-emerald-500", emoji: "📸" },
  { value: "reels", label: "Reels", color: "bg-pink-500", emoji: "🎬" },
  { value: "stories", label: "Stories", color: "bg-amber-500", emoji: "✨" },
  { value: "levantada", label: "Levantada de Mão", color: "bg-red-500", emoji: "🙋" },
];

const STATUS_OPTIONS = [
  { value: "planejado", label: "Planejado", dot: "bg-gray-400" },
  { value: "rascunho", label: "Rascunho", dot: "bg-amber-400" },
  { value: "pronto", label: "Pronto", dot: "bg-blue-500" },
  { value: "agendado", label: "Agendado", dot: "bg-purple-500" },
];

const SUGGESTED_TIMES = [
  { label: "8h30 (Stories manhã)", value: "08:30" },
  { label: "10h (Conversão sábado)", value: "10:00" },
  { label: "18h (Reels sexta)", value: "18:00" },
  { label: "19h30 (Carrossel noite)", value: "19:30" },
];

export function ScheduleDialog({
  open,
  onOpenChange,
  onSchedule,
  defaultTitle = "",
  defaultTipo = "carrossel",
  defaultDate,
}: ScheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(defaultDate || addDays(new Date(), 1));
  const [titulo, setTitulo] = useState(defaultTitle);
  const [tipo, setTipo] = useState(defaultTipo);
  const [notas, setNotas] = useState("");
  const [status, setStatus] = useState("planejado");
  const [horario, setHorario] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedDate(defaultDate || addDays(new Date(), 1));
      setTitulo(defaultTitle);
      setTipo(defaultTipo);
      setNotas("");
      setStatus("planejado");
      setHorario("");
    }
  }, [open, defaultDate, defaultTitle, defaultTipo]);

  const handleSchedule = async () => {
    if (!selectedDate || !titulo.trim()) return;
    setIsScheduling(true);
    try {
      await onSchedule({
        date: format(selectedDate, "yyyy-MM-dd"),
        tipo,
        titulo: titulo.trim(),
        notas: notas.trim() || undefined,
        status,
        horario: horario || undefined,
      });
      onOpenChange(false);
    } finally {
      setIsScheduling(false);
    }
  };

  const selectedType = CONTENT_TYPES.find(t => t.value === tipo);
  const selectedStatus = STATUS_OPTIONS.find(s => s.value === status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <CalendarIcon className="h-4 w-4 text-primary" />
            </div>
            Novo Post no Calendário
          </DialogTitle>
        </DialogHeader>

        <div className="flex divide-x divide-gray-100">
          {/* Left: Form */}
          <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[75vh]">
            {/* Título */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Título do Post
              </Label>
              <Input
                autoFocus
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: 5 sinais de SOP que médicos ignoram"
                className="h-9 text-sm border-gray-200 focus:border-primary/40"
                onKeyDown={(e) => e.key === "Enter" && handleSchedule()}
              />
            </div>

            {/* Tipo */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> Tipo de Conteúdo
              </Label>
              <div className="grid grid-cols-5 gap-1.5">
                {CONTENT_TYPES.map((ct) => (
                  <button
                    key={ct.value}
                    onClick={() => setTipo(ct.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg border-2 text-[10px] font-semibold transition-all",
                      tipo === ct.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    <span className="text-base">{ct.emoji}</span>
                    <span className="leading-tight text-center">{ct.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Status + Horário */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Status
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-9 text-sm border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        <div className="flex items-center gap-2">
                          <span className={cn("w-2 h-2 rounded-full", s.dot)} />
                          {s.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Horário de Publicação
                </Label>
                <Input
                  type="time"
                  value={horario}
                  onChange={(e) => setHorario(e.target.value)}
                  className="h-9 text-sm border-gray-200"
                />
              </div>
            </div>

            {/* Horários sugeridos */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> Horários estratégicos
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_TIMES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setHorario(t.value)}
                    className={cn(
                      "text-[10px] font-medium px-2.5 py-1 rounded-full border transition-all",
                      horario === t.value
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-600">Notas / Gancho / Estratégia</Label>
              <Textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ex: Usar história da paciente com SOP que perdeu 8kg em 3 meses..."
                rows={3}
                className="text-sm border-gray-200 focus:border-primary/40 resize-none"
              />
            </div>

            {/* Preview Badge */}
            {titulo && (
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5">Preview do card</p>
                <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-white text-[10px] font-bold mb-1", selectedType?.color)}>
                  {selectedType?.emoji} {selectedType?.label}
                </div>
                <p className="text-sm font-semibold text-gray-800 leading-snug">{titulo}</p>
                <div className="flex items-center gap-2 mt-1">
                  {selectedDate && (
                    <span className="text-[10px] text-gray-400">
                      {format(selectedDate, "EEE, d MMM", { locale: ptBR })}
                      {horario && ` · ${horario}`}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[10px] text-gray-400">
                    <span className={cn("w-1.5 h-1.5 rounded-full", selectedStatus?.dot)} />
                    {selectedStatus?.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Calendar */}
          <div className="w-72 p-4 flex flex-col items-center gap-3 bg-gray-50/30">
            <Label className="text-xs font-semibold text-gray-600 self-start flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5" /> Data de Publicação
            </Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
              className="rounded-xl border border-gray-100 bg-white shadow-sm scale-95"
            />
            {selectedDate && (
              <div className="w-full text-center p-2 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-xs font-semibold text-primary capitalize">
                  {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="w-full mt-auto pt-2 border-t border-gray-100 flex flex-col gap-2">
              <Button
                onClick={handleSchedule}
                disabled={!selectedDate || !titulo.trim() || isScheduling}
                className="w-full h-9 bg-primary hover:bg-primary/90 text-white font-bold text-sm"
              >
                {isScheduling ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Agendando...</>
                ) : (
                  <><CalendarIcon className="h-4 w-4 mr-2" /> Agendar Post</>
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="w-full h-8 text-sm text-gray-500"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
