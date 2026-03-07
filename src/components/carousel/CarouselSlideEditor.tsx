import { useRef, useEffect, useState } from "react";
import { CarouselSlide } from "@/hooks/useCarouselGenerator";
import { useBrand } from "@/contexts/BrandContext";
import { cn } from "@/lib/utils";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CarouselSlideEditorProps {
    slide: CarouselSlide;
    index: number;
    onUpdate: (index: number, updates: Partial<CarouselSlide>) => void;
    onSelectBackground?: () => void;
    onRefine?: (text: string, mode: 'shorter' | 'punchy' | 'professional', index: number, field: 'headline' | 'subtexto' | 'destaque') => Promise<string | null>;
}

export function CarouselSlideEditor({ slide, index, onUpdate, onSelectBackground, onRefine }: CarouselSlideEditorProps) {
    const { brand } = useBrand();
    const [isRefining, setIsRefining] = useState<string | null>(null);

    // Refs for contentEditable fields
    const headlineRef = useRef<HTMLHeadingElement>(null);
    const subtextoRef = useRef<HTMLDivElement>(null);
    const destaqueRef = useRef<HTMLDivElement>(null);

    // Remove markdown bold/italic markers that the AI sometimes outputs literally
    const stripMarkdown = (text: string) =>
        text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1");

    // Sync refs with slide data whenever the displayed slide changes
    useEffect(() => {
        if (headlineRef.current) headlineRef.current.innerText = stripMarkdown(slide.headline);
        if (subtextoRef.current) subtextoRef.current.innerText = stripMarkdown(slide.subtexto || "");
        if (destaqueRef.current) destaqueRef.current.innerText = stripMarkdown(slide.destaque || "");
    }, [index, slide.layout, slide.headline, slide.subtexto, slide.destaque]);

    const handleBlur = () => {
        onUpdate(index, {
            headline: headlineRef.current?.innerText || "",
            subtexto: subtextoRef.current?.innerText || "",
            destaque: destaqueRef.current?.innerText || "",
        });
    };

    // Brand Kit Styles - Locking to 3 colors and 2 fonts
    const hasBg = !!slide.backgroundImageUrl;

    const brandStyle = {
        fontFamily: brand.fontHeading,
        color: hasBg ? "#ffffff" : brand.primary,
        textShadow: hasBg ? "0 2px 10px rgba(0,0,0,0.5)" : "none",
    };

    const secondaryStyle = {
        fontFamily: brand.fontBody,
        color: hasBg ? "rgba(255,255,255,0.9)" : brand.secondary,
    };

    const bodyStyle = {
        fontFamily: brand.fontBody,
        color: hasBg ? "rgba(255,255,255,0.8)" : "#1f2937", // Base neutral
    };

    const handleRefineClick = async (field: 'headline' | 'subtexto' | 'destaque', mode: 'shorter' | 'punchy' | 'professional') => {
        const ref = field === 'headline' ? headlineRef : field === 'subtexto' ? subtextoRef : destaqueRef;
        const currentText = ref.current?.innerText || "";

        setIsRefining(field);
        const result = await onRefine?.(currentText, mode, index, field);
        if (result && ref.current) {
            ref.current.innerText = result;
        }
        setIsRefining(null);
    };

    const RefineButton = ({ field }: { field: 'headline' | 'subtexto' | 'destaque' }) => (
        <div className="absolute -right-12 top-0 group-hover:opacity-100 opacity-0 transition-opacity">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/80 backdrop-blur shadow-sm border border-primary/20 hover:bg-primary/10">
                        {isRefining === field ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4 text-primary" />}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="rounded-xl border-primary/10">
                    <DropdownMenuItem onClick={() => handleRefineClick(field, 'shorter')} className="text-xs font-bold">Encurtar</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRefineClick(field, 'punchy')} className="text-xs font-bold">Mais Impacto</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRefineClick(field, 'professional')} className="text-xs font-bold">Profissional</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );

    // Render based on layout
    const renderLayout = () => {
        switch (slide.layout) {
            case 'capa':
                return (
                    <div className="flex flex-col items-center justify-center h-full p-12 text-center space-y-6">
                        {slide.destaque && (
                            <div className="relative">
                                <div
                                    ref={destaqueRef}
                                    contentEditable
                                    onBlur={handleBlur}
                                    className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest outline-none bg-primary/10"
                                    style={{ color: brand.primary }}
                                    suppressContentEditableWarning
                                />
                                <RefineButton field="destaque" />
                            </div>
                        )}
                        <div className="relative w-full">
                            <h2
                                ref={headlineRef}
                                contentEditable
                                onBlur={handleBlur}
                                className="text-5xl font-black leading-tight outline-none tracking-tighter"
                                style={brandStyle}
                                suppressContentEditableWarning
                            />
                            <RefineButton field="headline" />
                        </div>
                        <div className="relative w-full">
                            <div
                                ref={subtextoRef}
                                contentEditable
                                onBlur={handleBlur}
                                className="text-lg opacity-80 outline-none"
                                style={bodyStyle}
                                suppressContentEditableWarning
                            />
                            <RefineButton field="subtexto" />
                        </div>
                    </div>
                );
            case 'topicos':
                return (
                    <div className="flex flex-col h-full p-12 space-y-8">
                        <div className="relative">
                            <h2
                                ref={headlineRef}
                                contentEditable
                                onBlur={handleBlur}
                                className="text-3xl font-black leading-tight border-b-4 pb-4 outline-none"
                                style={{ ...brandStyle, borderBottomColor: brand.primary }}
                                suppressContentEditableWarning
                            />
                            <RefineButton field="headline" />
                        </div>
                        <div className="relative">
                            <div
                                ref={subtextoRef}
                                contentEditable
                                onBlur={handleBlur}
                                className="text-xl leading-relaxed outline-none space-y-4 whitespace-pre-line"
                                style={bodyStyle}
                                suppressContentEditableWarning
                            />
                            <RefineButton field="subtexto" />
                        </div>
                    </div>
                );
            case 'cta':
                return (
                    <div className="flex flex-col items-center justify-center h-full p-12 text-center space-y-10">
                        <div className="relative">
                            <h2
                                ref={headlineRef}
                                contentEditable
                                onBlur={handleBlur}
                                className="text-4xl font-black leading-tight outline-none"
                                style={brandStyle}
                                suppressContentEditableWarning
                            />
                            <RefineButton field="headline" />
                        </div>
                        <div className="relative">
                            <div
                                ref={subtextoRef}
                                contentEditable
                                onBlur={handleBlur}
                                className="text-xl opacity-80 outline-none"
                                style={bodyStyle}
                                suppressContentEditableWarning
                            />
                            <RefineButton field="subtexto" />
                        </div>
                        <div className="relative">
                            <div
                                ref={destaqueRef}
                                contentEditable
                                onBlur={handleBlur}
                                className={cn(
                                    "px-8 py-4 rounded-xl text-xl font-bold text-white transition-all cursor-text outline-none",
                                    hasBg ? "shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95" : "shadow-xl hover:scale-105"
                                )}
                                style={{ backgroundColor: brand.primary }}
                                suppressContentEditableWarning
                            />
                            <RefineButton field="destaque" />
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full p-10 text-center">
                        <h2 ref={headlineRef} contentEditable onBlur={handleBlur} className="text-2xl font-bold outline-none" style={brandStyle} suppressContentEditableWarning />
                        <div ref={subtextoRef} contentEditable onBlur={handleBlur} className="mt-4 outline-none" style={bodyStyle} suppressContentEditableWarning />
                    </div>
                );
        }
    };

    return (
        <div className="w-full h-full relative group">
            {/* Background logic */}
            {slide.backgroundImageUrl ? (
                <div className="absolute inset-0 overflow-hidden">
                    <img src={slide.backgroundImageUrl} alt="Background" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70" />
                </div>
            ) : (
                <div className="absolute inset-0 bg-white" />
            )}

            <div className="relative z-10 w-full h-full">
                {renderLayout()}
            </div>

            {/* Floating Photo Selection Button */}
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

            {/* Layout Switcher */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                {[
                    { id: 'capa', label: 'Capa Headline Gigante' },
                    { id: 'topicos', label: 'Lista de Tópicos' },
                    { id: 'cta', label: 'CTA Promessa 90 dias' }
                ].map(l => (
                    <button
                        key={l.id}
                        onClick={() => onUpdate(index, { layout: l.id as any })}
                        className={cn(
                            "px-3 py-1.5 text-[9px] uppercase font-black rounded-lg border shadow-sm transition-all",
                            slide.layout === l.id ? "bg-primary text-white border-primary" : "bg-white/80 backdrop-blur text-gray-500 border-gray-100 hover:bg-white"
                        )}
                    >
                        {l.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
