import React, { useState, useEffect, useContext, createContext, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "./lib/supabase";
import ScrumProjectRegister from "./ScrumProjectRegister";
import PocRegister from "./PocRegister";
import {
  LayoutDashboard, FolderKanban, BarChart3, Settings, Bell,
  Search, ChevronRight, TrendingUp, AlertTriangle, CheckCircle2,
  Zap, Shield, Target, Activity, Package, ArrowUpRight,
  ArrowDownRight, MoreHorizontal, Plus, Filter, Layers, Globe,
  Sun, Moon, FlaskConical, Star, Clock, Award, Users,
  ThumbsUp, ThumbsDown, FileSearch, Microscope, CircleDot,
  ChevronDown, Download, RefreshCw, Eye,
} from "lucide-react";

// ─── THEME CONTEXT ────────────────────────────────────────────────────────────
const ThemeCtx = createContext({ dark: true, toggle: () => {} });
const useTheme = () => useContext(ThemeCtx);

const getC = (dark) => dark ? {
  // Dark: Grafite + Azul Petróleo + Roxo Suave
  bg0: "#070C17", bg1: "#0B1120", bg2: "#0F1729", bg3: "#162035",
  bg4: "#1C2940",
  card: "rgba(255,255,255,0.030)",
  cardHov: "rgba(255,255,255,0.055)",
  surface: "rgba(255,255,255,0.045)",
  border: "rgba(255,255,255,0.07)",
  borderHov: "rgba(255,255,255,0.14)",
  borderStrong: "rgba(255,255,255,0.18)",
  blue: "#4F8EF7", blueD: "#2563EB", blueGlow: "rgba(79,142,247,0.14)",
  emerald: "#10B981", emeraldGlow: "rgba(16,185,129,0.13)",
  amber: "#F59E0B", amberGlow: "rgba(245,158,11,0.13)",
  rose: "#F43F5E", roseGlow: "rgba(244,63,94,0.12)",
  violet: "#9B7FFF", violetGlow: "rgba(155,127,255,0.13)",
  cyan: "#22D3EE", cyanGlow: "rgba(34,211,238,0.12)",
  t1: "#EFF3FC", t2: "#8DA3C0", t3: "#4A637F", t4: "#1D2E42",
  sidebarW: 248,
  scrollbar: "#1C2940",
} : {
  // Light: Branco Gelo + Cinza Premium + Azul Discreto
  bg0: "#F0F3FA", bg1: "#FFFFFF", bg2: "#F5F7FD", bg3: "#E8EDF8",
  bg4: "#DDE4F0",
  card: "rgba(255,255,255,0.92)",
  cardHov: "rgba(255,255,255,1)",
  surface: "rgba(240,243,250,0.8)",
  border: "rgba(0,0,0,0.075)",
  borderHov: "rgba(0,0,0,0.15)",
  borderStrong: "rgba(0,0,0,0.20)",
  blue: "#2563EB", blueD: "#1D4ED8", blueGlow: "rgba(37,99,235,0.10)",
  emerald: "#059669", emeraldGlow: "rgba(5,150,105,0.10)",
  amber: "#D97706", amberGlow: "rgba(217,119,6,0.10)",
  rose: "#E11D48", roseGlow: "rgba(225,29,72,0.09)",
  violet: "#7C3AED", violetGlow: "rgba(124,58,237,0.09)",
  cyan: "#0891B2", cyanGlow: "rgba(8,145,178,0.09)",
  t1: "#0E1726", t2: "#3D556F", t3: "#7A93AD", t4: "#B8CBDF",
  sidebarW: 248,
  scrollbar: "#E8EDF8",
};

// ─── DATA ──────────────────────────────────────────────────────────────────────
const roiData = [
  { m:"Jan", roi:12, meta:10 }, { m:"Fev", roi:19, meta:12 },
  { m:"Mar", roi:15, meta:13 }, { m:"Abr", roi:28, meta:15 },
  { m:"Mai", roi:24, meta:16 }, { m:"Jun", roi:32, meta:18 },
  { m:"Jul", roi:38, meta:20 }, { m:"Ago", roi:35, meta:22 },
  { m:"Set", roi:42, meta:24 }, { m:"Out", roi:48, meta:26 },
  { m:"Nov", roi:52, meta:28 }, { m:"Dez", roi:61, meta:30 },
];
const prodData = [
  { m:"Jan", prod:74 }, { m:"Fev", prod:78 }, { m:"Mar", prod:72 },
  { m:"Abr", prod:83 }, { m:"Mai", prod:87 }, { m:"Jun", prod:85 },
  { m:"Jul", prod:91 }, { m:"Ago", prod:89 }, { m:"Set", prod:93 },
  { m:"Out", prod:96 }, { m:"Nov", prod:94 }, { m:"Dez", prod:97 },
];
const deliveryData = [
  { m:"Jan", ok:18, atr:4 }, { m:"Fev", ok:22, atr:3 }, { m:"Mar", ok:20, atr:6 },
  { m:"Abr", ok:26, atr:2 }, { m:"Mai", ok:24, atr:4 }, { m:"Jun", ok:30, atr:2 },
  { m:"Jul", ok:28, atr:3 }, { m:"Ago", ok:32, atr:1 }, { m:"Set", ok:35, atr:2 },
  { m:"Out", ok:38, atr:1 }, { m:"Nov", ok:36, atr:3 }, { m:"Dez", ok:40, atr:1 },
];
const slaData = [
  { name:"Conformidade", value:94, fill:"#10B981" },
  { name:"Violações",    value:6,  fill:"#F43F5E" },
];
const projects = [
  { id:"BP-001", name:"Migração Cloud AWS",       status:"Em Andamento", prog:72,  resp:"Ana Lima",      prazo:"28/02/25", prioridade:"Alta",    orcamento:"R$ 1.2M", risco:"Médio" },
  { id:"BP-002", name:"ERP SAP S/4HANA",          status:"Em Andamento", prog:48,  resp:"Carlos Melo",   prazo:"30/06/25", prioridade:"Crítica", orcamento:"R$ 4.8M", risco:"Alto"  },
  { id:"BP-003", name:"BI & Analytics Platform",  status:"Concluído",    prog:100, resp:"Marina Costa",  prazo:"15/01/25", prioridade:"Alta",    orcamento:"R$ 780K", risco:"Baixo" },
  { id:"BP-004", name:"Automação RPA Financeiro", status:"Em Andamento", prog:31,  resp:"Pedro Rocha",   prazo:"15/04/25", prioridade:"Média",   orcamento:"R$ 320K", risco:"Baixo" },
  { id:"BP-005", name:"Portal do Colaborador",    status:"Planejamento", prog:8,   resp:"Juliana Dias",  prazo:"31/08/25", prioridade:"Média",   orcamento:"R$ 560K", risco:"Baixo" },
  { id:"BP-006", name:"Cibersegurança ZeroTrust", status:"Em Andamento", prog:55,  resp:"Rafael Nunes",  prazo:"30/05/25", prioridade:"Crítica", orcamento:"R$ 2.1M", risco:"Alto"  },
];
const kanbanCols = [
  { id:"backlog",  label:"Backlog",       color:"#4A637F", items:[
    { id:"k1", title:"Integração API Legado",    tag:"Backend", p:"Média" },
    { id:"k2", title:"Plano DR & BCP",           tag:"Infra",   p:"Alta"  },
  ]},
  { id:"progress", label:"Em Progresso",  color:"#4F8EF7", items:[
    { id:"k3", title:"Dashboard Executivo BI",   tag:"Analytics", p:"Alta"    },
    { id:"k4", title:"Migração Banco de Dados",  tag:"Infra",     p:"Crítica" },
    { id:"k5", title:"Treinamento Change Mgmt",  tag:"People",    p:"Média"   },
  ]},
  { id:"review",   label:"Em Revisão",    color:"#F59E0B", items:[
    { id:"k6", title:"Documentação Técnica SAP", tag:"ERP", p:"Alta"    },
    { id:"k7", title:"UAT Módulo Financeiro",    tag:"QA",  p:"Crítica" },
  ]},
  { id:"done",     label:"Concluído",     color:"#10B981", items:[
    { id:"k8", title:"Arquitetura Cloud Definida", tag:"Infra",    p:"Alta" },
    { id:"k9", title:"Contrato AWS Enterprise",    tag:"Compras",  p:"Alta" },
  ]},
];
const suppliers = [
  { name:"AWS Amazon",        cat:"Cloud",       sla:99.9, score:98, contrato:"R$ 1.8M/ano", status:"Ativo", venc:"Dez/25" },
  { name:"SAP Brasil",        cat:"ERP",         sla:97.2, score:91, contrato:"R$ 2.4M/ano", status:"Ativo", venc:"Jun/26" },
  { name:"Deloitte Tech",     cat:"Consultoria", sla:95.5, score:88, contrato:"R$ 960K/ano", status:"Ativo", venc:"Mar/25" },
  { name:"Palo Alto Networks",cat:"Segurança",   sla:99.5, score:96, contrato:"R$ 480K/ano", status:"Ativo", venc:"Out/25" },
  { name:"UiPath",            cat:"RPA",         sla:98.1, score:92, contrato:"R$ 220K/ano", status:"Ativo", venc:"Abr/26" },
  { name:"Power BI Premium",  cat:"Analytics",   sla:99.0, score:94, contrato:"R$ 180K/ano", status:"Ativo", venc:"Jan/26" },
];
const activities = [
  { time:"Agora", icon:CheckCircle2, color:"#10B981", text:"Entrega concluída: Módulo BI Analytics v2.3" },
  { time:"2h",    icon:AlertTriangle,color:"#F59E0B", text:"Alerta: SLA SAP abaixo de 98% no período"    },
  { time:"4h",    icon:Zap,          color:"#4F8EF7", text:"Deploy realizado: Portal Colaborador — Homologação" },
  { time:"6h",    icon:Shield,       color:"#9B7FFF", text:"Relatório de segurança ZeroTrust gerado"     },
  { time:"8h",    icon:Target,       color:"#22D3EE", text:"OKR Q1/2025 atualizado — 87% de aderência"  },
  { time:"1d",    icon:Users,        color:"#F43F5E", text:"Reunião Steering Committee agendada"         },
  { time:"2d",    icon:Package,      color:"#10B981", text:"Contrato Deloitte renovado com novos SLA"    },
];

// ─── POC DATA ─────────────────────────────────────────────────────────────────
const pocs = [
  {
    id:"POC-001", name:"Snowflake Data Cloud", supplier:"Snowflake Inc.",
    resp:"Marina Costa", cat:"Analytics", start:"02/01/25", end:"31/01/25",
    status:"Aprovado", roiEsp:180, score:94,
    tecnico:92, funcional:95, financeiro:88, estrategico:96,
    orcamento:"R$ 48K", result:"Excelente performance em queries complexas. Integração nativa com AWS aprovada.",
    criterios:["Performance", "Escalabilidade", "Custo-benefício", "Integração"],
  },
  {
    id:"POC-002", name:"ServiceNow ITSM", supplier:"ServiceNow",
    resp:"Rafael Nunes", cat:"ITSM", start:"05/01/25", end:"20/02/25",
    status:"Em Avaliação", roiEsp:140, score:78,
    tecnico:82, funcional:75, financeiro:70, estrategico:84,
    orcamento:"R$ 32K", result:"Customizações avançadas em análise. Dependência de módulos adicionais identificada.",
    criterios:["Automação", "Relatórios", "Integrações", "UX"],
  },
  {
    id:"POC-003", name:"Databricks Lakehouse", supplier:"Databricks",
    resp:"Carlos Melo", cat:"Data Eng.", start:"10/01/25", end:"28/02/25",
    status:"Em Teste", roiEsp:220, score:81,
    tecnico:88, funcional:80, financeiro:72, estrategico:82,
    orcamento:"R$ 55K", result:"Testes de carga em andamento. Pipeline de dados 40% mais eficiente.",
    criterios:["Processamento", "ML/IA", "Custo compute", "Governança"],
  },
  {
    id:"POC-004", name:"CrowdStrike Falcon", supplier:"CrowdStrike",
    resp:"Ana Lima", cat:"Segurança", start:"08/12/24", end:"07/01/25",
    status:"Aprovado", roiEsp:310, score:97,
    tecnico:98, funcional:96, financeiro:94, estrategico:99,
    orcamento:"R$ 28K", result:"Zero falsos positivos em 30 dias. Detection rate de 99,98%. Aprovado sem ressalvas.",
    criterios:["Detecção", "Response", "Falsos positivos", "Cobertura"],
  },
  {
    id:"POC-005", name:"Workday HCM", supplier:"Workday",
    resp:"Juliana Dias", cat:"RH Digital", start:"15/11/24", end:"15/12/24",
    status:"Reprovado", roiEsp:90, score:52,
    tecnico:60, funcional:48, financeiro:44, estrategico:56,
    orcamento:"R$ 40K", result:"Custo de implementação 3x acima do estimado. Customização limitada para legislação BR.",
    criterios:["Aderência BR", "Customização", "TCO", "Suporte local"],
  },
  {
    id:"POC-006", name:"Mulesoft Integration", supplier:"Salesforce",
    resp:"Pedro Rocha", cat:"Integration", start:"20/01/25", end:"28/02/25",
    status:"Em Teste", roiEsp:165, score:71,
    tecnico:75, funcional:72, financeiro:65, estrategico:70,
    orcamento:"R$ 36K", result:"APIs críticas mapeadas. Latência dentro do SLA. Documentação em elaboração.",
    criterios:["APIs", "Latência", "Monitoramento", "Escalabilidade"],
  },
];

const pocAprovData = [
  { m:"Out/24", total:2, aprov:1 }, { m:"Nov/24", total:3, aprov:2 },
  { m:"Dez/24", total:4, aprov:3 }, { m:"Jan/25", total:6, aprov:4 },
];
const pocRoiData = pocs.filter(p => p.status === "Aprovado" || p.status === "Em Avaliação").map(p => ({
  name: p.supplier.split(" ")[0], roi: p.roiEsp, score: p.score,
}));
const pocPerfData = pocs.map(p => ({
  name: p.supplier.split(" ")[0],
  Técnico: p.tecnico, Funcional: p.funcional,
  Financeiro: p.financeiro, Estratégico: p.estrategico,
}));

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const scoreColor = (s, C) => s >= 90 ? C.emerald : s >= 70 ? C.amber : C.rose;
const pocStatusConf = (C) => ({
  "Aprovado":    { color: C.emerald, bg: C.emeraldGlow },
  "Reprovado":   { color: C.rose,    bg: C.roseGlow    },
  "Em Teste":    { color: C.blue,    bg: C.blueGlow    },
  "Em Avaliação":{ color: C.amber,   bg: C.amberGlow   },
});
const projStatusConf = (C) => ({
  "Em Andamento": { color: C.blue,   bg: C.blueGlow   },
  "Concluído":    { color: C.emerald,bg: C.emeraldGlow },
  "Planejamento": { color: C.violet, bg: C.violetGlow  },
  "Ativo":        { color: C.emerald,bg: C.emeraldGlow },
  "Pausado":      { color: C.amber,  bg: C.amberGlow   },
});
const priConf = (C) => ({
  "Crítica": { c: C.rose,   b: C.roseGlow   },
  "Alta":    { c: C.amber,  b: C.amberGlow  },
  "Média":   { c: C.blue,   b: C.blueGlow   },
  "Baixa":   { c: C.t3,     b: C.card       },
});

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
const Chip = ({ label, color, bg, border }) => (
  <span style={{
    display:"inline-flex", alignItems:"center", padding:"3px 10px",
    borderRadius:6, fontSize:11, fontWeight:600, letterSpacing:"0.04em",
    color, background: bg, border:`1px solid ${border || color + "33"}`,
  }}>{label}</span>
);

const formatPct = (value) => `${Number(value || 0).toFixed(1).replace(".", ",")}%`;

const ProgressBar = ({ val, color, C }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
    <div style={{ flex:1, height:4, background:C.bg3, borderRadius:99, overflow:"hidden" }}>
      <div style={{ width:`${val}%`, height:"100%", background:color, borderRadius:99, transition:"width 0.9s ease" }} />
    </div>
    <span style={{ fontSize:12, color:C.t2, minWidth:42, textAlign:"right" }}>{formatPct(val)}</span>
  </div>
);

const ScoreRing = ({ val, C, size = 56 }) => {
  const r = (size / 2) - 5;
  const circ = 2 * Math.PI * r;
  const dash = (val / 100) * circ;
  const col = scoreColor(val, C);
  return (
    <div style={{ position:"relative", width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.bg3} strokeWidth={4} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={4}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition:"stroke-dasharray 1s ease" }} />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:col }}>{val}</div>
    </div>
  );
};

