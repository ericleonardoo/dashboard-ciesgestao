'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Partnership, partnershipSchema, PartnershipStatus } from '@/lib/validation/partnership-schema';

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
              : 'border-slate-350 hover:border-slate-400 shadow-sm'
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


interface PartnershipFormProps {
  initialData?: Partnership;
  responsibles: { uid: string; name: string }[];
  onSubmit: (data: Omit<Partnership, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function PartnershipForm({
  initialData,
  responsibles,
  onSubmit,
  onCancel,
  isLoading = false
}: PartnershipFormProps) {
  const [formData, setFormData] = useState({
    companyName: initialData?.companyName || '',
    contactName: initialData?.contactName || '',
    contactPhone: initialData?.contactPhone || '',
    ciesResponsibleId: initialData?.ciesResponsibleId || '',
    status: initialData?.status || 'em_negociacao' as PartnershipStatus,
    visitsCompleted: initialData?.visitsCompleted || 0,
    leadsGenerated: initialData?.conversionStats?.leadsGenerated || 0,
    enrollmentsClosed: initialData?.conversionStats?.enrollmentsClosed || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'visitsCompleted' || name === 'leadsGenerated' || name === 'enrollmentsClosed'
        ? parseInt(value) || 0
        : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar usando Zod
    const result = partnershipSchema.omit({ id: true, createdAt: true, updatedAt: true }).safeParse({
      companyName: formData.companyName,
      contactName: formData.contactName,
      contactPhone: formData.contactPhone,
      ciesResponsibleId: formData.ciesResponsibleId,
      status: formData.status,
      visitsCompleted: formData.visitsCompleted,
      conversionStats: {
        leadsGenerated: formData.leadsGenerated,
        enrollmentsClosed: formData.enrollmentsClosed,
      }
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path.join('.');
        // Mapeia erros aninhados de conversionStats de volta pro form linear
        if (path === 'conversionStats.leadsGenerated') {
          fieldErrors['leadsGenerated'] = err.message;
        } else if (path === 'conversionStats.enrollmentsClosed') {
          fieldErrors['enrollmentsClosed'] = err.message;
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
      <div className="space-y-4">
        {/* Nome da Empresa */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Nome da Empresa *</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors bg-background ${errors.companyName ? 'border-destructive' : 'border-border'}`}
            placeholder="Ex: Associação de Servidores X"
          />
          {errors.companyName && <p className="text-xs text-destructive mt-1">{errors.companyName}</p>}
        </div>

        {/* Contato & Telefone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nome do Contato *</label>
            <input
              type="text"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors bg-background ${errors.contactName ? 'border-destructive' : 'border-border'}`}
              placeholder="Ex: Marta Silva"
            />
            {errors.contactName && <p className="text-xs text-destructive mt-1">{errors.contactName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">WhatsApp de Contato *</label>
            <input
              type="text"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors bg-background ${errors.contactPhone ? 'border-destructive' : 'border-border'}`}
              placeholder="11999999999"
            />
            {errors.contactPhone && <p className="text-xs text-destructive mt-1">{errors.contactPhone}</p>}
          </div>
        </div>

        {/* Responsável & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Responsável CIES *</label>
            <FormSelect
              value={formData.ciesResponsibleId}
              onChange={(val) => {
                setFormData(prev => ({ ...prev, ciesResponsibleId: val }));
                if (errors.ciesResponsibleId) {
                  setErrors(prev => ({ ...prev, ciesResponsibleId: '' }));
                }
              }}
              options={responsibles.map((r) => ({ value: r.uid, label: r.name }))}
              placeholder="Selecione um responsável..."
              error={!!errors.ciesResponsibleId}
            />
            {errors.ciesResponsibleId && <p className="text-xs text-destructive mt-1">{errors.ciesResponsibleId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Status da Parceria</label>
            <FormSelect
              value={formData.status}
              onChange={(val) => {
                setFormData(prev => ({ ...prev, status: val as PartnershipStatus }));
              }}
              options={[
                { value: 'em_negociacao', label: 'Em Negociação' },
                { value: 'ativo', label: 'Ativo' },
                { value: 'inativo', label: 'Inativo' }
              ]}
            />
          </div>
        </div>

        {/* Visitas & Leads & Matrículas */}
        <div className="grid grid-cols-3 gap-4 border-t border-border pt-4 mt-2">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Visitas Concluídas</label>
            <input
              type="number"
              name="visitsCompleted"
              value={formData.visitsCompleted}
              onChange={handleChange}
              min="0"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Leads Gerados</label>
            <input
              type="number"
              name="leadsGenerated"
              value={formData.leadsGenerated}
              onChange={handleChange}
              min="0"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Matrículas</label>
            <input
              type="number"
              name="enrollmentsClosed"
              value={formData.enrollmentsClosed}
              onChange={handleChange}
              min="0"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
            />
          </div>
        </div>
      </div>

      {/* Ações */}
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
          {isLoading ? 'Salvando...' : 'Salvar Convênio'}
        </button>
      </div>
    </form>
  );
}
