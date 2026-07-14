'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAvailableMonths, getDashboardData, DashboardData } from '@/server/actions/dashboard';
import { 
  FileSpreadsheet,
  Award,
  BookOpen
} from 'lucide-react';
import { KpiCardSkeleton, TableSkeleton } from '../components/shared/Skeleton';

export default function Home() {
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega meses e dados do dashboard
  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError(null);
      try {
        const isDemo = typeof window !== 'undefined' && localStorage.getItem('cies_demo_mode') === 'true';

        if (isDemo) {
          // Importa utilitários mock locais
          const { demoGetAvailableMonths, demoGetDashboardStats, demoGetBvsQueue } = await import('@/lib/demo-store');
          const months = demoGetAvailableMonths();
          setAvailableMonths(months);

          // Se não houver mês selecionado, pega o mais recente
          const activeMonth = selectedMonth || months[0] || '';
          setSelectedMonth(activeMonth);

          if (activeMonth) {
            const demoData = demoGetDashboardStats(activeMonth);
            const { pending } = demoGetBvsQueue(activeMonth);
            
            setDashboardData({
              referenceMonth: demoData.period,
              totalEnrollments: demoData.totalEnrollments,
              validAmountCents: demoData.validRevenueCents,
              totalAmountCents: demoData.totalRevenueCents,
              bvsPendingCount: pending.length,
              institutions: demoData.byInstitution.map(i => ({
                name: i.name,
                count: i.count,
                amountCents: i.revenueCents
              })),
              sellers: demoData.sellersRanking.map(s => ({
                name: s.name,
                count: s.count,
                amountCents: s.revenueCents
              }))
            });
          }
        } else {
          // Fluxo normal via Server Actions (Firebase/Firestore)
          const months = await getAvailableMonths();
          setAvailableMonths(months);

          const activeMonth = selectedMonth || months[0] || '';
          setSelectedMonth(activeMonth);

          if (activeMonth) {
            const data = await getDashboardData(activeMonth);
            setDashboardData(data);
          }
        }
      } catch (err) {
        console.error('Falha ao carregar dados do painel:', err);
        setError('Ocorreu um erro ao carregar o painel geral de faturamento.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
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

  // Formata centavos inteiros para moeda BRL
  const formatMoney = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  // Metas gerenciais fictícias para o MVP
  const GOAL_REVENUE = 20000000; // R$ 200.000,00 em centavos
  const GOAL_ENROLLMENTS = 150;

  const validAmount = dashboardData ? dashboardData.validAmountCents : 0;
  const totalEnrollments = dashboardData ? dashboardData.totalEnrollments : 0;

  const revenuePercentage = Math.min(Math.round((validAmount / GOAL_REVENUE) * 100), 100);
  const enrollmentsPercentage = Math.min(Math.round((totalEnrollments / GOAL_ENROLLMENTS) * 100), 100);

  // Calcula a cor do semáforo do faturamento válido (Regras baseadas em porcentagem da meta)
  const getSemaphoreBadge = (percent: number) => {
    if (percent >= 90) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
          ● Verde ({percent}%)
        </span>
      );
    }
    if (percent >= 70) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
          ▲ Amarelo ({percent}%)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
        ■ Vermelho ({percent}%)
      </span>
    );
  };

  // Caso não existam dados importados no banco (Estado Vazio / No Data)
  if (!loading && availableMonths.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6 text-center animate-fade-in max-w-xl mx-auto">
        <div className="p-4 bg-violet-500/10 text-violet-400 rounded-full border border-violet-500/20">
          <FileSpreadsheet className="h-16 w-16" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-foreground">Nenhuma Matrícula Cadastrada</h2>
          <p className="text-sm text-muted-foreground">
            O sistema ainda não possui dados de faturamento ou matrículas para consolidação gerencial.
          </p>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl text-xs text-muted-foreground text-left leading-relaxed">
          <p className="font-semibold text-foreground mb-1.5">Como iniciar:</p>
          1. Vá em **Importações** no menu lateral.<br />
          2. Selecione o mês de referência correspondente.<br />
          3. Suba o arquivo da planilha histórica (.xlsx) de matrículas.<br />
          4. Revise os alertas de duplicidade e confirme a importação.
        </div>
        <Link
          href="/importacoes"
          className="py-2.5 px-6 border border-transparent text-sm font-bold rounded-lg text-primary-foreground bg-primary hover:bg-violet-700 transition-colors block text-center"
        >
          Ir para Importações
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Título e Filtro de Período */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Painel Geral
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Visão estratégica consolidada de matrículas e faturamento da operação CIES.
          </p>
        </div>
        
        {/* Seletor de Período */}
        {availableMonths.length > 0 && (
          <div className="flex items-center space-x-3 bg-card border border-border px-4 py-2 rounded-lg shadow-sm">
            <label htmlFor="period-select" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Período:
            </label>
            <select
              id="period-select"
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

      {loading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
              <TableSkeleton rows={4} columns={2} />
            </div>
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <TableSkeleton rows={4} columns={2} />
            </div>
          </div>
        </div>
      ) : dashboardData ? (
        <>
          {/* Grid de Cards KPIs */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Faturamento Válido */}
            <div className="relative overflow-hidden bg-card border border-border rounded-xl p-6 shadow-sm hover:border-violet-500/50 transition-all duration-300 group">
              <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-muted-foreground">Faturamento Válido</span>
                {getSemaphoreBadge(revenuePercentage)}
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-foreground">
                  {formatMoney(dashboardData.validAmountCents)}
                </span>
                <p className="mt-1 text-xs text-muted-foreground">
                  Meta: {formatMoney(GOAL_REVENUE)}
                </p>
              </div>
            </div>

            {/* Card 2: Faturamento Total Planilha */}
            <div className="relative overflow-hidden bg-card border border-border rounded-xl p-6 shadow-sm hover:border-violet-500/50 transition-all duration-300 group">
              <div className="absolute top-0 right-0 h-24 w-24 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-all"></div>
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-muted-foreground">Faturamento Total</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  Bruto Importado
                </span>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-foreground">
                  {formatMoney(dashboardData.totalAmountCents)}
                </span>
                <p className="mt-1 text-xs text-muted-foreground">
                  Diferença: {formatMoney(dashboardData.totalAmountCents - dashboardData.validAmountCents)} em duplicidades
                </p>
              </div>
            </div>

            {/* Card 3: Matrículas Feitas */}
            <div className="relative overflow-hidden bg-card border border-border rounded-xl p-6 shadow-sm hover:border-violet-500/50 transition-all duration-300 group">
              <div className="absolute top-0 right-0 h-24 w-24 bg-yellow-500/10 rounded-full blur-2xl group-hover:bg-yellow-500/20 transition-all"></div>
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-muted-foreground">Matrículas Feitas</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  {enrollmentsPercentage}% da Meta
                </span>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-foreground">
                  {dashboardData.totalEnrollments}
                </span>
                <p className="mt-1 text-xs text-muted-foreground">
                  Meta: {GOAL_ENROLLMENTS} matrículas
                </p>
              </div>
            </div>

            {/* Card 4: Boas-Vindas Pendentes */}
            <div className="relative overflow-hidden bg-card border border-border rounded-xl p-6 shadow-sm hover:border-violet-500/50 transition-all duration-300 group">
              <div className="absolute top-0 right-0 h-24 w-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all"></div>
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-muted-foreground">BVS Pendentes</span>
                {dashboardData.bvsPendingCount > 0 ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                    ■ Pendências ({dashboardData.bvsPendingCount})
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ● Em Dia (0)
                  </span>
                )}
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-foreground">
                  {dashboardData.bvsPendingCount}
                </span>
                <p className="mt-1 text-xs text-muted-foreground">
                  Alunos ativados aguardando recepção
                </p>
              </div>
            </div>
          </div>

          {/* Grid de Seções Gráficos/Tabelas */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Distribuição por Instituição */}
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-bold text-foreground">Desempenho por Instituição</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Comparativo de matrículas e faturamento válido consolidado entre parceiros educacionais.
              </p>
              <div className="mt-6 space-y-5">
                {dashboardData.institutions.map((inst) => {
                  const maxCents = Math.max(...dashboardData.institutions.map(i => i.amountCents)) || 1;
                  const widthPercentage = Math.round((inst.amountCents / maxCents) * 100);
                  
                  return (
                    <div key={inst.name}>
                      <div className="flex justify-between text-sm font-medium mb-1.5">
                        <span className="text-foreground">{inst.name}</span>
                        <span className="text-muted-foreground">
                          {inst.count} matrículas ({formatMoney(inst.amountCents)})
                        </span>
                      </div>
                      <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${widthPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Desempenho Vendedores (Ranking) */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-bold text-foreground">Ranking de Vendas</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Lista ordenada de colaboradores por quantidade de matrículas registradas.
              </p>
              <div className="mt-6 space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {dashboardData.sellers.length === 0 ? (
                  <p className="text-sm text-center text-muted-foreground py-8">
                    Nenhuma venda registrada para este período.
                  </p>
                ) : (
                  dashboardData.sellers.map((seller, idx) => {
                    const isTop = idx === 0;
                    return (
                      <div key={seller.name} className="flex justify-between items-center pb-2 border-b border-border last:border-0 last:pb-0">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                            isTop ? 'bg-amber-500/20 text-amber-400' : 'bg-secondary text-muted-foreground'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="text-sm font-medium text-foreground">{seller.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-foreground block">{seller.count} vendas</span>
                          <span className="text-[10px] text-muted-foreground block">{formatMoney(seller.amountCents)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
