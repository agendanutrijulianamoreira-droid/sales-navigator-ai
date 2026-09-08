import JSZip from "jszip";

async function buildAndDownloadZip(images: string[], title: string): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder("carousel");

  if (!folder) {
    throw new Error("Failed to create zip folder");
  }

  for (let i = 0; i < images.length; i++) {
    const imageUrl = images[i];
    try {
      if (imageUrl.startsWith("data:")) {
        const base64Data = imageUrl.split(",")[1];
        folder.file(`slide-${i + 1}.png`, base64Data, { base64: true });
      } else {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        folder.file(`slide-${i + 1}.png`, blob);
      }
    } catch (error) {
      console.error(`Error adding slide ${i + 1} to zip:`, error);
    }
  }

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title.replace(/[^a-zA-Z0-9]/g, "_") || "carousel"}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads pre-captured slide images (data URLs from the on-screen design, AI-generated
 * or not) as a ZIP. This is the "free" export path: it works regardless of whether any
 * slide used AI, since the images come from what's already rendered on screen.
 */
export async function downloadCapturedSlidesAsZip(images: string[], title: string): Promise<void> {
  if (images.length === 0) {
    throw new Error("Nenhum slide para exportar");
  }
  await buildAndDownloadZip(images, title);
}

/** @deprecated Prefer downloadCapturedSlidesAsZip, which doesn't require AI-generated images. */
export async function downloadCarouselAsZip(
  slides: { headline: string; imageUrl?: string }[],
  title: string
): Promise<void> {
  const slidesWithImages = slides.filter(slide => slide.imageUrl);
  if (slidesWithImages.length === 0) {
    throw new Error("Nenhum slide tem design gerado");
  }
  await buildAndDownloadZip(slidesWithImages.map(s => s.imageUrl as string), title);
}
