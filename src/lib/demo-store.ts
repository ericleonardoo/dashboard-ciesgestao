'use client';

import { EnrollmentItem } from '@/server/actions/enrollments';
import { BvsQueueItem } from '@/server/actions/relacionamento';

// Interface do lote de importação mock
export interface DemoImportBatch {
  id: string;
  referenceMonth: string;
  filename: string;
  insertedCount: number;
  createdAt: string;
  createdBy: string;
}

// Chaves do LocalStorage
const ENROLLMENTS_KEY = 'cies_demo_enrollments';
const MONTHS_KEY = 'cies_demo_months';
const BATCHES_KEY = 'cies_demo_batches';

/**
 * Seed inicial para o Modo de Demonstração
 */
const INITIAL_MONTHS = ['2026-07', '2026-06'];

const INITIAL_ENROLLMENTS: EnrollmentItem[] = [
  {
    id: 'demo-enroll-1',
    studentName: 'Ana Clara Souza',
    cpf: '12345678901',
    phone: '11988887777',
    courseName: 'Direito',
    institution: 'UniFecaf',
    sellerName: 'Bia',
    amountCents: 19990,
    type: 'EAD',
    paymentMethod: 'Pix',
    bvsStatus: 'SIM',
    releaseStatus: 'SIM',
    referenceMonth: '2026-07',
    redirectUrl: 'https://wa.me/5511988887777?text=Olá%20Ana%20Clara,%20seja%20bem-vinda!',
    isDbDuplicate: false,
    isInternalDuplicate: false,
    auditLogs: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-enroll-2',
    studentName: 'Bruno Alencar Ramos',
    cpf: '98765432100',
    phone: '11977776666',
    courseName: 'Administração',
    institution: 'UniFacvest',
    sellerName: 'Nayara',
    amountCents: 15000,
    type: 'Semipresencial',
    paymentMethod: 'Boleto',
    bvsStatus: 'NÃO',
    releaseStatus: 'SIM', // Deve ir para Boas-vindas Pendentes!
    referenceMonth: '2026-07',
    redirectUrl: 'https://wa.me/5511977776666?text=Olá%20Bruno,%20seja%20bem-vindo!',
    isDbDuplicate: false,
    isInternalDuplicate: false,
    auditLogs: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-enroll-3',
    studentName: 'Camila Ferreira Lima',
    cpf: '45678912304',
    phone: '11966665555',
    courseName: 'Pedagogia',
    institution: 'FSL',
    sellerName: 'Ninha',
    amountCents: 12000,
    type: 'EAD',
    paymentMethod: 'Cartão',
    bvsStatus: 'NÃO INFORMADO',
    releaseStatus: 'SIM', // Deve ir para Boas-vindas Pendentes!
    referenceMonth: '2026-07',
    redirectUrl: 'https://wa.me/5511966665555?text=Olá%20Camila,%20seja%20bem-vinda!',
    isDbDuplicate: false,
    isInternalDuplicate: false,
    auditLogs: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-enroll-4',
    studentName: 'Daniel Oliveira Santos',
    cpf: '78912345688',
    phone: '11955554444',
    courseName: 'Análise e Desenvolvimento de Sistemas',
    institution: 'UniFecaf',
    sellerName: 'Bia',
    amountCents: 18000,
    type: 'EAD',
    paymentMethod: 'Pix',
    bvsStatus: 'NÃO',
    releaseStatus: 'NÃO', // Não vai para fila
    referenceMonth: '2026-07',
    redirectUrl: 'https://wa.me/5511955554444?text=Olá%20Daniel,%20seja%20bem-vindo!',
    isDbDuplicate: false,
    isInternalDuplicate: false,
    auditLogs: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-enroll-5',
    studentName: 'Eduarda Costa Nunes',
    cpf: '23456789012',
    phone: '11944443333',
    courseName: 'Psicologia',
    institution: 'UniFacvest',
    sellerName: 'Nayara',
    amountCents: 25000,
    type: 'Presencial',
    paymentMethod: 'Boleto',
    bvsStatus: 'SIM',
    releaseStatus: 'SIM',
    referenceMonth: '2026-06',
    redirectUrl: 'https://wa.me/5511944443333?text=Olá%20Eduarda,%20seja%20bem-vinda!',
    isDbDuplicate: false,
    isInternalDuplicate: false,
    auditLogs: [],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];

/**
 * Inicializa o LocalStorage com os dados mock se não existirem
 */
export function initDemoStore() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(MONTHS_KEY)) {
    localStorage.setItem(MONTHS_KEY, JSON.stringify(INITIAL_MONTHS));
  }
  if (!localStorage.getItem(ENROLLMENTS_KEY)) {
    localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(INITIAL_ENROLLMENTS));
  }
  if (!localStorage.getItem(BATCHES_KEY)) {
    localStorage.setItem(BATCHES_KEY, JSON.stringify([]));
  }
}

