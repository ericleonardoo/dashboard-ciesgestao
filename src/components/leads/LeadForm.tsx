'use client';

import React, { useState } from 'react';
import { Lead, leadSchema, LeadStatus, LeadOrigin } from '@/lib/validation/lead-schema';

interface LeadFormProps {
  initialData?: Lead;
  onSubmit: (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function LeadForm({ initialData, onSubmit, onCancel, isLoading = false }: LeadFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    cpf: initialData?.cpf || '',
    phone: initialData?.phone || '',
    interest: initialData?.interest || '',
    origin: initialData?.origin || 'organico' as LeadOrigin,
    status: initialData?.status || 'novo' as LeadStatus,
    lossReason: initialData?.lossReason || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar usando Zod
    const result = leadSchema.omit({ id: true, createdAt: true, updatedAt: true }).safeParse({
      ...formData,
      cpf: formData.cpf || undefined, // Zod schema says optional().or(literal(''))
      lossReason: formData.lossReason || undefined
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result.error.issues.forEach((err: any) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSubmit(result.data as any);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Nome Completo *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${errors.name ? 'border-destructive' : 'border-border'}`}
            placeholder="Ex: João da Silva"
          />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Telefone (WhatsApp) *</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${errors.phone ? 'border-destructive' : 'border-border'}`}
              placeholder="11999999999"
            />
            {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">CPF (Opcional)</label>
            <input
              type="text"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${errors.cpf ? 'border-destructive' : 'border-border'}`}
              placeholder="000.000.000-00"
            />
            {errors.cpf && <p className="text-xs text-destructive mt-1">{errors.cpf}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Curso de Interesse *</label>
          <input
            type="text"
            name="interest"
            value={formData.interest}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${errors.interest ? 'border-destructive' : 'border-border'}`}
            placeholder="Ex: Administração, Direito..."
          />
          {errors.interest && <p className="text-xs text-destructive mt-1">{errors.interest}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Status do Funil</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
            >
              <option value="novo">Novo</option>
              <option value="em_atendimento">Em Atendimento</option>
              <option value="matriculado">Matriculado (Ganho)</option>
              <option value="perdido">Perdido</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Origem do Lead</label>
            <select
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
            >
              <option value="organico">Orgânico</option>
              <option value="meta_ads">Meta Ads</option>
              <option value="google_ads">Google Ads</option>
              <option value="convenio">Convênio</option>
              <option value="indicacao">Indicação</option>
              <option value="outro">Outro</option>
            </select>
          </div>
        </div>

        {formData.status === 'perdido' && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Motivo da Perda</label>
            <textarea
              name="lossReason"
              value={formData.lossReason}
              onChange={handleChange}
              rows={3}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Descreva o motivo (Ex: Achou caro, não tinha o curso, etc.)"
            />
          </div>
        )}
      </div>

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
          {isLoading ? 'Salvando...' : 'Salvar Lead'}
        </button>
      </div>
    </form>
  );
}
