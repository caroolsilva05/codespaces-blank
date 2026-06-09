import type { AlertLevel, ConversionStatus, FunnelStep } from '../types/types';

export const STEPS = ['BuscaCliente', 'EnviaToken', 'ValidaToken', 'BuscaDivida', 'BuscaAcordo', 'Formalizar'] as const;

export function formatPercent(value: number): string {
  return `${value.toFixed(1).replace('.', ',')}%`;
}

export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.', ',')}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace('.', ',')}k`;
  return value.toLocaleString('pt-BR');
}

export function formatRisk(value: number): string {
  if (value >= 1_000_000_000_000) return `R$ ${(value / 1_000_000_000_000).toFixed(2).replace('.', ',')}T`;
  if (value >= 1_000_000_000) return `R$ ${(value / 1_000_000_000).toFixed(2).replace('.', ',')}B`;
  return `R$ ${(value / 1_000_000).toFixed(2).replace('.', ',')}M`;
}

export function statusLabel(status: ConversionStatus): string {
  if (status === 'alta') return 'Conversão alta';
  if (status === 'intermediaria') return 'Conversão intermediária';
  return 'Conversão baixa';
}

export function actionLabel(alertLevel: AlertLevel): string {
  if (alertLevel === 'critico') return 'Escalar';
  if (alertLevel === 'atencao') return 'Monitorar';
  return 'Otimizar';
}

export function riskBadge(alertLevel: AlertLevel): string {
  if (alertLevel === 'critico') return 'CRÍTICO';
  if (alertLevel === 'atencao') return 'ATENÇÃO';
  return 'OPORTUNIDADE';
}

export function getStep(portalSteps: FunnelStep[], stepName: string): FunnelStep | undefined {
  return portalSteps.find((step) => step.nome === stepName);
}

export function heatmapByConversion(percentual?: number): { bg: string; text: string; perda: number | null; tone: string } {
  if (percentual === undefined || percentual === null || Number.isNaN(percentual)) {
    return { bg: '#f8fafc', text: '#64748b', perda: null, tone: 'neutral' };
  }

  const perda = 100 - percentual;
  if (perda < 30) return { bg: '#f0fdf4', text: '#166534', perda, tone: 'healthy' };
  if (perda <= 60) return { bg: '#fff7ed', text: '#9a3412', perda, tone: 'warning' };
  if (perda <= 90) return { bg: '#fef2f5', text: '#9f1239', perda, tone: 'critical' };
  return { bg: '#ffe7ef', text: '#9f1239', perda, tone: 'collapse' };
}

export function scoreColor(score: number): string {
  if (score < 40) return '#e11d48';
  if (score < 70) return '#d97706';
  return '#16a34a';
}



