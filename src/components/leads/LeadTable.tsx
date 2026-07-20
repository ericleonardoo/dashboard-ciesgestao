'use client';

import React from 'react';
import { Lead, LeadStatus } from '@/lib/validation/lead-schema';
import { Edit2 } from 'lucide-react';
import LeadStatusSelect from './LeadStatusSelect';

interface LeadTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
}

const STATUS_COLORS: Record<LeadStatus, string> = {
  novo: 'bg-blue-100 text-blue-700 border-blue-200',
  em_atendimento: 'bg-amber-100 text-amber-700 border-amber-200',
  matriculado: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  perdido: 'bg-red-100 text-red-700 border-red-200'
};

export default function LeadTable({ leads, onEdit, onStatusChange }: LeadTableProps) {
  
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  if (leads.length === 0) {
    return (
      <div className="text-center py-12 bg-card border border-border rounded-xl">
        <p className="text-muted-foreground">Nenhum lead encontrado com os filtros atuais.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
          <tr>
            <th className="px-4 py-3">Data</th>
            <th className="px-4 py-3">Nome do Lead</th>
            <th className="px-4 py-3">Telefone</th>
            <th className="px-4 py-3">Interesse</th>
            <th className="px-4 py-3">Origem</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-secondary/20 transition-colors">
              <td className="px-4 py-3 text-muted-foreground">{formatDate(lead.createdAt)}</td>
              <td className="px-4 py-3 font-medium text-foreground">{lead.name}</td>
              <td className="px-4 py-3">{formatPhone(lead.phone)}</td>
              <td className="px-4 py-3">{lead.interest}</td>
              <td className="px-4 py-3 uppercase text-xs font-semibold text-muted-foreground">
                {lead.origin.replace('_', ' ')}
              </td>
              <td className="px-4 py-3">
                <LeadStatusSelect
                  value={lead.status}
                  onChange={(newStatus) => onStatusChange(lead.id!, newStatus)}
                  statusColors={STATUS_COLORS}
                />
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onEdit(lead)}
                  className="p-1.5 text-muted-foreground hover:text-primary hover:bg-secondary rounded transition-colors inline-flex items-center"
                  title="Editar Lead"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
