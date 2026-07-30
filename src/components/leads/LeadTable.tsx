'use client';

import React from 'react';
import { Lead, LeadStatus, LEAD_STATUS_LABELS, isFollowUpOverdue } from '@/lib/validation/lead-schema';
import { Edit2, MessageSquare, AlertCircle, Calendar } from 'lucide-react';
import LeadStatusSelect from './LeadStatusSelect';

interface LeadTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
}

export default function LeadTable({ leads, onEdit, onStatusChange }: LeadTableProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  if (leads.length === 0) {
    return (
      <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
        <p className="text-slate-500 font-medium">Nenhum lead encontrado com os filtros atuais.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-4 py-3.5">Criado Em</th>
              <th className="px-4 py-3.5">Nome do Lead</th>
              <th className="px-4 py-3.5">Curso / Polo</th>
              <th className="px-4 py-3.5">Consultor</th>
              <th className="px-4 py-3.5">Origem</th>
              <th className="px-4 py-3.5">Próximo Contato</th>
              <th className="px-4 py-3.5">Estágio</th>
              <th className="px-4 py-3.5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => {
              const overdue = isFollowUpOverdue(lead);
              const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, '') : '';
              const whatsappUrl = cleanPhone ? `https://wa.me/55${cleanPhone}` : null;
              return (
                <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 text-slate-500 text-xs">{formatDate(lead.createdAt)}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900">{lead.name}</div>
                    <div className="text-xs text-slate-500">{formatPhone(lead.phone)}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-800 text-xs">{lead.courseInterest}</div>
                    <div className="text-[11px] text-slate-400 font-medium">{lead.institutionInterest} • {lead.modality}</div>
                  </td>
                  <td className="px-4 py-3.5 text-xs font-medium text-slate-700">
                    {lead.ownerName || lead.ownerId || 'Não atribuído'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                      {lead.source}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {lead.nextContactAt ? (
                      <div className={`flex items-center space-x-1 text-xs font-bold ${
                        overdue ? 'text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200' : 'text-slate-700'
                      }`}>
                        {overdue ? <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" /> : <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                        <span>{formatDate(lead.nextContactAt)}</span>
                        {overdue && <span className="text-[10px] uppercase tracking-wider ml-1 font-black">Vencido</span>}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <LeadStatusSelect
                      value={lead.status}
                      onChange={(newStatus) => lead.id && onStatusChange(lead.id, newStatus)}
                      statusColors={{
                        NEW: LEAD_STATUS_LABELS.NEW.color,
                        FIRST_CONTACT: LEAD_STATUS_LABELS.FIRST_CONTACT.color,
                        IN_SERVICE: LEAD_STATUS_LABELS.IN_SERVICE.color,
                        QUALIFIED: LEAD_STATUS_LABELS.QUALIFIED.color,
                        PROPOSAL_SENT: LEAD_STATUS_LABELS.PROPOSAL_SENT.color,
                        NEGOTIATION: LEAD_STATUS_LABELS.NEGOTIATION.color,
                        FOLLOW_UP: LEAD_STATUS_LABELS.FOLLOW_UP.color,
                        ENROLLED: LEAD_STATUS_LABELS.ENROLLED.color,
                        LOST: LEAD_STATUS_LABELS.LOST.color,
                        NO_RESPONSE: LEAD_STATUS_LABELS.NO_RESPONSE.color,
                      }}
                    />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Abrir WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => onEdit(lead)}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                        title="Editar Lead"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
