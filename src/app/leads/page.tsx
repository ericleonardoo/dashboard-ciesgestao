'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getCurrentProfile } from '@/server/actions/users';
import { UserPermissions } from '@/lib/firebase/auth-session';
import RestrictedAccess from '@/components/shared/RestrictedAccess';
import { UserPlus, LayoutGrid, List, Plus, Search, AlertCircle } from 'lucide-react';
import { TableSkeleton } from '@/components/shared/Skeleton';
import { Lead, LeadStatus, isFollowUpOverdue, LEAD_SOURCES, LEAD_STATUS_LABELS } from '@/lib/validation/lead-schema';
import FilterSelect from '@/components/shared/FilterSelect';

import LeadKanban from '@/components/leads/LeadKanban';
import LeadTable from '@/components/leads/LeadTable';
import LeadForm from '@/components/leads/LeadForm';

import { getLeads, createLead, updateLead } from '@/server/actions/leads';
import { getColaboradoresDropdown } from '@/server/actions/users';

type ViewMode = 'kanban' | 'table';

export default function LeadsPage() {
  const [currentUser, setCurrentUser] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [collaborators, setCollaborators] = useState<{ uid: string; name: string }[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  
  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [sourceFilter, setSourceFilter] = useState<string>('todos');
  const [ownerFilter, setOwnerFilter] = useState<string>('todos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchLeadsData = useCallback(async () => {
    setLoading(true);
    const isDemo = typeof window !== 'undefined' && localStorage.getItem('cies_demo_mode') === 'true';

    try {
      if (isDemo) {
        const { demoGetLeads } = await import('@/lib/demo-store');
        let demoData = demoGetLeads();

        if (statusFilter !== 'todos') {
          demoData = demoData.filter(l => l.status === statusFilter);
        }
        if (sourceFilter !== 'todos') {
          demoData = demoData.filter(l => l.source === sourceFilter);
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          demoData = demoData.filter(l => l.name.toLowerCase().includes(q) || l.phone.includes(q));
        }

        setLeads(demoData);
        setCollaborators([
          { uid: 'eric', name: 'Eric Carvalho' },
          { uid: 'elen', name: 'Elen Sena' },
          { uid: 'nayara', name: 'Nayara Silva' },
          { uid: 'bia', name: 'Bia Costa' },
          { uid: 'ninha', name: 'Ninha Souza' }
        ]);
      } else {
        const [realLeads, realCollabs] = await Promise.all([
          getLeads({
            status: statusFilter,
            source: sourceFilter,
            ownerId: ownerFilter,
            search: searchQuery,
          }),
          getColaboradoresDropdown()
        ]);
        setLeads(realLeads);
        setCollaborators(realCollabs);
      }
    } catch (err) {
      console.error('Falha ao carregar leads:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sourceFilter, ownerFilter, searchQuery]);

  useEffect(() => {
    async function init() {
      try {
        const user = await getCurrentProfile();
        setCurrentUser(user);
        await fetchLeadsData();
      } catch (err) {
        console.error('Falha na inicialização da página de leads:', err);
      }
    }
    init();
  }, [fetchLeadsData]);

  if (loading && leads.length === 0) {
    return (
      <div className="space-y-6">
        <TableSkeleton rows={6} columns={6} />
      </div>
    );
  }

  if (!currentUser || (!currentUser.areas.includes('comercial') && !currentUser.areas.includes('marketing') && !currentUser.areas.includes('relacionamento') && !currentUser.areas.includes('gestao'))) {
    return <RestrictedAccess title="Acesso Restrito: Leads B2C" message="Área exclusiva para equipe Comercial, Marketing e Gestão." />;
  }

  const handleSaveLead = async (data: Lead) => {
    setIsSaving(true);
    const isDemo = typeof window !== 'undefined' && localStorage.getItem('cies_demo_mode') === 'true';

    try {
      if (isDemo) {
        const { demoCreateLead, demoUpdateLead } = await import('@/lib/demo-store');
        if (editingLead && editingLead.id) {
          const updated = demoUpdateLead(editingLead.id, data);
          setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
        } else {
          const created = demoCreateLead(data);
          setLeads(prev => [created, ...prev]);
        }
      } else {
        if (editingLead && editingLead.id) {
          const res = await updateLead(editingLead.id, data);
          if (!res.success) throw new Error(res.error);
        } else {
          const res = await createLead(data);
          if (!res.success) throw new Error(res.error);
        }
        await fetchLeadsData();
      }
      setIsModalOpen(false);
      setEditingLead(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar lead.';
      alert(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    const isDemo = typeof window !== 'undefined' && localStorage.getItem('cies_demo_mode') === 'true';

    try {
      if (isDemo) {
        const { demoUpdateLead } = await import('@/lib/demo-store');
        const updated = demoUpdateLead(leadId, { status: newStatus });
        setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
      } else {
        const res = await updateLead(leadId, { status: newStatus });
        if (!res.success) alert(res.error);
        await fetchLeadsData();
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  const overdueCount = leads.filter(isFollowUpOverdue).length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center">
            <UserPlus className="w-8 h-8 mr-3 text-primary" />
            Leads B2C
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Acompanhe o funil de atendimento e vendas diretas a futuros alunos.
          </p>
        </div>

        <button 
          onClick={() => { setEditingLead(null); setIsModalOpen(true); }}
          className="bg-primary text-white hover:bg-primary/90 px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center space-x-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Lead</span>
        </button>
      </div>

      {/* Alerta de Follow-ups Vencidos */}
      {overdueCount > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span className="text-sm font-bold">
              {overdueCount} {overdueCount === 1 ? 'lead necessita' : 'leads necessitam'} de follow-up com prazo de contato vencido!
            </span>
          </div>
        </div>
      )}

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3 w-full lg:w-auto">
          {/* Alternador de Visão */}
          <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
            <button 
              onClick={() => setViewMode('kanban')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Funil</span>
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabela</span>
            </button>
          </div>

          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'todos', label: 'Estágio: Todos' },
              ...(Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map(key => ({
                value: key,
                label: LEAD_STATUS_LABELS[key].label
              }))
            ]}
          />

          <FilterSelect
            value={sourceFilter}
            onChange={setSourceFilter}
            options={[
              { value: 'todos', label: 'Origem: Todas' },
              ...LEAD_SOURCES.map(src => ({ value: src, label: src }))
            ]}
          />

          <FilterSelect
            value={ownerFilter}
            onChange={setOwnerFilter}
            options={[
              { value: 'todos', label: 'Consultor: Todos' },
              ...collaborators.map(c => ({ value: c.uid, label: c.name }))
            ]}
          />
        </div>

        {/* Busca por nome / telefone */}
        <div className="relative w-full lg:w-72">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar nome ou telefone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Conteúdo Dinâmico */}
      {viewMode === 'kanban' ? (
        <LeadKanban 
          leads={leads} 
          onEdit={(lead) => { setEditingLead(lead); setIsModalOpen(true); }} 
          onStatusChange={handleStatusChange} 
        />
      ) : (
        <LeadTable 
          leads={leads} 
          onEdit={(lead) => { setEditingLead(lead); setIsModalOpen(true); }} 
          onStatusChange={handleStatusChange} 
        />
      )}

      {/* Modal LeadForm */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingLead ? 'Editar Lead' : 'Novo Lead B2C'}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Preencha as informações do contato para acompanhamento comercial.
                </p>
              </div>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <LeadForm 
                initialData={editingLead}
                collaborators={collaborators}
                currentUserId={currentUser.uid}
                onSubmit={handleSaveLead} 
                onCancel={() => { setIsModalOpen(false); setEditingLead(null); }}
                isLoading={isSaving}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
