import React, { useMemo, useState } from "react";
import { Download, ExternalLink, Filter, Plus, RefreshCw, Search } from "lucide-react";
import {
  marketingChannels,
  marketingPhases,
  marketingWalletGroups,
  marketingWallets,
  providerStatusLabels,
} from "./data/marketingData";
import styles from "./styles/MarketingPage.module.css";

const ALL = "Todos";

function statusClass(status) {
  if (status === "Ok") return styles.statusOk;
  if (status === "Pendente") return styles.statusPendente;
  return styles.statusAtencao;
}

function statusText(status) {
  if (status === "Atencao") return "Atenção";
  return status;
}

function countBy(rows, field, value) {
  return rows.filter((row) => row[field] === value).length;
}

export default function MarketingPage({ C }) {
  const [selectedChannels, setSelectedChannels] = useState([ALL]);
  const [selectedWalletGroup, setSelectedWalletGroup] = useState(ALL);
  const [selectedPhase, setSelectedPhase] = useState(ALL);
  const [search, setSearch] = useState("");

  function toggleChannel(channel) {
    if (channel === ALL) {
      setSelectedChannels([ALL]);
      return;
    }

    setSelectedChannels((current) => {
      const withoutAll = current.filter((item) => item !== ALL);
      const next = withoutAll.includes(channel)
        ? withoutAll.filter((item) => item !== channel)
        : [...withoutAll, channel];

      if (next.length === marketingChannels.length) {
        return [ALL];
      }

      return next.length ? next : [ALL];
    });
  }

  const filteredWallets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return marketingWallets.filter((wallet) => {
      const matchesChannel =
        selectedChannels.includes(ALL) || selectedChannels.includes(wallet.canal);
      const matchesWalletGroup =
        selectedWalletGroup === ALL || wallet.grupoCarteira === selectedWalletGroup;
      const matchesPhase = selectedPhase === ALL || wallet.fase === selectedPhase;
      const matchesSearch =
        !normalizedSearch ||
        [
          wallet.carteira,
          wallet.grupoCarteira,
          wallet.responsavel,
          wallet.fornecedor,
          wallet.ultimaValidacao,
          wallet.canal,
          wallet.fase,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesChannel && matchesWalletGroup && matchesPhase && matchesSearch;
    });
  }, [search, selectedChannels, selectedPhase, selectedWalletGroup]);

  const totalWallets = marketingWallets.length;
  const okWallets = marketingWallets.filter((wallet) => wallet.status === "Ok").length;
  const attentionWallets = marketingWallets.filter(
    (wallet) => wallet.status === "Atencao",
  ).length;
  const walletGroups = marketingWalletGroups.length;
  const selectedGroupWallets =
    selectedWalletGroup === ALL
      ? filteredWallets
      : filteredWallets.filter((wallet) => wallet.grupoCarteira === selectedWalletGroup);
  const filteredTotal = filteredWallets.length || 1;
  const filteredOkWallets = filteredWallets.filter((wallet) => wallet.status === "Ok").length;
  const filteredAttentionWallets = filteredWallets.filter(
    (wallet) => wallet.status === "Atencao",
  ).length;
  const filteredPendingWallets = filteredWallets.filter(
    (wallet) => wallet.status === "Pendente",
  ).length;
  const filteredValidationRate = Math.round((filteredOkWallets / filteredTotal) * 100);
  const filteredAttentionRate = Math.round((filteredAttentionWallets / filteredTotal) * 100);
  const selectedChannelLabel = selectedChannels.includes(ALL)
    ? "Todos os canais"
    : selectedChannels.join(" + ");
  const tableScope = [
    selectedChannelLabel,
    selectedWalletGroup === ALL ? "Todos os centros de custo" : selectedWalletGroup,
    selectedPhase === ALL ? "Todas as fases" : selectedPhase,
  ];
  const tableStatCards = [
    { label: "Exibidos", value: filteredWallets.length, tone: "blue" },
    { label: "Validados", value: filteredOkWallets, tone: "green" },
    { label: "Atenção", value: filteredAttentionWallets, tone: "red" },
    { label: "Pendentes", value: filteredPendingWallets, tone: "amber" },
  ];
  const channelBreakdown = marketingChannels.map((channel) => ({
    label: channel,
    total: countBy(filteredWallets, "canal", channel),
    tone: channel === "WhatsApp" ? "green" : channel === "SMS" ? "amber" : channel === "RCS" ? "purple" : "blue",
  }));
  const providerSummary = ["PG+", "IP3", "MAESTRO"].map((provider) => {
    const available = filteredWallets.filter(
      (wallet) => wallet.fornecedores?.[provider] === "ok",
    ).length;
    const attention = filteredWallets.filter(
      (wallet) => wallet.fornecedores?.[provider] === "attention",
    ).length;

    return {
      provider,
      available,
      attention,
      mapped: filteredWallets.filter(
        (wallet) => wallet.fornecedores?.[provider] === "mapped",
      ).length,
    };
  });
  const walletGroupRanking = Object.entries(
    filteredWallets.reduce((acc, wallet) => {
      acc[wallet.grupoCarteira] = (acc[wallet.grupoCarteira] || 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <section
      className={styles.page}
      style={{
        "--marketing-bg": C.bg0,
        "--marketing-card": C.bg1,
        "--marketing-card-soft": C.bg2,
        "--marketing-text": C.t1,
        "--marketing-muted": C.t2,
        "--marketing-border": C.border,
        "--marketing-blue": C.blue,
        "--marketing-green": C.emerald,
        "--marketing-amber": C.amber,
        "--marketing-red": C.rose,
        "--marketing-purple": C.violet,
      }}
    >
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Marketing</p>
          <h1 className={styles.title}>Gestão de centros de custo e templates</h1>
          <p className={styles.subtitle}>
            Acompanhamento dos centros de custo, canais, fornecedores, fases de validação
            e links de auditoria usados nas ações de marketing.
          </p>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.ghostButton}>
            <RefreshCw size={15} />
            Atualizar
          </button>
          <button type="button" className={styles.ghostButton}>
            <Download size={15} />
            Exportar
          </button>
          <button type="button" className={styles.button}>
            <Plus size={15} />
            Novo centro de custo
          </button>
        </div>
      </header>

      <div className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Centros de custo mapeados</div>
          <div className={styles.summaryValue}>{totalWallets}</div>
          <div className={styles.summaryHint}>Base inicial vinda do esboço.</div>
        </article>
        <article className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Validadas</div>
          <div className={styles.summaryValue}>{okWallets}</div>
          <div className={styles.summaryHint}>Centros de custo sem bloqueio aparente.</div>
        </article>
        <article className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Pontos de atenção</div>
          <div className={styles.summaryValue}>{attentionWallets}</div>
          <div className={styles.summaryHint}>Itens que precisam de revisão.</div>
        </article>
        <article className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Centros de custo principais</div>
          <div className={styles.summaryValue}>{walletGroups}</div>
          <div className={styles.summaryHint}>Agrupadas por nome principal.</div>
        </article>
      </div>

      <div className={styles.workspace}>
        <aside className={styles.filterPanel}>
          <div className={styles.filterGridResponsive}>
            <div className={styles.filterGroup}>
              <p className={styles.panelTitle}>
                <Filter size={14} /> Filtros
              </p>
              <label className={styles.filterLabel} htmlFor="marketing-phase">
                Fase
              </label>
              <select
                id="marketing-phase"
                className={styles.select}
                value={selectedPhase}
                onChange={(event) => setSelectedPhase(event.target.value)}
              >
                <option>{ALL}</option>
                {marketingPhases.map((phase) => (
                  <option key={phase.id}>{phase.label}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <div className={styles.filterLabel}>Canal</div>
              <div className={styles.channelList}>
                {[ALL, ...marketingChannels].map((channel) => {
                  const active = selectedChannels.includes(channel);

                  return (
                    <button
                      type="button"
                      key={channel}
                      className={`${styles.choiceButton} ${
                        active ? styles.choiceButtonActive : ""
                      }`}
                      onClick={() => toggleChannel(channel)}
                      aria-pressed={active}
                    >
                      <span className={styles.choiceMain}>
                        <span className={styles.checkboxMark}>{active ? "✓" : ""}</span>
                        {channel}
                      </span>
                      <span className={styles.choiceCount}>
                        {channel === ALL
                          ? marketingWallets.length
                          : countBy(marketingWallets, "canal", channel)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <div className={styles.filterLabel}>Centro de custo</div>
              <div className={styles.platformList}>
                {[ALL, ...marketingWalletGroups].map((walletGroup) => (
                  <button
                    type="button"
                    key={walletGroup}
                    className={`${styles.choiceButton} ${
                      selectedWalletGroup === walletGroup ? styles.choiceButtonActive : ""
                    }`}
                    onClick={() => setSelectedWalletGroup(walletGroup)}
                  >
                    <span>{walletGroup}</span>
                    <span className={styles.choiceCount}>
                      {walletGroup === ALL
                        ? marketingWallets.length
                        : countBy(marketingWallets, "grupoCarteira", walletGroup)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className={styles.contentStack}>
          <section className={styles.executivePanel}>
            <div className={styles.executiveHeader}>
              <div>
                <p className={styles.panelTitle}>Resumo executivo</p>
                <p className={styles.summaryHint}>
                  Visão consolidada do recorte atual de centros de custo, canais e fornecedores.
                </p>
              </div>
              <div className={styles.scopePill}>
                {selectedWalletGroup === ALL ? "Todos os centros de custo" : selectedWalletGroup}
              </div>
            </div>

            <div className={styles.executiveGrid}>
              <article className={styles.heroMetric}>
                <span className={styles.metricLabel}>Saúde da base</span>
                <strong>{filteredValidationRate}%</strong>
                <span className={styles.metricSub}>{filteredOkWallets} centros validados</span>
                <div className={styles.metricTrack}>
                  <span style={{ width: `${filteredValidationRate}%` }} />
                </div>
              </article>

              <article className={styles.heroMetric}>
                <span className={styles.metricLabel}>Atenção operacional</span>
                <strong>{filteredAttentionRate}%</strong>
                <span className={styles.metricSub}>{filteredAttentionWallets} itens para revisar</span>
                <div className={`${styles.metricTrack} ${styles.metricTrackAlert}`}>
                  <span style={{ width: `${filteredAttentionRate}%` }} />
                </div>
              </article>

              <article className={styles.executiveCardWide}>
                <div className={styles.metricLabel}>Mix de canais no filtro</div>
                <div className={styles.channelBars}>
                  {channelBreakdown.map((channel) => {
                    const percent = Math.round((channel.total / filteredTotal) * 100);

                    return (
                      <div key={channel.label} className={styles.channelBarRow}>
                        <span>{channel.label}</span>
                        <div className={styles.channelTrack}>
                          <i
                            className={styles[channel.tone]}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <strong>{channel.total}</strong>
                      </div>
                    );
                  })}
                </div>
              </article>
            </div>

            <div className={styles.insightGrid}>
              <article className={styles.insightCard}>
                <div className={styles.metricLabel}>Cobertura por fornecedor</div>
                <div className={styles.providerSummary}>
                  {providerSummary.map((item) => (
                    <div key={item.provider} className={styles.providerSummaryRow}>
                      <strong>{item.provider}</strong>
                      <span>{item.available} disponiveis</span>
                      <span>{item.attention} validar</span>
                    </div>
                  ))}
                </div>
              </article>

              <article className={styles.insightCard}>
                <div className={styles.metricLabel}>Centros de custo com maior volume</div>
                <div className={styles.walletRanking}>
                  {walletGroupRanking.map(([walletGroup, total]) => (
                    <div key={walletGroup} className={styles.walletRankingRow}>
                      <span>{walletGroup}</span>
                      <div className={styles.walletRankingTrack}>
                        <i style={{ width: `${Math.round((total / filteredTotal) * 100)}%` }} />
                      </div>
                      <strong>{total}</strong>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>

          <section className={styles.phasePanel}>
            <p className={styles.panelTitle}>
              {selectedWalletGroup === ALL
                ? "Fases do fluxo"
                : `Fases do centro de custo ${selectedWalletGroup}`}
            </p>
            <div className={styles.phaseGrid}>
              {marketingPhases.map((phase) => (
                <article key={phase.id} className={styles.phaseCard}>
                  <div className={styles.phaseTop}>
                    <span className={`${styles.phaseDot} ${styles[phase.tone]}`} />
                    <span className={styles.phaseLabel}>{phase.label}</span>
                  </div>
                  <div className={styles.phaseCount}>
                    {countBy(selectedGroupWallets, "fase", phase.label)}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {selectedWalletGroup !== ALL && (
            <section className={styles.phasePanel}>
              <p className={styles.panelTitle}>Centros de custo relacionados</p>
              <div className={styles.walletVariantGrid}>
                {selectedGroupWallets.map((wallet) => (
                  <article key={wallet.id} className={styles.walletVariant}>
                    <strong>{wallet.carteira}</strong>
                    <span>
                      {wallet.canal} - {wallet.fase}
                    </span>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className={styles.tablePanel}>
            <div className={styles.tableToolbar}>
              <div className={styles.tableTitleBlock}>
                <p className={styles.panelTitle}>Painel executivo de centros de custo</p>
                <p className={styles.summaryHint}>
                  {filteredWallets.length} de {marketingWallets.length} registros no recorte atual
                </p>
                <div className={styles.activeFilterRow}>
                  {tableScope.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
              <div className={styles.actions}>
                <input
                  className={styles.searchBox}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar centro de custo, responsável ou fornecedor"
                />
                <button type="button" className={styles.ghostButton}>
                  <Search size={15} />
                  Buscar
                </button>
              </div>
            </div>

            <div className={styles.tableExecutiveStrip}>
              {tableStatCards.map((item) => (
                <article key={item.label} className={styles.tableStatCard}>
                  <span className={`${styles.tableStatDot} ${styles[item.tone]}`} />
                  <div>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                </article>
              ))}
              <div className={styles.tableLegend}>
                <span><i className={styles.provider_ok} /> Disponível</span>
                <span><i className={styles.provider_attention} /> Validar</span>
                <span><i className={styles.provider_mapped} /> Mapeado</span>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Carteiras</th>
                    <th>Responsável</th>
                    <th>Fornecedor</th>
                    <th>PG+</th>
                    <th>IP3</th>
                    <th>Maestro</th>
                    <th>Última validação</th>
                    <th>Template</th>
                    <th>Status</th>
                    <th>Início projeto</th>
                    <th>Término projeto</th>
                    <th>Prazo estabelecido</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWallets.map((wallet) => (
                    <tr key={wallet.id}>
                      <td className={styles.walletNameCell}>
                        <strong>{wallet.carteira}</strong>
                        <span>{wallet.canal} - {wallet.fase}</span>
                      </td>
                      <td>{wallet.responsavel}</td>
                      <td>{wallet.fornecedor}</td>
                      {["PG+", "IP3", "MAESTRO"].map((provider) => {
                        const providerStatus = wallet.fornecedores?.[provider] || "none";

                        return (
                          <td key={provider}>
                            <span
                              className={`${styles.providerBadge} ${
                                styles[`provider_${providerStatus}`]
                              }`}
                            >
                              {providerStatusLabels[providerStatus]}
                            </span>
                          </td>
                        );
                      })}
                      <td>{wallet.ultimaValidacao}</td>
                      <td>
                        <a className={styles.templateLink} href="#marketing-auditoria">
                          Acessar auditoria
                        </a>
                      </td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${statusClass(
                            wallet.status,
                          )}`}
                        >
                          {statusText(wallet.status)}
                        </span>
                      </td>
                      <td>{wallet.inicioProjeto}</td>
                      <td>{wallet.terminoProjeto}</td>
                      <td>{wallet.prazoEstabelecido}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className={styles.noteGrid}>
            <section className={styles.notePanel}>
              <p className={styles.panelTitle}>Próximo refinamento</p>
              <p className={styles.noteText}>
                Quando os centros de custo e fases oficiais forem recebidos, a troca pode
                ser feita em `src/features/marketing/data/marketingData.js`, sem
                mexer no layout da tela.
              </p>
            </section>

            <aside id="marketing-auditoria" className={styles.figmaBox}>
              Documento de acompanhamento e validação conforme informações
              operacionais. Espaço reservado para redirecionamento ao Figma,
              auditoria, histórico de template e anexos.
              <br />
              <ExternalLink size={13} /> Abrir referencia
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
