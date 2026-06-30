import { Layers, Image, Film, Smartphone, Hand, LucideIcon } from "lucide-react";

export type PostFormatKey = "carrossel" | "post_unico" | "reels" | "stories" | "levantada";

export interface PostFormatConfig {
  label: string;
  icon: LucideIcon;
  hex: string;
  color: string;
  text: string;
  bgLight: string;
  border: string;
}

export const FORMAT_CONFIG: Record<PostFormatKey, PostFormatConfig> = {
  carrossel: { label: "Carrossel", icon: Layers, hex: "#7C3AED", color: "bg-violet-500", text: "text-violet-700", bgLight: "bg-violet-100", border: "border-l-violet-500" },
  post_unico: { label: "Estático", icon: Image, hex: "#059669", color: "bg-emerald-500", text: "text-emerald-700", bgLight: "bg-emerald-100", border: "border-l-emerald-500" },
  reels: { label: "Reels", icon: Film, hex: "#EC4899", color: "bg-pink-500", text: "text-pink-700", bgLight: "bg-pink-100", border: "border-l-pink-500" },
  stories: { label: "Story", icon: Smartphone, hex: "#F59E0B", color: "bg-amber-500", text: "text-amber-700", bgLight: "bg-amber-100", border: "border-l-amber-500" },
  levantada: { label: "Levantada", icon: Hand, hex: "#EF4444", color: "bg-red-500", text: "text-red-700", bgLight: "bg-red-100", border: "border-l-red-500" },
};

export function getFormatConfig(tipo: string | null | undefined): PostFormatConfig {
  return FORMAT_CONFIG[(tipo ?? "post_unico") as PostFormatKey] ?? FORMAT_CONFIG.post_unico;
}
