import { useState } from 'react';
import { ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackText?: string;
}

export function ImageWithFallback({
    src,
    alt,
    className,
    fallbackText = "Imagem indisponível",
    ...props
}: ImageWithFallbackProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    return (
        <div className={cn("relative overflow-hidden bg-muted/20 rounded-md", className)}>
            {/* Loading State */}
            {isLoading && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary/50 backdrop-blur-sm z-10">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            )}

            {/* Error State */}
            {error ? (
                <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-muted text-muted-foreground text-sm text-center">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <span>{fallbackText}</span>
                </div>
            ) : (
                /* Actual Image */
                <img
                    src={src}
                    alt={alt}
                    className={cn("w-full h-full object-cover transition-opacity duration-300", isLoading ? "opacity-0" : "opacity-100")}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setError(true);
                        setIsLoading(false);
                    }}
                    {...props}
                />
            )}
        </div>
    );
}
