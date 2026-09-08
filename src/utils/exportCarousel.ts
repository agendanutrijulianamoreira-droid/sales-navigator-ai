import { toPng } from 'html-to-image';
import download from 'downloadjs';

/**
 * Captures a DOM element as a high-definition PNG data URL, without triggering a download.
 * Used to export the slide exactly as designed on screen — no AI generation required,
 * so it works for slides using only brand colors or an uploaded/library photo.
 * @param elementId The ID of the HTML element to capture.
 */
export async function captureSlideAsDataUrl(elementId: string): Promise<string> {
    const node = document.getElementById(elementId);

    if (!node) {
        throw new Error(`Elemento ${elementId} não encontrado para exportação.`);
    }

    return toPng(node, {
        quality: 1.0,
        pixelRatio: 3, // O SEGREDO: Renderiza 3x maior para ficar nítido
        cacheBust: true,
        style: {
            transform: 'scale(1)', // Garante que não pegue escalas de CSS transform
        }
    });
}

/**
 * Exports a DOM element as a high-definition PNG image.
 * @param elementId The ID of the HTML element to export.
 * @param fileName The name of the file to save (without extension).
 * @returns A promise that resolves to true when the export is complete.
 */
export async function exportSlideAsImage(elementId: string, fileName: string) {
    try {
        console.log(`Iniciando exportação de ${fileName}...`);
        const dataUrl = await captureSlideAsDataUrl(elementId);
        download(dataUrl, `${fileName}.png`);
        return true;
    } catch (error) {
        console.error('Erro ao exportar slide:', error);
        throw error;
    }
}
