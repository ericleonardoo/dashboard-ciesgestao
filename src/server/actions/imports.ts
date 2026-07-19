'use server';

import { requirePermission } from '../../lib/permissions';
import { parseEnrollmentSpreadsheet, RowError } from '../services/import-parser';
import { generateHmacSignature, checkDuplicateEnrollments } from '../services/duplicate-detector';
import { getAdminDb } from '../../lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { getSession } from '../../lib/firebase/auth-session';
import { normalizeReferenceMonth } from '../../lib/validation/enrollment-schema';

export interface ImportPreviewResult {
  success: boolean;
  referenceMonth: string;
  filename: string;
  totalRows: number;
  validRowsCount: number;
  totalAmountCents: number;
  validAmountCents: number;
  errors: RowError[];
  internalDuplicatesCount: number;
  dbDuplicatesCount: number;
  rows: Array<{
    studentName: string;
    amountCents: number;
    type: string;
    institution: string;
    sellerName: string;
    bvsStatus: 'SIM' | 'NÃO' | 'NÃO INFORMADO';
    cpf: string;
    phone: string;
    redirectUrl: string;
    releaseStatus: 'SIM' | 'NÃO' | 'NÃO INFORMADO';
    courseName: string;
    paymentMethod: string;
    duplicateSignature: string;
    isDbDuplicate: boolean;
    isInternalDuplicate: boolean;
  }>;
}

/**
 * Server Action para analisar e validar a planilha enviada, gerando alertas de duplicidades e formatação
 */
export async function validateUpload(formData: FormData): Promise<ImportPreviewResult> {
  // Garante que possui permissão de leitura de importação
  await requirePermission('imports', 'read');

  const file = formData.get('file') as File;
  const rawReferenceMonth = formData.get('referenceMonth') as string;
  const referenceMonth = normalizeReferenceMonth(rawReferenceMonth);

  if (!file || !referenceMonth) {
    throw new Error('Arquivo e mês de referência são obrigatórios.');
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 1. Carrega o arquivo e faz o parse básico Zod das linhas
  const { rows, errors } = await parseEnrollmentSpreadsheet(buffer);

  // 2. Processa duplicidades e calcula faturamento
  const processedRows: ImportPreviewResult['rows'] = [];
  const signatures: string[] = [];
  const signatureCounts: Record<string, number> = {};

  // Calcula assinaturas e identifica duplicidades internas
  const tempRows = rows.map((row) => {
    const signature = generateHmacSignature(row.cpf, row.courseName, row.institution, referenceMonth);
    signatures.push(signature);
    signatureCounts[signature] = (signatureCounts[signature] || 0) + 1;
    
    return {
      ...row,
      duplicateSignature: signature,
      isInternalDuplicate: false,
      isDbDuplicate: false,
    };
  });

  // Marca duplicidades internas (mesmo CPF + Curso no mesmo lote/mês)
  tempRows.forEach((row) => {
    if (signatureCounts[row.duplicateSignature] > 1) {
      row.isInternalDuplicate = true;
    }
  });

  const session = await getSession();
  const isDemo = session?.uid === 'demo-user-gestao';

  // 3. Consulta banco para encontrar quais assinaturas já existem no Firestore
  const dbDuplicates = isDemo ? new Set<string>() : await checkDuplicateEnrollments(signatures);

  let totalAmountCents = 0;
  let validAmountCents = 0;
  let internalDuplicatesCount = 0;
  let dbDuplicatesCount = 0;

  tempRows.forEach((row) => {
    const isDbDuplicate = dbDuplicates.has(row.duplicateSignature);
    
    const processedRow = {
      ...row,
      isDbDuplicate,
      isInternalDuplicate: row.isInternalDuplicate,
    };

    processedRows.push(processedRow);

    // Incrementa estatísticas monetárias
    totalAmountCents += row.amountCents;
    
    if (isDbDuplicate) {
      dbDuplicatesCount++;
    }
    if (row.isInternalDuplicate) {
      internalDuplicatesCount++;
    }

    // Faturamento Válido: Exclui duplicidades estruturais do banco (o faturamento interno duplicado conta uma vez apenas)
    if (!isDbDuplicate) {
      validAmountCents += row.amountCents;
    }
  });

  return {
    success: errors.length === 0, // Sucesso se não há erros estruturais de campos nas linhas
    referenceMonth,
    filename: file.name,
    totalRows: rows.length + errors.length,
    validRowsCount: rows.length,
    totalAmountCents,
    validAmountCents,
    errors,
    internalDuplicatesCount,
    dbDuplicatesCount,
    rows: processedRows,
  };
}

/**
 * Server Action para confirmar e persistir transacionalmente o lote de importação no banco
 */
export async function confirmImport(
  rawReferenceMonth: string,
  filename: string,
  rows: ImportPreviewResult['rows']
) {
  const referenceMonth = normalizeReferenceMonth(rawReferenceMonth);
  // Exige permissão de escrita de importações
  const user = await requirePermission('imports', 'write');

  if (rows.length === 0) {
    throw new Error('Nenhum dado válido para importação.');
  }

  const db = getAdminDb();
  const importId = db.collection('imports').doc().id;

  // 1. Calcula totais financeiros
  let totalAmountCents = 0;
  rows.forEach((row) => {
    totalAmountCents += row.amountCents;
  });

  try {
    // 2. Persiste o lote de importação administrativo
    const importRef = db.collection('imports').doc(importId);
    await importRef.set({
      referenceMonth,
      filename,
      totalRows: rows.length,
      totalAmountCents,
      importedBy: user.uid,
      importedByName: user.name,
      createdAt: FieldValue.serverTimestamp(),
    });

    // 3. Grava as matrículas na coleção /enrollments/ em lotes de 500 (limite de batch do Firestore)
    const BATCH_LIMIT = 500;
    let batch = db.batch();
    let count = 0;

    for (const row of rows) {
      const docId = db.collection('enrollments').doc().id;
      const enrollmentRef = db.collection('enrollments').doc(docId);

      batch.set(enrollmentRef, {
        studentName: row.studentName,
        amountCents: row.amountCents,
        type: row.type,
        institution: row.institution,
        sellerName: row.sellerName,
        bvsStatus: row.bvsStatus,
        cpf: row.cpf, // plain text para visualização do consultor (mascarado em UI se necessário)
        phone: row.phone,
        redirectUrl: row.redirectUrl,
        releaseStatus: row.releaseStatus,
        courseName: row.courseName,
        paymentMethod: row.paymentMethod,
        duplicateSignature: row.duplicateSignature,
        importId, // Vincula ao lote
        referenceMonth,
        isDbDuplicate: row.isDbDuplicate,
        isInternalDuplicate: row.isInternalDuplicate,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        createdBy: user.uid,
      });

      count++;

      // Se atingir o limite, executa e cria outro batch
      if (count % BATCH_LIMIT === 0) {
        await batch.commit();
        batch = db.batch();
      }
    }

    // Executa qualquer alteração pendente no batch final
    if (count % BATCH_LIMIT !== 0) {
      await batch.commit();
    }

    revalidatePath('/importacoes');
    revalidatePath('/matriculas');
    revalidatePath('/');

    return {
      importId,
      insertedCount: count,
    };
  } catch (error) {
    console.error('Erro transacional ao confirmar lote de importação:', error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error('Falha ao persistir importação no banco. Detalhes: ' + message);
  }
}
