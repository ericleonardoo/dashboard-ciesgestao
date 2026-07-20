'use client';

import React, { useState } from 'react';
import { Partnership, partnershipSchema, PartnershipStatus } from '@/lib/validation/partnership-schema';

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
            <select
              name="ciesResponsibleId"
              value={formData.ciesResponsibleId}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors bg-background ${errors.ciesResponsibleId ? 'border-destructive' : 'border-border'}`}
            >
              <option value="">Selecione um responsável...</option>
              {responsibles.map((r) => (
                <option key={r.uid} value={r.uid}>
                  {r.name}
                </option>
              ))}
            </select>
            {errors.ciesResponsibleId && <p className="text-xs text-destructive mt-1">{errors.ciesResponsibleId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Status da Parceria</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
            >
              <option value="em_negociacao">Em Negociação</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
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
