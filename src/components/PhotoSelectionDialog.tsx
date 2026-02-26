
import { useState } from "react";
import { useAssets, Asset } from "@/hooks/useAssets";
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Loader2, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PhotoSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (photoUrl: string) => void;
    selectedUrl?: string;
}

export function PhotoSelectionDialog({
    open,
    onOpenChange,
    onSelect,
    selectedUrl
}: PhotoSelectionDialogProps) {
    const { assets, loading } = useAssets();
    const [localSelected, setLocalSelected] = useState<string | undefined>(selectedUrl);

    const professionalPhotos = assets.filter(a => a.tipo === 'foto_profissional');
    const basePhotos = assets.filter(a => a.tipo === 'foto_base');

    const handleConfirm = () => {
        if (localSelected) {
            onSelect(localSelected);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Suas Fotos</DialogTitle>
                    <DialogDescription>
                        Escolha uma foto profissional ou base para usar no fundo do seu post.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden py-4">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Carregando suas fotos...</p>
                        </div>
                    ) : assets.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4 text-center border-2 border-dashed rounded-xl">
                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
                            <div>
                                <p className="font-medium">Nenhuma foto encontrada</p>
                                <p className="text-sm text-muted-foreground">Gere fotos no Estúdio IA primeiro.</p>
                            </div>
                        </div>
                    ) : (
                        <ScrollArea className="h-full pr-4">
                            <div className="space-y-6">
                                {professionalPhotos.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                            <Badge variant="default">IA</Badge> Fotos Profissionais
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {professionalPhotos.map((photo) => (
                                                <div
                                                    key={photo.id}
                                                    className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${localSelected === photo.url ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-muted-foreground/50"
                                                        }`}
                                                    onClick={() => setLocalSelected(photo.url)}
                                                >
                                                    <img src={photo.url} alt="Profissional" className="w-full h-full object-cover" />
                                                    {localSelected === photo.url && (
                                                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                            <div className="bg-primary text-primary-foreground rounded-full p-1 shadow-lg">
                                                                <Check className="h-4 w-4" />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-black/50 backdrop-blur-sm">
                                                        <p className="text-[10px] text-white truncate capitalize">{photo.subtipo?.replace('_', ' ')}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {basePhotos.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                            <Badge variant="outline">Original</Badge> Fotos Base
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {basePhotos.map((photo) => (
                                                <div
                                                    key={photo.id}
                                                    className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${localSelected === photo.url ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-muted-foreground/50"
                                                        }`}
                                                    onClick={() => setLocalSelected(photo.url)}
                                                >
                                                    <img src={photo.url} alt="Base" className="w-full h-full object-cover" />
                                                    {localSelected === photo.url && (
                                                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                            <div className="bg-primary text-primary-foreground rounded-full p-1 shadow-lg">
                                                                <Check className="h-4 w-4" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirm} disabled={!localSelected}>
                        Confirmar Seleção
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
