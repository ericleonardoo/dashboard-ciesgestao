import { createHmac } from 'crypto';
import { getAdminDb } from '../../lib/firebase/admin';

// Chave padrão para desenvolvimento caso a variável de ambiente não esteja configurada
const HMAC_SECRET = process.env.DUPLICATE_HMAC_SECRET || 'cies-gestao-dev-secret-key-default';

/**
 * Gera a assinatura HMAC sha256 para prevenção de duplicidade
 * A assinatura combina de forma determinística dados sensíveis e normais sem expor o CPF em plain text no banco ou IDs.
 */
export function generateHmacSignature(
  cpf: string,
  courseName: string,
  institution: string,
  referenceMonth: string
): string {
  // Limpa strings para evitar diferenças de caixa alta ou espaços extras
  const cleanCpf = cpf.replace(/\D/g, '');
  const cleanCourse = courseName.trim().toLowerCase();
  const cleanInstitution = institution.trim().toLowerCase();
  const cleanMonth = referenceMonth.trim().toLowerCase(); // ex: "2026-06"

  const dataToSign = `${cleanCpf}:${cleanCourse}:${cleanInstitution}:${cleanMonth}`;

  return createHmac('sha256', HMAC_SECRET)
    .update(dataToSign)
    .digest('hex');
}

/**
 * Consulta o Firestore em lotes para detectar quais assinaturas HMAC informadas já possuem registro no banco.
 * O Firestore possui um limite de 10 elementos na cláusula 'in'. Portanto, dividimos em lotes de 10.
 */
export async function checkDuplicateEnrollments(
  signatures: string[]
): Promise<Set<string>> {
  const duplicates = new Set<string>();
  
  if (signatures.length === 0) {
    return duplicates;
  }

  // Remove assinaturas duplicadas no próprio input para otimizar queries
  const uniqueSignatures = Array.from(new Set(signatures));
  const db = getAdminDb();
  
  // Divide as assinaturas em blocos de no máximo 10 itens (limite da query IN do Firestore)
  const chunkSize = 10;
  const chunks: string[][] = [];
  
  for (let i = 0; i < uniqueSignatures.length; i += chunkSize) {
    chunks.push(uniqueSignatures.slice(i, i + chunkSize));
  }

  try {
    // Executa as queries em paralelo
    const queryPromises = chunks.map((chunk) =>
      db.collection('enrollments')
        .where('duplicateSignature', 'in', chunk)
        .select('duplicateSignature') // Otimiza a leitura trazendo apenas a assinatura
        .get()
    );

    const snapshots = await Promise.all(queryPromises);

    // Adiciona as assinaturas encontradas no Set
    for (const snap of snapshots) {
      snap.docs.forEach((doc) => {
        const sig = doc.data().duplicateSignature;
        if (sig) {
          duplicates.add(sig);
        }
      });
    }
  } catch (error) {
    console.error('Erro ao checar duplicidades no Firestore:', error);
    // Em caso de erro técnico no banco, tratamos como se não houvesse duplicidade externa para não travar a execução,
    // mas logamos o incidente.
  }

  return duplicates;
}
