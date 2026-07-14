import React from 'react';

/**
 * Esqueleto genérico retangular animado
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-secondary/40 animate-pulse rounded-md ${className}`}
      {...props}
    />
  );
}

/**
 * Esqueleto simulando um Card de KPI financeiro
 */
export function KpiCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-3.5 w-32" />
      </div>
    </div>
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

/**
 * Esqueleto simulando uma tabela completa de matrículas/relacionamento
 */
export function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="w-full space-y-4">
      {/* Cabeçalho da tabela */}
      <div className="flex items-center space-x-4 pb-2 border-b border-border/80">
        {Array.from({ length: columns }).map((_, colIdx) => (
          <Skeleton 
            key={colIdx} 
            className={`h-4.5 ${
              colIdx === 0 ? 'w-1/4' : colIdx === columns - 1 ? 'w-1/6 ml-auto' : 'w-1/6'
            }`} 
          />
        ))}
      </div>
      {/* Linhas da tabela */}
      <div className="divide-y divide-border/50">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex items-center space-x-4 py-4">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <Skeleton 
                key={colIdx} 
                className={`h-4 ${
                  colIdx === 0 ? 'w-1/3' : colIdx === columns - 1 ? 'w-20 ml-auto rounded-lg' : 'w-24'
                }`} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
