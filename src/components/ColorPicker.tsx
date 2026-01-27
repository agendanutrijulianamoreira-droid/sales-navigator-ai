import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette } from "lucide-react";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

const PRESET_COLORS = [
  "#1a1a1a", "#374151", "#6b7280", "#9ca3af",
  "#dc2626", "#ea580c", "#d97706", "#ca8a04",
  "#16a34a", "#059669", "#0d9488", "#0891b2",
  "#0284c7", "#2563eb", "#4f46e5", "#7c3aed",
  "#9333ea", "#c026d3", "#db2777", "#e11d48",
];

export function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(color);
  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    // Validate hex color
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
      onChange(value);
    }
  };

  const handlePresetClick = (presetColor: string) => {
    setInputValue(presetColor);
    onChange(presetColor);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2 h-9">
          <div 
            className="w-4 h-4 rounded-full border border-border" 
            style={{ backgroundColor: color }} 
          />
          <span className="text-xs truncate">{label || color}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="flex gap-2">
            <div 
              className="w-10 h-10 rounded-lg border border-border flex-shrink-0" 
              style={{ backgroundColor: inputValue }} 
            />
            <Input
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="#000000"
              className="h-10 font-mono text-sm"
            />
          </div>
          
          <div className="grid grid-cols-5 gap-1.5">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                onClick={() => handlePresetClick(presetColor)}
                className={`w-8 h-8 rounded-md transition-all hover:scale-110 ${
                  color === presetColor ? "ring-2 ring-primary ring-offset-2" : ""
                }`}
                style={{ backgroundColor: presetColor }}
              />
            ))}
          </div>
          
          <div className="flex items-center gap-2 pt-1">
            <Palette className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Digite um código HEX ou escolha acima
            </span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
