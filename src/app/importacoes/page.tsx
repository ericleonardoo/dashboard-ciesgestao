'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { validateUpload, confirmImport, ImportPreviewResult } from '@/server/actions/imports';
import { 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  Database,
  ArrowLeft,
  FileUp
} from 'lucide-react';
import MonthPicker from '@/components/shared/MonthPicker';

export default function ImportacoesPage() {
  const [step, setStep] = useState<'upload' | 'preview' | 'success'>('upload');
  const [referenceMonth, setReferenceMonth] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [previewData, setPreviewData] = useState<ImportPreviewResult | null>(null);
  const [successSummary, setSuccessSummary] = useState<{ importId: string; insertedCount: number } | null>(null);

  const formatMoney = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
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
      setError('Por favor, defina o mês de referência e anexe uma planilha.');
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-12">
      
      {/* HEADER WIZARD */}
      <div className="flex flex-col items-center justify-center text-center space-y-3 mb-8">
        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
          <Database className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Importação de Matrículas
        </h1>
        <p className="text-sm text-muted-foreground max-w-lg">
          Processo de ingestão segura de planilhas. O sistema validará duplicidades e inconsistências antes de efetivar qualquer registro no banco.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl flex items-center shadow-sm">
          <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: UPLOAD */}
      {step === 'upload' && (
        <div className="bg-card border border-border shadow-sm rounded-2xl p-6 sm:p-10 transition-all">
          <form onSubmit={handleAnalyze} className="space-y-8">
            
            {/* Input de Data de Referência */}
            <div className="space-y-3 max-w-[280px] mx-auto relative z-20">
              <label htmlFor="referenceMonth" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">
                Mês de Referência da Operação
              </label>
              <MonthPicker 
                value={referenceMonth} 
                onChange={setReferenceMonth} 
                required 
              />
            </div>

            {/* Dropzone Elegante */}
            <div className="relative group">
              <div
                className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-primary bg-primary/5 scale-[1.02]' 
                    : 'border-gray-400 bg-secondary/20 hover:bg-secondary/50 hover:border-primary/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 space-y-4">
                  <div className={`p-4 rounded-full transition-colors ${dragActive ? 'bg-primary text-primary-foreground' : 'bg-background border border-border text-muted-foreground group-hover:text-primary'}`}>
                    <FileUp className="w-8 h-8" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {file ? <span className="text-primary">{file.name}</span> : 'Clique para buscar ou arraste sua planilha aqui'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Apenas arquivos <span className="font-semibold text-foreground">.xlsx</span> são suportados.
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  accept=".xlsx, .xls"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                type="submit"
                disabled={loading || !file || !referenceMonth}
                className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-sm font-bold rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analisando Arquivo...
                  </span>
                ) : (
                  <>
                    Analisar Dados
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 2: PREVIEW / STAGING */}
      {step === 'preview' && previewData && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm text-center">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Registros Encontrados</p>
              <p className="text-3xl font-extrabold text-foreground">{previewData.totalRows}</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl shadow-sm text-center">
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 mb-1">Linhas Válidas</p>
              <p className="text-3xl font-extrabold text-emerald-700">{previewData.validRowsCount}</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl shadow-sm text-center">
              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600 mb-1">Alertas / Duplicados</p>
              <p className="text-3xl font-extrabold text-amber-700">{previewData.internalDuplicatesCount + previewData.dbDuplicatesCount}</p>
            </div>
          </div>

          <div className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between bg-secondary/30">
              <div>
                <h3 className="text-base font-bold text-foreground">Pré-visualização de Dados</h3>
                <p className="text-xs text-muted-foreground mt-1">Amostra das linhas analisadas. Nenhum dado foi salvo ainda.</p>
              </div>
              <div className="mt-4 sm:mt-0 text-right">
                <span className="block text-xs font-semibold text-muted-foreground">Faturamento Encontrado:</span>
                <span className="text-lg font-extrabold text-foreground">{formatMoney(previewData.totalAmountCents)}</span>
              </div>
            </div>
            
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary/50 sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Aluno / CPF</th>
                    <th className="px-6 py-4 font-bold">Instituição / Curso</th>
                    <th className="px-6 py-4 font-bold text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {previewData.rows.slice(0, 50).map((row, index) => {
                    const hasError = previewData.errors.some(e => e.row === index + 2);
                    const isDup = row.isDbDuplicate || row.isInternalDuplicate;
                    return (
                      <tr key={index} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {!hasError && !isDup ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                              ✓ Válido
                            </span>
                          ) : hasError ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-red-500/10 text-red-600">
                              ✕ Inválido
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600">
                              ⚠️ Duplicado
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-foreground">{row.studentName || '—'}</div>
                          <div className="text-xs text-muted-foreground">{row.cpf || '—'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-foreground">{row.institution || '—'}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">{row.courseName || '—'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-foreground">
                          {formatMoney(row.amountCents || 0)}
                        </td>
                      </tr>
                    );
                  })}
                  {previewData.rows.length > 50 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground bg-secondary/30">
                        Mostrando apenas 50 registros de {previewData.rows.length}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-5 bg-background border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                onClick={handleReset}
                disabled={loading}
                className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancelar
              </button>
              
              <button
                onClick={handleConfirm}
                disabled={loading || previewData.validRowsCount === 0}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
              >
                {loading ? (
                  'Processando...'
                ) : (
                  <>
                    Confirmar e Importar ({previewData.validRowsCount}) Registros
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: SUCCESS */}
      {step === 'success' && successSummary && (
        <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm animate-fade-in mt-12">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-500/10 mb-6 border-8 border-emerald-500/5">
            <CheckCircle className="h-10 w-10 text-emerald-500" />
          </div>
          
          <h2 className="text-2xl font-extrabold text-foreground mb-2">Importação Concluída!</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Os dados foram persistidos no banco com sucesso e os indicadores já foram atualizados.
          </p>
          
          <div className="bg-secondary/30 rounded-2xl p-6 mb-8 text-left border border-border">
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Registros Inseridos</span>
              <span className="text-sm font-bold text-foreground">{successSummary.insertedCount}</span>
            </div>
            <div className="flex justify-between py-2 pt-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase">ID do Lote (Auditoria)</span>
              <span className="text-[10px] font-mono text-muted-foreground">{successSummary.importId}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleReset}
              className="inline-flex justify-center px-6 py-3 border border-border bg-background text-foreground text-sm font-bold rounded-xl hover:bg-secondary transition-colors"
            >
              Nova Importação
            </button>
            <Link
              href="/"
              className="inline-flex justify-center px-6 py-3 border border-transparent text-primary-foreground bg-primary text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-md"
            >
              Ir para o Dashboard
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
