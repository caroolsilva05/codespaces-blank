import React, { useState, useRef } from "react";
import { supabase } from "./lib/supabase";

// ============================================================
// THEME & CONSTANTS
// ============================================================
const theme = {
  navy: "#0d1f3c",
  navyDark: "#071428",
  navyLight: "#1a3560",
  gold: "#c9a84c",
  white: "#ffffff",
  bg: "#f0f4f8",
  border: "#dde3ed",
  borderLight: "#eef1f6",
  text: "#1e293b",
  textSecondary: "#475569",
  textMuted: "#94a3b8",
  phases: {
    0: { bg: "#0f766e", light: "#ccfbf1", label: "Orçamento" },
    1: { bg: "#1d4ed8", light: "#dbeafe", label: "Backlog" },
    2: { bg: "#047857", light: "#d1fae5", label: "Planejamento" },
    3: { bg: "#b45309", light: "#fef3c7", label: "Execução" },
    4: { bg: "#6d28d9", light: "#ede9fe", label: "Monitoramento" },
    5: { bg: "#be123c", light: "#ffe4e6", label: "Encerramento" },
  },
  statusColors: {
    "Em dia":       { bg: "#dcfce7", text: "#166534", dot: "#16a34a" },
    "Atenção":      { bg: "#fef9c3", text: "#854d0e", dot: "#ca8a04" },
    "Atrasado":     { bg: "#fee2e2", text: "#991b1b", dot: "#dc2626" },
    "Concluído":    { bg: "#e0e7ff", text: "#3730a3", dot: "#4f46e5" },
    "Pendente":     { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" },
    "Em andamento": { bg: "#fef3c7", text: "#92400e", dot: "#d97706" },
    "Concluída":    { bg: "#dcfce7", text: "#166534", dot: "#16a34a" },
  },
  riskColors: {
    Alta:  { bg: "#fee2e2", text: "#991b1b" },
    Média: { bg: "#fef9c3", text: "#854d0e" },
    Baixa: { bg: "#dcfce7", text: "#166534" },
    Alto:  { bg: "#fee2e2", text: "#991b1b" },
    Médio: { bg: "#fef9c3", text: "#854d0e" },
    Baixo: { bg: "#dcfce7", text: "#166534" },
  },
};

// ============================================================
// MOCK DATA
// ============================================================
const initialData = {
  projectInfo: {
    nome: "",
    codigoId: "",
    tipo: "Fornecedor",
    canais: [],
    outroCanalProduto: "",
    fornecedor: "",
    responsavel: "",
    solicitante: "",
    equipe: "",
    dataAbertura: "",
    previsaoEncerramento: "",
    faseAtual: "Backlog",
    status: "Em dia",
  },
  orcamentoProjeto: {
    orcamentoTotal: "",
    custoImplementacao: "",
    cobrancaMensal: "",
    valorDisparoUnitario: "",
    carteiraBanco: "",
    quantidadeDisparosDia: "",
  },
  phase1: {
    objetivo: "",
    justificativa: "",
    stakeholders: [
      { id: 1, nome: "", papel: "", envolvimento: "" },
    ],
    checklist: {
      objetivoAprovado: false,
      stakeholdersIdentificados: false,
      escopoDefinido: false,
      recursosAprovados: false,
    },
  },
  phase2: {
    escopo: {
      dentro: [""],
      fora: [""],
    },
    cronograma: [
      { id: 1, tarefa: "", previsto: "", realizado: "", status: "Pendente" },
    ],
    riscos: [
      { id: 1, risco: "", probabilidade: "Média", impacto: "Médio", mitigacao: "" },
    ],
  },
  phase3: {
    atividades: [
      { id: 1, atividade: "", responsavel: "", prazo: "", status: "Pendente" },
    ],
    impedimentos: [
      { id: 1, impedimento: "", dataIdentificado: "", responsavel: "", resolucao: "" },
    ],
    decisoes: [
      { id: 1, data: "", decisao: "", quemDecidiu: "" },
    ],
  },
  phase4: {
    kpis: [
      { id: 1, indicador: "% de conclusão das atividades", meta: "", realizado: "", variacao: "", status: "Pendente" },
      { id: 2, indicador: "Prazo: dias de atraso / adiantamento", meta: "", realizado: "", variacao: "", status: "Pendente" },
      { id: 3, indicador: "Orçamento: realizado vs previsto", meta: "", realizado: "", variacao: "", status: "Pendente" },
      { id: 4, indicador: "Nº de mudanças de escopo", meta: "", realizado: "", variacao: "", status: "Pendente" },
      { id: 5, indicador: "Nível de satisfação do cliente interno", meta: "", realizado: "", variacao: "", status: "Pendente" },
    ],
    relatorioStatus: [
      { id: 1, data: "", statusGeral: "Em dia", feito: "", proximos: "" },
    ],
  },
  phase5: {
    entregaveis: [
      { id: 1, entregavel: "", aceite: null, responsavel: "" },
    ],
    licoesAprendidas: {
      funcionouBem: "",
      melhorar: "",
    },
    checklist: {
      entregaveisAceitos: false,
      licoesRegistradas: false,
      comunicadoEnviado: false,
      recursosLiberados: false,
      projetoMarcado: false,
    },
    resumo: {
      dataEncerramento: "",
      dataPrevista: "",
      objetivoAtingido: "",
      resultados: "",
      aprovadoPor: "",
    },
  },
};

// ============================================================
// ATOMS
// ============================================================

const StatusBadge = ({ status, size = "normal" }) => {
  const s = theme.statusColors[status] || { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: size === "small" ? "2px 8px" : "4px 11px",
      borderRadius: 20, background: s.bg, color: s.text,
      fontSize: size === "small" ? 11 : 12, fontWeight: 600,
      whiteSpace: "nowrap", letterSpacing: "0.3px",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
};

const RiskBadge = ({ level }) => {
  const c = theme.riskColors[level] || { bg: "#f1f5f9", text: "#475569" };
  return (
    <span style={{
      display: "inline-block", padding: "2px 9px", borderRadius: 4,
      background: c.bg, color: c.text, fontSize: 11, fontWeight: 700,
    }}>{level}</span>
  );
};

const PhaseSection = ({ phaseNum, title, expanded, onToggle, children }) => {
  const p = theme.phases[phaseNum];
  return (
    <div style={{
      marginBottom: 28, borderRadius: 8, overflow: "hidden",
      border: `1px solid ${theme.border}`,
      boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
    }}>
      <div onClick={onToggle} style={{
        background: p.bg, color: "#fff",
        padding: "15px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        cursor: "pointer", userSelect: "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            background: "rgba(255,255,255,0.18)", borderRadius: 6,
            width: 30, height: 30, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 13, fontWeight: 800,
          }}>{phaseNum}</span>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase" }}>
            {title}
          </span>
        </div>
        <span style={{ fontSize: 13, opacity: 0.8, fontWeight: 700 }}>
          {expanded ? "▲ Recolher" : "▼ Expandir"}
        </span>
      </div>
      {expanded && (
        <div style={{ padding: "28px 28px 20px", background: "#fff" }}>
          {children}
        </div>
      )}
    </div>
  );
};

const SubSection = ({ title, children }) => (
  <div style={{ marginBottom: 28 }}>
    <h4 style={{
      margin: "0 0 14px 0", fontSize: 12, fontWeight: 700,
      color: theme.navy, textTransform: "uppercase", letterSpacing: "1.2px",
      borderBottom: `2px solid ${theme.border}`, paddingBottom: 8,
    }}>{title}</h4>
    {children}
  </div>
);

const TableWrap = ({ children }) => (
  <div style={{ overflowX: "auto", borderRadius: 6, border: `1px solid ${theme.border}` }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      {children}
    </table>
  </div>
);

const THead = ({ children }) => (
  <thead style={{ background: theme.navy }}>{children}</thead>
);

const Th = ({ children, w }) => (
  <th style={{
    padding: "10px 14px", color: "#fff", fontWeight: 600,
    textAlign: "left", fontSize: 11, letterSpacing: "0.6px",
    width: w || "auto", whiteSpace: "nowrap", textTransform: "uppercase",
  }}>{children}</th>
);

const Td = ({ children, style: sx = {} }) => (
  <td style={{
    padding: "9px 14px", borderBottom: `1px solid ${theme.borderLight}`,
    color: theme.text, verticalAlign: "middle", ...sx,
  }}>{children}</td>
);

const EditField = ({ value, onChange, placeholder, multi, minH }) => {
  const base = {
    width: "100%", padding: "5px 8px",
    border: "1px solid transparent", borderRadius: 4,
    fontSize: 13, color: theme.text, background: "transparent",
    outline: "none", fontFamily: "inherit",
    boxSizing: "border-box", resize: multi ? "vertical" : "none",
    minHeight: minH || (multi ? 64 : "auto"),
  };
  const focus = (e) => { e.target.style.border = `1px solid ${theme.navy}`; e.target.style.background = "#f5f8ff"; };
  const blur  = (e) => { e.target.style.border = "1px solid transparent"; e.target.style.background = "transparent"; };
  return multi
    ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base} onFocus={focus} onBlur={blur} />
    : <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base} onFocus={focus} onBlur={blur} />;
};

const DateInput = ({ value, onChange }) => (
  <input type="date" value={value} onChange={e => onChange(e.target.value)}
    style={{
      fontSize: 12, border: `1px solid ${theme.border}`, borderRadius: 4,
      padding: "4px 8px", color: theme.text, fontFamily: "inherit",
      background: "#fff",
    }} />
);

const SelectInput = ({ value, onChange, options }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    style={{
      fontSize: 12, border: `1px solid ${theme.border}`, borderRadius: 4,
      padding: "4px 8px", color: theme.text, fontFamily: "inherit",
      background: "#fff", cursor: "pointer",
    }}>
    {options.map(o => <option key={o}>{o}</option>)}
  </select>
);

const CheckItem = ({ checked, onChange, label }) => (
  <label style={{
    display: "flex", alignItems: "flex-start", gap: 10,
    cursor: "pointer", padding: "7px 0",
    borderBottom: `1px solid ${theme.borderLight}`,
  }}>
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
      style={{ marginTop: 2, accentColor: theme.navy, width: 15, height: 15, cursor: "pointer", flexShrink: 0 }} />
    <span style={{
      fontSize: 13, color: checked ? theme.textSecondary : theme.text,
      textDecoration: checked ? "line-through" : "none", lineHeight: 1.5,
    }}>{label}</span>
    {checked && <span style={{ marginLeft: "auto", fontSize: 11, color: "#16a34a", fontWeight: 700, flexShrink: 0 }}>✓</span>}
  </label>
);

const GhostBtn = ({ onClick, children }) => (
  <button onClick={onClick} style={{
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "7px 14px", borderRadius: 6,
    border: `1px dashed ${theme.border}`, background: "#f8fafc",
    color: theme.textSecondary, fontSize: 12, fontWeight: 600,
    cursor: "pointer", transition: "all 0.15s",
  }}
    onMouseOver={e => { e.currentTarget.style.borderColor = theme.navy; e.currentTarget.style.color = theme.navy; }}
    onMouseOut={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary; }}
  >{children}</button>
);

