import React, { useEffect, useMemo, useState } from 'react';
import styles from '../../styles/PortalDashboard.module.css';
import { portais as initialPortais } from '../../data/mockData';
import { fetchPortalDashboardData } from '../../services/portalSplunkService';
import type { FunnelStep, Portal } from '../../types/types';
import {
  actionLabel,
  formatCompactNumber,
  formatPercent,
  formatRisk,
  getStep,
  heatmapByConversion,
  riskBadge,
  scoreColor,
  statusLabel,
} from '../../utils/utils';

type SortKey =
  | 'nome'
  | 'totalInteracoes'
  | 'enviaToken'
  | 'validaToken'
  | 'formalizar'
  | 'healthScore'
  | 'riscoContrato';

type PortalPeriod = 'Hoje' | '7 dias' | '30 dias';

const CIRC = 2 * Math.PI * 15;

const labels = {
  title: 'Gest\u00e3o de portais',
  sourceLive: 'Splunk ao vivo',
  sourceMock: 'dados locais',
  loading: 'carregando',
  exportReport: 'Exportar relat\u00f3rio de portais',
  criticalAlerts: 'Abrir alertas cr\u00edticos',
  dailyTests: 'Testes Di\u00e1rios',
  filterPeriod: 'Filtrar per\u00edodo',
  totalInteractions: 'Total de intera\u00e7\u00f5es',
  formalizations: 'Formaliza\u00e7\u00f5es',
  searchDebt: 'Busca D\u00edvida',
  action: 'A\u00e7\u00e3o',
  interactions: 'intera\u00e7\u00f5es',
  globalActions: 'A\u00e7\u00f5es globais',
  availableFallback: 'Exibindo dados locais para manter a monitoria dispon\u00edvel.',
  occurrences: 'ocorr\u00eancias',
  variation: 'varia\u00e7\u00e3o',
  conversion: 'convers\u00e3o',
};

function stepCell(step: FunnelStep | undefined, labelPrefix: string, isValida = false) {
  if (!step) {
    return {
      element: <div className={styles.heatCell}>Sem dado</div>,
      sortValue: -1,
    };
  }

  const color = heatmapByConversion(step.percentual);
  const perda = color.perda;
  const deltaText = typeof step.delta === 'number' ? `${step.delta > 0 ? '+' : ''}${formatPercent(step.delta)}` : null;
  const aria = isValida
    ? `${labelPrefix}: ${step.volume} ${labels.occurrences}, ${formatPercent(perda ?? 0)} de perda${deltaText ? `, ${labels.variation} de ${deltaText} vs ontem` : ''}`
    : `${labelPrefix}: ${step.volume} ${labels.occurrences}, ${formatPercent(step.percentual)} de ${labels.conversion}`;

  return {
    sortValue: step.percentual,
    element: (
      <div
        className={`${styles.heatCell} ${isValida ? styles.validaCell : ''}`}
        style={{ background: color.bg, color: color.text }}
        aria-label={aria}
        title={aria}
      >
        <span className={styles.heatMain}>{formatCompactNumber(step.volume)}</span>
        <span className={styles.heatSub}>{isValida ? `Perda ${formatPercent(perda ?? 0)}` : formatPercent(step.percentual)}</span>
        {isValida && deltaText ? <span className={styles.delta}>Delta {deltaText}</span> : null}
      </div>
    ),
  };
}

