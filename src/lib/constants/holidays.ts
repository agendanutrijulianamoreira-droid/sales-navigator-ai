export interface CommemorativeDate {
  day: number;
  month: number; // 0-indexed (0 = Jan, 11 = Dec)
  label: string;
  type: 'health' | 'holiday' | 'commercial';
  color?: string;
}

export const COMMEMORATIVE_DATES: CommemorativeDate[] = [
  // Janeiro
  { day: 1, month: 0, label: "Ano Novo", type: 'holiday' },
  { day: 26, month: 0, label: "Dia dos Aposentados", type: 'commercial' },
  
  // Fevereiro
  { day: 10, month: 1, label: "Dia Mundial das Leguminosas", type: 'health' },
  
  // Março
  { day: 8, month: 2, label: "Dia da Mulher", type: 'commercial' },
  { day: 20, month: 2, label: "Dia da Felicidade", type: 'commercial' },
  { day: 31, month: 2, label: "Saúde e Nutrição", type: 'health', color: 'bg-emerald-500' },
  
  // Abril
  { day: 7, month: 3, label: "Dia Mundial da Saúde", type: 'health', color: 'bg-emerald-500' },
  { day: 21, month: 3, label: "Tiradentes", type: 'holiday' },
  { day: 26, month: 3, label: "Prevenção da Hipertensão", type: 'health' },
  
  // Maio
  { day: 1, month: 4, label: "Dia do Trabalho", type: 'holiday' },
  { day: 20, month: 4, label: "Dia do Pediatra", type: 'health' },
  { day: 31, month: 4, label: "Dia sem Tabaco", type: 'health' },
  
  // Junho
  { day: 5, month: 5, label: "Meio Ambiente", type: 'health' },
  { day: 12, month: 5, label: "Dia dos Namorados", type: 'commercial' },
  
  // Julho
  { day: 26, month: 6, label: "Dia dos Avós", type: 'commercial' },
  
  // Agosto
  { day: 5, month: 7, label: "Dia Nacional da Saúde", type: 'health', color: 'bg-emerald-500' },
  { day: 31, month: 7, label: "Dia do Nutricionista", type: 'health', color: 'bg-primary' },
  
  // Setembro
  { day: 7, month: 8, label: "Independência do Brasil", type: 'holiday' },
  { day: 21, month: 8, label: "Dia da Árvore", type: 'health' },
  { day: 29, month: 8, label: "Dia Mundial do Coração", type: 'health' },
  
  // Outubro
  { day: 12, month: 9, label: "Nossa Sra Aparecida", type: 'holiday' },
  { day: 16, month: 9, label: "Mundial da Alimentação", type: 'health', color: 'bg-orange-500' },
  { day: 25, month: 9, label: "Dia do Dentista", type: 'commercial' },
  
  // Novembro
  { day: 2, month: 10, label: "Finados", type: 'holiday' },
  { day: 14, month: 10, label: "Dia do Diabetes", type: 'health', color: 'bg-blue-500' },
  { day: 15, month: 10, label: "Proclamação República", type: 'holiday' },
  { day: 20, month: 10, label: "Consciência Negra", type: 'holiday' },
  { day: 27, month: 10, label: "Black Friday", type: 'commercial', color: 'bg-zinc-900' },
  
  // Dezembro
  { day: 25, month: 11, label: "Natal", type: 'holiday' },
  { day: 31, month: 11, label: "Véspera de Ano Novo", type: 'holiday' },
];

export function getHolidaysForMonth(month: number) {
  return COMMEMORATIVE_DATES.filter(d => d.month === month);
}

export function getHolidayForDate(day: number, month: number) {
  return COMMEMORATIVE_DATES.find(d => d.day === day && d.month === month);
}
