'use client';

import React from 'react';
import { Lead, LeadStatus } from '@/lib/validation/lead-schema';
import { User, Phone, BookOpen, Clock, AlertCircle, Edit2 } from 'lucide-react';

interface LeadKanbanProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
}

const COLUMNS: { id: LeadStatus; title: string; color: string }[] = [
  { id: 'novo', title: 'Novo', color: 'border-blue-200 bg-blue-50/50' },
  { id: 'em_atendimento', title: 'Em Atendimento', color: 'border-amber-200 bg-amber-50/50' },
  { id: 'matriculado', title: 'Matriculado (Ganho)', color: 'border-emerald-200 bg-emerald-50/50' },
  { id: 'perdido', title: 'Perdido', color: 'border-red-200 bg-red-50/50' }
];

export default function LeadKanban({ leads, onEdit, onStatusChange }: LeadKanbanProps) {
  
  // Agrupar leads por status
  const groupedLeads = COLUMNS.reduce((acc, col) => {
    acc[col.id] = leads.filter(l => l.status === col.id);
    return acc;
  }, {} as Record<LeadStatus, Lead[]>);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[60vh]">
      {COLUMNS.map((column) => (
        <div key={column.id} className={`flex-1 min-w-[250px] shrink-0 border rounded-xl flex flex-col ${column.color}`}>
          {/* Header da Coluna */}
          <div className="p-3 border-b border-black/5 flex items-center justify-between bg-white/50 rounded-t-xl">
            <h3 className="font-semibold text-sm text-foreground">{column.title}</h3>
            <span className="bg-background px-2 py-0.5 rounded-full text-xs font-medium text-muted-foreground shadow-sm">
              {groupedLeads[column.id].length}
            </span>
          </div>

          {/* Cards da Coluna */}
          <div className="p-3 flex-1 overflow-y-auto space-y-3">
            {groupedLeads[column.id].length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground opacity-60">
                Nenhum lead aqui
              </div>
            ) : (
              groupedLeads[column.id].map(lead => (
                <div 
                  key={lead.id} 
                  className="bg-card border border-border shadow-sm rounded-lg p-3 hover:shadow-md hover:border-primary/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm text-foreground truncate pr-2" title={lead.name}>
                      {lead.name}
                    </h4>
                    <button 
                      onClick={() => onEdit(lead)}
                      className="p-1 text-muted-foreground hover:text-primary hover:bg-secondary rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Editar Lead"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span className="truncate">{lead.interest}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      <span className="truncate">{lead.phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}</span>
                    </div>
                    {lead.status === 'perdido' && lead.lossReason && (
                      <div className="flex items-start gap-1.5 mt-2 text-red-600 bg-red-50 p-1.5 rounded border border-red-100">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="line-clamp-2" title={lead.lossReason}>{lead.lossReason}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(lead.createdAt)}
                    </div>
                    <div className="flex items-center gap-1 uppercase font-medium">
                      <User className="w-3 h-3" />
                      {lead.origin.replace('_', ' ')}
                    </div>
                  </div>

                  {/* Botões de Ação Rápida no Kanban */}
                  <div className="mt-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {column.id !== 'novo' && (
                      <button onClick={() => onStatusChange(lead.id!, 'novo')} className="flex-1 text-[10px] py-1 border rounded bg-secondary hover:bg-primary/10 transition-colors">Voltar</button>
                    )}
                    {column.id !== 'em_atendimento' && (
                      <button onClick={() => onStatusChange(lead.id!, 'em_atendimento')} className="flex-1 text-[10px] py-1 border border-amber-200 text-amber-700 rounded bg-amber-50 hover:bg-amber-100 transition-colors">Atender</button>
                    )}
                    {column.id !== 'matriculado' && (
                      <button onClick={() => onStatusChange(lead.id!, 'matriculado')} className="flex-1 text-[10px] py-1 border border-emerald-200 text-emerald-700 rounded bg-emerald-50 hover:bg-emerald-100 transition-colors">Ganho</button>
                    )}
                    {column.id !== 'perdido' && (
                      <button onClick={() => onStatusChange(lead.id!, 'perdido')} className="flex-1 text-[10px] py-1 border border-red-200 text-red-700 rounded bg-red-50 hover:bg-red-100 transition-colors">Perda</button>
                    )}
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      ))}
      <div className="w-1 shrink-0" aria-hidden="true" />
    </div>
  );
}
