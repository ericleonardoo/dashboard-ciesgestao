'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { ActionPlan, actionPlanSchema, ActionPlanStatus } from '@/lib/validation/action-plan-schema';

interface FormSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: boolean;
}

function FormSelect({ value, onChange, options, placeholder, error }: FormSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
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

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between bg-white border ${
          isOpen 
            ? 'border-primary ring-2 ring-primary/20' 
            : error 
              ? 'border-destructive' 
              : 'border-slate-300 hover:border-slate-400 shadow-sm'
        } px-3.5 py-2.5 rounded-xl cursor-pointer transition-all w-full text-sm h-[46px]`}
      >
        <span className={`truncate ${selectedOption ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
          {selectedOption ? selectedOption.label : placeholder || 'Selecione...'}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-1.5 animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto">
          {placeholder && (
            <div
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="px-3 py-2 text-xs text-slate-400 cursor-pointer rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              {placeholder}
            </div>
          )}
          {options.map((opt) => {
            const isActive = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-3 py-2.5 my-0.5 text-sm cursor-pointer flex items-center justify-between rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-slate-100 text-slate-900 font-bold' 
                    : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <span className="truncate pr-2">{opt.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-950 ml-1"></div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface ActionPlanFormProps {
  initialData?: ActionPlan;
  onSubmit: (data: Omit<ActionPlan, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ActionPlanForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}: ActionPlanFormProps) {
  // Converte centavos iniciais para string legível (ex: 15000 -> 150,00)
  const formatInitialCurrency = (cents: number | undefined) => {
    if (cents === undefined) return '';
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100);
  };

  const [formData, setFormData] = useState({
    what: initialData?.what || '',
    why: initialData?.why || '',
    where: initialData?.where || '',
    when: initialData?.when || '',
    who: initialData?.who || '',
    how: initialData?.how || '',
    howMuchRaw: formatInitialCurrency(initialData?.howMuchCents),
    status: initialData?.status || 'pendente' as ActionPlanStatus,
    kpiAssociated: initialData?.kpiAssociated || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar usando Zod
    const result = actionPlanSchema.omit({ id: true, createdAt: true, updatedAt: true }).safeParse({
      what: formData.what,
      why: formData.why,
      where: formData.where,
      when: formData.when,
      who: formData.who,
      how: formData.how,
      howMuchCents: formData.howMuchRaw || '0', // O schema do Zod faz parseCurrencyToCents
      status: formData.status,
      kpiAssociated: formData.kpiAssociated || undefined,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0] === 'howMuchCents') {
          fieldErrors['howMuchRaw'] = err.message;
        } else if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 5W2H Form Grid */}
      <div className="space-y-4">
        {/* WHAT (O quê) */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">O quê? (Ação / Objetivo) *</label>
          <textarea
            name="what"
            value={formData.what}
            onChange={handleChange}
            rows={2}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors bg-background ${errors.what ? 'border-destructive' : 'border-border'}`}
            placeholder="Ex: Treinamento de captação e vendas para a equipe de consultores"
          />
          {errors.what && <p className="text-xs text-destructive mt-1">{errors.what}</p>}
        </div>

        {/* WHY (Por quê) */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Por quê? (Justificativa) *</label>
          <textarea
            name="why"
            value={formData.why}
            onChange={handleChange}
            rows={2}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors bg-background ${errors.why ? 'border-destructive' : 'border-border'}`}
            placeholder="Ex: Aumentar a taxa de conversão de leads frios vindos do tráfego pago"
          />
          {errors.why && <p className="text-xs text-destructive mt-1">{errors.why}</p>}
        </div>

        {/* WHO (Quem) & WHEN (Quando) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Quem? (Responsável) *</label>
            <input
              type="text"
              name="who"
              value={formData.who}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors bg-background ${errors.who ? 'border-destructive' : 'border-border'}`}
              placeholder="Ex: Nayara Silva"
            />
            {errors.who && <p className="text-xs text-destructive mt-1">{errors.who}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Quando? (Data de Execução) *</label>
            <input
              type="text"
              name="when"
              value={formData.when}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors bg-background ${errors.when ? 'border-destructive' : 'border-border'}`}
              placeholder="Ex: 25/08/2026"
            />
            {errors.when && <p className="text-xs text-destructive mt-1">{errors.when}</p>}
          </div>
        </div>

        {/* WHERE (Onde) & HOW MUCH (Quanto custa) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Onde? (Local) *</label>
            <input
              type="text"
              name="where"
              value={formData.where}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors bg-background ${errors.where ? 'border-destructive' : 'border-border'}`}
              placeholder="Ex: Sede do Polo CIES ou Zoom"
            />
            {errors.where && <p className="text-xs text-destructive mt-1">{errors.where}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Quanto custa? (Valor estimado em R$)</label>
            <input
              type="text"
              name="howMuchRaw"
              value={formData.howMuchRaw}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors bg-background ${errors.howMuchRaw ? 'border-destructive' : 'border-border'}`}
              placeholder="Ex: 150,00 ou R$ 0,00"
            />
            {errors.howMuchRaw && <p className="text-xs text-destructive mt-1">{errors.howMuchRaw}</p>}
          </div>
        </div>

        {/* HOW (Como) */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Como? (Método de Execução) *</label>
          <textarea
            name="how"
            value={formData.how}
            onChange={handleChange}
            rows={2}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors bg-background ${errors.how ? 'border-destructive' : 'border-border'}`}
            placeholder="Ex: Realizar reunião de alinhamento com simulação prática de script de vendas"
          />
          {errors.how && <p className="text-xs text-destructive mt-1">{errors.how}</p>}
        </div>

        {/* STATUS & KPI ASSOCIATED */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Status</label>
            <FormSelect
              value={formData.status}
              onChange={(val) => setFormData(prev => ({ ...prev, status: val as ActionPlanStatus }))}
              options={[
                { value: 'pendente', label: 'Pendente' },
                { value: 'em_andamento', label: 'Em Andamento' },
                { value: 'concluido', label: 'Concluído' },
                { value: 'cancelado', label: 'Cancelado' }
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">KPI/Indicador Relacionado</label>
            <input
              type="text"
              name="kpiAssociated"
              value={formData.kpiAssociated}
              onChange={handleChange}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
              placeholder="Ex: Taxa de conversão comercial"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isLoading ? 'Salvando...' : 'Salvar Plano'}
        </button>
      </div>
    </form>
  );
}
