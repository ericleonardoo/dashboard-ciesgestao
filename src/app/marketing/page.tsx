'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, TrendingUp, Users, Target, Banknote, Edit3, Trash2 } from 'lucide-react';
import FilterSelect from '@/components/shared/FilterSelect';
import PeriodSelector from '@/components/shared/PeriodSelector';
import CampaignModal from './_components/CampaignModal';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { getCampaigns, deleteCampaign } from '@/server/actions/campaigns';
import { Campaign, CampaignChannel } from '@/lib/validation/campaign-schema';

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState<string>(''); // Vazio = Todos os períodos
  const [filterChannel, setFilterChannel] = useState<string>('TODOS');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    const res = await getCampaigns({ 
      period: filterPeriod || undefined,
      channel: filterChannel !== 'TODOS' ? filterChannel : undefined
    });
    
    if (res.success && res.data) {
      setCampaigns(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
  }, [filterPeriod, filterChannel]);

  // Cálculos de KPIs
  const totalCost = campaigns.reduce((acc, c) => acc + (c.costCents || 0), 0);
  const totalLeads = campaigns.reduce((acc, c) => acc + (c.leadsCount || 0), 0);
  const totalEnrollments = campaigns.reduce((acc, c) => acc + (c.enrollmentsCount || 0), 0);
  
  const avgCPL = totalLeads > 0 ? (totalCost / totalLeads) : 0;
  const avgCPA = totalEnrollments > 0 ? (totalCost / totalEnrollments) : 0;
  const avgConversion = totalLeads > 0 ? ((totalEnrollments / totalLeads) * 100) : 0;

  const handleEdit = (c: Campaign) => {
    setEditingCampaign(c);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setEditingCampaign(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setCampaignToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (campaignToDelete) {
      await deleteCampaign(campaignToDelete);
      setCampaignToDelete(null);
      fetchCampaigns();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header & Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center">
            <Megaphone className="w-8 h-8 mr-3 text-primary" />
            Marketing e Campanhas
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Gerencie investimentos, leads e o custo de aquisição.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <PeriodSelector 
            availableMonths={['2026-07', '2026-06', '2026-05']} 
            selectedMonth={filterPeriod} 
            onChange={setFilterPeriod} 
          />
          <FilterSelect 
            value={filterChannel} 
            onChange={setFilterChannel} 
            options={[
              { value: 'TODOS', label: 'Canal: Todos' },
              { value: 'Instagram', label: 'Instagram' },
              { value: 'WhatsApp', label: 'WhatsApp' },
              { value: 'Google', label: 'Google' },
              { value: 'TikTok', label: 'TikTok' },
              { value: 'Presencial', label: 'Presencial' },
            ]}
          />
          <button 
            onClick={handleNew}
            className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-sm hover:bg-slate-800 transition-colors h-[42px]"
          >
            <Plus className="w-4 h-4" />
            <span className="text-[13px] font-bold">Nova Campanha</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Investimento */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Investimento</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Banknote className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            R$ {(totalCost / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Leads */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Leads Gerados</span>
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {totalLeads}
          </div>
          <div className="text-xs font-medium text-slate-500 mt-1">
            Conv. média de {avgConversion.toFixed(1)}%
          </div>
        </div>

        {/* CPL */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Custo por Lead</span>
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            R$ {(avgCPL / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* CPA */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Custo por Aquisição</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <Target className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            R$ {(avgCPA / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs font-medium text-slate-500 mt-1">
            {totalEnrollments} matrículas no total
          </div>
        </div>
      </div>

      {/* Tabela de Campanhas */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">Histórico de Ações</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Campanha</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Investimento</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Leads</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Matrículas</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                    Carregando campanhas...
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                    Nenhuma campanha encontrada neste período.
                  </td>
                </tr>
              ) : campaigns.map(c => {
                const isAtiva = c.status === 'Ativa';
                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900">{c.name}</div>
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">{c.channel}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isAtiva ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-700">
                        R$ {((c.costCents || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-bold text-slate-700">{c.leadsCount}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-bold text-slate-700">{c.enrollmentsCount}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => handleEdit(c)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => c.id && handleDeleteClick(c.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <CampaignModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        campaign={editingCampaign}
        onSuccess={fetchCampaigns} 
      />

      <ConfirmModal
        isOpen={!!campaignToDelete}
        onClose={() => setCampaignToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir Campanha"
        description="Tem certeza que deseja excluir esta campanha? Todos os dados serão perdidos e não poderão ser recuperados."
      />
    </div>
  );
}
