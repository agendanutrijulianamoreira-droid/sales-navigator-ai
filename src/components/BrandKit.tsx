import React, { useState } from 'react';
import { useBrand } from '@/contexts/BrandContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Upload, Type, Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const FONT_OPTIONS = [
  { id: 'Inter', label: 'Inter (Moderna)' },
  { id: 'Playfair Display', label: 'Playfair (Elegante)' },
  { id: 'Montserrat', label: 'Montserrat (Clássica)' },
  { id: 'Lora', label: 'Lora (Serifada)' },
  { id: 'Outfit', label: 'Outfit (Tech)' },
];

const BrandKit: React.FC = () => {
  const { brand, updateBrand } = useBrand();
  const [isUploading, setIsUploading] = useState(false);

  const handleColorChange = (key: 'primary' | 'secondary', value: string) => {
    updateBrand({ [key]: value });
  };

  const handleFontChange = (key: 'fontHeading' | 'fontBody', value: string) => {
    updateBrand({ [key]: value });
  };

  const resetToDefault = () => {
    updateBrand({
      primary: '#1A1A1A',
      secondary: '#E2E8F0',
      fontHeading: 'Inter',
      fontBody: 'Inter',
    });
    toast.success('Configurações resetadas');
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Cores da Marca
          </CardTitle>
          <CardDescription>Defina sua paleta de cores principal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Cor Primária</Label>
              <div className="flex items-center gap-3">
                <Input 
                  type="color" 
                  value={brand.primary} 
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer bg-transparent border-0"
                />
                <Input 
                  type="text" 
                  value={brand.primary} 
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="w-24 font-mono text-xs uppercase"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Cor Secundária</Label>
              <div className="flex items-center gap-3">
                <Input 
                  type="color" 
                  value={brand.secondary} 
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer bg-transparent border-0"
                />
                <Input 
                  type="text" 
                  value={brand.secondary} 
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  className="w-24 font-mono text-xs uppercase"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-2">
            <div 
              className="flex-1 h-12 rounded-lg border shadow-inner" 
              style={{ backgroundColor: brand.primary }}
              title="Cor Primária"
            />
            <div 
              className="flex-1 h-12 rounded-lg border shadow-inner" 
              style={{ backgroundColor: brand.secondary }}
              title="Cor Secundária"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Type className="w-5 h-5 text-primary" />
            Tipografia
          </CardTitle>
          <CardDescription>Escolha as fontes para seus títulos e textos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Fonte para Títulos</Label>
              <Select value={brand.fontHeading} onValueChange={(v) => handleFontChange('fontHeading', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma fonte" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fonte para Corpo</Label>
              <Select value={brand.fontBody} onValueChange={(v) => handleFontChange('fontBody', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma fonte" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/30 border border-dashed">
            <h4 style={{ fontFamily: brand.fontHeading }} className="text-lg font-bold">Título de Exemplo</h4>
            <p style={{ fontFamily: brand.fontBody }} className="text-sm text-muted-foreground mt-1">
              Este é um exemplo de como seu conteúdo será exibido nos carrosséis.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardContent className="flex items-center justify-between py-4">
          <div className="text-sm text-muted-foreground">
            As alterações são salvas automaticamente no seu navegador.
          </div>
          <Button variant="ghost" size="sm" onClick={resetToDefault} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Resetar para o padrão
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandKit;