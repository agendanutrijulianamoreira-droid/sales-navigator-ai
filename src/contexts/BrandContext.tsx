import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface BrandPalette {
    primary: string;
    secondary: string;
    background: string;
    fontHeading: string;
    fontBody: string;
}

const defaultPalette: BrandPalette = {
    primary: '#7c3aed', // Purple-600 (Magic Writer theme)
    secondary: '#10b981', // Emerald-500
    background: '#ffffff',
    fontHeading: 'Inter',
    fontBody: 'Inter'
};

const BrandContext = createContext<{
    brand: BrandPalette;
    updateBrand: (newBrand: Partial<BrandPalette>) => void;
} | undefined>(undefined);

export function BrandProvider({ children }: { children: ReactNode }) {
    const [brand, setBrand] = useState<BrandPalette>(defaultPalette);

    // Carregar do LocalStorage ao iniciar
    useEffect(() => {
        const saved = localStorage.getItem('user_brand_kit');
        if (saved) {
            try {
                setBrand(JSON.parse(saved));
            } catch (e) {
                console.error("Erro ao carregar kit de marca:", e);
            }
        }
    }, []);

    const updateBrand = (newBrand: Partial<BrandPalette>) => {
        setBrand(prev => {
            const updated = { ...prev, ...newBrand };
            localStorage.setItem('user_brand_kit', JSON.stringify(updated));

            // Atualizar variáveis CSS globais
            document.documentElement.style.setProperty('--brand-primary', updated.primary);
            document.documentElement.style.setProperty('--brand-secondary', updated.secondary);
            document.documentElement.style.setProperty('--brand-background', updated.background);

            return updated;
        });
    };

    // Efeito inicial para setar as variáveis CSS
    useEffect(() => {
        document.documentElement.style.setProperty('--brand-primary', brand.primary);
        document.documentElement.style.setProperty('--brand-secondary', brand.secondary);
        document.documentElement.style.setProperty('--brand-background', brand.background);
    }, [brand]);

    return (
        <BrandContext.Provider value={{ brand, updateBrand }}>
            {children}
        </BrandContext.Provider>
    );
}

export const useBrand = () => {
    const context = useContext(BrandContext);
    if (!context) {
        throw new Error("useBrand deve ser usado dentro de BrandProvider");
    }
    return context;
};
