'use client';

import React, { useState, useEffect } from 'react';
import { getAvailableMonths } from '@/server/actions/dashboard';
import { getEnrollmentsList, updateEnrollmentFields, EnrollmentItem } from '@/server/actions/enrollments';
import { getCurrentProfile } from '@/server/actions/users';
import { UserPermissions } from '@/lib/firebase/auth-session';
import { TableSkeleton } from '../../components/shared/Skeleton';
import { 
  Search, 
  Filter, 
  Edit2, 
  FileText,
  X,
  Check,
  Smartphone,
  CreditCard,
  Building,
  UserCheck,
  AlertTriangle,
  History
} from 'lucide-react';

export default function MatriculasPage() {
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  // filteredList removido do estado e agora derivado em tempo de renderização
  const [currentUser, setCurrentUser] = useState<UserPermissions | null>(null);

  // Estados de filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filterInstitution, setFilterInstitution] = useState('TODOS');
  const [filterBvs, setFilterBvs] = useState('TODOS');
  const [filterRelease, setFilterRelease] = useState('TODOS');

  // Estados de modais e carregamento
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EnrollmentItem | null>(null);
  
  const [editingField, setEditingField] = useState<'sellerName' | 'amountCents' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    async function init() {
      try {
        const isDemo = typeof window !== 'undefined' && localStorage.getItem('cies_demo_mode') === 'true';
        if (isDemo) {
          const { demoGetAvailableMonths } = await import('@/lib/demo-store');
          const months = demoGetAvailableMonths();
          setAvailableMonths(months);
          if (months.length > 0) {
            setSelectedMonth(months[0]);
          }
          setCurrentUser({
            uid: 'demo-user-gestao',
            name: 'Demonstração Local',
            email: 'demo@ciesmg.com.br',
            status: 'active',
            areas: ['gestao'],
            permissions: {}
          });
          return;
        }

        const months = await getAvailableMonths();
        setAvailableMonths(months);
        if (months.length > 0) {
          setSelectedMonth(months[0]);
        }
        const profile = await getCurrentProfile();
        setCurrentUser(profile);
      } catch {
        setError('Falha ao inicializar dados de sessões.');
      }
    }
    init();
  }, []);

  // 2. Carrega a lista de matrículas do período
  useEffect(() => {
    if (!selectedMonth) return;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const isDemo = typeof window !== 'undefined' && localStorage.getItem('cies_demo_mode') === 'true';
        if (isDemo) {
          const { demoGetEnrollmentsList } = await import('@/lib/demo-store');
          const list = demoGetEnrollmentsList(selectedMonth);
          setEnrollments(list);
          setCurrentPage(1);
          return;
        }

        const list = await getEnrollmentsList(selectedMonth);
        setEnrollments(list);
        setCurrentPage(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao carregar matrículas.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedMonth]);

  // 3. Filtros e busca locais derivados em tempo de renderização (React useMemo)
  const filteredList = React.useMemo(() => {
    let result = [...enrollments];

    // Busca textual por nome ou CPF
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      const digitsQuery = query.replace(/\D/g, ''); // Para busca de CPF numérico puro
      result = result.filter(
        (item) => 
          item.studentName.toLowerCase().includes(query) ||
          item.cpf.includes(digitsQuery)
      );
    }

    // Filtro de Instituição
    if (filterInstitution !== 'TODOS') {
      result = result.filter((item) => item.institution === filterInstitution);
    }

    // Filtro de BVS
    if (filterBvs !== 'TODOS') {
      result = result.filter((item) => item.bvsStatus === filterBvs);
    }

    // Filtro de Subiu
    if (filterRelease !== 'TODOS') {
      result = result.filter((item) => item.releaseStatus === filterRelease);
    }

    return result;
  }, [enrollments, searchQuery, filterInstitution, filterBvs, filterRelease]);

  // Formata o mês ex: "2026-06" para "Junho de 2026"
  const formatMonthName = (monthStr: string) => {
    if (!monthStr) return '';
    const [year, monthNum] = monthStr.split('-');
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const monthIndex = parseInt(monthNum, 10) - 1;
    return `${months[monthIndex]} / ${year}`;
  };

  // Formata centavos para BRL
  const formatMoney = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  // Máscaras de PII para listagem pública
  const maskCpf = (cpf: string) => {
    if (!cpf || cpf.length < 11) return '***.***.***-**';
    return `***.***.${cpf.substring(6, 9)}-**`;
  };

  const maskPhone = (phone: string) => {
    if (!phone) return '(XX) X****-XXXX';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
      return `(${digits.substring(0, 2)}) 9****-${digits.substring(7)}`;
    }
    return phone;
  };

  // Permissões visuais na tela
  const isGestao = currentUser?.areas.includes('gestao') || false;
  const isAdministrativo = currentUser?.areas.includes('administrativo') || false;

  const canEditSeller = isGestao;
  const canEditAmount = isGestao || isAdministrativo;

  // Paginação cálculos
  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedList = filteredList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  /**
   * Abre modal para iniciar edições
   */
  const startEditing = (field: 'sellerName' | 'amountCents') => {
    if (!selectedItem) return;
    setEditingField(field);
    setModalError(null);
    if (field === 'sellerName') {
      setEditValue(selectedItem.sellerName);
    } else {
      setEditValue((selectedItem.amountCents / 100).toString().replace('.', ','));
    }
  };

  /**
   * Salva a edição após confirmação
   */
  const saveFieldsEdit = async () => {
    if (!selectedItem || !editingField) return;
    setActionLoading(true);
    setModalError(null);

    try {
      const updates: Partial<EnrollmentItem> = {};
      
      if (editingField === 'sellerName') {
        if (!editValue.trim()) throw new Error('O nome do vendedor não pode ficar vazio.');
        updates.sellerName = editValue.trim();
      } else {
        const cleanValue = editValue.replace(/\./g, '').replace(',', '.');
        const floatVal = parseFloat(cleanValue);
        if (isNaN(floatVal) || floatVal < 0) {
          throw new Error('Insira um valor financeiro válido.');
        }
        updates.amountCents = Math.round(floatVal * 100);
      }

      const isDemo = typeof window !== 'undefined' && localStorage.getItem('cies_demo_mode') === 'true';
      if (isDemo) {
        const { demoUpdateEnrollmentFields } = await import('@/lib/demo-store');
        const updatedItem = demoUpdateEnrollmentFields(selectedItem.id, updates);
        
        setEnrollments((prev) => 
          prev.map((item) => (item.id === selectedItem.id ? updatedItem : item))
        );
        setSelectedItem(updatedItem);
        setEditingField(null);
        setActionLoading(false);
        return;
      }

      // Executa no servidor
      await updateEnrollmentFields(selectedItem.id, updates);

      // Atualiza o estado local para evitar refetch total
      const updatedItem = {
        ...selectedItem,
        ...updates,
      };

      // Atualiza na listagem principal
      setEnrollments((prev) => 
        prev.map((item) => (item.id === selectedItem.id ? { ...item, ...updates } : item))
      );
      setSelectedItem(updatedItem);
      setEditingField(null);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Falha ao salvar alterações.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Matrículas
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Consulta geral, filtros detalhados e edições de dados de matrículas.
          </p>
        </div>

        {/* Filtro de Mês de Referência */}
        {availableMonths.length > 0 && (
          <div className="flex items-center space-x-3 bg-card border border-border px-4 py-2 rounded-lg shadow-sm">
            <label htmlFor="month-select" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Período:
            </label>
          <select
            id="month-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-secondary rounded-sm cursor-pointer border-none p-0 pr-6 transition-all"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m} className="bg-card text-foreground">
                {formatMonthName(m)}
              </option>
            ))}
          </select>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {/* Painel de Filtros e Busca */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Busca por Nome/CPF */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar aluno ou CPF..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-secondary/50 border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none focus:border-transparent transition-all"
            />
          </div>

          {/* Filtro de Faculdade */}
          <div className="flex items-center space-x-2 bg-secondary/50 border border-border rounded-lg px-3 py-2">
            <Building className="h-4.5 w-4.5 text-muted-foreground" />
            <select
              value={filterInstitution}
              onChange={(e) => { setFilterInstitution(e.target.value); setCurrentPage(1); }}
              className="w-full bg-transparent text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-secondary rounded-sm cursor-pointer transition-all"
            >
              <option value="TODOS">Faculdade: Todas</option>
              <option value="UniFecaf">UniFecaf</option>
              <option value="UniFacvest">UniFacvest</option>
              <option value="FSL">FSL</option>
            </select>
          </div>

          {/* Filtro de BVS */}
          <div className="flex items-center space-x-2 bg-secondary/50 border border-border rounded-lg px-3 py-2">
            <UserCheck className="h-4.5 w-4.5 text-muted-foreground" />
            <select
              value={filterBvs}
              onChange={(e) => { setFilterBvs(e.target.value); setCurrentPage(1); }}
              className="w-full bg-transparent text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-secondary rounded-sm cursor-pointer transition-all"
            >
              <option value="TODOS">BVS: Todos</option>
              <option value="SIM">BVS: SIM</option>
              <option value="NÃO">BVS: NÃO</option>
              <option value="NÃO INFORMADO">BVS: NÃO INFORMADO</option>
            </select>
          </div>

          {/* Filtro de Subiu */}
          <div className="flex items-center space-x-2 bg-secondary/50 border border-border rounded-lg px-3 py-2">
            <Filter className="h-4.5 w-4.5 text-muted-foreground" />
            <select
              value={filterRelease}
              onChange={(e) => { setFilterRelease(e.target.value); setCurrentPage(1); }}
              className="w-full bg-transparent text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-secondary rounded-sm cursor-pointer transition-all"
            >
              <option value="TODOS">Subiu?: Todos</option>
              <option value="SIM">Subiu?: SIM</option>
              <option value="NÃO">Subiu?: NÃO</option>
              <option value="NÃO INFORMADO">Subiu?: NÃO INFORMADO</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Matrículas */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} columns={7} />
          </div>
        ) : paginatedList.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <span className="text-3xl">📭</span>
            <p className="text-sm font-semibold text-foreground">Nenhuma matrícula encontrada</p>
            <p className="text-xs text-muted-foreground">
              Tente reajustar os filtros ou selecione outro período de referência.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm text-left">
              <thead>
                <tr className="text-muted-foreground font-semibold border-b border-border bg-secondary/20">
                  <th className="py-3 px-4">Aluno / CPF</th>
                  <th className="py-3 px-4">Curso / Faculdade</th>
                  <th className="py-3 px-4">Vendedor</th>
                  <th className="py-3 px-4">Valor</th>
                  <th className="py-3 px-4">BVS?</th>
                  <th className="py-3 px-4">Subiu?</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedList.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-secondary/20 transition-colors ${
                      item.isDbDuplicate ? 'bg-destructive/5 text-destructive-foreground/90' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <span className="font-semibold text-foreground block">{item.studentName}</span>
                      <span className="text-xs text-muted-foreground block">{maskCpf(item.cpf)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-foreground block">{item.courseName}</span>
                      <span className="text-xs text-muted-foreground block">{item.institution}</span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-medium">{item.sellerName}</td>
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {formatMoney(item.amountCents)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.bvsStatus === 'SIM' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : item.bvsStatus === 'NÃO' 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                            : 'bg-secondary text-muted-foreground'
                      }`}>
                        {item.bvsStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.releaseStatus === 'SIM' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : item.releaseStatus === 'NÃO' 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                            : 'bg-secondary text-muted-foreground'
                      }`}>
                        {item.releaseStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="inline-flex items-center space-x-1 py-1 px-2.5 border border-border rounded hover:bg-secondary text-xs text-foreground font-medium transition-colors"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Detalhes</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação Controles */}
        {filteredList.length > 0 && !loading && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-border bg-secondary/10">
            <span className="text-xs text-muted-foreground">
              Mostrando {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredList.length)} de {filteredList.length} matrículas
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="py-1 px-3 border border-border rounded text-xs text-foreground font-semibold hover:bg-secondary transition-colors disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-xs font-bold text-foreground py-1 px-2.5">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="py-1 px-3 border border-border rounded text-xs text-foreground font-semibold hover:bg-secondary transition-colors disabled:opacity-40"
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Gaveta / Modal lateral de Detalhes da Matrícula */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-300">
          <div className="w-full max-w-lg bg-card border-l border-border h-full flex flex-col shadow-2xl animate-slide-in-right p-6 space-y-6 overflow-y-auto">
            {/* Header Gaveta */}
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">{selectedItem.studentName}</h3>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">ID: {selectedItem.id}</span>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Fechar detalhes"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Seções de dados */}
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Informações Gerais</h4>
                <div className="bg-secondary/20 rounded-xl p-4 border border-border/50 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Curso:</span>
                    <span className="text-foreground font-medium">{selectedItem.courseName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Instituição:</span>
                    <span className="text-foreground font-medium">{selectedItem.institution}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mês de Referência:</span>
                    <span className="text-foreground font-medium">{formatMonthName(selectedItem.referenceMonth)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pagamento:</span>
                    <span className="text-foreground font-medium flex items-center space-x-1">
                      <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{selectedItem.paymentMethod}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Dados de PII (Protegidos)</h4>
                <div className="bg-secondary/20 rounded-xl p-4 border border-border/50 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">CPF:</span>
                    <span className="text-foreground font-mono">{maskCpf(selectedItem.cpf)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Celular:</span>
                    <span className="text-foreground font-mono flex items-center space-x-1">
                      <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{maskPhone(selectedItem.phone)}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Vendedor e Valor (Editáveis com Confirmação e RBAC) */}
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Faturamento e Operações</h4>
                <div className="bg-secondary/20 rounded-xl p-4 border border-border/50 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <span className="text-muted-foreground block text-xs">Vendedor:</span>
                      <span className="text-foreground font-bold">{selectedItem.sellerName}</span>
                    </div>
                    {canEditSeller ? (
                      <button
                        onClick={() => startEditing('sellerName')}
                        className="p-1.5 border border-border rounded hover:bg-secondary text-primary transition-colors text-xs flex items-center space-x-1"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Editar</span>
                      </button>
                    ) : (
                      <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded">Gestão</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-sm pt-2 border-t border-border/40">
                    <div>
                      <span className="text-muted-foreground block text-xs">Valor Líquido:</span>
                      <span className="text-foreground font-extrabold text-base">{formatMoney(selectedItem.amountCents)}</span>
                    </div>
                    {canEditAmount ? (
                      <button
                        onClick={() => startEditing('amountCents')}
                        className="p-1.5 border border-border rounded hover:bg-secondary text-primary transition-colors text-xs flex items-center space-x-1"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Editar</span>
                      </button>
                    ) : (
                      <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded">Gestão/Admin</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Logs de Auditoria */}
              <div>
                <div className="flex items-center space-x-1 mb-2">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Histórico de Auditoria</h4>
                </div>
                {selectedItem.auditLogs && selectedItem.auditLogs.length > 0 ? (
                  <div className="bg-secondary/20 rounded-xl p-4 border border-border/50 space-y-3 max-h-[180px] overflow-y-auto">
                    {selectedItem.auditLogs.map((log, idx) => (
                      <div key={idx} className="text-xs border-b border-border/30 pb-2 last:border-0 last:pb-0">
                        <div className="flex justify-between text-muted-foreground mb-1">
                          <span className="font-semibold text-primary">{log.updatedByName}</span>
                          <span>{new Date(log.timestamp).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <p className="text-foreground leading-relaxed">
                          Alterou o campo <span className="font-mono text-violet-400 font-semibold">{log.field}</span> de{' '}
                          <span className="font-semibold text-muted-foreground">
                            {log.field === 'amountCents' ? formatMoney(log.oldValue as number) : String(log.oldValue)}
                          </span>{' '}
                          para{' '}
                          <span className="font-semibold text-foreground">
                            {log.field === 'amountCents' ? formatMoney(log.newValue as number) : String(log.newValue)}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-secondary/10 rounded-xl p-4 text-center border border-dashed border-border/50">
                    <p className="text-xs text-muted-foreground">Nenhuma alteração registrada para esta matrícula.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação e Edição (Auditada) */}
      {editingField && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="bg-card border border-border max-w-md w-full mx-4 rounded-2xl shadow-2xl p-6 space-y-4 animate-scale-in">
            <div className="flex items-center space-x-2 text-yellow-400">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold text-foreground">Alteração Auditada</h3>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              {editingField === 'sellerName' 
                ? 'Aviso: Alterar o vendedor impactará as comissões e as metas de vendas consolidadas no dashboard. Esta alteração é auditada.'
                : 'Aviso: Alterar o valor financeiro impactará o faturamento líquido da empresa. Esta alteração exige auditoria estrita.'}
            </p>

            <div className="space-y-1.5 pt-2">
              <label htmlFor="edit-input" className="text-xs font-semibold text-muted-foreground uppercase">
                {editingField === 'sellerName' ? 'Novo Vendedor:' : 'Novo Valor (R$):'}
              </label>
              <input
                id="edit-input"
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={editingField === 'sellerName' ? 'Ex: Nayara' : 'Ex: 199,90'}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors font-semibold"
              />
            </div>

            {modalError && (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-lg">
                ⚠️ {modalError}
              </p>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-border">
              <button
                onClick={() => setEditingField(null)}
                disabled={actionLoading}
                className="py-2 px-4 border border-border text-xs font-semibold rounded-lg text-foreground hover:bg-secondary transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveFieldsEdit}
                disabled={actionLoading}
                className="py-2 px-4 border border-transparent text-xs font-bold rounded-lg text-primary-foreground bg-primary hover:bg-violet-700 transition-colors flex items-center space-x-1 disabled:opacity-50"
              >
                {actionLoading ? (
                  <span className="h-3.5 w-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                <span>Confirmar e Salvar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