export default function PortalDashboard() {
  const [activeTab, setActiveTab] = useState('Monitoria');
  const [periodo, setPeriodo] = useState<PortalPeriod>('Hoje');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'riscoContrato', dir: 'desc' });
  const [portais, setPortais] = useState<Portal[]>(initialPortais);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'splunk' | 'mock'>('mock');

  const ticketsCount = 12;

  useEffect(() => {
    let active = true;

    async function loadSplunkData() {
      setLoading(true);
      setError('');

      try {
        const data = await fetchPortalDashboardData(periodo);
        if (!active) return;

        setPortais(data.portais.length ? data.portais : initialPortais);
        setUpdatedAt(data.updatedAt);
        setDataSource(data.portais.length ? 'splunk' : 'mock');
      } catch (err) {
        if (!active) return;

        setPortais(initialPortais);
        setUpdatedAt(null);
        setDataSource('mock');
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados do Splunk.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSplunkData();

    return () => {
      active = false;
    };
  }, [periodo]);

  const totalInteracoes = useMemo(
    () => portais.reduce((acc, p) => acc + p.totalInteracoes, 0),
    [portais],
  );
  const errosValidaToken = useMemo(
    () => portais.filter((p) => p.funil.some((s) => s.nome === 'ValidaToken' && s.perdaToken)).length,
    [portais],
  );
  const formalizacoes = useMemo(
    () => portais.reduce((acc, p) => acc + (getStep(p.funil, 'Formalizar')?.volume ?? 0), 0),
    [portais],
  );
  const riscoTotal = useMemo(() => portais.reduce((acc, p) => acc + p.riscoContrato, 0), [portais]);

  const sorted = useMemo(() => {
    const data = [...portais];
    const factor = sort.dir === 'asc' ? 1 : -1;
    return data.sort((a, b) => {
      const value = (portal: Portal): number | string => {
        if (sort.key === 'nome') return portal.nome;
        if (sort.key === 'enviaToken') return getStep(portal.funil, 'EnviaToken')?.percentual ?? -1;
        if (sort.key === 'validaToken') return getStep(portal.funil, 'ValidaToken')?.percentual ?? -1;
        if (sort.key === 'formalizar') return getStep(portal.funil, 'Formalizar')?.percentual ?? -1;
        return portal[sort.key];
      };

      const av = value(a);
      const bv = value(b);
      if (typeof av === 'string' && typeof bv === 'string') return av.localeCompare(bv) * factor;
      return ((Number(av) || 0) - (Number(bv) || 0)) * factor;
    });
  }, [portais, sort]);

  const onSort = (key: SortKey) => {
    setSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc',
    }));
  };

  return (
    <section className={styles.dashboard}>
      <div className={styles.topbar}>
        <div className={styles.titleWrap}>
          <h2>{labels.title}</h2>
          <span className={dataSource === 'splunk' ? styles.live : styles.mockSource}>
            {loading ? labels.loading : dataSource === 'splunk' ? labels.sourceLive : labels.sourceMock}
          </span>
        </div>
        <div>
          <button className={styles.btn} aria-label={labels.exportReport}>Exportar</button>
          <button className={styles.btn} aria-label={labels.criticalAlerts}>Alertas</button>
        </div>
      </div>

      <div className={styles.tabs}>
        {['Monitoria', labels.dailyTests, 'Usabilidade', 'Tickets'].map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
            aria-label={`Abrir aba ${tab}`}
          >
            {tab}
            {tab === 'Tickets' ? <span className={styles.ticketBadge}>{ticketsCount}</span> : null}
          </button>
        ))}
      </div>

      <div className={styles.periods}>
        {(['Hoje', '7 dias', '30 dias'] as const).map((p) => (
          <button
            key={p}
            className={`${styles.pill} ${periodo === p ? styles.pillActive : ''}`}
            onClick={() => setPeriodo(p)}
            aria-label={`${labels.filterPeriod} ${p}`}
          >
            {p}
          </button>
        ))}
      </div>

      {error && (
        <div className={styles.notice} role="status">
          {error} {labels.availableFallback}
        </div>
      )}

      <div className={styles.kpis}>
        <div className={styles.kpi}><div className={styles.kpiLabel}>{labels.totalInteractions}</div><div className={styles.kpiValue}>{formatCompactNumber(totalInteracoes)}</div></div>
        <div className={styles.kpi}><div className={styles.kpiLabel}>Erros Valida Token</div><div className={styles.kpiValue}>{errosValidaToken}</div></div>
        <div className={styles.kpi}><div className={styles.kpiLabel}>{labels.formalizations}</div><div className={styles.kpiValue}>{formatCompactNumber(formalizacoes)}</div></div>
        <div className={styles.kpi}><div className={styles.kpiLabel}>Risco total</div><div className={styles.kpiValue}>{formatRisk(riscoTotal)}</div></div>
      </div>

      <div className={styles.legend}>
        <span className={styles.legendItem}><span className={styles.swatch} style={{ background: '#f0fdf4' }} /> perda &lt; 30%</span>
        <span className={styles.legendItem}><span className={styles.swatch} style={{ background: '#fff7ed' }} /> perda 30-60%</span>
        <span className={styles.legendItem}><span className={styles.swatch} style={{ background: '#fef2f5' }} /> perda 60-90%</span>
        <span className={styles.legendItem}><span className={styles.swatch} style={{ background: '#ffe7ef' }} /> perda &gt; 90%</span>
        <span className={styles.legendItem}><span className={styles.swatch} style={{ background: '#f8fafc' }} /> sem dado</span>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thSortable} onClick={() => onSort('nome')}>Portal</th>
              <th>Busca Cliente</th>
              <th className={styles.thSortable} onClick={() => onSort('enviaToken')}>Envia Token</th>
              <th className={`${styles.thValida} ${styles.thSortable}`} onClick={() => onSort('validaToken')}>Valida Token</th>
              <th>{labels.searchDebt}</th>
              <th>Busca Acordo</th>
              <th className={styles.thSortable} onClick={() => onSort('formalizar')}>Formalizar</th>
              <th className={styles.thSortable} onClick={() => onSort('healthScore')}>Score</th>
              <th className={styles.thSortable} onClick={() => onSort('riscoContrato')}>Risco contrato</th>
              <th>{labels.action}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((portal) => {
              const busca = getStep(portal.funil, 'BuscaCliente');
              const envia = getStep(portal.funil, 'EnviaToken');
              const valida = getStep(portal.funil, 'ValidaToken');
              const divida = getStep(portal.funil, 'BuscaDivida');
              const acordo = getStep(portal.funil, 'BuscaAcordo');
              const formalizar = getStep(portal.funil, 'Formalizar');

              const scoreStroke = scoreColor(portal.healthScore);
              const dashOffset = CIRC * (1 - portal.healthScore / 100);

              const enviaCell = stepCell(envia, 'Envia Token');
              const validaCell = stepCell(valida, 'Valida Token', true);
              const dividaCell = stepCell(divida, labels.searchDebt);
              const acordoCell = stepCell(acordo, 'Busca Acordo');
              const formalizarCell = stepCell(formalizar, 'Formalizar');

              return (
                <tr key={portal.id} className={styles.rowHover}>
                  <td>
                    <div className={styles.portalName}>{portal.nome}</div>
                    <div className={styles.subText}>{formatCompactNumber(portal.totalInteracoes)} {labels.interactions}</div>
                    <div className={styles.subText}>{portal.observacao}</div>
                    <span
                      className={`${styles.badge} ${
                        portal.status === 'alta' ? styles.badgeAlta : portal.status === 'intermediaria' ? styles.badgeIntermediaria : styles.badgeBaixa
                      }`}
                    >
                      {statusLabel(portal.status)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.heatCell} style={{ background: '#f8fafc', color: '#64748b' }}>
                      <span className={styles.heatMain}>{formatCompactNumber(busca?.volume ?? 0)}</span>
                      <span className={styles.heatSub}>base</span>
                    </div>
                  </td>
                  <td>{enviaCell.element}</td>
                  <td>{validaCell.element}</td>
                  <td>{dividaCell.element}</td>
                  <td>{acordoCell.element}</td>
                  <td>{formalizarCell.element}</td>
                  <td>
                    <svg className={styles.scoreRing} viewBox="0 0 40 40" role="img" aria-label={`Health score: ${portal.healthScore} de 100`}>
                      <circle cx="20" cy="20" r="15" stroke="#e2e8f0" strokeWidth="4" fill="none" />
                      <circle
                        cx="20"
                        cy="20"
                        r="15"
                        stroke={scoreStroke}
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={CIRC}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                        transform="rotate(-90 20 20)"
                      />
                      <text x="20" y="24" textAnchor="middle" fontSize="10" fill="#0f172a">{portal.healthScore}</text>
                    </svg>
                  </td>
                  <td>
                    <div className={styles.riskBox}>
                      <strong>{formatRisk(portal.riscoContrato)}</strong>
                      <span className={`${styles.badge} ${portal.alertLevel === 'critico' ? styles.badgeBaixa : portal.alertLevel === 'atencao' ? styles.badgeIntermediaria : styles.badgeAlta}`}>
                        {riskBadge(portal.alertLevel)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <button className={styles.actionBtn} aria-label={`${labels.action} para ${portal.nome}: ${actionLabel(portal.alertLevel)}`}>
                      {actionLabel(portal.alertLevel)}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <small>
          Atualizado em {updatedAt ? new Date(updatedAt).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR')}
        </small>
        <div>
          <button className={styles.btn} aria-label="Aplicar acoes globais">{labels.globalActions}</button>
          <button className={styles.btn} aria-label="Salvar snapshot do dashboard">Salvar snapshot</button>
        </div>
      </div>
    </section>
  );
}

