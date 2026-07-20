import React from 'react';
import { AlertTriangle, X, HelpCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = true,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" 
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        
        {/* Header/Ícone */}
        <div className={`p-6 flex flex-col items-center justify-center text-center ${
          isDestructive ? 'bg-red-50' : 'bg-blue-50'
        }`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            isDestructive ? 'bg-red-100' : 'bg-blue-100'
          }`}>
            {isDestructive ? (
              <AlertTriangle className="w-6 h-6 text-red-600" />
            ) : (
              <HelpCircle className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 mb-1">{title}</h3>
          <p className="text-sm text-slate-600 font-medium px-2">{description}</p>
        </div>

        {/* Botões */}
        <div className="p-4 bg-white flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-colors shadow-sm ${
              isDestructive 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {confirmText}
          </button>
        </div>
        
        {/* Botão de Fechar Superior */}
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-md transition-colors ${
            isDestructive 
              ? 'text-red-400 hover:bg-red-100 hover:text-red-600' 
              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
