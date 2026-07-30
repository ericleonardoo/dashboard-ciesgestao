'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getCurrentProfile } from '@/server/actions/users';
import { UserPermissions } from '@/lib/firebase/auth-session';
import RestrictedAccess from '@/components/shared/RestrictedAccess';
import { 
  Handshake, 
  Plus, 
  Search, 
  Briefcase, 
  CalendarCheck, 
  TrendingUp, 
  Phone, 
  Edit3, 
  Trash2, 
  ExternalLink,
  X,
  Building2,
  CheckCircle2,
  Calendar,
  LayoutGrid,
  List
} from 'lucide-react';
import { TableSkeleton } from '@/components/shared/Skeleton';
import { Partnership, B2BStatus, B2B_STATUS_LABELS, B2B_SEGMENTS } from '@/lib/validation/partnership-schema';
import PartnershipForm from '@/components/convenios/PartnershipForm';
import FilterSelect from '@/components/shared/FilterSelect';
import { 
  getPartnerships, 
  createPartnership, 
  updatePartnership, 
  deletePartnership 
} from '@/server/actions/partnerships';
import { getColaboradoresDropdown } from '@/server/actions/users';

const DEMO_RESPONSIBLES = [
  { uid: 'eric', name: 'Eric Carvalho' },
  { uid: 'elen', name: 'Elen Sena' },
  { uid: 'nayara', name: 'Nayara Silva' },
  { uid: 'bia', name: 'Bia Costa' },
  { uid: 'ninha', name: 'Ninha Souza' }
];

