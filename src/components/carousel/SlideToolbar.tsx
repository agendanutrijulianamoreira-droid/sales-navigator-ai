import { Button } from "@/components/ui/button";
import {
    Type,
    Palette,
    Trash2,
    Copy,
    MoveLeft,
    MoveRight,
    Wand2
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMagicWriter } from "@/hooks/useMagicWriter";

interface SlideToolbarProps {
    onEditContent: () => void;
    onEditStyle: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onMoveLeft: () => void;
    onMoveRight: () => void;
    canMoveLeft: boolean;
    canMoveRight: boolean;
    currentSlideText: string;
    onUpdateText: (newText: string) => void;
}

export function SlideToolbar({
    onEditContent,
    onEditStyle,
    onDelete,
    onDuplicate,
    onMoveLeft,
    onMoveRight,
    canMoveLeft,
    canMoveRight,
    currentSlideText,
    onUpdateText
}: SlideToolbarProps) {
    const { rewriteText, isWriting } = useMagicWriter();

    return (
        <TooltipProvider>
            <div className="flex items-center justify-center gap-2 p-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-full shadow-lg mb-4 w-fit mx-auto animate-in fade-in slide-in-from-bottom-2">

                <div className="flex items-center gap-1 border-r pr-2 mr-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onMoveLeft} disabled={!canMoveLeft}>
                                <MoveLeft className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Mover para esquerda</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onMoveRight} disabled={!canMoveRight}>
                                <MoveRight className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Mover para direita</TooltipContent>
                    </Tooltip>
                </div>

                <div className="flex items-center gap-1 border-r pr-2 mr-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-500 hover:bg-purple-100 rounded-full" disabled={isWriting}>
                                <Wand2 className={`w-4 h-4 ${isWriting ? 'animate-spin' : ''}`} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-48">
                            <DropdownMenuItem onClick={async () => {
                                const newText = await rewriteText(currentSlideText, 'shorter');
                                onUpdateText(newText);
                            }}>
                                <span className="flex items-center gap-2">Encurtar Texto</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={async () => {
                                const newText = await rewriteText(currentSlideText, 'punchy');
                                onUpdateText(newText);
                            }}>
                                <span className="flex items-center gap-2">Mais Impactante</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={async () => {
                                const newText = await rewriteText(currentSlideText, 'professional');
                                onUpdateText(newText);
                            }}>
                                <span className="flex items-center gap-2">Mais Profissional</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="secondary" size="sm" className="h-8 text-xs gap-1.5" onClick={onEditContent}>
                            <Type className="w-3.5 h-3.5" /> Texto
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Editar Texto do Slide</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="secondary" size="sm" className="h-8 text-xs gap-1.5" onClick={onEditStyle}>
                            <Palette className="w-3.5 h-3.5" /> Design
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Alterar Cores/Tema</TooltipContent>
                </Tooltip>

                <div className="w-px h-4 bg-border mx-1" />

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full" onClick={onDuplicate}>
                            <Copy className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Duplicar Slide</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full" onClick={onDelete}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Excluir Slide</TooltipContent>
                </Tooltip>

            </div>
        </TooltipProvider>
    );
}
