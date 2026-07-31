'use server';

import { getAdminDb } from '../../lib/firebase/admin';
import { requirePermission } from '../../lib/permissions';
import { isEnrollmentValid, isBvsPending } from '../../lib/validation/enrollment-rules';

export interface DashboardInstitutionStat {
  name: string;
  count: number;
  amountCents: number;
}

export interface DashboardSellerStat {
  name: string;
  count: number;
  amountCents: number;
}

export interface DashboardData {
  referenceMonth: string;
  totalAmountCents: number;
  validAmountCents: number;
  totalEnrollments: number;
  bvsPendingCount: number;
  institutions: DashboardInstitutionStat[];
  sellers: DashboardSellerStat[];
  marketingRoi: number;
  marketingCostPerEnrollment: number;
  leadsConversionRate: number;
  activePartnershipsCount: number;
  actionPlansPending: number;
  criticalCasesOpen: number;
}

/**
 * Server Action para buscar todos os meses de referência que já possuem lotes importados
 */
export async function getAvailableMonths(): Promise<string[]> {
  // Exige que o colaborador esteja pelo menos logado e ativo
  await requirePermission('enrollments', 'read');

  try {
    const importsSnapshot = await getAdminDb()
      .collection('imports')
      .orderBy('referenceMonth', 'desc')
      .select('referenceMonth')
      .get();

    const monthsSet = new Set<string>();
    importsSnapshot.docs.forEach((doc: { data: () => Record<string, any> }) => {
      const month = doc.data().referenceMonth;
      if (month) {
        monthsSet.add(month);
      }
    });

    return Array.from(monthsSet);
  } catch (error) {
    console.error('Erro ao buscar meses disponíveis no servidor:', error);
    return [];
  }
}

/**
 * Server Action para carregar e agregar todos os dados do dashboard para o período fornecido
 */
export async function getDashboardData(referenceMonth: string): Promise<DashboardData | null> {
  // Apenas colaboradores autorizados podem ler dados de matrículas
  await requirePermission('enrollments', 'read');

  if (!referenceMonth) {
    return null;
  }

  try {
    const db = getAdminDb();
    
    // Busca todas as matrículas do mês de referência
    const enrollmentsSnapshot = await db
      .collection('enrollments')
      .where('referenceMonth', '==', referenceMonth)
      .get();

    let totalAmountCents = 0;
    let validAmountCents = 0;
    let totalEnrollments = 0;
    let bvsPendingCount = 0;

    const institutionMap: Record<string, { count: number; amountCents: number }> = {
      'UniFecaf': { count: 0, amountCents: 0 },
      'UniFacvest': { count: 0, amountCents: 0 },
      'FSL': { count: 0, amountCents: 0 },
    };

    const sellerMap: Record<string, { count: number; amountCents: number }> = {};

    enrollmentsSnapshot.docs.forEach((doc: { data: () => Record<string, any> }) => {
      const data = doc.data();
      const amount = data.amountCents || 0;
      const instName = data.institution || 'Outras';
      const seller = data.sellerName || 'Desconhecido';
      const isDbDuplicate = data.isDbDuplicate === true;
      const isInternalDuplicate = data.isInternalDuplicate === true;
      const bvsStatus = data.bvsStatus;
      const releaseStatus = data.releaseStatus;

      const mockEnrollment = {
        isDbDuplicate,
        isInternalDuplicate,
        bvsStatus,
        releaseStatus,
      };

      totalEnrollments++;
      totalAmountCents += amount;

      // Se for uma matrícula válida, conta no faturamento válido
      const isValid = isEnrollmentValid(mockEnrollment);
      if (isValid) {
        validAmountCents += amount;
      }

      // Se estiver pendente de BVS
      if (isBvsPending(mockEnrollment)) {
        bvsPendingCount++;
      }

      // Agrega dados por Instituição (Parceiros)
      if (!institutionMap[instName]) {
        institutionMap[instName] = { count: 0, amountCents: 0 };
      }
      institutionMap[instName].count++;
      // Apenas soma no faturamento da instituição se a matrícula for considerada válida
      if (isValid) {
        institutionMap[instName].amountCents += amount;
      }

      // Agrega dados por Vendedor (Ranking)
      if (!sellerMap[seller]) {
        sellerMap[seller] = { count: 0, amountCents: 0 };
      }
      sellerMap[seller].count++;
      if (isValid) {
        sellerMap[seller].amountCents += amount;
      }
    });

    // Converte mapa de instituições em array ordenado por faturamento
    const institutions: DashboardInstitutionStat[] = Object.keys(institutionMap)
      .map((name) => ({
        name,
        count: institutionMap[name].count,
        amountCents: institutionMap[name].amountCents,
      }))
      .sort((a, b) => b.amountCents - a.amountCents);

    // Converte ranking de vendedores ordenado por quantidade de vendas válidas (descendente)
    const sellers: DashboardSellerStat[] = Object.keys(sellerMap)
      .map((name) => ({
        name,
        count: sellerMap[name].count,
        amountCents: sellerMap[name].amountCents,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      referenceMonth,
      totalAmountCents,
      validAmountCents,
      totalEnrollments,
      bvsPendingCount,
      institutions,
      sellers,
      marketingRoi: 0,
      marketingCostPerEnrollment: 0,
      leadsConversionRate: 0,
      activePartnershipsCount: 0,
      actionPlansPending: 0,
      criticalCasesOpen: 0,
    };
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard no servidor:', error);
    throw new Error('Falha ao processar dados gerenciais.');
  }
}
