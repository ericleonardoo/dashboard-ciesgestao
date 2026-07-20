import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface FormDatePickerProps {
  value: string; // Formato YYYY-MM-DD
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
const DAYS_OF_WEEK = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export default function FormDatePicker({ value, onChange, placeholder = 'dd/mm/aaaa', required }: FormDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Data base de visualização do calendário (muda com as setinhas)
  const initialDate = value ? new Date(value + 'T12:00:00') : new Date();
  const [viewDate, setViewDate] = useState(initialDate);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const year = viewDate.getFullYear();
    const month = String(viewDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    onChange(`${year}-${month}-${dayStr}`);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const handleToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const dayStr = String(today.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${dayStr}`);
    setViewDate(today);
    setIsOpen(false);
  };

  // Render grid
  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Formata o valor selecionado para exibição "DD/MM/YYYY"
  let displayValue = '';
  if (value) {
    const [y, m, d] = value.split('-');
    if (y && m && d) displayValue = `${d}/${m}/${y}`;
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 bg-slate-50 border ${isOpen ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200'} rounded-lg text-sm cursor-pointer hover:bg-white transition-all flex items-center justify-between outline-none`}
      >
        <span className={displayValue ? 'text-slate-900 font-medium' : 'text-slate-400'}>
          {displayValue || placeholder}
        </span>
        <CalendarIcon className="w-4 h-4 text-slate-500" />
      </div>

      {/* Hidden input for HTML required validation if needed, mas não controlamos o form default. */}
      {required && (
        <input type="text" className="hidden" required value={value} readOnly />
      )}

      {/* Pop-up do Calendário */}
      {isOpen && (
        <div className="absolute left-0 mt-1 w-full sm:w-[280px] bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Cabeçalho Mes/Ano */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-slate-800 capitalize">
              {MONTHS[viewDate.getMonth()]} de {viewDate.getFullYear()}
            </span>
            <div className="flex space-x-1">
              <button 
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grid de Dias da Semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_OF_WEEK.map((d, i) => (
              <div key={i} className="text-center text-[11px] font-black text-slate-400">
                {d}
              </div>
            ))}
          </div>

          {/* Grid de Dias do Mês */}
          <div className="grid grid-cols-7 gap-1">
            {blanks.map(b => (
              <div key={`blank-${b}`} className="h-8 w-8" />
            ))}
            
            {days.map(d => {
              // Verifica se é o dia selecionado
              let isSelected = false;
              if (value) {
                const [sy, sm, sd] = value.split('-');
                if (
                  parseInt(sy) === viewDate.getFullYear() && 
                  parseInt(sm) === viewDate.getMonth() + 1 && 
                  parseInt(sd) === d
                ) {
                  isSelected = true;
                }
              }

              // Verifica se é hoje
              const today = new Date();
              const isToday = 
                today.getFullYear() === viewDate.getFullYear() &&
                today.getMonth() === viewDate.getMonth() &&
                today.getDate() === d;

              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDayClick(d)}
                  className={`h-8 w-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors
                    ${isSelected 
                      ? 'bg-primary text-white shadow-sm' 
                      : isToday 
                        ? 'bg-slate-100 text-primary font-bold hover:bg-slate-200' 
                        : 'text-slate-700 hover:bg-slate-100'
                    }
                  `}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* Rodapé do Calendário */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
            <button 
              type="button"
              onClick={handleClear}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Limpar
            </button>
            <button 
              type="button"
              onClick={handleToday}
              className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
            >
              Hoje
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
