'use client';

import React, { useState } from 'react';
import { createColaborador } from '@/server/actions/users';

const AREAS_DISPONIVEIS = [
  { id: 'gestao', name: 'Gestão / Coordenação' },
  { id: 'relacionamento', name: 'Relacionamento com o Aluno' },
  { id: 'administrativo', name: 'Administrativo' },
  { id: 'comercial', name: 'Comercial' },
  { id: 'marketing', name: 'Marketing' },
];

export default function CreateColaboradorForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [areas, setAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ email: string; pass: string } | null>(null);

  const handleAreaChange = (areaId: string) => {
    if (areas.includes(areaId)) {
      setAreas(areas.filter((id) => id !== areaId));
    } else {
      setAreas([...areas, areaId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessData(null);

    if (areas.length === 0) {
      setError('Selecione pelo menos uma área de atuação.');
      setLoading(false);
      return;
    }

    try {
      const result = await createColaborador({ email, name, areas });
      
      setSuccessData({
        email,
        pass: result.temporaryPassword,
      });

      // Limpa formulário
      setName('');
      setEmail('');
      setAreas([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao cadastrar colaborador.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Novo Colaborador</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Crie contas individuais de acesso administrativo para a equipe.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-2.5 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {successData && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-4 rounded-lg space-y-2">
          <p className="font-bold">🎉 Colaborador criado com sucesso!</p>
          <p className="text-xs text-muted-foreground">
            Copie a senha temporária abaixo. Ela não será exibida novamente:
          </p>
          <div className="bg-background/50 border border-border p-2.5 rounded font-mono text-center flex flex-col space-y-1">
            <span className="text-xs text-muted-foreground">Senha para {successData.email}:</span>
            <span className="text-base font-extrabold select-all tracking-wider text-foreground">{successData.pass}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="colab-name" className="text-xs font-semibold text-muted-foreground block mb-1.5">
            Nome Completo
          </label>
          <input
            id="colab-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-border bg-background placeholder-muted-foreground text-foreground focus:outline-none focus:ring-violet-500 focus:border-violet-500 text-sm"
            placeholder="Ana Silva"
          />
        </div>

        <div>
          <label htmlFor="colab-email" className="text-xs font-semibold text-muted-foreground block mb-1.5">
            E-mail
          </label>
          <input
            id="colab-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-border bg-background placeholder-muted-foreground text-foreground focus:outline-none focus:ring-violet-500 focus:border-violet-500 text-sm"
            placeholder="ana.silva@ciesmg.com.br"
          />
        </div>

        <div>
          <span className="text-xs font-semibold text-muted-foreground block mb-2">
            Áreas de Atuação (Permissões de Escopo)
          </span>
          <div className="space-y-2">
            {AREAS_DISPONIVEIS.map((area) => (
              <label key={area.id} className="flex items-center space-x-3 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={areas.includes(area.id)}
                  onChange={() => handleAreaChange(area.id)}
                  disabled={loading}
                  className="rounded border-border text-primary focus:ring-violet-500 h-4 w-4 bg-background"
                />
                <span className="text-foreground">{area.name}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-bold rounded-lg text-primary-foreground bg-primary hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Cadastrando...' : 'Cadastrar Colaborador'}
        </button>
      </form>
    </div>
  );
}
