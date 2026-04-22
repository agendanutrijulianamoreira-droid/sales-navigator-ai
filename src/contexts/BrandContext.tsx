import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface BrandPalette {
  primary: string;
  secondary: string;
  background: string;
  fontHeading: string;
  fontBody: string;
}

interface BrandContextValue {
  brand: BrandPalette;
  updateBrand: (newBrand: Partial<BrandPalette>) => void;
}

const STORAGE_KEY = "user_brand_kit";

const defaultPalette: BrandPalette = {
  primary: "#7c3aed",
  secondary: "#10b981",
  background: "#ffffff",
  fontHeading: "Space Grotesk",
  fontBody: "Inter",
};

const BrandContext = createContext<BrandContextValue | undefined>(undefined);

const isValidBrandPalette = (value: unknown): value is Partial<BrandPalette> => {
  if (!value || typeof value !== "object") return false;

  const palette = value as Record<string, unknown>;

  return ["primary", "secondary", "background", "fontHeading", "fontBody"].every(
    (key) => palette[key] === undefined || typeof palette[key] === "string",
  );
};

const applyBrandCssVariables = (palette: BrandPalette) => {
  document.documentElement.style.setProperty("--brand-primary", palette.primary);
  document.documentElement.style.setProperty("--brand-secondary", palette.secondary);
  document.documentElement.style.setProperty("--brand-background", palette.background);
};

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brand, setBrand] = useState<BrandPalette>(defaultPalette);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved);
      if (isValidBrandPalette(parsed)) {
        setBrand((current) => ({ ...current, ...parsed }));
      }
    } catch (error) {
      console.error("Erro ao carregar kit de marca:", error);
    }
  }, []);

  useEffect(() => {
    applyBrandCssVariables(brand);
  }, [brand]);

  const updateBrand = (newBrand: Partial<BrandPalette>) => {
    setBrand((current) => {
      const updated = { ...current, ...newBrand };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      applyBrandCssVariables(updated);
      return updated;
    });
  };

  return <BrandContext.Provider value={{ brand, updateBrand }}>{children}</BrandContext.Provider>;
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error("useBrand deve ser usado dentro de BrandProvider");
  }

  return context;
}