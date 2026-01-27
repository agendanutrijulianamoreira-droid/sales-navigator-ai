import JSZip from "jszip";

export async function downloadCarouselAsZip(
  slides: { headline: string; imageUrl?: string }[],
  title: string
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder("carousel");
  
  if (!folder) {
    throw new Error("Failed to create zip folder");
  }

  // Filter slides with images
  const slidesWithImages = slides.filter(slide => slide.imageUrl);
  
  if (slidesWithImages.length === 0) {
    throw new Error("Nenhum slide tem design gerado");
  }

  // Download and add each image to the zip
  for (let i = 0; i < slidesWithImages.length; i++) {
    const slide = slidesWithImages[i];
    if (!slide.imageUrl) continue;

    try {
      // Handle base64 data URLs
      if (slide.imageUrl.startsWith("data:")) {
        const base64Data = slide.imageUrl.split(",")[1];
        folder.file(`slide-${i + 1}.png`, base64Data, { base64: true });
      } else {
        // Handle external URLs
        const response = await fetch(slide.imageUrl);
        const blob = await response.blob();
        folder.file(`slide-${i + 1}.png`, blob);
      }
    } catch (error) {
      console.error(`Error adding slide ${i + 1} to zip:`, error);
    }
  }

  // Generate and download the zip
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
