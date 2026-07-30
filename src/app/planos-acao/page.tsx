'use client';

import React, { useEffect, useState } from 'react';
import { getCurrentProfile } from '@/server/actions/users';
import { UserPermissions } from '@/lib/firebase/auth-session';
import RestrictedAccess from '@/components/shared/RestrictedAccess';
import { 
  ListTodo, 
  Plus, 
  Search, 
  HelpCircle, 
  Play, 
  CheckCircle2, 
  MapPin,
  User,
  Calendar,
  DollarSign,
  Edit3,
  Trash2,
  X
} from 'lucide-react';
import { TableSkeleton } from '@/components/shared/Skeleton';
import { ActionPlan, ActionPlanStatus } from '@/lib/validation/action-plan-schema';
import ActionPlanForm from '@/components/planos-acao/ActionPlanForm';
import { 
  getActionPlans, 
  createActionPlan, 
  updateActionPlan, 
  deleteActionPlan,
  updateActionPlanStatus
} from '@/server/actions/action-plans';

export default function PlanosAcaoPage() {
  const [currentUser, setCurrentUser] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const [plans, setPlans] = useState<ActionPlan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ActionPlan | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const profile = await getCurrentProfile();
        setCurrentUser(profile);

        const demo = typeof window !== 'undefined' && localStorage.getItem('cies_demo_mode') === 'true';
        setIsDemoMode(demo);

        if (demo) {
          const { demoGetActionPlans } = await import('@/lib/demo-store');
          setPlans(demoGetActionPlans());
        } else if (profile) {
          const list = await getActionPlans();
          setPlans(list);
        }
      } catch (err) {
        console.error('Falha ao carregar planos de ação:', err);
        setError('Ocorreu um erro ao carregar os planos de ação.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <div className="space-y-6"><TableSkeleton rows={4} columns={4} /></div>;
  }

  // Verifica se o usuário tem acesso (Qualquer colaborador ativo logado tem acesso conforme permissions.ts)
  const hasAccess = currentUser && (
    currentUser.areas.includes('comercial') || 
    currentUser.areas.includes('administrativo') || 
    currentUser.areas.includes('marketing') ||
    currentUser.areas.includes('relacionamento') ||
    currentUser.areas.includes('gestao')
  );

  if (!hasAccess) {
    const currentRole = currentUser ? currentUser.areas[0] || 'colaborador' : 'colaborador';
    return (
      <RestrictedAccess 
        allowedRoles={['comercial', 'administrativo', 'marketing', 'relacionamento', 'gestao']} 
        currentRole={currentRole} 
      />
    );
  }

  // Estatísticas do painel
  const totalCount = plans.length;
  const inProgressCount = plans.filter(p => p.status === 'em_andamento').length;
  const completedCount = plans.filter(p => p.status === 'concluido').length;
  const totalBudgetCents = plans.reduce((sum, p) => sum + (p.howMuchCents || 0), 0);

  const formatMoney = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  };

  // Salvar plano
  const handleSave = async (data: Omit<ActionPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsSaving(true);
    setError(null);
    try {
      if (isDemoMode) {
        const { demoCreateActionPlan, demoUpdateActionPlan } = await import('@/lib/demo-store');
        if (editingPlan && editingPlan.id) {
          const updated = demoUpdateActionPlan(editingPlan.id, data);
          setPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
        } else {
          const created = demoCreateActionPlan(data);
          setPlans(prev => [created, ...prev]);
        }
      } else {
        if (editingPlan && editingPlan.id) {
          await updateActionPlan(editingPlan.id, data);
          const list = await getActionPlans();
          setPlans(list);
        } else {
          await createActionPlan(data);
          const list = await getActionPlans();
          setPlans(list);
        }
      }
      setIsModalOpen(false);
      setEditingPlan(undefined);
    } catch (err) {
      console.error('Erro ao salvar plano de ação:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar plano de ação.');
    } finally {
      setIsSaving(false);
    }
  };

  // Atualizar status rapidamente
  const handleStatusChange = async (planId: string, newStatus: ActionPlanStatus) => {
    try {
      if (isDemoMode) {
        const { demoUpdateActionPlan } = await import('@/lib/demo-store');
        const updated = demoUpdateActionPlan(planId, { status: newStatus });
        setPlans(prev => prev.map(p => p.id === planId ? updated : p));
      } else {
        await updateActionPlanStatus(planId, newStatus);
        setPlans(prev => prev.map(p => p.id === planId ? { ...p, status: newStatus } : p));
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert('Falha ao atualizar status do plano.');
    }
  };

  // Excluir plano
  const handleDelete = async (plan: ActionPlan) => {
    if (!plan.id) return;

    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir o plano de ação "${plan.what}"?\nEsta ação não poderá ser desfeita.`
    );
    if (!confirmDelete) return;

    try {
      if (isDemoMode) {
        const { demoDeleteActionPlan } = await import('@/lib/demo-store');
        demoDeleteActionPlan(plan.id);
        setPlans(prev => prev.filter(p => p.id !== plan.id));
      } else {
        await deleteActionPlan(plan.id);
        setPlans(prev => prev.filter(p => p.id !== plan.id));
      }
    } catch (err) {
      console.error('Erro ao excluir plano de ação:', err);
      alert('Falha ao excluir plano de ação.');
    }
  };

  const openNewModal = () => {
    setEditingPlan(undefined);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: ActionPlan) => {
    setEditingPlan(p);
    setError(null);
    setIsModalOpen(true);
  };

  // Filtros aplicados em tempo de renderização
  const filteredPlans = plans.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = p.what.toLowerCase().includes(q) ||
                          p.why.toLowerCase().includes(q) ||
                          p.who.toLowerCase().includes(q) ||
                          p.how.toLowerCase().includes(q) ||
                          p.where.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'todos' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusLabel = (status: ActionPlanStatus) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'em_andamento': return 'Em Andamento';
      case 'concluido': return 'Concluído';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusColorClass = (status: ActionPlanStatus) => {
    switch (status) {
      case 'concluido': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'em_andamento': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'pendente': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'cancelado': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20">
              <ListTodo className="w-6 h-6 text-primary" />
            </div>
            Planos de Ação (5W2H)
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Mapeamento estratégico de metas e soluções usando a metodologia 5W2H (O que, Por que, Onde, Quando, Quem, Como, Quanto).
          </p>
        </div>
        
        <button
          onClick={openNewModal}
          className="bg-primary text-primary-foreground hover:bg-primary/95 px-5 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/20 animate-pulse-slow"
        >
          <Plus className="w-4 h-4" />
          Novo Plano 5W2H
        </button>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="bg-slate-500/10 p-4 rounded-xl border border-slate-500/15">
            <ListTodo className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Total de Planos</span>
            <span className="text-2xl font-black text-slate-800">{totalCount}</span>
          </div>
        </div>

        {/* Em Andamento */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/15">
            <Play className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Em Andamento</span>
            <span className="text-2xl font-black text-blue-600">{inProgressCount}</span>
          </div>
        </div>

        {/* Concluídos */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/15">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Concluídos</span>
            <span className="text-2xl font-black text-emerald-600">{completedCount}</span>
          </div>
        </div>

        {/* Orçamento Total */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/15">
            <DollarSign className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Orçamento Geral</span>
            <span className="text-2xl font-black text-indigo-600">{formatMoney(totalBudgetCents)}</span>
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
            placeholder="Buscar por objetivo, responsável, método..."
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background transition-colors"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:block mr-1">Filtrar:</span>
          {['todos', 'pendente', 'em_andamento', 'concluido', 'cancelado'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                statusFilter === status
                  ? 'bg-slate-900 text-white border-slate-950 shadow-sm'
                  : 'bg-white text-slate-600 border-border hover:bg-slate-50'
              }`}
            >
              {status === 'todos' ? 'Todos' : getStatusLabel(status as ActionPlanStatus)}
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

      {/* 5W2H CARDS GRID */}
      {filteredPlans.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl shadow-sm p-16 text-center">
          <ListTodo className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">Nenhum plano de ação encontrado</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Não há planos correspondentes aos filtros selecionados. Crie um novo plano usando o botão acima.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredPlans.map((p) => (
            <div 
              key={p.id} 
              className="bg-card border border-border rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between p-6 border-b border-border bg-slate-50/50">
                  <div className="space-y-1 pr-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">WHAT (O QUÊ)</span>
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                      {p.what}
                    </h3>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${getStatusColorClass(p.status)}`}>
                    {getStatusLabel(p.status)}
                  </span>
                </div>

                {/* Card Body: 5W2H Parameters */}
                <div className="p-6 space-y-4">
                  {/* WHY (Por quê) */}
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">WHY (POR QUÊ?)</span>
                    <p className="text-sm text-slate-700 font-medium mt-0.5">{p.why}</p>
                  </div>

                  {/* HOW (Como) */}
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">HOW (COMO?)</span>
                    <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 p-2.5 rounded-lg font-medium mt-0.5">{p.how}</p>
                  </div>

                  {/* Operational parameters grid (WHO, WHEN, WHERE, HOW MUCH) */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 border-t border-border pt-4 text-xs">
                    {/* WHO (Quem) */}
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-100 p-1.5 rounded-lg">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">WHO (QUEM)</span>
                        <span className="font-extrabold text-slate-800">{p.who}</span>
                      </div>
                    </div>

                    {/* WHEN (Quando) */}
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-100 p-1.5 rounded-lg">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">WHEN (QUANDO)</span>
                        <span className="font-extrabold text-slate-800">{p.when}</span>
                      </div>
                    </div>

                    {/* WHERE (Onde) */}
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-100 p-1.5 rounded-lg">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">WHERE (ONDE)</span>
                        <span className="font-extrabold text-slate-800 truncate block max-w-[150px]">{p.where}</span>
                      </div>
                    </div>

                    {/* HOW MUCH (Quanto custa) */}
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-100 p-1.5 rounded-lg">
                        <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">HOW MUCH (QUANTO)</span>
                        <span className="font-extrabold text-slate-800">{formatMoney(p.howMuchCents || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer: Actions */}
              <div className="px-6 py-4 border-t border-border bg-slate-50/30 flex items-center justify-between">
                {/* KPI associated indicator */}
                <div className="text-xs text-slate-500 font-medium">
                  {p.kpiAssociated && (
                    <span className="inline-flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      KPI: <span className="font-bold text-slate-700">{p.kpiAssociated}</span>
                    </span>
                  )}
                </div>

                {/* Edit status & controls */}
                <div className="flex items-center gap-3">
                  {/* Status Quick Switch Selector */}
                  <select
                    value={p.status}
                    onChange={(e) => handleStatusChange(p.id!, e.target.value as ActionPlanStatus)}
                    className="bg-white border border-slate-200 text-xs font-bold rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/45 cursor-pointer text-slate-700"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </select>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(p)}
                      title="Editar plano completo"
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      title="Excluir plano"
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FORM MODAL (ADD & EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-border rounded-2xl shadow-xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-primary" />
                  {editingPlan ? 'Editar Plano 5W2H' : 'Novo Plano 5W2H'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {editingPlan ? 'Atualize as metas, responsabilidades ou estimativa de custo' : 'Mapeie o objetivo estruturando as 7 perguntas fundamentais'}
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
              <ActionPlanForm
                initialData={editingPlan}
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
