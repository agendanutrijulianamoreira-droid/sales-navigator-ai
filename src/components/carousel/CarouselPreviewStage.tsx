import { ReactNode } from "react";
import { Smartphone } from "lucide-react";

interface CarouselPreviewStageProps {
    children: ReactNode; // O Slide atual
    currentIndex: number;
    totalSlides: number;
    isExporting?: boolean; // Para remover bordas na hora do print
}

export function CarouselPreviewStage({
    children,
    currentIndex,
    totalSlides,
    isExporting = false
}: CarouselPreviewStageProps) {

    if (isExporting) return <>{children}</>;

    return (
        <div className="flex flex-col items-center justify-center py-8 bg-slate-100 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 min-h-[600px]">

            {/* Label Superior */}
            <div className="mb-4 flex items-center gap-2 text-muted-foreground text-sm font-medium uppercase tracking-wider">
                <Smartphone className="w-4 h-4" />
                Preview Instagram (4:5)
            </div>

            {/* O Mockup do Celular/Post */}
            <div className="relative group transition-all duration-500 ease-in-out transform hover:scale-[1.02]">

                {/* Sombra Realista */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 rounded-lg opacity-20 blur group-hover:opacity-40 transition duration-500"></div>

                {/* Container do Slide (1080x1350 aspect ratio) */}
                {/* Usamos w-[320px] ou w-[400px] para preview, mas mantemos aspect-ratio */}
                <div className="relative w-[340px] aspect-[4/5] bg-white rounded-md shadow-2xl overflow-hidden ring-1 ring-black/5">

                    {/* O Slide em si renderizado aqui dentro */}
                    <div className="w-full h-full">
                        {children}
                    </div>

                    {/* Indicador de Carrossel (Bolinhas) */}
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
                        {Array.from({ length: totalSlides }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full shadow-sm ${i === currentIndex ? "bg-white scale-110" : "bg-white/50"
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Tag de Marca d'água ou User (Opcional) */}
                    <div className="absolute top-3 left-3 flex items-center gap-2 z-20 pointer-events-none">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 border border-white" />
                        <span className="text-[10px] font-semibold text-white drop-shadow-md">Seu Perfil</span>
                    </div>

                </div>
            </div>

            <div className="mt-6 text-xs text-muted-foreground">
                Slide {currentIndex + 1} de {totalSlides}
            </div>
        </div>
    );
}
