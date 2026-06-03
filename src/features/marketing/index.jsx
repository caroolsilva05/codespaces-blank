import React, { useMemo, useState } from "react";
import { Download, ExternalLink, Filter, Plus, RefreshCw, Search } from "lucide-react";
import {
  marketingChannels,
  marketingPhases,
  marketingPlatforms,
  marketingWallets,
} from "./data/marketingData";
import styles from "./styles/MarketingPage.module.css";

const ALL = "Todos";

function statusClass(status) {
  if (status === "Ok") return styles.statusOk;
  if (status === "Pendente") return styles.statusPendente;
  return styles.statusAtencao;
}

function countBy(rows, field, value) {
  return rows.filter((row) => row[field] === value).length;
}

export default function MarketingPage({ C }) {
  const [selectedChannel, setSelectedChannel] = useState(ALL);
  const [selectedPlatform, setSelectedPlatform] = useState(ALL);
  const [selectedPhase, setSelectedPhase] = useState(ALL);
  const [search, setSearch] = useState("");

  const filteredWallets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return marketingWallets.filter((wallet) => {
      const matchesChannel =
        selectedChannel === ALL || wallet.canal === selectedChannel;
      const matchesPlatform =
        selectedPlatform === ALL || wallet.plataforma === selectedPlatform;
      const matchesPhase = selectedPhase === ALL || wallet.fase === selectedPhase;
      const matchesSearch =
        !normalizedSearch ||
        [
          wallet.carteira,
          wallet.responsavel,
          wallet.fornecedor,
          wallet.ultimaValidacao,
          wallet.canal,
          wallet.plataforma,
          wallet.fase,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesChannel && matchesPlatform && matchesPhase && matchesSearch;
    });
  }, [search, selectedChannel, selectedPhase, selectedPlatform]);

  const totalWallets = marketingWallets.length;
  const okWallets = marketingWallets.filter((wallet) => wallet.status === "Ok").length;
  const attentionWallets = marketingWallets.filter(
    (wallet) => wallet.status === "Atenção",
  ).length;
  const suppliers = new Set(marketingWallets.map((wallet) => wallet.fornecedor)).size;

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
          <h1 className={styles.title}>Gestão de carteiras e templates</h1>
          <p className={styles.subtitle}>
            Acompanhamento das carteiras, canais, fornecedores, fases de validação
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
            Nova carteira
          </button>
        </div>
      </header>

      <div className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Carteiras mapeadas</div>
          <div className={styles.summaryValue}>{totalWallets}</div>
          <div className={styles.summaryHint}>Base inicial vinda do esboço.</div>
        </article>
        <article className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Validadas</div>
          <div className={styles.summaryValue}>{okWallets}</div>
          <div className={styles.summaryHint}>Carteiras sem bloqueio aparente.</div>
        </article>
        <article className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Pontos de atenção</div>
          <div className={styles.summaryValue}>{attentionWallets}</div>
          <div className={styles.summaryHint}>Itens que precisam de revisão.</div>
        </article>
        <article className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Fornecedores</div>
          <div className={styles.summaryValue}>{suppliers}</div>
          <div className={styles.summaryHint}>Fornecedores citados nas carteiras.</div>
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
                {[ALL, ...marketingChannels].map((channel) => (
                  <button
                    type="button"
                    key={channel}
                    className={`${styles.choiceButton} ${
                      selectedChannel === channel ? styles.choiceButtonActive : ""
                    }`}
                    onClick={() => setSelectedChannel(channel)}
                  >
                    <span>{channel}</span>
                    <span className={styles.choiceCount}>
                      {channel === ALL
                        ? marketingWallets.length
                        : countBy(marketingWallets, "canal", channel)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <div className={styles.filterLabel}>Plataforma</div>
              <div className={styles.platformList}>
                {[ALL, ...marketingPlatforms].map((platform) => (
                  <button
                    type="button"
                    key={platform}
                    className={`${styles.choiceButton} ${
                      selectedPlatform === platform ? styles.choiceButtonActive : ""
                    }`}
                    onClick={() => setSelectedPlatform(platform)}
                  >
                    <span>{platform}</span>
                    <span className={styles.choiceCount}>
                      {platform === ALL
                        ? marketingWallets.length
                        : countBy(marketingWallets, "plataforma", platform)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className={styles.contentStack}>
          <section className={styles.phasePanel}>
            <p className={styles.panelTitle}>Fases do fluxo</p>
            <div className={styles.phaseGrid}>
              {marketingPhases.map((phase) => (
                <article key={phase.id} className={styles.phaseCard}>
                  <div className={styles.phaseTop}>
                    <span className={`${styles.phaseDot} ${styles[phase.tone]}`} />
                    <span className={styles.phaseLabel}>{phase.label}</span>
                  </div>
                  <div className={styles.phaseCount}>
                    {countBy(marketingWallets, "fase", phase.label)}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.tablePanel}>
            <div className={styles.tableToolbar}>
              <div>
                <p className={styles.panelTitle}>Carteiras de marketing</p>
                <p className={styles.summaryHint}>
                  {filteredWallets.length} de {marketingWallets.length} registros
                </p>
              </div>
              <div className={styles.actions}>
                <input
                  className={styles.searchBox}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar carteira, responsável ou fornecedor"
                />
                <button type="button" className={styles.ghostButton}>
                  <Search size={15} />
                  Buscar
                </button>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Carteira</th>
                    <th>Responsável</th>
                    <th>Fornecedor</th>
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
                      <td>{wallet.carteira}</td>
                      <td>{wallet.responsavel}</td>
                      <td>{wallet.fornecedor}</td>
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
                          {wallet.status}
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
                Quando as carteiras e fases oficiais forem recebidas, a troca pode
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