const KPICard = ({ icon: Icon, label, value, sub, trend, trendVal, color, glow, C }) => (
  <div style={{
    background:C.card, border:`1px solid ${C.border}`, borderRadius:12,
    padding:"20px 22px", display:"flex", flexDirection:"column", gap:14,
    position:"relative", overflow:"hidden", transition:"border-color 0.2s, background 0.2s",
    backdropFilter:"blur(8px)",
  }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderHov; e.currentTarget.style.background = C.cardHov; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}
  >
    <div style={{ position:"absolute", top:-20, right:-20, width:100, height:100, borderRadius:"50%", background:glow, filter:"blur(32px)", pointerEvents:"none" }} />
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
      <div style={{ padding:9, borderRadius:10, background:glow, border:`1px solid ${color}28` }}>
        <Icon size={17} color={color} />
      </div>
      {trendVal && (
        <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, fontWeight:600, color:trend==="up"?C.emerald:C.rose }}>
          {trend==="up" ? <ArrowUpRight size={13}/> : <ArrowDownRight size={13}/>} {trendVal}
        </div>
      )}
    </div>
    <div>
      <div style={{ fontSize:26, fontWeight:700, color:C.t1, letterSpacing:"-0.02em", lineHeight:1.1 }}>{value}</div>
      <div style={{ fontSize:13, color:C.t2, marginTop:4 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:C.t3, marginTop:3 }}>{sub}</div>}
    </div>
  </div>
);

