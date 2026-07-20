'use client';

import React, { useEffect, useState } from 'react';
import { getCurrentProfile } from '@/server/actions/users';
import { UserPermissions } from '@/lib/firebase/auth-session';
import RestrictedAccess from '@/components/shared/RestrictedAccess';
import { 
  Handshake, 
  Plus, 
  Search, 
  Briefcase, 
  CalendarCheck, 
  Users, 
  TrendingUp, 
  Phone, 
  Edit3, 
  Trash2, 
  ExternalLink,
  X 
} from 'lucide-react';
import { TableSkeleton } from '@/components/shared/Skeleton';
import { Partnership, PartnershipStatus } from '@/lib/validation/partnership-schema';
import PartnershipForm from '@/components/convenios/PartnershipForm';
import { 
  getPartnerships, 
  createPartnership, 
  updatePartnership, 
  deletePartnership 
} from '@/server/actions/partnerships';
import { getColaboradoresDropdown } from '@/server/actions/users';

export default function ConveniosPage() {
  const [currentUser, setCurrentUser] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [responsibles, setResponsibles] = useState<{ uid: string; name: string }[]>([]);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartnership, setEditingPartnership] = useState<Partnership | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lista mock de responsáveis para modo de demonstração
  const DEMO_RESPONSIBLES = [
    { uid: 'eric', name: 'Eric Carvalho' },
    { uid: 'elen', name: 'Elen Sena' },
    { uid: 'nayara', name: 'Nayara Silva' },
    { uid: 'bia', name: 'Bia Costa' },
    { uid: 'ninha', name: 'Ninha Souza' }
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const profile = await getCurrentProfile();
        setCurrentUser(profile);

        const demo = typeof window !== 'undefined' && localStorage.getItem('cies_demo_mode') === 'true';
        setIsDemoMode(demo);

        if (demo) {
          const { demoGetPartnerships } = await import('@/lib/demo-store');
          setPartnerships(demoGetPartnerships());
          setResponsibles(DEMO_RESPONSIBLES);
        } else if (profile) {
          const [list, dropdownList] = await Promise.all([
            getPartnerships(),
            getColaboradoresDropdown()
          ]);
          setPartnerships(list);
          setResponsibles(dropdownList);
        }
      } catch (err) {
        console.error('Falha ao carregar dados:', err);
        setError('Ocorreu um erro ao carregar os convênios.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <div className="space-y-6"><TableSkeleton rows={6} columns={5} /></div>;
  }

  // Verifica se o usuário tem acesso (Comercial, Administrativo ou Gestão)
  const hasAccess = currentUser && (
    currentUser.areas.includes('comercial') || 
    currentUser.areas.includes('administrativo') || 
    currentUser.areas.includes('gestao')
  );

  if (!hasAccess) {
    const currentRole = currentUser ? currentUser.areas[0] || 'colaborador' : 'colaborador';
    return (
      <RestrictedAccess 
        allowedRoles={['comercial', 'administrativo', 'gestao']} 
        currentRole={currentRole} 
      />
    );
  }

  // Estatísticas calculadas
  const totalCount = partnerships.length;
  const activeCount = partnerships.filter(p => p.status === 'ativo').length;
  const totalVisits = partnerships.reduce((sum, p) => sum + (p.visitsCompleted || 0), 0);
  const totalLeads = partnerships.reduce((sum, p) => sum + (p.conversionStats?.leadsGenerated || 0), 0);
  const totalEnrollments = partnerships.reduce((sum, p) => sum + (p.conversionStats?.enrollmentsClosed || 0), 0);
  const conversionRate = totalLeads > 0 ? ((totalEnrollments / totalLeads) * 100).toFixed(1) : '0';

  // Lógica de Salvar (Criar ou Editar)
  const handleSave = async (data: Omit<Partnership, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsSaving(true);
    setError(null);
    try {
      if (isDemoMode) {
        const { demoCreatePartnership, demoUpdatePartnership } = await import('@/lib/demo-store');
        if (editingPartnership && editingPartnership.id) {
          const updated = demoUpdatePartnership(editingPartnership.id, data);
          setPartnerships(prev => prev.map(p => p.id === updated.id ? updated : p));
        } else {
          const created = demoCreatePartnership(data);
          setPartnerships(prev => [created, ...prev]);
        }
      } else {
        if (editingPartnership && editingPartnership.id) {
          await updatePartnership(editingPartnership.id, data);
          // Recarrega do banco para garantir integridade
          const list = await getPartnerships();
          setPartnerships(list);
        } else {
          await createPartnership(data);
          const list = await getPartnerships();
          setPartnerships(list);
        }
      }
      setIsModalOpen(false);
      setEditingPartnership(undefined);
    } catch (err) {
      console.error('Erro ao salvar convênio:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar convênio.');
    } finally {
      setIsSaving(false);
    }
  };

  // Lógica de Excluir
  const handleDelete = async (partnership: Partnership) => {
    if (!partnership.id) return;

    // Regra AGENTS.md 12.2: Ações destrutivas exigem confirmação visual.
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir permanentemente o convênio com a empresa "${partnership.companyName}"?\nEsta ação não poderá ser desfeita.`
    );
    if (!confirmDelete) return;

    try {
      if (isDemoMode) {
        const { demoDeletePartnership } = await import('@/lib/demo-store');
        demoDeletePartnership(partnership.id);
        setPartnerships(prev => prev.filter(p => p.id !== partnership.id));
      } else {
        await deletePartnership(partnership.id);
        setPartnerships(prev => prev.filter(p => p.id !== partnership.id));
      }
    } catch (err) {
      console.error('Erro ao excluir convênio:', err);
      alert(err instanceof Error ? err.message : 'Falha ao excluir convênio.');
    }
  };

  const openNewModal = () => {
    setEditingPartnership(undefined);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Partnership) => {
    setEditingPartnership(p);
    setError(null);
    setIsModalOpen(true);
  };

  // Filtros aplicados em tempo de renderização
  const filteredPartnerships = partnerships.filter(p => {
    const matchesSearch = p.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.contactName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusLabel = (status: PartnershipStatus) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'em_negociacao': return 'Em Negociação';
      case 'inativo': return 'Inativo';
      default: return status;
    }
  };

  const getStatusColorClass = (status: PartnershipStatus) => {
    switch (status) {
      case 'ativo': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'em_negociacao': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'inativo': return 'bg-slate-400/10 text-slate-500 border-slate-400/20';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getResponsibleName = (id: string) => {
    const resp = responsibles.find(r => r.uid === id);
    return resp ? resp.name : 'Responsável não encontrado';
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20">
              <Handshake className="w-6 h-6 text-primary" />
            </div>
            Gestão de Convênios
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Gerencie convênios de empresas, parcerias locais e acompanhamento de visitas comerciais do polo CIES.
          </p>
        </div>
        
        {/* Permite adicionar apenas se for Gestão ou Comercial */}
        <button
          onClick={openNewModal}
          className="bg-primary text-primary-foreground hover:bg-primary/95 px-5 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <Plus className="w-4 h-4" />
          Novo Convênio
        </button>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="bg-slate-500/10 p-4 rounded-xl border border-slate-500/15">
            <Briefcase className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Total</span>
            <span className="text-2xl font-black text-slate-800">{totalCount}</span>
          </div>
        </div>

        {/* Card 2: Ativos */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/15">
            <Handshake className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Parcerias Ativas</span>
            <span className="text-2xl font-black text-emerald-600">{activeCount}</span>
          </div>
        </div>

        {/* Card 3: Visitas */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/15">
            <CalendarCheck className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Visitas Comerciais</span>
            <span className="text-2xl font-black text-indigo-600">{totalVisits}</span>
          </div>
        </div>

        {/* Card 4: Conversão */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/15">
            <TrendingUp className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Conversão</span>
            <span className="text-2xl font-black text-amber-600">{totalEnrollments} <span className="text-xs text-muted-foreground font-normal">/ {totalLeads} L ({conversionRate}%)</span></span>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center bg-card p-4 rounded-2xl border border-border shadow-sm">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por empresa ou contato..."
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background transition-colors"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:block mr-1">Filtrar:</span>
          {['todos', 'ativo', 'em_negociacao', 'inativo'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                statusFilter === status
                  ? 'bg-slate-900 text-white border-slate-950 shadow-sm'
                  : 'bg-white text-slate-600 border-border hover:bg-slate-50'
              }`}
            >
              {status === 'todos' ? 'Todos' : getStatusLabel(status as PartnershipStatus)}
            </button>
          ))}
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl flex items-center shadow-sm">
          <span>{error}</span>
        </div>
      )}

      {/* CONVÊNIOS TABLE LIST */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {filteredPartnerships.length === 0 ? (
          <div className="p-16 text-center">
            <Handshake className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">Nenhum convênio encontrado</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Ajuste seus filtros de busca ou crie um novo convênio usando o botão acima.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50 text-slate-500 font-bold">
                  <th className="py-4 px-6">Empresa / Parceiro</th>
                  <th className="py-4 px-6">Contato</th>
                  <th className="py-4 px-6">Responsável CIES</th>
                  <th className="py-4 px-6 text-center">Visitas</th>
                  <th className="py-4 px-6 text-center">Leads / Matrículas</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPartnerships.map((p) => {
                  const pLeads = p.conversionStats?.leadsGenerated || 0;
                  const pEnrollments = p.conversionStats?.enrollmentsClosed || 0;
                  const pConvRate = pLeads > 0 ? ((pEnrollments / pLeads) * 100).toFixed(0) : '0';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                      {/* Empresa */}
                      <td className="py-4 px-6">
                        <span className="font-extrabold text-slate-900 block">{p.companyName}</span>
                      </td>

                      {/* Contato */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <span className="font-medium text-slate-700 block">{p.contactName}</span>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{p.contactPhone}</span>
                            <a
                              href={`https://wa.me/55${p.contactPhone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center ml-1"
                            >
                              Conversar <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Responsável CIES */}
                      <td className="py-4 px-6 font-medium text-slate-600">
                        {getResponsibleName(p.ciesResponsibleId)}
                      </td>

                      {/* Visitas */}
                      <td className="py-4 px-6 text-center font-bold text-slate-800">
                        {p.visitsCompleted || 0}
                      </td>

                      {/* Conversão */}
                      <td className="py-4 px-6 text-center">
                        <div className="inline-block text-left">
                          <span className="font-bold text-slate-900 block text-center">{pEnrollments} / {pLeads}</span>
                          <span className="text-[10px] font-semibold text-slate-400 block text-center uppercase tracking-wider">Taxa: {pConvRate}%</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColorClass(p.status)}`}>
                          {getStatusLabel(p.status)}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(p)}
                            title="Editar convênio"
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200/60 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          
                          {/* Excluir (Disponível apenas para cargo de Gestão) */}
                          {(currentUser?.areas.includes('gestao') || isDemoMode) && (
                            <button
                              onClick={() => handleDelete(p)}
                              title="Excluir convênio"
                              className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FORM MODAL (ADD & EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-border rounded-2xl shadow-xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-primary" />
                  {editingPartnership ? 'Editar Convênio' : 'Novo Convênio'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {editingPartnership ? 'Atualize as informações cadastrais e estatísticas' : 'Preencha os campos abaixo para cadastrar a nova parceria'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[75vh]">
              <PartnershipForm
                initialData={editingPartnership}
                responsibles={responsibles}
                onSubmit={handleSave}
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