export default function ConveniosPage() {
  const [currentUser, setCurrentUser] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [responsibles, setResponsibles] = useState<{ uid: string; name: string }[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [segmentFilter, setSegmentFilter] = useState<string>('todos');
  const [ownerFilter, setOwnerFilter] = useState<string>('todos');

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartnership, setEditingPartnership] = useState<Partnership | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPartnershipsData = useCallback(async () => {
    setLoading(true);
    const demo = typeof window !== 'undefined' && localStorage.getItem('cies_demo_mode') === 'true';
    setIsDemoMode(demo);

    try {
      if (demo) {
        const { demoGetPartnerships } = await import('@/lib/demo-store');
        let data = demoGetPartnerships();
        if (statusFilter !== 'todos') {
          data = data.filter(p => p.status === statusFilter);
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          data = data.filter(p => p.companyName.toLowerCase().includes(q) || p.contactName.toLowerCase().includes(q));
        }
        setPartnerships(data);
        setResponsibles(DEMO_RESPONSIBLES);
      } else {
        const [list, dropdownList] = await Promise.all([
          getPartnerships({
            status: statusFilter,
            segment: segmentFilter,
            ownerId: ownerFilter,
            search: searchQuery,
          }),
          getColaboradoresDropdown()
        ]);
        setPartnerships(list);
        setResponsibles(dropdownList);
      }
    } catch (err) {
      console.error('Falha ao carregar dados B2B:', err);
      setError('Ocorreu um erro ao carregar os convênios.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, segmentFilter, ownerFilter, searchQuery]);

  useEffect(() => {
    async function init() {
      try {
        const profile = await getCurrentProfile();
        setCurrentUser(profile);
        await fetchPartnershipsData();
      } catch (err) {
        console.error('Erro de inicialização:', err);
      }
    }
    init();
  }, [fetchPartnershipsData]);

  if (loading && partnerships.length === 0) {
    return <div className="space-y-6"><TableSkeleton rows={6} columns={5} /></div>;
  }

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
  const activeCount = partnerships.filter(p => p.status === 'PARTNERSHIP_ACTIVE' || p.status === 'PARTNERSHIP_APPROVED').length;
  const totalVisits = partnerships.reduce((sum, p) => sum + (p.visitsCompleted || 0), 0);
  const totalLeads = partnerships.reduce((sum, p) => sum + (p.conversionStats?.leadsGenerated || 0), 0);
  const totalEnrollments = partnerships.reduce((sum, p) => sum + (p.conversionStats?.enrollmentsClosed || 0), 0);
  const conversionRate = totalLeads > 0 ? ((totalEnrollments / totalLeads) * 100).toFixed(1) : '0';

  const handleSave = async (data: Partnership) => {
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
          const res = await updatePartnership(editingPartnership.id, data);
          if (!res.success) throw new Error(res.error);
        } else {
          const res = await createPartnership(data);
          if (!res.success) throw new Error(res.error);
        }
        await fetchPartnershipsData();
      }
      setIsModalOpen(false);
      setEditingPartnership(null);
    } catch (err) {
      console.error('Erro ao salvar convênio:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar convênio.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (partnership: Partnership) => {
    if (!partnership.id) return;

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
        const res = await deletePartnership(partnership.id);
        if (!res.success) throw new Error(res.error);
        setPartnerships(prev => prev.filter(p => p.id !== partnership.id));
      }
    } catch (err) {
      console.error('Erro ao excluir convênio:', err);
      alert(err instanceof Error ? err.message : 'Falha ao excluir convênio.');
    }
  };

  const openNewModal = () => {
    setEditingPartnership(null);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Partnership) => {
    setEditingPartnership(p);
    setError(null);
    setIsModalOpen(true);
  };

  const getResponsibleName = (id: string) => {
    const resp = responsibles.find(r => r.uid === id);
    return resp ? resp.name : id || 'Não atribuído';
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
            Empresas & Convênios B2B
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            Prospecção corporativa, acompanhamento de decisores e parcerias empresariais.
          </p>
        </div>
        
        <button
          onClick={openNewModal}
          className="bg-primary text-white hover:bg-primary/95 px-5 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-md hover:shadow-lg focus:outline-none"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Empresa B2B</span>
        </button>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
            <Briefcase className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Prospectadas</span>
            <span className="text-2xl font-black text-slate-900">{totalCount}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
            <Handshake className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Parcerias Ativas</span>
            <span className="text-2xl font-black text-emerald-600">{activeCount}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
            <CalendarCheck className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Visitas Realizadas</span>
            <span className="text-2xl font-black text-indigo-600">{totalVisits}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
            <TrendingUp className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Matrículas B2B</span>
            <span className="text-2xl font-black text-amber-600">{totalEnrollments} <span className="text-xs text-slate-400 font-medium">({conversionRate}%)</span></span>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3 w-full lg:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
            <button 
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabela</span>
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Funil B2B</span>
            </button>
          </div>

          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'todos', label: 'Estágio: Todos' },
              ...(Object.keys(B2B_STATUS_LABELS) as B2BStatus[]).map(key => ({
                value: key,
                label: B2B_STATUS_LABELS[key].label
              }))
            ]}
          />

          <FilterSelect
            value={segmentFilter}
            onChange={setSegmentFilter}
            options={[
              { value: 'todos', label: 'Segmento: Todos' },
              ...B2B_SEGMENTS.map(seg => ({ value: seg, label: seg }))
            ]}
          />

          <FilterSelect
            value={ownerFilter}
            onChange={setOwnerFilter}
            options={[
              { value: 'todos', label: 'Consultor: Todos' },
              ...responsibles.map(r => ({ value: r.uid, label: r.name }))
            ]}
          />
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por empresa, CNPJ ou contato..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition-all"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center">
          <span>{error}</span>
        </div>
      )}

      {/* TABELA DE EMPRESAS */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {partnerships.length === 0 ? (
          <div className="p-16 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">Nenhuma empresa encontrada</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Ajuste seus filtros de busca ou cadastre uma nova empresa B2B.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-4 px-6">Empresa / Segmento</th>
                  <th className="py-4 px-6">Contato / Cargo</th>
                  <th className="py-4 px-6">Consultor Responsável</th>
                  <th className="py-4 px-6 text-center">Próximo Passo / Reunião</th>
                  <th className="py-4 px-6 text-center">Matrículas Geradas</th>
                  <th className="py-4 px-6 text-center">Estágio B2B</th>
                  <th className="py-4 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {partnerships.map((p) => {
                  const pLeads = p.conversionStats?.leadsGenerated || 0;
                  const pEnrollments = p.conversionStats?.enrollmentsClosed || 0;
                  const statusInfo = B2B_STATUS_LABELS[p.status] || { label: p.status, color: 'bg-slate-100 text-slate-700' };

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-slate-900">{p.companyName}</div>
                        <div className="text-xs text-slate-400 font-medium">{p.segment} • {p.city}</div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-slate-800">{p.contactName}</span>
                          {p.deciderIdentified && (
                            <span title="Decisor Confirmado">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 inline-block" />
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
                          <span>{p.contactRole}</span>
                          {p.contactPhone && (
                            <a
                              href={`https://wa.me/55${p.contactPhone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:underline flex items-center"
                            >
                              <Phone className="w-3 h-3 mr-0.5" /> WhatsApp <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6 font-semibold text-slate-700 text-xs">
                        {p.ownerName || getResponsibleName(p.ownerId)}
                      </td>

                      <td className="py-4 px-6 text-center text-xs font-medium">
                        {p.meetingDate ? (
                          <div className="flex items-center justify-center space-x-1 text-indigo-600 font-bold">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(p.meetingDate).toLocaleDateString('pt-BR')}</span>
                          </div>
                        ) : p.nextStepAt ? (
                          <span className="text-slate-600">{new Date(p.nextStepAt).toLocaleDateString('pt-BR')}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span className="font-bold text-slate-900">{pEnrollments}</span>
                        <span className="text-xs text-slate-400 ml-1">({pLeads} leads)</span>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(p)}
                            title="Editar empresa"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {(currentUser?.areas.includes('gestao') || isDemoMode) && (
                            <button
                              onClick={() => handleDelete(p)}
                              title="Excluir empresa"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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

      {/* MODAL EDIT / NEW */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  {editingPartnership ? 'Editar Empresa B2B' : 'Cadastrar Nova Empresa B2B'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Informações de contato corporativo e estagio no funil comercial.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[80vh]">
              <PartnershipForm
                initialData={editingPartnership}
                responsibles={responsibles}
                currentUserId={currentUser.uid}
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
