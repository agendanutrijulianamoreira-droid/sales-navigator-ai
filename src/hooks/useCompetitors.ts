import { useCallback, useEffect, useState } from "react";
import { Competitor, CompetitorDraft } from "@/types/competitor";

const STORAGE_KEY = "consultorio-concorrentes";

function load(): Competitor[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useCompetitors() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);

  useEffect(() => {
    setCompetitors(load());
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(competitors));
  }, [competitors]);

  const addCompetitor = useCallback((draft: CompetitorDraft) => {
    const now = new Date().toISOString();
    setCompetitors((prev) => [...prev, { ...draft, id: crypto.randomUUID(), createdAt: now, updatedAt: now }]);
  }, []);

  const updateCompetitor = useCallback((id: string, patch: Partial<CompetitorDraft>) => {
    setCompetitors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c))
    );
  }, []);

  const deleteCompetitor = useCallback((id: string) => {
    setCompetitors((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { competitors, addCompetitor, updateCompetitor, deleteCompetitor };
}