/**
 * Obter meses disponíveis
 */
export function demoGetAvailableMonths(): string[] {
  initDemoStore();
  const raw = localStorage.getItem(MONTHS_KEY);
  return raw ? JSON.parse(raw) : INITIAL_MONTHS;
}

/**
 * Obter lista de matrículas por período
 */
export function demoGetEnrollmentsList(month: string): EnrollmentItem[] {
  initDemoStore();
  const raw = localStorage.getItem(ENROLLMENTS_KEY);
  if (!raw) return [];
  const list: EnrollmentItem[] = JSON.parse(raw);
  return list
    .filter((e) => e.referenceMonth === month)
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
}

/**
 * Atualizar matrícula e gravar log de auditoria local
 */
export function demoUpdateEnrollmentFields(
  id: string,
  fields: Partial<EnrollmentItem>
): EnrollmentItem {
  initDemoStore();
  const raw = localStorage.getItem(ENROLLMENTS_KEY);
  if (!raw) throw new Error('Dados não inicializados.');

  const list: EnrollmentItem[] = JSON.parse(raw);
  const idx = list.findIndex((e) => e.id === id);
  if (idx === -1) throw new Error('Matrícula não encontrada.');

  const original = list[idx];
  const updatedLogs = [...(original.auditLogs || [])];

  // Identifica alterações e gera logs
  Object.entries(fields).forEach(([key, value]) => {
    const origVal = original[key as keyof EnrollmentItem];
    if (origVal !== value) {
      updatedLogs.push({
        field: key,
        oldValue: origVal as string | number,
        newValue: value as string | number,
        timestamp: new Date().toISOString(),
        updatedBy: 'demo-user-123',
        updatedByName: 'Demonstração Local (Gestão)'
      });
    }
  });

  const updatedItem: EnrollmentItem = {
    ...original,
    ...fields,
    auditLogs: updatedLogs
  };

  list[idx] = updatedItem;
  localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(list));
  return updatedItem;
}

/**
 * Carregar fila do BVS (Relacionamento)
 */
export function demoGetBvsQueue(month: string): { pending: BvsQueueItem[]; sent: BvsQueueItem[] } {
  const enrollments = demoGetEnrollmentsList(month);

  const pending = enrollments
    .filter((e) => e.releaseStatus === 'SIM' && (e.bvsStatus === 'NÃO' || e.bvsStatus === 'NÃO INFORMADO'))
    .map((e) => ({
      id: e.id,
      studentName: e.studentName,
      courseName: e.courseName,
      institution: e.institution,
      sellerName: e.sellerName,
      phone: e.phone,
      redirectUrl: e.redirectUrl,
      bvsStatus: e.bvsStatus,
      releaseStatus: e.releaseStatus,
      createdAt: e.createdAt || ''
    }));

  const sent = enrollments
    .filter((e) => e.releaseStatus === 'SIM' && e.bvsStatus === 'SIM')
    .map((e) => ({
      id: e.id,
      studentName: e.studentName,
      courseName: e.courseName,
      institution: e.institution,
      sellerName: e.sellerName,
      phone: e.phone,
      redirectUrl: e.redirectUrl,
      bvsStatus: e.bvsStatus,
      releaseStatus: e.releaseStatus,
      createdAt: e.createdAt || ''
    }));

  return { pending, sent };
}

/**
 * Atualizar status de boas-vindas na fila
 */
export function demoUpdateBvsStatus(id: string, status: 'SIM' | 'NÃO' | 'NÃO INFORMADO'): EnrollmentItem {
  return demoUpdateEnrollmentFields(id, { bvsStatus: status });
}

/**
 * Confirmar Importação de planilha de demonstração
 */
