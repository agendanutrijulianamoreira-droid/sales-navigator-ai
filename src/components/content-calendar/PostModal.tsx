import { useEffect, useRef, useState } from "react";
import { Copy, Trash2, X, Upload, Instagram } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ContentCalendarPost, ContentCalendarPostDraft, Platform, PostFormat, PostStatus } from "@/types/contentCalendar";
import { STATUS_ORDER, STATUS_CONFIG, SUGGESTED_TAGS } from "@/lib/constants/contentCalendarStatus";
import { FORMAT_ORDER, FORMAT_CONFIG } from "@/lib/constants/contentCalendarFormat";
import { InstagramPostPreview } from "./InstagramPostPreview";

interface PostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
  post?: ContentCalendarPost;
  onSave: (draft: ContentCalendarPostDraft) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

function toDateInput(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const emptyDraft = (date?: Date): ContentCalendarPostDraft => ({
  title: "",
  description: "",
  format: "carrossel",
  platform: "instagram",
  status: "ideia",
  scheduledDate: toDateInput(date || new Date()),
  scheduledTime: "",
  thumbnailUrl: "",
  tags: [],
  notes: "",
});

export function PostModal({ open, onOpenChange, defaultDate, post, onSave, onDelete, onDuplicate }: PostModalProps) {
  const [draft, setDraft] = useState<ContentCalendarPostDraft>(emptyDraft(defaultDate));
  const [tagInput, setTagInput] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(post ? { ...post } : emptyDraft(defaultDate));
    setTagInput("");
  }, [open, post, defaultDate]);

  const addTag = (tag: string) => {
    const clean = tag.trim().toLowerCase();
    if (!clean || draft.tags.includes(clean)) return;
    setDraft((d) => ({ ...d, tags: [...d.tags, clean] }));
  };

  const removeTag = (tag: string) => {
    setDraft((d) => ({ ...d, tags: d.tags.filter((t) => t !== tag) }));
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setDraft((d) => ({ ...d, thumbnailUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!draft.title.trim()) return;
    onSave(draft);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[860px] rounded-xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-5 py-4 border-b border-[#E8E8EC]">
            <DialogTitle className="text-[16px] font-semibold text-[#1A1A2E]">
              {post ? "Editar post" : "Novo post"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid md:grid-cols-[1fr,280px]">
          <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Título */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1A1A2E]">Título *</Label>
              <Input
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder="Ex: Dica sobre ansiedade"
                className="rounded-lg border-[#E8E8EC]"
              />
            </div>

            {/* Formato */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1A1A2E]">Formato *</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {FORMAT_ORDER.map((f: PostFormat) => {
                  const cfg = FORMAT_CONFIG[f];
                  const Icon = cfg.icon;
                  const active = draft.format === f;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, format: f }))}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-[11px] font-medium transition-colors ${
                        active
                          ? "border-[#6D4AE8] bg-[#EDE9FF] text-[#6D4AE8]"
                          : "border-[#E8E8EC] text-[#6B6B80] hover:bg-[#F8F8FA]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Plataforma */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1A1A2E]">Plataforma</Label>
              <div className="flex gap-1.5">
                {(["instagram", "tiktok"] as Platform[]).map((p) => {
                  const active = draft.platform === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, platform: p }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium capitalize transition-colors ${
                        active
                          ? "border-[#6D4AE8] bg-[#EDE9FF] text-[#6D4AE8]"
                          : "border-[#E8E8EC] text-[#6B6B80] hover:bg-[#F8F8FA]"
                      }`}
                    >
                      {p === "instagram" && <Instagram className="h-3.5 w-3.5" />}
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Data + horário */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1A1A2E]">Data de publicação *</Label>
                <Input
                  type="date"
                  value={draft.scheduledDate}
                  onChange={(e) => setDraft((d) => ({ ...d, scheduledDate: e.target.value }))}
                  className="rounded-lg border-[#E8E8EC]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1A1A2E]">Horário</Label>
                <Input
                  type="time"
                  value={draft.scheduledTime}
                  onChange={(e) => setDraft((d) => ({ ...d, scheduledTime: e.target.value }))}
                  className="rounded-lg border-[#E8E8EC]"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1A1A2E]">Status *</Label>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_ORDER.map((s: PostStatus) => {
                  const cfg = STATUS_CONFIG[s];
                  const active = draft.status === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, status: s }))}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-colors"
                      style={
                        active
                          ? { borderColor: cfg.hex, backgroundColor: cfg.bgLight, color: cfg.textColor }
                          : { borderColor: "#E8E8EC", color: "#6B6B80" }
                      }
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.hex }} />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1A1A2E]">Tags</Label>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {draft.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EDE9FF] text-[#6D4AE8] text-[11px] font-medium"
                  >
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(tagInput);
                    setTagInput("");
                  }
                }}
                placeholder="Digite uma tag e pressione Enter"
                className="rounded-lg border-[#E8E8EC]"
              />
              <div className="flex flex-wrap gap-1">
                {SUGGESTED_TAGS.filter((t) => !draft.tags.includes(t)).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-[#F5F5F5] text-[#6B6B80] hover:bg-[#EDE9FF] hover:text-[#6D4AE8] transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Legenda */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1A1A2E]">Legenda / Descrição</Label>
              <Textarea
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                rows={3}
                placeholder="Legenda completa ou briefing do conteúdo..."
                className="rounded-lg border-[#E8E8EC] resize-none"
              />
            </div>

            {/* Thumbnail */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1A1A2E]">Imagem / Thumbnail</Label>
              <div className="flex gap-1.5">
                <Input
                  value={draft.thumbnailUrl?.startsWith("data:") ? "" : draft.thumbnailUrl}
                  onChange={(e) => setDraft((d) => ({ ...d, thumbnailUrl: e.target.value }))}
                  placeholder="Cole a URL da imagem..."
                  className="rounded-lg border-[#E8E8EC]"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-lg border-[#E8E8EC] shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </div>
              {draft.thumbnailUrl && (
                <img src={draft.thumbnailUrl} alt="preview" className="h-20 w-20 object-cover rounded-lg border border-[#E8E8EC]" />
              )}
            </div>

            {/* Notas internas */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1A1A2E]">Notas internas</Label>
              <Textarea
                value={draft.notes}
                onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                rows={2}
                placeholder="Lembretes só para você..."
                className="rounded-lg border-[#E8E8EC] resize-none"
              />
            </div>
          </div>

          <div className="hidden md:flex flex-col items-center gap-2 px-4 py-5 border-l border-[#E8E8EC] bg-[#F8F8FA]">
            <p className="text-[11px] font-semibold text-[#6B6B80] uppercase self-start">Preview</p>
            <InstagramPostPreview draft={draft} />
          </div>
          </div>

          <div className="flex items-center justify-between px-5 py-4 border-t border-[#E8E8EC]">
            <div className="flex items-center gap-1.5">
              {post && onDuplicate && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  title="Duplicar"
                  onClick={() => onDuplicate(post.id)}
                  className="text-[#6B6B80] hover:text-[#6D4AE8]"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
              {post && onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  title="Excluir"
                  onClick={() => setConfirmDelete(true)}
                  className="text-[#6B6B80] hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" className="rounded-lg" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                className="rounded-lg bg-[#6D4AE8] hover:bg-[#5d3bd6] text-white"
                onClick={handleSave}
                disabled={!draft.title.trim()}
              >
                Salvar Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir post?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O post "{post?.title}" será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (post && onDelete) onDelete(post.id);
                setConfirmDelete(false);
                onOpenChange(false);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
