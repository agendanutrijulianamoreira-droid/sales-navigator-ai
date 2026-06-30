import { Layers, Film, Image, Smartphone, LucideIcon } from "lucide-react";
import { PostFormat } from "@/types/contentCalendar";

export interface FormatConfig {
  label: string;
  icon: LucideIcon;
}

export const FORMAT_ORDER: PostFormat[] = ["carrossel", "reels", "estatico", "story"];

export const FORMAT_CONFIG: Record<PostFormat, FormatConfig> = {
  carrossel: { label: "Carrossel", icon: Layers },
  reels: { label: "Reels", icon: Film },
  estatico: { label: "Estático", icon: Image },
  story: { label: "Story", icon: Smartphone },
};
