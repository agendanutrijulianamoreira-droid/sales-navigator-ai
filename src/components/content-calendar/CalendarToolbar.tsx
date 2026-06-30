import { Search, SlidersHorizontal, Plus, LayoutGrid, Calendar as CalendarIcon, Grid3X3 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { STATUS_ORDER, STATUS_CONFIG } from "@/lib/constants/contentCalendarStatus";
import { FORMAT_ORDER, FORMAT_CONFIG } from "@/lib/constants/contentCalendarFormat";
import { Platform, PostFormat, PostStatus } from "@/types/contentCalendar";

export type ViewMode = "mensal" | "semanal" | "feed";

export interface FilterState {
  status: PostStatus[];
  format: PostFormat[];
  platform: Platform[];
}

interface CalendarToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  onNewPost: () => void;
}

function toggleInArray<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export function CalendarToolbar({
  search, onSearchChange, view, onViewChange, filters, onFiltersChange, onNewPost,
}: CalendarToolbarProps) {
  const activeFilterCount = filters.status.length + filters.format.length + filters.platform.length;

  return (
    <div className="flex items-center gap-2 px-5 py-3 bg-white border-b border-[#E8E8EC] flex-wrap">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B80]" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por título ou tag..."
          className="w-full h-[38px] pl-9 pr-3 rounded-lg border border-[#E8E8EC] bg-white text-sm text-[#1A1A2E] placeholder:text-[#6B6B80] focus:outline-none focus:ring-2 focus:ring-[#6D4AE8]/30 focus:border-[#6D4AE8]"
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <button className="h-[38px] px-3 inline-flex items-center gap-1.5 rounded-lg border border-[#E8E8EC] bg-white text-sm font-medium text-[#1A1A2E] hover:bg-[#F8F8FA] transition-colors">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="ml-0.5 text-[10px] font-bold bg-[#6D4AE8] text-white rounded-full w-4 h-4 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-3 space-y-3">
          <div>
            <p className="text-[11px] font-semibold text-[#6B6B80] uppercase mb-1.5">Status</p>
            <div className="space-y-1.5">
              {STATUS_ORDER.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={filters.status.includes(s)}
                    onCheckedChange={() => onFiltersChange({ ...filters, status: toggleInArray(filters.status, s) })}
                  />
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_CONFIG[s].hex }} />
                  {STATUS_CONFIG[s].label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#6B6B80] uppercase mb-1.5">Formato</p>
            <div className="space-y-1.5">
              {FORMAT_ORDER.map((f) => (
                <label key={f} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={filters.format.includes(f)}
                    onCheckedChange={() => onFiltersChange({ ...filters, format: toggleInArray(filters.format, f) })}
                  />
                  {FORMAT_CONFIG[f].label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#6B6B80] uppercase mb-1.5">Plataforma</p>
            <div className="space-y-1.5">
              {(["instagram", "tiktok"] as Platform[]).map((p) => (
                <label key={p} className="flex items-center gap-2 text-sm cursor-pointer capitalize">
                  <Checkbox
                    checked={filters.platform.includes(p)}
                    onCheckedChange={() => onFiltersChange({ ...filters, platform: toggleInArray(filters.platform, p) })}
                  />
                  {p}
                </label>
              ))}
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={() => onFiltersChange({ status: [], format: [], platform: [] })}
              className="text-xs text-[#6D4AE8] font-medium hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </PopoverContent>
      </Popover>

      <div className="flex items-center bg-[#F8F8FA] rounded-lg p-1 gap-0.5">
        {[
          { key: "semanal" as const, label: "Semanal", icon: CalendarIcon },
          { key: "mensal" as const, label: "Mensal", icon: LayoutGrid },
          { key: "feed" as const, label: "Feed", icon: Grid3X3 },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onViewChange(key)}
            className={`h-8 px-3 inline-flex items-center gap-1.5 rounded-md text-xs font-semibold transition-colors ${
              view === key ? "bg-[#6D4AE8] text-white" : "text-[#6B6B80] hover:text-[#1A1A2E]"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <button
        onClick={onNewPost}
        className="ml-auto h-[38px] px-4 inline-flex items-center gap-1.5 rounded-lg bg-[#6D4AE8] hover:bg-[#5d3bd6] text-white text-sm font-semibold transition-colors"
      >
        <Plus className="h-4 w-4" />
        Novo Post
      </button>
    </div>
  );
}
