import { useCallback, useEffect, useState } from "react";
import { ContentCalendarPost, ContentCalendarPostDraft } from "@/types/contentCalendar";

const STORAGE_KEY = "consultorio-calendar-posts";

function loadPosts(): ContentCalendarPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePosts(posts: ContentCalendarPost[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export function useContentCalendarPosts() {
  const [posts, setPosts] = useState<ContentCalendarPost[]>([]);

  useEffect(() => {
    setPosts(loadPosts());
  }, []);

  useEffect(() => {
    savePosts(posts);
  }, [posts]);

  const addPost = useCallback((draft: ContentCalendarPostDraft) => {
    const now = new Date().toISOString();
    const post: ContentCalendarPost = {
      ...draft,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setPosts((prev) => [...prev, post]);
    return post;
  }, []);

  const updatePost = useCallback((id: string, patch: Partial<ContentCalendarPostDraft>) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p))
    );
  }, []);

  const deletePost = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const duplicatePost = useCallback((id: string) => {
    setPosts((prev) => {
      const original = prev.find((p) => p.id === id);
      if (!original) return prev;
      const now = new Date().toISOString();
      const copy: ContentCalendarPost = {
        ...original,
        id: crypto.randomUUID(),
        title: `${original.title} (cópia)`,
        createdAt: now,
        updatedAt: now,
      };
      return [...prev, copy];
    });
  }, []);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(posts, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calendario-conteudo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [posts]);

  return { posts, addPost, updatePost, deletePost, duplicatePost, exportJSON };
}