const CT = ({ active, payload, label, C }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 14px", backdropFilter:"blur(12px)" }}>
      <div style={{ fontSize:12, color:C.t3, marginBottom:6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize:13, color:C.t1, display:"flex", gap:8, alignItems:"center", marginBottom:2 }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:p.color }} />
          <span style={{ color:C.t2 }}>{p.name}:</span>
          <span style={{ fontWeight:600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const SectionHeader = ({ title, sub, actions, C }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
    <div>
      <div style={{ fontSize:22, fontWeight:700, color:C.t1, letterSpacing:"-0.025em" }}>{title}</div>
      {sub && <div style={{ fontSize:13, color:C.t3, marginTop:3 }}>{sub}</div>}
    </div>
    {actions && <div style={{ display:"flex", gap:10 }}>{actions}</div>}
  </div>
);

const Btn = ({ label, icon: Icon, primary, onClick, C }) => (
  <button onClick={onClick} style={{
    display:"flex", alignItems:"center", gap:6, padding:"8px 16px",
    borderRadius:8, border:`1px solid ${primary ? "transparent" : C.border}`,
    background:primary ? C.blue : C.card, color:primary ? "#fff" : C.t2,
    fontSize:13, fontWeight:primary ? 600 : 400, cursor:"pointer",
    transition:"opacity 0.15s",
  }}
    onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
  >
    {Icon && <Icon size={14}/>} {label}
  </button>
);

const card = (C) => ({
  background:C.card, border:`1px solid ${C.border}`,
  borderRadius:12, backdropFilter:"blur(8px)",
});
const inputStyle = (C) => ({
  width: "100%",
  background: C.bg3,
  border: `1px solid ${C.border}`,
  color: C.t1,
  borderRadius: 10,
  padding: "11px 13px",
  fontSize: 13,
  outline: "none",
});
// ─── VIEWS ────────────────────────────────────────────────────────────────────
function Dashboard({ C }) {
  const [loading, setLoading] = useState(false);
  const [projetos, setProjetos] = useState([]);
  const [pocsRegistros, setPocsRegistros] = useState([]);
  const [fornecedoresDb, setFornecedoresDb] = useState([]);

  function toNum(value) {
    const parsed = Number(String(value || "0").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function pct(value) {
    return `${Number(value || 0).toFixed(1).replace(".", ",")}%`;
  }

  function normalizarEtapa(etapa) {
    if (!etapa) return "Backlog";
    const texto = String(etapa).toLowerCase();

    if (texto.includes("backlog") || texto.includes("início") || texto.includes("inicio")) return "Backlog";
    if (texto.includes("plane")) return "Planejamento";
    if (texto.includes("exec") || texto.includes("andamento")) return "Execução";
    if (texto.includes("monitor")) return "Monitoramento";
    if (texto.includes("encer") || texto.includes("concl")) return "Encerramento";

    return etapa;
  }

  function progressoPorEtapa(etapa) {
    const etapaNormalizada = normalizarEtapa(etapa);

    if (etapaNormalizada === "Backlog") return 10;
    if (etapaNormalizada === "Planejamento") return 30;
    if (etapaNormalizada === "Execução") return 60;
    if (etapaNormalizada === "Monitoramento") return 80;
    if (etapaNormalizada === "Encerramento") return 100;

    return 0;
  }

  function calcPoc(record) {
    const rows = record?.record_data?.analytics?.rows || [];

    const totals = rows.reduce(
      (acc, row) => {
        acc.totalMensagens += toNum(row.totalMensagens);
        acc.entregue += toNum(row.entregue);
        acc.lido += toNum(row.lido);
        acc.retorno += toNum(row.retornoCliente);
        acc.acordos += toNum(row.acordos);
        return acc;
      },
      { totalMensagens: 0, entregue: 0, lido: 0, retorno: 0, acordos: 0 }
    );

    return {
      ...totals,
      entrega: totals.totalMensagens > 0 ? (totals.entregue / totals.totalMensagens) * 100 : 0,
      leitura: totals.totalMensagens > 0 ? (totals.lido / totals.totalMensagens) * 100 : 0,
      conversao: totals.totalMensagens > 0 ? (totals.acordos / totals.totalMensagens) * 100 : 0,
    };
  }

  function getPocStatus(record) {
    return record?.status || record?.record_data?.general?.status || "Em avaliação";
  }

  function getPocRecommendation(record) {
    return record?.recommendation || record?.record_data?.evaluation?.recommendation || "Em avaliação";
  }

  async function carregarDashboard() {
    setLoading(true);

    const [projectsRes, pocsRes, suppliersRes] = await Promise.all([
      supabase.from("registros_do_projeto_scrum").select("*"),
      supabase.from("poc_records").select("*"),
      supabase.from("fornecedores").select("*"),
    ]);

    if (projectsRes.error) console.log("Erro ao carregar projetos no dashboard:", projectsRes.error);
    if (pocsRes.error) console.log("Erro ao carregar POCs no dashboard:", pocsRes.error);
    if (suppliersRes.error) console.log("Erro ao carregar fornecedores no dashboard:", suppliersRes.error);

    const projetosNormalizados = (projectsRes.data || []).map((registro) => {
      const dados = registro.dados_do_registro || registro.record_data || {};
      const info = dados.projectInfo || {};

      return {
        id: registro.id,
        name: registro.nome_do_projeto || registro.project_name || info.nome || "Projeto sem nome",
        responsible: registro.responsavel || registro.responsible || info.responsavel || "-",
        current_stage: registro.fase_atual || registro.current_phase || info.faseAtual || "Backlog",
        status: registro.fase_atual || registro.current_phase || info.faseAtual || "Backlog",
        end_date: info.previsaoEncerramento || registro.end_date || null,
      };
    });

    setProjetos(projetosNormalizados);
    setPocsRegistros(pocsRes.data || []);
    setFornecedoresDb(suppliersRes.data || []);
    setLoading(false);
  }

  useEffect(() => {
    carregarDashboard();
  }, []);

  const hoje = new Date().toISOString().slice(0, 10);

  const totalProjetos = projetos.length;
  const projetosExecucao = projetos.filter((p) => normalizarEtapa(p.current_stage || p.status) === "Execução").length;
  const projetosMonitoramento = projetos.filter((p) => normalizarEtapa(p.current_stage || p.status) === "Monitoramento").length;
  const projetosEncerrados = projetos.filter((p) => normalizarEtapa(p.current_stage || p.status) === "Encerramento").length;
  const projetosAtrasados = projetos.filter((p) => {
    const etapa = normalizarEtapa(p.current_stage || p.status);
    return p.end_date && p.end_date < hoje && etapa !== "Encerramento";
  }).length;

  const progressoMedio =
    totalProjetos > 0
      ? Math.round(projetos.reduce((acc, p) => acc + progressoPorEtapa(p.current_stage || p.status), 0) / totalProjetos)
      : 0;

  const etapasProjeto = ["Backlog", "Planejamento", "Execução", "Monitoramento", "Encerramento"].map((etapa) => {
    const qtd = projetos.filter((p) => normalizarEtapa(p.current_stage || p.status) === etapa).length;
    const perc = totalProjetos ? (qtd / totalProjetos) * 100 : 0;

    const color =
      etapa === "Backlog"
        ? C.t3
        : etapa === "Planejamento"
        ? C.violet
        : etapa === "Execução"
        ? C.blue
        : etapa === "Monitoramento"
        ? C.amber
        : C.emerald;

    return { name: etapa, qtd, perc, value: qtd, fill: color };
  });

  const totalPocs = pocsRegistros.length;
  const pocsExecucao = pocsRegistros.filter((p) => getPocStatus(p) === "Em Execução").length;
  const pocsCondicoes = pocsRegistros.filter((p) => getPocRecommendation(p) === "Aprovado com condições").length;

  const pocTotals = pocsRegistros.reduce(
    (acc, poc) => {
      const metrics = calcPoc(poc);
      acc.totalMensagens += metrics.totalMensagens;
      acc.entregue += metrics.entregue;
      acc.lido += metrics.lido;
      acc.retorno += metrics.retorno;
      acc.acordos += metrics.acordos;
      return acc;
    },
    { totalMensagens: 0, entregue: 0, lido: 0, retorno: 0, acordos: 0 }
  );

  const pocEntrega = pocTotals.totalMensagens > 0 ? (pocTotals.entregue / pocTotals.totalMensagens) * 100 : 0;
  const pocLeitura = pocTotals.totalMensagens > 0 ? (pocTotals.lido / pocTotals.totalMensagens) * 100 : 0;
  const pocConversao = pocTotals.totalMensagens > 0 ? (pocTotals.acordos / pocTotals.totalMensagens) * 100 : 0;

  const totalFornecedores = fornecedoresDb.length;
  const fornecedoresAtivos = fornecedoresDb.filter((f) => f.status === "Ativo").length;
  const fornecedoresAltoRisco = fornecedoresDb.filter((f) => f.risco === "Alto").length;
  const incidentesFornecedores = fornecedoresDb.reduce((acc, f) => acc + toNum(f.incidentes_abertos), 0);
  const scoreMedioFornecedor =
    totalFornecedores > 0
      ? Math.round(fornecedoresDb.reduce((acc, f) => acc + toNum(f.performance_score), 0) / totalFornecedores)
      : 0;

  const scoreProjetos = totalProjetos ? progressoMedio : 0;
  const scorePocs = totalPocs
    ? Math.min(100, pocEntrega * 0.45 + pocLeitura * 0.45 + Math.min(100, pocConversao * 30) * 0.10)
    : 0;
  const scoreFornecedores = totalFornecedores ? scoreMedioFornecedor : 0;

  const totalAlertas = projetosAtrasados + pocsCondicoes + fornecedoresAltoRisco + incidentesFornecedores;
  const scoreRisco = Math.max(0, 100 - Math.min(100, totalAlertas * 18));

  const scoresValidos = [
    totalProjetos ? scoreProjetos : null,
    totalPocs ? scorePocs : null,
    totalFornecedores ? scoreFornecedores : null,
    scoreRisco,
  ].filter((s) => s !== null);

  const saudeGeral = scoresValidos.length
    ? Math.round(scoresValidos.reduce((acc, item) => acc + item, 0) / scoresValidos.length)
    : 0;

  const saudeColor = saudeGeral >= 80 ? C.emerald : saudeGeral >= 60 ? C.amber : C.rose;

  const radarData = [
    { eixo: "Projetos", valor: scoreProjetos },
    { eixo: "POCs", valor: Math.round(scorePocs) },
    { eixo: "Fornecedores", valor: scoreFornecedores },
    { eixo: "Risco", valor: scoreRisco },
  ];

  const funnelData = [
    { etapa: "Mensagens", valor: pocTotals.totalMensagens, fill: C.violet },
    { etapa: "Entregues", valor: pocTotals.entregue, fill: C.emerald },
    { etapa: "Lidos", valor: pocTotals.lido, fill: C.blue },
    { etapa: "Retornos", valor: pocTotals.retorno, fill: C.amber },
    { etapa: "Acordos", valor: pocTotals.acordos, fill: C.rose },
  ];

  const pipelineChartData = etapasProjeto.some((item) => item.value > 0)
    ? etapasProjeto
    : [{ name: "Sem dados", value: 1, fill: C.t3 }];

  const topFornecedor = [...fornecedoresDb].sort((a, b) => toNum(b.performance_score) - toNum(a.performance_score))[0];

  const decisionItems = [
    {
      label: "Prioridade de gestão",
      value: totalAlertas > 0 ? "Acompanhar alertas" : "Operação estável",
      color: totalAlertas > 0 ? C.rose : C.emerald,
    },
    {
      label: "Projetos em foco",
      value: projetosAtrasados > 0 ? `${projetosAtrasados} atrasado(s)` : `${projetosExecucao + projetosMonitoramento} em andamento`,
      color: projetosAtrasados > 0 ? C.rose : C.blue,
    },
    {
      label: "Validações",
      value: totalPocs > 0 ? `${totalPocs} POC(s) cadastrada(s)` : "Sem POCs cadastradas",
      color: C.violet,
    },
    {
      label: "Fornecedor destaque",
      value: topFornecedor ? `${topFornecedor.nome} · ${toNum(topFornecedor.performance_score)}%` : "Sem fornecedor",
      color: C.emerald,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionHeader
        title="Control Tower Digital"
        sub="Visão executiva da Transformação Digital — status, riscos, validações e fornecedores"
        actions={[
          <Btn
            key="refresh"
            label={loading ? "Atualizando..." : "Atualizar"}
            icon={RefreshCw}
            C={C}
            onClick={carregarDashboard}
          />,
        ]}
        C={C}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 0.65fr", gap: 16 }}>
        <div
          style={{
            ...card(C),
            padding: "28px 30px",
            minHeight: 245,
            position: "relative",
            overflow: "hidden",
            background: `linear-gradient(135deg, ${C.blueGlow}, ${C.card}, ${C.violetGlow})`,
          }}
        >
          <div style={{ position: "absolute", top: -70, right: -60, width: 210, height: 210, borderRadius: "50%", background: C.blueGlow, filter: "blur(20px)" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: C.t3, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 900 }}>
                  Saúde operacional
                </div>
                <div style={{ fontSize: 64, lineHeight: 1, fontWeight: 950, color: saudeColor, marginTop: 8 }}>
                  {saudeGeral}%
                </div>
                <div style={{ fontSize: 15, color: C.t1, fontWeight: 900, marginTop: 8 }}>
                  {saudeGeral >= 80 ? "Operação saudável" : saudeGeral >= 60 ? "Atenção moderada" : "Atenção crítica"}
                </div>
              </div>

              <Chip
                label={`${totalAlertas} alerta(s)`}
                color={totalAlertas > 0 ? C.rose : C.emerald}
                bg={totalAlertas > 0 ? C.roseGlow : C.emeraldGlow}
              />
            </div>

            <div style={{ marginTop: 24, maxWidth: 780, fontSize: 14, color: C.t2, lineHeight: 1.7 }}>
              A plataforma consolida projetos, POCs e fornecedores em uma visão única para tomada de decisão.
              Hoje existem <strong style={{ color: C.t1 }}>{totalProjetos}</strong> projetos,
              <strong style={{ color: C.t1 }}> {totalPocs}</strong> POC(s) e
              <strong style={{ color: C.t1 }}> {totalFornecedores}</strong> fornecedor(es) cadastrados.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 24 }}>
              {[
                ["Projetos", totalProjetos, C.blue],
                ["POCs", totalPocs, C.violet],
                ["Fornecedores", totalFornecedores, C.emerald],
                ["Alertas", totalAlertas, totalAlertas > 0 ? C.rose : C.emerald],
              ].map(([label, value, color]) => (
                <div key={label} style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 14, padding: "13px 14px" }}>
                  <div style={{ fontSize: 10, color: C.t3, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 900 }}>{label}</div>
                  <div style={{ fontSize: 22, color, fontWeight: 950, marginTop: 4 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ ...card(C), padding: "22px 24px", minHeight: 245 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: C.t1, marginBottom: 4 }}>
            Radar de Saúde
          </div>
          <div style={{ fontSize: 12, color: C.t3, marginBottom: 10 }}>
            Equilíbrio entre operação, validações e risco
          </div>

          <ResponsiveContainer width="100%" height={185}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={C.border} />
              <PolarAngleAxis dataKey="eixo" tick={{ fill: C.t2, fontSize: 11 }} />
              <Radar dataKey="valor" stroke={saudeColor} fill={saudeColor} fillOpacity={0.22} strokeWidth={2} />
              <Tooltip formatter={(v) => `${v}%`} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
        <KPICard icon={FolderKanban} label="Projetos em andamento" value={projetosExecucao + projetosMonitoramento} sub={`${projetosEncerrados} encerrado(s)`} color={C.blue} glow={C.blueGlow} C={C} />
        <KPICard icon={FlaskConical} label="POCs registradas" value={totalPocs} sub={`${pocsExecucao} em execução`} color={C.violet} glow={C.violetGlow} C={C} />
        <KPICard icon={Users} label="Fornecedores ativos" value={fornecedoresAtivos} sub={`Score médio ${scoreMedioFornecedor}%`} color={C.emerald} glow={C.emeraldGlow} C={C} />
        <KPICard icon={AlertTriangle} label="Pontos de atenção" value={totalAlertas} sub={totalAlertas > 0 ? "Exigem acompanhamento" : "Sem alertas críticos"} color={totalAlertas > 0 ? C.rose : C.emerald} glow={totalAlertas > 0 ? C.roseGlow : C.emeraldGlow} C={C} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
        <div style={{ ...card(C), padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: C.t1 }}>
                Distribuição do Portfólio
              </div>
              <div style={{ fontSize: 12, color: C.t3, marginTop: 3 }}>
                Projetos por etapa do ciclo de vida
              </div>
            </div>
            <Chip label={`${totalProjetos} projeto(s)`} color={C.blue} bg={C.blueGlow} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "210px 1fr", gap: 18, alignItems: "center" }}>
            <ResponsiveContainer width="100%" height={205}>
              <PieChart>
                <Pie
                  data={pipelineChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={54}
                  outerRadius={84}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pipelineChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {etapasProjeto.map((item) => (
                <div key={item.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: C.t2, fontWeight: 900 }}>{item.name}</span>
                    <span style={{ fontSize: 12, color: item.fill, fontWeight: 900 }}>{item.qtd} · {pct(item.perc)}</span>
                  </div>
                  <div style={{ height: 5, background: C.bg3, borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ width: `${Math.max(0, Math.min(100, item.perc))}%`, height: "100%", background: item.fill, borderRadius: 999 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ ...card(C), padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: C.t1 }}>
                Funil Consolidado das POCs
              </div>
              <div style={{ fontSize: 12, color: C.t3, marginTop: 3 }}>
                Leitura visual do desempenho das validações
              </div>
            </div>
            <Chip label={pct(pocEntrega)} color={C.emerald} bg={C.emeraldGlow} />
          </div>

          <ResponsiveContainer width="100%" height={205}>
            <BarChart data={funnelData} layout="vertical" margin={{ left: 16, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
              <XAxis type="number" tick={{ fill: C.t3, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="etapa" tick={{ fill: C.t2, fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip />
              <Bar dataKey="valor" radius={[0, 8, 8, 0]}>
                {funnelData.map((entry, index) => (
                  <Cell key={`funnel-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ ...card(C), padding: "22px 24px" }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: C.t1, marginBottom: 4 }}>
            Decisões Executivas
          </div>
          <div style={{ fontSize: 12, color: C.t3, marginBottom: 16 }}>
            Pontos que orientam a condução da liderança
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {decisionItems.map((item) => (
              <div key={item.label} style={{ background: `${item.color}12`, border: `1px solid ${item.color}36`, borderRadius: 14, padding: "14px 15px" }}>
                <div style={{ fontSize: 10, color: C.t3, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 900 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 14, color: item.color, fontWeight: 950, marginTop: 7 }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...card(C), padding: "22px 24px" }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: C.t1, marginBottom: 4 }}>
            Performance de Fornecedores
          </div>
          <div style={{ fontSize: 12, color: C.t3, marginBottom: 16 }}>
            Visão resumida da base cadastrada
          </div>

          {topFornecedor ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 14, color: C.t1, fontWeight: 950 }}>{topFornecedor.nome}</div>
                  <div style={{ fontSize: 11, color: C.t3, marginTop: 3 }}>Fornecedor com melhor score cadastrado</div>
                </div>
                <div style={{ fontSize: 34, color: scoreMedioFornecedor >= 80 ? C.emerald : C.amber, fontWeight: 950 }}>
                  {scoreMedioFornecedor}%
                </div>
              </div>

              <div style={{ height: 8, background: C.bg3, borderRadius: 999, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${Math.max(0, Math.min(100, scoreMedioFornecedor))}%`,
                    height: "100%",
                    background: scoreMedioFornecedor >= 80 ? C.emerald : scoreMedioFornecedor >= 60 ? C.amber : C.rose,
                    borderRadius: 999,
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 8 }}>
                <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
                  <div style={{ fontSize: 10, color: C.t3, textTransform: "uppercase" }}>Ativos</div>
                  <div style={{ fontSize: 20, color: C.emerald, fontWeight: 950 }}>{fornecedoresAtivos}</div>
                </div>
                <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
                  <div style={{ fontSize: 10, color: C.t3, textTransform: "uppercase" }}>Alto risco</div>
                  <div style={{ fontSize: 20, color: fornecedoresAltoRisco > 0 ? C.rose : C.emerald, fontWeight: 950 }}>{fornecedoresAltoRisco}</div>
                </div>
                <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
                  <div style={{ fontSize: 10, color: C.t3, textTransform: "uppercase" }}>Incidentes</div>
                  <div style={{ fontSize: 20, color: incidentesFornecedores > 0 ? C.rose : C.emerald, fontWeight: 950 }}>{incidentesFornecedores}</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: C.t3 }}>
              Nenhum fornecedor cadastrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


function ProjectsView({ C }) {
  const etapasCiclo = ["Backlog", "Planejamento", "Execução", "Monitoramento", "Encerramento"];

  const [filter, setFilter] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);
  const [scrumProjects, setScrumProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState({});

  const filters = ["Todos", ...etapasCiclo];

  const fieldBase = {
    ...inputStyle(C),
    width: "100%",
    minHeight: 46,
    boxSizing: "border-box",
    borderRadius: 14,
    padding: "12px 16px",
    fontSize: 13,
  };

  function getProjectKey(projeto) {
    return String(projeto?.dbId || projeto?.id || projeto?.name || "");
  }

  function toggleSubtarefa(projectKey) {
    setExpandedTasks((prev) => ({
      ...prev,
      [projectKey]: !prev[projectKey],
    }));
  }

  function normalizarEtapa(valor) {
    const texto = String(valor || "").toLowerCase();

    if (texto.includes("backlog") || texto.includes("início") || texto.includes("inicio")) return "Backlog";
    if (texto.includes("plane")) return "Planejamento";
    if (texto.includes("exec") || texto.includes("andamento")) return "Execução";
    if (texto.includes("monitor")) return "Monitoramento";
    if (texto.includes("encer") || texto.includes("concl")) return "Encerramento";

    return "Backlog";
  }

  function calcularProgressoPorEtapa(etapa) {
    const etapas = {
      "Backlog": 10,
      "Início": 10,
      "Planejamento": 30,
      "Execução": 60,
      "Monitoramento": 85,
      "Encerramento": 100,
    };

    return etapas[normalizarEtapa(etapa)] || 0;
  }

  function corEtapa(etapa) {
    const etapaNormalizada = normalizarEtapa(etapa);

    if (etapaNormalizada === "Backlog") return { color: C.t3, bg: C.bg3 };
    if (etapaNormalizada === "Planejamento") return { color: C.violet, bg: C.violetGlow };
    if (etapaNormalizada === "Execução") return { color: C.blue, bg: C.blueGlow };
    if (etapaNormalizada === "Monitoramento") return { color: C.amber, bg: C.amberGlow };
    return { color: C.emerald, bg: C.emeraldGlow };
  }

  function formatarData(valor) {
    if (!valor) return "-";

    try {
      return String(valor).includes("-")
        ? new Date(valor + "T00:00:00").toLocaleDateString("pt-BR")
        : String(valor);
    } catch {
      return String(valor);
    }
  }

  function getDados(registro) {
    return registro?.dados_do_registro || registro?.record_data || {};
  }

  function getProjectInfo(registro) {
    const dados = getDados(registro);
    return dados.projectInfo || {};
  }

  function ordenarPorDataOuId(a, b) {
    const dataA = new Date(a.data || a.realizado || a.prazo || a.updated_at || a.criado_em || 0).getTime();
    const dataB = new Date(b.data || b.realizado || b.prazo || b.updated_at || b.criado_em || 0).getTime();

    if (dataA !== dataB) return dataB - dataA;

    return Number(b.id || 0) - Number(a.id || 0);
  }

  function getUltimaAtualizacao(registro) {
    const dados = getDados(registro);
    const relatorios = Array.isArray(dados.phase4?.relatorioStatus)
      ? dados.phase4.relatorioStatus
      : [];

    const validos = relatorios
      .filter((item) =>
        item &&
        (
          String(item.statusGeral || "").trim() ||
          String(item.feito || "").trim() ||
          String(item.proximos || "").trim()
        )
      )
      .sort(ordenarPorDataOuId);

    if (validos.length === 0) {
      const dadosInfo = getProjectInfo(registro);
      return dadosInfo.status ? `Status: ${dadosInfo.status}` : "Sem atualização registrada";
    }

    const ultimo = validos[0];
    const partes = [];

    if (ultimo.statusGeral) partes.push(`Status: ${ultimo.statusGeral}`);
    if (ultimo.feito) partes.push(`Feito: ${ultimo.feito}`);
    if (ultimo.proximos) partes.push(`Próximo: ${ultimo.proximos}`);

    return partes.join(" · ") || "Sem atualização registrada";
  }

  function getUltimaSubtarefa(registro) {
    const dados = getDados(registro);
    const atividades = Array.isArray(dados.phase3?.atividades)
      ? dados.phase3.atividades
      : [];

    const validas = atividades
      .filter((item) =>
        item &&
        (
          String(item.atividade || "").trim() ||
          String(item.tarefa || "").trim() ||
          String(item.status || "").trim()
        )
      )
      .sort(ordenarPorDataOuId);

    if (validas.length === 0) {
      return {
        texto: "Sem subtarefa registrada",
        status: "Pendente",
        responsavel: "-",
        prazo: "",
        prioridade: "Baixa",
        notas: "",
      };
    }

    const ultima = validas[0];

    return {
      texto: ultima.atividade || ultima.tarefa || "Subtarefa sem descrição",
      status: ultima.status || "Pendente",
      responsavel: ultima.responsavel || "",
      prazo: ultima.prazo || "",
      prioridade: ultima.prioridade || ultima.priority || "Baixa",
      notas: ultima.notas || ultima.notes || ultima.observacao || "",
    };
  }

  function normalizarRegistroScrum(registro, index) {
    const dados = getDados(registro);
    const info = dados.projectInfo || {};

    const nome =
      registro.nome_do_projeto ||
      registro.project_name ||
      info.nome ||
      "Projeto sem nome";

    const codigo =
      registro.codigo_do_projeto ||
      registro["código_do_projeto"] ||
      registro.project_code ||
      info.codigoId ||
      `SCRUM-${String(index + 1).padStart(3, "0")}`;

    const etapaAtual =
      registro.fase_atual ||
      registro.current_phase ||
      info.faseAtual ||
      "Backlog";

    const responsavel =
      registro.responsavel ||
      registro.responsible ||
      info.responsavel ||
      "-";

    const fornecedor =
      registro.fornecedor ||
      registro.supplier ||
      info.fornecedor ||
      "-";

    const prazo =
      info.previsaoEncerramento ||
      registro.end_date ||
      registro.data_prevista ||
      "";

    const statusGeral =
      registro.status_geral ||
      registro.general_status ||
      info.status ||
      "Em dia";

    return {
      dbId: registro.id,
      id: codigo,
      name: nome,
      resp: responsavel,
      fornecedor,
      etapa: normalizarEtapa(etapaAtual),
      prog: calcularProgressoPorEtapa(etapaAtual),
      prazo: formatarData(prazo),
      statusGeral,
      observacao: getUltimaAtualizacao(registro),
      subtarefa: getUltimaSubtarefa(registro),
      updatedAt: registro.updated_at || registro.atualizado_em || registro.created_at || registro.criado_em || "",
    };
  }

  async function carregarProjetosDoScrum() {
    setLoadingProjects(true);

    const { data, error } = await supabase
      .from("registros_do_projeto_scrum")
      .select("*");

    setLoadingProjects(false);

    if (error) {
      console.log("Erro ao carregar projetos a partir do Scrum:", error);
      return;
    }

    const registrosOrdenados = [...(data || [])].sort((a, b) => {
      const dataA = new Date(a.updated_at || a.atualizado_em || a.created_at || a.criado_em || 0).getTime();
      const dataB = new Date(b.updated_at || b.atualizado_em || b.created_at || b.criado_em || 0).getTime();
      return dataB - dataA;
    });

    setScrumProjects(registrosOrdenados.map(normalizarRegistroScrum));
  }

  useEffect(() => {
    carregarProjetosDoScrum();
  }, []);

  const sourceProjects = scrumProjects;

  const filtered =
    filter === "Todos"
      ? sourceProjects
      : sourceProjects.filter((p) => normalizarEtapa(p.etapa) === filter);

  const totalPorFiltro = filters.reduce((acc, item) => {
    if (item === "Todos") {
      acc[item] = sourceProjects.length;
    } else {
      acc[item] = sourceProjects.filter((p) => normalizarEtapa(p.etapa) === item).length;
    }

    return acc;
  }, {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.t1 }}>
            Gestão de Projetos
          </div>
          <div style={{ fontSize: 13, color: C.t3, marginTop: 4 }}>
            {loadingProjects
              ? "Carregando projetos do Scrum..."
              : `${filtered.length} projetos · Sincronizados automaticamente do Scrum`}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, position: "relative", alignItems: "center" }}>
          <Chip label="Fonte única: Scrum" color={C.emerald} bg={C.emeraldGlow} />

          <button
            onClick={() => setShowFilters((prev) => !prev)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 10,
              background: showFilters ? C.blueGlow : C.surface,
              border: `1px solid ${showFilters ? C.blue : C.border}`,
              color: showFilters ? C.blue : C.t2,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: showFilters ? 700 : 500,
            }}
          >
            Filtros
          </button>

          <button
            onClick={carregarProjetosDoScrum}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 10,
              background: C.surface,
              border: `1px solid ${C.border}`,
              color: C.t2,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Atualizar
          </button>

          {showFilters && (
            <div
              style={{
                position: "absolute",
                top: 44,
                right: 0,
                width: 260,
                zIndex: 20,
                ...card(C),
                padding: 12,
                boxShadow: "0 18px 45px rgba(0,0,0,0.18)",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: C.t1, marginBottom: 10 }}>
                Filtrar por status do ciclo
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {filters.map((f) => {
                  const active = filter === f;
                  const cores = f === "Todos" ? { color: C.blue, bg: C.blueGlow } : corEtapa(f);

                  return (
                    <button
                      key={f}
                      onClick={() => {
                        setFilter(f);
                        setShowFilters(false);
                      }}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                        padding: "9px 10px",
                        borderRadius: 9,
                        border: `1px solid ${active ? cores.color : C.border}`,
                        background: active ? cores.bg : "transparent",
                        color: active ? cores.color : C.t2,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: active ? 700 : 500,
                      }}
                    >
                      <span>{f}</span>
                      <span style={{ fontSize: 10, color: active ? cores.color : C.t3 }}>
                        {totalPorFiltro[f] || 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ ...card(C), padding: "12px 14px", borderColor: C.blue + "33", background: C.blueGlow }}>
        <div style={{ fontSize: 12, color: C.blue, fontWeight: 900 }}>
          Integração ativa
        </div>
        <div style={{ fontSize: 12, color: C.t2, marginTop: 4, lineHeight: 1.5 }}>
          Esta tela é somente uma visão consolidada. Para criar ou alterar um projeto, utilize o módulo Scrum. 
          Qualquer projeto salvo no Scrum aparece automaticamente aqui.
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {filters.map((f) => {
          const active = filter === f;
          const cores = f === "Todos" ? { color: C.blue, bg: C.blueGlow } : corEtapa(f);

          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 14px",
                borderRadius: 9,
                border: `1px solid ${active ? cores.color : C.border}`,
                background: active ? cores.bg : "transparent",
                color: active ? cores.color : C.t2,
                fontSize: 12,
                cursor: "pointer",
                fontWeight: active ? 700 : 500,
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      <div style={{ ...card(C), padding: 0, overflowX: "auto", overflowY: "hidden" }}>
        <table style={{ width: "100%", minWidth: 1080, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["ID", "Projeto", "Responsável", "Status do Ciclo", "Progresso", "Prazo", "Observação"].map((h, i) => (
                <th
                  key={i}
                  style={{
                    padding: "14px 16px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.t3,
                    textAlign: "left",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => {
              const etapaAtual = normalizarEtapa(p.etapa);
              const cores = corEtapa(etapaAtual);
              const statusSubtarefa = p.subtarefa.status || "Pendente";
              const subtarefaStatus =
                statusSubtarefa === "Concluída" || statusSubtarefa === "Feito"
                  ? { color: C.emerald, bg: C.emeraldGlow }
                  : statusSubtarefa === "Em andamento"
                  ? { color: C.amber, bg: C.amberGlow }
                  : statusSubtarefa === "Parado" || statusSubtarefa === "Atrasado"
                  ? { color: C.rose, bg: C.roseGlow }
                  : { color: C.t3, bg: C.bg3 };

              const prioridadeSubtarefa = p.subtarefa.prioridade || "Baixa";
              const prioridadeStyle =
                prioridadeSubtarefa === "Alta"
                  ? { color: C.violet, bg: C.violetGlow }
                  : prioridadeSubtarefa === "Média" || prioridadeSubtarefa === "Media"
                  ? { color: C.blue, bg: C.blueGlow }
                  : { color: C.t3, bg: C.bg3 };

              const projectKey = getProjectKey(p);
              const subtarefaAberta = !!expandedTasks[projectKey];

              return (
                <React.Fragment key={projectKey}>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: C.t3 }}>
                    {p.id}
                  </td>

                  <td style={{ padding: "14px 16px", minWidth: 220 }}>
                    <div style={{ fontSize: 13, color: C.t1, fontWeight: 800 }}>
                      {p.name}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                      <div style={{ fontSize: 11, color: C.t3 }}>
                        {p.fornecedor}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSubtarefa(projectKey);
                        }}
                        style={{
                          border: `1px solid ${subtarefaAberta ? C.blue : C.border}`,
                          background: subtarefaAberta ? C.blueGlow : C.surface,
                          color: subtarefaAberta ? C.blue : C.t3,
                          borderRadius: 999,
                          padding: "4px 9px",
                          fontSize: 10,
                          fontWeight: 900,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <span>{subtarefaAberta ? "⌃" : "⌄"}</span>
                        {subtarefaAberta ? "Ocultar subtarefa" : "Ver subtarefa"}
                      </button>
                    </div>
                  </td>

                  <td style={{ padding: "14px 16px", fontSize: 12, color: C.t2 }}>
                    {p.resp}
                  </td>

                  <td style={{ padding: "14px 16px" }}>
                    <Chip label={etapaAtual} color={cores.color} bg={cores.bg} />
                  </td>

                  <td style={{ padding: "14px 16px", minWidth: 140 }}>
                    <ProgressBar
                      val={p.prog}
                      color={p.prog === 100 ? C.emerald : cores.color}
                      C={C}
                    />
                  </td>

                  <td style={{ padding: "14px 16px", fontSize: 12, color: C.t2 }}>
                    {p.prazo}
                  </td>

                  <td style={{ padding: "14px 16px", maxWidth: 320 }}>
                    <div
                      title={p.observacao}
                      style={{
                        fontSize: 12,
                        color: C.t2,
                        lineHeight: 1.45,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {p.observacao}
                    </div>
                  </td>

                </tr>

                  {subtarefaAberta && (
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td colSpan={7} style={{ padding: "0 14px 14px 44px", background: C.bg0 }}>
                      <div
                        style={{
                          border: `1px solid ${C.border}`,
                          borderLeft: `4px solid ${subtarefaStatus.color}`,
                          borderRadius: 12,
                          overflow: "hidden",
                          background: C.surface,
                          boxShadow: "0 6px 18px rgba(15,23,42,0.05)",
                        }}
                      >
                        <div
                          style={{
                            padding: "9px 12px",
                            background: C.blueGlow,
                            borderBottom: `1px solid ${C.border}`,
                            color: C.blue,
                            fontSize: 12,
                            fontWeight: 900,
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                          }}
                        >
                          <span style={{ fontSize: 14 }}>↳</span>
                          Última tarefa atualizada no Scrum
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "32px 1.8fr 0.9fr 0.9fr 0.85fr 0.85fr",
                            alignItems: "center",
                            minHeight: 34,
                            background: C.bg3,
                            borderBottom: `1px solid ${C.border}`,
                            fontSize: 10,
                            color: C.t3,
                            fontWeight: 900,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "center" }}>
                            <input
                              type="checkbox"
                              checked={statusSubtarefa === "Concluída" || statusSubtarefa === "Feito"}
                              readOnly
                              style={{ width: 13, height: 13, accentColor: C.emerald }}
                            />
                          </div>
                          <div style={{ padding: "0 10px" }}>Tarefa</div>
                          <div style={{ padding: "0 10px", borderLeft: `1px solid ${C.border}` }}>Responsável</div>
                          <div style={{ padding: "0 10px", borderLeft: `1px solid ${C.border}` }}>Status</div>
                          <div style={{ padding: "0 10px", borderLeft: `1px solid ${C.border}` }}>Prazo</div>
                          <div style={{ padding: "0 10px", borderLeft: `1px solid ${C.border}` }}>Prioridade</div>

                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "32px 1.8fr 0.9fr 0.9fr 0.85fr 0.85fr",
                            alignItems: "center",
                            minHeight: 42,
                            fontSize: 12,
                            color: C.t2,
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "center" }}>
                            <input
                              type="checkbox"
                              checked={statusSubtarefa === "Concluída" || statusSubtarefa === "Feito"}
                              readOnly
                              style={{ width: 13, height: 13, accentColor: C.emerald }}
                            />
                          </div>

                          <div
                            title={p.subtarefa.texto}
                            style={{
                              padding: "0 10px",
                              color: C.t1,
                              fontWeight: 800,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {p.subtarefa.texto}
                          </div>

                          <div
                            title={p.subtarefa.responsavel || "-"}
                            style={{
                              padding: "0 10px",
                              borderLeft: `1px solid ${C.border}`,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {p.subtarefa.responsavel || "-"}
                          </div>

                          <div style={{ padding: "0 10px", borderLeft: `1px solid ${C.border}` }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                                minHeight: 26,
                                borderRadius: 6,
                                background: subtarefaStatus.bg,
                                color: subtarefaStatus.color,
                                fontSize: 11,
                                fontWeight: 900,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {statusSubtarefa}
                            </span>
                          </div>

                          <div
                            style={{
                              padding: "0 10px",
                              borderLeft: `1px solid ${C.border}`,
                              whiteSpace: "nowrap",
                              color: C.t2,
                            }}
                          >
                            {formatarData(p.subtarefa.prazo)}
                          </div>

                          <div style={{ padding: "0 10px", borderLeft: `1px solid ${C.border}` }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                                minHeight: 26,
                                borderRadius: 6,
                                background: prioridadeStyle.bg,
                                color: prioridadeStyle.color,
                                fontSize: 11,
                                fontWeight: 900,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {prioridadeSubtarefa}
                            </span>
                          </div>

                        </div>
                      </div>
                    </td>
                  </tr>
                  )}
                </React.Fragment>              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "26px 16px", textAlign: "center", color: C.t3, fontSize: 13 }}>
                  Nenhum projeto encontrado no Scrum para este filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function ScrumView({ C }) {
  const [showScrumRegister, setShowScrumRegister] = useState(false);
  const [selectedScrumRecord, setSelectedScrumRecord] = useState(null);
  const [scrumRecords, setScrumRecords] = useState([]);
  const [loadingScrum, setLoadingScrum] = useState(false);

  const isAdminScrum = (() => {
    try {
      return (window.localStorage.getItem("bp-demo-email") || "").toLowerCase() === "teste@digital.com.br";
    } catch {
      return false;
    }
  })();

  async function carregarRegistrosScrum() {
    setLoadingScrum(true);

    const { data, error } = await supabase
      .from("registros_do_projeto_scrum")
      .select("*");

    setLoadingScrum(false);

    if (error) {
      console.log("Erro ao carregar registros Scrum:", error);
      return;
    }

    const registrosOrdenados = [...(data || [])].sort((a, b) => {
      const dataA = new Date(a.created_at || a.criado_em || a.updated_at || a.atualizado_em || 0).getTime();
      const dataB = new Date(b.created_at || b.criado_em || b.updated_at || b.atualizado_em || 0).getTime();
      return dataB - dataA;
    });

    setScrumRecords(registrosOrdenados);
  }

  useEffect(() => {
    carregarRegistrosScrum();
  }, []);

  function abrirNovoRegistro() {
    setSelectedScrumRecord(null);
    setShowScrumRegister(true);
  }

  function abrirRegistroExistente(registro) {
    setSelectedScrumRecord(registro);
    setShowScrumRegister(true);
  }

  function fecharRegistro() {
    setShowScrumRegister(false);
    setSelectedScrumRecord(null);
    carregarRegistrosScrum();
  }

  async function excluirRegistroScrum(registro, nomeProjeto) {
    if (!isAdminScrum) {
      alert("Apenas administradores podem excluir registros do Scrum.");
      return;
    }

    if (!registro?.id) {
      alert("Registro sem ID para exclusão.");
      return;
    }

    const senhaAdmin = window.prompt(
      `Para excluir o projeto "${nomeProjeto}", informe sua senha de administrador.`
    );

    if (senhaAdmin !== "Teste@2026") {
      alert("Senha de administrador inválida. Exclusão cancelada.");
      return;
    }

    const { data, error } = await supabase
      .from("registros_do_projeto_scrum")
      .delete()
      .eq("id", registro.id)
      .select("id");

    if (error) {
      console.log("Erro ao excluir registro Scrum:", error);
      alert("Erro ao excluir projeto. Veja o console.");
      return;
    }

    if (!data || data.length === 0) {
      alert("Nenhum registro foi excluído. Verifique se o projeto ainda existe ou se há permissão de exclusão.");
      return;
    }

    setScrumRecords((prev) =>
      prev.filter((item) => String(item.id) !== String(registro.id))
    );

    alert("Projeto excluído com sucesso.");

    await carregarRegistrosScrum();
  }

  const fases = ["Backlog", "Planejamento", "Execução", "Monitoramento", "Encerramento"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {showScrumRegister && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "#f0f4f8",
            overflow: "auto",
          }}
        >
          <button
            onClick={fecharRegistro}
            style={{
              position: "fixed",
              top: 18,
              right: 22,
              zIndex: 10000,
              background: "#0d1f3c",
              color: "#ffffff",
              border: "none",
              borderRadius: 8,
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
            }}
          >
            Fechar Registro
          </button>

          <ScrumProjectRegister
            registroInicial={selectedScrumRecord}
            onSaved={carregarRegistrosScrum}
          />
        </div>
      )}

      <SectionHeader
        title="Scrum de Projetos"
        sub="Ciclo de vida dos projetos"
        actions={[
          <Btn
            key="n"
            label="Novo Registro"
            icon={Plus}
            primary
            C={C}
            onClick={abrirNovoRegistro}
          />,
        ]}
        C={C}
      />

      {loadingScrum && (
        <div style={{ ...card(C), padding: "16px", color: C.t2, fontSize: 13 }}>
          Carregando registros Scrum...
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(220px, 1fr))",
          gap: 14,
          alignItems: "start",
          overflowX: "auto",
          paddingBottom: 8,
        }}
      >
        {fases.map((fase) => {
          const registrosDaFase = scrumRecords.filter((registro) => {
            const dados = registro.dados_do_registro || registro.record_data || {};
            const info = dados.projectInfo || {};

            const faseAtual =
              registro.fase_atual ||
              registro.current_phase ||
              info.faseAtual ||
              "Backlog";

            if (fase === "Backlog") {
              return faseAtual === "Backlog" || faseAtual === "Início";
            }

            return faseAtual === fase;
          });

          const corFase =
            fase === "Backlog"
              ? C.t3
              : fase === "Planejamento"
              ? C.violet
              : fase === "Execução"
              ? C.blue
              : fase === "Monitoramento"
              ? C.amber
              : C.emerald;

          return (
            <div
              key={fase}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 9,
                minWidth: 220,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "9px 12px",
                  borderRadius: 8,
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: corFase,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.t2,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {fase}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: 10,
                    color: C.t3,
                    background: C.bg3,
                    padding: "2px 7px",
                    borderRadius: 10,
                  }}
                >
                  {registrosDaFase.length}
                </span>
              </div>

              {registrosDaFase.length === 0 && (
                <div
                  style={{
                    padding: "18px 14px",
                    borderRadius: 10,
                    border: `1px dashed ${C.border}`,
                    color: C.t3,
                    fontSize: 12,
                    textAlign: "center",
                  }}
                >
                  Nenhum registro
                </div>
              )}

              {registrosDaFase.map((registro) => {
                const dados = registro.dados_do_registro || registro.record_data || {};
                const info = dados.projectInfo || {};

                const nome =
                  registro.nome_do_projeto ||
                  registro.project_name ||
                  info.nome ||
                  "Projeto sem nome";

                const codigo =
                  registro.codigo_do_projeto ||
                  registro["código_do_projeto"] ||
                  registro.project_code ||
                  info.codigoId ||
                  "";

                const fornecedor =
                  registro.fornecedor ||
                  registro.supplier ||
                  info.fornecedor ||
                  "-";

                const responsavel =
                  registro.responsavel ||
                  registro.responsible ||
                  info.responsavel ||
                  "-";

                const status =
                  registro.status_geral ||
                  registro.general_status ||
                  info.status ||
                  "Em dia";

                return (
                  <div
                    key={registro.id}
                    onClick={() => abrirRegistroExistente(registro)}
                    style={{
                      ...card(C),
                      padding: "13px 15px",
                      cursor: "pointer",
                      transition: "border-color 0.2s, transform 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = corFase + "66";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = C.border;
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        color: C.t1,
                        fontWeight: 600,
                        marginBottom: 8,
                        lineHeight: 1.4,
                      }}
                    >
                      {nome}
                    </div>

                    {codigo && (
                      <div style={{ fontSize: 10, color: C.t3, marginBottom: 8 }}>
                        {codigo}
                      </div>
                    )}

                    <div style={{ fontSize: 11, color: C.t3, marginBottom: 10 }}>
                      {fornecedor}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          padding: "2px 8px",
                          borderRadius: 5,
                          background: C.bg3,
                          color: C.t3,
                        }}
                      >
                        {responsavel}
                      </span>

                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Chip
                          label={status}
                          color={
                            status === "Atrasado"
                              ? C.rose
                              : status === "Atenção"
                              ? C.amber
                              : C.emerald
                          }
                          bg={
                            status === "Atrasado"
                              ? C.roseGlow
                              : status === "Atenção"
                              ? C.amberGlow
                              : C.emeraldGlow
                          }
                        />

                        {isAdminScrum && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              excluirRegistroScrum(registro, nome);
                            }}
                            title="Excluir duplicidade"
                            style={{
                              border: `1px solid ${C.rose}44`,
                              background: C.roseGlow,
                              color: C.rose,
                              borderRadius: 7,
                              padding: "3px 7px",
                              fontSize: 10,
                              fontWeight: 900,
                              cursor: "pointer",
                            }}
                          >
                            Excluir
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>
          );
        })}
      </div>
    </div>
  );
}

function SuppliersView({ C }) {
  const emptyForm = {
    nome: "",
    categoria: "",
    canais: "",
    responsavel: "",
    contato: "",
    email: "",
    telefone: "",
    status: "Ativo",
    sla_meta: "",
    performance_score: "",
    risco: "Baixo",
    projetos_ativos: "",
    incidentes_abertos: "",
    avaliacao: "",
    observacoes: "",
  };

  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("Todos");
  const [form, setForm] = useState(emptyForm);

  const field = {
    width: "100%",
    minHeight: 44,
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

  function toNum(value) {
    const parsed = Number(String(value || "0").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function updateForm(campo, valor) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  function statusColor(status) {
    if (status === "Ativo") return { color: C.emerald, bg: C.emeraldGlow };
    if (status === "Em Homologação") return { color: C.blue, bg: C.blueGlow };
    if (status === "Em Observação") return { color: C.amber, bg: C.amberGlow };
    if (status === "Inativo") return { color: C.t3, bg: C.bg3 };
    return { color: C.blue, bg: C.blueGlow };
  }

  function riscoColor(risco) {
    if (risco === "Baixo") return C.emerald;
    if (risco === "Médio") return C.amber;
    if (risco === "Alto") return C.rose;
    return C.t3;
  }

  async function carregarFornecedores() {
    setLoading(true);

    const { data, error } = await supabase
      .from("fornecedores")
      .select("*")
      .order("updated_at", { ascending: false });

    setLoading(false);

    if (error) {
      console.log("Erro ao carregar fornecedores:", error);
      return;
    }

    setFornecedores(data || []);
  }

  useEffect(() => {
    carregarFornecedores();
  }, []);

  async function salvarFornecedor() {
    if (!form.nome.trim()) {
      alert("Informe o nome do fornecedor.");
      return;
    }

    setSaving(true);

    const canais = form.canais
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      nome: form.nome,
      categoria: form.categoria,
      canais,
      responsavel: form.responsavel,
      contato: form.contato,
      email: form.email,
      telefone: form.telefone,
      status: form.status,
      sla_meta: toNum(form.sla_meta),
      performance_score: toNum(form.performance_score),
      risco: form.risco,
      projetos_ativos: toNum(form.projetos_ativos),
      incidentes_abertos: toNum(form.incidentes_abertos),
      avaliacao: form.avaliacao,
      observacoes: form.observacoes,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("fornecedores")
      .insert([payload]);

    setSaving(false);

    if (error) {
      console.log("Erro ao salvar fornecedor:", error);
      alert("Erro ao salvar fornecedor. Veja o console.");
      return;
    }

    alert("Fornecedor salvo com sucesso!");

    setForm(emptyForm);
    setShowForm(false);
    carregarFornecedores();
  }

  const filtrados =
    filter === "Todos"
      ? fornecedores
      : fornecedores.filter((item) => item.status === filter || item.risco === filter);

  const total = fornecedores.length;
  const ativos = fornecedores.filter((f) => f.status === "Ativo").length;
  const emObservacao = fornecedores.filter((f) => f.status === "Em Observação").length;
  const altoRisco = fornecedores.filter((f) => f.risco === "Alto").length;
  const incidentes = fornecedores.reduce((acc, item) => acc + toNum(item.incidentes_abertos), 0);
  const scoreMedio =
    total > 0
      ? Math.round(fornecedores.reduce((acc, item) => acc + toNum(item.performance_score), 0) / total)
      : 0;

  const filtros = ["Todos", "Ativo", "Em Homologação", "Em Observação", "Inativo", "Alto"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionHeader
        title="Gestão de Fornecedores"
        sub="Acompanhamento de fornecedores, canais, SLA, performance, risco e incidentes"
        actions={[
          <Btn
            key="n"
            label="Novo Fornecedor"
            icon={Plus}
            primary
            C={C}
            onClick={() => setShowForm(true)}
          />,
        ]}
        C={C}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
        <KPICard icon={Users} label="Fornecedores" value={total} sub={loading ? "Carregando..." : "Base cadastrada"} color={C.blue} glow={C.blueGlow} C={C} />
        <KPICard icon={CheckCircle2} label="Ativos" value={ativos} sub="Operação em andamento" color={C.emerald} glow={C.emeraldGlow} C={C} />
        <KPICard icon={Activity} label="Score médio" value={`${scoreMedio}%`} sub="Performance geral" color={C.violet} glow={C.violetGlow} C={C} />
        <KPICard icon={AlertTriangle} label="Incidentes" value={incidentes} sub={`${altoRisco} alto risco`} color={incidentes > 0 || altoRisco > 0 ? C.rose : C.emerald} glow={incidentes > 0 || altoRisco > 0 ? C.roseGlow : C.emeraldGlow} C={C} />
      </div>

      {showForm && (
        <div style={{ ...card(C), padding: 0, overflow: "hidden", borderRadius: 20 }}>
          <div
            style={{
              padding: "22px 24px 10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.t1 }}>
                Novo Fornecedor
              </div>
              <div style={{ fontSize: 12, color: C.t3, marginTop: 4 }}>
                Cadastre dados operacionais, canais, SLA, performance e riscos do fornecedor
              </div>
            </div>

            <button
              onClick={() => setShowForm(false)}
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                color: C.t2,
                borderRadius: 12,
                padding: "8px 14px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Fechar
            </button>
          </div>

          <div style={{ padding: "12px 24px 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
              <input placeholder="Nome do fornecedor" value={form.nome} onChange={(e) => updateForm("nome", e.target.value)} style={field} />
              <input placeholder="Categoria: Mensageria, IA, CRM, Portal..." value={form.categoria} onChange={(e) => updateForm("categoria", e.target.value)} style={field} />
              <input placeholder="Canais atendidos: WhatsApp, RCS, SMS, E-mail..." value={form.canais} onChange={(e) => updateForm("canais", e.target.value)} style={{ ...field, gridColumn: "1 / -1" }} />
              <input placeholder="Responsável interno" value={form.responsavel} onChange={(e) => updateForm("responsavel", e.target.value)} style={field} />
              <input placeholder="Contato do fornecedor" value={form.contato} onChange={(e) => updateForm("contato", e.target.value)} style={field} />
              <input placeholder="E-mail" value={form.email} onChange={(e) => updateForm("email", e.target.value)} style={field} />
              <input placeholder="Telefone" value={form.telefone} onChange={(e) => updateForm("telefone", e.target.value)} style={field} />

              <select value={form.status} onChange={(e) => updateForm("status", e.target.value)} style={field}>
                <option>Ativo</option>
                <option>Em Homologação</option>
                <option>Em Observação</option>
                <option>Inativo</option>
              </select>

              <select value={form.risco} onChange={(e) => updateForm("risco", e.target.value)} style={field}>
                <option>Baixo</option>
                <option>Médio</option>
                <option>Alto</option>
              </select>

              <input type="number" placeholder="SLA contratado/meta (%)" value={form.sla_meta} onChange={(e) => updateForm("sla_meta", e.target.value)} style={field} />
              <input type="number" placeholder="Score de performance (%)" value={form.performance_score} onChange={(e) => updateForm("performance_score", e.target.value)} style={field} />
              <input type="number" placeholder="Projetos ativos" value={form.projetos_ativos} onChange={(e) => updateForm("projetos_ativos", e.target.value)} style={field} />
              <input type="number" placeholder="Incidentes em aberto" value={form.incidentes_abertos} onChange={(e) => updateForm("incidentes_abertos", e.target.value)} style={field} />

              <textarea
                placeholder="Avaliação executiva do fornecedor"
                value={form.avaliacao}
                onChange={(e) => updateForm("avaliacao", e.target.value)}
                style={{ ...field, gridColumn: "1 / -1", minHeight: 90, resize: "vertical", lineHeight: 1.6 }}
              />

              <textarea
                placeholder="Observações, pontos de atenção, histórico de relacionamento ou próximos passos"
                value={form.observacoes}
                onChange={(e) => updateForm("observacoes", e.target.value)}
                style={{ ...field, gridColumn: "1 / -1", minHeight: 90, resize: "vertical", lineHeight: 1.6 }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  color: C.t2,
                  borderRadius: 12,
                  padding: "11px 18px",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Cancelar
              </button>

              <button
                onClick={salvarFornecedor}
                disabled={saving}
                style={{
                  background: C.blue,
                  border: "none",
                  color: "#fff",
                  borderRadius: 12,
                  padding: "11px 20px",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontWeight: 900,
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? "Salvando..." : "Salvar Fornecedor"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {filtros.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "7px 13px",
                borderRadius: 10,
                border: `1px solid ${active ? C.blue : C.border}`,
                background: active ? C.blueGlow : C.surface,
                color: active ? C.blue : C.t2,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: active ? 900 : 700,
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      <div style={{ ...card(C), padding: 0, overflowX: "auto", overflowY: "hidden" }}>
        <table style={{ width: "100%", minWidth: 1380, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Fornecedor", "Canais", "Responsável", "SLA", "Score", "Risco", "Projetos", "Incidentes", "Status"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "14px 16px",
                    fontSize: 11,
                    fontWeight: 900,
                    color: C.t3,
                    textAlign: "left",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtrados.map((item) => {
              const st = statusColor(item.status);
              const canais = Array.isArray(item.canais) ? item.canais : [];

              return (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: `1px solid ${C.border}`,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = C.cardHov)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "15px 16px" }}>
                    <div style={{ fontSize: 13, color: C.t1, fontWeight: 900 }}>
                      {item.nome || "-"}
                    </div>
                    <div style={{ fontSize: 11, color: C.t3, marginTop: 3 }}>
                      {item.categoria || "-"}
                    </div>
                  </td>

                  <td style={{ padding: "15px 16px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {canais.length === 0 && <span style={{ fontSize: 12, color: C.t3 }}>-</span>}
                      {canais.slice(0, 3).map((canal) => (
                        <span
                          key={canal}
                          style={{
                            fontSize: 10,
                            padding: "4px 8px",
                            borderRadius: 999,
                            background: C.bg3,
                            border: `1px solid ${C.border}`,
                            color: C.t2,
                            fontWeight: 800,
                          }}
                        >
                          {canal}
                        </span>
                      ))}
                      {canais.length > 3 && <span style={{ fontSize: 10, color: C.t3 }}>+{canais.length - 3}</span>}
                    </div>
                  </td>

                  <td style={{ padding: "15px 16px", fontSize: 12, color: C.t2 }}>
                    {item.responsavel || "-"}
                  </td>

                  <td style={{ padding: "15px 16px", fontSize: 12, color: C.t2 }}>
                    <strong style={{ color: C.blue }}>{toNum(item.sla_meta)}%</strong>
                  </td>

                  <td style={{ padding: "15px 16px", minWidth: 130 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <ProgressBar
                          val={Math.max(0, Math.min(100, toNum(item.performance_score)))}
                          color={toNum(item.performance_score) >= 80 ? C.emerald : toNum(item.performance_score) >= 60 ? C.amber : C.rose}
                          C={C}
                        />
                      </div>
                      <strong style={{ fontSize: 12, color: toNum(item.performance_score) >= 80 ? C.emerald : toNum(item.performance_score) >= 60 ? C.amber : C.rose }}>
                        {toNum(item.performance_score)}%
                      </strong>
                    </div>
                  </td>

                  <td style={{ padding: "15px 16px", fontSize: 12, fontWeight: 900, color: riscoColor(item.risco) }}>
                    {item.risco || "-"}
                  </td>

                  <td style={{ padding: "15px 16px", fontSize: 12, color: C.t2 }}>
                    {toNum(item.projetos_ativos)}
                  </td>

                  <td style={{ padding: "15px 16px", fontSize: 12, fontWeight: 900, color: toNum(item.incidentes_abertos) > 0 ? C.rose : C.emerald }}>
                    {toNum(item.incidentes_abertos)}
                  </td>

                  <td style={{ padding: "15px 16px" }}>
                    <Chip label={item.status || "Ativo"} color={st.color} bg={st.bg} />
                  </td>
                </tr>
              );
            })}

            {filtrados.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: 30, textAlign: "center", color: C.t3, fontSize: 13 }}>
                  Nenhum fornecedor encontrado. Clique em Novo Fornecedor para cadastrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IndicatorsView({ C }) {
  const [loading, setLoading] = useState(false);
  const [projetos, setProjetos] = useState([]);
  const [pocs, setPocs] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  function toNum(value) {
    const parsed = Number(String(value || "0").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function pct(value) {
    return `${Number(value || 0).toFixed(1).replace(".", ",")}%`;
  }

  function normalizarEtapa(etapa) {
    if (!etapa) return "Backlog";
    const e = String(etapa).trim();

    if (["Backlog", "Planejamento", "Execução", "Monitoramento", "Encerramento"].includes(e)) {
      return e;
    }

    if (e === "Em Andamento") return "Execução";
    if (e === "Concluído") return "Encerramento";
    if (e === "Concluida") return "Encerramento";
    if (e === "Concluída") return "Encerramento";

    return e;
  }

  function progressoPorEtapa(etapa) {
    const e = normalizarEtapa(etapa);
    if (e === "Backlog") return 10;
    if (e === "Planejamento") return 30;
    if (e === "Execução") return 60;
    if (e === "Monitoramento") return 80;
    if (e === "Encerramento") return 100;
    return 0;
  }

  function calcPoc(record) {
    const rows = record?.record_data?.analytics?.rows || [];
    const totals = rows.reduce(
      (acc, row) => {
        acc.totalMensagens += toNum(row.totalMensagens);
        acc.entregue += toNum(row.entregue);
        acc.lido += toNum(row.lido);
        acc.retorno += toNum(row.retornoCliente);
        acc.acordos += toNum(row.acordos);
        return acc;
      },
      { totalMensagens: 0, entregue: 0, lido: 0, retorno: 0, acordos: 0 }
    );

    return {
      ...totals,
      entrega: totals.totalMensagens > 0 ? (totals.entregue / totals.totalMensagens) * 100 : 0,
      leitura: totals.totalMensagens > 0 ? (totals.lido / totals.totalMensagens) * 100 : 0,
      conversao: totals.totalMensagens > 0 ? (totals.acordos / totals.totalMensagens) * 100 : 0,
    };
  }

  function getPocStatus(record) {
    return record?.status || record?.record_data?.general?.status || "Em avaliação";
  }

  function getPocRecommendation(record) {
    return record?.recommendation || record?.record_data?.evaluation?.recommendation || "Em avaliação";
  }

  async function carregarIndicadores() {
    setLoading(true);

    const [projectsRes, pocsRes, suppliersRes] = await Promise.all([
      supabase.from("registros_do_projeto_scrum").select("*"),
      supabase.from("poc_records").select("*"),
      supabase.from("fornecedores").select("*"),
    ]);

    if (projectsRes.error) console.log("Erro ao carregar projetos:", projectsRes.error);
    if (pocsRes.error) console.log("Erro ao carregar POCs:", pocsRes.error);
    if (suppliersRes.error) console.log("Erro ao carregar fornecedores:", suppliersRes.error);

    const projetosNormalizados = (projectsRes.data || []).map((registro) => {
      const dados = registro.dados_do_registro || registro.record_data || {};
      const info = dados.projectInfo || {};

      return {
        id: registro.id,
        name: registro.nome_do_projeto || registro.project_name || info.nome || "Projeto sem nome",
        responsible: registro.responsavel || registro.responsible || info.responsavel || "-",
        current_stage: registro.fase_atual || registro.current_phase || info.faseAtual || "Backlog",
        status: registro.fase_atual || registro.current_phase || info.faseAtual || "Backlog",
        end_date: info.previsaoEncerramento || registro.end_date || null,
      };
    });

    setProjetos(projetosNormalizados);
    setPocs(pocsRes.data || []);
    setFornecedores(suppliersRes.data || []);
    setLoading(false);
  }

  useEffect(() => {
    carregarIndicadores();
  }, []);

  const hoje = new Date().toISOString().slice(0, 10);

  const totalProjetos = projetos.length;
  const projetosPorEtapa = ["Backlog", "Planejamento", "Execução", "Monitoramento", "Encerramento"].map((etapa) => {
    const qtd = projetos.filter((p) => normalizarEtapa(p.current_stage || p.status) === etapa).length;
    return { etapa, qtd, perc: totalProjetos ? (qtd / totalProjetos) * 100 : 0 };
  });

  const projetosEmExecucao = projetosPorEtapa.find((p) => p.etapa === "Execução")?.qtd || 0;
  const projetosEncerrados = projetosPorEtapa.find((p) => p.etapa === "Encerramento")?.qtd || 0;
  const projetosAtrasados = projetos.filter((p) => {
    const etapa = normalizarEtapa(p.current_stage || p.status);
    return p.end_date && p.end_date < hoje && etapa !== "Encerramento";
  }).length;

  const progressoMedioProjetos =
    totalProjetos > 0
      ? Math.round(
          projetos.reduce((acc, p) => acc + progressoPorEtapa(p.current_stage || p.status), 0) / totalProjetos
        )
      : 0;

  const totalPocs = pocs.length;
  const pocsExecucao = pocs.filter((p) => getPocStatus(p) === "Em Execução").length;
  const pocsEncerradas = pocs.filter((p) => getPocStatus(p) === "Encerrada").length;
  const pocsCondicoes = pocs.filter((p) => getPocRecommendation(p) === "Aprovado com condições").length;

  const pocTotals = pocs.reduce(
    (acc, poc) => {
      const m = calcPoc(poc);
      acc.totalMensagens += m.totalMensagens;
      acc.entregue += m.entregue;
      acc.lido += m.lido;
      acc.retorno += m.retorno;
      acc.acordos += m.acordos;
      return acc;
    },
    { totalMensagens: 0, entregue: 0, lido: 0, retorno: 0, acordos: 0 }
  );

  const pocEntrega = pocTotals.totalMensagens > 0 ? (pocTotals.entregue / pocTotals.totalMensagens) * 100 : 0;
  const pocLeitura = pocTotals.totalMensagens > 0 ? (pocTotals.lido / pocTotals.totalMensagens) * 100 : 0;
  const pocConversao = pocTotals.totalMensagens > 0 ? (pocTotals.acordos / pocTotals.totalMensagens) * 100 : 0;

  const totalFornecedores = fornecedores.length;
  const fornecedoresAtivos = fornecedores.filter((f) => f.status === "Ativo").length;
  const fornecedoresRiscoAlto = fornecedores.filter((f) => f.risco === "Alto").length;
  const incidentesFornecedores = fornecedores.reduce((acc, f) => acc + toNum(f.incidentes_abertos), 0);
  const scoreMedioFornecedores =
    totalFornecedores > 0
      ? Math.round(fornecedores.reduce((acc, f) => acc + toNum(f.performance_score), 0) / totalFornecedores)
      : 0;

  const scoreProjetos = progressoMedioProjetos;
  const scorePocs = Math.min(100, pocEntrega * 0.45 + pocLeitura * 0.45 + Math.min(100, pocConversao * 30) * 0.10);
  const scoreFornecedores = scoreMedioFornecedores;

  const healthScore = Math.round(
    scoreProjetos * 0.35 +
      scorePocs * 0.35 +
      scoreFornecedores * 0.30
  );

  const healthColor = healthScore >= 80 ? C.emerald : healthScore >= 60 ? C.amber : C.rose;

  const alertas = [
    {
      label: "Projetos atrasados",
      value: projetosAtrasados,
      color: projetosAtrasados > 0 ? C.rose : C.emerald,
      desc: "Projetos com prazo vencido e ciclo não encerrado",
    },
    {
      label: "POCs com condições",
      value: pocsCondicoes,
      color: pocsCondicoes > 0 ? C.amber : C.emerald,
      desc: "POCs aprovadas com ressalvas",
    },
    {
      label: "Fornecedores alto risco",
      value: fornecedoresRiscoAlto,
      color: fornecedoresRiscoAlto > 0 ? C.rose : C.emerald,
      desc: "Fornecedores classificados como risco alto",
    },
    {
      label: "Incidentes em fornecedores",
      value: incidentesFornecedores,
      color: incidentesFornecedores > 0 ? C.rose : C.emerald,
      desc: "Incidentes abertos na gestão de fornecedores",
    },
  ];

  const rankingFornecedores = [...fornecedores]
    .sort((a, b) => toNum(b.performance_score) - toNum(a.performance_score))
    .slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionHeader
        title="Control Tower"
        sub="Central de acompanhamento da Transformação Digital: projetos, POCs, fornecedores, riscos e performance."
        actions={[
          <Btn
            key="refresh"
            label={loading ? "Atualizando..." : "Atualizar"}
            icon={RefreshCw}
            C={C}
            onClick={carregarIndicadores}
          />,
        ]}
        C={C}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
        <KPICard icon={Activity} label="Saúde geral" value={`${healthScore}%`} sub="Score consolidado" color={healthColor} glow={healthScore >= 80 ? C.emeraldGlow : healthScore >= 60 ? C.amberGlow : C.roseGlow} C={C} />
        <KPICard icon={FolderKanban} label="Projetos" value={totalProjetos} sub={`${projetosEmExecucao} em execução`} color={C.blue} glow={C.blueGlow} C={C} />
        <KPICard icon={FlaskConical} label="POCs" value={totalPocs} sub={`${pocsExecucao} em execução`} color={C.violet} glow={C.violetGlow} C={C} />
        <KPICard icon={Users} label="Fornecedores" value={totalFornecedores} sub={`${fornecedoresAtivos} ativos`} color={C.emerald} glow={C.emeraldGlow} C={C} />
        <KPICard icon={AlertTriangle} label="Alertas" value={projetosAtrasados + pocsCondicoes + fornecedoresRiscoAlto + incidentesFornecedores} sub="Pontos de atenção" color={projetosAtrasados + pocsCondicoes + fornecedoresRiscoAlto + incidentesFornecedores > 0 ? C.rose : C.emerald} glow={projetosAtrasados + pocsCondicoes + fornecedoresRiscoAlto + incidentesFornecedores > 0 ? C.roseGlow : C.emeraldGlow} C={C} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16 }}>
        <div style={{ ...card(C), padding: "22px 24px" }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: C.t1, marginBottom: 4 }}>
            Pipeline de Projetos
          </div>
          <div style={{ fontSize: 12, color: C.t3, marginBottom: 18 }}>
            Distribuição por etapa do ciclo de vida
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 90px 90px",
              gap: 12,
              padding: "0 0 8px",
              borderBottom: `1px solid ${C.border}`,
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 10, color: C.t3, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 900 }}>
              Etapa
            </div>
            <div style={{ fontSize: 10, color: C.t3, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 900, textAlign: "right" }}>
              Qtd.
            </div>
            <div style={{ fontSize: 10, color: C.t3, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 900, textAlign: "right" }}>
              %
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {projetosPorEtapa.map((item) => {
              const color =
                item.etapa === "Backlog"
                  ? C.t3
                  : item.etapa === "Planejamento"
                  ? C.violet
                  : item.etapa === "Execução"
                  ? C.blue
                  : item.etapa === "Monitoramento"
                  ? C.amber
                  : C.emerald;

              return (
                <div key={item.etapa}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 90px 90px",
                      gap: 12,
                      alignItems: "center",
                      marginBottom: 7,
                    }}
                  >
                    <span style={{ fontSize: 13, color: C.t2, fontWeight: 900 }}>
                      {item.etapa}
                    </span>

                    <span style={{ fontSize: 12, color, fontWeight: 900, textAlign: "right" }}>
                      {item.qtd}
                    </span>

                    <span style={{ fontSize: 12, color, fontWeight: 900, textAlign: "right" }}>
                      {pct(item.perc)}
                    </span>
                  </div>

                  <div
                    style={{
                      height: 5,
                      background: C.bg3,
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.max(0, Math.min(100, item.perc))}%`,
                        height: "100%",
                        background: color,
                        borderRadius: 999,
                        transition: "width 0.9s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ ...card(C), padding: "22px 24px" }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: C.t1, marginBottom: 4 }}>
            Mapa de Atenção
          </div>
          <div style={{ fontSize: 12, color: C.t3, marginBottom: 16 }}>
            Pontos que precisam de acompanhamento executivo
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {alertas.map((a) => (
              <div
                key={a.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  background: a.value > 0 ? `${a.color}14` : C.bg3,
                  border: `1px solid ${a.value > 0 ? a.color + "44" : C.border}`,
                  borderRadius: 14,
                  padding: "12px 14px",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, color: C.t1, fontWeight: 900 }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: C.t3, marginTop: 3 }}>{a.desc}</div>
                </div>
                <strong style={{ fontSize: 22, color: a.color }}>{a.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <div style={{ ...card(C), padding: "22px 24px" }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: C.t1, marginBottom: 4 }}>
            Performance das POCs
          </div>
          <div style={{ fontSize: 12, color: C.t3, marginBottom: 18 }}>
            Indicadores consolidados das validações
          </div>

          {[
            ["Entrega", pocEntrega, C.emerald],
            ["Leitura", pocLeitura, C.blue],
            ["Conversão", pocConversao, C.rose],
          ].map(([label, value, color]) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: C.t2, fontWeight: 800 }}>{label}</span>
                <span style={{ fontSize: 12, color, fontWeight: 900 }}>{pct(value)}</span>
              </div>
              <ProgressBar val={Math.min(100, value)} color={color} C={C} />
            </div>
          ))}

          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, padding: 10 }}>
              <div style={{ fontSize: 10, color: C.t3, textTransform: "uppercase" }}>Mensagens</div>
              <div style={{ fontSize: 16, color: C.t1, fontWeight: 900 }}>{pocTotals.totalMensagens}</div>
            </div>
            <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, padding: 10 }}>
              <div style={{ fontSize: 10, color: C.t3, textTransform: "uppercase" }}>Retornos</div>
              <div style={{ fontSize: 16, color: C.amber, fontWeight: 900 }}>{pocTotals.retorno}</div>
            </div>
            <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, padding: 10 }}>
              <div style={{ fontSize: 10, color: C.t3, textTransform: "uppercase" }}>Acordos</div>
              <div style={{ fontSize: 16, color: C.rose, fontWeight: 900 }}>{pocTotals.acordos}</div>
            </div>
          </div>
        </div>

        <div style={{ ...card(C), padding: "22px 24px" }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: C.t1, marginBottom: 4 }}>
            Fornecedores
          </div>
          <div style={{ fontSize: 12, color: C.t3, marginBottom: 18 }}>
            Performance e risco operacional
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: C.t2, fontWeight: 800 }}>Score médio</span>
              <span style={{ fontSize: 12, color: scoreMedioFornecedores >= 80 ? C.emerald : scoreMedioFornecedores >= 60 ? C.amber : C.rose, fontWeight: 900 }}>
                {scoreMedioFornecedores}%
              </span>
            </div>
            <ProgressBar val={scoreMedioFornecedores} color={scoreMedioFornecedores >= 80 ? C.emerald : scoreMedioFornecedores >= 60 ? C.amber : C.rose} C={C} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 10, color: C.t3, textTransform: "uppercase" }}>Ativos</div>
              <div style={{ fontSize: 22, color: C.emerald, fontWeight: 950 }}>{fornecedoresAtivos}</div>
            </div>
            <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 10, color: C.t3, textTransform: "uppercase" }}>Alto risco</div>
              <div style={{ fontSize: 22, color: fornecedoresRiscoAlto > 0 ? C.rose : C.emerald, fontWeight: 950 }}>{fornecedoresRiscoAlto}</div>
            </div>
          </div>
        </div>

        <div style={{ ...card(C), padding: "22px 24px" }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: C.t1, marginBottom: 4 }}>
            Ranking de Fornecedores
          </div>
          <div style={{ fontSize: 12, color: C.t3, marginBottom: 16 }}>
            Top performance cadastrada
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rankingFornecedores.length === 0 && (
              <div style={{ fontSize: 13, color: C.t3 }}>
                Nenhum fornecedor cadastrado.
              </div>
            )}

            {rankingFornecedores.map((item, index) => {
              const score = toNum(item.performance_score);
              const color = score >= 80 ? C.emerald : score >= 60 ? C.amber : C.rose;

              return (
                <div key={item.id || item.nome} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 999,
                      display: "grid",
                      placeItems: "center",
                      background: C.bg3,
                      border: `1px solid ${C.border}`,
                      color: C.t2,
                      fontSize: 11,
                      fontWeight: 900,
                    }}
                  >
                    {index + 1}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: C.t1, fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.nome || "-"}
                    </div>
                    <ProgressBar val={score} color={color} C={C} />
                  </div>

                  <strong style={{ fontSize: 12, color }}>{score}%</strong>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      
    </div>
  );
}


// ─── POC VIEW ─────────────────────────────────────────────────────────────────
function PocView({ C }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [newPocType, setNewPocType] = useState("Canais Digitais");

  function toNum(value) {
    const parsed = Number(String(value || "0").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function calc(record) {
    const rows = record?.record_data?.analytics?.rows || [];
    const totals = rows.reduce(
      (acc, row) => {
        acc.disparado += toNum(row.disparado);
        acc.entregue += toNum(row.entregue);
        acc.lido += toNum(row.lido);
        acc.retorno += toNum(row.retornoCliente);
        acc.acordos += toNum(row.acordos);
        acc.totalMensagens += toNum(row.totalMensagens);
        return acc;
      },
      { disparado: 0, entregue: 0, lido: 0, retorno: 0, acordos: 0, totalMensagens: 0 }
    );

    return {
      ...totals,
      entrega: totals.totalMensagens > 0 ? Math.round((totals.entregue / totals.totalMensagens) * 100) : 0,
      leitura: totals.totalMensagens > 0 ? Math.round((totals.lido / totals.totalMensagens) * 100) : 0,
      conversao: totals.disparado > 0 ? ((totals.acordos / totals.disparado) * 100).toFixed(2) : "0.00",
    };
  }

  async function carregarPocs() {
    setLoading(true);

    const { data, error } = await supabase
      .from("poc_records")
      .select("*")
      .order("updated_at", { ascending: false });

    setLoading(false);

    if (error) {
      console.log("Erro ao carregar POCs:", error);
      return;
    }

    setRecords(data || []);
  }

  useEffect(() => {
    carregarPocs();
  }, []);

  function abrirNovaPoc() {
    setSelectedRecord(null);
    setNewPocType("Canais Digitais");
    setShowTypeSelector(true);
  }

  function confirmarTipoPoc(tipo) {
    setSelectedRecord(null);
    setNewPocType(tipo);
    setShowTypeSelector(false);
    setShowRegister(true);
  }

  function abrirPoc(record) {
    setSelectedRecord(record);
    setNewPocType(record?.record_data?.general?.pocType || "Canais Digitais");
    setShowRegister(true);
  }

  function fecharRegistro() {
    setShowRegister(false);
    setSelectedRecord(null);
    carregarPocs();
  }

  const total = records.length;
  const emExecucao = records.filter((r) => r.status === "Em Execução").length;
  const encerradas = records.filter((r) => r.status === "Encerrada").length;
  const comCondicoes = records.filter((r) => r.recommendation === "Aprovado com condições").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      {showTypeSelector && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9998,
            background: "rgba(2,6,23,0.72)",
            display: "grid",
            placeItems: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              ...card(C),
              width: "100%",
              maxWidth: 980,
              padding: 24,
              borderRadius: 22,
              background: C.bg1,
              boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 20, color: C.t1, fontWeight: 950 }}>
                  Selecionar tipo de POC
                </div>
                <div style={{ fontSize: 13, color: C.t3, marginTop: 5, lineHeight: 1.5 }}>
                  Escolha o modelo antes de iniciar. O layout do relatório será carregado conforme a categoria.
                </div>
              </div>

              <button
                onClick={() => setShowTypeSelector(false)}
                style={{
                  border: `1px solid ${C.border}`,
                  background: C.surface,
                  color: C.t2,
                  borderRadius: 10,
                  padding: "8px 12px",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                Fechar
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                {
                  tipo: "Canais Digitais",
                  titulo: "Canais Digitais",
                  desc: "WhatsApp, RCS, SMS e E-mail. Mantém o relatório atual de disparos, entrega, leitura, retorno e conversão.",
                  color: C.blue,
                  bg: C.blueGlow,
                },
                {
                  tipo: "Enriquecimento de Dados",
                  titulo: "Enriquecimento de Dados",
                  desc: "Modelo específico para bases processadas, taxa de enriquecimento, dados inválidos, qualidade e critérios de validação.",
                  color: C.emerald,
                  bg: C.emeraldGlow,
                },
                {
                  tipo: "Orquestração",
                  titulo: "Orquestração",
                  desc: "Modelo para régua de cobrança, linha do tempo, matriz de retorno e motor de decisão Se/Então.",
                  color: C.violet,
                  bg: C.violetGlow,
                },
              ].map((item) => (
                <button
                  key={item.tipo}
                  onClick={() => confirmarTipoPoc(item.tipo)}
                  style={{
                    textAlign: "left",
                    border: `1px solid ${item.color}55`,
                    background: item.bg,
                    color: C.t1,
                    borderRadius: 18,
                    padding: 18,
                    cursor: "pointer",
                    minHeight: 160,
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 950, color: item.color, marginBottom: 8 }}>
                    {item.titulo}
                  </div>
                  <div style={{ fontSize: 12, color: C.t2, lineHeight: 1.55 }}>
                    {item.desc}
                  </div>
                  <div style={{ marginTop: 18, fontSize: 12, fontWeight: 900, color: item.color }}>
                    Iniciar POC →
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showRegister && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: C.bg0,
            overflow: "auto",
          }}
        >
          <PocRegister
            C={C}
            registroInicial={selectedRecord}
            pocTypeInicial={newPocType}
            onSaved={carregarPocs}
            onClose={fecharRegistro}
          />
        </div>
      )}

      <SectionHeader
        title="POCs — Proof of Concept"
        sub="Gestão de validações técnicas, fornecedores, incidentes e performance analítica"
        actions={[
          <Btn
            key="n"
            label="Nova POC"
            icon={Plus}
            primary
            C={C}
            onClick={abrirNovaPoc}
          />,
        ]}
        C={C}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <KPICard icon={FlaskConical} label="POCs registradas" value={total} sub={loading ? "Carregando..." : "Portfólio de validações"} color={C.blue} glow={C.blueGlow} C={C} />
        <KPICard icon={Activity} label="Em execução" value={emExecucao} sub="Testes ativos" color={C.emerald} glow={C.emeraldGlow} C={C} />
        <KPICard icon={CheckCircle2} label="Encerradas" value={encerradas} sub="POCs finalizadas" color={C.violet} glow={C.violetGlow} C={C} />
        <KPICard icon={AlertTriangle} label="Com condições" value={comCondicoes} sub="Atenção" color={C.amber} glow={C.amberGlow} C={C} />
      </div>

      <div style={{ ...card(C), padding: 0, overflowX: "auto", overflowY: "hidden" }}>
        <table style={{ width: "100%", minWidth: 1380, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["POC", "Fornecedor", "Responsável", "Status", "Entrega", "Leitura", "Conversão", "Recomendação"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "14px 16px",
                    fontSize: 11,
                    fontWeight: 800,
                    color: C.t3,
                    textAlign: "left",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {records.map((record) => {
              const m = calc(record);
              const statusColor =
                record.status === "Encerrada"
                  ? C.violet
                  : record.status === "Em Execução"
                  ? C.emerald
                  : record.status === "Em Monitoramento"
                  ? C.amber
                  : C.blue;

              return (
                <tr
                  key={record.id}
                  onClick={() => abrirPoc(record)}
                  style={{
                    borderBottom: `1px solid ${C.border}`,
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = C.cardHov)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "15px 16px" }}>
                    <div style={{ fontSize: 13, color: C.t1, fontWeight: 800 }}>
                      {record.poc_name}
                    </div>
                    <div style={{ fontSize: 11, color: C.t3, marginTop: 3 }}>
                      Atualizada em {new Date(record.updated_at || record.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </td>

                  <td style={{ padding: "15px 16px", fontSize: 12, color: C.t2 }}>
                    {record.supplier || "-"}
                  </td>

                  <td style={{ padding: "15px 16px", fontSize: 12, color: C.t2 }}>
                    {record.responsible || "-"}
                  </td>

                  <td style={{ padding: "15px 16px" }}>
                    <Chip label={record.status || "Em Planejamento"} color={statusColor} bg={statusColor + "22"} />
                  </td>

                  <td style={{ padding: "15px 16px", fontSize: 12, color: C.t2 }}>
                    <strong style={{ color: m.entrega >= 85 ? C.emerald : m.entrega >= 70 ? C.amber : C.rose }}>{m.entrega}%</strong>
                  </td>

                  <td style={{ padding: "15px 16px", fontSize: 12, color: C.t2 }}>
                    <strong style={{ color: m.leitura >= 60 ? C.emerald : m.leitura >= 45 ? C.amber : C.rose }}>{m.leitura}%</strong>
                  </td>

                  <td style={{ padding: "15px 16px", fontSize: 12, color: C.t2 }}>
                    <strong style={{ color: C.violet }}>{m.conversao}%</strong>
                  </td>

                  <td style={{ padding: "15px 16px", fontSize: 12, color: C.t2 }}>
                    {record.recommendation || "Em avaliação"}
                  </td>
                </tr>
              );
            })}

            {records.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: 30, textAlign: "center", color: C.t3, fontSize: 13 }}>
                  Nenhuma POC cadastrada ainda. Clique em Nova POC para iniciar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const navItems = [
  { id:"indicators", label:"Control Tower", icon:BarChart3       },
  { id:"projects",   label:"Projetos",      icon:FolderKanban    },
  { id:"scrum",      label:"Scrum",         icon:Layers          },
  { id:"poc",        label:"POCs",          icon:FlaskConical, badge:"Novo" },
  { id:"suppliers",  label:"Fornecedores", icon:Globe           },
];

function Sidebar({ active, setActive, C }) {
  return (
    <div style={{ width:C.sidebarW, flexShrink:0, background:C.bg1, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", height:"100vh", position:"sticky", top:0, transition:"background 0.3s, border-color 0.3s" }}>
      <div style={{ padding:"22px 18px 18px", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:33, height:33, borderRadius:9, background:`linear-gradient(135deg,${C.blue},${C.violet})`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Zap size={16} color="#fff"/>
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:800, color:C.t1, lineHeight:1.2, letterSpacing:"-0.01em" }}>Bellinati Perez</div>
            <div style={{ fontSize:9, color:C.t3, letterSpacing:"0.07em", textTransform:"uppercase" }}>Transformação Digital</div>
          </div>
        </div>
      </div>
      <nav style={{ flex:1, padding:"10px 10px", overflowY:"auto" }}>
        <div style={{ fontSize:9, color:C.t3, letterSpacing:"0.09em", padding:"8px 10px 6px", textTransform:"uppercase" }}>Principal</div>
        {navItems.map(item=>{
          const isA = active===item.id;
          return (
            <button key={item.id} onClick={()=>setActive(item.id)} style={{
              width:"100%", display:"flex", alignItems:"center", gap:9,
              padding:"9px 10px", borderRadius:8, border:"none", cursor:"pointer",
              background:isA?C.blueGlow:"transparent",
              color:isA?C.blue:C.t2, fontSize:13, fontWeight:isA?700:400,
              marginBottom:2, transition:"all 0.15s",
              borderLeft:isA?`2px solid ${C.blue}`:"2px solid transparent",
            }}
              onMouseEnter={e=>{ if(!isA){ e.currentTarget.style.background=C.surface; e.currentTarget.style.color=C.t1; } }}
              onMouseLeave={e=>{ if(!isA){ e.currentTarget.style.background="transparent"; e.currentTarget.style.color=C.t2; } }}
            >
              <item.icon size={15}/>
              <span style={{ flex:1, textAlign:"left" }}>{item.label}</span>
              {item.badge && <span style={{ fontSize:9, padding:"1px 6px", borderRadius:10, background:C.blueGlow, color:C.blue, fontWeight:700, border:`1px solid ${C.blue}33` }}>{item.badge}</span>}
            </button>
          );
        })}
      </nav>
      <div style={{ padding:"12px 18px", borderTop:`1px solid ${C.border}` }}>
        <div style={{ padding:"9px 12px", borderRadius:8, background:C.emeraldGlow, border:`1px solid ${C.emerald}28`, display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:C.emerald, boxShadow:`0 0 6px ${C.emerald}` }}/>
          <span style={{ fontSize:11, color:C.emerald, fontWeight:700 }}>Todos os sistemas OK</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:"50%", background:`linear-gradient(135deg,${C.blue},${C.violet})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#fff" }}>EP</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.t1 }}>Equipe Projetos</div>
            <div style={{ fontSize:10, color:C.t3 }}>Administrador</div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── TOPBAR ───────────────────────────────────────────────────────────────────
function Topbar({ page, C, dark, toggleTheme, userEmail, onLogout }) {
  const now = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const iconButton = {
    width: 34,
    height: 34,
    borderRadius: 12,
    border: `1px solid ${C.border}`,
    background: C.surface,
    color: C.t2,
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
  };

  const popoverStyle = {
    position: "absolute",
    top: 42,
    right: 0,
    width: 320,
    background: C.bg1,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    boxShadow: "0 18px 45px rgba(15,23,42,0.22)",
    padding: 14,
    zIndex: 99,
  };

  function closeAll() {
    setShowNotifications(false);
    setShowSettings(false);
  }

  return (
    <div style={{
      height: 54,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 26px",
      borderBottom: `1px solid ${C.border}`,
      background: C.bg1,
      position: "sticky",
      top: 0,
      zIndex: 20,
      transition: "background 0.3s, border-color 0.3s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: C.t3 }}>
        <span style={{ fontWeight: 600 }}>Bellinati Perez</span>
        <ChevronRight size={13} />
        <span style={{ color: C.t1, fontWeight: 500 }}>
          {navItems.find(n => n.id === page)?.label || "Control Tower"}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 11, color: C.t3 }}>{now}</span>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => {
              setShowNotifications((prev) => !prev);
              setShowSettings(false);
            }}
            style={iconButton}
            title="Notificações"
          >
            <Bell size={16} />
            <span style={{
              position: "absolute",
              top: 7,
              right: 7,
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: C.rose,
              border: `2px solid ${C.bg1}`,
            }} />
          </button>

          {showNotifications && (
            <div style={popoverStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 950, color: C.t1 }}>Notificações</div>
                  <div style={{ fontSize: 11, color: C.t3, marginTop: 2 }}>Acompanhamento da plataforma</div>
                </div>

                <button
                  onClick={closeAll}
                  style={{ border: "none", background: "transparent", color: C.t3, cursor: "pointer", fontSize: 18, lineHeight: 1 }}
                >
                  ×
                </button>
              </div>

              {[
                { title: "Login demonstrativo ativo", desc: "Ambiente configurado para apresentação do MVP.", color: C.blue },
                { title: "Control Tower disponível", desc: "Indicadores consolidados carregados na tela inicial.", color: C.emerald },
                { title: "Pontos de atenção", desc: "Alertas operacionais podem ser acompanhados pela liderança.", color: C.amber },
              ].map((item) => (
                <div key={item.title} style={{ display: "flex", gap: 10, padding: "10px 0", borderTop: `1px solid ${C.border}` }}>
                  <span style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: item.color,
                    marginTop: 5,
                    flexShrink: 0,
                    boxShadow: `0 0 8px ${item.color}`,
                  }} />
                  <div>
                    <div style={{ fontSize: 12, color: C.t1, fontWeight: 900 }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: C.t3, marginTop: 3, lineHeight: 1.45 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => {
              setShowSettings((prev) => !prev);
              setShowNotifications(false);
            }}
            style={iconButton}
            title="Configurações"
          >
            <Settings size={16} />
          </button>

          {showSettings && (
            <div style={popoverStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 950, color: C.t1 }}>Configurações</div>
                  <div style={{ fontSize: 11, color: C.t3, marginTop: 2 }}>Preferências da plataforma</div>
                </div>

                <button
                  onClick={closeAll}
                  style={{ border: "none", background: "transparent", color: C.t3, cursor: "pointer", fontSize: 18, lineHeight: 1 }}
                >
                  ×
                </button>
              </div>

              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  onClick={toggleTheme}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    border: `1px solid ${C.border}`,
                    background: C.surface,
                    color: C.t2,
                    borderRadius: 12,
                    padding: "10px 12px",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  <span>Modo de exibição</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, color: dark ? C.amber : C.blue }}>
                    {dark ? <Sun size={14} /> : <Moon size={14} />}
                    {dark ? "Dark" : "Light"}
                  </span>
                </button>

                <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, padding: "11px 12px" }}>
                  <div style={{ fontSize: 10, color: C.t3, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 900 }}>
                    Ambiente
                  </div>
                  <div style={{ fontSize: 12, color: C.t1, fontWeight: 900, marginTop: 4 }}>
                    MVP Demonstrativo
                  </div>
                  <div style={{ fontSize: 11, color: C.t3, marginTop: 4, lineHeight: 1.45 }}>
                    Login e permissões definitivas serão integrados após aprovação da Infra e Segurança da Informação.
                  </div>
                </div>

                <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 12, padding: "11px 12px" }}>
                  <div style={{ fontSize: 10, color: C.t3, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 900 }}>
                    Usuário atual
                  </div>
                  <div style={{ fontSize: 12, color: C.t1, fontWeight: 900, marginTop: 4 }}>
                    Teste Digital
                  </div>
                  <div style={{ fontSize: 11, color: C.t3, marginTop: 4 }}>
                    {userEmail || "teste@digital.com.br"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px 4px 4px", borderRadius: 999, background: C.surface, border: `1px solid ${C.border}` }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${C.blue},${C.violet})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>
            TD
          </div>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.t1 }}>Teste Digital</div>
            <div style={{ fontSize: 9, color: C.t3 }}>{userEmail || "teste@digital.com.br"}</div>
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{
            padding: "6px 11px",
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            background: C.surface,
            color: C.t2,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          Sair
        </button>
      </div>
    </div>
  );
}

// ─── LOGIN DEMO ───────────────────────────────────────────────────────────────
function LoginScreen({ C, dark, toggleTheme, onLogin }) {
  const [email, setEmail] = useState("teste@digital.com.br");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const DEMO_EMAIL = "teste@digital.com.br";
  const DEMO_PASSWORD = "Teste@2026";

  const field = {
    width: "100%",
    minHeight: 46,
    borderRadius: 14,
    border: `1px solid ${C.border}`,
    background: C.surface,
    color: C.t1,
    padding: "12px 14px",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
        onLogin(DEMO_EMAIL);
      } else {
        setError("E-mail ou senha inválidos. Use o login de teste informado.");
      }

      setLoading(false);
    }, 450);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `radial-gradient(circle at top left, ${C.blueGlow}, transparent 34%), radial-gradient(circle at bottom right, ${C.violetGlow}, transparent 34%), ${C.bg0}`,
        display: "grid",
        placeItems: "center",
        padding: 24,
        fontFamily: "'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif",
        color: C.t1,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 980,
          display: "grid",
          gridTemplateColumns: "1.05fr 0.95fr",
          gap: 18,
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            ...card(C),
            padding: 34,
            borderRadius: 26,
            position: "relative",
            overflow: "hidden",
            background: `linear-gradient(135deg, ${C.card}, ${C.blueGlow})`,
          }}
        >
          <div style={{ position: "absolute", top: -80, right: -80, width: 240, height: 240, borderRadius: "50%", background: C.violetGlow, filter: "blur(18px)" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 34 }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: `linear-gradient(135deg,${C.blue},${C.violet})`, display: "grid", placeItems: "center" }}>
                <Zap size={22} color="#fff" />
              </div>

              <div>
                <div style={{ fontSize: 18, fontWeight: 950, color: C.t1 }}>
                  Bellinati Perez
                </div>
                <div style={{ fontSize: 11, color: C.t3, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 800 }}>
                  Transformação Digital
                </div>
              </div>
            </div>

            <div style={{ fontSize: 34, lineHeight: 1.12, letterSpacing: "-0.04em", fontWeight: 950, color: C.t1, maxWidth: 520 }}>
              Plataforma de Projetos - Transformação Digital BP
            </div>

            <div style={{ fontSize: 14, color: C.t2, lineHeight: 1.7, marginTop: 16, maxWidth: 560 }}>
              Central de acompanhamento para projetos, Scrum, POCs, fornecedores, riscos, indicadores e decisões executivas.
            </div>

            <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 8, color: C.emerald, fontSize: 12, fontWeight: 800 }}>
              <Shield size={15} />
              Acesso demonstrativo para validação do MVP
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            ...card(C),
            padding: 30,
            borderRadius: 26,
            background: C.card,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minHeight: 470,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 24, color: C.t1, fontWeight: 950 }}>
                Acessar plataforma
              </div>
              <div style={{ fontSize: 13, color: C.t3, marginTop: 5 }}>
                Entre com as credenciais de teste
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              style={{
                border: `1px solid ${C.border}`,
                background: C.surface,
                color: C.t2,
                borderRadius: 999,
                padding: "8px 11px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {dark ? <Sun size={14} color={C.amber} /> : <Moon size={14} color={C.blue} />}
              {dark ? "Light" : "Dark"}
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            <div>
              <div style={{ fontSize: 11, color: C.t3, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 900, marginBottom: 7 }}>
                E-mail
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={field}
                placeholder="teste@digital.com.br"
                autoComplete="username"
              />
            </div>

            <div>
              <div style={{ fontSize: 11, color: C.t3, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 900, marginBottom: 7 }}>
                Senha
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={field}
                placeholder="Digite a senha"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div style={{ background: C.roseGlow, border: `1px solid ${C.rose}44`, color: C.rose, borderRadius: 12, padding: "10px 12px", fontSize: 12, fontWeight: 800 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 8,
                width: "100%",
                minHeight: 48,
                borderRadius: 14,
                border: "none",
                background: C.blue,
                color: "#fff",
                fontSize: 14,
                fontWeight: 950,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.75 : 1,
                boxShadow: "0 14px 28px rgba(37,99,235,0.22)",
              }}
            >
              {loading ? "Validando acesso..." : "Entrar"}
            </button>
          </div>

          <div style={{ marginTop: 20, background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 14, padding: 13 }}>
            <div style={{ fontSize: 11, color: C.t3, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 900, marginBottom: 6 }}>
              Credencial de teste
            </div>
            <div style={{ fontSize: 12, color: C.t2, lineHeight: 1.6 }}>
              Login: <strong style={{ color: C.t1 }}>teste@digital.com.br</strong><br />
              Senha: <strong style={{ color: C.t1 }}>Teste@2026</strong>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  useEffect(() => {
  async function testarConexao() {
    const { data, error } = await supabase
      .from("projects")
      .select("*");

    if (error) {
      console.log("Erro:", error);
    } else {
      console.log("Conectado Supabase:", data);
    }
  }

  testarConexao();
}, []);
  const [dark, setDark] = useState(true);
  const [active, setActive] = useState("indicators");
  const [auth, setAuth] = useState(() => {
    try {
      return window.localStorage.getItem("bp-demo-auth") === "true";
    } catch {
      return false;
    }
  });
  const [authEmail, setAuthEmail] = useState(() => {
    try {
      return window.localStorage.getItem("bp-demo-email") || "";
    } catch {
      return "";
    }
  });
  const C = getC(dark);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("bp-theme");
        if (res) setDark(res.value === "dark");
      } catch {}
    })();
  }, []);

  const toggleTheme = useCallback(async () => {
    const next = !dark;
    setDark(next);
    try { await window.storage.set("bp-theme", next ? "dark" : "light"); } catch {}
  }, [dark]);

  function handleLogin(email) {
    setAuth(true);
    setAuthEmail(email);

    try {
      window.localStorage.setItem("bp-demo-auth", "true");
      window.localStorage.setItem("bp-demo-email", email);
    } catch {}
  }

  function handleLogout() {
    setAuth(false);
    setAuthEmail("");
    setActive("indicators");

    try {
      window.localStorage.removeItem("bp-demo-auth");
      window.localStorage.removeItem("bp-demo-email");
    } catch {}
  }

  const views = { indicators:IndicatorsView, projects:ProjectsView, scrum:ScrumView, poc:PocView, suppliers:SuppliersView };
  const View = views[active] || IndicatorsView;

  if (!auth) {
    return (
      <ThemeCtx.Provider value={{ dark, toggle: toggleTheme }}>
        <LoginScreen C={C} dark={dark} toggleTheme={toggleTheme} onLogin={handleLogin} />
      </ThemeCtx.Provider>
    );
  }

  return (
    <ThemeCtx.Provider value={{ dark, toggle: toggleTheme }}>
      <div style={{ display:"flex", background:C.bg0, minHeight:"100vh", fontFamily:"'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif", color:C.t1, transition:"background 0.3s" }}>
        <Sidebar active={active} setActive={setActive} C={C}/>
        <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
          <Topbar page={active} C={C} dark={dark} toggleTheme={toggleTheme} userEmail={authEmail} onLogout={handleLogout}/>
          <main style={{ flex:1, padding:26, overflowY:"auto" }}>
            <View C={C}/>
          </main>
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}