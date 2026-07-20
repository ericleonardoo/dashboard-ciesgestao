import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { normalizeReferenceMonth } from '../../lib/validation/enrollment-schema';

interface PeriodSelectorProps {
  availableMonths: string[];
  selectedMonth: string;
  onChange: (month: string) => void;
}

export function formatMonthName(monthStr: string) {
  if (!monthStr) return '';
  // Normaliza para YYYY-MM antes de tentar formatar
  const normalized = normalizeReferenceMonth(monthStr);
  const parts = normalized.split('-');
  const yearNum = parseInt(parts[0]);
  const monthNum = parseInt(parts[1]);
  // Se após normalizar ainda não temos números válidos, retorna o texto original
  if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return monthStr;
  }
  const date = new Date(yearNum, monthNum - 1);
  const monthName = date.toLocaleDateString('pt-BR', { month: 'long' });
  return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} / ${yearNum}`;
}

export default function PeriodSelector({ availableMonths, selectedMonth, onChange }: PeriodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (availableMonths.length === 0) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 bg-white border border-gray-300 px-4 py-2.5 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          PERÍODO:
        </span>
        <div className="flex items-center space-x-3">
          <span className="text-[15px] font-bold text-slate-900">
            {formatMonthName(selectedMonth)}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Menu Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-full min-w-[220px] bg-white border border-gray-300 rounded-xl shadow-lg z-50 p-1.5 animate-in fade-in zoom-in-95 duration-100">
          {availableMonths.map((m) => {
            const isActive = m === selectedMonth;
            return (
              <div
                key={m}
                onClick={() => {
                  onChange(m);
                  setIsOpen(false);
                }}
                className={`px-3 py-2.5 my-0.5 text-[15px] cursor-pointer flex items-center justify-between rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-slate-100 text-slate-900 font-bold' 
                    : 'text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                {formatMonthName(m)}
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900 ml-3"></div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
