import { AppLayout } from "@/components/AppLayout";
import { BrandKit } from "@/components/BrandKit";

export default function BrandKitPage() {
  return (
    <AppLayout title="Kit de Marca" description="Configure sua identidade visual">
      <BrandKit />
    </AppLayout>
  );
}