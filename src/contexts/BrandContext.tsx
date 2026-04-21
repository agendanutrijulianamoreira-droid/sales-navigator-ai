import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface BrandPalette {
  primary: string;
  secondary: string;
  fontHeading: string;
  fontBody: string;
}

export interface BrandContextType {
  brand: BrandPalette;
  updateBrand: (newPalette: Partial<BrandPalette>) => void;
}

const defaultBrandPalette: BrandPalette = {
  primary: '#1A1A1A',
  secondary: '#E2E8F0',
  fontHeading: 'Inter',
  fontBody: 'Inter',
};

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const BrandProvider = ({ children }: { children: ReactNode }) => {
  const [brandPalette, setBrandPalette] = useState<BrandPalette>(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem('brandPalette');
        if (stored) {
          const parsed = JSON.parse(stored);
          return { ...defaultBrandPalette, ...parsed };
        }
      } catch (error) {
        console.error('Falha ao parsear brandPalette do localStorage:', error);
      }
    }
    return defaultBrandPalette;
  });

  const updateBrand = (newPalette: Partial<BrandPalette>) => {
    setBrandPalette(prev => {
      const updated = { ...prev, ...newPalette };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('brandPalette', JSON.stringify(updated));
      }
      return updated;
    });
  };

  return (
    <BrandContext.Provider value={{ brand: brandPalette, updateBrand }}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrand deve ser usado dentro de um BrandProvider');
  }
  return context;
};