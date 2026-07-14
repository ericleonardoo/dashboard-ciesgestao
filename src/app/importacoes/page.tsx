'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { validateUpload, confirmImport, ImportPreviewResult } from '@/server/actions/imports';
import { 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  FileSpreadsheet, 
  Coins, 
  TrendingUp, 
  ArrowRight,
  Database
} from 'lucide-react';
import { TableSkeleton } from '../../components/shared/Skeleton';

export default function ImportacoesPage() {
  const [step, setStep] = useState<'upload' | 'preview' | 'success'>('upload');
  const [referenceMonth, setReferenceMonth] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dados de staging carregados da Server Action
  const [previewData, setPreviewData] = useState<ImportPreviewResult | null>(null);
  const [successSummary, setSuccessSummary] = useState<{ importId: string; insertedCount: number } | null>(null);

  // Formata centavos inteiros para exibição de moeda em BRL
  const formatMoney = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.xlsx')) {
        setFile(droppedFile);
      } else {
        setError('Por favor, envie apenas arquivos de planilha Excel (.xlsx).');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !referenceMonth) {
      setError('Selecione o mês de referência e carregue a planilha.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('referenceMonth', referenceMonth);

      const result = await validateUpload(formData);
      setPreviewData(result);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar arquivo.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!previewData) return;
    
    setLoading(true);
    setError(null);

    try {
      const isDemo = typeof window !== 'undefined' && localStorage.getItem('cies_demo_mode') === 'true';
      if (isDemo) {
        const { demoConfirmImport } = await import('@/lib/demo-store');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const summary = demoConfirmImport(previewData.referenceMonth, previewData.rows as any);
        setSuccessSummary({
          importId: summary.importId,
          insertedCount: summary.insertedCount,
        });
        setStep('success');
        return;
      }

      const summary = await confirmImport(
        previewData.referenceMonth,
        previewData.filename,
        previewData.rows
      );

      setSuccessSummary(summary);
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao persistir importação.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setReferenceMonth('');
    setPreviewData(null);
    setSuccessSummary(null);
    setError(null);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Título de Seção */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Importações & Staging
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Envie e analise as planilhas de matrículas da equipe de vendas de forma segura.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg flex items-center space-x-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Passo 1: UPLOAD */}
      {step === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-8 shadow-sm">
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">
                  1. Mês de Referência da Operação
                </label>
                <input
                  type="month"
                  required
                  value={referenceMonth}
                  onChange={(e) => setReferenceMonth(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm max-w-xs block w-full transition-all"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  O período define contra qual meta e faturamento do mês essa planilha será consolidada.
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground block mb-3">
                  2. Selecionar Arquivo da Planilha (.xlsx)
                </label>
                
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-all ${
                    dragActive 
                      ? 'border-violet-500 bg-violet-500/5' 
                      : 'border-border hover:border-violet-500/50 hover:bg-secondary/20'
                  }`}
                >
                  <input
                    type="file"
                    id="file-upload"
                    accept=".xlsx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="h-10 w-10 text-muted-foreground mb-3 group-hover:text-primary" />
                    <span className="text-sm font-medium text-foreground block">
                      {file ? file.name : 'Arraste o arquivo .xlsx ou clique para navegar'}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      Tamanho máximo suportado: 10MB
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading || !file || !referenceMonth}
                  className="flex items-center space-x-2 py-2 px-6 border border-transparent text-sm font-bold rounded-lg text-primary-foreground bg-primary hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
                      <span>Analisando...</span>
                    </>
                  ) : (
                    <>
                      <span>Analisar Planilha</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-violet-950/20 border border-violet-500/20 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-violet-300 flex items-center space-x-2">
              <FileSpreadsheet className="h-5 w-5" />
              <span>Instruções de Importação</span>
            </h3>
            <div className="text-xs text-violet-400/80 space-y-2 leading-relaxed">
              <p>● A planilha deve seguir os cabeçalhos exatos da planilha histórica (em qualquer ordem).</p>
              <p>● **Colunas Obrigatórias:** Aluno, Valor, Tipo, Inst., Vendedor, BVS?, CPF, Telefone, Redirect, Subiu?, Curso, Pagamento.</p>
              <p>● CPFs e telefones serão automaticamente higienizados removendo pontuações.</p>
              <p>● Linhas com formatação incorreta serão acusadas no staging sem travar a importação das demais.</p>
              <p>● A validação de duplicidade impedirá inserções repetidas de um aluno no mesmo curso/instituição dentro do mesmo mês.</p>
            </div>
          </div>
        </div>
      )}

      {/* Passo 2: PREVIEW / STAGING */}
      {step === 'preview' && previewData && (
        <div className="space-y-8">
          {/* Estatísticas e Resultados do Lote */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-violet-500/10 text-violet-400 rounded-lg">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground block">Matrículas Válidas</span>
                <span className="text-2xl font-bold text-foreground">
                  {previewData.validRowsCount} <span className="text-xs text-muted-foreground font-normal">de {previewData.totalRows} linhas</span>
                </span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-violet-500/10 text-violet-400 rounded-lg">
                <Coins className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground block">Faturamento Bruto</span>
                <span className="text-2xl font-bold text-foreground">
                  {formatMoney(previewData.totalAmountCents)}
                </span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground block">Faturamento Válido</span>
                <span className="text-2xl font-bold text-emerald-400">
                  {formatMoney(previewData.validAmountCents)}
                </span>
              </div>
            </div>
          </div>

          {/* Erros estruturais bloqueantes se existirem */}
          {previewData.errors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 space-y-3">
              <h3 className="text-base font-bold text-destructive flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Erros Estruturais de Validação ({previewData.errors.length})</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Algumas linhas contêm dados inválidos e **não serão importadas**. Corrija o arquivo original ou confirme para importar apenas os dados válidos.
              </p>
              <div className="max-h-48 overflow-y-auto bg-background/50 border border-border rounded-lg p-3 space-y-1.5 font-mono text-xs">
                {previewData.errors.map((err) => (
                  <div key={err.row} className="text-destructive-foreground">
                    Linha {err.row}: {err.errors.join(', ')}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Avisos de duplicidades */}
          {(previewData.dbDuplicatesCount > 0 || previewData.internalDuplicatesCount > 0) && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 space-y-2">
              <h3 className="text-base font-bold text-yellow-500 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Avisos de Duplicidades</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Foram detectadas **{previewData.dbDuplicatesCount}** matrículas já existentes no banco e **{previewData.internalDuplicatesCount}** duplicadas dentro do próprio arquivo para o período {previewData.referenceMonth}. 
                Elas serão importadas, mas estão sinalizadas e foram desconsideradas no cálculo do **Faturamento Válido**.
              </p>
            </div>
          )}

          {/* Tabela de Preview */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col space-y-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Visualização dos Dados</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Revise os dados antes de consolidar no banco. As linhas destacadas contêm alertas.
              </p>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="py-2">
                  <TableSkeleton rows={5} columns={8} />
                </div>
              ) : (
                <table className="min-w-full divide-y divide-border text-xs text-left">
                <thead>
                  <tr className="text-muted-foreground font-semibold border-b border-border">
                    <th className="py-2.5 px-3">Aluno</th>
                    <th className="py-2.5 px-3">CPF</th>
                    <th className="py-2.5 px-3">Curso</th>
                    <th className="py-2.5 px-3">Inst.</th>
                    <th className="py-2.5 px-3">Vendedor</th>
                    <th className="py-2.5 px-3">Valor</th>
                    <th className="py-2.5 px-3">BVS?</th>
                    <th className="py-2.5 px-3">Subiu?</th>
                    <th className="py-2.5 px-3 text-right">Avisos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {previewData.rows.map((row, idx) => {
                    return (
                      <tr 
                        key={idx} 
                        className={`hover:bg-secondary/20 transition-colors ${
                          row.isDbDuplicate 
                            ? 'bg-destructive/5 text-destructive-foreground/90' 
                            : row.isInternalDuplicate 
                              ? 'bg-yellow-500/5 text-yellow-200' 
                              : ''
                        }`}
                      >
                        <td className="py-2 px-3 font-medium">{row.studentName}</td>
                        <td className="py-2 px-3 font-mono">{row.cpf}</td>
                        <td className="py-2 px-3">{row.courseName}</td>
                        <td className="py-2 px-3">{row.institution}</td>
                        <td className="py-2 px-3">{row.sellerName}</td>
                        <td className="py-2 px-3 font-bold">{formatMoney(row.amountCents)}</td>
                        <td className="py-2 px-3">{row.bvsStatus}</td>
                        <td className="py-2 px-3">{row.releaseStatus}</td>
                        <td className="py-2 px-3 text-right">
                          {row.isDbDuplicate && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20">
                              No Banco
                            </span>
                          )}
                          {row.isInternalDuplicate && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 ml-1">
                              No Arquivo
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              )}
            </div>

            {/* Ações Staging */}
            <div className="flex justify-between items-center pt-4 border-t border-border">
              <button
                onClick={handleReset}
                disabled={loading}
                className="py-2 px-4 border border-border text-sm font-semibold rounded-lg text-foreground hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
              >
                Voltar / Cancelar
              </button>

              <button
                onClick={handleConfirm}
                disabled={loading || previewData.validRowsCount === 0}
                className="flex items-center space-x-2 py-2 px-6 border border-transparent text-sm font-bold rounded-lg text-primary-foreground bg-primary hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
                    <span>Gravando no Banco...</span>
                  </>
                ) : (
                  <>
                    <span>Confirmar Importação</span>
                    <CheckCircle className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Passo 3: SUCCESS */}
      {step === 'success' && successSummary && (
        <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl p-8 shadow-sm text-center space-y-6">
          <div className="inline-flex p-4 bg-emerald-500/10 text-emerald-400 rounded-full">
            <CheckCircle className="h-12 w-12" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-foreground">Importação Finalizada!</h2>
            <p className="text-sm text-muted-foreground">
              A planilha foi importada e gravada transacionalmente no Cloud Firestore com sucesso.
            </p>
          </div>

          <div className="bg-background border border-border p-4 rounded-xl space-y-3 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Lote Gerado:</span>
              <span className="font-mono font-bold text-foreground">{successSummary.importId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Matrículas Gravadas:</span>
              <span className="font-bold text-foreground">{successSummary.insertedCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status do Lote:</span>
              <span className="text-emerald-400 font-semibold">Salvo e Ativo</span>
            </div>
          </div>

          <div className="flex justify-center space-x-4 pt-4">
            <button
              onClick={handleReset}
              className="py-2 px-6 border border-border text-sm font-semibold rounded-lg text-foreground hover:bg-secondary transition-colors"
            >
              Importar Nova Planilha
            </button>
            <Link
              href="/"
              className="py-2 px-6 border border-transparent text-sm font-bold rounded-lg text-primary-foreground bg-primary hover:bg-violet-700 transition-colors block text-center"
            >
              Ir para o Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
