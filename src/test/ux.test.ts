import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Skeleton, KpiCardSkeleton, TableSkeleton } from '../components/shared/Skeleton';

describe('UX & A11y Skeletons — Transition Renderings', () => {

  it('deve renderizar o Skeleton de base com classe animate-pulse', () => {
    const html = renderToString(React.createElement(Skeleton, { className: 'h-10 w-10' }));
    
    expect(html).toContain('animate-pulse');
    expect(html).toContain('bg-secondary/40');
    expect(html).toContain('h-10 w-10');
  });

  it('deve renderizar o KpiCardSkeleton sem falhas de estrutura', () => {
    const html = renderToString(React.createElement(KpiCardSkeleton));
    
    expect(html).toContain('bg-card');
    expect(html).toContain('animate-pulse');
    // Verifica a presença de múltiplos skeletons simulados
    const skeletonDivCount = (html.match(/animate-pulse/g) || []).length;
    expect(skeletonDivCount).toBeGreaterThanOrEqual(3);
  });

  it('deve renderizar a TableSkeleton com numero correto de linhas e colunas', () => {
    const rows = 4;
    const columns = 5;
    const html = renderToString(React.createElement(TableSkeleton, { rows, columns }));

    expect(html).toContain('divide-y');
    const skeletonDivCount = (html.match(/animate-pulse/g) || []).length;
    
    // O total de skeletons deve ser: 1 por coluna no header (columns) + (rows * columns) nas linhas
    const expectedCount = columns + (rows * columns);
    expect(skeletonDivCount).toBe(expectedCount);
  });
});
