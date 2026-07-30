'use client';

import React, { useState, useEffect } from 'react';
import { getAvailableMonths, getDashboardData, DashboardData } from '@/server/actions/dashboard';
import { 
  Target, 
  Users
} from 'lucide-react';
import PeriodSelector from '@/components/shared/PeriodSelector';
import { KpiCardSkeleton, TableSkeleton } from '@/components/shared/Skeleton';
import { getCurrentProfile } from '@/server/actions/users';
import { UserPermissions } from '@/lib/firebase/auth-session';
import RestrictedAccess from '@/components/shared/RestrictedAccess';

export default function MetasPage() {
  const [profile, setProfile] = useState<UserPermissions | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Metas corporativas do MVP
  const GOAL_REVENUE = 20000000; // R$ 200.000,00 em centavos
  const GOAL_ENROLLMENTS = 150;
  const SELLER_GOAL = 30; // Meta individual por vendedor

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

  useEffect(() => {
    async function loadData() {
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
        console.error('Falha ao carregar metas:', err);
        setError('Ocorreu um erro ao carregar as metas e KPIs do período.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedMonth]);

  // Formata centavos para reais
  const formatMoney = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const validAmount = dashboardData ? dashboardData.validAmountCents : 0;
  const totalEnrollments = dashboardData ? dashboardData.totalEnrollments : 0;

  const revenuePercentage = Math.min(Math.round((validAmount / GOAL_REVENUE) * 100), 100);
  const enrollmentsPercentage = Math.min(Math.round((totalEnrollments / GOAL_ENROLLMENTS) * 100), 100);

  if (profileLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <TableSkeleton rows={8} columns={4} />
        </div>
      </div>
    );
  }

  const hasAccess = profile && profile.areas.includes('gestao');
  if (!hasAccess) {
    const currentRole = profile ? profile.areas[0] || 'colaborador' : 'colaborador';
    return <RestrictedAccess allowedRoles={['gestao']} currentRole={currentRole} />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header e Período */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center space-x-2">
            <Target className="h-8 w-8 text-primary" />
            <span>Metas & KPIs</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Acompanhamento de metas corporativas e desempenho individual de consultores educacionais.
          </p>
        </div>

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

      {loading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <TableSkeleton rows={4} columns={3} />
          </div>
        </div>
      ) : dashboardData ? (
        <>
          {/* Duas Metas Corporativas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Meta de Faturamento */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Meta de Faturamento Válido</span>
                  <span className="text-3xl font-extrabold text-foreground block mt-1">{formatMoney(validAmount)}</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  {revenuePercentage}% Atingido
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progresso: {formatMoney(validAmount)}</span>
                  <span>Meta: {formatMoney(GOAL_REVENUE)}</span>
                </div>
                <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${revenuePercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Meta de Matrículas */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Meta de Volume de Matrículas</span>
                  <span className="text-3xl font-extrabold text-foreground block mt-1">{totalEnrollments} Matrículas</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {enrollmentsPercentage}% Atingido
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progresso: {totalEnrollments}</span>
                  <span>Meta: {GOAL_ENROLLMENTS}</span>
                </div>
                <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${enrollmentsPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Desempenho por Vendedor */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex items-center space-x-2 border-b border-border pb-4">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <h2 className="text-lg font-bold text-foreground">Acompanhamento dos Consultores</h2>
                <p className="text-xs text-muted-foreground">Progresso individual baseado na meta de {SELLER_GOAL} matrículas válidas.</p>
              </div>
            </div>

            {dashboardData.sellers.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-8">Nenhum consultor registrou vendas neste período.</p>
            ) : (
              <div className="space-y-6">
                {dashboardData.sellers.map((seller) => {
                  const percent = Math.min(Math.round((seller.count / SELLER_GOAL) * 100), 100);
                  return (
                    <div key={seller.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-foreground">{seller.name}</span>
                          <span className="text-xs text-muted-foreground">({formatMoney(seller.amountCents)})</span>
                        </div>
                        <span className="text-xs font-bold text-foreground">
                          {seller.count} de {SELLER_GOAL} vendas ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            percent >= 100 
                              ? 'bg-amber-500' 
                              : percent >= 70 
                                ? 'bg-primary' 
                                : 'bg-primary/50'
                          }`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
