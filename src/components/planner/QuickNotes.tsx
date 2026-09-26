import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Plus, X } from "lucide-react";

interface Note { id: string; conteudo: string }

export function QuickNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from("quick_notes").select("id, conteudo").eq("user_id", user.id).order("created_at")
      .then(({ data }) => setNotes(data ?? []));
  }, [user?.id]);

  const add = async () => {
    if (!user?.id) return;
    const { data } = await supabase.from("quick_notes").insert({ user_id: user.id, conteudo: "" }).select("id, conteudo").single();
    if (data) setNotes((p) => [...p, data]);
  };
  const save = (id: string, conteudo: string) => supabase.from("quick_notes").update({ conteudo }).eq("id", id);
  const remove = async (id: string) => {
    await supabase.from("quick_notes").delete().eq("id", id);
    setNotes((p) => p.filter((n) => n.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10"><FileText className="h-4 w-4 text-primary" /></span>
          Notas rápidas
        </h3>
        <Button variant="secondary" size="sm" onClick={add}><Plus className="mr-1 h-4 w-4" />Nova nota</Button>
      </div>
      {notes.length === 0 && <p className="text-sm text-muted-foreground">Anote ideias soltas para não perder nada.</p>}
      {notes.map((n) => (
        <div key={n.id} className="group relative">
          <Input
            defaultValue={n.conteudo}
            placeholder="Digite uma nota..."
            onBlur={(e) => e.target.value !== n.conteudo && save(n.id, e.target.value)}
            className="pr-9"
          />
          <button onClick={() => remove(n.id)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground opacity-0 group-hover:opacity-100" aria-label="Remover nota">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
