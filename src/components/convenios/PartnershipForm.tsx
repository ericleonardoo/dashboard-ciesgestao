'use client';

import React, { useState } from 'react';
import { Partnership, partnershipSchema, B2BStatus, B2B_STATUS_LABELS, B2B_SEGMENTS } from '@/lib/validation/partnership-schema';
import FormSelect from '@/components/shared/FormSelect';
import FormDatePicker from '@/components/shared/FormDatePicker';

interface PartnershipFormProps {
  initialData?: Partnership | null;
  responsibles: { uid: string; name: string }[];
  currentUserId?: string;
  onSubmit: (data: Partnership) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function PartnershipForm({
  initialData,
  responsibles,
  currentUserId,
  onSubmit,
  onCancel,
  isLoading = false
}: PartnershipFormProps) {
  const [formData, setFormData] = useState({
    companyName: initialData?.companyName || '',
    cnpj: initialData?.cnpj || '',
    segment: initialData?.segment || 'Comércio / Varejo',
    estimatedEmployees: initialData?.estimatedEmployees ? initialData.estimatedEmployees.toString() : '',
    city: initialData?.city || 'Poços de Caldas',
    contactName: initialData?.contactName || '',
    contactRole: initialData?.contactRole || 'Gestor de RH',
    contactPhone: initialData?.contactPhone || '',
    contactEmail: initialData?.contactEmail || '',
    deciderIdentified: initialData?.deciderIdentified ?? false,
    ownerId: initialData?.ownerId || currentUserId || (responsibles[0]?.uid || ''),
    status: initialData?.status || 'PROSPECTED' as B2BStatus,
    nextStep: initialData?.nextStep || '',
    nextStepAt: initialData?.nextStepAt || '',
    meetingDate: initialData?.meetingDate || '',
    noInterestReason: initialData?.noInterestReason || '',
    notes: initialData?.notes || '',
    visitsCompleted: initialData?.visitsCompleted || 0,
    leadsGenerated: initialData?.conversionStats?.leadsGenerated || 0,
    enrollmentsClosed: initialData?.conversionStats?.enrollmentsClosed || 0,
    totalRevenueCents: initialData?.conversionStats?.totalRevenueCents || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const selectedOwner = responsibles.find(r => r.uid === formData.ownerId);

    const payload = {
      ...formData,
      estimatedEmployees: formData.estimatedEmployees ? parseInt(formData.estimatedEmployees, 10) : undefined,
      ownerName: selectedOwner?.name || '',
      conversionStats: {
        leadsGenerated: formData.leadsGenerated,
        enrollmentsClosed: formData.enrollmentsClosed,
        totalRevenueCents: formData.totalRevenueCents,
      }
    };

    const result = partnershipSchema.safeParse(payload);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    onSubmit(result.data as Partnership);
  };

  const statusOptions = (Object.keys(B2B_STATUS_LABELS) as B2BStatus[]).map(key => ({
    value: key,
    label: B2B_STATUS_LABELS[key].label
  }));

  const segmentOptions = B2B_SEGMENTS.map(seg => ({
    value: seg,
    label: seg
  }));

  const ownerOptions = responsibles.map(r => ({
    value: r.uid,
    label: r.name
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.noInterestReason && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-lg">
          {errors.noInterestReason}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nome da Empresa */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Empresa / Razão Social *
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Ex: Cerâmica Poços Ltda"
          />
          {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName}</p>}
        </div>

        {/* CNPJ */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            CNPJ (Opcional no início)
          </label>
          <input
            type="text"
            name="cnpj"
            value={formData.cnpj}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="00.000.000/0001-00"
          />
        </div>

        {/* Segmento */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Segmento
          </label>
          <FormSelect
            value={formData.segment}
            onChange={val => setFormData(f => ({ ...f, segment: val }))}
            options={segmentOptions}
          />
        </div>

        {/* Funcionários Estimados */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Nº Estimado de Funcionários
          </label>
          <input
            type="number"
            name="estimatedEmployees"
            value={formData.estimatedEmployees}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Ex: 150"
          />
        </div>

        {/* Nome do Contato */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Nome do Contato *
          </label>
          <input
            type="text"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Ex: Carlos Andrade"
          />
          {errors.contactName && <p className="text-xs text-red-500 mt-1">{errors.contactName}</p>}
        </div>

        {/* Cargo do Contato */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Cargo do Contato
          </label>
          <input
            type="text"
            name="contactRole"
            value={formData.contactRole}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Ex: Gerente de RH / Diretor"
          />
        </div>

        {/* WhatsApp do Contato */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            WhatsApp de Contato *
          </label>
          <input
            type="text"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="(35) 99888-7766"
          />
          {errors.contactPhone && <p className="text-xs text-red-500 mt-1">{errors.contactPhone}</p>}
        </div>

        {/* E-mail do Contato */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            E-mail do Contato
          </label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="carlos@empresa.com.br"
          />
        </div>

        {/* Responsável CIES */}
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

        {/* Status do Funil B2B */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Estágio no Funil B2B
          </label>
          <FormSelect
            value={formData.status}
            onChange={val => setFormData(f => ({ ...f, status: val as B2BStatus }))}
            options={statusOptions}
          />
        </div>

        {/* Data da Reunião */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Data da Reunião
          </label>
          <FormDatePicker
            value={formData.meetingDate}
            onChange={val => setFormData(f => ({ ...f, meetingDate: val }))}
          />
        </div>

        {/* Próximo Passo */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Data do Próximo Passo
          </label>
          <FormDatePicker
            value={formData.nextStepAt}
            onChange={val => setFormData(f => ({ ...f, nextStepAt: val }))}
          />
        </div>

        {/* Decisor Identificado Checkbox */}
        <div className="md:col-span-2 flex items-center space-x-2 py-2">
          <input
            type="checkbox"
            id="deciderIdentified"
            name="deciderIdentified"
            checked={formData.deciderIdentified}
            onChange={handleChange}
            className="w-4 h-4 text-primary rounded focus:ring-primary border-slate-300"
          />
          <label htmlFor="deciderIdentified" className="text-xs font-bold text-slate-700 cursor-pointer">
            Contato Decisor Confirmado (Possui autorização para aprovar parceria)
          </label>
        </div>

        {/* Motivo de Sem Interesse */}
        {formData.status === 'NO_INTEREST' && (
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
              Motivo da Recusa / Encerramento *
            </label>
            <textarea
              name="noInterestReason"
              value={formData.noInterestReason}
              onChange={handleChange}
              rows={2}
              required
              className="w-full px-3 py-2 border border-red-300 bg-red-50/30 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="Descreva o motivo (ex: empresa não oferece convênio de estudos aos funcionários)"
            />
          </div>
        )}

        {/* Observações */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Próximo Passo / Observações
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Anotações da última conversa ou próximo compromisso..."
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
          {isLoading ? 'Salvando...' : initialData ? 'Atualizar Empresa' : 'Cadastrar Empresa'}
        </button>
      </div>
    </form>
  );
}
