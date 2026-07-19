import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface MonthPickerProps {
  value: string; // Formato YYYY-MM
  onChange: (value: string) => void;
  required?: boolean;
}

const MONTHS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

export default function MonthPicker({ value, onChange, required }: MonthPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Extrai o ano e mês atuais do value, ou usa a data atual
  const initialYear = value ? parseInt(value.split('-')[0]) : new Date().getFullYear();
  const initialMonthIndex = value ? parseInt(value.split('-')[1]) - 1 : null;
  
  const [viewYear, setViewYear] = useState(initialYear);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sincroniza o viewYear quando o menu abre
  useEffect(() => {
    if (isOpen) {
      setViewYear(value ? parseInt(value.split('-')[0]) : new Date().getFullYear());
    }
  }, [isOpen, value]);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectMonth = (monthIndex: number) => {
    const formattedMonth = (monthIndex + 1).toString().padStart(2, '0');
    onChange(`${viewYear}-${formattedMonth}`);
    setIsOpen(false);
  };

  const handleSetCurrentMonth = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
    onChange(`${currentYear}-${currentMonth}`);
    setIsOpen(false);
  };

  // Display label
  const displayLabel = value 
    ? `${MONTHS[parseInt(value.split('-')[1]) - 1]} / ${value.split('-')[0]}`
    : 'Selecione o mês';

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Botão Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between bg-white border ${
          isOpen ? 'border-primary ring-2 ring-primary/20' : 'border-gray-300 hover:border-gray-400'
        } px-4 py-3 rounded-xl shadow-sm cursor-pointer transition-all w-full`}
      >
        <div className="flex items-center space-x-3">
          <CalendarIcon className="w-4 h-4 text-slate-400" />
          <span className={`text-sm font-medium ${value ? 'text-slate-900' : 'text-slate-400'}`}>
            {displayLabel}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {/* Input escondido para validação de forms nativos */}
      {required && (
        <input 
          type="text" 
          required 
          value={value} 
          onChange={() => {}} 
          className="absolute opacity-0 w-0 h-0 p-0 m-0 overflow-hidden"
          tabIndex={-1}
        />
      )}

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 md:left-auto md:right-auto md:w-[280px] mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header de Controle de Ano */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); setViewYear(v => v - 1); }}
              className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-bold text-slate-800 tracking-wide">
              {viewYear}
            </span>
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); setViewYear(v => v + 1); }}
              className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Grid de Meses */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {MONTHS.map((monthStr, index) => {
              const isSelected = value && parseInt(value.split('-')[0]) === viewYear && parseInt(value.split('-')[1]) - 1 === index;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectMonth(index)}
                  className={`
                    py-2 rounded-lg text-sm font-medium transition-all
                    ${isSelected 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }
                  `}
                >
                  {monthStr}
                </button>
              );
            })}
          </div>

          {/* Footer de Ações Rápidas */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => { onChange(''); setIsOpen(false); }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-2 py-1 rounded-md transition-colors"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={handleSetCurrentMonth}
              className="text-xs font-bold text-primary hover:text-primary/80 px-2 py-1 rounded-md transition-colors"
            >
              Mês atual
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
