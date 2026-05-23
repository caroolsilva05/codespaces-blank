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
    dailyGoal: "",
    pocDays: "",
    status: "Em Planejamento",
    pocType: "Canais Digitais",
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
  enrichment: {
    rows: [
      {
        id: 1,
        date: "",
        baseRecebida: "",
        baseProcessada: "",
        registrosEnriquecidos: "",
        naoLocalizados: "",
        invalidos: "",
        telefonesNovos: "",
        emailsNovos: "",
        scoreQualidade: "",
        observation: "",
      },
    ],
    criteria: [
      { id: 1, indicador: "Cobertura de enriquecimento", meta: "", resultado: "", status: "Pendente" },
      { id: 2, indicador: "Qualidade / assertividade dos dados", meta: "", resultado: "", status: "Pendente" },
      { id: 3, indicador: "Aderência LGPD / compliance", meta: "", resultado: "", status: "Pendente" },
      { id: 4, indicador: "Tempo de processamento", meta: "", resultado: "", status: "Pendente" },
    ],
    executiveAnalysis: "",
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
    kpiResults: [],
    dealBreakers: [
      { key: "security", label: "Falha crítica de segurança / LGPD", checked: false },
      { key: "integration", label: "Integração crítica não funcionou", checked: false },
      { key: "availability", label: "Disponibilidade ou performance inviável", checked: false },
      { key: "support", label: "Fornecedor não atendeu suporte/SLA mínimo", checked: false },
      { key: "cost", label: "Custo ou operação inviável para escala", checked: false },
    ],
    qualitative: {
      support: "0",
      communication: "0",
      incidentResponse: "0",
      technicalCapacity: "0",
      documentation: "0",
      implementationEase: "0",
    },
    baseline: {
      currentDelivery: "",
      supplierDelivery: "",
      currentReading: "",
      supplierReading: "",
      currentConversion: "",
      supplierConversion: "",
      notes: "",
    },
    recommendationJustification: "",
    recommendationOwner: "",
    recommendationDate: "",
    leadershipApproval: "Pendente",
    decommissioning: [
      { key: "credentialsRevoked", label: "Credenciais e tokens revogados", checked: false },
      { key: "vpnAccessRemoved", label: "Acessos VPN/IPs removidos", checked: false },
      { key: "dataPurged", label: "Dados de teste expurgados", checked: false },
      { key: "residualDataValidated", label: "Dados residuais validados", checked: false },
      { key: "cloudStopped", label: "Infra cloud pausada/desprovida", checked: false },
      { key: "supplierNotified", label: "Fornecedor notificado formalmente", checked: false },
      { key: "internalSystemUpdated", label: "Registro atualizado no sistema interno", checked: false },
      { key: "finalEvidenceStored", label: "Evidências finais armazenadas", checked: false },
    ],
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

function calcEnrichmentMetrics(rows) {
  const totals = rows.reduce(
    (acc, row) => {
      acc.baseRecebida += toNum(row.baseRecebida);
      acc.baseProcessada += toNum(row.baseProcessada);
      acc.registrosEnriquecidos += toNum(row.registrosEnriquecidos);
      acc.naoLocalizados += toNum(row.naoLocalizados);
      acc.invalidos += toNum(row.invalidos);
      acc.telefonesNovos += toNum(row.telefonesNovos);
      acc.emailsNovos += toNum(row.emailsNovos);
      acc.scoreQualidadeSoma += toNum(row.scoreQualidade);
      acc.scoreQualidadeQtd += String(row.scoreQualidade || "").trim() ? 1 : 0;
      return acc;
    },
    {
      baseRecebida: 0,
      baseProcessada: 0,
      registrosEnriquecidos: 0,
      naoLocalizados: 0,
      invalidos: 0,
      telefonesNovos: 0,
      emailsNovos: 0,
      scoreQualidadeSoma: 0,
      scoreQualidadeQtd: 0,
    }
  );

  const taxaProcessamento =
    totals.baseRecebida > 0 ? (totals.baseProcessada / totals.baseRecebida) * 100 : 0;

  const taxaEnriquecimento =
    totals.baseProcessada > 0 ? (totals.registrosEnriquecidos / totals.baseProcessada) * 100 : 0;

  const taxaInvalidos =
    totals.baseProcessada > 0 ? (totals.invalidos / totals.baseProcessada) * 100 : 0;

  const scoreQualidadeMedio =
    totals.scoreQualidadeQtd > 0 ? totals.scoreQualidadeSoma / totals.scoreQualidadeQtd : 0;

  return {
    ...totals,
    taxaProcessamento,
    taxaEnriquecimento,
    taxaInvalidos,
    scoreQualidadeMedio,
  };
}

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function deepMerge(base, extra) {
  const output = cloneData(base);

  function merge(target, source) {
    if (!source || typeof source !== "object") return target;

    Object.keys(source).forEach((key) => {
      const value = source[key];

      if (Array.isArray(value)) {
        target[key] = value;
      } else if (value && typeof value === "object") {
        target[key] = merge(target[key] || {}, value);
      } else if (value !== undefined) {
        target[key] = value;
      }
    });

    return target;
  }

  return merge(output, extra);
}

export default function PocRegister({ C, registroInicial = null, pocTypeInicial = "Canais Digitais", onSaved = null, onClose = null } = {}) {
  const [tab, setTab] = useState("overview");
  const [saving, setSaving] = useState(false);
  const [lastEditedAt, setLastEditedAt] = useState(null);
  const [data, setData] = useState(() => {
    const saved = registroInicial?.record_data || registroInicial?.dados_do_registro || null;

    if (saved) {
      return deepMerge(emptyPoc, saved);
    }

    const novaPoc = cloneData(emptyPoc);
    novaPoc.general.pocType = pocTypeInicial || "Canais Digitais";
    return novaPoc;
  });

  const metrics = useMemo(() => calcMetrics(data.analytics.rows || []), [data.analytics.rows]);
  const enrichmentMetrics = useMemo(() => calcEnrichmentMetrics(data.enrichment?.rows || []), [data.enrichment?.rows]);

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
          <TabButton id="analytics" label={data.general.pocType === "Enriquecimento de Dados" ? "Relatório de Enriquecimento" : "Relatório Analítico"} />
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
                  ["Qtd. disparo por dia", data.general.dailyGoal ? `${data.general.dailyGoal} disparos/dia` : "-"],
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
            <div style={{ marginBottom: 14, display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, background: C.blueGlow, border: `1px solid ${C.blue}33`, color: C.blue, fontSize: 12, fontWeight: 900 }}>
              Tipo de POC: {data.general.pocType || "Canais Digitais"}
            </div>

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

              <div>
                <div style={{ fontSize: 10, color: C.t3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                  Quantidade de disparo por dia
                </div>
                <input
                  placeholder="Ex: 300"
                  defaultValue={data.general.dailyGoal}
                  onBlur={(e) => update("general.dailyGoal", e.target.value)}
                  style={field}
                />
              </div>

              <div>
                <div style={{ fontSize: 10, color: C.t3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                  Duração da POC
                </div>
                <input
                  placeholder="Ex: 30 dias"
                  defaultValue={data.general.pocDays}
                  onBlur={(e) => update("general.pocDays", e.target.value)}
                  style={field}
                />
              </div>

              <select
                value={data.general.status}
                onChange={(e) => update("general.status", e.target.value)}
                style={{ ...field, maxWidth: 360 }}
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


      {tab === "analytics" && data.general.pocType === "Enriquecimento de Dados" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
            <MetricCard label="Base recebida" value={enrichmentMetrics.baseRecebida} sub="Registros enviados" color={C.violet} />
            <MetricCard label="Processados" value={enrichmentMetrics.baseProcessada} sub={pct(enrichmentMetrics.taxaProcessamento)} color={C.blue} />
            <MetricCard label="Enriquecidos" value={enrichmentMetrics.registrosEnriquecidos} sub={pct(enrichmentMetrics.taxaEnriquecimento)} color={C.emerald} />
            <MetricCard label="Score qualidade" value={pct(enrichmentMetrics.scoreQualidadeMedio)} sub="Média informada" color={enrichmentMetrics.scoreQualidadeMedio >= 80 ? C.emerald : enrichmentMetrics.scoreQualidadeMedio >= 60 ? C.amber : C.rose} />
          </div>

          <Section
            title="Relatório Analítico de Enriquecimento de Dados"
            sub="Controle da base processada, taxa de enriquecimento, qualidade dos dados e inconsistências"
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1250 }}>
                <thead>
                  <tr>
                    {[
                      "Data",
                      "Base recebida",
                      "Base processada",
                      "Registros enriquecidos",
                      "Não localizados",
                      "Inválidos",
                      "Telefones novos",
                      "E-mails novos",
                      "Score qualidade",
                      "Tx. enriquecimento",
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
                  {(data.enrichment?.rows || []).map((row) => {
                    const baseProcessada = toNum(row.baseProcessada);
                    const enriquecidos = toNum(row.registrosEnriquecidos);
                    const txEnriquecimento = baseProcessada > 0 ? (enriquecidos / baseProcessada) * 100 : 0;

                    return (
                      <tr key={row.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: 6 }}>
                          <input
                            type="date"
                            defaultValue={row.date}
                            onBlur={(e) => updateRow("enrichment", "rows", row.id, "date", e.target.value)}
                            style={smallField}
                          />
                        </td>

                        {[
                          "baseRecebida",
                          "baseProcessada",
                          "registrosEnriquecidos",
                          "naoLocalizados",
                          "invalidos",
                          "telefonesNovos",
                          "emailsNovos",
                          "scoreQualidade",
                        ].map((key) => (
                          <td key={key} style={{ padding: 6 }}>
                            <input
                              defaultValue={row[key]}
                              onBlur={(e) => updateRow("enrichment", "rows", row.id, key, e.target.value)}
                              style={smallField}
                            />
                          </td>
                        ))}

                        <td style={{ padding: 6, fontSize: 12, fontWeight: 900, color: txEnriquecimento >= 80 ? C.emerald : txEnriquecimento >= 60 ? C.amber : C.rose }}>
                          {pct(txEnriquecimento)}
                        </td>

                        <td style={{ padding: 6 }}>
                          <button
                            onClick={() => removeRow("enrichment", "rows", row.id)}
                            style={{ ...smallField, cursor: "pointer" }}
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  <tr style={{ background: C.bg2, borderTop: `2px solid ${C.borderStrong}` }}>
                    <td style={{ padding: "12px 8px", fontSize: 12, fontWeight: 900, color: C.t1 }}>TOTAL / MÉDIA</td>
                    <td style={{ padding: "12px 8px", fontSize: 12, fontWeight: 900, color: C.t1 }}>{enrichmentMetrics.baseRecebida}</td>
                    <td style={{ padding: "12px 8px", fontSize: 12, fontWeight: 900, color: C.t1 }}>{enrichmentMetrics.baseProcessada}</td>
                    <td style={{ padding: "12px 8px", fontSize: 12, fontWeight: 900, color: C.emerald }}>{enrichmentMetrics.registrosEnriquecidos}</td>
                    <td style={{ padding: "12px 8px", fontSize: 12, fontWeight: 900, color: C.t1 }}>{enrichmentMetrics.naoLocalizados}</td>
                    <td style={{ padding: "12px 8px", fontSize: 12, fontWeight: 900, color: C.rose }}>{enrichmentMetrics.invalidos}</td>
                    <td style={{ padding: "12px 8px", fontSize: 12, fontWeight: 900, color: C.t1 }}>{enrichmentMetrics.telefonesNovos}</td>
                    <td style={{ padding: "12px 8px", fontSize: 12, fontWeight: 900, color: C.t1 }}>{enrichmentMetrics.emailsNovos}</td>
                    <td style={{ padding: "12px 8px", fontSize: 12, fontWeight: 900, color: C.blue }}>{pct(enrichmentMetrics.scoreQualidadeMedio)}</td>
                    <td style={{ padding: "12px 8px", fontSize: 12, fontWeight: 900, color: C.emerald }}>{pct(enrichmentMetrics.taxaEnriquecimento)}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>

            <button
              onClick={() =>
                addRow("enrichment", "rows", {
                  date: "",
                  baseRecebida: "",
                  baseProcessada: "",
                  registrosEnriquecidos: "",
                  naoLocalizados: "",
                  invalidos: "",
                  telefonesNovos: "",
                  emailsNovos: "",
                  scoreQualidade: "",
                  observation: "",
                })
              }
              style={{ ...field, marginTop: 12, cursor: "pointer", fontWeight: 800 }}
            >
              + Adicionar processamento
            </button>
          </Section>

          <Section
            title="Critérios de Validação do Enriquecimento"
            sub="Indicadores específicos para avaliar qualidade, cobertura, compliance e viabilidade da solução"
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                <thead>
                  <tr>
                    {["Indicador", "Meta", "Resultado", "Status", ""].map((h) => (
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
                  {(data.enrichment?.criteria || []).map((row) => (
                    <tr key={row.id}>
                      <td style={{ padding: 6 }}>
                        <input
                          defaultValue={row.indicador}
                          onBlur={(e) => updateRow("enrichment", "criteria", row.id, "indicador", e.target.value)}
                          style={smallField}
                        />
                      </td>

                      <td style={{ padding: 6 }}>
                        <input
                          placeholder="Meta esperada"
                          defaultValue={row.meta}
                          onBlur={(e) => updateRow("enrichment", "criteria", row.id, "meta", e.target.value)}
                          style={smallField}
                        />
                      </td>

                      <td style={{ padding: 6 }}>
                        <input
                          placeholder="Resultado observado"
                          defaultValue={row.resultado}
                          onBlur={(e) => updateRow("enrichment", "criteria", row.id, "resultado", e.target.value)}
                          style={smallField}
                        />
                      </td>

                      <td style={{ padding: 6 }}>
                        <select
                          defaultValue={row.status}
                          onBlur={(e) => updateRow("enrichment", "criteria", row.id, "status", e.target.value)}
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
                          onClick={() => removeRow("enrichment", "criteria", row.id)}
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
                addRow("enrichment", "criteria", {
                  indicador: "",
                  meta: "",
                  resultado: "",
                  status: "Pendente",
                })
              }
              style={{ ...field, marginTop: 12, cursor: "pointer", fontWeight: 800 }}
            >
              + Adicionar critério
            </button>
          </Section>

          <Section title="Análise Executiva do Enriquecimento" sub="Conclusão técnica e recomendação sobre qualidade da base enriquecida">
            <textarea
              placeholder="Escreva a análise do enriquecimento: qualidade da base, cobertura obtida, dados inválidos, aderência LGPD, riscos e recomendação executiva."
              defaultValue={data.enrichment?.executiveAnalysis || ""}
              onBlur={(e) => update("enrichment.executiveAnalysis", e.target.value)}
              style={{ ...field, minHeight: 130, resize: "vertical", lineHeight: 1.6 }}
            />
          </Section>
        </div>
      )}


      {tab === "analytics" && data.general.pocType !== "Enriquecimento de Dados" && (
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
          {(() => {
            const defaultDealBreakers = [
              { key: "security", label: "Falha crítica de segurança / LGPD", checked: false },
              { key: "integration", label: "Integração crítica não funcionou", checked: false },
              { key: "availability", label: "Disponibilidade ou performance inviável", checked: false },
              { key: "support", label: "Fornecedor não atendeu suporte/SLA mínimo", checked: false },
              { key: "cost", label: "Custo ou operação inviável para escala", checked: false },
            ];

            const defaultDecommissioning = [
              { key: "credentialsRevoked", label: "Credenciais e tokens revogados", checked: false },
              { key: "vpnAccessRemoved", label: "Acessos VPN/IPs removidos", checked: false },
              { key: "dataPurged", label: "Dados de teste expurgados", checked: false },
              { key: "residualDataValidated", label: "Dados residuais validados", checked: false },
              { key: "cloudStopped", label: "Infra cloud pausada/desprovida", checked: false },
              { key: "supplierNotified", label: "Fornecedor notificado formalmente", checked: false },
              { key: "internalSystemUpdated", label: "Registro atualizado no sistema interno", checked: false },
              { key: "finalEvidenceStored", label: "Evidências finais armazenadas", checked: false },
            ];

            const evaluation = data.evaluation || {};
            const planningKpis = (data.planning?.successCriteria || []).filter((kpi) => kpi.kpi);
            const savedKpis = evaluation.kpiResults || [];

            const kpiRows = planningKpis.map((kpi, index) => {
              const saved = savedKpis.find((item) => item.kpiId === kpi.id) || {};
              const statusBase =
                kpi.status === "Atendido"
                  ? 100
                  : kpi.status === "Parcial"
                  ? 60
                  : kpi.status === "Não atendido"
                  ? 0
                  : "";

              return {
                kpiId: kpi.id,
                name: kpi.kpi || `KPI ${index + 1}`,
                target: kpi.target || "-",
                result: saved.result ?? kpi.result ?? "",
                attainment: saved.attainment ?? statusBase,
                weight: saved.weight ?? "1",
                notes: saved.notes ?? "",
              };
            });

            const gradeFromAttainment = (value) => {
              if (value === "" || value === null || value === undefined) return 0;
              const n = toNum(value);
              if (n >= 100) return 5;
              if (n >= 80) return 4;
              if (n >= 60) return 3;
              if (n >= 40) return 2;
              return 1;
            };

            const evaluatedKpis = kpiRows.filter((item) => item.attainment !== "" && item.attainment !== null && item.attainment !== undefined);
            const totalWeight = evaluatedKpis.reduce((acc, item) => acc + Math.max(0, toNum(item.weight || 1)), 0);
            const weightedScore5 = totalWeight
              ? evaluatedKpis.reduce((acc, item) => acc + gradeFromAttainment(item.attainment) * Math.max(0, toNum(item.weight || 1)), 0) / totalWeight
              : 0;

            const score10 = weightedScore5 * 2;
            const kpiCompletion = planningKpis.length ? (evaluatedKpis.length / planningKpis.length) * 100 : 0;

            const savedDealBreakers = evaluation.dealBreakers || [];
            const dealBreakers = defaultDealBreakers.map((item) => ({
              ...item,
              checked: Boolean(savedDealBreakers.find((saved) => saved.key === item.key)?.checked),
            }));

            const hasDealBreaker = dealBreakers.some((item) => item.checked);

            const scoreColor = hasDealBreaker
              ? C.rose
              : score10 >= 8
              ? C.emerald
              : score10 >= 6
              ? C.amber
              : C.rose;

            const scoreLabel = hasDealBreaker
              ? "Bloqueado por deal-breaker"
              : score10 >= 8
              ? "Favorável"
              : score10 >= 6
              ? "Atenção / Condições"
              : "Não favorável";

            const qualitative = {
              support: evaluation.qualitative?.support || "0",
              communication: evaluation.qualitative?.communication || "0",
              incidentResponse: evaluation.qualitative?.incidentResponse || "0",
              technicalCapacity: evaluation.qualitative?.technicalCapacity || "0",
              documentation: evaluation.qualitative?.documentation || "0",
              implementationEase: evaluation.qualitative?.implementationEase || "0",
            };

            const qualitativeItems = [
              ["support", "Suporte do fornecedor"],
              ["communication", "Comunicação e alinhamento"],
              ["incidentResponse", "Velocidade de resposta a incidentes"],
              ["technicalCapacity", "Capacidade técnica"],
              ["documentation", "Documentação entregue"],
              ["implementationEase", "Facilidade de implementação"],
            ];

            const baseline = evaluation.baseline || {};
            const savedDecommissioning = evaluation.decommissioning || [];
            const decommissioning = defaultDecommissioning.map((item) => ({
              ...item,
              checked:
                Boolean(savedDecommissioning.find((saved) => saved.key === item.key)?.checked) ||
                Boolean(evaluation[item.key]),
            }));

            function updateEvaluationPatch(patch) {
              setLastEditedAt(new Date());
              setData((prev) => {
                const next = cloneData(prev);
                next.evaluation = {
                  ...(next.evaluation || {}),
                  ...patch,
                };
                return next;
              });
            }

            function updateKpiResult(kpiId, patch) {
              setLastEditedAt(new Date());
              setData((prev) => {
                const next = cloneData(prev);
                const current = next.evaluation?.kpiResults || [];
                const index = current.findIndex((item) => item.kpiId === kpiId);

                if (index >= 0) {
                  current[index] = { ...current[index], ...patch };
                } else {
                  current.push({ kpiId, ...patch });
                }

                next.evaluation = {
                  ...(next.evaluation || {}),
                  kpiResults: current,
                };

                return next;
              });
            }

            function updateDealBreaker(key, checked) {
              setLastEditedAt(new Date());
              setData((prev) => {
                const next = cloneData(prev);
                const current = defaultDealBreakers.map((item) => {
                  const saved = (next.evaluation?.dealBreakers || []).find((d) => d.key === item.key);
                  return { ...item, checked: Boolean(saved?.checked) };
                });

                const updated = current.map((item) => item.key === key ? { ...item, checked } : item);

                next.evaluation = {
                  ...(next.evaluation || {}),
                  dealBreakers: updated,
                };

                return next;
              });
            }

            function updateQualitative(key, value) {
              setLastEditedAt(new Date());
              setData((prev) => {
                const next = cloneData(prev);
                next.evaluation = {
                  ...(next.evaluation || {}),
                  qualitative: {
                    ...(next.evaluation?.qualitative || {}),
                    [key]: value,
                  },
                };
                return next;
              });
            }

            function updateBaseline(key, value) {
              setLastEditedAt(new Date());
              setData((prev) => {
                const next = cloneData(prev);
                next.evaluation = {
                  ...(next.evaluation || {}),
                  baseline: {
                    ...(next.evaluation?.baseline || {}),
                    [key]: value,
                  },
                };
                return next;
              });
            }

            function updateDecommissioning(key, checked) {
              setLastEditedAt(new Date());
              setData((prev) => {
                const next = cloneData(prev);
                const current = defaultDecommissioning.map((item) => {
                  const saved = (next.evaluation?.decommissioning || []).find((d) => d.key === item.key);
                  return { ...item, checked: Boolean(saved?.checked) || Boolean(next.evaluation?.[item.key]) };
                });

                const updated = current.map((item) => item.key === key ? { ...item, checked } : item);

                next.evaluation = {
                  ...(next.evaluation || {}),
                  decommissioning: updated,
                  [key]: checked,
                };

                return next;
              });
            }

            return (
              <>
                <Section title="Score Final da POC" sub="Resultado ponderado calculado a partir dos KPIs, deal-breakers e critérios avaliados">
                  <div style={{ display: "grid", gridTemplateColumns: "190px 0.75fr 1fr", gap: 14, alignItems: "stretch" }}>
                    <div
                      style={{
                        background: hasDealBreaker ? (C.roseGlow || "rgba(239,68,68,0.10)") : C.bg3,
                        border: `1px solid ${hasDealBreaker ? C.rose : C.border}`,
                        borderRadius: 14,
                        padding: 14,
                        animation: hasDealBreaker ? "pocPulseAlert 1.6s infinite" : "none",
                      }}
                    >
                      <div style={{ fontSize: 11, color: C.t3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Score ponderado
                      </div>
                      <div style={{ fontSize: 38, fontWeight: 950, color: scoreColor, lineHeight: 1.05, marginTop: 8 }}>
                        {score10.toFixed(1)}
                      </div>
                      <div style={{ fontSize: 12, color: scoreColor, fontWeight: 900, marginTop: 4 }}>
                        {scoreLabel}
                      </div>
                      <div style={{ fontSize: 11, color: C.t3, marginTop: 5 }}>
                        Escala 0–10
                      </div>
                    </div>

                    <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14 }}>
                      <div style={{ fontSize: 11, color: C.t3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        KPIs avaliados
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 950, color: C.blue, marginTop: 8 }}>
                        {evaluatedKpis.length}/{planningKpis.length || 0}
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <SimpleBar value={kpiCompletion} color={C.blue} />
                      </div>
                      <div style={{ fontSize: 12, color: C.t2, marginTop: 8 }}>
                        {pct(kpiCompletion)} dos critérios com resultado informado
                      </div>
                    </div>

                    <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14 }}>
                      <div style={{ fontSize: 11, color: C.t3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                        Chips por indicador
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {kpiRows.length === 0 && (
                          <span style={{ fontSize: 12, color: C.t3 }}>
                            Cadastre os KPIs na aba Planejamento.
                          </span>
                        )}

                        {kpiRows.map((item) => {
                          const grade = gradeFromAttainment(item.attainment);
                          const color = grade >= 5 ? C.emerald : grade >= 3 ? C.amber : item.attainment === "" ? C.t3 : C.rose;
                          const bg = grade >= 5 ? C.emeraldGlow : grade >= 3 ? C.amberGlow : item.attainment === "" ? C.bg1 : (C.roseGlow || "rgba(239,68,68,0.10)");

                          return (
                            <span
                              key={item.kpiId}
                              style={{
                                background: bg,
                                border: `1px solid ${color}44`,
                                color,
                                borderRadius: 999,
                                padding: "4px 8px",
                                fontSize: 10,
                                fontWeight: 800,
                              }}
                            >
                              {item.name}: {item.attainment === "" ? "pendente" : `${item.attainment}%`}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Section>

                <Section title="Meta vs. Realidade" sub="KPIs vindos do Planejamento. Preencha o resultado alcançado e o atingimento para cálculo automático do score">
                  {kpiRows.length === 0 ? (
                    <div style={{ padding: 18, background: C.bg3, borderRadius: 12, color: C.t3, fontSize: 13 }}>
                      Nenhum KPI cadastrado ainda. Vá em Planejamento e adicione os critérios de sucesso da POC.
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1050 }}>
                        <thead>
                          <tr>
                            {["KPI", "Meta acordada", "Resultado alcançado", "Atingimento %", "Nota 1–5", "Peso", "Peso ponderado", "Observação"].map((h) => (
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
                          {kpiRows.map((item) => {
                            const grade = gradeFromAttainment(item.attainment);
                            const weight = Math.max(0, toNum(item.weight || 1));
                            const weighted = grade * weight;

                            return (
                              <tr key={item.kpiId} style={{ borderBottom: `1px solid ${C.border}` }}>
                                <td style={{ padding: 8, fontSize: 12, color: C.t1, fontWeight: 900 }}>{item.name}</td>
                                <td style={{ padding: 8, fontSize: 12, color: C.t2 }}>{item.target}</td>
                                <td style={{ padding: 8 }}>
                                  <input
                                    defaultValue={item.result}
                                    onBlur={(e) => updateKpiResult(item.kpiId, { result: e.target.value })}
                                    placeholder="Resultado medido"
                                    style={smallField}
                                  />
                                </td>
                                <td style={{ padding: 8 }}>
                                  <input
                                    defaultValue={item.attainment}
                                    onBlur={(e) => updateKpiResult(item.kpiId, { attainment: e.target.value })}
                                    placeholder="Ex: 85"
                                    style={smallField}
                                  />
                                </td>
                                <td style={{ padding: 8, fontSize: 13, color: grade >= 4 ? C.emerald : grade >= 3 ? C.amber : C.rose, fontWeight: 950 }}>
                                  {grade || "-"}
                                </td>
                                <td style={{ padding: 8, width: 90 }}>
                                  <input
                                    defaultValue={item.weight}
                                    onBlur={(e) => updateKpiResult(item.kpiId, { weight: e.target.value })}
                                    style={smallField}
                                  />
                                </td>
                                <td style={{ padding: 8, fontSize: 13, color: C.blue, fontWeight: 950 }}>
                                  {weighted.toFixed(1)}
                                </td>
                                <td style={{ padding: 8 }}>
                                  <input
                                    defaultValue={item.notes}
                                    onBlur={(e) => updateKpiResult(item.kpiId, { notes: e.target.value })}
                                    placeholder="Observação"
                                    style={smallField}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Section>

                <Section title="Deal-breakers" sub="Critérios de reprovação automática. Se qualquer item for marcado, a aprovação fica bloqueada independente do score">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
                    {dealBreakers.map((item) => (
                      <button
                        key={item.key}
                        onClick={() => updateDealBreaker(item.key, !item.checked)}
                        style={{
                          textAlign: "left",
                          background: item.checked ? (C.roseGlow || "rgba(239,68,68,0.10)") : C.bg3,
                          border: `1px solid ${item.checked ? C.rose : C.border}`,
                          color: item.checked ? C.rose : C.t2,
                          borderRadius: 14,
                          padding: "13px 14px",
                          cursor: "pointer",
                          fontWeight: 800,
                          animation: item.checked ? "pocPulseAlert 1.6s infinite" : "none",
                        }}
                      >
                        {item.checked ? "🚫 " : "○ "}
                        {item.label}
                      </button>
                    ))}
                  </div>
                </Section>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Section title="Comparação com Baseline" sub="Contexto da performance: fornecedor vs. operação atual">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <input placeholder="Entrega atual / baseline %" defaultValue={baseline.currentDelivery || ""} onBlur={(e) => updateBaseline("currentDelivery", e.target.value)} style={field} />
                      <input placeholder="Entrega fornecedor %" defaultValue={baseline.supplierDelivery || ""} onBlur={(e) => updateBaseline("supplierDelivery", e.target.value)} style={field} />
                      <input placeholder="Leitura atual / baseline %" defaultValue={baseline.currentReading || ""} onBlur={(e) => updateBaseline("currentReading", e.target.value)} style={field} />
                      <input placeholder="Leitura fornecedor %" defaultValue={baseline.supplierReading || ""} onBlur={(e) => updateBaseline("supplierReading", e.target.value)} style={field} />
                      <input placeholder="Conversão atual / baseline %" defaultValue={baseline.currentConversion || ""} onBlur={(e) => updateBaseline("currentConversion", e.target.value)} style={field} />
                      <input placeholder="Conversão fornecedor %" defaultValue={baseline.supplierConversion || ""} onBlur={(e) => updateBaseline("supplierConversion", e.target.value)} style={field} />
                    </div>

                    <textarea
                      placeholder="Observações sobre comparação com operação atual, fornecedor anterior ou baseline interno"
                      defaultValue={baseline.notes || ""}
                      onBlur={(e) => updateBaseline("notes", e.target.value)}
                      style={{ ...field, marginTop: 12, minHeight: 90, resize: "vertical", lineHeight: 1.6 }}
                    />
                  </Section>

                  <Section title="Avaliação Qualitativa" sub="Dimensões que afetam contratação e operação no longo prazo">
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {qualitativeItems.map(([key, label]) => (
                        <div key={key}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 12 }}>
                            <span style={{ color: C.t2, fontWeight: 800 }}>{label}</span>
                            <strong style={{ color: C.blue }}>{qualitative[key]}/5</strong>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="5"
                            step="1"
                            value={qualitative[key]}
                            onChange={(e) => updateQualitative(key, e.target.value)}
                            style={{ width: "100%" }}
                          />
                        </div>
                      ))}
                    </div>
                  </Section>
                </div>

                <Section title="Recomendação Fundamentada" sub="Decisão formal com justificativa, responsável, data e aprovação da liderança">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 180px 220px", gap: 12, marginBottom: 12 }}>
                    <select
                      value={evaluation.recommendation || "Em avaliação"}
                      onChange={(e) => updateEvaluationPatch({ recommendation: e.target.value })}
                      style={field}
                    >
                      <option>Em avaliação</option>
                      <option>Aprovado</option>
                      <option>Reprovado</option>
                      <option>Aprovado com condições</option>
                    </select>

                    <input
                      placeholder="Responsável pela recomendação"
                      defaultValue={evaluation.recommendationOwner || ""}
                      onBlur={(e) => updateEvaluationPatch({ recommendationOwner: e.target.value })}
                      style={field}
                    />

                    <input
                      type="date"
                      defaultValue={evaluation.recommendationDate || ""}
                      onBlur={(e) => updateEvaluationPatch({ recommendationDate: e.target.value })}
                      style={field}
                    />

                    <select
                      value={evaluation.leadershipApproval || "Pendente"}
                      onChange={(e) => updateEvaluationPatch({ leadershipApproval: e.target.value })}
                      style={field}
                    >
                      <option>Pendente</option>
                      <option>Aprovado pela liderança</option>
                      <option>Reprovado pela liderança</option>
                      <option>Solicitado ajuste</option>
                    </select>
                  </div>

                  <textarea
                    placeholder="Justificativa obrigatória da recomendação: por que aprovar, reprovar ou aprovar com condições?"
                    defaultValue={evaluation.recommendationJustification || ""}
                    onBlur={(e) => updateEvaluationPatch({ recommendationJustification: e.target.value })}
                    style={{ ...field, minHeight: 120, resize: "vertical", lineHeight: 1.6 }}
                  />

                  {(evaluation.recommendation || "Em avaliação") === "Aprovado com condições" && (
                    <textarea
                      placeholder="Condições para aprovação: ajustes técnicos, SLA, segurança, custo, integração, documentação..."
                      defaultValue={evaluation.conditions || ""}
                      onBlur={(e) => updateEvaluationPatch({ conditions: e.target.value })}
                      style={{ ...field, minHeight: 100, resize: "vertical", lineHeight: 1.6, marginTop: 12 }}
                    />
                  )}

                  {((evaluation.recommendation || "Em avaliação") !== "Em avaliação" && !evaluation.recommendationJustification) && (
                    <div style={{ marginTop: 12, background: C.amberGlow, border: `1px solid ${C.amber}44`, color: C.t1, borderRadius: 12, padding: "10px 12px", fontSize: 12 }}>
                      A recomendação precisa de justificativa escrita para rastreabilidade da decisão.
                    </div>
                  )}
                </Section>

                <Section title="Descomissionamento e Encerramento Seguro" sub="Checklist ampliado para encerramento seguro da POC">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
                    {decommissioning.map((item) => (
                      <label
                        key={item.key}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          background: item.checked ? C.emeraldGlow : C.bg3,
                          border: `1px solid ${item.checked ? C.emerald + "55" : C.border}`,
                          borderRadius: 12,
                          padding: "11px 12px",
                          color: C.t2,
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={(e) => updateDecommissioning(item.key, e.target.checked)}
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </Section>
              </>
            );
          })()}
        </div>
      )}

      
    </div>
  );
}
