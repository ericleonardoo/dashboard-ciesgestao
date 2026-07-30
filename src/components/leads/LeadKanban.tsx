'use client';

import React from 'react';
import { Lead, LeadStatus, isFollowUpOverdue } from '@/lib/validation/lead-schema';
import { User, Phone, BookOpen, Clock, AlertCircle, Edit2, MessageSquare } from 'lucide-react';
import LeadStatusSelect from './LeadStatusSelect';

interface LeadKanbanProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
}

const COLUMNS: { id: LeadStatus; title: string; color: string }[] = [
  { id: 'NEW', title: 'Novo', color: 'border-blue-200 bg-blue-50/40' },
  { id: 'FIRST_CONTACT', title: 'Primeiro Contato', color: 'border-sky-200 bg-sky-50/40' },
  { id: 'IN_SERVICE', title: 'Em Atendimento', color: 'border-indigo-200 bg-indigo-50/40' },
  { id: 'QUALIFIED', title: 'Qualificado', color: 'border-purple-200 bg-purple-50/40' },
  { id: 'PROPOSAL_SENT', title: 'Proposta Enviada', color: 'border-amber-200 bg-amber-50/40' },
  { id: 'NEGOTIATION', title: 'Negociação', color: 'border-orange-200 bg-orange-50/40' },
  { id: 'FOLLOW_UP', title: 'Follow-up', color: 'border-yellow-200 bg-yellow-50/40' },
  { id: 'ENROLLED', title: 'Matriculado', color: 'border-emerald-200 bg-emerald-50/40' },
  { id: 'LOST', title: 'Perdido', color: 'border-red-200 bg-red-50/40' },
  { id: 'NO_RESPONSE', title: 'Sem Retorno', color: 'border-slate-200 bg-slate-50/40' },
];

export default function LeadKanban({ leads, onEdit, onStatusChange }: LeadKanbanProps) {
  const groupedLeads = COLUMNS.reduce((acc, col) => {
    acc[col.id] = leads.filter(l => l.status === col.id);
    return acc;
  }, {} as Record<LeadStatus, Lead[]>);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 min-h-[65vh]">
      {COLUMNS.map((column) => {
        const columnLeads = groupedLeads[column.id] || [];

        return (
          <div key={column.id} className={`w-72 shrink-0 border rounded-2xl flex flex-col ${column.color}`}>
            {/* Header da Coluna */}
            <div className="p-3.5 border-b border-black/5 flex items-center justify-between bg-white/70 backdrop-blur-sm rounded-t-2xl">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">{column.title}</h3>
              <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-full text-xs font-bold text-slate-600 shadow-2xs">
                {columnLeads.length}
              </span>
            </div>

            {/* Cards da Coluna */}
            <div className="p-3 flex-1 overflow-y-auto space-y-3">
              {columnLeads.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-medium">
                  Nenhum lead
                </div>
              ) : (
                columnLeads.map(lead => {
                  const overdue = isFollowUpOverdue(lead);
                  const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, '') : '';
                  const whatsappUrl = cleanPhone ? `https://wa.me/55${cleanPhone}` : null;

                  return (
                    <div 
                      key={lead.id} 
                      className="bg-white border border-slate-200 shadow-sm rounded-xl p-3.5 hover:shadow-md hover:border-slate-300 transition-all group relative"
                    >
                      {/* Status / Alerta Overdue */}
                      {overdue && (
                        <div className="mb-2 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-red-600 shrink-0" />
                          <span>Follow-up Vencido!</span>
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-1.5">
                        <h4 className="font-bold text-sm text-slate-900 truncate pr-2" title={lead.name}>
                          {lead.name}
                        </h4>
                        <button 
                          onClick={() => onEdit(lead)}
                          className="p-1 text-slate-400 hover:text-primary hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Editar Lead"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1 text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{lead.courseInterest}</span>
                        </div>

                        <div className="flex items-center justify-between gap-1 pt-0.5">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{formatPhone(lead.phone)}</span>
                          </div>
                          {whatsappUrl && (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:text-emerald-700 p-0.5"
                              title="Abrir WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>

                        {lead.status === 'LOST' && lead.lossReason && (
                          <div className="mt-2 text-[11px] text-red-600 bg-red-50 p-2 rounded border border-red-100 leading-tight">
                            <span className="font-bold">Motivo:</span> {lead.lossReason}
                          </div>
                        )}
                      </div>

                      {/* Footer do Card */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(lead.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1 uppercase font-bold text-[10px] text-slate-500">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{lead.ownerName || 'Consultor'}</span>
                        </div>
                      </div>

                      {/* Selector Rápido de Estágio no Card */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-slate-400">Estágio:</span>
                        <LeadStatusSelect
                          value={lead.status}
                          onChange={(newStatus) => lead.id && onStatusChange(lead.id, newStatus)}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
