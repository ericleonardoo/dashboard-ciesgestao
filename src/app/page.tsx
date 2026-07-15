'use client';

/**
 * -----------------------------------------------------------------------------
 * PAINEL GERAL (DASHBOARD) - PÁGINA PRINCIPAL (ESTILO CORPORATIVO/LINEAR)
 * -----------------------------------------------------------------------------
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import { getAvailableMonths, getDashboardData, DashboardData } from '@/server/actions/dashboard';

import { 
  FileSpreadsheet,
  ChevronDown,
  Activity,
  AlertOctagon,
  ListTodo
} from 'lucide-react';

import { KpiCardSkeleton } from '../components/shared/Skeleton';

// Importação da biblioteca Recharts (Gráficos Profissionais)
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function Home() {
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError(null);
      try {
        const isDemo = typeof window !== 'undefined' && localStorage.getItem('cies_demo_mode') === 'true';

        if (isDemo) {
          const { demoGetAvailableMonths, demoGetDashboardStats, demoGetBvsQueue } = await import('@/lib/demo-store');
          const months = demoGetAvailableMonths();
          setAvailableMonths(months);

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
              })),
              marketingRoi: 0,
              marketingCostPerEnrollment: 0,
              leadsConversionRate: 0,
              activePartnershipsCount: 0,
              actionPlansPending: 0,
              criticalCasesOpen: 0
            });
          }
        } else {
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

  const formatMoney = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const formatMoneyCompact = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact'
    }).format(cents / 100);
  };

  const GOAL_REVENUE = 20000000;
  const GOAL_ENROLLMENTS = 150;

  const validAmount = dashboardData ? dashboardData.validAmountCents : 0;
  const totalEnrollments = dashboardData ? dashboardData.totalEnrollments : 0;

  const revenuePercentage = Math.min(Math.round((validAmount / GOAL_REVENUE) * 100), 100);
  const enrollmentsPercentage = Math.min(Math.round((totalEnrollments / GOAL_ENROLLMENTS) * 100), 100);

  // Paleta Profissional para os gráficos (Preto/Cinza/Acentos sutis)
  const PIE_COLORS = ['#18181b', '#52525b', '#a1a1aa'];

  if (!loading && availableMonths.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6 text-center animate-fade-in max-w-xl mx-auto">
        <div className="p-4 bg-secondary text-muted-foreground rounded-full border border-border">
          <FileSpreadsheet className="h-16 w-16" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-foreground">Nenhuma Matrícula Cadastrada</h2>
          <p className="text-sm text-muted-foreground">
            O sistema ainda não possui dados de faturamento ou matrículas para consolidação gerencial.
          </p>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl text-xs text-muted-foreground text-left leading-relaxed shadow-sm">
          <p className="font-semibold text-foreground mb-1.5">Como iniciar:</p>
          1. Vá em **Importações** no menu lateral.<br />
          2. Selecione o mês de referência correspondente.<br />
          3. Suba o arquivo da planilha histórica (.xlsx) de matrículas.<br />
          4. Revise os alertas de duplicidade e confirme a importação.
        </div>
        <Link
          href="/importacoes"
          className="py-2.5 px-6 border border-border text-sm font-bold rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 transition-colors block text-center shadow-sm"
        >
          Ir para Importações
        </Link>
      </div>
    );
  }

  // Preparando dados para os gráficos
  const sellersChartData = dashboardData?.sellers.map(s => ({
    name: s.name.split(' ')[0], // Apenas o primeiro nome para não amontoar o gráfico
    vendas: s.count,
    faturamento: s.amountCents / 100
  })) || [];

  const institutionsChartData = dashboardData?.institutions.map(i => ({
    name: i.name,
    value: i.amountCents / 100
  })) || [];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between space-y-4 md:space-y-0 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Visão Geral
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Métricas financeiras e de conversão da operação.
          </p>
        </div>
        
        {availableMonths.length > 0 && (
          <div className="relative">
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 bg-card border border-border px-4 py-2 rounded-lg shadow-sm cursor-pointer hover:bg-secondary transition-all"
            >
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Período:
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-foreground">
                  {formatMonthName(selectedMonth)}
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-56 bg-card border border-gray-400 rounded-xl shadow-2xl z-50 p-1.5">
                  {availableMonths.map((m) => {
                    const isActive = m === selectedMonth;
                    return (
                      <div
                        key={m}
                        onClick={() => {
                          setSelectedMonth(m);
                          setIsDropdownOpen(false);
                        }}
                        className={`px-3 py-2 my-0.5 text-sm cursor-pointer flex items-center justify-between rounded-md transition-all duration-200 border border-transparent ${
                          isActive 
                            ? 'bg-secondary text-foreground font-semibold shadow-sm border-border' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-background hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5'
                        }`}
                      >
                        {formatMonthName(m)}
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-foreground shadow-sm"></div>}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Alertas de Operação (MVP) */}
      {!loading && dashboardData && (dashboardData.actionPlansPending > 0 || dashboardData.criticalCasesOpen > 0) && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {dashboardData.actionPlansPending > 0 && (
            <div className="flex-1 bg-amber-50/50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                <ListTodo className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-900">Planos de Ação Pendentes</h4>
                <p className="text-xs text-amber-800 mt-0.5">Existem {dashboardData.actionPlansPending} plano(s) de ação aguardando conclusão.</p>
              </div>
            </div>
          )}
          {dashboardData.criticalCasesOpen > 0 && (
            <div className="flex-1 bg-red-50/50 border border-red-200 p-4 rounded-xl flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg shrink-0">
                <AlertOctagon className="w-5 h-5 text-red-700" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-900">Casos Críticos Abertos</h4>
                <p className="text-xs text-red-800 mt-0.5">Há {dashboardData.criticalCasesOpen} caso(s) de relacionamento precisando de atenção imediata.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </div>
        </div>
      ) : dashboardData ? (
        <>
          {/* CARDS DE KPI (Estilo Vercel/Linear - Sólidos, sem blur, bordas finas) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-foreground/20 transition-all">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Fat. Válido</span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">{revenuePercentage}% Meta</span>
              </div>
              <div>
                <span className="text-3xl font-extrabold text-foreground tracking-tight">
                  {formatMoney(dashboardData.validAmountCents)}
                </span>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  Alvo: {formatMoneyCompact(GOAL_REVENUE)}
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-foreground/20 transition-all">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Fat. Total Bruto</span>
              </div>
              <div>
                <span className="text-3xl font-extrabold text-foreground tracking-tight">
                  {formatMoney(dashboardData.totalAmountCents)}
                </span>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  Diferença: {formatMoneyCompact(dashboardData.totalAmountCents - dashboardData.validAmountCents)} (Lixo)
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-foreground/20 transition-all">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Matrículas</span>
                <span className="text-xs font-semibold text-foreground bg-secondary px-2 py-0.5 rounded-full">{enrollmentsPercentage}% Meta</span>
              </div>
              <div>
                <span className="text-3xl font-extrabold text-foreground tracking-tight">
                  {dashboardData.totalEnrollments}
                </span>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  Alvo: {GOAL_ENROLLMENTS} matrículas
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-foreground/20 transition-all">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Pendências BVS</span>
                {dashboardData.bvsPendingCount > 0 && (
                  <span className="text-xs font-semibold text-red-600 bg-red-500/10 px-2 py-0.5 rounded-full animate-pulse">Ação Req.</span>
                )}
              </div>
              <div>
                <span className="text-3xl font-extrabold text-foreground tracking-tight">
                  {dashboardData.bvsPendingCount}
                </span>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  Alunos aguardando recepção
                </p>
              </div>
            </div>
          </div>

          {/* GRID ANALÍTICO (Gráficos Recharts) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* GRÁFICO PRINCIPAL: Faturamento por Vendedor (Área) */}
            <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-muted-foreground" />
                    Performance de Faturamento (Vendedores)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">Comparativo de receita gerada por colaborador ativo.</p>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sellersChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#18181b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#18181b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#71717a' }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#71717a' }} 
                      tickFormatter={(value) => `R$ ${value / 1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0), 'Faturamento']}
                    />
                    <Area type="monotone" dataKey="faturamento" stroke="#18181b" strokeWidth={2} fillOpacity={1} fill="url(#colorFaturamento)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* GRÁFICO SECUNDÁRIO: Divisão por Instituição (Doughnut) */}
            <div className="bg-card border border-border rounded-xl shadow-sm p-6 flex flex-col">
              <div>
                <h3 className="text-sm font-bold text-foreground">Market Share (Instituições)</h3>
                <p className="text-xs text-muted-foreground mt-1">Faturamento válido distribuído por parceiro.</p>
              </div>
              <div className="flex-1 flex items-center justify-center min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={institutionsChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {institutionsChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '12px' }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0)}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
          
          {/* TABELA DE MATRÍCULAS RECENTES (Simulação de Densidade de Dados) */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border flex justify-between items-center bg-secondary/30">
              <h3 className="text-sm font-bold text-foreground">Top Matrículas Recentes</h3>
              <span className="text-xs font-medium text-muted-foreground">Mostrando top 5 do período</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary/10">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Instituição</th>
                    <th className="px-5 py-3 font-semibold">Consultor (Vendedor)</th>
                    <th className="px-5 py-3 font-semibold text-right">Faturamento Gerado</th>
                    <th className="px-5 py-3 font-semibold text-center">Status BVS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {dashboardData.sellers.slice(0, 5).map((seller, i) => (
                    <tr key={i} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-4 font-medium text-foreground">UniFecaf</td>
                      <td className="px-5 py-4 text-muted-foreground">{seller.name}</td>
                      <td className="px-5 py-4 font-bold text-foreground text-right">{formatMoney(seller.amountCents)}</td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600">Enviado</span>
                      </td>
                    </tr>
                  ))}
                  {dashboardData.sellers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">Sem dados suficientes para exibição.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </>
      ) : null}
    </div>
  );
}
