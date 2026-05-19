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

const ProgressBar = ({ val, color, C }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
    <div style={{ flex:1, height:4, background:C.bg3, borderRadius:99, overflow:"hidden" }}>
      <div style={{ width:`${val}%`, height:"100%", background:color, borderRadius:99, transition:"width 0.9s ease" }} />
    </div>
    <span style={{ fontSize:12, color:C.t2, minWidth:32, textAlign:"right" }}>{val}%</span>
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
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <SectionHeader title="Painel Executivo" sub="Transformação Digital — Visão Consolidada · Q4 2024" C={C} />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
        <KPICard icon={FolderKanban} label="Projetos Ativos"   value="12"    sub="2 críticos em atenção"       trend="up" trendVal="+3 vs Q3" color={C.blue}   glow={C.blueGlow}   C={C} />
        <KPICard icon={TrendingUp}   label="ROI Acumulado"     value="61%"   sub="Meta: 30% — superada"        trend="up" trendVal="+103%"    color={C.emerald} glow={C.emeraldGlow} C={C} />
        <KPICard icon={Shield}       label="SLA Compliance"    value="94.2%" sub="↑ 2.1pp vs mês anterior"    trend="up" trendVal="+2.1pp"   color={C.violet}  glow={C.violetGlow}  C={C} />
        <KPICard icon={Activity}     label="Produtividade"     value="97%"   sub="Índice equipe técnica"       trend="up" trendVal="+4%"      color={C.cyan}    glow={C.cyanGlow}    C={C} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
        <KPICard icon={CheckCircle2} label="Entregas no Prazo" value="89.3%" sub="338 de 379 entregas"         trend="up" trendVal="+3.7%"    color={C.emerald} glow={C.emeraldGlow} C={C} />
        <KPICard icon={AlertTriangle}label="Incidentes Abertos"value="7"     sub="3 críticos, 4 médios"        trend="down" trendVal="-5"     color={C.amber}   glow={C.amberGlow}   C={C} />
        <KPICard icon={Target}       label="Budget Utilizado"  value="68%"   sub="R$ 12.4M de R$ 18.2M"                                      color={C.blue}    glow={C.blueGlow}    C={C} />
        <KPICard icon={Users}        label="Fornecedores"      value="6"     sub="SLA médio: 98.2%"                                           color={C.violet}  glow={C.violetGlow}  C={C} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div style={{ ...card(C), padding:"22px 24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <div><div style={{ fontSize:14, fontWeight:600, color:C.t1 }}>Evolução do ROI</div><div style={{ fontSize:12, color:C.t3 }}>Real vs Meta — 2024</div></div>
            <Chip label="↑ 103% vs meta" color={C.emerald} bg={C.emeraldGlow} />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={roiData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.emerald} stopOpacity={0.18}/>
                  <stop offset="95%" stopColor={C.emerald} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.blue} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={C.blue} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
              <XAxis dataKey="m" tick={{ fill:C.t3, fontSize:11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:C.t3, fontSize:11 }} axisLine={false} tickLine={false} unit="%"/>
              <Tooltip content={<CT C={C}/>}/>
              <Area type="monotone" dataKey="meta" name="Meta" stroke={C.blue}   strokeWidth={1.5} fill="url(#g2)" strokeDasharray="4 2"/>
              <Area type="monotone" dataKey="roi"  name="ROI"  stroke={C.emerald} strokeWidth={2}  fill="url(#g1)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{ ...card(C), padding:"22px 24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <div><div style={{ fontSize:14, fontWeight:600, color:C.t1 }}>Entregas Mensais</div><div style={{ fontSize:12, color:C.t3 }}>No prazo vs Atrasadas</div></div>
            <Chip label="378 total" color={C.t2} bg={C.surface} />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deliveryData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
              <XAxis dataKey="m" tick={{ fill:C.t3, fontSize:11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:C.t3, fontSize:11 }} axisLine={false} tickLine={false}/>
              <Tooltip content={<CT C={C}/>}/>
              <Bar dataKey="ok"  name="No Prazo"  fill={C.emerald} radius={[3,3,0,0]}/>
              <Bar dataKey="atr" name="Atrasadas" fill={C.rose}    radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
        <div style={{ ...card(C), padding:"22px 24px" }}>
          <div style={{ marginBottom:16 }}><div style={{ fontSize:14, fontWeight:600, color:C.t1 }}>Produtividade</div><div style={{ fontSize:12, color:C.t3 }}>Índice mensal</div></div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={prodData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
              <XAxis dataKey="m" tick={{ fill:C.t3, fontSize:10 }} axisLine={false} tickLine={false}/>
              <YAxis domain={[60,100]} tick={{ fill:C.t3, fontSize:10 }} axisLine={false} tickLine={false} unit="%"/>
              <Tooltip content={<CT C={C}/>}/>
              <Line type="monotone" dataKey="prod" name="Prod" stroke={C.cyan} strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ ...card(C), padding:"22px 24px" }}>
          <div style={{ marginBottom:8 }}><div style={{ fontSize:14, fontWeight:600, color:C.t1 }}>SLA Compliance</div><div style={{ fontSize:12, color:C.t3 }}>Conformidade geral</div></div>
          <div style={{ position:"relative", display:"flex", justifyContent:"center" }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={slaData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                  {slaData.map((d,i) => <Cell key={i} fill={d.fill}/>)}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:700, color:C.emerald }}>94%</div>
              <div style={{ fontSize:10, color:C.t3 }}>conformidade</div>
            </div>
          </div>
          <div style={{ display:"flex", justifyContent:"center", gap:16, marginTop:4 }}>
            {slaData.map((d,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:C.t2 }}>
                <span style={{ width:8, height:8, borderRadius:2, background:d.fill }}/>{d.name}: {d.value}%
              </div>
            ))}
          </div>
        </div>
        <div style={{ ...card(C), padding:"20px" }}>
          <div style={{ marginBottom:14 }}><div style={{ fontSize:14, fontWeight:600, color:C.t1 }}>Atividades Recentes</div><div style={{ fontSize:12, color:C.t3 }}>Últimas 48h</div></div>
          <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
            {activities.slice(0,5).map((a,i)=>(
              <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                <div style={{ padding:5, borderRadius:7, background:`${a.color}18`, flexShrink:0 }}><a.icon size={12} color={a.color}/></div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:11, color:C.t2, lineHeight:1.4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.text}</div>
                  <div style={{ fontSize:10, color:C.t3, marginTop:1 }}>{a.time} atrás</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectsView({ C }) {
  const etapasCiclo = ["Backlog", "Planejamento", "Execução", "Monitoramento", "Encerramento"];

  const [filter, setFilter] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [dbProjects, setDbProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [savingProject, setSavingProject] = useState(false);

  const emptyForm = {
    nome: "",
    responsavel: "",
    fornecedor: "",
    canal: "",
    prioridade: "Média",
    statusCiclo: "Backlog",
    descricao: "",
    prazo: "",
  };

  const [form, setForm] = useState(emptyForm);

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

  function calcularProgressoPorEtapa(etapa) {
    const etapas = {
      "Backlog": 10,
      "Início": 10,
      "Planejamento": 30,
      "Execução": 60,
      "Monitoramento": 85,
      "Encerramento": 100,
    };

    return etapas[etapa] || 0;
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

  function corEtapa(etapa) {
    const etapaNormalizada = normalizarEtapa(etapa);

    if (etapaNormalizada === "Backlog") return { color: C.t3, bg: C.bg3 };
    if (etapaNormalizada === "Planejamento") return { color: C.violet, bg: C.violetGlow };
    if (etapaNormalizada === "Execução") return { color: C.blue, bg: C.blueGlow };
    if (etapaNormalizada === "Monitoramento") return { color: C.amber, bg: C.amberGlow };
    return { color: C.emerald, bg: C.emeraldGlow };
  }

  function handleChange(campo, valor) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  async function carregarProjetos() {
    setLoadingProjects(true);

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Erro ao carregar projetos:", error);
      setLoadingProjects(false);
      return;
    }

    const projetosFormatados = (data || []).map((p, index) => {
      const etapaAtual = normalizarEtapa(p.current_stage || p.status);

      return {
        dbId: p.id,
        id: `BP-${String(index + 1).padStart(3, "0")}`,
        name: p.name || "-",
        resp: p.responsible || "-",
        fornecedor: p.supplier || "-",
        canal: p.channel || "-",
        etapa: etapaAtual,
        prog: calcularProgressoPorEtapa(etapaAtual),
        prazo: p.end_date ? p.end_date.split("-").reverse().join("/") : "-",
        prioridade: p.priority || "Média",
        orcamento: "-",
        statusCiclo: etapaAtual,
      };
    });

    setDbProjects(projetosFormatados);
    setLoadingProjects(false);
  }

  useEffect(() => {
    carregarProjetos();
  }, []);

  async function salvarProjeto() {
    if (!form.nome || !form.nome.trim()) {
      alert("Informe o nome do projeto antes de salvar.");
      return;
    }

    setSavingProject(true);

    const etapaSelecionada = normalizarEtapa(form.statusCiclo);

    const payloadBase = {
      name: form.nome,
      description: form.descricao,
      responsible: form.responsavel,
      supplier: form.fornecedor,
      channel: form.canal,
      priority: form.prioridade || "Média",
      status: etapaSelecionada,
      current_stage: etapaSelecionada,
    };

    const tentativas = [
      { ...payloadBase, end_date: form.prazo || null },
      payloadBase,
    ];

    let ultimoErro = null;

    for (const payload of tentativas) {
      const { error } = await supabase.from("projects").insert([payload]);

      if (!error) {
        ultimoErro = null;
        break;
      }

      ultimoErro = error;
      console.log("Tentativa de salvar projeto falhou:", error);
    }

    setSavingProject(false);

    if (ultimoErro) {
      console.log("Erro ao salvar projeto:", ultimoErro);
      alert("Erro ao salvar projeto. Veja o console.");
      return;
    }

    alert("Projeto salvo com sucesso!");

    setForm(emptyForm);
    setShowForm(false);
    await carregarProjetos();
  }

  async function atualizarStatusCicloProjeto(dbId, novaEtapa) {
    if (!dbId) {
      alert("Este projeto ainda não possui ID do Supabase.");
      return;
    }

    const etapaNormalizada = normalizarEtapa(novaEtapa);

    const { error } = await supabase
      .from("projects")
      .update({
        current_stage: etapaNormalizada,
        status: etapaNormalizada,
      })
      .eq("id", dbId);

    if (error) {
      console.log("Erro ao atualizar status do ciclo:", error);
      alert("Erro ao atualizar status do ciclo do projeto.");
      return;
    }

    await carregarProjetos();
  }

  const sourceProjects =
    dbProjects.length > 0
      ? dbProjects
      : projects.map((p) => {
          const etapaAtual = normalizarEtapa(p.etapa || p.status);
          return {
            ...p,
            etapa: etapaAtual,
            statusCiclo: etapaAtual,
            prog: calcularProgressoPorEtapa(etapaAtual),
          };
        });

  const filtered =
    filter === "Todos"
      ? sourceProjects
      : sourceProjects.filter((p) => normalizarEtapa(p.statusCiclo || p.etapa || p.status) === filter);

  const totalPorFiltro = filters.reduce((acc, item) => {
    if (item === "Todos") {
      acc[item] = sourceProjects.length;
    } else {
      acc[item] = sourceProjects.filter((p) => normalizarEtapa(p.statusCiclo || p.etapa || p.status) === item).length;
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
              ? "Carregando projetos..."
              : `${filtered.length} projetos · Portfólio Transformação Digital`}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, position: "relative" }}>
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

          {showFilters && (
            <div
              style={{
                position: "absolute",
                top: 44,
                right: 150,
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

          <button
            onClick={() => setShowForm(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 10,
              background: C.blue,
              border: "none",
              color: "#fff",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
              boxShadow: "0 10px 24px rgba(37,99,235,0.18)",
            }}
          >
            Novo Projeto
          </button>
        </div>
      </div>

      {showForm && (
        <div
          style={{
            ...card(C),
            padding: 0,
            borderRadius: 22,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "24px 26px 8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.t1 }}>
                Novo Projeto
              </div>
              <div style={{ fontSize: 12, color: C.t3, marginTop: 4 }}>
                Cadastre um novo projeto da Transformação Digital
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
                fontWeight: 600,
              }}
            >
              Fechar
            </button>
          </div>

          <div
            style={{
              maxWidth: 1160,
              margin: "0 auto",
              padding: "12px 26px 26px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 14,
                alignItems: "start",
              }}
            >
              <input
                placeholder="Nome do projeto"
                value={form.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                style={fieldBase}
              />

              <input
                placeholder="Responsável"
                value={form.responsavel}
                onChange={(e) => handleChange("responsavel", e.target.value)}
                style={fieldBase}
              />

              <input
                placeholder="Fornecedor"
                value={form.fornecedor}
                onChange={(e) => handleChange("fornecedor", e.target.value)}
                style={fieldBase}
              />

              <input
                placeholder="Canal: WhatsApp, RCS, SMS, E-mail..."
                value={form.canal}
                onChange={(e) => handleChange("canal", e.target.value)}
                style={fieldBase}
              />

              <select
                value={form.prioridade}
                onChange={(e) => handleChange("prioridade", e.target.value)}
                style={fieldBase}
              >
                <option value="Baixa">Prioridade: Baixa</option>
                <option value="Média">Prioridade: Média</option>
                <option value="Alta">Prioridade: Alta</option>
                <option value="Crítica">Prioridade: Crítica</option>
              </select>

              <select
                value={form.statusCiclo}
                onChange={(e) => handleChange("statusCiclo", e.target.value)}
                style={fieldBase}
              >
                {etapasCiclo.map((etapa) => (
                  <option key={etapa} value={etapa}>
                    Status do ciclo: {etapa}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={form.prazo}
                onChange={(e) => handleChange("prazo", e.target.value)}
                style={{ ...fieldBase, gridColumn: "1 / -1" }}
              />

              <textarea
                placeholder="Descrição do projeto"
                value={form.descricao}
                onChange={(e) => handleChange("descricao", e.target.value)}
                style={{
                  ...fieldBase,
                  gridColumn: "1 / -1",
                  minHeight: 136,
                  resize: "vertical",
                  lineHeight: 1.5,
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                marginTop: 18,
                paddingTop: 18,
                borderTop: `1px solid ${C.border}`,
              }}
            >
              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  color: C.t2,
                  borderRadius: 12,
                  padding: "11px 18px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Cancelar
              </button>

              <button
                onClick={salvarProjeto}
                disabled={savingProject}
                style={{
                  background: C.blue,
                  border: "none",
                  color: "#fff",
                  borderRadius: 12,
                  padding: "11px 20px",
                  cursor: savingProject ? "not-allowed" : "pointer",
                  fontWeight: 800,
                  opacity: savingProject ? 0.7 : 1,
                  boxShadow: "0 10px 24px rgba(37,99,235,0.18)",
                }}
              >
                {savingProject ? "Salvando..." : "Salvar Projeto"}
              </button>
            </div>
          </div>
        </div>
      )}

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

      <div style={{ ...card(C), padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["ID", "Projeto", "Responsável", "Status do Ciclo", "Progresso", "Prazo", "Prioridade", "Orçamento"].map((h, i) => (
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
              const etapaAtual = normalizarEtapa(p.statusCiclo || p.etapa || p.status);
              const cores = corEtapa(etapaAtual);

              return (
                <tr key={p.dbId || p.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: C.t3 }}>
                    {p.id}
                  </td>

                  <td style={{ padding: "14px 16px", fontSize: 13, color: C.t1, fontWeight: 700 }}>
                    {p.name}
                  </td>

                  <td style={{ padding: "14px 16px", fontSize: 12, color: C.t2 }}>
                    {p.resp}
                  </td>

                  <td style={{ padding: "14px 16px" }}>
                    <select
                      value={etapaAtual}
                      onChange={(e) => atualizarStatusCicloProjeto(p.dbId, e.target.value)}
                      style={{
                        ...fieldBase,
                        minWidth: 170,
                        padding: "8px 10px",
                        minHeight: 42,
                        background: C.surface,
                        color: C.t1,
                        cursor: "pointer",
                        borderColor: cores.color + "66",
                      }}
                    >
                      {etapasCiclo.map((etapa) => (
                        <option key={etapa} value={etapa}>
                          {etapa}
                        </option>
                      ))}
                    </select>
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

                  <td style={{ padding: "14px 16px" }}>
                    <Chip label={p.prioridade} color={C.amber} bg={C.amberGlow} />
                  </td>

                  <td style={{ padding: "14px 16px", fontSize: 12, color: C.t2 }}>
                    {p.orcamento}
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: "26px 16px", textAlign: "center", color: C.t3, fontSize: 13 }}>
                  Nenhum projeto encontrado para este filtro.
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
        sub="Ciclo de vida dos projetos · Backlog, Planejamento, Execução, Monitoramento e Encerramento"
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
                    </div>
                  </div>
                );
              })}

              <button
                onClick={abrirNovoRegistro}
                style={{
                  padding: "9px",
                  borderRadius: 8,
                  border: `1px dashed ${C.border}`,
                  background: "transparent",
                  color: C.t3,
                  cursor: "pointer",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                }}
              >
                <Plus size={12} /> Adicionar
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SuppliersView({ C }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionHeader
        title="Gestão de Fornecedores"
        sub="Acompanhamento de fornecedores, SLA e performance"
        actions={[
          <Btn
            key="n"
            label="Novo Fornecedor"
            icon={Plus}
            primary
            C={C}
          />,
        ]}
        C={C}
      />

      <div
        style={{
          ...card(C),
          padding: "24px",
          color: C.t2,
          fontSize: 13,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: C.t1, marginBottom: 8 }}>
          Fornecedores
        </div>

        <div style={{ color: C.t3 }}>
          Tela de fornecedores carregada com sucesso. Depois ajustamos essa área com os dados reais e visual executivo.
        </div>
      </div>
    </div>
  );
}

function IndicatorsView({ C }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <SectionHeader title="Indicadores Executivos" sub="OKRs e métricas estratégicas — Q4 2024" C={C}/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div style={{ ...card(C), padding:"22px 24px", gridColumn:"span 2" }}>
          <div style={{ fontSize:14, fontWeight:600, color:C.t1, marginBottom:18 }}>OKRs Estratégicos 2024</div>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {[
              { ok:"Digitalizar 100% dos processos core",     meta:100, atual:78,   c:C.blue },
              { ok:"Reduzir custos operacionais em 25%",      meta:25,  atual:19.2, c:C.emerald },
              { ok:"Atingir NPS interno ≥ 75",                meta:75,  atual:82,   c:C.violet },
              { ok:"Zero incidentes críticos de segurança",   meta:0,   atual:2,    c:C.rose, inv:true },
              { ok:"Time-to-market < 30 dias",                meta:30,  atual:22,   c:C.amber, inv:true },
            ].map((o,i)=>(
              <div key={i} style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontSize:13, color:C.t2 }}>{o.ok}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:o.c }}>{o.atual} / meta {o.meta}</span>
                </div>
                <ProgressBar val={Math.min(100, o.inv?(o.meta===0?(o.atual===0?100:20):Math.round((1-o.atual/o.meta)*100)):Math.round((o.atual/o.meta)*100))} color={o.c} C={C}/>
              </div>
            ))}
          </div>
        </div>
        <div style={{ ...card(C), padding:"22px 24px" }}>
          <div style={{ fontSize:14, fontWeight:600, color:C.t1, marginBottom:16 }}>ROI por Projeto</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[{ n:"BI & Analytics",v:320,c:C.emerald },{ n:"Cloud Migration",v:185,c:C.blue },{ n:"RPA Financeiro",v:142,c:C.cyan },{ n:"ZeroTrust Sec",v:98,c:C.violet },{ n:"ERP SAP",v:67,c:C.amber }]
              .map((r,i)=>(
                <div key={i} style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
                    <span style={{ color:C.t2 }}>{r.n}</span><span style={{ color:r.c, fontWeight:700 }}>{r.v}%</span>
                  </div>
                  <ProgressBar val={Math.min(100,Math.round(r.v/3.2))} color={r.c} C={C}/>
                </div>
              ))}
          </div>
        </div>
        <div style={{ ...card(C), padding:"22px 24px" }}>
          <div style={{ fontSize:14, fontWeight:600, color:C.t1, marginBottom:16 }}>Maturidade Digital</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[{ d:"Infraestrutura Cloud",n:88 },{ d:"Automação de Processos",n:62 },{ d:"Analytics & BI",n:91 },{ d:"Segurança",n:74 },{ d:"Exp. do Colaborador",n:55 },{ d:"Governança de Dados",n:69 }]
              .map((d,i)=>(
                <div key={i} style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
                    <span style={{ color:C.t2 }}>{d.d}</span>
                    <span style={{ color:d.n>=80?C.emerald:d.n>=65?C.amber:C.rose, fontWeight:700 }}>{d.n}%</span>
                  </div>
                  <ProgressBar val={d.n} color={d.n>=80?C.emerald:d.n>=65?C.amber:C.rose} C={C}/>
                </div>
              ))}
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
    setShowRegister(true);
  }

  function abrirPoc(record) {
    setSelectedRecord(record);
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
        <KPICard icon={AlertTriangle} label="Com condições" value={comCondicoes} sub="Atenção executiva" color={C.amber} glow={C.amberGlow} C={C} />
      </div>

      <div style={{ ...card(C), padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
  { id:"dashboard",  label:"Dashboard",   icon:LayoutDashboard },
  { id:"projects",   label:"Projetos",    icon:FolderKanban    },
  { id:"scrum",      label:"Scrum",      icon:Layers          },
  { id:"poc",        label:"POCs",        icon:FlaskConical, badge:"Novo" },
  { id:"suppliers",  label:"Fornecedores",icon:Globe           },
  { id:"indicators", label:"Indicadores", icon:BarChart3       },
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
          <Settings size={13} color={C.t3} style={{ cursor:"pointer" }}/>
        </div>
      </div>
    </div>
  );
}

// ─── TOPBAR ───────────────────────────────────────────────────────────────────
function Topbar({ page, C, dark, toggleTheme }) {
  const now = new Date().toLocaleDateString("pt-BR",{ day:"2-digit", month:"long", year:"numeric" });
  return (
    <div style={{
      height:54, display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 26px", borderBottom:`1px solid ${C.border}`,
      background:C.bg1, position:"sticky", top:0, zIndex:20,
      transition:"background 0.3s, border-color 0.3s",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, color:C.t3 }}>
        <span style={{ fontWeight:600 }}>Bellinati Perez</span>
        <ChevronRight size={13}/>
        <span style={{ color:C.t1, fontWeight:500 }}>{navItems.find(n=>n.id===page)?.label||"Dashboard"}</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <span style={{ fontSize:11, color:C.t3 }}>{now}</span>
        <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:8, background:C.surface, border:`1px solid ${C.border}`, cursor:"text" }}>
          <Search size={12} color={C.t3}/>
          <span style={{ fontSize:12, color:C.t3 }}>Buscar...</span>
          <span style={{ fontSize:9, color:C.t4, padding:"1px 5px", borderRadius:4, background:C.bg3, marginLeft:18 }}>⌘K</span>
        </div>
        {/* THEME TOGGLE */}
        <button onClick={toggleTheme} style={{
          display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:20,
          border:`1px solid ${C.border}`, background:C.surface, cursor:"pointer",
          color:C.t2, fontSize:12, transition:"all 0.2s",
        }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.borderHov; e.currentTarget.style.color=C.t1; }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.t2; }}
        >
          {dark ? <Sun size={14} color={C.amber}/> : <Moon size={14} color={C.blue}/>}
          <span style={{ fontWeight:500 }}>{dark?"Light":"Dark"}</span>
        </button>
        <div style={{ position:"relative" }}>
          <Bell size={17} color={C.t2} style={{ cursor:"pointer" }}/>
          <span style={{ position:"absolute", top:-3, right:-3, width:7, height:7, borderRadius:"50%", background:C.rose, border:`2px solid ${C.bg1}` }}/>
        </div>
        <div style={{ width:30, height:30, borderRadius:"50%", background:`linear-gradient(135deg,${C.blue},${C.violet})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#fff", cursor:"pointer" }}>EP</div>
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
  const [active, setActive] = useState("dashboard");
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

  const views = { dashboard:Dashboard, projects:ProjectsView, scrum:ScrumView, poc:PocView, suppliers:SuppliersView, indicators:IndicatorsView };
  const View = views[active] || Dashboard;

  return (
    <ThemeCtx.Provider value={{ dark, toggle: toggleTheme }}>
      <div style={{ display:"flex", background:C.bg0, minHeight:"100vh", fontFamily:"'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif", color:C.t1, transition:"background 0.3s" }}>
        <Sidebar active={active} setActive={setActive} C={C}/>
        <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
          <Topbar page={active} C={C} dark={dark} toggleTheme={toggleTheme}/>
          <main style={{ flex:1, padding:26, overflowY:"auto" }}>
            <View C={C}/>
          </main>
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}