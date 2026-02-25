import { useRef, useEffect } from "react";
import { CarouselSlide } from "@/hooks/useCarouselGenerator";
import { useBrand } from "@/contexts/BrandContext";
import { cn } from "@/lib/utils";

import { Sparkles } from "lucide-react";

interface CarouselSlideEditorProps {
    slide: CarouselSlide;
    index: number;
    onUpdate: (index: number, updates: Partial<CarouselSlide>) => void;
    onSelectBackground?: () => void;
}

export function CarouselSlideEditor({ slide, index, onUpdate, onSelectBackground }: CarouselSlideEditorProps) {
    const { brand } = useBrand();

    // Refs for contentEditable fields
    const headlineRef = useRef<HTMLHeadingElement>(null);
    const subtextoRef = useRef<HTMLDivElement>(null);
    const destaqueRef = useRef<HTMLDivElement>(null);

    // Sync refs with slide data on initial load or index change
    useEffect(() => {
        if (headlineRef.current) headlineRef.current.innerText = slide.headline;
        if (subtextoRef.current) subtextoRef.current.innerText = slide.subtexto || "";
        if (destaqueRef.current) destaqueRef.current.innerText = slide.destaque || "";
    }, [index, slide.layout]);

    const handleBlur = () => {
        onUpdate(index, {
            headline: headlineRef.current?.innerText || "",
            subtexto: subtextoRef.current?.innerText || "",
            destaque: destaqueRef.current?.innerText || "",
        });
    };

    // Brand Kit Styles
    const brandStyle = {
        fontFamily: brand.fontHeading,
        color: brand.primary,
    };

    const bodyStyle = {
        fontFamily: brand.fontBody,
        color: "#1f2937", // Gray-800 for readability
    };

    // Render based on layout
    const renderLayout = () => {
        switch (slide.layout) {
            case 'capa':
                return (
                    <div className="flex flex-col items-center justify-center h-full p-12 text-center space-y-6">
                        {slide.destaque && (
                            <div
                                ref={destaqueRef}
                                contentEditable
                                onBlur={handleBlur}
                                className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest outline-none bg-primary/10"
                                style={{ color: brand.primary }}
                                suppressContentEditableWarning
                            />
                        )}
                        <h2
                            ref={headlineRef}
                            contentEditable
                            onBlur={handleBlur}
                            className="text-4xl font-black leading-tight outline-none"
                            style={brandStyle}
                            suppressContentEditableWarning
                        />
                        <div
                            ref={subtextoRef}
                            contentEditable
                            onBlur={handleBlur}
                            className="text-lg opacity-80 outline-none"
                            style={bodyStyle}
                            suppressContentEditableWarning
                        />
                    </div>
                );
            case 'topicos':
                return (
                    <div className="flex flex-col h-full p-12 space-y-8">
                        <h2
                            ref={headlineRef}
                            contentEditable
                            onBlur={handleBlur}
                            className="text-3xl font-black leading-tight border-b-4 pb-4 outline-none"
                            style={{ ...brandStyle, borderBottomColor: brand.primary }}
                            suppressContentEditableWarning
                        />
                        <div
                            ref={subtextoRef}
                            contentEditable
                            onBlur={handleBlur}
                            className="text-xl leading-relaxed outline-none space-y-4 whitespace-pre-line"
                            style={bodyStyle}
                            suppressContentEditableWarning
                        />
                    </div>
                );
            case 'cta':
                return (
                    <div className="flex flex-col items-center justify-center h-full p-12 text-center space-y-10">
                        <h2
                            ref={headlineRef}
                            contentEditable
                            onBlur={handleBlur}
                            className="text-4xl font-black leading-tight outline-none"
                            style={brandStyle}
                            suppressContentEditableWarning
                        />
                        <div
                            ref={subtextoRef}
                            contentEditable
                            onBlur={handleBlur}
                            className="text-xl opacity-80 outline-none"
                            style={bodyStyle}
                            suppressContentEditableWarning
                        />
                        <div
                            ref={destaqueRef}
                            contentEditable
                            onBlur={handleBlur}
                            className="px-8 py-4 rounded-xl text-xl font-bold text-white shadow-xl hover:scale-105 transition-transform cursor-text outline-none"
                            style={{ backgroundColor: brand.primary }}
                            suppressContentEditableWarning
                        />
                    </div>
                );
            default:
                // Fallback Layout (Simple)
                return (
                    <div className="flex flex-col items-center justify-center h-full p-10 text-center">
                        <h2
                            ref={headlineRef}
                            contentEditable
                            onBlur={handleBlur}
                            className="text-2xl font-bold outline-none"
                            style={brandStyle}
                            suppressContentEditableWarning
                        />
                        <div
                            ref={subtextoRef}
                            contentEditable
                            onBlur={handleBlur}
                            className="mt-4 outline-none"
                            style={bodyStyle}
                            suppressContentEditableWarning
                        />
                    </div>
                );
        }
    };

    return (
        <div className="w-full h-full relative group">
            {/* Background logic */}
            {slide.backgroundImageUrl ? (
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src={slide.backgroundImageUrl}
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                    {/* Overlay leve para garantir leitura */}
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
                </div>
            ) : (
                <div className="absolute inset-0 bg-white" />
            )}

            <div className="relative z-10 w-full h-full">
                {renderLayout()}
            </div>

            {/* Floating Photo Selection Button (Overlay on hover) */}
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 pointer-events-none">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelectBackground?.();
                    }}
                    className="pointer-events-auto bg-white/90 backdrop-blur-md text-primary font-bold py-3 px-6 rounded-2xl shadow-2xl border border-primary/20 flex items-center gap-2 hover:scale-105 transition-transform active:scale-95"
                >
                    <Sparkles className="h-5 w-5" />
                    Trocar Fundo por Foto IA
                </button>
            </div>

            {/* Layout Switcher (Overlay on hover) */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                {(['capa', 'topicos', 'cta'] as const).map(l => (
                    <button
                        key={l}
                        onClick={() => onUpdate(index, { layout: l })}
                        className={cn(
                            "px-2 py-1 text-[10px] uppercase font-bold rounded border",
                            slide.layout === l ? "bg-primary text-white border-primary" : "bg-white text-gray-500 border-gray-200"
                        )}
                    >
                        {l}
                    </button>
                ))}
            </div>
        </div>
    );
}
