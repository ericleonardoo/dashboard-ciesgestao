'use client';

import React, { useEffect, useState } from 'react';
import { getCurrentProfile } from '@/server/actions/users';
import { UserPermissions } from '@/lib/firebase/auth-session';
import RestrictedAccess from '@/components/shared/RestrictedAccess';
import { Headset, Plus, AlertTriangle, CheckCircle2, Search, Edit3, Trash2 } from 'lucide-react';
import { TableSkeleton } from '@/components/shared/Skeleton';
import CaseModal from './_components/CaseModal';
import ConfirmModal from '@/components/shared/ConfirmModal';
import FilterSelect from '@/components/shared/FilterSelect';
import { getRelationshipCases, createRelationshipCase, updateRelationshipCase, deleteRelationshipCase } from '@/server/actions/relationship-cases';
import { RelationshipCase, CaseCategory, CaseStatus } from '@/lib/validation/relationship-case-schema';

const CATEGORY_LABELS: Record<string, string> = {
  acesso: 'Acesso',
  financeiro: 'Financeiro',
  evasao: 'Evasão',
  outro: 'Outro'
};

const STATUS_LABELS: Record<string, string> = {
  aberto: 'Aberto',
  em_tratativa: 'Em Tratativa',
  resolvido: 'Resolvido'
};

const STATUS_COLORS: Record<string, string> = {
  aberto: 'bg-red-50 text-red-700 border-red-200',
  em_tratativa: 'bg-amber-50 text-amber-700 border-amber-200',
  resolvido: 'bg-emerald-50 text-emerald-700 border-emerald-200'
};

export default function RelationshipCasesPage() {
  const [currentUser, setCurrentUser] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [cases, setCases] = useState<RelationshipCase[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [filterCategory, setFilterCategory] = useState<string>('TODAS');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<RelationshipCase | null>(null);
  const [caseToDelete, setCaseToDelete] = useState<string | null>(null);
  
  const fetchCases = async () => {
    setLoading(true);
    try {
      const data = await getRelationshipCases({
        status: filterStatus !== 'TODOS' ? filterStatus as CaseStatus : undefined,
        category: filterCategory !== 'TODAS' ? filterCategory as CaseCategory : undefined,
      });
      setCases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentProfile().then(user => {
      setCurrentUser(user);
      if (user && (user.areas.includes('relacionamento') || user.areas.includes('administrativo') || user.areas.includes('gestao'))) {
        fetchCases();
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterCategory]);

  if (loading) {
    return <div className="space-y-6"><TableSkeleton /></div>;
  }

  if (!currentUser || (!currentUser.areas.includes('relacionamento') && !currentUser.areas.includes('administrativo') && !currentUser.areas.includes('gestao'))) {
    return <RestrictedAccess title="Acesso Restrito: Casos Críticos" message="Você não tem permissão para visualizar casos de alunos." />;
  }

  const handleNew = () => {
    setEditingCase(null);
    setIsModalOpen(true);
  };

  const handleEdit = (c: RelationshipCase) => {
    setEditingCase(c);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Omit<RelationshipCase, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingCase && editingCase.id) {
        await updateRelationshipCase(editingCase.id, data);
      } else {
        await createRelationshipCase(data);
      }
      fetchCases();
      return true;
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar o caso. Verifique os dados.');
      return false;
    }
  };

  const confirmDelete = async () => {
    if (!caseToDelete) return;
    try {
      await deleteRelationshipCase(caseToDelete);
      setCaseToDelete(null);
      fetchCases();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir o caso.');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const totalAbertos = cases.filter(c => c.status === 'aberto').length;
  const totalTratativa = cases.filter(c => c.status === 'em_tratativa').length;
  const totalResolvidos = cases.filter(c => c.status === 'resolvido').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Headset className="w-6 h-6 text-primary" />
            Casos Críticos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestão de alunos sob risco de evasão, problemas de acesso ou financeiros.
          </p>
        </div>
        <button 
          onClick={handleNew}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Caso
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">Abertos (Urgente)</p>
            <h3 className="text-2xl font-bold text-foreground">{totalAbertos}</h3>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">Em Tratativa</p>
            <h3 className="text-2xl font-bold text-foreground">{totalTratativa}</h3>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">Resolvidos</p>
            <h3 className="text-2xl font-bold text-foreground">{totalResolvidos}</h3>
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border bg-secondary/30 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect 
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { value: 'TODOS', label: 'Todos os Status' },
                { value: 'aberto', label: 'Abertos' },
                { value: 'em_tratativa', label: 'Em Tratativa' },
                { value: 'resolvido', label: 'Resolvidos' }
              ]}
            />
            <FilterSelect 
              value={filterCategory}
              onChange={setFilterCategory}
              options={[
                { value: 'TODAS', label: 'Todas as Categorias' },
                { value: 'acesso', label: 'Acesso' },
                { value: 'financeiro', label: 'Financeiro' },
                { value: 'evasao', label: 'Evasão' },
                { value: 'outro', label: 'Outro' }
              ]}
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Aluno</th>
                <th className="px-4 py-3">CPF</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    Nenhum caso encontrado.
                  </td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/50 transition-colors group">
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{c.studentName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.studentCpf}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2 py-1 bg-secondary rounded-md text-foreground">
                        {CATEGORY_LABELS[c.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${STATUS_COLORS[c.status]}`}>
                        {STATUS_LABELS[c.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(c)}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors mr-1"
                        title="Editar Caso"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {(currentUser?.areas.includes('gestao') || currentUser?.areas.includes('admin')) && (
                        <button 
                          onClick={() => setCaseToDelete(c.id!)}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                          title="Excluir Caso"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CaseModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingCase}
        onSave={handleSave}
      />

      <ConfirmModal
        isOpen={!!caseToDelete}
        onClose={() => setCaseToDelete(null)}
        onConfirm={confirmDelete}
        title="Excluir Caso"
        description="Tem certeza que deseja excluir este caso? Esta ação não pode ser desfeita e os dados serão removidos permanentemente."
        confirmText="Excluir"
        isDestructive={true}
      />
    </div>
  );
}
