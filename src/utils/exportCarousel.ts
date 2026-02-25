import { toPng } from 'html-to-image';
import download from 'downloadjs';

/**
 * Exports a DOM element as a high-definition PNG image.
 * @param elementId The ID of the HTML element to export.
 * @param fileName The name of the file to save (without extension).
 * @returns A promise that resolves to true when the export is complete.
 */
export async function exportSlideAsImage(elementId: string, fileName: string) {
    const node = document.getElementById(elementId);

    if (!node) {
        throw new Error(`Elemento ${elementId} não encontrado para exportação.`);
    }

    try {
        console.log(`Iniciando exportação de ${fileName}...`);

        const dataUrl = await toPng(node, {
            quality: 1.0,
            pixelRatio: 3, // O SEGREDO: Renderiza 3x maior para ficar nítido
            cacheBust: true,
            style: {
                transform: 'scale(1)', // Garante que não pegue escalas de CSS transform
            }
        });

        download(dataUrl, `${fileName}.png`);
        return true;
    } catch (error) {
        console.error('Erro ao exportar slide:', error);
        throw error;
    }
}
