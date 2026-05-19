import React, { useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

const emptyPoc = {
  general: {
    pocName: "",
    supplier: "",
    responsible: "",
    sponsor: "",
    wallet: "",
    product: "",
    periodStart: "",
    periodEnd: "",
    dailyGoal: "300",
    pocDays: "30",
    status: "Em Planejamento",
  },
  planning: {
    businessProblem: "",
    objective: "",
    successCriteria: [
      { id: 1, kpi: "Performance", target: "", result: "", status: "Pendente" },
      { id: 2, kpi: "Integração", target: "", result: "", status: "Pendente" },
      { id: 3, kpi: "Segurança", target: "", result: "", status: "Pendente" },
      { id: 4, kpi: "Usabilidade", target: "", result: "", status: "Pendente" },
    ],
  },
  security: {
    vpn: false,
    ips: false,
    credentials: false,
    maskedData: false,
    cloudBudget: false,
    notes: "",
  },
  execution: {
    activities: [
      { id: 1, activity: "Instalação, setup de infra e configuração inicial", owner: "Fornecedor + DevOps", status: "Pendente", notes: "" },
      { id: 2, activity: "Testes de carga e performance", owner: "Time técnico interno", status: "Pendente", notes: "" },
      { id: 3, activity: "Validação de integrações com sistemas legados", owner: "Desenvolvedores internos", status: "Pendente", notes: "" },
      { id: 4, activity: "Testes de homologação pelo usuário (UAT)", owner: "Usuários de negócio", status: "Pendente", notes: "" },
    ],
    blockers: [
      { id: 1, date: "", blocker: "", owner: "", daysStopped: "", status: "Aberto" },
    ],
  },
  analytics: {
    rows: [
      { id: 1, date: "", disparado: "", totalMensagens: "", entregue: "", naoEntregue: "", emProcesso: "", lido: "", cliques: "", retornoCliente: "", acordos: "", observation: "" },
    ],
  },
  incidents: {
    rows: [
      { id: 1, incident: "", severity: "Média", businessImpact: "", rootCause: "", solution: "", hours: "", status: "Pendente", deepDive: "" },
    ],
  },
  evaluation: {
    functionality: "0",
    performance: "0",
    support: "0",
    implementation: "0",
    recommendation: "Em avaliação",
    conditions: "",
    executiveSummary: "",
    credentialsRevoked: false,
    dataPurged: false,
    cloudStopped: false,
  },
};

const toNum = (value) => {
  const parsed = Number(String(value || "0").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};

const pct = (value) => `${Number(value || 0).toFixed(1).replace(".", ",")}%`;

const brDate = (value) => {
  if (!value) return "-";
  const parts = String(value).split("-");
  if (parts.length !== 3) return value;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

function calcMetrics(rows) {
  const totals = rows.reduce(
    (acc, row) => {
      acc.disparado += toNum(row.disparado);
      acc.totalMensagens += toNum(row.totalMensagens);
      acc.entregue += toNum(row.entregue);
      acc.naoEntregue += toNum(row.naoEntregue);
      acc.emProcesso += toNum(row.emProcesso);
      acc.lido += toNum(row.lido);
      acc.cliques += toNum(row.cliques);
      acc.retornoCliente += toNum(row.retornoCliente);
      acc.acordos += toNum(row.acordos);
      return acc;
    },
    {
      disparado: 0,
      totalMensagens: 0,
      entregue: 0,
      naoEntregue: 0,
      emProcesso: 0,
      lido: 0,
      cliques: 0,
      retornoCliente: 0,
      acordos: 0,
    }
  );

  const taxaEntrega = totals.totalMensagens > 0 ? (totals.entregue / totals.totalMensagens) * 100 : 0;
  const taxaLeituraEntregues = totals.entregue > 0 ? (totals.lido / totals.entregue) * 100 : 0;
  const taxaLeituraDisparados = totals.totalMensagens > 0 ? (totals.lido / totals.totalMensagens) * 100 : 0;
  const taxaRetornoLidos = totals.lido > 0 ? (totals.retornoCliente / totals.lido) * 100 : 0;
  const taxaConversaoFinal = totals.totalMensagens > 0 ? (totals.acordos / totals.totalMensagens) * 100 : 0;

  return {
    ...totals,
    taxaEntrega,
    taxaLeituraEntregues,
    taxaLeituraDisparados,
    taxaRetornoLidos,
    taxaConversaoFinal,
  };
}

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

export default function PocRegister({ C, registroInicial = null, onSaved = null, onClose = null } = {}) {
  const [tab, setTab] = useState("overview");
  const [saving, setSaving] = useState(false);
  const [lastEditedAt, setLastEditedAt] = useState(null);
  const [data, setData] = useState(() => {
    const saved = registroInicial?.record_data || registroInicial?.dados_do_registro || null;
    return saved || emptyPoc;
  });

  const metrics = useMemo(() => calcMetrics(data.analytics.rows || []), [data.analytics.rows]);

  const averageScore = useMemo(() => {
    const values = [
      toNum(data.evaluation.functionality),
      toNum(data.evaluation.performance),
      toNum(data.evaluation.support),
      toNum(data.evaluation.implementation),
    ].filter((v) => v > 0);

    if (!values.length) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }, [data.evaluation]);

  const field = {
    width: "100%",
    minHeight: 42,
    borderRadius: 12,
    border: `1px solid ${C.border}`,
    background: C.surface,
    color: C.t1,
    padding: "10px 12px",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const smallField = {
    ...field,
    minHeight: 36,
    padding: "7px 9px",
    fontSize: 12,
    borderRadius: 9,
  };

  function update(path, value) {
    setLastEditedAt(new Date());
    setData((prev) => {
      const next = cloneData(prev);
      const keys = path.split(".");
      let ref = next;
      keys.slice(0, -1).forEach((key) => {
        ref = ref[key];
      });
      ref[keys[keys.length - 1]] = value;
      return next;
    });
  }

  function updateRow(section, key, id, fieldName, value) {
    setData((prev) => {
      const next = cloneData(prev);
      next[section][key] = next[section][key].map((row) =>
        row.id === id ? { ...row, [fieldName]: value } : row
      );
      return next;
    });
  }

  function addRow(section, key, row) {
    setData((prev) => {
      const next = cloneData(prev);
      next[section][key].push({ ...row, id: Date.now() });
      return next;
    });
  }

  function removeRow(section, key, id) {
    setData((prev) => {
      const next = cloneData(prev);
      next[section][key] = next[section][key].filter((row) => row.id !== id);
      return next;
    });
  }

  async function savePoc() {
    if (!data.general.pocName.trim()) {
      alert("Informe o nome da POC antes de salvar.");
      return;
    }

    setSaving(true);

    const payload = {
      poc_name: data.general.pocName,
      supplier: data.general.supplier,
      responsible: data.general.responsible,
      status: data.general.status,
      recommendation: data.evaluation.recommendation,
      record_data: data,
      updated_at: new Date().toISOString(),
    };

    const response = registroInicial?.id
      ? await supabase.from("poc_records").update(payload).eq("id", registroInicial.id)
      : await supabase.from("poc_records").insert([{ ...payload }]);

    setSaving(false);

    if (response.error) {
      console.log("Erro ao salvar POC:", response.error);
      alert("Erro ao salvar POC. Veja o console.");
      return;
    }

    alert(registroInicial?.id ? "POC atualizada com sucesso!" : "POC salva com sucesso!");

    if (typeof onSaved === "function") {
      await onSaved();
    }
  }

  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setTab(id)}
      style={{
        padding: "9px 13px",
        borderRadius: 10,
        border: `1px solid ${tab === id ? C.blue : C.border}`,
        background: tab === id ? C.blueGlow : C.surface,
        color: tab === id ? C.blue : C.t2,
        cursor: "pointer",
        fontSize: 12,
        fontWeight: tab === id ? 800 : 600,
      }}
    >
      {label}
    </button>
  );

  const Section = ({ title, sub, children }) => (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        padding: 20,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.t1 }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: C.t3, marginTop: 4 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );

  const MetricCard = ({ label, value, sub, color }) => (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: "16px 18px",
      }}
    >
      <div style={{ fontSize: 11, color: C.t3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </div>
      <div style={{ fontSize: 38, fontWeight: 950, color, marginTop: 7 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.t2, marginTop: 4 }}>{sub}</div>}
    </div>
  );

  const SimpleBar = ({ value, color }) => (
    <div style={{ height: 10, background: C.bg3, borderRadius: 999, overflow: "hidden" }}>
      <div
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          height: "100%",
          background: color,
          borderRadius: 999,
        }}
      />
    </div>
  );

  const DayStatus = ({ row }) => {
    const totalMensagens = toNum(row.totalMensagens);
    const entregue = toNum(row.entregue);
    const lido = toNum(row.lido);
    const taxaEntrega = totalMensagens > 0 ? (entregue / totalMensagens) * 100 : 0;
    const taxaLeitura = entregue > 0 ? (lido / entregue) * 100 : 0;

    let label = "Dia zero";
    let color = C.amber;

    if (totalMensagens > 0 && taxaEntrega >= 85 && taxaLeitura >= 60) {
      label = "Bom";
      color = C.emerald;
    } else if (totalMensagens > 0 && taxaEntrega >= 70) {
      label = "Regular";
      color = C.amber;
    } else if (totalMensagens > 0) {
      label = "Crítico";
      color = C.rose;
    }

    return <span style={{ color, fontWeight: 800 }}>{label}</span>;
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg0, color: C.t1, padding: 24 }}>
      <div
        style={{
          background: `linear-gradient(135deg, ${C.bg1}, ${C.bg2})`,
          border: `1px solid ${C.border}`,
          borderRadius: 22,
          padding: 22,
          marginBottom: 18,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 18 }}>
          <div>
            <div style={{ fontSize: 12, color: C.t3, marginBottom: 6 }}>POCs › Registro de Prova de Conceito</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.t1 }}>
              {data.general.pocName || "Nova POC"}
            </div>
            <div style={{ fontSize: 13, color: C.t2, marginTop: 6 }}>
              Gestão completa da POC com acompanhamento técnico, analítico e recomendação executiva.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={savePoc}
              disabled={saving}
              style={{
                background: C.blue,
                border: "none",
                color: "#fff",
                borderRadius: 12,
                padding: "11px 18px",
                fontWeight: 900,
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.75 : 1,
              }}
            >
              {saving ? "Salvando..." : "Salvar POC"}
            </button>

            {onClose && (
              <button
                onClick={onClose}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  color: C.t2,
                  borderRadius: 12,
                  padding: "11px 16px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Fechar
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
          <TabButton id="overview" label="Visão Geral" />
          <TabButton id="general" label="Cadastro" />
          <TabButton id="planning" label="Planejamento" />
          <TabButton id="execution" label="Execução" />
          <TabButton id="analytics" label="Relatório Analítico" />
          <TabButton id="incidents" label="Incidentes" />
          <TabButton id="evaluation" label="Avaliação Final" />
        </div>
      </div>

      {tab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <style>{`
            @keyframes pocPulseAlert {
              0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.28); }
              70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
              100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
            }
          `}</style>

          {lastEditedAt && (
            <div
              style={{
                alignSelf: "flex-end",
                marginTop: -4,
                fontSize: 12,
                color: C.emerald,
                fontWeight: 800,
                background: C.emeraldGlow,
                border: `1px solid ${C.emerald}33`,
                borderRadius: 999,
                padding: "6px 11px",
              }}
            >
              Alteração aplicada na tela ✓
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            <MetricCard label="Total mensagens" value={metrics.totalMensagens} sub="Base consolidada" color={C.violet} />
            <MetricCard label="Entregues" value={metrics.entregue} sub={pct(metrics.taxaEntrega)} color={C.emerald} />
            <MetricCard label="Lidos" value={metrics.lido} sub={pct(metrics.taxaLeituraDisparados)} color={C.blue} />
            <MetricCard label="Retorno" value={metrics.retornoCliente} sub={pct(metrics.taxaRetornoLidos)} color={C.amber} />
            <MetricCard label="Acordos" value={metrics.acordos} sub={pct(metrics.taxaConversaoFinal)} color={C.rose} />
          </div>

          <div
            style={{
              height: 4,
              borderRadius: 999,
              background: `linear-gradient(90deg, ${C.blue}, ${C.violet}, ${C.emerald})`,
              opacity: 0.22,
              margin: "2px 0 4px",
            }}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1.25fr 0.75fr", gap: 12 }}>
            <Section title="Resumo da POC" sub="Leitura executiva do teste com fornecedor/produto">
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                <button
                  onClick={() => setTab("general")}
                  style={{
                    border: `1px solid ${C.border}`,
                    background: C.surface,
                    color: C.blue,
                    borderRadius: 999,
                    padding: "6px 11px",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  Editar cadastro
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[
                  ["Fornecedor", data.general.supplier || "-"],
                  ["Carteira / Cliente", data.general.wallet || "-"],
                  ["Produto testado", data.general.product || "-"],
                  ["Responsável", data.general.responsible || "-"],
                  ["Período", `${brDate(data.general.periodStart)} a ${brDate(data.general.periodEnd)}`],
                  ["Meta diária", `${data.general.dailyGoal || "-"} disparos/dia`],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      background: C.bg3,
                      border: `1px solid ${C.border}`,
                      borderRadius: 12,
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: C.t3,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: 5,
                      }}
                    >
                      {label}
                    </div>
                    <div style={{ fontSize: 13, color: C.t1, fontWeight: 800 }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Status Executivo" sub="Decisão atual da POC para acompanhamento da liderança">
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, color: C.t3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                      Status operacional
                    </div>
                    <select
                      value={data.general.status}
                      onChange={(e) => update("general.status", e.target.value)}
                      style={field}
                    >
                      <option>Em Planejamento</option>
                      <option>Em Execução</option>
                      <option>Em Monitoramento</option>
                      <option>Encerrada</option>
                    </select>
                  </div>

                  <div>
                    <div style={{ fontSize: 10, color: C.t3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                      Recomendação
                    </div>
                    <select
                      value={data.evaluation.recommendation}
                      onChange={(e) => update("evaluation.recommendation", e.target.value)}
                      style={field}
                    >
                      <option>Em avaliação</option>
                      <option>Aprovado</option>
                      <option>Reprovado</option>
                      <option>Aprovado com condições</option>
                    </select>
                  </div>
                </div>

                {(() => {
                  const rec = data.evaluation.recommendation || "Em avaliação";
                  const status = data.general.status || "Em Planejamento";

                  const color =
                    rec === "Aprovado"
                      ? C.emerald
                      : rec === "Reprovado"
                      ? C.rose
                      : rec === "Aprovado com condições"
                      ? C.amber
                      : C.blue;

                  const bg =
                    rec === "Aprovado"
                      ? C.emeraldGlow
                      : rec === "Reprovado"
                      ? C.roseGlow
                      : rec === "Aprovado com condições"
                      ? C.amberGlow
                      : C.blueGlow;

                  const texto =
                    rec === "Aprovado"
                      ? "POC com resultado favorável para evolução."
                      : rec === "Reprovado"
                      ? "POC não recomendada para continuidade no momento."
                      : rec === "Aprovado com condições"
                      ? "POC favorável, mas depende de ajustes antes da contratação."
                      : "POC ainda em avaliação. Acompanhar indicadores, incidentes e critérios de sucesso.";

                  return (
                    <div
                      style={{
                        background: bg,
                        border: `1px solid ${color}44`,
                        borderRadius: 16,
                        padding: "16px 18px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 11, color: C.t3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>
                            Decisão atual
                          </div>
                          <div style={{ fontSize: 22, fontWeight: 900, color }}>
                            {rec}
                          </div>
                        </div>

                        <div
                          style={{
                            padding: "7px 11px",
                            borderRadius: 999,
                            background: C.bg1,
                            border: `1px solid ${C.border}`,
                            color: C.t2,
                            fontSize: 12,
                            fontWeight: 800,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {status}
                        </div>
                      </div>

                      <div style={{ marginTop: 12, fontSize: 13, color: C.t2, lineHeight: 1.5 }}>
                        {texto}
                      </div>
                    </div>
                  );
                })()}

                {(() => {
                  const steps = ["Em Planejamento", "Em Execução", "Em Monitoramento", "Encerrada"];
                  const currentIndex = Math.max(0, steps.indexOf(data.general.status || "Em Planejamento"));

                  return (
                    <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, padding: "13px 14px" }}>
                      <div style={{ fontSize: 11, color: C.t3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 11 }}>
                        Etapa da POC
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                        {steps.map((step, index) => {
                          const active = index <= currentIndex;
                          return (
                            <div key={step} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                              <div
                                style={{
                                  height: 7,
                                  borderRadius: 999,
                                  background: active ? C.blue : C.border,
                                }}
                              />
                              <span style={{ fontSize: 10, color: active ? C.blue : C.t3, fontWeight: active ? 900 : 600 }}>
                                {step.replace("Em ", "")}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </Section>
          </div>

          <Section title="Funil Drop-off Executivo" sub="Retenção e perda entre as etapas da jornada da POC">
            {metrics.cliques > metrics.lido && (
              <div
                title="Cliques maior que lidos pode ocorrer quando o fornecedor contabiliza múltiplos cliques por cliente, cliques técnicos, redirecionamentos ou eventos duplicados."
                style={{
                  marginBottom: 14,
                  background: C.amberGlow,
                  border: `1px solid ${C.amber}44`,
                  color: C.t1,
                  borderRadius: 12,
                  padding: "11px 13px",
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ color: C.amber }}>Ponto de atenção:</strong>{" "}
                Cliques acima de Lidos. Validar a regra de contagem do fornecedor antes da apresentação executiva.
              </div>
            )}

            {(() => {
              const etapas = [
                { nome: "Total mensagens", volume: metrics.totalMensagens, base: metrics.totalMensagens, anterior: null, cor: C.violet },
                { nome: "Entregues", volume: metrics.entregue, base: metrics.totalMensagens, anterior: metrics.totalMensagens, cor: C.emerald },
                { nome: "Lidos", volume: metrics.lido, base: metrics.totalMensagens, anterior: metrics.entregue, cor: C.blue },
                { nome: "Cliques", volume: metrics.cliques, base: metrics.totalMensagens, anterior: metrics.lido, cor: C.cyan },
                { nome: "Retorno cliente", volume: metrics.retornoCliente, base: metrics.totalMensagens, anterior: metrics.cliques, cor: C.amber },
                { nome: "Acordos", volume: metrics.acordos, base: metrics.totalMensagens, anterior: metrics.retornoCliente, cor: C.rose },
              ];

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {etapas.map((etapa, index) => {
                    const percentualBase = etapa.base ? (etapa.volume / etapa.base) * 100 : 0;
                    const retencaoAnterior =
                      etapa.anterior === null
                        ? 100
                        : etapa.anterior > 0
                        ? (etapa.volume / etapa.anterior) * 100
                        : 0;

                    const perdaAnterior =
                      etapa.anterior === null
                        ? 0
                        : Math.max(0, 100 - retencaoAnterior);

                    const largura = Math.max(0.5, Math.min(100, percentualBase));
                    const alertaVolumeMaior = etapa.anterior !== null && etapa.volume > etapa.anterior;

                    return (
                      <div
                        key={etapa.nome}
                        style={{
                          background: C.bg3,
                          border: `1px solid ${alertaVolumeMaior ? C.amber + "66" : C.border}`,
                          borderRadius: 14,
                          padding: "13px 14px",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "180px 95px 130px 130px 1fr",
                            gap: 12,
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 13, color: C.t1, fontWeight: 900 }}>
                              {etapa.nome}
                            </div>
                            {alertaVolumeMaior && (
                              <div style={{ marginTop: 3, fontSize: 10, color: C.amber, fontWeight: 800 }}>
                                Validar contagem
                              </div>
                            )}
                          </div>

                          <div>
                            <div style={{ fontSize: 10, color: C.t3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                              Volume
                            </div>
                            <div style={{ fontSize: 18, color: etapa.cor, fontWeight: 950 }}>
                              {etapa.volume}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: 10, color: C.t3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                              Retenção
                            </div>
                            <div style={{ fontSize: 14, color: alertaVolumeMaior ? C.amber : C.t1, fontWeight: 900 }}>
                              {index === 0 ? "100,0%" : pct(retencaoAnterior)}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: 10, color: C.t3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                              Drop-off
                            </div>
                            <div style={{ fontSize: 14, color: perdaAnterior > 40 ? C.rose : perdaAnterior > 20 ? C.amber : C.emerald, fontWeight: 900 }}>
                              {index === 0 ? "—" : pct(perdaAnterior)}
                            </div>
                          </div>

                          <div>
                            <div
                              style={{
                                height: 16,
                                background: C.bg1,
                                border: `1px solid ${C.border}`,
                                borderRadius: 999,
                                overflow: "hidden",
                                position: "relative",
                              }}
                            >
                              <div
                                style={{
                                  width: `${largura}%`,
                                  height: "100%",
                                  background: etapa.cor,
                                  borderRadius: 999,
                                }}
                              />
                            </div>

                            <div style={{ marginTop: 5, display: "flex", justifyContent: "space-between", fontSize: 10, color: C.t3 }}>
                              <span>% sobre base</span>
                              <strong style={{ color: etapa.cor }}>{pct(percentualBase)}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </Section>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 12 }}>
            <Section title="Resumo Executivo" sub="Análise rápida para liderança">
              <textarea
                placeholder="Escreva aqui a análise executiva da POC: desempenho geral, principais pontos de atenção, qualidade do fornecedor, comportamento técnico, riscos e recomendação preliminar."
                defaultValue={data.evaluation.executiveSummary}
                onBlur={(e) => update("evaluation.executiveSummary", e.target.value)}
                style={{ ...field, minHeight: 120, resize: "vertical", lineHeight: 1.6 }}
              />
            </Section>

            <Section title="Alertas executivos" sub="Pontos de atenção automáticos">
              {(() => {
                const incidentes = data.incidents.rows || [];
                const blockers = data.execution.blockers || [];
                const criticos = incidentes.filter((i) => i.severity === "Crítica").length;
                const altas = incidentes.filter((i) => i.severity === "Alta").length;
                const pendentes = incidentes.filter((i) => i.status !== "Resolvido" && i.incident).length;
                const bloqueiosAbertos = blockers.filter((b) => b.status !== "Resolvido" && b.blocker).length;

                const alertas = [
                  { label: "Incidentes críticos", value: criticos, severity: "critical" },
                  { label: "Incidentes alta severidade", value: altas, severity: "high" },
                  { label: "Pendências técnicas", value: pendentes, severity: "medium" },
                  { label: "Bloqueios em aberto", value: bloqueiosAbertos, severity: "critical" },
                ];

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {alertas.map((a) => {
                      const hasProblem = a.value > 0;
                      const color = !hasProblem
                        ? C.t3
                        : a.severity === "critical"
                        ? C.rose
                        : a.severity === "high"
                        ? C.amber
                        : C.blue;

                      const bg = !hasProblem
                        ? C.bg3
                        : a.severity === "critical"
                        ? C.roseGlow || "rgba(239,68,68,0.10)"
                        : a.severity === "high"
                        ? C.amberGlow
                        : C.blueGlow;

                      return (
                        <div
                          key={a.label}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: bg,
                            border: `1px solid ${hasProblem ? color + "55" : C.border}`,
                            borderRadius: 12,
                            padding: "11px 13px",
                            animation: hasProblem ? "pocPulseAlert 1.8s infinite" : "none",
                          }}
                        >
                          <span style={{ fontSize: 13, color: C.t2 }}>{a.label}</span>
                          <strong style={{ color, fontSize: 18 }}>{a.value}</strong>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </Section>
          </div>
        </div>
      )}

      {tab === "general" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Section title="Informações Gerais da POC" sub="Dados de alinhamento inicial com o fornecedor e acompanhamento executivo">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
              <input
                placeholder="Nome da POC"
                defaultValue={data.general.pocName}
                onBlur={(e) => update("general.pocName", e.target.value)}
                style={field}
              />

              <input
                placeholder="Fornecedor / Tecnologia"
                defaultValue={data.general.supplier}
                onBlur={(e) => update("general.supplier", e.target.value)}
                style={field}
              />

              <input
                placeholder="Responsável"
                defaultValue={data.general.responsible}
                onBlur={(e) => update("general.responsible", e.target.value)}
                style={field}
              />

              <input
                placeholder="Gestor Executivo / Sponsor"
                defaultValue={data.general.sponsor}
                onBlur={(e) => update("general.sponsor", e.target.value)}
                style={field}
              />

              <input
                placeholder="Carteira / Cliente"
                defaultValue={data.general.wallet}
                onBlur={(e) => update("general.wallet", e.target.value)}
                style={field}
              />

              <input
                placeholder="Produto / Solução testada"
                defaultValue={data.general.product}
                onBlur={(e) => update("general.product", e.target.value)}
                style={field}
              />

              <input
                type="date"
                defaultValue={data.general.periodStart}
                onBlur={(e) => update("general.periodStart", e.target.value)}
                style={field}
              />

              <input
                type="date"
                defaultValue={data.general.periodEnd}
                onBlur={(e) => update("general.periodEnd", e.target.value)}
                style={field}
              />

              <input
                placeholder="Meta de disparos por dia"
                defaultValue={data.general.dailyGoal}
                onBlur={(e) => update("general.dailyGoal", e.target.value)}
                style={field}
              />

              <input
                placeholder="Quantidade de dias da POC"
                defaultValue={data.general.pocDays}
                onBlur={(e) => update("general.pocDays", e.target.value)}
                style={field}
              />

              <select
                value={data.general.status}
                onChange={(e) => update("general.status", e.target.value)}
                style={{ ...field, gridColumn: "1 / -1" }}
              >
                <option>Em Planejamento</option>
                <option>Em Execução</option>
                <option>Em Monitoramento</option>
                <option>Encerrada</option>
              </select>
            </div>
          </Section>
        </div>
      )}

      {tab === "planning" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Section
            title="Planejamento e Alinhamento da POC"
            sub="Definição da dor de negócio, objetivo e critérios que determinam sucesso ou fracasso da POC"
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <textarea
                placeholder="Problema de negócio: qual dor da empresa essa solução pretende resolver?"
                defaultValue={data.planning.businessProblem}
                onBlur={(e) => update("planning.businessProblem", e.target.value)}
                style={{ ...field, minHeight: 130, resize: "vertical", lineHeight: 1.6 }}
              />

              <textarea
                placeholder="Objetivo da POC: o que precisa ser comprovado durante o teste?"
                defaultValue={data.planning.objective}
                onBlur={(e) => update("planning.objective", e.target.value)}
                style={{ ...field, minHeight: 130, resize: "vertical", lineHeight: 1.6 }}
              />
            </div>
          </Section>

          <Section
            title="Critérios de Sucesso / KPIs"
            sub="Métricas quantificáveis para avaliar se o produto do fornecedor atende ao esperado"
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                <thead>
                  <tr>
                    {["KPI", "Meta acordada", "Resultado obtido", "Status", ""].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: 9,
                          fontSize: 11,
                          color: C.t3,
                          textAlign: "left",
                          borderBottom: `1px solid ${C.border}`,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {data.planning.successCriteria.map((row) => (
                    <tr key={row.id}>
                      <td style={{ padding: 6 }}>
                        <input
                          defaultValue={row.kpi}
                          onBlur={(e) => updateRow("planning", "successCriteria", row.id, "kpi", e.target.value)}
                          style={smallField}
                        />
                      </td>

                      <td style={{ padding: 6 }}>
                        <input
                          placeholder="Ex: API abaixo de 300ms"
                          defaultValue={row.target}
                          onBlur={(e) => updateRow("planning", "successCriteria", row.id, "target", e.target.value)}
                          style={smallField}
                        />
                      </td>

                      <td style={{ padding: 6 }}>
                        <input
                          placeholder="Resultado medido"
                          defaultValue={row.result}
                          onBlur={(e) => updateRow("planning", "successCriteria", row.id, "result", e.target.value)}
                          style={smallField}
                        />
                      </td>

                      <td style={{ padding: 6 }}>
                        <select
                          defaultValue={row.status}
                          onBlur={(e) => updateRow("planning", "successCriteria", row.id, "status", e.target.value)}
                          style={smallField}
                        >
                          <option>Pendente</option>
                          <option>Atendido</option>
                          <option>Parcial</option>
                          <option>Não atendido</option>
                        </select>
                      </td>

                      <td style={{ padding: 6 }}>
                        <button
                          onClick={() => removeRow("planning", "successCriteria", row.id)}
                          style={{ ...smallField, cursor: "pointer" }}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={() =>
                addRow("planning", "successCriteria", {
                  kpi: "",
                  target: "",
                  result: "",
                  status: "Pendente",
                })
              }
              style={{ ...field, marginTop: 12, cursor: "pointer", fontWeight: 800 }}
            >
              + Adicionar KPI / Critério de sucesso
            </button>
          </Section>

          <Section
            title="Infraestrutura e Segurança"
            sub="Checklist obrigatório antes de liberar os testes com o fornecedor"
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginBottom: 14 }}>
              {[
                ["vpn", "VPN configurada"],
                ["ips", "IPs liberados"],
                ["credentials", "Credenciais temporárias criadas"],
                ["maskedData", "Dados anonimizados / mascarados"],
                ["cloudBudget", "Cloud com teto de gastos monitorado"],
              ].map(([key, label]) => (
                <label key={key} style={{ display: "flex", gap: 9, alignItems: "center", color: C.t2, fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={data.security[key]}
                    onChange={(e) => update(`security.${key}`, e.target.checked)}
                  />
                  {label}
                </label>
              ))}
            </div>

            <textarea
              placeholder="Observações de infraestrutura, acessos, LGPD, dados de teste ou riscos de segurança"
              value={data.security.notes}
              onChange={(e) => update("security.notes", e.target.value)}
              style={{ ...field, minHeight: 100, resize: "vertical", lineHeight: 1.6 }}
            />
          </Section>
        </div>
      )}

      {tab === "execution" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Section
            title="Execução e Acompanhamento Técnico"
            sub="Acompanhe atividades, casos de teste, responsáveis, status e comportamento do fornecedor"
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1100 }}>
                <thead>
                  <tr>
                    {["Atividade / Caso de Teste", "Responsável", "Status", "Notas de evolução / comportamento", ""].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: 9,
                          fontSize: 11,
                          color: C.t3,
                          textAlign: "left",
                          borderBottom: `1px solid ${C.border}`,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {data.execution.activities.map((row) => (
                    <tr key={row.id}>
                      <td style={{ padding: 6 }}>
                        <input
                          defaultValue={row.activity}
                          onBlur={(e) => updateRow("execution", "activities", row.id, "activity", e.target.value)}
                          style={smallField}
                        />
                      </td>

                      <td style={{ padding: 6 }}>
                        <input
                          defaultValue={row.owner}
                          onBlur={(e) => updateRow("execution", "activities", row.id, "owner", e.target.value)}
                          style={smallField}
                        />
                      </td>

                      <td style={{ padding: 6 }}>
                        <select
                          defaultValue={row.status}
                          onBlur={(e) => updateRow("execution", "activities", row.id, "status", e.target.value)}
                          style={smallField}
                        >
                          <option>Pendente</option>
                          <option>Em Andamento</option>
                          <option>Concluído</option>
                          <option>Bloqueado</option>
                        </select>
                      </td>

                      <td style={{ padding: 6 }}>
                        <input
                          placeholder="Anote evolução, suporte do fornecedor, qualidade da documentação, desvios..."
                          defaultValue={row.notes}
                          onBlur={(e) => updateRow("execution", "activities", row.id, "notes", e.target.value)}
                          style={smallField}
                        />
                      </td>

                      <td style={{ padding: 6 }}>
                        <button
                          onClick={() => removeRow("execution", "activities", row.id)}
                          style={{ ...smallField, cursor: "pointer" }}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={() =>
                addRow("execution", "activities", {
                  activity: "",
                  owner: "",
                  status: "Pendente",
                  notes: "",
                })
              }
              style={{ ...field, marginTop: 12, cursor: "pointer", fontWeight: 800 }}
            >
              + Adicionar atividade / caso de teste
            </button>
          </Section>
        </div>
      )}

      {tab === "analytics" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Section
            title="Relatório Analítico de Disparos"
            sub="Atualização diária da POC com cálculo automático de entrega, leitura, retorno e conversão"
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1350 }}>
                <thead>
                  <tr>
                    {[
                      "Data",
                      "Disparado",
                      "Total Mensagens",
                      "Entregue",
                      "Não Entregue",
                      "Em Processo",
                      "Lido",
                      "Cliques",
                      "Retorno Cliente",
                      "Acordos",
                      "Tx. Entrega",
                      "Tx. Leitura",
                      "Status",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 8px",
                          fontSize: 10,
                          color: C.t3,
                          textAlign: "left",
                          borderBottom: `1px solid ${C.border}`,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {data.analytics.rows.map((row) => {
                    const totalMensagens = toNum(row.totalMensagens);
                    const entregue = toNum(row.entregue);
                    const lido = toNum(row.lido);
                    const txEntrega = totalMensagens > 0 ? (entregue / totalMensagens) * 100 : 0;
                    const txLeitura = entregue > 0 ? (lido / entregue) * 100 : 0;

                    return (
                      <tr key={row.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: 6 }}>
                          <input
                            type="date"
                            defaultValue={row.date}
                            onBlur={(e) => updateRow("analytics", "rows", row.id, "date", e.target.value)}
                            style={smallField}
                          />
                        </td>

                        {[
                          "disparado",
                          "totalMensagens",
                          "entregue",
                          "naoEntregue",
                          "emProcesso",
                          "lido",
                          "cliques",
                          "retornoCliente",
                          "acordos",
                        ].map((key) => (
                          <td key={key} style={{ padding: 6 }}>
                            <input
                              defaultValue={row[key]}
                              onBlur={(e) => updateRow("analytics", "rows", row.id, key, e.target.value)}
                              style={smallField}
                            />
                          </td>
                        ))}

                        <td style={{ padding: 6, fontSize: 12, fontWeight: 900, color: txEntrega >= 85 ? C.emerald : txEntrega >= 70 ? C.amber : C.rose }}>
                          {pct(txEntrega)}
                        </td>

                        <td style={{ padding: 6, fontSize: 12, fontWeight: 900, color: txLeitura >= 60 ? C.emerald : txLeitura >= 45 ? C.amber : C.rose }}>
                          {pct(txLeitura)}
                        </td>

                        <td style={{ padding: 6, fontSize: 12 }}>
                          <DayStatus row={row} />
                        </td>

                        <td style={{ padding: 6 }}>
                          <button
                            onClick={() => removeRow("analytics", "rows", row.id)}
                            style={{ ...smallField, cursor: "pointer" }}
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  <tr style={{ background: C.bg2, borderTop: `2px solid ${C.borderStrong}` }}>
                    <td style={{ padding: "12px 8px", fontSize: 12, fontWeight: 900, color: C.t1 }}>
                      TOTAL / MÉDIA
                    </td>
                    <td style={{ padding: "12px 8px", fontSize: 12, fontWeight: 900, color: C.t1 }}>{metrics.disparado}</td>
                    <td style={{ padding: "12px 8px", fontSize: 12, fontWeight: 900, color: C.t1 }}>{metrics.totalMensagens}</td>
                    <td style={{ padding: "12px 8px", fontSize: 12, fontWeight: 900, color: C.t1 }}>{metrics.entregue}</td>
                    <td style={{ padding: "12px 8px", fontSize: 12, fontWeight: 900, color: C.t1 }}>{metrics.naoEntregue}</td>
                    <td style={{ padding: "12px 8px", fontSize: 12, fontWeight: 900, color: C.t1 }}>{metrics.emProcesso}</td>
                    <td style={{ padding: "12px 8px", fontSize: 12, fontWeight: 900, color: C.t1 }}>{metrics.lido}</td>
                    <td style={{ padding: "12px 8px", fontSize: 12, fontWeight: 900, color: C.t1 }}>{metrics.cliques}</td>
                    <td style={{ padding: "12px 8px", fontSize: 12, fontWeight: 900, color: C.t1 }}>{metrics.retornoCliente}</td>
                    <td style={{ padding: "12px 8px", fontSize: 12, fontWeight: 900, color: C.t1 }}>{metrics.acordos}</td>
                    <td style={{ padding: "12px 8px", fontSize: 12, fontWeight: 900, color: C.emerald }}>{pct(metrics.taxaEntrega)}</td>
                    <td style={{ padding: "12px 8px", fontSize: 12, fontWeight: 900, color: C.blue }}>{pct(metrics.taxaLeituraEntregues)}</td>
                    <td style={{ padding: "12px 8px", fontSize: 12, fontWeight: 900, color: C.t2 }}>—</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>

            <button
              onClick={() =>
                addRow("analytics", "rows", {
                  date: "",
                  disparado: "",
                  totalMensagens: "",
                  entregue: "",
                  naoEntregue: "",
                  emProcesso: "",
                  lido: "",
                  cliques: "",
                  retornoCliente: "",
                  acordos: "",
                  observation: "",
                })
              }
              style={{ ...field, marginTop: 12, cursor: "pointer", fontWeight: 800 }}
            >
              + Adicionar dia
            </button>
          </Section>

          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 16 }}>
            <Section title="Funil de Conversão" sub="Base do funil: Total de mensagens. Percentuais calculados conforme regra de negócio da POC">
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
                  <thead>
                    <tr>
                      {["Etapa do Funil", "Volume", "% s/ anterior", "% s/ disparados", "Observação"].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "10px 8px",
                            fontSize: 10,
                            color: C.t3,
                            textAlign: "left",
                            borderBottom: `1px solid ${C.border}`,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {(() => {
                      const baseFunil = metrics.totalMensagens || 0;

                      const etapas = [
                        {
                          etapa: "Total de mensagens",
                          volume: metrics.totalMensagens,
                          anterior: null,
                          disparados: 100,
                          obs: "Base total registrada no relatório",
                        },
                        {
                          etapa: "Entregue",
                          volume: metrics.entregue,
                          anterior: baseFunil ? (metrics.entregue / baseFunil) * 100 : 0,
                          disparados: baseFunil ? (metrics.entregue / baseFunil) * 100 : 0,
                          obs: "Entregue / Total de mensagens",
                        },
                        {
                          etapa: "Lido",
                          volume: metrics.lido,
                          anterior: metrics.entregue ? (metrics.lido / metrics.entregue) * 100 : 0,
                          disparados: baseFunil ? (metrics.lido / baseFunil) * 100 : 0,
                          obs: "Lido / Entregue",
                        },
                        {
                          etapa: "Clique",
                          volume: metrics.cliques,
                          anterior: metrics.lido ? (metrics.cliques / metrics.lido) * 100 : 0,
                          disparados: baseFunil ? (metrics.cliques / baseFunil) * 100 : 0,
                          obs: "Clique / Lido",
                        },
                        {
                          etapa: "Retorno de clientes",
                          volume: metrics.retornoCliente,
                          anterior: metrics.cliques ? (metrics.retornoCliente / metrics.cliques) * 100 : 0,
                          disparados: baseFunil ? (metrics.retornoCliente / baseFunil) * 100 : 0,
                          obs: "Retorno / Clique",
                        },
                        {
                          etapa: "Acordos gerados",
                          volume: metrics.acordos,
                          anterior: metrics.retornoCliente ? (metrics.acordos / metrics.retornoCliente) * 100 : 0,
                          disparados: baseFunil ? (metrics.acordos / baseFunil) * 100 : 0,
                          obs: "Acordo / Retorno",
                        },
                      ];

                      return etapas.map((row) => (
                        <tr key={row.etapa} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: "10px 8px", fontSize: 12, color: C.t1, fontWeight: 800 }}>
                            {row.etapa}
                          </td>

                          <td style={{ padding: "10px 8px", fontSize: 13, color: C.blue, fontWeight: 900 }}>
                            {row.volume}
                          </td>

                          <td style={{ padding: "10px 8px", fontSize: 12, color: C.t2 }}>
                            {row.anterior === null ? "—" : pct(row.anterior)}
                          </td>

                          <td style={{ padding: "10px 8px", fontSize: 12, color: C.t2 }}>
                            {pct(row.disparados)}
                          </td>

                          <td style={{ padding: "10px 8px", fontSize: 12, color: C.t2 }}>
                            {row.obs}
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section title="Indicadores" sub="Resumo automático da performance da POC">
              {[
                ["Taxa de entrega geral", metrics.taxaEntrega, C.emerald],
                ["Taxa de leitura s/ entregues", metrics.taxaLeituraEntregues, C.blue],
                ["Taxa de leitura s/ disparados", metrics.taxaLeituraDisparados, C.violet],
                ["Taxa de retorno s/ lidos", metrics.taxaRetornoLidos, C.amber],
                ["Taxa de conversão final", metrics.taxaConversaoFinal, C.rose],
              ].map(([label, value, color]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "11px 0",
                    borderBottom: `1px solid ${C.border}`,
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: C.t2 }}>{label}</span>
                  <strong style={{ color }}>{pct(value)}</strong>
                </div>
              ))}
            </Section>
          </div>
        </div>
      )}

      {tab === "incidents" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Section title="Registro de Impedimentos" sub="Justificativa de atrasos e dependências">
            {(data.execution.blockers || []).map((row) => (
              <div key={row.id} style={{ display: "grid", gridTemplateColumns: "150px 1fr 180px 110px 130px 90px", gap: 8, marginBottom: 8 }}>
                <input type="date" value={row.date} onChange={(e) => updateRow("execution", "blockers", row.id, "date", e.target.value)} style={smallField} />
                <input placeholder="Impedimento" value={row.blocker} onChange={(e) => updateRow("execution", "blockers", row.id, "blocker", e.target.value)} style={smallField} />
                <input placeholder="Responsável" value={row.owner} onChange={(e) => updateRow("execution", "blockers", row.id, "owner", e.target.value)} style={smallField} />
                <input placeholder="Dias" value={row.daysStopped} onChange={(e) => updateRow("execution", "blockers", row.id, "daysStopped", e.target.value)} style={smallField} />
                <select value={row.status} onChange={(e) => updateRow("execution", "blockers", row.id, "status", e.target.value)} style={smallField}><option>Aberto</option><option>Resolvido</option><option>Monitorar</option></select>
                <button onClick={() => removeRow("execution", "blockers", row.id)} style={{ ...smallField, cursor: "pointer" }}>Excluir</button>
              </div>
            ))}
            <button onClick={() => addRow("execution", "blockers", { date: "", blocker: "", owner: "", daysStopped: "", status: "Aberto" })} style={{ ...field, cursor: "pointer", fontWeight: 800 }}>+ Adicionar impedimento</button>
          </Section>

          <Section title="Log de Erros e Incidentes" sub="Controle de severidade, causa raiz, solução e horas paradas">
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1250 }}>
                <thead>
                  <tr>
                    {["Incidente", "Sev.", "Impacto", "Causa raiz", "Solução", "Horas", "Status", "Deep Dive", ""].map((h) => (
                      <th key={h} style={{ padding: 9, fontSize: 11, color: C.t3, textAlign: "left", borderBottom: `1px solid ${C.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.incidents.rows.map((row) => (
                    <tr key={row.id}>
                      <td style={{ padding: 6 }}><input value={row.incident} onChange={(e) => updateRow("incidents", "rows", row.id, "incident", e.target.value)} style={smallField} /></td>
                      <td style={{ padding: 6 }}><select value={row.severity} onChange={(e) => updateRow("incidents", "rows", row.id, "severity", e.target.value)} style={smallField}><option>Baixa</option><option>Média</option><option>Alta</option><option>Crítica</option></select></td>
                      <td style={{ padding: 6 }}><input value={row.businessImpact} onChange={(e) => updateRow("incidents", "rows", row.id, "businessImpact", e.target.value)} style={smallField} /></td>
                      <td style={{ padding: 6 }}><input value={row.rootCause} onChange={(e) => updateRow("incidents", "rows", row.id, "rootCause", e.target.value)} style={smallField} /></td>
                      <td style={{ padding: 6 }}><input value={row.solution} onChange={(e) => updateRow("incidents", "rows", row.id, "solution", e.target.value)} style={smallField} /></td>
                      <td style={{ padding: 6 }}><input value={row.hours} onChange={(e) => updateRow("incidents", "rows", row.id, "hours", e.target.value)} style={smallField} /></td>
                      <td style={{ padding: 6 }}><select value={row.status} onChange={(e) => updateRow("incidents", "rows", row.id, "status", e.target.value)} style={smallField}><option>Pendente</option><option>Monitorar</option><option>Resolvido</option></select></td>
                      <td style={{ padding: 6 }}><input value={row.deepDive} onChange={(e) => updateRow("incidents", "rows", row.id, "deepDive", e.target.value)} style={smallField} /></td>
                      <td style={{ padding: 6 }}><button onClick={() => removeRow("incidents", "rows", row.id)} style={{ ...smallField, cursor: "pointer" }}>Excluir</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={() => addRow("incidents", "rows", { incident: "", severity: "Média", businessImpact: "", rootCause: "", solution: "", hours: "", status: "Pendente", deepDive: "" })} style={{ ...field, marginTop: 12, cursor: "pointer", fontWeight: 800 }}>+ Novo incidente</button>
          </Section>
        </div>
      )}

      {tab === "evaluation" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Section title="Matriz de Avaliação Final" sub="Notas de 1 a 5 para tomada de decisão">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 14 }}>
              <input placeholder="Funcionalidade (1 a 5)" value={data.evaluation.functionality} onChange={(e) => update("evaluation.functionality", e.target.value)} style={field} />
              <input placeholder="Performance (1 a 5)" value={data.evaluation.performance} onChange={(e) => update("evaluation.performance", e.target.value)} style={field} />
              <input placeholder="Suporte (1 a 5)" value={data.evaluation.support} onChange={(e) => update("evaluation.support", e.target.value)} style={field} />
              <input placeholder="Implementação (1 a 5)" value={data.evaluation.implementation} onChange={(e) => update("evaluation.implementation", e.target.value)} style={field} />
            </div>
            <div style={{ fontSize: 13, color: C.t2 }}>
              Score médio: <strong style={{ color: averageScore >= 4 ? C.emerald : averageScore >= 3 ? C.amber : C.rose }}>{averageScore.toFixed(1)}</strong>
            </div>
          </Section>

          <Section title="Descomissionamento e Segurança" sub="Garantia de encerramento seguro da POC">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[
                ["credentialsRevoked", "Credenciais revogadas"],
                ["dataPurged", "Dados expurgados"],
                ["cloudStopped", "Infra cloud pausada/desprovida"],
              ].map(([key, label]) => (
                <label key={key} style={{ display: "flex", gap: 9, alignItems: "center", color: C.t2, fontSize: 13 }}>
                  <input type="checkbox" checked={data.evaluation[key]} onChange={(e) => update(`evaluation.${key}`, e.target.checked)} />
                  {label}
                </label>
              ))}
            </div>
          </Section>

          <Section title="Recomendação Final" sub="Decisão técnica para apresentação à liderança">
            <select value={data.evaluation.recommendation} onChange={(e) => update("evaluation.recommendation", e.target.value)} style={{ ...field, marginBottom: 12 }}>
              <option>Em avaliação</option>
              <option>Aprovado</option>
              <option>Reprovado</option>
              <option>Aprovado com condições</option>
            </select>

            <textarea placeholder="Condições, observações finais e próximos passos" defaultValue={data.evaluation.conditions} onBlur={(e) => update("evaluation.conditions", e.target.value)} style={{ ...field, minHeight: 130, resize: "vertical" }} />
          </Section>
        </div>
      )}
    </div>
  );
}
