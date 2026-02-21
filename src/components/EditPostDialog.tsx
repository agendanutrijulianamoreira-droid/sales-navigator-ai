import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
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
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Loader2, Copy, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarItem } from "@/hooks/useCalendarItems";
import { toast } from "sonner";

interface EditPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, data: { date: string; tipo: string; titulo: string; notas?: string }) => Promise<void>;
  onDuplicate?: (post: CalendarItem) => Promise<void>;
  post?: CalendarItem;
}

const CONTENT_TYPES = [
  { value: "carrossel", label: "Carrossel" },
  { value: "post_unico", label: "Post Único" },
  { value: "reels", label: "Reels" },
  { value: "stories", label: "Stories" },
  { value: "levantada", label: "Levantada de Mão" },
];

export function EditPostDialog({ open, onOpenChange, onUpdate, onDuplicate, post }: EditPostDialogProps) {
  // safety: we expect a post when the dialog is shown
  if (open && !post) {
    return null;
  }
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("carrossel");
  const [notas, setNotas] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Valores originais para rastrear mudanças
  const originalData = useCallback(() => ({
    titulo: post?.titulo || "",
    tipo: post?.tipo || "carrossel",
    notas: post?.notas || "",
    date: post?.data || "",
  }), [post]);

  useEffect(() => {
    if (post && open) {
      const original = originalData();
      setTitulo(original.titulo);
      setTipo(original.tipo);
      setNotas(original.notas);
      setSelectedDate(new Date(original.date));
      setHasChanges(false);
      setShowCalendar(false);

      // focus title input when dialog opens
      setTimeout(() => {
        const el = document.getElementById("titulo");
        el?.focus();
      }, 0);
    }
  }, [post, open, originalData]);

  // Rastreia mudanças em tempo real
  useEffect(() => {
    const original = originalData();
    const changed = 
      titulo !== original.titulo ||
      tipo !== original.tipo ||
      notas !== original.notas ||
      (selectedDate && format(selectedDate, "yyyy-MM-dd") !== original.date);
    setHasChanges(changed);
  }, [titulo, tipo, notas, selectedDate, originalData]);

  const handleUpdate = async () => {
    if (!selectedDate || !post || !titulo.trim()) {
      toast.error("Título é obrigatório!");
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate(post.id, {
        date: format(selectedDate, "yyyy-MM-dd"),
        tipo,
        titulo: titulo.trim(),
        notas: notas.trim() || undefined,
      });
      toast.success("Post atualizado com sucesso");
      onOpenChange(false);
      setHasChanges(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDuplicate = async () => {
    if (!post) return;
    setIsDuplicating(true);
    try {
      await onDuplicate?.(post);
      toast.success("Post duplicado");
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (!window.confirm("Você tem mudanças não salvas. Deseja descartar?")) {
        return;
      }
    }
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // quick save (ctrl+enter)
    if (e.key === "Enter" && e.ctrlKey && !isUpdating) {
      e.preventDefault();
      handleUpdate();
      return;
    }

    // escape to close
    if (e.key === "Escape") {
      e.preventDefault();
      handleClose();
      return;
    }

    // open calendar with 'd' key when focused anywhere inside dialog
    if (e.key.toLowerCase() === "d" && !showCalendar && !isUpdating) {
      e.preventDefault();
      setShowCalendar(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Editar Post
          </DialogTitle>
          <DialogDescription>
            Atualize os detalhes do seu post agendado
          </DialogDescription>
        </DialogHeader>

        {hasChanges && (
          <Alert className="border-yellow-500 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Você tem mudanças não salvas. Pressione Ctrl+Enter para salvar rápido.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-4" onKeyDown={handleKeyDown}>
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Nome do post"
              maxLength={100}
              autoFocus
              required
              disabled={isUpdating || isDuplicating}
            />
            <p className="text-xs text-muted-foreground">{titulo.length}/100</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Conteúdo</Label>
            <Select value={tipo} onValueChange={setTipo} disabled={isUpdating || isDuplicating}>
              <SelectTrigger id="tipo">
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
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea
              id="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Adicione notas sobre o post..."
              rows={4}
              maxLength={500}
              className="resize-none font-sm"
              disabled={isUpdating || isDuplicating}
            />
            <p className="text-xs text-muted-foreground">{notas.length}/500</p>
          </div>

          <div className="space-y-2">
            <Label>Data</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="flex-1 justify-start text-left"
                onClick={() => setShowCalendar(!showCalendar)}
                disabled={isUpdating || isDuplicating}
              >
                {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Selecione uma data"}
              </Button>
              {selectedDate && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedDate(undefined)}
                  disabled={isUpdating || isDuplicating}
                  title="Limpar data"
                >
                  ✖
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Pressione <kbd>D</kbd> para abrir/fechar o calendário
            </p>

            {showCalendar && (
              <div className="border rounded-lg p-4 bg-muted/30 overflow-x-auto">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setShowCalendar(false);
                  }}
                  locale={ptBR}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </div>
            )}

            {selectedDate && (
              <p className="text-sm font-medium text-primary">
                📅 {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <div className="flex gap-2 w-full sm:w-auto">
            {onDuplicate && (
              <Button
                variant="secondary"
                onClick={handleDuplicate}
                disabled={isDuplicating || !post}
                className="flex-1 sm:flex-none"
              >
                {isDuplicating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Duplicando...
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar
                  </>
                )}
              </Button>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={handleClose} className="flex-1 sm:flex-none">
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdate} 
              disabled={!selectedDate || isUpdating || !titulo.trim()}
              className="flex-1 sm:flex-none"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar (Ctrl+Enter)"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