const DeleteBtn = ({ onClick }) => (
  <button onClick={onClick} style={{
    background: "none", border: "none", color: "#cbd5e1",
    cursor: "pointer", fontSize: 16, padding: "2px 6px",
    transition: "color 0.15s",
  }}
    onMouseOver={e => e.currentTarget.style.color = "#dc2626"}
    onMouseOut={e => e.currentTarget.style.color = "#cbd5e1"}
  >✕</button>
);

const FieldRow = ({ label, children }) => (
  <div style={{
    display: "grid", gridTemplateColumns: "190px 1fr", gap: 12,
    padding: "9px 0", borderBottom: `1px solid ${theme.borderLight}`,
    alignItems: "center",
  }}>
    <span style={{
      fontSize: 11, fontWeight: 700, color: theme.textSecondary,
      textTransform: "uppercase", letterSpacing: "0.8px",
    }}>{label}</span>
    <div>{children}</div>
  </div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function ScrumProjectRegister({ registroInicial = null, onSaved = null } = {}) {
  const [data, setData] = useState(() => {
    const dadosSalvos =
      registroInicial?.dados_do_registro ||
      registroInicial?.record_data ||
      null;

    return dadosSalvos || initialData;
  });
  const [phases, setPhases] = useState({ 0: true, 1: true, 2: true, 3: true, 4: true, 5: true });
  const [flash, setFlash]   = useState("");
  const [saving, setSaving] = useState(false);
  const printRef = useRef(null);

  const toggle = (n) => setPhases(p => ({ ...p, [n]: !p[n] }));

  const setPI = (field, val) =>
    setData(d => ({ ...d, projectInfo: { ...d.projectInfo, [field]: val } }));

  const setOrcamento = (field, val) =>
    setData(d => ({
      ...d,
      orcamentoProjeto: {
        ...(d.orcamentoProjeto || {}),
        [field]: val,
      },
    }));

  function parseMoney(value) {
    const normalizado = String(value || "")
      .replace(/R\$/g, "")
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".");

    const numero = Number(normalizado);
    return Number.isFinite(numero) ? numero : 0;
  }

  function formatMoney(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatCurrencyInput(value) {
    const onlyDigits = String(value || "").replace(/\D/g, "");

    if (!onlyDigits) return "";

    const numero = Number(onlyDigits) / 100;

    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function setOrcamentoMoeda(field, value) {
    setOrcamento(field, formatCurrencyInput(value));
  }

  const setP1 = (field, val) =>
    setData(d => ({ ...d, phase1: { ...d.phase1, [field]: val } }));

  const setCheckP1 = (key, val) =>
    setData(d => ({ ...d, phase1: { ...d.phase1, checklist: { ...d.phase1.checklist, [key]: val } } }));

  const setCheckP5 = (key, val) =>
    setData(d => ({ ...d, phase5: { ...d.phase5, checklist: { ...d.phase5.checklist, [key]: val } } }));

  const addRow = (phase, field, tpl) =>
    setData(d => ({ ...d, [phase]: { ...d[phase], [field]: [...d[phase][field], { ...tpl, id: Date.now() }] } }));

  const updRow = (phase, field, id, key, val) =>
    setData(d => ({ ...d, [phase]: { ...d[phase], [field]: d[phase][field].map(r => r.id === id ? { ...r, [key]: val } : r) } }));

  const delRow = (phase, field, id) =>
    setData(d => ({ ...d, [phase]: { ...d[phase], [field]: d[phase][field].filter(r => r.id !== id) } }));

  const handleSave = async () => {
  if (!data.projectInfo.nome || !data.projectInfo.nome.trim()) {
    alert("Informe o nome do projeto antes de salvar.");
    return;
  }

  setSaving(true);

  const payloadBase = {
    nome_do_projeto: data.projectInfo.nome,
    fornecedor: data.projectInfo.fornecedor,
    responsavel: data.projectInfo.responsavel,
    fase_atual: data.projectInfo.faseAtual || "Backlog",
    status_geral: data.projectInfo.status || "Em dia",
    dados_do_registro: data,
  };

  const codigo = data.projectInfo.codigoId || "";

  const tentativas = [
    { ...payloadBase, codigo_do_projeto: codigo },
    { ...payloadBase, "código_do_projeto": codigo },
    payloadBase,
  ];

  let ultimoErro = null;

  for (const payload of tentativas) {
    let resposta;

    if (registroInicial?.id) {
      resposta = await supabase
        .from("registros_do_projeto_scrum")
        .update(payload)
        .eq("id", registroInicial.id);
    } else {
      resposta = await supabase
        .from("registros_do_projeto_scrum")
        .insert([payload]);
    }

    if (!resposta.error) {
      ultimoErro = null;
      break;
    }

    ultimoErro = resposta.error;
    console.log("Tentativa de salvar registro Scrum falhou:", resposta.error);
  }

  setSaving(false);

  if (ultimoErro) {
    console.log("Erro ao salvar registro Scrum:", ultimoErro);
    alert("Erro ao salvar projeto. Veja o console.");
    return;
  }

  setFlash("saved");
  alert(registroInicial?.id ? "Projeto atualizado com sucesso!" : "Projeto salvo com sucesso!");

  if (typeof onSaved === "function") {
    await onSaved();
  }

  setTimeout(() => setFlash(""), 2000);
};


  const handleExportPdf = () => {
    const conteudo = printRef.current;

    if (!conteudo) {
      alert("Não foi possível preparar o PDF.");
      return;
    }

    const janela = window.open("", "_blank", "width=1200,height=900");

    if (!janela) {
      alert("O navegador bloqueou a janela de impressão. Libere pop-ups para exportar o PDF.");
      return;
    }

    janela.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <title>Registro Scrum - ${data.projectInfo.nome || "Projeto"}</title>
          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              font-family: Segoe UI, Arial, sans-serif;
              background: #f0f4f8;
              color: #1e293b;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            button {
              display: none !important;
            }

            input,
            textarea,
            select {
              border: none !important;
              background: transparent !important;
              color: #1e293b !important;
              pointer-events: none;
            }

            textarea {
              resize: none !important;
            }

            @page {
              size: A4;
              margin: 12mm;
            }

            @media print {
              body {
                background: #ffffff;
              }

              div {
                break-inside: avoid;
              }
            }
          </style>
        </head>

        <body>
          ${conteudo.innerHTML}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
              }, 500);
            };
          <\/script>
        </body>
      </html>
    `);

    janela.document.close();
  };

  const { projectInfo: pi, orcamentoProjeto = {}, phase1, phase2, phase3, phase4, phase5 } = data;

  const custoDisparosMensal =
    parseMoney(orcamentoProjeto.valorDisparoUnitario) *
    parseMoney(orcamentoProjeto.quantidadeDisparosDia) *
    22;

  const custoRecorrenteMensal =
    parseMoney(orcamentoProjeto.cobrancaMensal) + custoDisparosMensal;

  const custoPrimeiroMes =
    parseMoney(orcamentoProjeto.custoImplementacao) + custoRecorrenteMensal;

  const p1Done = Object.values(phase1.checklist).filter(Boolean).length;
  const p5Done = Object.values(phase5.checklist).filter(Boolean).length;
  const actTotal = phase3.atividades.length;
  const actDone  = phase3.atividades.filter(a => a.status === "Concluída").length;
  const blockers  = phase3.impedimentos.filter(i => !i.resolucao || i.resolucao.trim() === "").length;

  // ──────────────────────────────────────────────────────────
  return (
    <div ref={printRef} style={{ minHeight: "100vh", background: theme.bg, fontFamily: "'Segoe UI','Helvetica Neue',Arial,sans-serif", color: theme.text }}>

      {/* ── HEADER ── */}
      <div style={{
        background: `linear-gradient(135deg, ${theme.navyDark} 0%, ${theme.navy} 55%, ${theme.navyLight} 100%)`,
        padding: "0 40px", position: "relative", overflow: "hidden",
      }}>
        {/* gold top stripe */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${theme.gold}, #f0d98c, ${theme.gold})` }} />
        {/* subtle bg pattern */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 80% 50%, rgba(201,168,76,0.07) 0%, transparent 60%)", pointerEvents: "none" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "28px 0 24px", position: "relative" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
              <span style={{
                background: theme.gold, color: theme.navyDark,
                fontSize: 10, fontWeight: 800, padding: "3px 11px",
                borderRadius: 20, letterSpacing: "1.5px", textTransform: "uppercase",
              }}>Transformação Digital</span>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>|</span>
              <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>Ciclo de Vida do Projeto</span>
            </div>
            <h1 style={{ margin: "0 0 5px", color: "#fff", fontSize: 24, fontWeight: 700, letterSpacing: "-0.3px" }}>
              Template de Projeto
            </h1>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
              Registro e acompanhamento completo — Metodologia Scrum/PMI
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {[
              { label: saving ? "⏳  Salvando..." : flash === "saved" ? "✓  Salvo!" : "Salvar projeto", fn: handleSave, style: { background: flash === "saved" ? "#047857" : "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" } },
                          ].map(btn => (
              <button key={btn.label} onClick={btn.fn} style={{
                ...btn.style, padding: "9px 18px", borderRadius: 7,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                letterSpacing: "0.2px", transition: "opacity .15s",
              }}
                onMouseOver={e => e.currentTarget.style.opacity = "0.85"}
                onMouseOut={e => e.currentTarget.style.opacity = "1"}
              >{btn.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── SUMMARY CARDS ── */}
      <div style={{
        background: theme.navyDark,
        padding: "16px 40px",
        display: "grid",
        gridTemplateColumns: "repeat(6,1fr)",
        gap: 12,
        borderBottom: "3px solid rgba(201,168,76,0.4)",
      }}>
        {[
          { label: "Fase atual",           val: pi.faseAtual,                        icon: "📍" },
          { label: "Status",               val: <StatusBadge status={pi.status} />,  icon: "🔔" },
          { label: "Progresso atividades", val: `${actDone} / ${actTotal}`,           icon: "✅" },
          { label: "Encerramento previsto",val: pi.previsaoEncerramento ? new Date(pi.previsaoEncerramento).toLocaleDateString("pt-BR") : "—", icon: "📅" },
          { label: "Checklist abertura",   val: `${p1Done} / ${Object.keys(phase1.checklist).length} itens`, icon: "📋" },
          { label: "Impedimentos ativos",  val: blockers > 0 ? <span style={{ color: "#f87171", fontWeight: 700 }}>{blockers} ativo{blockers > 1 ? "s" : ""}</span> : <span style={{ color: "#4ade80", fontWeight: 700 }}>Nenhum</span>, icon: "🚫" },
        ].map((c, i) => (
          <div key={i} style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, padding: "12px 16px",
          }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.8px" }}>
              {c.icon} {c.label}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{c.val}</div>
          </div>
        ))}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ padding: "32px 40px 48px", maxWidth: 1280, margin: "0 auto" }}>

        {/* ===== IDENTIFICAÇÃO ===== */}
        <div style={{
          background: "#fff", borderRadius: 8,
          border: `1px solid ${theme.border}`,
          marginBottom: 28, overflow: "hidden",
          boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
        }}>
          <div style={{
            background: theme.navy, color: "#fff",
            padding: "15px 24px", display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>📋</span>
            <span style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px" }}>
              Identificação do Projeto
            </span>
          </div>

          <div style={{ padding: "24px 28px" }}>
            {/* Full-width: Nome */}
            <FieldRow label="Nome do projeto">
              <EditField value={pi.nome} onChange={v => setPI("nome", v)} placeholder="Nome completo do projeto" />
            </FieldRow>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 48px" }}>
              {/* LEFT */}
              <div>
                <FieldRow label="Código / ID">
                  <EditField value={pi.codigoId} onChange={v => setPI("codigoId", v)} placeholder="Ex: TD-2025-001" />
                </FieldRow>
                <FieldRow label="Tipo">
                  <div style={{ display: "flex", gap: 24, paddingLeft: 2 }}>
                    {["Fornecedor", "Interno"].map(opt => (
                      <label key={opt} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
                        <input type="radio" name="tipo" value={opt} checked={pi.tipo === opt}
                          onChange={() => setPI("tipo", opt)} style={{ accentColor: theme.navy }} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </FieldRow>
                <FieldRow label="Canal / Produto">
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingLeft: 2 }}>
                    {["WhatsApp", "RCS", "SMS", "E-mail", "Portal", "IA", "Outros"].map(opt => (
                      <label key={opt} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: 12 }}>
                        <input
                          type="checkbox"
                          value={opt}
                          checked={pi.canais.includes(opt)}
                          onChange={e => {
                            const canaisSemNA = pi.canais.filter(c => c !== "N/A");
                            const canaisAtualizados = e.target.checked
                              ? [...canaisSemNA, opt]
                              : canaisSemNA.filter(c => c !== opt);

                            setData(d => ({
                              ...d,
                              projectInfo: {
                                ...d.projectInfo,
                                canais: canaisAtualizados,
                                ...(opt === "Outros" && !e.target.checked ? { outroCanalProduto: "" } : {}),
                              },
                            }));
                          }}
                          style={{ accentColor: theme.navy }}
                        />
                        {opt}
                      </label>
                    ))}
                    {pi.canais.includes("Outros") && (
                      <input
                        type="text"
                        value={pi.outroCanalProduto || ""}
                        onChange={e => setPI("outroCanalProduto", e.target.value)}
                        placeholder="Qual?"
                        style={{
                          width: 180,
                          height: 28,
                          border: `1px solid ${theme.border}`,
                          borderRadius: 6,
                          padding: "4px 8px",
                          fontSize: 12,
                          color: theme.text,
                          background: "#fff",
                          outline: "none",
                          fontFamily: "inherit",
                          boxSizing: "border-box",
                        }}
                        onFocus={e => {
                          e.target.style.border = `1px solid ${theme.navy}`;
                          e.target.style.background = "#f8fafc";
                        }}
                        onBlur={e => {
                          e.target.style.border = `1px solid ${theme.border}`;
                          e.target.style.background = "#fff";
                        }}
                      />
                    )}
                  </div>
                </FieldRow>
                <FieldRow label="Fornecedor">
                  <EditField value={pi.fornecedor} onChange={v => setPI("fornecedor", v)} placeholder="Nome do fornecedor" />
                </FieldRow>
                <FieldRow label="Responsável">
                  <EditField value={pi.responsavel} onChange={v => setPI("responsavel", v)} placeholder="Responsável pelo projeto" />
                </FieldRow>
                <FieldRow label="Solicitante">
                  <EditField value={pi.solicitante} onChange={v => setPI("solicitante", v)} placeholder="Área / pessoa solicitante" />
                </FieldRow>
              </div>
              {/* RIGHT */}
              <div>
                <FieldRow label="Equipe envolvida">
                  <EditField value={pi.equipe} onChange={v => setPI("equipe", v)} placeholder="Membros da equipe" />
                </FieldRow>
                <FieldRow label="Data de abertura">
                  <DateInput value={pi.dataAbertura} onChange={v => setPI("dataAbertura", v)} />
                </FieldRow>
                <FieldRow label="Prev. de encerramento">
                  <DateInput value={pi.previsaoEncerramento} onChange={v => setPI("previsaoEncerramento", v)} />
                </FieldRow>
                <FieldRow label="Fase atual">
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingLeft: 2 }}>
                    {["Início", "Planejamento", "Execução", "Monitoramento", "Encerramento"].map(opt => (
                      <label key={opt} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: 12 }}>
                        <input type="radio" name="fase" value={opt} checked={pi.faseAtual === opt}
                          onChange={() => setPI("faseAtual", opt)} style={{ accentColor: theme.navy }} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </FieldRow>
                <FieldRow label="Status">
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingLeft: 2 }}>
                    {["Em dia", "Atenção", "Atrasado", "Concluído"].map(opt => (
                      <label key={opt} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                        <input type="radio" name="status" value={opt} checked={pi.status === opt}
                          onChange={() => setPI("status", opt)} style={{ accentColor: theme.navy }} />
                        <StatusBadge status={opt} size="small" />
                      </label>
                    ))}
                  </div>
                </FieldRow>
              </div>
            </div>
          </div>
        </div>


        {/* ===== FASE 0 — ORÇAMENTO DO PROJETO ===== */}
        <PhaseSection phaseNum={0} title="Fase 0 — Orçamento do Projeto" expanded={phases[0]} onToggle={() => toggle(0)}>

          <SubSection title="0.1 Planejamento financeiro">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 48px" }}>
              <div>
                <FieldRow label="Orçamento total">
                  <EditField
                    value={orcamentoProjeto.orcamentoTotal || ""}
                    onChange={v => setOrcamentoMoeda("orcamentoTotal", v)}
                    placeholder="Ex: R$ 13.000,00"
                  />
                </FieldRow>

                <FieldRow label="Custo de implementação">
                  <EditField
                    value={orcamentoProjeto.custoImplementacao || ""}
                    onChange={v => setOrcamentoMoeda("custoImplementacao", v)}
                    placeholder="Ex: R$ 5.000,00"
                  />
                </FieldRow>

                <FieldRow label="Carteira / Banco">
                  <EditField
                    value={orcamentoProjeto.carteiraBanco || orcamentoProjeto.fornecedorSolucao || ""}
                    onChange={v => setOrcamento("carteiraBanco", v)}
                    placeholder="Ex: Bradesco, Santander, Renner, BV..."
                  />
                </FieldRow>
              </div>

              <div>
                <FieldRow label="Cobrança mensal">
                  <EditField
                    value={orcamentoProjeto.cobrancaMensal || ""}
                    onChange={v => setOrcamentoMoeda("cobrancaMensal", v)}
                    placeholder="Ex: R$ 3.000,00"
                  />
                </FieldRow>

                <FieldRow label="Valor dos disparos">
                  <EditField
                    value={orcamentoProjeto.valorDisparoUnitario || ""}
                    onChange={v => setOrcamentoMoeda("valorDisparoUnitario", v)}
                    placeholder="Ex: R$ 0,15"
                  />
                </FieldRow>

                <FieldRow label="Disparos por dia">
                  <EditField
                    value={orcamentoProjeto.quantidadeDisparosDia || ""}
                    onChange={v => setOrcamento("quantidadeDisparosDia", v)}
                    placeholder="Ex: 300"
                  />
                </FieldRow>
              </div>
            </div>
          </SubSection>

          <SubSection title="0.2 Resumo financeiro estimado">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 14,
                marginBottom: 16,
              }}
            >
              {[
                {
                  label: "Custo mensal estimado de disparos",
                  value: formatMoney(custoDisparosMensal),
                  helper: "Valor unitário x disparos/dia x 22 dias úteis",
                },
                {
                  label: "Custo recorrente mensal",
                  value: formatMoney(custoRecorrenteMensal),
                  helper: "Cobrança mensal + disparos estimados",
                },
                {
                  label: "Estimativa do primeiro mês",
                  value: formatMoney(custoPrimeiroMes),
                  helper: "Implementação + custo recorrente mensal",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    border: `1px solid ${theme.border}`,
                    borderRadius: 8,
                    background: "#f8fafc",
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: theme.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      fontWeight: 800,
                      marginBottom: 6,
                    }}
                  >
                    {item.label}
                  </div>

                  <div style={{ fontSize: 20, color: theme.phases[0].bg, fontWeight: 900 }}>
                    {item.value}
                  </div>

                  <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 6, lineHeight: 1.4 }}>
                    {item.helper}
                  </div>
                </div>
              ))}
            </div>

          </SubSection>
        </PhaseSection>

        {/* ===== FASE 1 — BACKLOG ===== */}
        <PhaseSection phaseNum={1} title="Fase 1 — Backlog" expanded={phases[1]} onToggle={() => toggle(1)}>

          <SubSection title="1.1 Objetivo e Justificativa">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>
                  Objetivo principal
                </div>
                <div style={{ border: `1px solid ${theme.border}`, borderRadius: 6, padding: 2, minHeight: 90 }}>
                  <EditField value={phase1.objetivo} onChange={v => setP1("objetivo", v)} placeholder="Descreva em 1–2 frases o que este projeto deve entregar..." multi minH={80} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>
                  Justificativa / Problema que resolve
                </div>
                <div style={{ border: `1px solid ${theme.border}`, borderRadius: 6, padding: 2, minHeight: 90 }}>
                  <EditField value={phase1.justificativa} onChange={v => setP1("justificativa", v)} placeholder="Por que este projeto é necessário agora?" multi minH={80} />
                </div>
              </div>
            </div>
          </SubSection>

          <SubSection title="1.2 Stakeholders">
            <TableWrap>
              <THead>
                <tr>
                  <Th>Nome / Área</Th>
                  <Th w="180px">Papel no projeto</Th>
                  <Th w="220px">Tipo de envolvimento</Th>
                  <Th w="46px"></Th>
                </tr>
              </THead>
              <tbody>
                {phase1.stakeholders.map((row, i) => (
                  <tr key={row.id} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                    <Td><EditField value={row.nome}         onChange={v => updRow("phase1","stakeholders",row.id,"nome",v)}        placeholder="Nome / Área" /></Td>
                    <Td><EditField value={row.papel}        onChange={v => updRow("phase1","stakeholders",row.id,"papel",v)}       placeholder="Papel" /></Td>
                    <Td><EditField value={row.envolvimento} onChange={v => updRow("phase1","stakeholders",row.id,"envolvimento",v)} placeholder="Tipo de envolvimento" /></Td>
                    <Td><DeleteBtn onClick={() => delRow("phase1","stakeholders",row.id)} /></Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            <div style={{ marginTop: 10 }}>
              <GhostBtn onClick={() => addRow("phase1","stakeholders",{ nome:"", papel:"", envolvimento:"" })}>＋ Adicionar stakeholder</GhostBtn>
            </div>
          </SubSection>

          <SubSection title="1.3 Termo de Abertura (checklist)">
            <div style={{ background: "#f8f9fb", border: `1px solid ${theme.border}`, borderRadius: 6, padding: "10px 20px" }}>
              {[
                { key: "objetivoAprovado",          label: "Objetivo aprovado pelo solicitante" },
                { key: "stakeholdersIdentificados",  label: "Stakeholders identificados" },
                { key: "escopoDefinido",             label: "Escopo inicial definido" },
                { key: "recursosAprovados",          label: "Recursos aprovados (equipe/orçamento)" },
              ].map(item => (
                <CheckItem key={item.key} checked={phase1.checklist[item.key]} onChange={v => setCheckP1(item.key, v)} label={item.label} />
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: theme.textMuted }}>
              <span style={{ background: theme.phases[1].light, color: theme.phases[1].bg, padding: "2px 10px", borderRadius: 20, fontWeight: 700 }}>
                {p1Done} / {Object.keys(phase1.checklist).length} itens concluídos
              </span>
            </div>
          </SubSection>
        </PhaseSection>

        {/* ===== FASE 2 — PLANEJAMENTO ===== */}
        <PhaseSection phaseNum={2} title="Fase 2 — Planejamento" expanded={phases[2]} onToggle={() => toggle(2)}>

          <SubSection title="2.1 Escopo">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { label: "✓ Dentro do escopo",  key: "dentro", hBg: "#dcfce7", hText: "#065f46", bBorder: "#bbf7d0", dotColor: "#16a34a" },
                { label: "✗ Fora do escopo",    key: "fora",   hBg: "#fee2e2", hText: "#991b1b", bBorder: "#fecaca", dotColor: "#dc2626" },
              ].map(col => (
                <div key={col.key}>
                  <div style={{ background: col.hBg, color: col.hText, padding: "8px 14px", borderRadius: "6px 6px 0 0", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                    {col.label}
                  </div>
                  <div style={{ border: `1px solid ${col.bBorder}`, borderTop: "none", borderRadius: "0 0 6px 6px", padding: "12px 14px", minHeight: 100, background: "#fff" }}>
                    {phase2.escopo[col.key].map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                        <span style={{ color: col.dotColor, marginTop: 3, flexShrink: 0 }}>•</span>
                        <EditField value={item} onChange={v => {
                          const arr = [...phase2.escopo[col.key]]; arr[i] = v;
                          setData(d => ({ ...d, phase2: { ...d.phase2, escopo: { ...d.phase2.escopo, [col.key]: arr } } }));
                        }} placeholder="Descreva o item..." />
                      </div>
                    ))}
                    <button onClick={() => setData(d => ({ ...d, phase2: { ...d.phase2, escopo: { ...d.phase2.escopo, [col.key]: [...d.phase2.escopo[col.key], ""] } } }))}
                      style={{ fontSize: 12, color: col.hText, background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontWeight: 600 }}>
                      + Adicionar item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </SubSection>

          <SubSection title="2.2 Cronograma">
            <TableWrap>
              <THead>
                <tr>
                  <Th>Tarefa</Th>
                  <Th w="130px">Previsto</Th>
                  <Th w="130px">Realizado</Th>
                  <Th w="150px">Status</Th>
                  <Th w="46px"></Th>
                </tr>
              </THead>
              <tbody>
                {phase2.cronograma.map((row, i) => (
                  <tr key={row.id} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                    <Td><EditField value={row.tarefa} onChange={v => updRow("phase2","cronograma",row.id,"tarefa",v)} placeholder="Descrição da tarefa" /></Td>
                    <Td><DateInput value={row.previsto}  onChange={v => updRow("phase2","cronograma",row.id,"previsto",v)} /></Td>
                    <Td><DateInput value={row.realizado} onChange={v => updRow("phase2","cronograma",row.id,"realizado",v)} /></Td>
                    <Td>
                      <SelectInput value={row.status} onChange={v => updRow("phase2","cronograma",row.id,"status",v)} options={["Pendente","Em andamento","Concluída"]} />
                      <div style={{ marginTop: 4 }}><StatusBadge status={row.status} size="small" /></div>
                    </Td>
                    <Td><DeleteBtn onClick={() => delRow("phase2","cronograma",row.id)} /></Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            <div style={{ marginTop: 10 }}>
              <GhostBtn onClick={() => addRow("phase2","cronograma",{ tarefa:"", previsto:"", realizado:"", status:"Pendente" })}>＋ Adicionar tarefa</GhostBtn>
            </div>
          </SubSection>

          <SubSection title="2.3 Riscos Identificados">
            <TableWrap>
              <THead>
                <tr>
                  <Th>Risco</Th>
                  <Th w="120px">Probabilidade</Th>
                  <Th w="100px">Impacto</Th>
                  <Th>Plano de mitigação</Th>
                  <Th w="46px"></Th>
                </tr>
              </THead>
              <tbody>
                {phase2.riscos.map((row, i) => (
                  <tr key={row.id} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                    <Td><EditField value={row.risco} onChange={v => updRow("phase2","riscos",row.id,"risco",v)} placeholder="Descrição do risco" multi /></Td>
                    <Td style={{ verticalAlign: "top" }}>
                      <SelectInput value={row.probabilidade} onChange={v => updRow("phase2","riscos",row.id,"probabilidade",v)} options={["Alta","Média","Baixa"]} />
                      <div style={{ marginTop: 5 }}><RiskBadge level={row.probabilidade} /></div>
                    </Td>
                    <Td style={{ verticalAlign: "top" }}>
                      <SelectInput value={row.impacto} onChange={v => updRow("phase2","riscos",row.id,"impacto",v)} options={["Alto","Médio","Baixo"]} />
                      <div style={{ marginTop: 5 }}><RiskBadge level={row.impacto} /></div>
                    </Td>
                    <Td><EditField value={row.mitigacao} onChange={v => updRow("phase2","riscos",row.id,"mitigacao",v)} placeholder="Plano de mitigação" multi /></Td>
                    <Td><DeleteBtn onClick={() => delRow("phase2","riscos",row.id)} /></Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            <div style={{ marginTop: 10 }}>
              <GhostBtn onClick={() => addRow("phase2","riscos",{ risco:"", probabilidade:"Média", impacto:"Médio", mitigacao:"" })}>＋ Adicionar risco</GhostBtn>
            </div>
          </SubSection>
        </PhaseSection>

        {/* ===== FASE 3 — EXECUÇÃO ===== */}
        <PhaseSection phaseNum={3} title="Fase 3 — Execução" expanded={phases[3]} onToggle={() => toggle(3)}>

          <SubSection title="3.1 Registro de Atividades">
            <TableWrap>
              <THead>
                <tr>
                  <Th>Atividade</Th>
                  <Th w="160px">Responsável</Th>
                  <Th w="130px">Prazo</Th>
                  <Th w="160px">Status</Th>
                  <Th w="46px"></Th>
                </tr>
              </THead>
              <tbody>
                {phase3.atividades.map((row, i) => (
                  <tr key={row.id} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                    <Td><EditField value={row.atividade}   onChange={v => updRow("phase3","atividades",row.id,"atividade",v)}   placeholder="Descrição da atividade" /></Td>
                    <Td><EditField value={row.responsavel} onChange={v => updRow("phase3","atividades",row.id,"responsavel",v)} placeholder="Responsável" /></Td>
                    <Td><DateInput value={row.prazo} onChange={v => updRow("phase3","atividades",row.id,"prazo",v)} /></Td>
                    <Td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {["Pendente","Em andamento","Concluída"].map(opt => (
                          <label key={opt} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                            <input type="radio" name={`at-${row.id}`} checked={row.status === opt}
                              onChange={() => updRow("phase3","atividades",row.id,"status",opt)}
                              style={{ accentColor: theme.phases[3].bg }} />
                            <StatusBadge status={opt} size="small" />
                          </label>
                        ))}
                      </div>
                    </Td>
                    <Td><DeleteBtn onClick={() => delRow("phase3","atividades",row.id)} /></Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            <div style={{ marginTop: 10 }}>
              <GhostBtn onClick={() => addRow("phase3","atividades",{ atividade:"", responsavel:"", prazo:"", status:"Pendente" })}>＋ Adicionar atividade</GhostBtn>
            </div>
          </SubSection>

          <SubSection title="3.2 Impedimentos / Bloqueios">
            <TableWrap>
              <THead>
                <tr>
                  <Th>Impedimento</Th>
                  <Th w="130px">Data identificado</Th>
                  <Th w="170px">Resp. pela solução</Th>
                  <Th>Resolução / Data</Th>
                  <Th w="46px"></Th>
                </tr>
              </THead>
              <tbody>
                {phase3.impedimentos.map((row, i) => (
                  <tr key={row.id} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                    <Td><EditField value={row.impedimento}      onChange={v => updRow("phase3","impedimentos",row.id,"impedimento",v)}      placeholder="Descrição do impedimento" multi /></Td>
                    <Td><DateInput value={row.dataIdentificado} onChange={v => updRow("phase3","impedimentos",row.id,"dataIdentificado",v)} /></Td>
                    <Td><EditField value={row.responsavel}      onChange={v => updRow("phase3","impedimentos",row.id,"responsavel",v)}      placeholder="Responsável" /></Td>
                    <Td><EditField value={row.resolucao}        onChange={v => updRow("phase3","impedimentos",row.id,"resolucao",v)}        placeholder="Descrição da resolução e data" multi /></Td>
                    <Td><DeleteBtn onClick={() => delRow("phase3","impedimentos",row.id)} /></Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            <div style={{ marginTop: 10 }}>
              <GhostBtn onClick={() => addRow("phase3","impedimentos",{ impedimento:"", dataIdentificado:"", responsavel:"", resolucao:"" })}>＋ Adicionar impedimento</GhostBtn>
            </div>
          </SubSection>

          <SubSection title="3.3 Registro de Decisões">
            <TableWrap>
              <THead>
                <tr>
                  <Th w="130px">Data</Th>
                  <Th>Decisão tomada</Th>
                  <Th w="200px">Quem decidiu</Th>
                  <Th w="46px"></Th>
                </tr>
              </THead>
              <tbody>
                {phase3.decisoes.map((row, i) => (
                  <tr key={row.id} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                    <Td><DateInput value={row.data} onChange={v => updRow("phase3","decisoes",row.id,"data",v)} /></Td>
                    <Td><EditField value={row.decisao}     onChange={v => updRow("phase3","decisoes",row.id,"decisao",v)}     placeholder="Decisão tomada" multi /></Td>
                    <Td><EditField value={row.quemDecidiu} onChange={v => updRow("phase3","decisoes",row.id,"quemDecidiu",v)} placeholder="Nome / cargo" /></Td>
                    <Td><DeleteBtn onClick={() => delRow("phase3","decisoes",row.id)} /></Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            <div style={{ marginTop: 10 }}>
              <GhostBtn onClick={() => addRow("phase3","decisoes",{ data:"", decisao:"", quemDecidiu:"" })}>＋ Adicionar decisão</GhostBtn>
            </div>
          </SubSection>
        </PhaseSection>

        {/* ===== FASE 4 — MONITORAMENTO ===== */}
        <PhaseSection phaseNum={4} title="Fase 4 — Monitoramento / Desempenho" expanded={phases[4]} onToggle={() => toggle(4)}>

          <SubSection title="4.1 KPIs do Projeto">
            <TableWrap>
              <THead>
                <tr>
                  <Th>Indicador (KPI)</Th>
                  <Th w="130px">Meta</Th>
                  <Th w="130px">Realizado</Th>
                  <Th w="100px">Variação</Th>
                  <Th w="160px">Status</Th>
                </tr>
              </THead>
              <tbody>
                {phase4.kpis.map((row, i) => (
                  <tr key={row.id} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                    <Td style={{ fontWeight: 500, color: theme.navy }}>{row.indicador}</Td>
                    <Td><EditField value={row.meta}      onChange={v => updRow("phase4","kpis",row.id,"meta",v)}      placeholder="Meta" /></Td>
                    <Td><EditField value={row.realizado} onChange={v => updRow("phase4","kpis",row.id,"realizado",v)} placeholder="Realizado" /></Td>
                    <Td><EditField value={row.variacao}  onChange={v => updRow("phase4","kpis",row.id,"variacao",v)}  placeholder="—" /></Td>
                    <Td>
                      <SelectInput value={row.status} onChange={v => updRow("phase4","kpis",row.id,"status",v)} options={["Em dia","Atenção","Atrasado","Pendente"]} />
                      <div style={{ marginTop: 5 }}><StatusBadge status={row.status} size="small" /></div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </SubSection>

          <SubSection title="4.2 Relatório de Status (por período)">
            <TableWrap>
              <THead>
                <tr>
                  <Th w="130px">Data</Th>
                  <Th w="170px">Status geral</Th>
                  <Th>O que foi feito</Th>
                  <Th>Próximos passos</Th>
                  <Th w="46px"></Th>
                </tr>
              </THead>
              <tbody>
                {phase4.relatorioStatus.map((row, i) => (
                  <tr key={row.id} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                    <Td><DateInput value={row.data} onChange={v => updRow("phase4","relatorioStatus",row.id,"data",v)} /></Td>
                    <Td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {["Em dia","Atenção","Atrasado"].map(opt => (
                          <label key={opt} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                            <input type="radio" name={`rel-${row.id}`} checked={row.statusGeral === opt}
                              onChange={() => updRow("phase4","relatorioStatus",row.id,"statusGeral",opt)}
                              style={{ accentColor: theme.phases[4].bg }} />
                            <StatusBadge status={opt} size="small" />
                          </label>
                        ))}
                      </div>
                    </Td>
                    <Td><EditField value={row.feito}   onChange={v => updRow("phase4","relatorioStatus",row.id,"feito",v)}   placeholder="O que foi feito neste período..." multi /></Td>
                    <Td><EditField value={row.proximos} onChange={v => updRow("phase4","relatorioStatus",row.id,"proximos",v)} placeholder="Próximos passos..." multi /></Td>
                    <Td><DeleteBtn onClick={() => delRow("phase4","relatorioStatus",row.id)} /></Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            <div style={{ marginTop: 10 }}>
              <GhostBtn onClick={() => addRow("phase4","relatorioStatus",{ data:"", statusGeral:"Em dia", feito:"", proximos:"" })}>＋ Adicionar relatório de status</GhostBtn>
            </div>
          </SubSection>
        </PhaseSection>

        {/* ===== FASE 5 — ENCERRAMENTO ===== */}
        <PhaseSection phaseNum={5} title="Fase 5 — Encerramento" expanded={phases[5]} onToggle={() => toggle(5)}>

          <SubSection title="5.1 Verificação de Entregáveis">
            <TableWrap>
              <THead>
                <tr>
                  <Th>Entregável</Th>
                  <Th w="140px">Aceite formal?</Th>
                  <Th w="200px">Responsável pelo aceite</Th>
                  <Th w="46px"></Th>
                </tr>
              </THead>
              <tbody>
                {phase5.entregaveis.map((row, i) => (
                  <tr key={row.id} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                    <Td><EditField value={row.entregavel} onChange={v => updRow("phase5","entregaveis",row.id,"entregavel",v)} placeholder="Descrição do entregável" /></Td>
                    <Td>
                      <div style={{ display: "flex", gap: 16 }}>
                        {[{ val: true, label: "Sim", color: "#16a34a" }, { val: false, label: "Não", color: "#dc2626" }].map(opt => (
                          <label key={String(opt.val)} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                            <input type="radio" name={`aceite-${row.id}`}
                              checked={row.aceite === opt.val}
                              onChange={() => updRow("phase5","entregaveis",row.id,"aceite",opt.val)}
                              style={{ accentColor: opt.color }} />
                            <span style={{ fontSize: 13, fontWeight: 700, color: opt.color }}>{opt.label}</span>
                          </label>
                        ))}
                        {row.aceite === null && <span style={{ fontSize: 11, color: theme.textMuted, fontStyle: "italic" }}>Pendente</span>}
                      </div>
                    </Td>
                    <Td><EditField value={row.responsavel} onChange={v => updRow("phase5","entregaveis",row.id,"responsavel",v)} placeholder="Responsável" /></Td>
                    <Td><DeleteBtn onClick={() => delRow("phase5","entregaveis",row.id)} /></Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            <div style={{ marginTop: 10 }}>
              <GhostBtn onClick={() => addRow("phase5","entregaveis",{ entregavel:"", aceite:null, responsavel:"" })}>＋ Adicionar entregável</GhostBtn>
            </div>
          </SubSection>

          <SubSection title="5.2 Lições Aprendidas">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { label: "✓ O que funcionou bem?",     key: "funcionouBem", hBg: "#dcfce7", hText: "#065f46", bBorder: "#bbf7d0" },
                { label: "↑ O que deve ser melhorado?", key: "melhorar",    hBg: "#fef9c3", hText: "#854d0e", bBorder: "#fef08a" },
              ].map(col => (
                <div key={col.key}>
                  <div style={{ background: col.hBg, color: col.hText, padding: "8px 14px", borderRadius: "6px 6px 0 0", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                    {col.label}
                  </div>
                  <div style={{ border: `1px solid ${col.bBorder}`, borderTop: "none", borderRadius: "0 0 6px 6px", padding: 2, minHeight: 90 }}>
                    <EditField
                      value={phase5.licoesAprendidas[col.key]}
                      onChange={v => setData(d => ({ ...d, phase5: { ...d.phase5, licoesAprendidas: { ...d.phase5.licoesAprendidas, [col.key]: v } } }))}
                      placeholder={col.key === "funcionouBem" ? "Descreva o que funcionou bem..." : "Descreva o que deve melhorar em projetos futuros..."}
                      multi minH={80}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SubSection>

          <SubSection title="5.3 Checklist de Encerramento">
            <div style={{ background: "#f8f9fb", border: `1px solid ${theme.border}`, borderRadius: 6, padding: "10px 20px" }}>
              {[
                { key: "entregaveisAceitos", label: "Todos os entregáveis aceitos formalmente" },
                { key: "licoesRegistradas",  label: "Lições aprendidas registradas" },
                { key: "comunicadoEnviado",  label: "Comunicado de encerramento enviado" },
                { key: "recursosLiberados",  label: "Recursos da equipe liberados" },
                { key: "projetoMarcado",     label: "Projeto marcado como Concluído no portfólio" },
              ].map(item => (
                <CheckItem key={item.key} checked={phase5.checklist[item.key]} onChange={v => setCheckP5(item.key, v)} label={item.label} />
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: theme.textMuted }}>
              <span style={{ background: theme.phases[5].light, color: theme.phases[5].bg, padding: "2px 10px", borderRadius: 20, fontWeight: 700 }}>
                {p5Done} / {Object.keys(phase5.checklist).length} itens concluídos
              </span>
            </div>
          </SubSection>

          <SubSection title="5.4 Resumo Executivo de Encerramento">
            <div style={{ background: "#f8f9fb", border: `1px solid ${theme.border}`, borderRadius: 6, padding: "20px 24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 48px", marginBottom: 4 }}>
                <FieldRow label="Data de encerramento real">
                  <DateInput value={phase5.resumo.dataEncerramento} onChange={v => setData(d => ({ ...d, phase5: { ...d.phase5, resumo: { ...d.phase5.resumo, dataEncerramento: v } } }))} />
                </FieldRow>
                <FieldRow label="Data prevista original">
                  <DateInput value={phase5.resumo.dataPrevista} onChange={v => setData(d => ({ ...d, phase5: { ...d.phase5, resumo: { ...d.phase5.resumo, dataPrevista: v } } }))} />
                </FieldRow>
              </div>
              <div style={{ padding: "9px 0", borderBottom: `1px solid ${theme.borderLight}` }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                  Objetivo atingido?
                </span>
                <div style={{ display: "flex", gap: 28, paddingLeft: 2, marginTop: 8 }}>
                  {["Totalmente", "Parcialmente", "Não atingido"].map(opt => (
                    <label key={opt} style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 13 }}>
                      <input type="radio" name="objAtingido" value={opt}
                        checked={phase5.resumo.objetivoAtingido === opt}
                        onChange={() => setData(d => ({ ...d, phase5: { ...d.phase5, resumo: { ...d.phase5.resumo, objetivoAtingido: opt } } }))}
                        style={{ accentColor: theme.navy }} />
                      <span style={{
                        fontWeight: 600,
                        color: opt === "Totalmente" ? "#166534" : opt === "Parcialmente" ? "#854d0e" : "#991b1b",
                      }}>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ padding: "9px 0", borderBottom: `1px solid ${theme.borderLight}` }}>
                <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>
                  Principais resultados
                </span>
                <EditField
                  value={phase5.resumo.resultados}
                  onChange={v => setData(d => ({ ...d, phase5: { ...d.phase5, resumo: { ...d.phase5.resumo, resultados: v } } }))}
                  placeholder="Descreva os principais resultados e entregas alcançadas pelo projeto..."
                  multi minH={72}
                />
              </div>
              <div style={{ padding: "9px 0" }}>
                <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: theme.textSecondary, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>
                  Aprovação final por
                </span>
                <EditField
                  value={phase5.resumo.aprovadoPor}
                  onChange={v => setData(d => ({ ...d, phase5: { ...d.phase5, resumo: { ...d.phase5.resumo, aprovadoPor: v } } }))}
                  placeholder="Nome, cargo e assinatura do aprovador final"
                />
              </div>
            </div>
          </SubSection>
        </PhaseSection>

        {/* ── FOOTER ── */}
        <div style={{
          textAlign: "center", padding: "20px 0 16px",
          color: theme.textMuted, fontSize: 12,
          borderTop: `1px solid ${theme.border}`,
        }}>
          <span style={{ fontWeight: 600 }}>Template de Projeto</span>
          {" "}·{" "}Equipe de Transformação Digital
          {" "}·{" "}Documento confidencial — uso interno
        </div>
      </div>
    </div>
  );
}
