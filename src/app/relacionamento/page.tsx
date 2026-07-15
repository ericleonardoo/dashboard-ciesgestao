'use client';

import React, { useState, useEffect } from 'react';
import { getAvailableMonths } from '@/server/actions/dashboard';
import { getBvsQueue, updateBvsStatus, BvsQueueItem } from '@/server/actions/relacionamento';
import { 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  RotateCcw,
  Smartphone,
  Info
} from 'lucide-react';
import PeriodSelector from '@/components/shared/PeriodSelector';
import { TableSkeleton } from '../../components/shared/Skeleton';
import { getCurrentProfile } from '@/server/actions/users';
import { UserPermissions } from '@/lib/firebase/auth-session';
import RestrictedAccess from '@/components/shared/RestrictedAccess';

export default function RelacionamentoPage() {
  const [profile, setProfile] = useState<UserPermissions | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'sent'>('pending');
  const [pendingList, setPendingList] = useState<BvsQueueItem[]>([]);
  const [sentList, setSentList] = useState<BvsQueueItem[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getCurrentProfile();
        setProfile(data);
      } catch (err) {
        console.error('Erro ao ler perfil:', err);
      } finally {
        setProfileLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // 1. Carrega os meses disponíveis na montagem do componente
  useEffect(() => {
    async function loadMonths() {
      try {
        const isDemo = typeof window !== 'undefined' && localStorage.getItem('cies_demo_mode') === 'true';
        if (isDemo) {
          const { demoGetAvailableMonths } = await import('@/lib/demo-store');
          const months = demoGetAvailableMonths();
          setAvailableMonths(months);
          if (months.length > 0) {
            setSelectedMonth(months[0]);
          }
          return;
        }

        const months = await getAvailableMonths();
        setAvailableMonths(months);
        if (months.length > 0) {
          setSelectedMonth(months[0]);
        }
      } catch {
        setError('Falha ao carregar períodos de importações.');
      }
    }
    loadMonths();
  }, []);

  // 2. Carrega a fila sempre que o período selecionado for alterado
  useEffect(() => {
    if (!selectedMonth) return;

    async function loadQueue() {
      setLoading(true);
      setError(null);
      try {
        const isDemo = typeof window !== 'undefined' && localStorage.getItem('cies_demo_mode') === 'true';
        if (isDemo) {
          const { demoGetBvsQueue } = await import('@/lib/demo-store');
          const data = demoGetBvsQueue(selectedMonth);
          setPendingList(data.pending);
          setSentList(data.sent);
          return;
        }

        const data = await getBvsQueue(selectedMonth);
        setPendingList(data.pending);
        setSentList(data.sent);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao carregar fila de boas-vindas.');
      } finally {
        setLoading(false);
      }
    }

    loadQueue();
  }, [selectedMonth]);

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

  /**
   * Trata o acionamento de envio de mensagem de boas-vindas
   */
  const handleSendBvs = async (item: BvsQueueItem) => {
    setActionLoadingId(item.id);
    setError(null);

    try {
      // 1. Abre a URL do WhatsApp Web em nova aba
      window.open(item.redirectUrl, '_blank', 'noopener,noreferrer');

      const isDemo = typeof window !== 'undefined' && localStorage.getItem('cies_demo_mode') === 'true';
      if (isDemo) {
        const { demoUpdateBvsStatus } = await import('@/lib/demo-store');
        demoUpdateBvsStatus(item.id, 'SIM');
      } else {
        // 2. Atualiza no Firestore para status = 'SIM' via Server Action
        await updateBvsStatus(item.id, 'SIM');
      }

      // 3. Move o item localmente de pendente para enviado (evita refetch completo e dá feedback instantâneo)
      setPendingList((prev) => prev.filter((p) => p.id !== item.id));
      setSentList((prev) => [
        { ...item, bvsStatus: 'SIM' },
        ...prev,
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao atualizar status de boas-vindas.');
    } finally {
      setActionLoadingId(null);
    }
  };

  /**
   * Trata a reversão do status para não-enviado (correção de erros do operador)
   */
  const handleRevertBvs = async (item: BvsQueueItem) => {
    setActionLoadingId(item.id);
    setError(null);

    try {
      const isDemo = typeof window !== 'undefined' && localStorage.getItem('cies_demo_mode') === 'true';
      if (isDemo) {
        const { demoUpdateBvsStatus } = await import('@/lib/demo-store');
        demoUpdateBvsStatus(item.id, 'NÃO INFORMADO');
      } else {
        // Atualiza no Firestore para status = 'NÃO'
        await updateBvsStatus(item.id, 'NÃO INFORMADO');
      }

      // Move o item de enviado para pendente na lista local
      setSentList((prev) => prev.filter((s) => s.id !== item.id));
      setPendingList((prev) => [
        { ...item, bvsStatus: 'NÃO INFORMADO' },
        ...prev,
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao reverter status de boas-vindas.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (profileLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <TableSkeleton rows={8} columns={4} />
        </div>
      </div>
    );
  }

  const hasAccess = profile && (profile.areas.includes('gestao') || profile.areas.includes('relacionamento'));
  if (!hasAccess) {
    const currentRole = profile ? profile.areas[0] || 'colaborador' : 'colaborador';
    return <RestrictedAccess allowedRoles={['gestao', 'relacionamento']} currentRole={currentRole} />;
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Relacionamento com o Aluno
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Envio de mensagens de boas-vindas para os alunos que subiram no sistema oficial.
          </p>
        </div>

        {/* Filtro de Mês de Referência */}
        {availableMonths.length > 0 && (
          <PeriodSelector
            availableMonths={availableMonths}
            selectedMonth={selectedMonth}
            onChange={setSelectedMonth}
          />
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {availableMonths.length === 0 && !loading && (
        <div className="bg-card border border-border rounded-xl p-8 text-center space-y-4 max-w-md mx-auto">
          <div className="text-4xl">📥</div>
          <h2 className="text-lg font-bold text-foreground">Fila de Boas-Vindas Vazia</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Nenhuma planilha foi importada no sistema ainda. Vá até **Importações** para carregar dados.
          </p>
        </div>
      )}

      {availableMonths.length > 0 && (
        <div className="space-y-6">
          {/* Navegação por Abas */}
          <div className="flex space-x-2 border-b border-border">
            <button
              onClick={() => setActiveTab('pending')}
              className={`pb-3 px-4 text-sm font-bold transition-all relative flex items-center space-x-2 ${
                activeTab === 'pending'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Pendentes de Boas-Vindas</span>
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                pendingList.length > 0 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
                {pendingList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('sent')}
              className={`pb-3 px-4 text-sm font-bold transition-all relative flex items-center space-x-2 ${
                activeTab === 'sent'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CheckCircle className="h-4 w-4" />
              <span>Recepções Enviadas</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {sentList.length}
              </span>
            </button>
          </div>

          {/* Fila de Pendentes */}
          {activeTab === 'pending' && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Fila de Atendimento</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Alunos ativados no sistema oficial que ainda aguardam a recepção. Clicar no botão abrirá o WhatsApp do aluno.
                </p>
              </div>

              {loading ? (
                <div className="py-6">
                  <TableSkeleton rows={5} columns={5} />
                </div>
              ) : pendingList.length === 0 ? (
                <div className="py-12 text-center space-y-2 border border-dashed border-border rounded-xl">
                  <span className="text-3xl">🎉</span>
                  <p className="text-sm font-semibold text-foreground">Tudo em dia!</p>
                  <p className="text-xs text-muted-foreground">Nenhuma mensagem de boas-vindas pendente para este mês.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border text-sm text-left">
                    <thead>
                      <tr className="text-muted-foreground font-semibold border-b border-border">
                        <th className="py-3 px-4">Aluno</th>
                        <th className="py-3 px-4">Curso / Faculdade</th>
                        <th className="py-3 px-4">Vendedor</th>
                        <th className="py-3 px-4">Contato</th>
                        <th className="py-3 px-4 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {pendingList.map((item) => (
                        <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-foreground">{item.studentName}</td>
                          <td className="py-3.5 px-4">
                            <span className="text-foreground block">{item.courseName}</span>
                            <span className="text-xs text-muted-foreground block">{item.institution}</span>
                          </td>
                          <td className="py-3.5 px-4 text-muted-foreground">{item.sellerName}</td>
                          <td className="py-3.5 px-4 font-mono text-muted-foreground flex items-center space-x-1.5">
                            <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{item.phone}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleSendBvs(item)}
                              disabled={actionLoadingId !== null}
                              className="inline-flex items-center space-x-1.5 py-1.5 px-3 border border-transparent text-xs font-bold rounded-lg text-primary-foreground bg-primary hover:bg-violet-700 transition-colors disabled:opacity-50"
                            >
                              {actionLoadingId === item.id ? (
                                <span className="h-3 w-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
                              ) : (
                                <MessageSquare className="h-3.5 w-3.5" />
                              )}
                              <span>Enviar Boas-Vindas</span>
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Fila de Enviados */}
          {activeTab === 'sent' && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Histórico de Atendimento</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Alunos que já receberam mensagens de boas-vindas no período selecionado.
                </p>
              </div>

              {loading ? (
                <div className="py-6">
                  <TableSkeleton rows={5} columns={5} />
                </div>
              ) : sentList.length === 0 ? (
                <div className="py-12 text-center space-y-1 text-muted-foreground border border-dashed border-border rounded-xl">
                  <Info className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-semibold">Sem registros</p>
                  <p className="text-xs">Nenhum atendimento realizado para este período ainda.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border text-sm text-left">
                    <thead>
                      <tr className="text-muted-foreground font-semibold border-b border-border">
                        <th className="py-3 px-4">Aluno</th>
                        <th className="py-3 px-4">Curso / Faculdade</th>
                        <th className="py-3 px-4">Vendedor</th>
                        <th className="py-3 px-4">Contato</th>
                        <th className="py-3 px-4 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {sentList.map((item) => (
                        <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-foreground">{item.studentName}</td>
                          <td className="py-3.5 px-4">
                            <span className="text-foreground block">{item.courseName}</span>
                            <span className="text-xs text-muted-foreground block">{item.institution}</span>
                          </td>
                          <td className="py-3.5 px-4 text-muted-foreground">{item.sellerName}</td>
                          <td className="py-3.5 px-4 font-mono text-muted-foreground flex items-center space-x-1.5">
                            <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{item.phone}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleRevertBvs(item)}
                              disabled={actionLoadingId !== null}
                              className="inline-flex items-center space-x-1.5 py-1.5 px-3 border border-border text-xs font-semibold rounded-lg text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
                              title="Marcar como pendente novamente"
                            >
                              {actionLoadingId === item.id ? (
                                <span className="h-3 w-3 border-2 border-foreground border-t-transparent rounded-full animate-spin"></span>
                              ) : (
                                <RotateCcw className="h-3.5 w-3.5" />
                              )}
                              <span>Reverter Status</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
