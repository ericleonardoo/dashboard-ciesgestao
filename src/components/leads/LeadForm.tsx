'use client';

import React, { useState } from 'react';
import { Lead, leadSchema, LeadStatus, LEAD_STATUS_LABELS, LEAD_SOURCES } from '@/lib/validation/lead-schema';
import FormSelect from '@/components/shared/FormSelect';
import FormDatePicker from '@/components/shared/FormDatePicker';

interface LeadFormProps {
  initialData?: Lead | null;
  collaborators?: { uid: string; name: string }[];
  currentUserId?: string;
  onSubmit: (data: Lead) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function LeadForm({
  initialData,
  collaborators = [],
  currentUserId,
  onSubmit,
  onCancel,
  isLoading = false
}: LeadFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    city: initialData?.city || 'Poços de Caldas',
    courseInterest: initialData?.courseInterest || '',
    modality: initialData?.modality || 'EAD',
    institutionInterest: initialData?.institutionInterest || 'UniFecaf',
    source: initialData?.source || 'WhatsApp',
    ownerId: initialData?.ownerId || currentUserId || (collaborators[0]?.uid || ''),
    status: initialData?.status || 'NEW' as LeadStatus,
    nextContactAt: initialData?.nextContactAt || '',
    potentialAmountCents: initialData?.potentialAmountCents ? (initialData.potentialAmountCents / 100).toString() : '',
    lossReason: initialData?.lossReason || '',
    notes: initialData?.notes || '',
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
    setErrors({});

    const amountNum = formData.potentialAmountCents ? Math.round(parseFloat(formData.potentialAmountCents) * 100) : undefined;
    const selectedOwner = collaborators.find(c => c.uid === formData.ownerId);

    const payload = {
      ...formData,
      potentialAmountCents: amountNum,
      ownerName: selectedOwner?.name || '',
    };

    const result = leadSchema.safeParse(payload);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    onSubmit(result.data as Lead);
  };

  const statusOptions = (Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map(key => ({
    value: key,
    label: LEAD_STATUS_LABELS[key].label
  }));

  const sourceOptions = LEAD_SOURCES.map(src => ({
    value: src,
    label: src
  }));

  const ownerOptions = collaborators.map(c => ({
    value: c.uid,
    label: c.name
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.lossReason && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-lg">
          {errors.lossReason}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nome */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Nome do Lead *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Ex: Maria Oliveira"
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* Telefone */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Telefone / WhatsApp *
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="(35) 99999-8888"
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>

        {/* Cidade */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Cidade
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Poços de Caldas"
          />
        </div>

        {/* Curso de Interesse */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Curso de Interesse *
          </label>
          <input
            type="text"
            name="courseInterest"
            value={formData.courseInterest}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Ex: Administração EAD"
          />
          {errors.courseInterest && <p className="text-xs text-red-500 mt-1">{errors.courseInterest}</p>}
        </div>

        {/* Modalidade */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Modalidade
          </label>
          <FormSelect
            value={formData.modality}
            onChange={val => setFormData(f => ({ ...f, modality: val as 'EAD' | 'SEMIPRESENCIAL' }))}
            options={[
              { value: 'EAD', label: 'EAD' },
              { value: 'SEMIPRESENCIAL', label: 'Semipresencial' }
            ]}
          />
        </div>

        {/* Instituição */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Instituição de Interesse
          </label>
          <FormSelect
            value={formData.institutionInterest}
            onChange={val => setFormData(f => ({ ...f, institutionInterest: val as 'UniFecaf' | 'UniFacvest' | 'FSL' }))}
            options={[
              { value: 'UniFecaf', label: 'UniFecaf' },
              { value: 'UniFacvest', label: 'UniFacvest' },
              { value: 'FSL', label: 'FSL' }
            ]}
          />
        </div>

        {/* Origem */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Origem do Lead
          </label>
          <FormSelect
            value={formData.source}
            onChange={val => setFormData(f => ({ ...f, source: val }))}
            options={sourceOptions}
          />
        </div>

        {/* Consultor Responsável */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Consultor Responsável *
          </label>
          <FormSelect
            value={formData.ownerId}
            onChange={val => setFormData(f => ({ ...f, ownerId: val }))}
            options={ownerOptions.length > 0 ? ownerOptions : [{ value: currentUserId || 'owner', label: 'Eu (Atual)' }]}
          />
          {errors.ownerId && <p className="text-xs text-red-500 mt-1">{errors.ownerId}</p>}
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Estágio no Funil
          </label>
          <FormSelect
            value={formData.status}
            onChange={val => setFormData(f => ({ ...f, status: val as LeadStatus }))}
            options={statusOptions}
          />
        </div>

        {/* Próximo Contato */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Próximo Contato (Follow-up)
          </label>
          <FormDatePicker
            value={formData.nextContactAt}
            onChange={val => setFormData(f => ({ ...f, nextContactAt: val }))}
          />
        </div>

        {/* Valor Potencial */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Valor Potencial (R$)
          </label>
          <input
            type="number"
            step="0.01"
            name="potentialAmountCents"
            value={formData.potentialAmountCents}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Ex: 199.90"
          />
        </div>

        {/* Motivo de Perda se status LOST */}
        {formData.status === 'LOST' && (
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
              Motivo da Perda *
            </label>
            <textarea
              name="lossReason"
              value={formData.lossReason}
              onChange={handleChange}
              rows={2}
              required
              className="w-full px-3 py-2 border border-red-300 bg-red-50/30 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="Descreva o motivo (ex: optou por concorrente, achou a mensalidade alta, etc.)"
            />
          </div>
        )}

        {/* Observações */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Observações
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Detalhes adicionais do atendimento..."
          />
        </div>
      </div>

      {/* Footer Botoes */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {isLoading ? 'Salvando...' : initialData ? 'Atualizar Lead' : 'Criar Lead'}
        </button>
      </div>
    </form>
  );
}
