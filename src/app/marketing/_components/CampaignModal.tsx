'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Campaign, CampaignChannel, CampaignStatus } from '@/lib/validation/campaign-schema';
import { createCampaign, updateCampaign } from '@/server/actions/campaigns';
import FormSelect from '@/components/shared/FormSelect';
import FormDatePicker from '@/components/shared/FormDatePicker';

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign?: Campaign | null;
  onSuccess: () => void;
}

const CHANNELS: CampaignChannel[] = [
  'Instagram', 'WhatsApp', 'Indicação', 'Presencial', 'Panfleto', 
  'Empresa conveniada', 'Evento', 'Google', 'TikTok', 'Campanha interna', 'Outro'
];
const STATUSES: CampaignStatus[] = ['Ativa', 'Pausada', 'Concluída'];

// Função simples para máscara de dinheiro real-time (R$ 1.000,00)
function formatCurrency(value: string) {
  let v = value.replace(/\D/g, '');
  if (!v) return '';
  v = (parseInt(v) / 100).toFixed(2);
  v = v.replace('.', ',');
  v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  return `R$ ${v}`;
}

export default function CampaignModal({ isOpen, onClose, campaign, onSuccess }: CampaignModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const getInitialState = () => {
    if (campaign) {
      return {
        name: campaign.name,
        channel: campaign.channel,
        startDate: campaign.startDate,
        endDate: campaign.endDate || '',
        costDisplay: formatCurrency((campaign.costCents || 0).toString()),
        leadsCount: campaign.leadsCount ? campaign.leadsCount.toString() : '',
        enrollmentsCount: campaign.enrollmentsCount ? campaign.enrollmentsCount.toString() : '',
        status: campaign.status,
        institution: campaign.institution || ''
      };
    }
    return {
      name: '',
      channel: 'Instagram' as CampaignChannel,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      costDisplay: '',
      leadsCount: '',
      enrollmentsCount: '',
      status: 'Ativa' as CampaignStatus,
      institution: ''
    };
  };

  const [formData, setFormData] = useState(getInitialState);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(getInitialState());
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign?.id, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const dto = {
      ...formData,
      costCents: formData.costDisplay || '0',
      leadsCount: parseInt(formData.leadsCount) || 0,
      enrollmentsCount: parseInt(formData.enrollmentsCount) || 0,
    };

    try {
      let res;
      if (campaign?.id) {
        res = await updateCampaign(campaign.id, dto);
      } else {
        res = await createCampaign(dto);
      }

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || 'Erro desconhecido');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-slate-800">
            {campaign ? 'Editar Campanha' : 'Nova Campanha'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <form id="campaign-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Nome */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nome da Campanha</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="Ex: Ação Mês da Mulher"
                />
              </div>

              {/* Canal */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Canal</label>
                <FormSelect
                  value={formData.channel}
                  onChange={(val) => setFormData(f => ({ ...f, channel: val as CampaignChannel }))}
                  options={CHANNELS}
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Status</label>
                <FormSelect
                  value={formData.status}
                  onChange={(val) => setFormData(f => ({ ...f, status: val as CampaignStatus }))}
                  options={STATUSES}
                />
              </div>

              {/* Data Início */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Data de Início</label>
                <FormDatePicker
                  value={formData.startDate}
                  onChange={(val) => setFormData(f => ({ ...f, startDate: val }))}
                  required
                />
              </div>

              {/* Data Fim */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Data de Fim <span className="text-slate-400 font-normal lowercase">(opcional)</span></label>
                <FormDatePicker
                  value={formData.endDate}
                  onChange={(val) => setFormData(f => ({ ...f, endDate: val }))}
                />
              </div>

              {/* Custo */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Custo da Ação (R$)</label>
                <input 
                  type="text" 
                  value={formData.costDisplay}
                  onChange={e => setFormData(f => ({ ...f, costDisplay: formatCurrency(e.target.value) }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="R$ 0,00"
                />
              </div>

              {/* Instituição/Curso */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Instituição / Curso <span className="text-slate-400 font-normal lowercase">(opcional)</span></label>
                <input 
                  type="text" 
                  value={formData.institution}
                  onChange={e => setFormData(f => ({ ...f, institution: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="Ex: FSL / Psicologia"
                />
              </div>

              {/* Leads */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Leads Gerados</label>
                <input 
                  type="number"
                  min="0"
                  value={formData.leadsCount}
                  onChange={e => setFormData(f => ({ ...f, leadsCount: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="0"
                />
              </div>

              {/* Matriculas */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Matrículas Fechadas</label>
                <input 
                  type="number"
                  min="0"
                  value={formData.enrollmentsCount}
                  onChange={e => setFormData(f => ({ ...f, enrollmentsCount: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="0"
                />
              </div>

            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-slate-50 space-x-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="campaign-form"
            disabled={loading}
            className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-sm hover:bg-primary/90 transition-all disabled:opacity-70 flex items-center"
          >
            {loading ? 'Salvando...' : 'Salvar Campanha'}
          </button>
        </div>

      </div>
    </div>
  );
}
