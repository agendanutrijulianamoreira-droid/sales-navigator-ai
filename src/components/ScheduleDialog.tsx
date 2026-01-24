import { useState } from "react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Loader2 } from "lucide-react";

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSchedule: (data: { date: string; tipo: string; titulo: string }) => Promise<void>;
  defaultTitle?: string;
  defaultTipo?: string;
}

const CONTENT_TYPES = [
  { value: "carrossel", label: "Carrossel" },
  { value: "post_unico", label: "Post Único" },
  { value: "reels", label: "Reels" },
  { value: "stories", label: "Stories" },
  { value: "levantada", label: "Levantada de Mão" },
];

export function ScheduleDialog({
  open,
  onOpenChange,
  onSchedule,
  defaultTitle = "",
  defaultTipo = "carrossel",
}: ScheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [titulo, setTitulo] = useState(defaultTitle);
  const [tipo, setTipo] = useState(defaultTipo);
  const [isScheduling, setIsScheduling] = useState(false);

  const handleSchedule = async () => {
    if (!selectedDate) return;
    
    setIsScheduling(true);
    try {
      await onSchedule({
        date: format(selectedDate, "yyyy-MM-dd"),
        tipo,
        titulo,
      });
      onOpenChange(false);
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Agendar no Calendário
          </DialogTitle>
          <DialogDescription>
            Escolha a data para publicar este conteúdo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Nome do post"
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Conteúdo</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_TYPES.map((ct) => (
                  <SelectItem key={ct.value} value={ct.value}>
                    {ct.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data</Label>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ptBR}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>
            {selectedDate && (
              <p className="text-sm text-muted-foreground text-center">
                {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSchedule} disabled={!selectedDate || isScheduling}>
            {isScheduling ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Agendando...
              </>
            ) : (
              "Agendar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
