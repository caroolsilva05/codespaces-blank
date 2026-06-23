import type { AlertLevel, ConversionStatus, FunnelStep, Portal } from '../types/types';

type PortalPeriod = 'Hoje' | '7 dias' | '30 dias';

interface SplunkPortalRow {
  Canal_Unificado: string;
  total?: string | number;
  risco_contrato?: string | number;
  BuscaCliente?: string | number;
  EnviaToken?: string | number;
  ValidaToken?: string | number;
  BuscaCredor?: string | number;
  BuscaDivida?: string | number;
  BuscaAcordo?: string | number;
  BuscaOpcaoPagamento?: string | number;
  FormalizarAcordo?: string | number;
}

interface SplunkPortalResponse {
  period: PortalPeriod;
  updatedAt: string;
  rows: SplunkPortalRow[];
}

export interface PortalDashboardData {
  period: PortalPeriod;
  updatedAt: string;
  portais: Portal[];
}

function toNumber(value: string | number | undefined): number {
  const parsed = Number(String(value ?? '0').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function pct(value: number, base: number): number {
  return base > 0 ? (value / base) * 100 : 0;
}

function normalizeName(name: string): string {
  return name
    .replace('Bellinati - Portal - ', 'Portal - ')
    .replace('Generico', 'Gen\u00e9rico')
    .replace('Itau', 'Ita\u00fa');
}

function getStatus(score: number): ConversionStatus {
  if (score >= 75) return 'alta';
  if (score >= 45) return 'intermediaria';
  return 'baixa';
}

function getAlertLevel(score: number, perdaToken: number): AlertLevel {
  if (score < 45 || perdaToken >= 70) return 'critico';
  if (score < 75 || perdaToken >= 45) return 'atencao';
  return 'oportunidade';
}

function getObservation(alertLevel: AlertLevel, perdaToken: number): string {
  if (alertLevel === 'critico') return `Perda de token em ${perdaToken.toFixed(1).replace('.', ',')}% - escalar an\u00e1lise`;
  if (alertLevel === 'atencao') return `Convers\u00e3o em aten\u00e7\u00e3o - monitorar Valida Token`;
  return 'Fluxo saud\u00e1vel - acompanhar oportunidade';
}

function buildStep(nome: string, volume: number, percentual: number, perdaToken = false): FunnelStep {
  return {
    nome,
    volume,
    percentual,
    perdaToken,
  };
}

function mapRowToPortal(row: SplunkPortalRow): Portal {
  const buscaCliente = toNumber(row.BuscaCliente);
  const enviaToken = toNumber(row.EnviaToken);
  const validaToken = toNumber(row.ValidaToken);
  const buscaDivida = toNumber(row.BuscaDivida);
  const buscaAcordo = toNumber(row.BuscaAcordo);
  const buscaOpcaoPagamento = toNumber(row.BuscaOpcaoPagamento);
  const formalizarAcordo = toNumber(row.FormalizarAcordo);
  const riscoContrato = toNumber(row.risco_contrato);

  const envioBusca = pct(enviaToken, buscaCliente);
  const validacaoEnvio = pct(validaToken, enviaToken);
  const perdaToken = enviaToken > 0 ? 100 - validacaoEnvio : 100;
  const buscaDividaPct = pct(buscaDivida, validaToken);
  const buscaAcordoPct = pct(buscaAcordo, buscaDivida);
  const formalizarPct = pct(formalizarAcordo, buscaOpcaoPagamento || buscaAcordo);
  const formalizacoesPorMil = buscaCliente > 0 ? (formalizarAcordo / buscaCliente) * 1000 : 0;
  const healthScore = Math.max(0, Math.min(100, Math.round((envioBusca * 0.25) + (validacaoEnvio * 0.35) + (formalizarPct * 0.4))));
  const alertLevel = getAlertLevel(healthScore, perdaToken);

  return {
    id: row.Canal_Unificado.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    nome: normalizeName(row.Canal_Unificado),
    status: getStatus(healthScore),
    healthScore,
    totalInteracoes: buscaCliente,
    riscoContrato,
    alertLevel,
    observacao: getObservation(alertLevel, perdaToken),
    funil: [
      buildStep('BuscaCliente', buscaCliente, 100),
      buildStep('EnviaToken', enviaToken, envioBusca),
      buildStep('ValidaToken', validaToken, validacaoEnvio, true),
      buildStep('BuscaDivida', buscaDivida, buscaDividaPct),
      buildStep('BuscaAcordo', buscaAcordo, buscaAcordoPct),
      buildStep('Formalizar', formalizarAcordo, formalizarPct),
    ],
    percentuais: {
      envioBusca,
      validacaoEnvio,
      perdaToken,
      formalizarOpcao: formalizarPct,
      formalizacoesPorMil,
    },
  };
}

function parseApiResponse(text: string): SplunkPortalResponse | { error?: string; details?: string } | null {
  if (!text.trim()) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function isApiError(payload: SplunkPortalResponse | { error?: string; details?: string }): payload is {
  error?: string;
  details?: string;
} {
  return 'error' in payload || 'details' in payload;
}

export async function fetchPortalDashboardData(period: PortalPeriod): Promise<PortalDashboardData> {
  const response = await fetch(`/api/splunk-portals?period=${encodeURIComponent(period)}`);
  const text = await response.text();
  const payload = parseApiResponse(text);

  if (!payload) {
    throw new Error(
      'API local do Splunk indispon\u00edvel. Verifique se o backend Express esta ativo e se /api/splunk-portals responde.',
    );
  }

  if (!response.ok) {
    const detail = isApiError(payload) && payload.details ? ` ${payload.details}` : '';
    const message = isApiError(payload) && payload.error ? payload.error : 'Erro ao carregar dados do Splunk.';
    throw new Error(`${message}${detail}`);
  }

  const data = payload as SplunkPortalResponse;
  const rows = Array.isArray(data.rows) ? data.rows : [];

  return {
    period: data.period || period,
    updatedAt: data.updatedAt || new Date().toISOString(),
    portais: rows.map(mapRowToPortal),
  };
}
