export type ConversionStatus = 'baixa' | 'intermediaria' | 'alta';
export type AlertLevel = 'critico' | 'atencao' | 'oportunidade';

export interface FunnelStep {
  nome: string;
  volume: number;
  percentual: number;
  perdaToken?: boolean;
  delta?: number;
}

export interface Portal {
  id: string;
  nome: string;
  status: ConversionStatus;
  healthScore: number;
  totalInteracoes: number;
  riscoContrato: number;
  funil: FunnelStep[];
  percentuais: {
    envioBusca: number;
    validacaoEnvio: number;
    perdaToken: number;
    formalizarOpcao: number;
    formalizacoesPorMil: number;
  };
  observacao: string;
  alertLevel: AlertLevel;
}

