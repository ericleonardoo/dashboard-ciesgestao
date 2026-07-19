'use client';

import React, { useEffect, useState } from 'react';
import { getCurrentProfile } from '@/server/actions/users';
import { UserPermissions } from '@/lib/firebase/auth-session';
import RestrictedAccess from '@/components/shared/RestrictedAccess';
import { UserPlus, LayoutGrid, List, Plus, Search } from 'lucide-react';
import { TableSkeleton } from '@/components/shared/Skeleton';
import { Lead, LeadStatus } from '@/lib/validation/lead-schema';

import LeadKanban from '@/components/leads/LeadKanban';
import LeadTable from '@/components/leads/LeadTable';
import LeadForm from '@/components/leads/LeadForm';

type ViewMode = 'kanban' | 'table';

export default function LeadsPage() {
  const [currentUser, setCurrentUser] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // 1. Carrega o usuário
    getCurrentProfile().then(user => {
      setCurrentUser(user);
      
      // 2. Se for demonstração, carrega leads falsos do LocalStorage
      const isDemo = localStorage.getItem('cies_demo_mode') === 'true';
      if (isDemo) {
        import('@/lib/demo-store').then(({ demoGetLeads }) => {
          setLeads(demoGetLeads());
          setLoading(false);
        });
      } else {
        // Futuro: getLeads() real do firebase via Server Action
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <TableSkeleton />
      </div>
    );
  }

  if (!currentUser || (!currentUser.areas.includes('comercial') && !currentUser.areas.includes('marketing') && !currentUser.areas.includes('relacionamento') && !currentUser.areas.includes('gestao'))) {
    return <RestrictedAccess title="Acesso Restrito: Comercial" message="Área exclusiva para Comercial e Marketing." />;
  }

  // Lógicas do CRUD
  const handleSaveLead = async (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsSaving(true);
    const isDemo = localStorage.getItem('cies_demo_mode') === 'true';
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
        // Futuro: createLead / updateLead real
      }
      setIsModalOpen(false);
      setEditingLead(undefined);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar lead.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    const isDemo = localStorage.getItem('cies_demo_mode') === 'true';
    if (isDemo) {
      const { demoUpdateLead } = await import('@/lib/demo-store');
      const updated = demoUpdateLead(leadId, { status: newStatus });
      setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
    }
  };

  const openNewModal = () => {
    setEditingLead(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  // Filtros
  const filteredLeads = leads.filter(l => {
    const q = searchQuery.toLowerCase();
    return l.name.toLowerCase().includes(q) || 
           l.phone.includes(q) || 
           (l.cpf && l.cpf.includes(q));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-primary" />
            Leads Comerciais
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie contatos, pipelines e novos alunos interessados.
          </p>
        </div>
        <button 
          onClick={openNewModal}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Lead
        </button>
      </div>

      {/* Controles de Visão e Busca */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-card p-3 rounded-xl border border-border shadow-sm">
        <div className="flex bg-secondary/50 p-1 rounded-lg">
          <button 
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'kanban' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <LayoutGrid className="w-4 h-4" />
            Funil
          </button>
          <button 
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'table' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <List className="w-4 h-4" />
            Tabela
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Buscar lead..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-border rounded-lg leading-5 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 sm:text-sm transition-all"
          />
        </div>
      </div>

      {/* Conteúdo Dinâmico */}
      {viewMode === 'kanban' ? (
        <LeadKanban 
          leads={filteredLeads} 
          onEdit={openEditModal} 
          onStatusChange={handleStatusChange} 
        />
      ) : (
        <LeadTable 
          leads={filteredLeads} 
          onEdit={openEditModal} 
          onStatusChange={handleStatusChange} 
        />
      )}

      {/* Modal / Slide-over */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-[500px] h-auto max-h-[90vh] bg-background rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border bg-secondary/30">
              <h2 className="text-xl font-bold text-foreground">
                {editingLead ? 'Editar Lead' : 'Adicionar Novo Lead'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Preencha os dados do contato para acompanhar no funil.
              </p>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <LeadForm 
                initialData={editingLead} 
                onSubmit={handleSaveLead} 
                onCancel={() => setIsModalOpen(false)}
                isLoading={isSaving}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