export function demoConfirmImport(month: string, rows: Omit<EnrollmentItem, 'id' | 'createdAt' | 'auditLogs'>[]): {
  importId: string;
  insertedCount: number;
} {
  initDemoStore();
  const rawEnrollments = localStorage.getItem(ENROLLMENTS_KEY);
  const enrollments: EnrollmentItem[] = rawEnrollments ? JSON.parse(rawEnrollments) : [];
  
  const rawMonths = localStorage.getItem(MONTHS_KEY);
  const months: string[] = rawMonths ? JSON.parse(rawMonths) : [];

  const importId = `demo-batch-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Normaliza e grava cada matrícula
  let inserted = 0;
  rows.forEach((row, i) => {
    // Evita duplicidades locais exatas no lote
    const isDuplicate = enrollments.some(
      (e) =>
        e.referenceMonth === month &&
        e.cpf === row.cpf &&
        e.courseName.toLowerCase() === row.courseName.toLowerCase() &&
        e.institution.toLowerCase() === row.institution.toLowerCase()
    );

    const newEnrollment: EnrollmentItem = {
      ...row,
      id: `demo-enroll-${importId}-${i}`,
      bvsStatus: row.bvsStatus || 'NÃO INFORMADO',
      releaseStatus: row.releaseStatus || 'NÃO INFORMADO',
      isDbDuplicate: isDuplicate,
      isInternalDuplicate: false,
      auditLogs: [],
      createdAt: new Date().toISOString()
    };

    enrollments.push(newEnrollment);
    inserted++;
  });

  // Atualiza meses disponíveis se for novo
  if (!months.includes(month)) {
    months.push(month);
    months.sort((a, b) => b.localeCompare(a));
    localStorage.setItem(MONTHS_KEY, JSON.stringify(months));
  }

  localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(enrollments));

  // Grava o histórico de lote
  const rawBatches = localStorage.getItem(BATCHES_KEY);
  const batches: DemoImportBatch[] = rawBatches ? JSON.parse(rawBatches) : [];
  batches.push({
    id: importId,
    referenceMonth: month,
    filename: 'planinha_demonstracao.xlsx',
    insertedCount: inserted,
    createdAt: new Date().toISOString(),
    createdBy: 'Demonstração Local'
  });
  localStorage.setItem(BATCHES_KEY, JSON.stringify(batches));

  return {
    importId,
    insertedCount: inserted
  };
}

/**
 * Calcular estatísticas para o Dashboard
 */
export interface DemoDashboardStats {
  period: string;
  totalEnrollments: number;
  validEnrollments: number;
  invalidEnrollments: number;
  totalRevenueCents: number;
  validRevenueCents: number;
  goalRevenueCents: number;
  percentageOfGoal: number;
  byInstitution: { name: string; count: number; revenueCents: number }[];
  sellersRanking: { name: string; count: number; revenueCents: number }[];
}

export function demoGetDashboardStats(month: string): DemoDashboardStats {
  const enrollments = demoGetEnrollmentsList(month);

  const totalEnrollments = enrollments.length;
  // Regra de matrícula válida: não pode ser duplicidade no banco nem interna
  const validList = enrollments.filter((e) => !e.isDbDuplicate && !e.isInternalDuplicate);
  const validEnrollments = validList.length;
  const invalidEnrollments = totalEnrollments - validEnrollments;

  const totalRevenueCents = enrollments.reduce((sum, e) => sum + e.amountCents, 0);
  const validRevenueCents = validList.reduce((sum, e) => sum + e.amountCents, 0);

  // Meta fictícia: R$ 30.000,00 (3000000 cents)
  const goalRevenueCents = 3000000;
  const percentageOfGoal = goalRevenueCents > 0 ? (validRevenueCents / goalRevenueCents) * 100 : 0;

  // Agrupamento por instituição
  const instMap: Record<string, { count: number; revenue: number }> = {};
  enrollments.forEach((e) => {
    const inst = e.institution || 'Outros';
    if (!instMap[inst]) instMap[inst] = { count: 0, revenue: 0 };
    instMap[inst].count++;
    instMap[inst].revenue += e.amountCents;
  });
  const byInstitution = Object.entries(instMap).map(([name, data]) => ({
    name,
    count: data.count,
    revenueCents: data.revenue
  }));

  // Ranking de vendedores
  const sellerMap: Record<string, { count: number; revenue: number }> = {};
  validList.forEach((e) => {
    const seller = e.sellerName || 'Desconhecido';
    if (!sellerMap[seller]) sellerMap[seller] = { count: 0, revenue: 0 };
    sellerMap[seller].count++;
    sellerMap[seller].revenue += e.amountCents;
  });
  const sellersRanking = Object.entries(sellerMap)
    .map(([name, data]) => ({
      name,
      count: data.count,
      revenueCents: data.revenue
    }))
    .sort((a, b) => b.revenueCents - a.revenueCents);

  return {
    period: month,
    totalEnrollments,
    validEnrollments,
    invalidEnrollments,
    totalRevenueCents,
    validRevenueCents,
    goalRevenueCents,
    percentageOfGoal,
    byInstitution,
    sellersRanking
  };
}
