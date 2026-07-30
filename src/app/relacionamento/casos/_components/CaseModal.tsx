import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { RelationshipCase, CaseCategory, CaseStatus, relationshipCaseSchema } from '@/lib/validation/relationship-case-schema';
import FormSelect from '@/components/shared/FormSelect';

interface CaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: RelationshipCase | null;
  onSave: (data: Omit<RelationshipCase, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
}

export default function CaseModal({ isOpen, onClose, initialData, onSave }: CaseModalProps) {
  const getInitialState = () => {
    if (initialData) {
      return {
        studentName: initialData.studentName,
        studentCpf: initialData.studentCpf,
        category: initialData.category,
        status: initialData.status,
        description: initialData.description,
      };
    }
    return {
      studentName: '',
      studentCpf: '',
      category: 'acesso' as CaseCategory,
      status: 'aberto' as CaseStatus,
      description: '',
    };
  };

  const [formData, setFormData] = useState(getInitialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(getInitialState());
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData?.id]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'studentCpf') {
      const v = value.replace(/\D/g, '');
      let masked = v;
      if (v.length > 9) masked = v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      else if (v.length > 6) masked = v.replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3");
      else if (v.length > 3) masked = v.replace(/(\d{3})(\d{3})/, "$1.$2");
      setFormData(prev => ({ ...prev, [name]: masked.substring(0, 14) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      relationshipCaseSchema.parse(formData);
      
      const success = await onSave(formData);
      if (success) {
        onClose();
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errors' in err && Array.isArray((err as { errors: unknown[] }).errors)) {
        const newErrors: Record<string, string> = {};
        const zErrors = (err as { errors: Array<{ path?: Array<string | number>; message: string }> }).errors;
        zErrors.forEach((error) => {
          if (error.path && error.path[0]) {
            newErrors[error.path[0].toString()] = error.message;
          }
        });
        setErrors(newErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background rounded-2xl shadow-xl w-full max-w-xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 lg:p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {initialData ? 'Editar Caso' : 'Novo Caso Crítico'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {initialData ? 'Atualize as informações e o status do caso.' : 'Registre um aluno que precisa de atenção especial.'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 lg:p-6 overflow-y-auto">
          <form id="caseForm" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nome do Aluno *</label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${errors.studentName ? 'border-destructive' : 'border-border'}`}
                  placeholder="Nome completo"
                />
                {errors.studentName && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.studentName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">CPF *</label>
                <input
                  type="text"
                  name="studentCpf"
                  value={formData.studentCpf}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${errors.studentCpf ? 'border-destructive' : 'border-border'}`}
                  placeholder="000.000.000-00"
                />
                {errors.studentCpf && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.studentCpf}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Categoria *</label>
                <FormSelect
                  value={formData.category}
                  onChange={(v) => {
                    setFormData(prev => ({ ...prev, category: v as CaseCategory }));
                    if (errors.category) setErrors(prev => ({ ...prev, category: '' }));
                  }}
                  options={[
                    { value: 'acesso', label: 'Problema de Acesso (AVA/Portal)' },
                    { value: 'financeiro', label: 'Problema Financeiro / Boleto' },
                    { value: 'evasao', label: 'Risco de Evasão / Desistência' },
                    { value: 'outro', label: 'Outro' },
                  ]}
                />
                {errors.category && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Status *</label>
                <FormSelect
                  value={formData.status}
                  onChange={(v) => {
                    setFormData(prev => ({ ...prev, status: v as CaseStatus }));
                    if (errors.status) setErrors(prev => ({ ...prev, status: '' }));
                  }}
                  options={[
                    { value: 'aberto', label: 'Aberto' },
                    { value: 'em_tratativa', label: 'Em Tratativa' },
                    { value: 'resolvido', label: 'Resolvido' },
                  ]}
                />
                {errors.status && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.status}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Descrição do Caso *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors resize-none ${errors.description ? 'border-destructive' : 'border-border'}`}
                placeholder="Descreva o problema do aluno com o máximo de detalhes possível..."
              />
              {errors.description && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.description}</p>}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-5 lg:p-6 border-t border-border bg-secondary/30 rounded-b-2xl flex justify-end gap-3 mt-auto">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="caseForm"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {initialData ? 'Atualizar Caso' : 'Criar Caso'}
          </button>
        </div>

      </div>
    </div>
  );
}
