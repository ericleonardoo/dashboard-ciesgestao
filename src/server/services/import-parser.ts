import ExcelJS from 'exceljs';
import { enrollmentRowSchema, NormalizedEnrollmentRow } from '../../lib/validation/enrollment-schema';

export interface RowError {
  row: number;
  errors: string[];
}

export interface ParseResult {
  rows: NormalizedEnrollmentRow[];
  errors: RowError[];
}

// Colunas obrigatórias conforme regras de negócio do AGENTS.md
const EXPECTED_HEADERS = [
  'Aluno',
  'Valor',
  'Tipo',
  'Inst.',
  'Vendedor',
  'BVS?',
  'CPF',
  'Telefone',
  'Redirect',
  'Subiu?',
  'Curso',
  'Pagamento',
];

/**
 * Retorna o valor de texto limpo de uma célula do exceljs, suportando fórmulas e rich text
 */
function getCellText(row: ExcelJS.Row, colIndex: number | undefined): string {
  if (!colIndex) return '';
  const cell = row.getCell(colIndex);
  const val = cell.value;
  
  if (val === null || val === undefined) {
    return '';
  }

  if (typeof val === 'object') {
    // Trata caso seja um hyperlink do Excel (ex: { text: "Link", hyperlink: "http..." })
    if ('text' in val && val.text !== undefined) {
      return String(val.text);
    }
    // Trata caso seja uma fórmula com resultado (ex: { formula: "...", result: 100 })
    if ('result' in val && val.result !== undefined) {
      return String(val.result);
    }
    return JSON.stringify(val);
  }

  return String(val);
}

/**
 * Lê uma planilha a partir de um Buffer e faz a validação e normalização sintática
 */
export async function parseEnrollmentSpreadsheet(fileBuffer: Buffer): Promise<ParseResult> {
  const workbook = new ExcelJS.Workbook();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- exceljs load method expects a specific Buffer instance that mismatches with Node.js Buffer global
  await workbook.xlsx.load(fileBuffer as any);

  const worksheet = workbook.getWorksheet(1);
  if (!worksheet) {
    throw new Error('A planilha está vazia ou não possui abas válidas.');
  }

  // 1. Mapeia as colunas pelo cabeçalho (Linha 1) para tolerar colunas em ordens diferentes
  const headerRow = worksheet.getRow(1);
  const headersMap: Record<string, number> = {};
  
  headerRow.eachCell((cell, colNumber) => {
    const text = cell.value?.toString().trim();
    if (text) {
      // Guarda qual índice da coluna bate com a label esperada
      headersMap[text] = colNumber;
    }
  });

  // Valida se todos os cabeçalhos obrigatórios existem
  const missingHeaders = EXPECTED_HEADERS.filter((h) => !headersMap[h]);
  if (missingHeaders.length > 0) {
    throw new Error(
      `Planilha inválida. Colunas obrigatórias ausentes: ${missingHeaders.join(', ')}.`
    );
  }

  const rows: NormalizedEnrollmentRow[] = [];
  const errors: RowError[] = [];

  // 2. Itera sobre as linhas de dados (A partir da Linha 2)
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Pula cabeçalho

    // Verifica se a linha inteira está vazia (evita computar linhas fantasmas criadas pelo Excel)
    let isRowEmpty = true;
    row.eachCell((cell) => {
      if (cell.value !== null && cell.value !== undefined && cell.value.toString().trim() !== '') {
        isRowEmpty = false;
      }
    });

    if (isRowEmpty) {
      return; // Pula linhas completamente em branco
    }

    // Coleta dados brutos das células usando o mapeamento das colunas
    const rawData = {
      studentName: getCellText(row, headersMap['Aluno']),
      amountCents: getCellText(row, headersMap['Valor']),
      type: getCellText(row, headersMap['Tipo']),
      institution: getCellText(row, headersMap['Inst.']),
      sellerName: getCellText(row, headersMap['Vendedor']),
      bvsStatus: getCellText(row, headersMap['BVS?']),
      cpf: getCellText(row, headersMap['CPF']),
      phone: getCellText(row, headersMap['Telefone']),
      redirectUrl: getCellText(row, headersMap['Redirect']),
      releaseStatus: getCellText(row, headersMap['Subiu?']),
      courseName: getCellText(row, headersMap['Curso']),
      paymentMethod: getCellText(row, headersMap['Pagamento']),
    };

    // 3. Valida a linha com o esquema Zod
    const result = enrollmentRowSchema.safeParse(rawData);

    if (result.success) {
      rows.push(result.data);
    } else {
      // Extrai mensagens amigáveis de validação
      const lineErrors = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
      errors.push({
        row: rowNumber,
        errors: lineErrors,
      });
    }
  });

  return { rows, errors };
}
