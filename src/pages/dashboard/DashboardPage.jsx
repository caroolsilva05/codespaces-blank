import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  useCallback,
  lazy,
  Suspense,
} from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { isSupabaseConfigured, supabase } from "../../services/supabase";
import ScrumProjectRegister from "../../features/scrum";
import PocRegister from "../../features/pocs";
import PortalDashboard from "../../features/portals";
import {
  notifyError,
  notifyInfo,
  notifySuccess,
  notifyWarning,
  requestAppPrompt,
} from "../../shared/notifications";
import {
  describeAppError,
  getMissingFields,
  missingFieldsMessage,
} from "../../shared/errorMessages";
import {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  Settings,
  Bell,
  Search,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Shield,
  Target,
  Activity,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Plus,
  Filter,
  Globe,
  Sun,
  Moon,
  FlaskConical,
  Star,
  Clock,
  Award,
  Users,
  ThumbsUp,
  ThumbsDown,
  FileSearch,
  Megaphone,
  Microscope,
  CircleDot,
  ChevronDown,
  CalendarDays,
  Download,
  RefreshCw,
  Eye,
  ShieldAlert,
  ClipboardList,
  CircleDollarSign,
  CreditCard,
  Handshake,
  Landmark,
  Lightbulb,
  MessageCircle,
} from "lucide-react";

const ErrorBotDashboard = lazy(() => import("../../features/errorBot"));

let databaseConfigWarningShown = false;

function notifyDatabaseConfigMissingOnce() {
  if (databaseConfigWarningShown) return;

  databaseConfigWarningShown = true;
  notifyWarning(
    "O banco de dados ainda não está configurado neste ambiente. Crie um arquivo .env.local com VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY para carregar projetos, POCs e fornecedores.",
    "Banco de dados não configurado",
  );
}

// ---
const THEME_STORAGE_KEY = "bp-theme";
const ThemeCtx = createContext({ dark: false, toggle: () => {} });
const useTheme = () => useContext(ThemeCtx);

const getC = (dark) =>
  dark
    ? {
        // Modo escuro mantendo a identidade rosa/vermelho da plataforma
        bg0: "#0f172a",
        bg1: "#111827",
        bg2: "#1e293b",
        bg3: "#2a1320",
        bg4: "#3f1d2b",
        card: "rgba(15,23,42,0.92)",
        cardHov: "rgba(30,41,59,0.96)",
        surface: "rgba(255,255,255,0.055)",
        border: "rgba(226,232,240,0.12)",
        borderHov: "rgba(248,160,181,0.56)",
        borderStrong: "rgba(226,232,240,0.22)",
        blue: "#e11d48",
        blueD: "#fb7185",
        blueGlow: "rgba(225,29,72,0.18)",
        emerald: "#22c55e",
        emeraldGlow: "rgba(34,197,94,0.16)",
        amber: "#f59e0b",
        amberGlow: "rgba(245,158,11,0.16)",
        rose: "#e11d48",
        roseGlow: "rgba(225,29,72,0.16)",
        violet: "#94a3b8",
        violetGlow: "rgba(148,163,184,0.14)",
        cyan: "#38bdf8",
        cyanGlow: "rgba(56,189,248,0.12)",
        t1: "#f8fafc",
        t2: "#cbd5e1",
        t3: "#94a3b8",
        t4: "#64748b",
        sidebarW: 264,
        scrollbar: "#334155",
      }
    : {
        // Identidade clara corporativa: cinzas azulados + destaque rosa
        bg0: "#f2f4f8",
        bg1: "#ffffff",
        bg2: "#f8fafc",
        bg3: "#fef2f5",
        bg4: "#ffe7ef",
        card: "#ffffff",
        cardHov: "#ffffff",
        surface: "#f8fafc",
        border: "#e2e8f0",
        borderHov: "#f8a0b5",
        borderStrong: "#cbd5e1",
        blue: "#e11d48",
        blueD: "#be123c",
        blueGlow: "rgba(225,29,72,0.10)",
        emerald: "#059669",
        emeraldGlow: "rgba(5,150,105,0.10)",
        amber: "#D97706",
        amberGlow: "rgba(217,119,6,0.10)",
        rose: "#e11d48",
        roseGlow: "#ffe7ef",
        violet: "#334155",
        violetGlow: "rgba(51,65,85,0.10)",
        cyan: "#64748b",
        cyanGlow: "rgba(100,116,139,0.10)",
        t1: "#0f172a",
        t2: "#64748b",
        t3: "#94a3b8",
        t4: "#cbd5e1",
        sidebarW: 264,
        scrollbar: "#cbd5e1",
      };

async function readThemePreference() {
  if (typeof window === "undefined") return null;

  try {
    const result = await window.storage?.get?.(THEME_STORAGE_KEY);
    if (result?.value === "dark" || result?.value === "light") {
      return result.value;
    }
  } catch {}

  try {
    const value = window.localStorage?.getItem(THEME_STORAGE_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

async function saveThemePreference(theme) {
  if (typeof window === "undefined") return;

  try {
    await window.storage?.set?.(THEME_STORAGE_KEY, theme);
  } catch {}

  try {
    window.localStorage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {}
}

function applyThemePreference(isDark) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
}

// ---
const roiData = [
  { m: "Jan", roi: 12, meta: 10 },
  { m: "Fev", roi: 19, meta: 12 },
  { m: "Mar", roi: 15, meta: 13 },
  { m: "Abr", roi: 28, meta: 15 },
  { m: "Mai", roi: 24, meta: 16 },
  { m: "Jun", roi: 32, meta: 18 },
  { m: "Jul", roi: 38, meta: 20 },
  { m: "Ago", roi: 35, meta: 22 },
  { m: "Set", roi: 42, meta: 24 },
  { m: "Out", roi: 48, meta: 26 },
  { m: "Nov", roi: 52, meta: 28 },
  { m: "Dez", roi: 61, meta: 30 },
];
const prodData = [
  { m: "Jan", prod: 74 },
  { m: "Fev", prod: 78 },
  { m: "Mar", prod: 72 },
  { m: "Abr", prod: 83 },
  { m: "Mai", prod: 87 },
  { m: "Jun", prod: 85 },
  { m: "Jul", prod: 91 },
  { m: "Ago", prod: 89 },
  { m: "Set", prod: 93 },
  { m: "Out", prod: 96 },
  { m: "Nov", prod: 94 },
  { m: "Dez", prod: 97 },
];
const deliveryData = [
  { m: "Jan", ok: 18, atr: 4 },
  { m: "Fev", ok: 22, atr: 3 },
  { m: "Mar", ok: 20, atr: 6 },
  { m: "Abr", ok: 26, atr: 2 },
  { m: "Mai", ok: 24, atr: 4 },
  { m: "Jun", ok: 30, atr: 2 },
  { m: "Jul", ok: 28, atr: 3 },
  { m: "Ago", ok: 32, atr: 1 },
  { m: "Set", ok: 35, atr: 2 },
  { m: "Out", ok: 38, atr: 1 },
  { m: "Nov", ok: 36, atr: 3 },
  { m: "Dez", ok: 40, atr: 1 },
];
const slaData = [
  { name: "Conformidade", value: 94, fill: "#16a34a" },
  { name: "Violações", value: 6, fill: "#e11d48" },
];
const projects = [
  {
    id: "BP-001",
    name: "Migração Cloud AWS",
    status: "Em Andamento",
    prog: 72,
    resp: "Ana Lima",
    prazo: "28/02/25",
    prioridade: "Alta",
    orcamento: "R$ 1.2M",
    risco: "Médio",
  },
  {
    id: "BP-002",
    name: "ERP SAP S/4HANA",
    status: "Em Andamento",
    prog: 48,
    resp: "Carlos Melo",
    prazo: "30/06/25",
    prioridade: "Crítica",
    orcamento: "R$ 4.8M",
    risco: "Alto",
  },
  {
    id: "BP-003",
    name: "BI & Analytics Platform",
    status: "Concluído",
    prog: 100,
    resp: "Marina Costa",
    prazo: "15/01/25",
    prioridade: "Alta",
    orcamento: "R$ 780K",
    risco: "Baixo",
  },
  {
    id: "BP-004",
    name: "Automação RPA Financeiro",
    status: "Em Andamento",
    prog: 31,
    resp: "Pedro Rocha",
    prazo: "15/04/25",
    prioridade: "Média",
    orcamento: "R$ 320K",
    risco: "Baixo",
  },
  {
    id: "BP-005",
    name: "Portal do Colaborador",
    status: "Planejamento",
    prog: 8,
    resp: "Juliana Dias",
    prazo: "31/08/25",
    prioridade: "Média",
    orcamento: "R$ 560K",
    risco: "Baixo",
  },
  {
    id: "BP-006",
    name: "Cibersegurança ZeroTrust",
    status: "Em Andamento",
    prog: 55,
    resp: "Rafael Nunes",
    prazo: "30/05/25",
    prioridade: "Crítica",
    orcamento: "R$ 2.1M",
    risco: "Alto",
  },
];
const kanbanCols = [
  {
    id: "backlog",
    label: "Backlog",
    color: "#64748b",
    items: [
      { id: "k1", title: "Integração API Legado", tag: "Backend", p: "Média" },
      { id: "k2", title: "Plano DR & BCP", tag: "Infra", p: "Alta" },
    ],
  },
  {
    id: "progress",
    label: "Em Progresso",
    color: "#e11d48",
    items: [
      {
        id: "k3",
        title: "Dashboard Executivo BI",
        tag: "Analytics",
        p: "Alta",
      },
      {
        id: "k4",
        title: "Migração Banco de Dados",
        tag: "Infra",
        p: "Crítica",
      },
      { id: "k5", title: "Treinamento Change Mgmt", tag: "People", p: "Média" },
    ],
  },
  {
    id: "review",
    label: "Em Revisão",
    color: "#d97706",
    items: [
      { id: "k6", title: "Documentação Técnica SAP", tag: "ERP", p: "Alta" },
      { id: "k7", title: "UAT Módulo Financeiro", tag: "QA", p: "Crítica" },
    ],
  },
  {
    id: "done",
    label: "Concluído",
    color: "#16a34a",
    items: [
      {
        id: "k8",
        title: "Arquitetura Cloud Definida",
        tag: "Infra",
        p: "Alta",
      },
      { id: "k9", title: "Contrato AWS Enterprise", tag: "Compras", p: "Alta" },
    ],
  },
];
const suppliers = [
  {
    name: "AWS Amazon",
    cat: "Cloud",
    sla: 99.9,
    score: 98,
    contrato: "R$ 1.8M/ano",
    status: "Ativo",
    venc: "Dez/25",
  },
  {
    name: "SAP Brasil",
    cat: "ERP",
    sla: 97.2,
    score: 91,
    contrato: "R$ 2.4M/ano",
    status: "Ativo",
    venc: "Jun/26",
  },
  {
    name: "Deloitte Tech",
    cat: "Consultoria",
    sla: 95.5,
    score: 88,
    contrato: "R$ 960K/ano",
    status: "Ativo",
    venc: "Mar/25",
  },
  {
    name: "Palo Alto Networks",
    cat: "Segurança",
    sla: 99.5,
    score: 96,
    contrato: "R$ 480K/ano",
    status: "Ativo",
    venc: "Out/25",
  },
  {
    name: "UiPath",
    cat: "RPA",
    sla: 98.1,
    score: 92,
    contrato: "R$ 220K/ano",
    status: "Ativo",
    venc: "Abr/26",
  },
  {
    name: "Power BI Premium",
    cat: "Analytics",
    sla: 99.0,
    score: 94,
    contrato: "R$ 180K/ano",
    status: "Ativo",
    venc: "Jan/26",
  },
];
const activities = [
  {
    time: "Agora",
    icon: CheckCircle2,
    color: "#16a34a",
    text: "Entrega concluída: Módulo BI Analytics v2.3",
  },
  {
    time: "2h",
    icon: AlertTriangle,
    color: "#d97706",
    text: "Alerta: SLA SAP abaixo de 98% no período",
  },
  {
    time: "4h",
    icon: Zap,
    color: "#e11d48",
    text: "Deploy realizado: Portal Colaborador — Homologação",
  },
  {
    time: "6h",
    icon: Shield,
    color: "#334155",
    text: "Relatório de segurança ZeroTrust gerado",
  },
  {
    time: "8h",
    icon: Target,
    color: "#64748b",
    text: "OKR Q1/2025 atualizado — 87% de aderência",
  },
  {
    time: "1d",
    icon: Users,
    color: "#dc2626",
    text: "Reunião Steering Committee agendada",
  },
  {
    time: "2d",
    icon: Package,
    color: "#16a34a",
    text: "Contrato Deloitte renovado com novos SLA",
  },
];

// ---
const pocs = [
  {
    id: "POC-001",
    name: "Snowflake Data Cloud",
    supplier: "Snowflake Inc.",
    resp: "Marina Costa",
    cat: "Analytics",
    start: "02/01/25",
    end: "31/01/25",
    status: "Aprovado",
    roiEsp: 180,
    score: 94,
    tecnico: 92,
    funcional: 95,
    financeiro: 88,
    estrategico: 96,
    orcamento: "R$ 48K",
    result:
      "Excelente performance em queries complexas. Integração nativa com AWS aprovada.",
    criterios: [
      "Performance",
      "Escalabilidade",
      "Custo-benefício",
      "Integração",
    ],
  },
  {
    id: "POC-002",
    name: "ServiceNow ITSM",
    supplier: "ServiceNow",
    resp: "Rafael Nunes",
    cat: "ITSM",
    start: "05/01/25",
    end: "20/02/25",
    status: "Em Avaliação",
    roiEsp: 140,
    score: 78,
    tecnico: 82,
    funcional: 75,
    financeiro: 70,
    estrategico: 84,
    orcamento: "R$ 32K",
    result:
      "Customizações avançadas em análise. Dependência de módulos adicionais identificada.",
    criterios: ["Automação", "Relatórios", "Integrações", "UX"],
  },
  {
    id: "POC-003",
    name: "Databricks Lakehouse",
    supplier: "Databricks",
    resp: "Carlos Melo",
    cat: "Data Eng.",
    start: "10/01/25",
    end: "28/02/25",
    status: "Em Teste",
    roiEsp: 220,
    score: 81,
    tecnico: 88,
    funcional: 80,
    financeiro: 72,
    estrategico: 82,
    orcamento: "R$ 55K",
    result:
      "Testes de carga em andamento. Pipeline de dados 40% mais eficiente.",
    criterios: ["Processamento", "ML/IA", "Custo compute", "Governança"],
  },
  {
    id: "POC-004",
    name: "CrowdStrike Falcon",
    supplier: "CrowdStrike",
    resp: "Ana Lima",
    cat: "Segurança",
    start: "08/12/24",
    end: "07/01/25",
    status: "Aprovado",
    roiEsp: 310,
    score: 97,
    tecnico: 98,
    funcional: 96,
    financeiro: 94,
    estrategico: 99,
    orcamento: "R$ 28K",
    result:
      "Zero falsos positivos em 30 dias. Detection rate de 99,98%. Aprovado sem ressalvas.",
    criterios: ["Detecção", "Response", "Falsos positivos", "Cobertura"],
  },
  {
    id: "POC-005",
    name: "Workday HCM",
    supplier: "Workday",
    resp: "Juliana Dias",
    cat: "RH Digital",
    start: "15/11/24",
    end: "15/12/24",
    status: "Reprovado",
    roiEsp: 90,
    score: 52,
    tecnico: 60,
    funcional: 48,
    financeiro: 44,
    estrategico: 56,
    orcamento: "R$ 40K",
    result:
      "Custo de implementação 3x acima do estimado. Customização limitada para legislação BR.",
    criterios: ["Aderência BR", "Customização", "TCO", "Suporte local"],
  },
  {
    id: "POC-006",
    name: "Mulesoft Integration",
    supplier: "Salesforce",
    resp: "Pedro Rocha",
    cat: "Integration",
    start: "20/01/25",
    end: "28/02/25",
    status: "Em Teste",
    roiEsp: 165,
    score: 71,
    tecnico: 75,
    funcional: 72,
    financeiro: 65,
    estrategico: 70,
    orcamento: "R$ 36K",
    result:
      "APIs críticas mapeadas. Latência dentro do SLA. Documentação em elaboração.",
    criterios: ["APIs", "Latência", "Monitoramento", "Escalabilidade"],
  },
];

const pocAprovData = [
  { m: "Out/24", total: 2, aprov: 1 },
  { m: "Nov/24", total: 3, aprov: 2 },
  { m: "Dez/24", total: 4, aprov: 3 },
  { m: "Jan/25", total: 6, aprov: 4 },
];
const pocRoiData = pocs
  .filter((p) => p.status === "Aprovado" || p.status === "Em Avaliação")
  .map((p) => ({
    name: p.supplier.split(" ")[0],
    roi: p.roiEsp,
    score: p.score,
  }));
const pocPerfData = pocs.map((p) => ({
  name: p.supplier.split(" ")[0],
  Tecnico: p.tecnico,
  Funcional: p.funcional,
  Financeiro: p.financeiro,
  Estrategico: p.estrategico,
}));

// ---
const scoreColor = (s, C) => (s >= 90 ? C.emerald : s >= 70 ? C.amber : C.rose);
const pocStatusConf = (C) => ({
  Aprovado: { color: C.emerald, bg: C.emeraldGlow },
  Reprovado: { color: C.rose, bg: C.roseGlow },
  "Em Teste": { color: C.blue, bg: C.blueGlow },
  "Em Avaliação": { color: C.amber, bg: C.amberGlow },
});
const projStatusConf = (C) => ({
  "Em Andamento": { color: C.blue, bg: C.blueGlow },
  "Concluído": { color: C.emerald, bg: C.emeraldGlow },
  Planejamento: { color: C.violet, bg: C.violetGlow },
  Ativo: { color: C.emerald, bg: C.emeraldGlow },
  Pausado: { color: C.amber, bg: C.amberGlow },
});
const priConf = (C) => ({
  "Crítica": { c: C.rose, b: C.roseGlow },
  Alta: { c: C.amber, b: C.amberGlow },
  "Média": { c: C.blue, b: C.blueGlow },
  Baixa: { c: C.t3, b: C.card },
});

// ---
const Chip = ({ label, color, bg, border }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "3px 9px",
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.02em",
      color,
      background: bg,
      border: `1px solid ${border || color + "33"}`,
    }}
  >
    {label}
  </span>
);

const formatPct = (value) =>
  `${Number(value || 0)
    .toFixed(1)
    .replace(".", ",")}%`;

const ProgressBar = ({ val, color, C }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div
      style={{
        flex: 1,
        height: 5,
        background: `linear-gradient(90deg, ${C.bg3}, ${C.bg2})`,
        borderRadius: 99,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${val}%`,
          height: "100%",
          background: color,
          borderRadius: 99,
          boxShadow: `0 0 6px ${color}44`,
          transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
    </div>
    <span
      style={{ fontSize: 12, color: C.t2, minWidth: 42, textAlign: "right" }}
    >
      {formatPct(val)}
    </span>
  </div>
);

const ScoreRing = ({ val, C, size = 56 }) => {
  const r = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const dash = (val / 100) * circ;
  const col = scoreColor(val, C);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={C.bg3}
          strokeWidth={4}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={col}
          strokeWidth={4}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 700,
          color: col,
        }}
      >
        {val}
      </div>
    </div>
  );
};

const KPICard = ({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  trendVal,
  color,
  glow,
  C,
}) => (
  <div
    style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: "var(--radius-md)",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: 16,
      position: "relative",
      overflow: "hidden",
      boxShadow: "var(--shadow-card)",
      transition: "var(--transition-base)",
      backdropFilter: "blur(8px)",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = C.borderHov;
      e.currentTarget.style.background = C.cardHov;
      e.currentTarget.style.boxShadow = "var(--shadow-hover)";
      e.currentTarget.style.transform = "translateY(-2px)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = C.border;
      e.currentTarget.style.background = C.card;
      e.currentTarget.style.boxShadow = "var(--shadow-card)";
      e.currentTarget.style.transform = "translateY(0)";
    }}
  >
    <div
      style={{
        position: "absolute",
        top: -20,
        right: -20,
        width: 100,
        height: 100,
        borderRadius: "50%",
        background: glow,
        filter: "blur(32px)",
        pointerEvents: "none",
      }}
    />
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          padding: 9,
          borderRadius: 10,
          background: glow,
          border: `1px solid ${color}28`,
          boxShadow: `0 2px 8px ${color}28`,
        }}
      >
        <Icon size={17} color={color} />
      </div>
      {trendVal && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 12,
            fontWeight: 700,
            color: trend === "up" ? C.emerald : C.rose,
            background: trend === "up" ? C.emeraldGlow : C.roseGlow,
            border: `1px solid ${trend === "up" ? C.emerald : C.rose}24`,
            borderRadius: 999,
            padding: "4px 8px",
          }}
        >
          {trend === "up" ? (
            <ArrowUpRight size={13} />
          ) : (
            <ArrowDownRight size={13} />
          )}{" "}
          {trendVal}
        </div>
      )}
    </div>
    <div>
      <div
        style={{
          fontSize: 30,
          fontWeight: 700,
          color: C.t1,
          fontFamily: "'Inter', sans-serif",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 13, color: C.t2, marginTop: 6, fontWeight: 600 }}>{label}</div>
      {sub && (
        <div style={{ fontSize: 12, color: C.t3, marginTop: 4, lineHeight: 1.45 }}>{sub}</div>
      )}
    </div>
  </div>
);

const CT = ({ active, payload, label, C }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: C.bg2,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: "12px 14px",
        backdropFilter: "blur(12px)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div style={{ fontSize: 12, color: C.t3, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div
          key={i}
          style={{
            fontSize: 13,
            color: C.t1,
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 2,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: p.color,
            }}
          />
          <span style={{ color: C.t2 }}>{p.name}:</span>
          <span style={{ fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const SectionHeader = ({ title, sub, actions, C, sticky = false, stickyTop = 0 }) => (
  <div
    style={{
      position: sticky ? "sticky" : "relative",
      top: sticky ? stickyTop : "auto",
      zIndex: sticky ? 80 : "auto",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 16,
      flexWrap: "wrap",
      padding: sticky ? "12px 0" : 0,
      marginBottom: 16,
      background: sticky ? C.bg0 : "transparent",
      boxShadow: sticky ? `0 12px 26px ${C.bg0}f2` : "none",
    }}
  >
    <div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: C.t1,
          letterSpacing: 0,
          lineHeight: 1.2,
        }}
      >
        {title}
      </div>
      {sub && (
        <div style={{ fontSize: 13, color: C.t3, marginTop: 6, lineHeight: 1.55 }}>{sub}</div>
      )}
    </div>
    {actions && <div style={{ display: "flex", gap: 10 }}>{actions}</div>}
  </div>
);

const Btn = ({ label, icon: Icon, primary, onClick, C }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      minHeight: 40,
      padding: "9px 16px",
      borderRadius: 10,
      border: `1px solid ${primary ? "transparent" : C.border}`,
      background: primary ? C.blue : C.card,
      color: primary ? "#fff" : C.t2,
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer",
      transition: "var(--transition-base)",
      boxShadow: primary ? `0 10px 22px ${C.blue}24` : "0 1px 2px rgba(15,23,42,0.04)",
    }}
    onMouseEnter={(e) => {
      if (primary) {
        e.currentTarget.style.opacity = "0.88";
        e.currentTarget.style.transform = "translateY(-1px)";
      } else {
        e.currentTarget.style.borderColor = C.borderHov;
        e.currentTarget.style.background = C.blueGlow;
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.opacity = "1";
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.borderColor = primary ? "transparent" : C.border;
      e.currentTarget.style.background = primary ? C.blue : C.card;
    }}
  >
    {Icon && <Icon size={14} />} {label}
  </button>
);

const card = (C) => ({
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  backdropFilter: "blur(8px)",
  boxShadow: "var(--shadow-card)",
  transition: "var(--transition-base)",
});
const inputStyle = (C) => ({
  width: "100%",
  minHeight: 42,
  background: C.surface,
  border: `1px solid ${C.border}`,
  color: C.t1,
  borderRadius: 12,
  padding: "11px 13px",
  fontSize: 13,
  outline: "none",
  boxShadow: "0 1px 2px rgba(15,23,42,0.03)",
});
// ---
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
    return `${Number(value || 0)
      .toFixed(1)
      .replace(".", ",")}%`;
  }

  function normalizarEtapa(etapa) {
    if (!etapa) return "Backlog";
    const texto = String(etapa).toLowerCase();

    if (
      texto.includes("backlog") ||
      texto.includes("início") ||
      texto.includes("inicio")
    )
      return "Backlog";
    if (texto.includes("plane")) return "Planejamento";
    if (texto.includes("exec") || texto.includes("andamento"))
      return "Execução";
    if (texto.includes("monitor")) return "Monitoramento";
    if (texto.includes("encer") || texto.includes("concl"))
      return "Encerramento";

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
      { totalMensagens: 0, entregue: 0, lido: 0, retorno: 0, acordos: 0 },
    );

    return {
      ...totals,
      entrega:
        totals.totalMensagens > 0
          ? (totals.entregue / totals.totalMensagens) * 100
          : 0,
      leitura:
        totals.totalMensagens > 0
          ? (totals.lido / totals.totalMensagens) * 100
          : 0,
      conversao:
        totals.totalMensagens > 0
          ? (totals.acordos / totals.totalMensagens) * 100
          : 0,
    };
  }

  function getPocStatus(record) {
    return (
      record?.status || record?.record_data?.general?.status || "Em avaliação"
    );
  }

  function getPocRecommendation(record) {
    return (
      record?.recommendation ||
      record?.record_data?.evaluation?.recommendation ||
      "Em avaliação"
    );
  }

  async function carregarDashboard() {
    if (!isSupabaseConfigured) {
      setLoading(false);
      notifyDatabaseConfigMissingOnce();
      return;
    }

    setLoading(true);

    const [projectsRes, pocsRes, suppliersRes] = await Promise.all([
      supabase.from("registros_do_projeto_scrum").select("*"),
      supabase.from("poc_records").select("*"),
      supabase.from("fornecedores").select("*"),
    ]);

    if (projectsRes.error) {
      console.log("Erro ao carregar projetos no dashboard:", projectsRes.error);
      notifyError(
        describeAppError(projectsRes.error, {
          action: "carregar",
          subject: "painel de projetos",
        }),
        "Erro ao carregar dados",
      );
    }
    if (pocsRes.error) {
      console.log("Erro ao carregar POC no dashboard:", pocsRes.error);
      notifyError(
        describeAppError(pocsRes.error, {
          action: "carregar",
          subject: "painel de POCs",
        }),
        "Erro ao carregar dados",
      );
    }
    if (suppliersRes.error) {
      console.log(
        "Erro ao carregar fornecedores no dashboard:",
        suppliersRes.error,
      );
      notifyError(
        describeAppError(suppliersRes.error, {
          action: "carregar",
          subject: "painel de fornecedores",
        }),
        "Erro ao carregar dados",
      );
    }

    const projetosNormalizados = (projectsRes.data || []).map((registro) => {
      const dados = registro.dados_do_registro || registro.record_data || {};
      const info = dados.projectInfo || {};

      return {
        id: registro.id,
        name:
          registro.nome_do_projeto ||
          registro.project_name ||
          info.nome ||
          "Projeto sem nome",
        responsible:
          registro.responsavel ||
          registro.responsible ||
          info.responsavel ||
          "-",
        current_stage:
          registro.fase_atual ||
          registro.current_phase ||
          info.faseAtual ||
          "Backlog",
        status:
          registro.fase_atual ||
          registro.current_phase ||
          info.faseAtual ||
          "Backlog",
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
  const projetosExecucao = projetos.filter(
    (p) => normalizarEtapa(p.current_stage || p.status) === "Execução",
  ).length;
  const projetosMonitoramento = projetos.filter(
    (p) => normalizarEtapa(p.current_stage || p.status) === "Monitoramento",
  ).length;
  const projetosEncerrados = projetos.filter(
    (p) => normalizarEtapa(p.current_stage || p.status) === "Encerramento",
  ).length;
  const projetosAtrasados = projetos.filter((p) => {
    const etapa = normalizarEtapa(p.current_stage || p.status);
    return p.end_date && p.end_date < hoje && etapa !== "Encerramento";
  }).length;

  const progressoMedio =
    totalProjetos > 0
      ? Math.round(
          projetos.reduce(
            (acc, p) => acc + progressoPorEtapa(p.current_stage || p.status),
            0,
          ) / totalProjetos,
        )
      : 0;

  const etapasProjeto = [
    "Backlog",
    "Planejamento",
    "Execução",
    "Monitoramento",
    "Encerramento",
  ].map((etapa) => {
    const qtd = projetos.filter(
      (p) => normalizarEtapa(p.current_stage || p.status) === etapa,
    ).length;
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
  const pocsExecucao = pocsRegistros.filter(
    (p) => getPocStatus(p) === "Em Execução",
  ).length;
  const pocsCondicoes = pocsRegistros.filter(
    (p) => getPocRecommendation(p) === "Aprovado com condições",
  ).length;

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
    { totalMensagens: 0, entregue: 0, lido: 0, retorno: 0, acordos: 0 },
  );

  const pocEntrega =
    pocTotals.totalMensagens > 0
      ? (pocTotals.entregue / pocTotals.totalMensagens) * 100
      : 0;
  const pocLeitura =
    pocTotals.totalMensagens > 0
      ? (pocTotals.lido / pocTotals.totalMensagens) * 100
      : 0;
  const pocConversao =
    pocTotals.totalMensagens > 0
      ? (pocTotals.acordos / pocTotals.totalMensagens) * 100
      : 0;

  const totalFornecedores = fornecedoresDb.length;
  const fornecedoresAtivos = fornecedoresDb.filter(
    (f) => f.status === "Ativo",
  ).length;
  const fornecedoresAltoRisco = fornecedoresDb.filter(
    (f) => f.risco === "Alto",
  ).length;
  const incidentesFornecedores = fornecedoresDb.reduce(
    (acc, f) => acc + toNum(f.incidentes_abertos),
    0,
  );
  const scoreMedioFornecedor =
    totalFornecedores > 0
      ? Math.round(
          fornecedoresDb.reduce(
            (acc, f) => acc + toNum(f.performance_score),
            0,
          ) / totalFornecedores,
        )
      : 0;

  const scoreProjetos = totalProjetos ? progressoMedio : 0;
  const scorePocs = totalPocs
    ? Math.min(
        100,
        pocEntrega * 0.45 +
          pocLeitura * 0.45 +
          Math.min(100, pocConversao * 30) * 0.1,
      )
    : 0;
  const scoreFornecedores = totalFornecedores ? scoreMedioFornecedor : 0;

  const totalAlertas =
    projetosAtrasados +
    pocsCondicoes +
    fornecedoresAltoRisco +
    incidentesFornecedores;
  const scoreRisco = Math.max(0, 100 - Math.min(100, totalAlertas * 18));

  const scoresValidos = [
    totalProjetos ? scoreProjetos : null,
    totalPocs ? scorePocs : null,
    totalFornecedores ? scoreFornecedores : null,
    scoreRisco,
  ].filter((s) => s !== null);

  const saudeGeral = scoresValidos.length
    ? Math.round(
        scoresValidos.reduce((acc, item) => acc + item, 0) /
          scoresValidos.length,
      )
    : 0;

  const saudeColor =
    saudeGeral >= 80 ? C.emerald : saudeGeral >= 60 ? C.amber : C.rose;

  const radarData = [
    { eixo: "Projetos", valor: scoreProjetos },
    { eixo: "POC", valor: Math.round(scorePocs) },
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

  const topFornecedor = [...fornecedoresDb].sort(
    (a, b) => toNum(b.performance_score) - toNum(a.performance_score),
  )[0];

  const decisionItems = [
    {
      label: "Prioridade de gestão",
      value: totalAlertas > 0 ? "Acompanhar alertas" : "Operação estável",
      color: totalAlertas > 0 ? C.rose : C.emerald,
    },
    {
      label: "Projetos em foco",
      value:
        projetosAtrasados > 0
          ? `${projetosAtrasados} atrasado(s)`
          : `${projetosExecucao + projetosMonitoramento} em andamento`,
      color: projetosAtrasados > 0 ? C.rose : C.blue,
    },
    {
      label: "Validações",
      value:
        totalPocs > 0
          ? `${totalPocs} POC(s) cadastrada(s)`
          : "Sem POC cadastrada",
      color: C.violet,
    },
    {
      label: "Fornecedor destaque",
      value: topFornecedor
        ? `${topFornecedor.nome} · ${toNum(topFornecedor.performance_score)}%`
        : "Sem fornecedor",
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
        sticky
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.35fr 0.65fr",
          gap: 16,
        }}
      >
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
          <div
            style={{
              position: "absolute",
              top: -70,
              right: -60,
              width: 210,
              height: 210,
              borderRadius: "50%",
              background: C.blueGlow,
              filter: "blur(20px)",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: C.t3,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 900,
                  }}
                >
                  Saúde operacional
                </div>
                <div
                  style={{
                    fontSize: 64,
                    lineHeight: 1,
                    fontWeight: 950,
                    color: saudeColor,
                    marginTop: 8,
                  }}
                >
                  {saudeGeral}%
                </div>
                <div
                  style={{
                    fontSize: 15,
                    color: C.t1,
                    fontWeight: 900,
                    marginTop: 8,
                  }}
                >
                  {saudeGeral >= 80
                    ? "Operação saudável"
                    : saudeGeral >= 60
                      ? "Atenção moderada"
                      : "Atenção crítica"}
                </div>
              </div>

              <Chip
                label={`${totalAlertas} alerta(s)`}
                color={totalAlertas > 0 ? C.rose : C.emerald}
                bg={totalAlertas > 0 ? C.roseGlow : C.emeraldGlow}
              />
            </div>

            <div
              style={{
                marginTop: 24,
                maxWidth: 780,
                fontSize: 14,
                color: C.t2,
                lineHeight: 1.7,
              }}
            >
              A plataforma consolida projetos, POC e fornecedores em uma visão
              única para tomada de decisão. Hoje existem{" "}
              <strong style={{ color: C.t1 }}>{totalProjetos}</strong> projetos,
              <strong style={{ color: C.t1 }}> {totalPocs}</strong> POC(s) e
              <strong style={{ color: C.t1 }}> {totalFornecedores}</strong>{" "}
              fornecedor(es) cadastrados.
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 10,
                marginTop: 24,
              }}
            >
              {[
                ["Projetos", totalProjetos, C.blue],
                ["POC", totalPocs, C.violet],
                ["Fornecedores", totalFornecedores, C.emerald],
                [
                  "Alertas",
                  totalAlertas,
                  totalAlertas > 0 ? C.rose : C.emerald,
                ],
              ].map(([label, value, color]) => (
                <div
                  key={label}
                  style={{
                    background: C.bg3,
                    border: `1px solid ${C.border}`,
                    borderRadius: 14,
                    padding: "13px 14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: C.t3,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontWeight: 900,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      color,
                      fontWeight: 950,
                      marginTop: 4,
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ ...card(C), padding: "22px 24px", minHeight: 245 }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: C.t1,
              marginBottom: 4,
            }}
          >
            Radar de Saúde
          </div>
          <div style={{ fontSize: 12, color: C.t3, marginBottom: 10 }}>
            Equilíbrio entre operação, validações e risco
          </div>

          <ResponsiveContainer width="100%" height={185}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={C.border} />
              <PolarAngleAxis
                dataKey="eixo"
                tick={{ fill: C.t2, fontSize: 11 }}
              />
              <Radar
                dataKey="valor"
                stroke={saudeColor}
                fill={saudeColor}
                fillOpacity={0.22}
                strokeWidth={2}
              />
              <Tooltip formatter={(v) => `${v}%`} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 14,
        }}
      >
        <KPICard
          icon={FolderKanban}
          label="Projetos em andamento"
          value={projetosExecucao + projetosMonitoramento}
          sub={`${projetosEncerrados} encerrado(s)`}
          color={C.blue}
          glow={C.blueGlow}
          C={C}
        />
        <KPICard
          icon={FlaskConical}
          label="POC registrada"
          value={totalPocs}
          sub={`${pocsExecucao} em execução`}
          color={C.violet}
          glow={C.violetGlow}
          C={C}
        />
        <KPICard
          icon={Users}
          label="Fornecedores ativos"
          value={fornecedoresAtivos}
          sub={`Score médio ${scoreMedioFornecedor}%`}
          color={C.emerald}
          glow={C.emeraldGlow}
          C={C}
        />
        <KPICard
          icon={AlertTriangle}
          label="Pontos de atenção"
          value={totalAlertas}
          sub={
            totalAlertas > 0 ? "Exigem acompanhamento" : "Sem alertas críticos"
          }
          color={totalAlertas > 0 ? C.rose : C.emerald}
          glow={totalAlertas > 0 ? C.roseGlow : C.emeraldGlow}
          C={C}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 16,
        }}
      >
        <div style={{ ...card(C), padding: "22px 24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: C.t1 }}>
                Distribuição do Portfólio
              </div>
              <div style={{ fontSize: 12, color: C.t3, marginTop: 3 }}>
                Projetos por etapa do ciclo de vida
              </div>
            </div>
            <Chip
              label={`${totalProjetos} projeto(s)`}
              color={C.blue}
              bg={C.blueGlow}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "210px 1fr",
              gap: 18,
              alignItems: "center",
            }}
          >
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
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 5,
                    }}
                  >
                    <span
                      style={{ fontSize: 12, color: C.t2, fontWeight: 900 }}
                    >
                      {item.name}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: item.fill,
                        fontWeight: 900,
                      }}
                    >
                      {item.qtd} · {pct(item.perc)}
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
                        background: item.fill,
                        borderRadius: 999,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ ...card(C), padding: "22px 24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: C.t1 }}>
                Funil Consolidado das POC
              </div>
              <div style={{ fontSize: 12, color: C.t3, marginTop: 3 }}>
                Leitura visual do desempenho das validações
              </div>
            </div>
            <Chip
              label={pct(pocEntrega)}
              color={C.emerald}
              bg={C.emeraldGlow}
            />
          </div>

          <ResponsiveContainer width="100%" height={205}>
            <BarChart
              data={funnelData}
              layout="vertical"
              margin={{ left: 16, right: 30 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={C.border}
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fill: C.t3, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="etapa"
                tick={{ fill: C.t2, fontSize: 11, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
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
          <div
            style={{
              fontSize: 17,
              fontWeight: 900,
              color: C.t1,
              marginBottom: 4,
            }}
          >
            Decisões Executivas
          </div>
          <div style={{ fontSize: 12, color: C.t3, marginBottom: 16 }}>
            Pontos que orientam a condução da liderança
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            {decisionItems.map((item) => (
              <div
                key={item.label}
                style={{
                  background: `${item.color}12`,
                  border: `1px solid ${item.color}36`,
                  borderRadius: 14,
                  padding: "14px 15px",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: C.t3,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 900,
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: item.color,
                    fontWeight: 950,
                    marginTop: 7,
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...card(C), padding: "22px 24px" }}>
          <div
            style={{
              fontSize: 17,
              fontWeight: 900,
              color: C.t1,
              marginBottom: 4,
            }}
          >
            Performance de Fornecedores
          </div>
          <div style={{ fontSize: 12, color: C.t3, marginBottom: 16 }}>
            Visão resumida da base cadastrada
          </div>

          {topFornecedor ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 14, color: C.t1, fontWeight: 950 }}>
                    {topFornecedor.nome}
                  </div>
                  <div style={{ fontSize: 11, color: C.t3, marginTop: 3 }}>
                    Fornecedor com melhor score cadastrado
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 34,
                    color: scoreMedioFornecedor >= 80 ? C.emerald : C.amber,
                    fontWeight: 950,
                  }}
                >
                  {scoreMedioFornecedor}%
                </div>
              </div>

              <div
                style={{
                  height: 8,
                  background: C.bg3,
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.max(0, Math.min(100, scoreMedioFornecedor))}%`,
                    height: "100%",
                    background:
                      scoreMedioFornecedor >= 80
                        ? C.emerald
                        : scoreMedioFornecedor >= 60
                          ? C.amber
                          : C.rose,
                    borderRadius: 999,
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 10,
                  marginTop: 8,
                }}
              >
                <div
                  style={{
                    background: C.bg3,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: C.t3,
                      textTransform: "uppercase",
                    }}
                  >
                    Ativos
                  </div>
                  <div
                    style={{ fontSize: 20, color: C.emerald, fontWeight: 950 }}
                  >
                    {fornecedoresAtivos}
                  </div>
                </div>
                <div
                  style={{
                    background: C.bg3,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: C.t3,
                      textTransform: "uppercase",
                    }}
                  >
                    Alto risco
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      color: fornecedoresAltoRisco > 0 ? C.rose : C.emerald,
                      fontWeight: 950,
                    }}
                  >
                    {fornecedoresAltoRisco}
                  </div>
                </div>
                <div
                  style={{
                    background: C.bg3,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: C.t3,
                      textTransform: "uppercase",
                    }}
                  >
                    Incidentes
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      color: incidentesFornecedores > 0 ? C.rose : C.emerald,
                      fontWeight: 950,
                    }}
                  >
                    {incidentesFornecedores}
                  </div>
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
  const etapasCiclo = [
    "Backlog",
    "Planejamento",
    "Execução",
    "Monitoramento",
    "Encerramento",
  ];

  const [filter, setFilter] = useState("Todos");
  const [projectView, setProjectView] = useState("executive");
  const [showProjectRegister, setShowProjectRegister] = useState(false);
  const [selectedProjectRecord, setSelectedProjectRecord] = useState(null);
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

    if (
      texto.includes("backlog") ||
      texto.includes("início") ||
      texto.includes("inicio")
    )
      return "Backlog";
    if (texto.includes("plane")) return "Planejamento";
    if (texto.includes("exec") || texto.includes("andamento"))
      return "Execução";
    if (texto.includes("monitor")) return "Monitoramento";
    if (texto.includes("encer") || texto.includes("concl"))
      return "Encerramento";

    return "Backlog";
  }

  function calcularProgressoPorEtapa(etapa) {
    const etapas = {
      Backlog: 10,
      "Inicio": 10,
      Planejamento: 30,
      "Execucao": 60,
      Monitoramento: 85,
      Encerramento: 100,
    };

    return etapas[normalizarEtapa(etapa)] || 0;
  }

  function corEtapa(etapa) {
    const etapaNormalizada = normalizarEtapa(etapa);

    if (etapaNormalizada === "Backlog") return { color: C.t3, bg: C.bg3 };
    if (etapaNormalizada === "Planejamento")
      return { color: C.violet, bg: C.violetGlow };
    if (etapaNormalizada === "Execução")
      return { color: C.blue, bg: C.blueGlow };
    if (etapaNormalizada === "Monitoramento")
      return { color: C.amber, bg: C.amberGlow };
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
    const dataA = new Date(
      a.data || a.realizado || a.prazo || a.updated_at || a.criado_em || 0,
    ).getTime();
    const dataB = new Date(
      b.data || b.realizado || b.prazo || b.updated_at || b.criado_em || 0,
    ).getTime();

    if (dataA !== dataB) return dataB - dataA;

    return Number(b.id || 0) - Number(a.id || 0);
  }

  function getUltimaAtualizacao(registro) {
    const dados = getDados(registro);
    const relatorios = Array.isArray(dados.phase4?.relatorioStatus)
      ? dados.phase4.relatorioStatus
      : [];

    const validos = relatorios
      .filter(
        (item) =>
          item &&
          (String(item.statusGeral || "").trim() ||
            String(item.feito || "").trim() ||
            String(item.proximos || "").trim()),
      )
      .sort(ordenarPorDataOuId);

    if (validos.length === 0) {
      const dadosInfo = getProjectInfo(registro);
      return dadosInfo.status
        ? `Status: ${dadosInfo.status}`
        : "Sem atualização registrada";
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
      .filter(
        (item) =>
          item &&
          (String(item.atividade || "").trim() ||
            String(item.tarefa || "").trim() ||
            String(item.status || "").trim()),
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
      registro.responsavel || registro.responsible || info.responsavel || "-";

    const fornecedor =
      registro.fornecedor || registro.supplier || info.fornecedor || "-";

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
      registroOriginal: registro,
      updatedAt:
        registro.updated_at ||
        registro.atualizado_em ||
        registro.created_at ||
        registro.criado_em ||
        "",
    };
  }

  async function carregarProjetosDoScrum() {
    if (!isSupabaseConfigured) {
      setLoadingProjects(false);
      notifyDatabaseConfigMissingOnce();
      return;
    }

    setLoadingProjects(true);

    const { data, error } = await supabase
      .from("registros_do_projeto_scrum")
      .select("*");

    setLoadingProjects(false);

    if (error) {
      console.log("Erro ao carregar projetos a partir do Scrum:", error);
      notifyError(
        describeAppError(error, {
          action: "carregar",
          subject: "projetos do Scrum",
        }),
        "Erro ao carregar projetos",
      );
      return;
    }

    const registrosOrdenados = [...(data || [])].sort((a, b) => {
      const dataA = new Date(
        a.updated_at || a.atualizado_em || a.created_at || a.criado_em || 0,
      ).getTime();
      const dataB = new Date(
        b.updated_at || b.atualizado_em || b.created_at || b.criado_em || 0,
      ).getTime();
      return dataB - dataA;
    });

    setScrumProjects(registrosOrdenados.map(normalizarRegistroScrum));
  }

  useEffect(() => {
    carregarProjetosDoScrum();
  }, []);

  async function sincronizarVisualizacoesDeProjetos() {
    await carregarProjetosDoScrum();
  }

  async function alterarVisualizacaoDeProjeto(viewId) {
    setProjectView(viewId === "scrum" ? "kanban" : viewId);
    await carregarProjetosDoScrum();
  }

  function abrirNovoProjeto() {
    setSelectedProjectRecord(null);
    setShowProjectRegister(true);
  }

  function abrirProjetoExistente(projeto) {
    if (!projeto?.registroOriginal) return;

    setSelectedProjectRecord(projeto.registroOriginal);
    setShowProjectRegister(true);
  }

  async function fecharNovoProjeto() {
    setShowProjectRegister(false);
    setSelectedProjectRecord(null);
    await sincronizarVisualizacoesDeProjetos();
  }

  async function salvarNovoProjeto() {
    await sincronizarVisualizacoesDeProjetos();
    setProjectView("kanban");
    setSelectedProjectRecord(null);
    setShowProjectRegister(false);
  }

  const sourceProjects = scrumProjects;

  const filtered =
    filter === "Todos"
      ? sourceProjects
      : sourceProjects.filter((p) => normalizarEtapa(p.etapa) === filter);

  const totalPorFiltro = filters.reduce((acc, item) => {
    if (item === "Todos") {
      acc[item] = sourceProjects.length;
    } else {
      acc[item] = sourceProjects.filter(
        (p) => normalizarEtapa(p.etapa) === item,
      ).length;
    }

    return acc;
  }, {});

  const projectViewOptions = [
    { id: "executive", label: "Executivo", icon: BarChart3 },
    { id: "kanban", label: "Kanban", icon: FolderKanban },
    { id: "timeline", label: "Timeline", icon: Clock },
    { id: "calendar", label: "Calendário", icon: CalendarDays },
  ];

  const projetosEmExecucao = sourceProjects.filter(
    (p) => normalizarEtapa(p.etapa) === "Execução",
  ).length;
  const projetosConcluidos = sourceProjects.filter(
    (p) => normalizarEtapa(p.etapa) === "Encerramento",
  ).length;
  const projetosAtencao = sourceProjects.filter((p) =>
    ["Atenção", "Atencao", "Atrasado"].includes(String(p.statusGeral || "")),
  ).length;
  const progressoMedio =
    sourceProjects.length > 0
      ? Math.round(
          sourceProjects.reduce((acc, p) => acc + Number(p.prog || 0), 0) /
            sourceProjects.length,
        )
      : 0;

  const projetosComPrazo = filtered
    .map((projeto) => ({
      ...projeto,
      prazoDate:
        projeto.prazo && projeto.prazo !== "-"
          ? new Date(
              String(projeto.prazo).includes("/")
                ? String(projeto.prazo).split("/").reverse().join("-")
                : projeto.prazo,
            )
          : null,
    }))
    .filter((projeto) => projeto.prazoDate && !Number.isNaN(projeto.prazoDate.getTime()))
    .sort((a, b) => {
      const dateDiff = a.prazoDate - b.prazoDate;
      if (dateDiff !== 0) return dateDiff;

      const prioridade = { Atrasado: 0, "Atenção": 1, Atencao: 1 };
      const prioridadeA = prioridade[a.statusGeral] ?? 2;
      const prioridadeB = prioridade[b.statusGeral] ?? 2;
      if (prioridadeA !== prioridadeB) return prioridadeA - prioridadeB;

      return String(a.name || "").localeCompare(String(b.name || ""));
    });

  const hojeCarteira = new Date();
  hojeCarteira.setHours(0, 0, 0, 0);

  const totalCarteiraExecutiva = filtered.length;
  const projetosConcluidosExecutivo = filtered.filter(
    (p) => normalizarEtapa(p.etapa) === "Encerramento",
  ).length;
  const projetosEmMovimento = filtered.filter((p) =>
    ["Planejamento", "Execução", "Monitoramento"].includes(
      normalizarEtapa(p.etapa),
    ),
  ).length;
  const projetosComPrazoAberto = projetosComPrazo.filter(
    (p) => normalizarEtapa(p.etapa) !== "Encerramento",
  );
  const prazosVencidos = projetosComPrazoAberto.filter(
    (p) => p.prazoDate < hojeCarteira,
  );
  const proximos30Dias = projetosComPrazoAberto.filter((p) => {
    const diffDias = Math.ceil(
      (p.prazoDate.getTime() - hojeCarteira.getTime()) / 86400000,
    );
    return diffDias >= 0 && diffDias <= 30;
  });
  const chavesPrazosVencidos = new Set(prazosVencidos.map(getProjectKey));
  const projetosComRiscoExecutivo = filtered.filter((p) => {
    const status = String(p.statusGeral || "");
    return (
      ["Atenção", "Atencao", "Atrasado"].includes(status) ||
      chavesPrazosVencidos.has(getProjectKey(p))
    );
  }).length;
  const proximoPrazoExecutivo =
    projetosComPrazoAberto.find((p) => p.prazoDate >= hojeCarteira) ||
    prazosVencidos[0] ||
    null;
  const percentualEntregaExecutivo = totalCarteiraExecutiva
    ? Math.round((projetosConcluidosExecutivo / totalCarteiraExecutiva) * 100)
    : 0;

  const statusCarteiraExecutiva =
    totalCarteiraExecutiva === 0
      ? { label: "Sem carteira", color: C.t3 }
      : projetosComRiscoExecutivo > 0
        ? { label: "Atenção executiva", color: C.rose }
        : projetosConcluidosExecutivo === totalCarteiraExecutiva
          ? { label: "Carteira concluída", color: C.emerald }
          : { label: "Carteira sob controle", color: C.emerald };

  const metricasExecutivasAutomaticas = [
    {
      label: "Risco",
      value: projetosComRiscoExecutivo,
      detail:
        prazosVencidos.length > 0
          ? `${prazosVencidos.length} prazo(s) vencido(s)`
          : `${proximos30Dias.length} prazo(s) em 30 dias`,
      color: projetosComRiscoExecutivo > 0 ? C.rose : C.emerald,
    },
    {
      label: "Em movimento",
      value: projetosEmMovimento,
      detail: "Planejamento, execução ou monitoramento",
      color: C.blue,
    },
    {
      label: "Entrega",
      value: `${percentualEntregaExecutivo}%`,
      detail: `${projetosConcluidosExecutivo}/${totalCarteiraExecutiva || 0} concluído(s)`,
      color: percentualEntregaExecutivo === 100 ? C.emerald : C.amber,
    },
    {
      label: "Próximo prazo",
      value: proximoPrazoExecutivo ? proximoPrazoExecutivo.prazo : "-",
      detail: proximoPrazoExecutivo
        ? proximoPrazoExecutivo.prazoDate < hojeCarteira
          ? `Vencido: ${proximoPrazoExecutivo.name}`
          : proximoPrazoExecutivo.name
        : "Sem prazo cadastrado",
      color: proximoPrazoExecutivo ? corEtapa(proximoPrazoExecutivo.etapa).color : C.t3,
    },
  ];

  const projetosPorEtapa = etapasCiclo.map((etapa) => {
    const total = sourceProjects.filter(
      (projeto) => normalizarEtapa(projeto.etapa) === etapa,
    ).length;

    return {
      etapa,
      total,
      perc: sourceProjects.length
        ? Math.round((total / sourceProjects.length) * 100)
        : 0,
      cores: corEtapa(etapa),
    };
  });

  const projetosExecutivos = [...filtered]
    .sort((a, b) => {
      const prioridade = { Atrasado: 0, "Atenção": 1, Atencao: 1 };
      const prioridadeA = prioridade[a.statusGeral] ?? 2;
      const prioridadeB = prioridade[b.statusGeral] ?? 2;

      if (prioridadeA !== prioridadeB) return prioridadeA - prioridadeB;
      return Number(a.prog || 0) - Number(b.prog || 0);
    })
    .slice(0, 6);

  function statusProjetoStyle(status) {
    if (status === "Atrasado") return { color: C.rose, bg: C.roseGlow };
    if (status === "Atenção" || status === "Atencao")
      return { color: C.amber, bg: C.amberGlow };
    return { color: C.emerald, bg: C.emeraldGlow };
  }

  function ProjectMiniCard({ projeto, accent, onClick }) {
    return (
      <div
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        title={onClick ? "Abrir projeto para edição" : undefined}
        onClick={onClick}
        onKeyDown={(e) => {
          if (!onClick) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        onMouseEnter={(e) => {
          if (!onClick) return;
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.borderColor = `${accent}66`;
          e.currentTarget.style.borderLeftColor = accent;
        }}
        onMouseLeave={(e) => {
          if (!onClick) return;
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.borderColor = C.border;
          e.currentTarget.style.borderLeftColor = accent;
        }}
        style={{
          ...card(C),
          padding: 13,
          borderLeft: `4px solid ${accent}`,
          boxShadow: "0 8px 20px rgba(15,23,42,0.055)",
          cursor: onClick ? "pointer" : "default",
          transition: "transform 0.15s, border-color 0.2s",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 850, color: C.t1, lineHeight: 1.35 }}>
          {projeto.name}
        </div>
        <div style={{ fontSize: 11, color: C.t3, marginTop: 6 }}>
          {projeto.id} · {projeto.resp}
        </div>
        <div style={{ marginTop: 10 }}>
          <ProgressBar val={projeto.prog} color={accent} C={C} />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
            marginTop: 10,
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 11, color: C.t3 }}>{projeto.prazo}</span>
          <Chip
            label={projeto.statusGeral}
            color={projeto.statusGeral === "Atrasado" ? C.rose : projeto.statusGeral === "Atenção" ? C.amber : C.emerald}
            bg={projeto.statusGeral === "Atrasado" ? C.roseGlow : projeto.statusGeral === "Atenção" ? C.amberGlow : C.emeraldGlow}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {showProjectRegister && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: C.bg0,
            overflow: "auto",
          }}
        >
          <button
            onClick={fecharNovoProjeto}
            style={{
              position: "fixed",
              top: 18,
              right: 22,
              zIndex: 10000,
              background: "linear-gradient(135deg, #334155, #1f2937)",
              color: "#ffffff",
              border: "none",
              borderRadius: 8,
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(15, 23, 42, 0.14)",
            }}
          >
            Fechar Cadastro
          </button>

          <ScrumProjectRegister
            registroInicial={selectedProjectRecord}
            onSaved={salvarNovoProjeto}
            onClose={fecharNovoProjeto}
          />
        </div>
      )}

      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 90,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: "12px 0",
          background: C.bg0,
          boxShadow: `0 14px 28px ${C.bg0}f2`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.t1 }}>
              Gestão de Projetos
            </div>
            <div style={{ fontSize: 13, color: C.t3, marginTop: 4 }}>
              {loadingProjects
                ? "Carregando projetos..."
                : `${filtered.length} projetos · Visualizações executivas, Kanban, Timeline e Calendário`}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              position: "relative",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <Chip
              label="Fonte única: Projetos"
              color={C.emerald}
              bg={C.emeraldGlow}
            />

            <Btn
              label="Novo Projeto"
              icon={Plus}
              primary
              C={C}
              onClick={abrirNovoProjeto}
            />

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
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.t1,
                    marginBottom: 10,
                  }}
                >
                  Filtrar por status do ciclo
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {filters.map((f) => {
                    const active = filter === f;
                    const cores =
                      f === "Todos"
                        ? { color: C.blue, bg: C.blueGlow }
                        : corEtapa(f);

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
                        <span
                          style={{
                            fontSize: 10,
                            color: active ? cores.color : C.t3,
                          }}
                        >
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

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            padding: 4,
            border: `1px solid ${C.border}`,
            background: C.surface,
            borderRadius: 12,
            width: "fit-content",
          }}
        >
          {projectViewOptions.map((option) => {
            const Icon = option.icon;
            const active = projectView === option.id;

            return (
              <button
                key={option.id}
                onClick={() => alterarVisualizacaoDeProjeto(option.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  minHeight: 34,
                  padding: "7px 13px",
                  borderRadius: 9,
                  border: `1px solid ${active ? C.blue : "transparent"}`,
                  background: active ? C.blueGlow : "transparent",
                  color: active ? C.blue : C.t2,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: active ? 800 : 650,
                }}
              >
                <Icon size={14} />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {projectView === "executive" && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            {[
              {
                label: "Total de projetos",
                value: sourceProjects.length,
                color: C.blue,
                bg: C.blueGlow,
              },
              {
                label: "Em execução",
                value: projetosEmExecucao,
                color: C.violet,
                bg: C.violetGlow,
              },
              {
                label: "Atenção",
                value: projetosAtencao,
                color: projetosAtencao > 0 ? C.rose : C.emerald,
                bg: projetosAtencao > 0 ? C.roseGlow : C.emeraldGlow,
              },
              {
                label: "Concluídos",
                value: projetosConcluidos,
                color: C.emerald,
                bg: C.emeraldGlow,
              },
              {
                label: "Progresso médio",
                value: `${progressoMedio}%`,
                color: C.amber,
                bg: C.amberGlow,
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  ...card(C),
                  padding: "14px 16px",
                  background: C.surface,
                  borderColor: C.border,
                  borderTop: `3px solid ${item.color}`,
                  boxShadow: "0 6px 16px rgba(15,23,42,0.035)",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: C.t3,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: 24,
                    color: C.t1,
                    fontWeight: 800,
                    marginTop: 8,
                    lineHeight: 1,
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 14,
              alignItems: "stretch",
            }}
          >
            <div style={{ ...card(C), padding: 18 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 14,
                  alignItems: "flex-start",
                  marginBottom: 16,
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.t1 }}>
                    Resumo executivo
                  </div>
                  <div style={{ fontSize: 12, color: C.t3, marginTop: 3 }}>
                    Atualizado automaticamente pelos projetos cadastrados
                  </div>
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    color: statusCarteiraExecutiva.color,
                    fontSize: 12,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: statusCarteiraExecutiva.color,
                    }}
                  />
                  {statusCarteiraExecutiva.label}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: 10,
                  padding: "2px 0 16px",
                  borderBottom: `1px solid ${C.border}`,
                  marginBottom: 4,
                }}
              >
                {metricasExecutivasAutomaticas.map((item) => (
                  <div
                    key={item.label}
                    style={{
                      borderLeft: `3px solid ${item.color}`,
                      padding: "4px 10px",
                      minHeight: 58,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: C.t3,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        color: C.t1,
                        fontSize: 19,
                        fontWeight: 800,
                        lineHeight: 1.1,
                        marginTop: 5,
                      }}
                    >
                      {item.value}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: C.t3,
                        marginTop: 4,
                        lineHeight: 1.35,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={item.detail}
                    >
                      {item.detail}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                {projetosExecutivos.map((projeto) => {
                  const etapa = normalizarEtapa(projeto.etapa);
                  const cores = corEtapa(etapa);
                  const statusStyle = statusProjetoStyle(projeto.statusGeral);

                  return (
                    <div
                      key={getProjectKey(projeto)}
                      role="button"
                      tabIndex={0}
                      title="Abrir projeto para edição"
                      onClick={() => abrirProjetoExistente(projeto)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          abrirProjetoExistente(projeto);
                        }
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = C.bg0;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                        gap: 12,
                        alignItems: "center",
                        padding: "13px 0",
                        borderTop: `1px solid ${C.border}`,
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            color: C.t1,
                            fontWeight: 750,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={projeto.name}
                        >
                          {projeto.name}
                        </div>
                        <div style={{ fontSize: 11, color: C.t3, marginTop: 4 }}>
                          {projeto.id} · {projeto.fornecedor}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 7,
                          color: C.t2,
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: cores.color,
                          }}
                        />
                        {etapa}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 8,
                            fontSize: 11,
                            color: C.t3,
                            marginBottom: 6,
                          }}
                        >
                          <span>{projeto.resp}</span>
                          <span style={{ color: C.t2, fontWeight: 700 }}>
                            {projeto.prog}%
                          </span>
                        </div>
                        <ProgressBar val={projeto.prog} color={cores.color} C={C} />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          color: statusStyle.color,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {projeto.statusGeral}
                      </div>
                    </div>
                  );
                })}

                {projetosExecutivos.length === 0 && (
                  <div
                    style={{
                      borderTop: `1px solid ${C.border}`,
                      paddingTop: 14,
                      color: C.t3,
                      fontSize: 13,
                    }}
                  >
                    Nenhum projeto encontrado para o filtro atual.
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ ...card(C), padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.t1 }}>
                  Distribuição por etapa
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 14 }}>
                  {projetosPorEtapa.map((item) => (
                    <div key={item.etapa}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 11,
                          color: C.t2,
                          fontWeight: 500,
                          marginBottom: 6,
                        }}
                      >
                        <span>{item.etapa}</span>
                        <span style={{ color: C.t3 }}>
                          {item.total} · {item.perc}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: 6,
                          borderRadius: 999,
                          background: C.bg3,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${item.perc}%`,
                            height: "100%",
                            background: item.cores.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ ...card(C), padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.t1 }}>
                  Próximos prazos
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: 8 }}>
                  {projetosComPrazo.slice(0, 4).map((projeto) => {
                    const cores = corEtapa(projeto.etapa);

                    return (
                      <div
                        key={getProjectKey(projeto)}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "86px 1fr",
                          gap: 12,
                          alignItems: "center",
                          borderTop: `1px solid ${C.border}`,
                          padding: "11px 0",
                        }}
                      >
                        <div
                          style={{
                            color: cores.color,
                            borderLeft: `3px solid ${cores.color}`,
                            paddingLeft: 8,
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {projeto.prazo}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 12,
                              color: C.t1,
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={projeto.name}
                          >
                            {projeto.name}
                          </div>
                          <div style={{ fontSize: 11, color: C.t3, marginTop: 3 }}>
                            {normalizarEtapa(projeto.etapa)} · {projeto.resp}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {projetosComPrazo.length === 0 && (
                    <div style={{ color: C.t3, fontSize: 13, paddingTop: 8 }}>
                      Nenhum prazo cadastrado nos projetos filtrados.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {projectView !== "scrum" && projectView !== "executive" && (
        <>
      <div
        style={{
          ...card(C),
          padding: "12px 14px",
          borderColor: C.blue + "33",
          background: C.blueGlow,
        }}
      >
        <div style={{ fontSize: 12, color: C.blue, fontWeight: 900 }}>
          Integração ativa
        </div>
        <div
          style={{ fontSize: 12, color: C.t2, marginTop: 4, lineHeight: 1.5 }}
        >
          Esta tela é somente uma visão consolidada. Para criar ou alterar um
          projeto, use o botão Novo Projeto. Qualquer projeto salvo aparece
          automaticamente no Kanban e nas demais visualizações.
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {filters.map((f) => {
          const active = filter === f;
          const cores =
            f === "Todos" ? { color: C.blue, bg: C.blueGlow } : corEtapa(f);

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

      {projectView === "kanban" && (
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
          {etapasCiclo.map((etapa) => {
            const cores = corEtapa(etapa);
            const projetosDaEtapa = filtered.filter(
              (projeto) => normalizarEtapa(projeto.etapa) === etapa,
            );

            return (
              <div key={etapa} style={{ minWidth: 220 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: 8,
                    background: cores.bg,
                    border: `1px solid ${cores.color}33`,
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 900, color: cores.color }}>
                    {etapa}
                  </span>
                  <span style={{ fontSize: 11, color: cores.color, fontWeight: 900 }}>
                    {projetosDaEtapa.length}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {projetosDaEtapa.map((projeto) => (
                    <ProjectMiniCard
                      key={getProjectKey(projeto)}
                      projeto={projeto}
                      accent={cores.color}
                      onClick={() => abrirProjetoExistente(projeto)}
                    />
                  ))}

                  {projetosDaEtapa.length === 0 && (
                    <div
                      style={{
                        border: `1px dashed ${C.border}`,
                        borderRadius: 10,
                        padding: 16,
                        textAlign: "center",
                        color: C.t3,
                        fontSize: 12,
                      }}
                    >
                      Sem projetos
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {projectView === "timeline" && (
        <div style={{ ...card(C), padding: 18 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "180px 1fr 82px",
              gap: 12,
              fontSize: 11,
              color: C.t3,
              fontWeight: 900,
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            <span>Projeto</span>
            <span>Linha do tempo</span>
            <span>Prazo</span>
          </div>

          {filtered.map((projeto) => {
            const cores = corEtapa(projeto.etapa);

            return (
              <div
                key={getProjectKey(projeto)}
                role="button"
                tabIndex={0}
                title="Abrir projeto para edição"
                onClick={() => abrirProjetoExistente(projeto)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    abrirProjetoExistente(projeto);
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = C.bg0;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "180px 1fr 82px",
                  gap: 12,
                  alignItems: "center",
                  padding: "12px 0",
                  borderTop: `1px solid ${C.border}`,
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, color: C.t1, fontWeight: 850 }}>
                    {projeto.name}
                  </div>
                  <div style={{ fontSize: 11, color: C.t3, marginTop: 2 }}>
                    {projeto.resp}
                  </div>
                </div>
                <div
                  style={{
                    height: 26,
                    borderRadius: 999,
                    background: C.bg3,
                    overflow: "hidden",
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max(8, projeto.prog)}%`,
                      height: "100%",
                      background: `linear-gradient(90deg, ${cores.color}, ${C.emerald})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      paddingRight: 10,
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 900,
                    }}
                  >
                    {projeto.prog}%
                  </div>
                </div>
                <div style={{ fontSize: 12, color: C.t2 }}>{projeto.prazo}</div>
              </div>
            );
          })}
        </div>
      )}

      {projectView === "calendar" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {projetosComPrazo.map((projeto) => {
            const cores = corEtapa(projeto.etapa);
            const dia = projeto.prazoDate.toLocaleDateString("pt-BR", { day: "2-digit" });
            const mes = projeto.prazoDate.toLocaleDateString("pt-BR", { month: "short" });

            return (
              <div
                key={getProjectKey(projeto)}
                role="button"
                tabIndex={0}
                title="Abrir projeto para edição"
                onClick={() => abrirProjetoExistente(projeto)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    abrirProjetoExistente(projeto);
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.borderColor = `${cores.color}66`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = C.border;
                }}
                style={{
                  ...card(C),
                  padding: 14,
                  cursor: "pointer",
                  transition: "transform 0.15s, border-color 0.2s",
                }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div
                    style={{
                      width: 48,
                      height: 52,
                      borderRadius: 8,
                      border: `1px solid ${cores.color}44`,
                      background: cores.bg,
                      display: "grid",
                      placeItems: "center",
                      color: cores.color,
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ textAlign: "center", lineHeight: 1 }}>
                      <div style={{ fontSize: 18, fontWeight: 950 }}>{dia}</div>
                      <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase" }}>
                        {mes}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: C.t1, fontWeight: 850 }}>
                      {projeto.name}
                    </div>
                    <div style={{ fontSize: 11, color: C.t3, marginTop: 4 }}>
                      {normalizarEtapa(projeto.etapa)} · {projeto.resp}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {projetosComPrazo.length === 0 && (
            <div style={{ ...card(C), padding: 24, color: C.t3, fontSize: 13 }}>
              Nenhum prazo encontrado para o filtro atual.
            </div>
          )}
        </div>
      )}

      {projectView === "list" && (
      <div
        style={{
          ...card(C),
          padding: 0,
          overflowX: "auto",
          overflowY: "hidden",
        }}
      >
        <table
          style={{ width: "100%", minWidth: 1080, borderCollapse: "collapse" }}
        >
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {[
                "ID",
                "Projeto",
                "Responsável",
                "Status do Ciclo",
                "Progresso",
                "Prazo",
                "Observação",
              ].map((h, i) => (
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
                    : statusSubtarefa === "Parado" ||
                        statusSubtarefa === "Atrasado"
                      ? { color: C.rose, bg: C.roseGlow }
                      : { color: C.t3, bg: C.bg3 };

              const prioridadeSubtarefa = p.subtarefa.prioridade || "Baixa";
              const prioridadeStyle =
                prioridadeSubtarefa === "Alta"
                  ? { color: C.violet, bg: C.violetGlow }
                  : prioridadeSubtarefa === "Média" ||
                      prioridadeSubtarefa === "Media"
                    ? { color: C.blue, bg: C.blueGlow }
                    : { color: C.t3, bg: C.bg3 };

              const projectKey = getProjectKey(p);
              const subtarefaAberta = !!expandedTasks[projectKey];

              return (
                <React.Fragment key={projectKey}>
                  <tr
                    onClick={() => abrirProjetoExistente(p)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = C.bg0;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                    title="Abrir projeto para edição"
                    style={{
                      borderBottom: `1px solid ${C.border}`,
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                  >
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: 12,
                        color: C.t3,
                      }}
                    >
                      {p.id}
                    </td>

                    <td style={{ padding: "14px 16px", minWidth: 220 }}>
                      <div
                        style={{ fontSize: 13, color: C.t1, fontWeight: 800 }}
                      >
                        {p.name}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginTop: 6,
                          flexWrap: "wrap",
                        }}
                      >
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
                            background: subtarefaAberta
                              ? C.blueGlow
                              : C.surface,
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
                          <span>{subtarefaAberta ? "-" : "+"}</span>
                          {subtarefaAberta
                            ? "Ocultar subtarefa"
                            : "Ver subtarefa"}
                        </button>
                      </div>
                    </td>

                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: 12,
                        color: C.t2,
                      }}
                    >
                      {p.resp}
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <Chip
                        label={etapaAtual}
                        color={cores.color}
                        bg={cores.bg}
                      />
                    </td>

                    <td style={{ padding: "14px 16px", minWidth: 140 }}>
                      <ProgressBar
                        val={p.prog}
                        color={p.prog === 100 ? C.emerald : cores.color}
                        C={C}
                      />
                    </td>

                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: 12,
                        color: C.t2,
                      }}
                    >
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
                      <td
                        colSpan={7}
                        style={{
                          padding: "0 14px 14px 44px",
                          background: C.bg0,
                        }}
                      >
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
                            <span style={{ fontSize: 14 }}>{">"}</span>
                            Última tarefa atualizada no Scrum
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "32px 1.8fr 0.9fr 0.9fr 0.85fr 0.85fr",
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
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={
                                  statusSubtarefa === "Concluída" ||
                                  statusSubtarefa === "Feito"
                                }
                                readOnly
                                style={{
                                  width: 13,
                                  height: 13,
                                  accentColor: C.emerald,
                                }}
                              />
                            </div>
                            <div style={{ padding: "0 10px" }}>Tarefa</div>
                            <div
                              style={{
                                padding: "0 10px",
                                borderLeft: `1px solid ${C.border}`,
                              }}
                            >
                              Responsável
                            </div>
                            <div
                              style={{
                                padding: "0 10px",
                                borderLeft: `1px solid ${C.border}`,
                              }}
                            >
                              Status
                            </div>
                            <div
                              style={{
                                padding: "0 10px",
                                borderLeft: `1px solid ${C.border}`,
                              }}
                            >
                              Prazo
                            </div>
                            <div
                              style={{
                                padding: "0 10px",
                                borderLeft: `1px solid ${C.border}`,
                              }}
                            >
                              Prioridade
                            </div>
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "32px 1.8fr 0.9fr 0.9fr 0.85fr 0.85fr",
                              alignItems: "center",
                              minHeight: 42,
                              fontSize: 12,
                              color: C.t2,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={
                                  statusSubtarefa === "Concluída" ||
                                  statusSubtarefa === "Feito"
                                }
                                readOnly
                                style={{
                                  width: 13,
                                  height: 13,
                                  accentColor: C.emerald,
                                }}
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

                            <div
                              style={{
                                padding: "0 10px",
                                borderLeft: `1px solid ${C.border}`,
                              }}
                            >
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

                            <div
                              style={{
                                padding: "0 10px",
                                borderLeft: `1px solid ${C.border}`,
                              }}
                            >
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
                </React.Fragment>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: "26px 16px",
                    textAlign: "center",
                    color: C.t3,
                    fontSize: 13,
                  }}
                >
                  Nenhum projeto encontrado no Scrum para este filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}
        </>
      )}
    </div>
  );
}

function ScrumView({ C, embedded = false, onProjectsChanged }) {
  const [showScrumRegister, setShowScrumRegister] = useState(false);
  const [selectedScrumRecord, setSelectedScrumRecord] = useState(null);
  const [scrumRecords, setScrumRecords] = useState([]);
  const [loadingScrum, setLoadingScrum] = useState(false);

  const isAdminScrum = (() => {
    try {
      return (
        (window.localStorage.getItem("bp-demo-email") || "").toLowerCase() ===
        "teste@digital.com.br"
      );
    } catch {
      return false;
    }
  })();

  async function carregarRegistrosScrum() {
    if (!isSupabaseConfigured) {
      setLoadingScrum(false);
      notifyDatabaseConfigMissingOnce();
      return;
    }

    setLoadingScrum(true);

    const { data, error } = await supabase
      .from("registros_do_projeto_scrum")
      .select("*");

    setLoadingScrum(false);

    if (error) {
      console.log("Erro ao carregar registros Scrum:", error);
      notifyError(
        describeAppError(error, {
          action: "carregar",
          subject: "registros do Scrum",
        }),
        "Erro ao carregar Scrum",
      );
      return;
    }

    const registrosOrdenados = [...(data || [])].sort((a, b) => {
      const dataA = new Date(
        a.created_at || a.criado_em || a.updated_at || a.atualizado_em || 0,
      ).getTime();
      const dataB = new Date(
        b.created_at || b.criado_em || b.updated_at || b.atualizado_em || 0,
      ).getTime();
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

  async function sincronizarRegistrosScrum() {
    await carregarRegistrosScrum();
    if (onProjectsChanged) {
      await onProjectsChanged();
    }
  }

  async function fecharRegistro() {
    setShowScrumRegister(false);
    setSelectedScrumRecord(null);
    await sincronizarRegistrosScrum();
  }

  async function salvarRegistroScrum() {
    await sincronizarRegistrosScrum();
  }

  async function excluirRegistroScrum(registro, nomeProjeto) {
    if (!isAdminScrum) {
      notifyWarning("Apenas administradores podem excluir registros do Scrum.");
      return;
    }

    if (!registro?.id) {
      notifyError(
        "Não foi possível excluir este projeto porque o registro não possui ID. Atualize a página e tente novamente.",
      );
      return;
    }

    const senhaAdmin = await requestAppPrompt({
      title: "Confirmar exclusão",
      message: `Para excluir o projeto "${nomeProjeto}", informe sua senha de administrador.`,
      label: "Senha de administrador",
      type: "password",
      confirmLabel: "Excluir projeto",
    });

    if (senhaAdmin !== "Teste@2026") {
      notifyWarning("Senha de administrador inválida. Exclusão cancelada.");
      return;
    }

    const { data, error } = await supabase
      .from("registros_do_projeto_scrum")
      .delete()
      .eq("id", registro.id)
      .select("id");

    if (error) {
      console.log("Erro ao excluir registro Scrum:", error);
      notifyError(
        describeAppError(error, { action: "excluir", subject: "projeto" }),
      );
      return;
    }

    if (!data || data.length === 0) {
      notifyWarning(
        "Nenhum registro foi excluído. Verifique se o projeto ainda existe ou se há permissão de exclusão.",
      );
      return;
    }

    setScrumRecords((prev) =>
      prev.filter((item) => String(item.id) !== String(registro.id)),
    );

    notifySuccess("Projeto excluído com sucesso.");

    await sincronizarRegistrosScrum();
  }

  const fases = [
    "Backlog",
    "Planejamento",
    "Execução",
    "Monitoramento",
    "Encerramento",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {showScrumRegister && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: C.bg0,
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
              background: "linear-gradient(135deg, #334155, #1f2937)",
              color: "#ffffff",
              border: "none",
              borderRadius: 8,
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(15, 23, 42, 0.14)",
            }}
          >
            Fechar Registro
          </button>

          <ScrumProjectRegister
            registroInicial={selectedScrumRecord}
            onSaved={salvarRegistroScrum}
            onClose={fecharRegistro}
          />
        </div>
      )}

      <SectionHeader
        title={embedded ? "Visualização Scrum" : "Scrum de Projetos"}
        sub={embedded ? "Quadro operacional dentro de Projetos" : "Ciclo de vida dos projetos"}
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
        sticky={!embedded}
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
            const dados =
              registro.dados_do_registro || registro.record_data || {};
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
                const dados =
                  registro.dados_do_registro || registro.record_data || {};
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
                      <div
                        style={{ fontSize: 10, color: C.t3, marginBottom: 8 }}
                      >
                        {codigo}
                      </div>
                    )}

                    <div
                      style={{ fontSize: 11, color: C.t3, marginBottom: 10 }}
                    >
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

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
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
    monitoringShots: {
      rows: [
        {
          id: 1,
          du: "",
          data: "",
          disparos: "",
          retornos: "",
          percentualRetornos: "",
          valorBase: "",
          qtdAcordos: "",
          valorAcordo: "",
        },
      ],
    },
    monitoringConversion: {
      disparado: "",
      cancelado: "",
      entregue: "",
      lido: "",
      naoEntregue: "",
      retorno: "",
      intencaoPagamento: "",
      acordoFormalizado: "",
      valorAcordo: "",
      custoUnitario: "",
      custoTotalDisparo: "",
      entregueRetorno: "",
      conversao: "",
      roi: "",
      custoPorRetorno: "",
      custoPorAcordo: "",
    },
  };

  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("Todos");
  const [form, setForm] = useState(emptyForm);
  const [formRenderKey, setFormRenderKey] = useState(0);
  const formRefFornecedor = React.useRef({ ...emptyForm });
  const [editingFornecedorId, setEditingFornecedorId] = useState(null);

  const optionStyleFornecedor = {
    background: C.bg1,
    color: C.t1,
  };

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
    formRefFornecedor.current = {
      ...formRefFornecedor.current,
      [campo]: valor,
    };

    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  function updateFormSilent(campo, valor) {
    formRefFornecedor.current = {
      ...formRefFornecedor.current,
      [campo]: valor,
    };
  }

  function abrirNovoFornecedor() {
    const novoForm = { ...emptyForm };
    formRefFornecedor.current = novoForm;
    setEditingFornecedorId(null);
    setForm(novoForm);
    setFormRenderKey((prev) => prev + 1);
    setShowForm(true);
  }

  function abrirFornecedorExistente(item) {
    const canais = Array.isArray(item.canais)
      ? item.canais.join(", ")
      : item.canais || "";

    const formEditado = {
      ...emptyForm,
      nome: item.nome || "",
      categoria: item.categoria || "",
      canais,
      responsavel: item.responsavel || "",
      contato: item.contato || "",
      email: item.email || "",
      telefone: item.telefone || "",
      status: item.status || "Ativo",
      sla_meta:
        item.sla_meta !== null && item.sla_meta !== undefined
          ? String(item.sla_meta)
          : "",
      performance_score:
        item.performance_score !== null && item.performance_score !== undefined
          ? String(item.performance_score)
          : "",
      risco: item.risco || "Baixo",
      projetos_ativos:
        item.projetos_ativos !== null && item.projetos_ativos !== undefined
          ? String(item.projetos_ativos)
          : "",
      incidentes_abertos:
        item.incidentes_abertos !== null &&
        item.incidentes_abertos !== undefined
          ? String(item.incidentes_abertos)
          : "",
      avaliacao: item.avaliacao || "",
      observacoes: item.observacoes || "",
    };

    formRefFornecedor.current = formEditado;
    setEditingFornecedorId(item.id || null);
    setForm(formEditado);
    setFormRenderKey((prev) => prev + 1);
    setShowForm(true);
  }

  function fecharFormularioFornecedor() {
    const novoForm = { ...emptyForm };
    formRefFornecedor.current = novoForm;
    setShowForm(false);
    setEditingFornecedorId(null);
    setForm(novoForm);
    setFormRenderKey((prev) => prev + 1);
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
    if (!isSupabaseConfigured) {
      setLoading(false);
      notifyDatabaseConfigMissingOnce();
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("fornecedores")
      .select("*")
      .order("updated_at", { ascending: false });

    setLoading(false);

    if (error) {
      console.log("Erro ao carregar fornecedores:", error);
      notifyError(
        describeAppError(error, {
          action: "carregar",
          subject: "fornecedores",
        }),
        "Erro ao carregar fornecedores",
      );
      return;
    }

    setFornecedores(data || []);
  }

  useEffect(() => {
    carregarFornecedores();
  }, []);

  async function salvarFornecedor(continuarCadastro = false) {
    const currentForm = {
      ...formRefFornecedor.current,
      canais: form.canais || formRefFornecedor.current.canais || "",
      status: form.status || formRefFornecedor.current.status || "Ativo",
      risco: form.risco || formRefFornecedor.current.risco || "Baixo",
    };

    const camposPendentes = getMissingFields([
      { label: "Nome do fornecedor", value: currentForm.nome },
      { label: "Categoria", value: currentForm.categoria },
      { label: "Canais atendidos", value: currentForm.canais },
      { label: "Responsável interno", value: currentForm.responsavel },
      { label: "E-mail principal", value: currentForm.email },
    ]);

    if (camposPendentes.length > 0) {
      notifyWarning(
        missingFieldsMessage(camposPendentes, "fornecedor"),
        "Campos obrigatórios pendentes",
      );
      return;
    }

    const emailFornecedor = String(currentForm.email || "").trim();
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFornecedor);

    if (!emailValido) {
      notifyWarning(
        "Para salvar este fornecedor, informe um e-mail válido no campo E-mail principal.",
        "E-mail inválido",
      );
      return;
    }

    setSaving(true);

    const canais = String(currentForm.canais || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      nome: currentForm.nome,
      categoria: currentForm.categoria,
      canais,
      responsavel: currentForm.responsavel,
      contato: currentForm.contato,
      email: currentForm.email,
      telefone: currentForm.telefone,
      status: currentForm.status,
      sla_meta: toNum(currentForm.sla_meta),
      performance_score: toNum(currentForm.performance_score),
      risco: currentForm.risco,
      projetos_ativos: toNum(currentForm.projetos_ativos),
      incidentes_abertos: toNum(currentForm.incidentes_abertos),
      avaliacao: currentForm.avaliacao,
      observacoes: currentForm.observacoes,
      updated_at: new Date().toISOString(),
    };

    const response = editingFornecedorId
      ? await supabase
          .from("fornecedores")
          .update(payload)
          .eq("id", editingFornecedorId)
      : await supabase.from("fornecedores").insert([payload]);

    setSaving(false);

    if (response.error) {
      console.log("Erro ao salvar fornecedor:", response.error);
      notifyError(
        describeAppError(response.error, {
          action: "salvar",
          subject: "fornecedor",
        }),
      );
      return;
    }

    notifySuccess(
      editingFornecedorId
        ? "Fornecedor atualizado com sucesso!"
        : "Fornecedor salvo com sucesso!",
    );

    const novoForm = { ...emptyForm };
    formRefFornecedor.current = novoForm;
    setForm(novoForm);
    setEditingFornecedorId(null);
    setShowForm(continuarCadastro && !editingFornecedorId);
    setFormRenderKey((prev) => prev + 1);
    carregarFornecedores();
  }

  const filtrados = showForm
    ? []
    : filter === "Todos"
      ? fornecedores
      : fornecedores.filter(
          (item) => item.status === filter || item.risco === filter,
        );

  const total = fornecedores.length;
  const ativos = fornecedores.filter((f) => f.status === "Ativo").length;
  const emObservacao = fornecedores.filter(
    (f) => f.status === "Em Observação",
  ).length;
  const altoRisco = fornecedores.filter((f) => f.risco === "Alto").length;
  const incidentes = fornecedores.reduce(
    (acc, item) => acc + toNum(item.incidentes_abertos),
    0,
  );
  const scoreMedio =
    total > 0
      ? Math.round(
          fornecedores.reduce(
            (acc, item) => acc + toNum(item.performance_score),
            0,
          ) / total,
        )
      : 0;

  const filtros = [
    "Todos",
    "Ativo",
    "Em Homologação",
    "Em Observação",
    "Inativo",
    "Alto",
  ];

  const canaisFornecedorOptions = [
    "WhatsApp",
    "RCS",
    "SMS",
    "E-mail",
    "Enriquecimento de Dados",
    "Outros",
  ];

  const selectedCanaisFornecedor = String(form.canais || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  function toggleCanalFornecedor(canal) {
    const exists = selectedCanaisFornecedor.includes(canal);
    const next = exists
      ? selectedCanaisFornecedor.filter((item) => item !== canal)
      : [...selectedCanaisFornecedor, canal];

    updateForm("canais", next.join(", "));
  }

  const SectionTitleFornecedor = ({ title, subtitle }) => (
    <div
      style={{
        gridColumn: "1 / -1",
        marginTop: 8,
        paddingTop: 14,
        borderTop: "1px solid " + C.border,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 900, color: C.t1 }}>{title}</div>
      {subtitle && (
        <div style={{ fontSize: 11, color: C.t3, marginTop: 4 }}>
          {subtitle}
        </div>
      )}
    </div>
  );

  const FieldBlockFornecedor = ({ label, required, example, children }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        style={{
          fontSize: 11,
          color: C.t3,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
        {required && <span style={{ color: C.rose }}> *</span>}
      </label>
      {children}
      {example && (
        <div style={{ fontSize: 10, color: C.t3, lineHeight: 1.4 }}>
          {example}
        </div>
      )}
    </div>
  );

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
            onClick={abrirNovoFornecedor}
          />,
        ]}
        C={C}
        sticky
      />

      <div
        style={{
          display: showForm ? "none" : "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 14,
        }}
      >
        <KPICard
          icon={Users}
          label="Fornecedores"
          value={total}
          sub={loading ? "Carregando..." : "Base cadastrada"}
          color={C.blue}
          glow={C.blueGlow}
          C={C}
        />
        <KPICard
          icon={CheckCircle2}
          label="Ativos"
          value={ativos}
          sub="Operação em andamento"
          color={C.emerald}
          glow={C.emeraldGlow}
          C={C}
        />
        <KPICard
          icon={Activity}
          label="Score médio"
          value={`${scoreMedio}%`}
          sub="Performance geral"
          color={C.violet}
          glow={C.violetGlow}
          C={C}
        />
        <KPICard
          icon={AlertTriangle}
          label="Incidentes"
          value={incidentes}
          sub={`${altoRisco} alto risco`}
          color={incidentes > 0 || altoRisco > 0 ? C.rose : C.emerald}
          glow={incidentes > 0 || altoRisco > 0 ? C.roseGlow : C.emeraldGlow}
          C={C}
        />
      </div>

      {showForm && (
        <div
          key={formRenderKey}
          style={{
            ...card(C),
            padding: 0,
            overflow: "hidden",
            borderRadius: 20,
          }}
        >
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
                {editingFornecedorId ? "Editar Fornecedor" : "Novo Fornecedor"}
              </div>
              <div style={{ fontSize: 12, color: C.t3, marginTop: 4 }}>
                {editingFornecedorId
                  ? "Atualize dados operacionais, canais, SLA, performance e riscos do fornecedor"
                  : "Cadastre dados operacionais, canais, SLA, performance e riscos do fornecedor"}
              </div>
            </div>

            <button
              onClick={fecharFormularioFornecedor}
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 14,
              }}
            >
              <SectionTitleFornecedor
                title="1. Identificação do fornecedor"
                subtitle="Dados principais para classificação e acompanhamento executivo."
              />

              <FieldBlockFornecedor
                label="Nome do fornecedor"
                required
                example="Ex.: Ótima Digital, Zap2Go, Robbu, Smart NX"
              >
                <input
                  placeholder="Nome do fornecedor"
                  defaultValue={form.nome}
                  onChange={(e) => updateFormSilent("nome", e.target.value)}
                  style={field}
                />
              </FieldBlockFornecedor>

              <FieldBlockFornecedor
                label="Categoria"
                required
                example="Ex.: Mensageria, IA, CRM, Portal, Enriquecimento"
              >
                <input
                  placeholder="Categoria: Mensageria, IA, CRM, Portal..."
                  defaultValue={form.categoria}
                  onChange={(e) =>
                    updateFormSilent("categoria", e.target.value)
                  }
                  style={field}
                />
              </FieldBlockFornecedor>

              <SectionTitleFornecedor
                title="2. Canais atendidos"
                subtitle="Selecione os canais por tags. Isso evita nomes duplicados como WPP, Whats e WhatsApp."
              />

              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{
                    fontSize: 11,
                    color: C.t3,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Canais atendidos <span style={{ color: C.rose }}>*</span>
                </label>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid " + C.border,
                    background: C.surface,
                  }}
                >
                  {canaisFornecedorOptions.map((canal) => {
                    const active = selectedCanaisFornecedor.includes(canal);

                    return (
                      <button
                        type="button"
                        key={canal}
                        onClick={() => toggleCanalFornecedor(canal)}
                        style={{
                          border: "1px solid " + (active ? C.blue : C.border),
                          background: active ? C.blueGlow : C.bg2,
                          color: active ? C.blue : C.t2,
                          borderRadius: 999,
                          padding: "8px 12px",
                          fontSize: 12,
                          fontWeight: 900,
                          cursor: "pointer",
                        }}
                      >
                        {active ? "* " : ""}
                        {canal}
                      </button>
                    );
                  })}
                </div>

                <div style={{ fontSize: 10, color: C.t3, marginTop: 7 }}>
                  Ex.: WhatsApp, RCS, SMS, E-mail, Enriquecimento de Dados.
                </div>

                {selectedCanaisFornecedor.length > 0 && (
                  <div
                    style={{
                      marginTop: 10,
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: 8,
                    }}
                  >
                    {selectedCanaisFornecedor.map((canal) => (
                      <div
                        key={canal}
                        style={{
                          border: "1px solid " + C.border,
                          background: C.bg2,
                          borderRadius: 12,
                          padding: 10,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 900,
                            color: C.t1,
                            marginBottom: 5,
                          }}
                        >
                          {canal}
                        </div>

                        <div
                          style={{ fontSize: 10, color: C.t3, lineHeight: 1.5 }}
                        >
                          {canal === "WhatsApp" &&
                            "MVP+: BSP, WABA, tipo de integração e janela de SLA."}
                          {canal === "RCS" &&
                            "MVP+: agregador, operadoras, cobertura e fallback."}
                          {canal === "SMS" &&
                            "MVP+: rotas, DLR, throughput, blacklist e opt-out."}
                          {canal === "E-mail" &&
                            "MVP+: SPF, DKIM, DMARC, IP dedicado/compartilhado e bounce."}
                          {canal === "Enriquecimento de Dados" &&
                            "MVP+: fontes, atualização, LGPD, base legal e checklist."}
                          {canal === "Outros" &&
                            "MVP+: descrever canal, parceiro, integração e observações técnicas."}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <SectionTitleFornecedor
                title="3. Responsáveis e contatos"
                subtitle="Contatos para operação, suporte, escalonamento e relacionamento com o fornecedor."
              />

              <FieldBlockFornecedor label="Responsável interno" required>
                <input
                  placeholder="Responsável interno"
                  defaultValue={form.responsavel}
                  onChange={(e) =>
                    updateFormSilent("responsavel", e.target.value)
                  }
                  style={field}
                />
              </FieldBlockFornecedor>

              <FieldBlockFornecedor
                label="Contato do fornecedor"
                example="MVP+: permitir mais de um contato por tipo: suporte, técnico, comercial."
              >
                <input
                  placeholder="Contato do fornecedor"
                  defaultValue={form.contato}
                  onChange={(e) => updateFormSilent("contato", e.target.value)}
                  style={field}
                />
              </FieldBlockFornecedor>

              <FieldBlockFornecedor
                label="E-mail principal"
                required
                example="Ex.: suporte@fornecedor.com"
              >
                <input
                  placeholder="E-mail"
                  defaultValue={form.email}
                  onChange={(e) => updateFormSilent("email", e.target.value)}
                  style={field}
                />
              </FieldBlockFornecedor>

              <FieldBlockFornecedor
                label="Telefone"
                example="Ex.: +55 41 99999-9999"
              >
                <input
                  placeholder="Telefone"
                  defaultValue={form.telefone}
                  onChange={(e) => updateFormSilent("telefone", e.target.value)}
                  style={field}
                />
              </FieldBlockFornecedor>

              <SectionTitleFornecedor
                title="4. SLA, performance e risco"
                subtitle="Dados utilizados para acompanhamento operacional e visão executiva."
              />

              <FieldBlockFornecedor label="Status" required>
                <select
                  value={form.status}
                  onChange={(e) => updateForm("status", e.target.value)}
                  style={field}
                >
                  <option style={optionStyleFornecedor}>Ativo</option>
                  <option style={optionStyleFornecedor}>Em Homologação</option>
                  <option style={optionStyleFornecedor}>Em Observação</option>
                  <option style={optionStyleFornecedor}>Inativo</option>
                </select>
              </FieldBlockFornecedor>

              <FieldBlockFornecedor
                label="Risco"
                required
                example="Critérios: incidentes, SLA, compliance, dependência e volume."
              >
                <select
                  value={form.risco}
                  onChange={(e) => updateForm("risco", e.target.value)}
                  style={field}
                >
                  <option style={optionStyleFornecedor}>Baixo</option>
                  <option style={optionStyleFornecedor}>Médio</option>
                  <option style={optionStyleFornecedor}>Alto</option>
                </select>
              </FieldBlockFornecedor>

              <FieldBlockFornecedor
                label="SLA contratado/meta (%)"
                example="Valor entre 0 e 100. Ex.: 95"
              >
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="SLA contratado/meta (%)"
                  defaultValue={form.sla_meta}
                  onChange={(e) => updateFormSilent("sla_meta", e.target.value)}
                  style={field}
                />
              </FieldBlockFornecedor>

              <FieldBlockFornecedor
                label="Score de performance (%)"
                example="MVP: manual. MVP+: calculado por entrega, falhas, SLA e incidentes."
              >
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Score de performance (%)"
                  defaultValue={form.performance_score}
                  onChange={(e) =>
                    updateFormSilent("performance_score", e.target.value)
                  }
                  style={field}
                />
              </FieldBlockFornecedor>

              <FieldBlockFornecedor
                label="Projetos ativos"
                example="Futuro: puxar automático dos projetos vinculados."
              >
                <input
                  type="number"
                  placeholder="Projetos ativos"
                  defaultValue={form.projetos_ativos}
                  onChange={(e) =>
                    updateFormSilent("projetos_ativos", e.target.value)
                  }
                  style={field}
                />
              </FieldBlockFornecedor>

              <FieldBlockFornecedor
                label="Incidentes em aberto"
                example="Futuro: puxar automático do controle de incidentes."
              >
                <input
                  type="number"
                  placeholder="Incidentes em aberto"
                  defaultValue={form.incidentes_abertos}
                  onChange={(e) =>
                    updateFormSilent("incidentes_abertos", e.target.value)
                  }
                  style={field}
                />
              </FieldBlockFornecedor>

              <SectionTitleFornecedor
                title="5. Avaliação e observações"
                subtitle="Resumo executivo, pontos de atenção, histórico e próximos passos."
              />

              <FieldBlockFornecedor
                label="Avaliação executiva do fornecedor"
                example="Ex.: fornecedor estável, bom suporte, pendências em homologação ou necessidade de plano de ação."
              >
                <textarea
                  placeholder="Avaliação executiva do fornecedor"
                  defaultValue={form.avaliacao}
                  onChange={(e) =>
                    updateFormSilent("avaliacao", e.target.value)
                  }
                  style={{
                    ...field,
                    gridColumn: "1 / -1",
                    minHeight: 90,
                    resize: "vertical",
                    lineHeight: 1.6,
                  }}
                />
              </FieldBlockFornecedor>

              <FieldBlockFornecedor
                label="Observações / plano de mitigação"
                example="Ex.: criar fornecedor backup, revisar SLA, validar integração alternativa ou abrir plano de ação."
              >
                <textarea
                  placeholder="Observações, pontos de atenção, histórico de relacionamento ou próximos passos"
                  defaultValue={form.observacoes}
                  onChange={(e) =>
                    updateFormSilent("observacoes", e.target.value)
                  }
                  style={{
                    ...field,
                    gridColumn: "1 / -1",
                    minHeight: 90,
                    resize: "vertical",
                    lineHeight: 1.6,
                  }}
                />
              </FieldBlockFornecedor>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 16,
              }}
            >
              <button
                onClick={fecharFormularioFornecedor}
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

              {!editingFornecedorId && (
                <button
                  onClick={() => salvarFornecedor(true)}
                  disabled={saving}
                  style={{
                    background: C.surface,
                    border: "1px solid " + C.border,
                    color: C.blue,
                    borderRadius: 12,
                    padding: "11px 18px",
                    cursor: saving ? "not-allowed" : "pointer",
                    fontWeight: 900,
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  Salvar e adicionar outro
                </button>
              )}

              <button
                onClick={() => salvarFornecedor(false)}
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
                {saving
                  ? "Salvando..."
                  : editingFornecedorId
                    ? "Atualizar Fornecedor"
                    : "Salvar Fornecedor"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: showForm ? "none" : "flex",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
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

      <div
        style={{
          ...card(C),
          display: showForm ? "none" : "block",
          padding: 0,
          overflowX: "auto",
          overflowY: "hidden",
        }}
      >
        <table
          style={{ width: "100%", minWidth: 1380, borderCollapse: "collapse" }}
        >
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {[
                "Fornecedor",
                "Canais",
                "Responsável",
                "SLA",
                "Score",
                "Risco",
                "Projetos",
                "Incidentes",
                "Status",
              ].map((h) => (
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
                  onClick={() => abrirFornecedorExistente(item)}
                  title="Clique para editar o fornecedor"
                  style={{
                    borderBottom: `1px solid ${C.border}`,
                    transition: "background 0.15s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = C.cardHov)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
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
                      {canais.length === 0 && (
                        <span style={{ fontSize: 12, color: C.t3 }}>-</span>
                      )}
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
                      {canais.length > 3 && (
                        <span style={{ fontSize: 10, color: C.t3 }}>
                          +{canais.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  <td
                    style={{ padding: "15px 16px", fontSize: 12, color: C.t2 }}
                  >
                    {item.responsavel || "-"}
                  </td>

                  <td
                    style={{ padding: "15px 16px", fontSize: 12, color: C.t2 }}
                  >
                    <strong style={{ color: C.blue }}>
                      {toNum(item.sla_meta)}%
                    </strong>
                  </td>

                  <td style={{ padding: "15px 16px", minWidth: 130 }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <div style={{ flex: 1 }}>
                        <ProgressBar
                          val={Math.max(
                            0,
                            Math.min(100, toNum(item.performance_score)),
                          )}
                          color={
                            toNum(item.performance_score) >= 80
                              ? C.emerald
                              : toNum(item.performance_score) >= 60
                                ? C.amber
                                : C.rose
                          }
                          C={C}
                        />
                      </div>
                      <strong
                        style={{
                          fontSize: 12,
                          color:
                            toNum(item.performance_score) >= 80
                              ? C.emerald
                              : toNum(item.performance_score) >= 60
                                ? C.amber
                                : C.rose,
                        }}
                      >
                        {toNum(item.performance_score)}%
                      </strong>
                    </div>
                  </td>

                  <td
                    style={{
                      padding: "15px 16px",
                      fontSize: 12,
                      fontWeight: 900,
                      color: riscoColor(item.risco),
                    }}
                  >
                    {item.risco || "-"}
                  </td>

                  <td
                    style={{ padding: "15px 16px", fontSize: 12, color: C.t2 }}
                  >
                    {toNum(item.projetos_ativos)}
                  </td>

                  <td
                    style={{
                      padding: "15px 16px",
                      fontSize: 12,
                      fontWeight: 900,
                      color:
                        toNum(item.incidentes_abertos) > 0 ? C.rose : C.emerald,
                    }}
                  >
                    {toNum(item.incidentes_abertos)}
                  </td>

                  <td style={{ padding: "15px 16px" }}>
                    <Chip
                      label={item.status || "Ativo"}
                      color={st.color}
                      bg={st.bg}
                    />
                  </td>
                </tr>
              );
            })}

            {filtrados.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    padding: 30,
                    textAlign: "center",
                    color: C.t3,
                    fontSize: 13,
                  }}
                >
                  Nenhum fornecedor encontrado. Clique em Novo Fornecedor para
                  cadastrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PortaisView({ C }) {
  const [tab, setTab] = useState("monitoria");
  const [filter, setFilter] = useState("Todos");
  const [selectedPortalMonitoria, setSelectedPortalMonitoria] =
    useState("Todos");

  function toNumPortal(value) {
    const parsed = Number(String(value || "0").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function intBR(value) {
    return Number(value || 0).toLocaleString("pt-BR");
  }

  function moneyBR(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
  }

  function pctPortal(value) {
    return (
      Number(value || 0)
        .toFixed(1)
        .replace(".", ",") + "%"
    );
  }

  function safeCsv(value) {
    const text = String(value ?? "").replace(/"/g, '""');
    return '"' + text + '"';
  }

  function exportCsv(filename, rows) {
    if (!rows || rows.length === 0) {
      notifyWarning("Não há dados para exportar.");
      return;
    }

    const headers = Object.keys(rows[0]);
    const csv = [
      headers.map(safeCsv).join(";"),
      ...rows.map((row) => headers.map((h) => safeCsv(row[h])).join(";")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportPdf(title, subtitle, htmlContent) {
    const janela = window.open("", "_blank", "width=1400,height=950");

    if (!janela) {
      notifyWarning(
        "O navegador bloqueou a janela de impressão. Libere pop-ups e tente novamente.",
      );
      return;
    }

    const html =
      "<!DOCTYPE html>" +
      '<html lang="pt-BR">' +
      "<head>" +
      '<meta charset="UTF-8" />' +
      "<title>" +
      title +
      "</title>" +
      "<style>" +
      "*{box-sizing:border-box}" +
      "body{margin:0;padding:24px;font-family:Inter,Arial,sans-serif;background:#f2f4f8;color:#0f172a;-webkit-print-color-adjust:exact;print-color-adjust:exact}" +
      ".cover{background:#ffffff;border:1px solid #e2e8f0;border-top:4px solid #e11d48;border-radius:14px;padding:24px;margin-bottom:18px}" +
      ".tag{display:inline-flex;background:#ffe7ef;color:#e11d48;border:1px solid #f8a0b5;border-radius:999px;padding:6px 10px;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px}" +
      "h1{font-size:28px;margin:0 0 6px;color:#0f172a}" +
      "p{color:#64748b;margin:0;line-height:1.5}" +
      ".grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:14px 0}" +
      ".kpi{background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:13px}" +
      ".kpi small{display:block;color:#64748b;text-transform:uppercase;letter-spacing:.07em;font-size:9px;margin-bottom:5px}" +
      ".kpi strong{display:block;font-size:22px;color:#0f172a}" +
      ".section{background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:16px;margin-bottom:14px;break-inside:avoid}" +
      ".section h2{font-size:16px;margin:0 0 10px;color:#1e293b}" +
      "table{width:100%;border-collapse:collapse;font-size:10px;table-layout:fixed}" +
      "th{background:#fef2f5;color:#1e293b;text-align:left;padding:8px 6px;text-transform:uppercase;font-size:8px}" +
      "td{border-bottom:1px solid #e2e8f0;padding:7px 6px;color:#0f172a;word-break:break-word}" +
      ".print-actions{display:flex;justify-content:flex-end;gap:8px;margin-bottom:12px}" +
      ".print-actions button{border:0;border-radius:10px;padding:10px 14px;font-weight:900;cursor:pointer}" +
      ".primary{background:#e11d48;color:white}" +
      ".secondary{background:linear-gradient(135deg,#334155,#1f2937);color:#ffffff;border:1px solid #334155!important}" +
      "@page{size:A4 landscape;margin:8mm}" +
      "@media print{.print-actions{display:none!important}body{padding:0;background:#f2f4f8}.section{break-inside:avoid}}" +
      "</style>" +
      "</head>" +
      "<body>" +
      '<div class="print-actions"><button class="secondary" onclick="window.close()">Fechar</button><button class="primary" onclick="window.print()">Imprimir / Salvar PDF</button></div>' +
      '<div class="cover"><div class="tag">Portais</div><h1>' +
      title +
      "</h1><p>" +
      subtitle +
      "</p></div>" +
      htmlContent +
      "<script>setTimeout(function(){window.focus();window.print()},700)<\\/script>" +
      "</body></html>";

    janela.document.open();
    janela.document.write(html);
    janela.document.close();
  }

  const dadosPortais = [
    {
      portal: "Bellinati - Portal - Bradesco",
      total: 1905355,
      riscoContrato: 2323222140,
      buscaCliente: 9296,
      enviaToken: 7089,
      validaToken: 1750,
      buscaCredor: 1864,
      buscaDivida: 1720,
      buscaAcordo: 1723,
      buscaOpcaoPagamento: 1125,
      formalizarAcordo: 68,
      txEnviaTokenBuscaCliente: 0.7625860585197934,
      txValidaTokenEnviaToken: 0.2468613344618423,
      perdaToken: 0.7531386655381577,
      txFormalizarOpcaoPagamento: 0.03946604759141033,
      formalizacoesPorMil: 0.03568888737269433,
      classificacao: "Conversão intermediária",
      observacao: "Gargalo crítico de token",
    },
    {
      portal: "Bellinati - Portal - Generico",
      total: 28857706,
      riscoContrato: 5481244639918,
      buscaCliente: 150217,
      enviaToken: 20817,
      validaToken: 6508,
      buscaCredor: 6699,
      buscaDivida: 4112,
      buscaAcordo: 4236,
      buscaOpcaoPagamento: 3015,
      formalizarAcordo: 71,
      txEnviaTokenBuscaCliente: 0.13857952162538195,
      txValidaTokenEnviaToken: 0.3126291012153528,
      perdaToken: 0.6873708987846472,
      txFormalizarOpcaoPagamento: 0.01676109537299339,
      formalizacoesPorMil: 0.002460348026277626,
      classificacao: "Conversão baixa",
      observacao: "Oportunidade de melhoria",
    },
    {
      portal: "Bellinati - Portal - Itau",
      total: 0,
      riscoContrato: 36503236,
      buscaCliente: 242,
      enviaToken: 196,
      validaToken: 54,
      buscaCredor: 109,
      buscaDivida: 8,
      buscaAcordo: 8,
      buscaOpcaoPagamento: 8,
      formalizarAcordo: 0,
      txEnviaTokenBuscaCliente: 0.8099173553719008,
      txValidaTokenEnviaToken: 0.2755102040816326,
      perdaToken: 0.7244897959183674,
      txFormalizarOpcaoPagamento: 0,
      formalizacoesPorMil: 0,
      classificacao: "Conversão baixa",
      observacao: "Oportunidade de melhoria",
    },
    {
      portal: "Bellinati - Portal - Itau PF",
      total: 9956781,
      riscoContrato: 3413055498,
      buscaCliente: 99,
      enviaToken: 0,
      validaToken: 0,
      buscaCredor: 1758,
      buscaDivida: 1180,
      buscaAcordo: 885,
      buscaOpcaoPagamento: 725,
      formalizarAcordo: 52,
      txEnviaTokenBuscaCliente: 0,
      txValidaTokenEnviaToken: 0,
      perdaToken: 1,
      txFormalizarOpcaoPagamento: 0.05875706214689266,
      formalizacoesPorMil: 0.005222571431469669,
      classificacao: "Conversão intermediária",
      observacao: "Validar logs/autenticação",
    },
    {
      portal: "Bellinati - Portal - Itau PJ",
      total: 1124633,
      riscoContrato: 2238506516,
      buscaCliente: 0,
      enviaToken: 0,
      validaToken: 0,
      buscaCredor: 163,
      buscaDivida: 199,
      buscaAcordo: 146,
      buscaOpcaoPagamento: 564,
      formalizarAcordo: 2,
      txEnviaTokenBuscaCliente: 0,
      txValidaTokenEnviaToken: 0,
      perdaToken: 1,
      txFormalizarOpcaoPagamento: 0.0136986301369863,
      formalizacoesPorMil: 0.00177835791764958,
      classificacao: "Conversão baixa",
      observacao: "Validar logs/autenticação",
    },
    {
      portal: "Bellinati - Portal - PanRefin",
      total: 0,
      riscoContrato: 0,
      buscaCliente: 33,
      enviaToken: 49,
      validaToken: 10,
      buscaCredor: 0,
      buscaDivida: 0,
      buscaAcordo: 0,
      buscaOpcaoPagamento: 0,
      formalizarAcordo: 0,
      txEnviaTokenBuscaCliente: 1.4848484848484849,
      txValidaTokenEnviaToken: 0.20408163265306123,
      perdaToken: 0.7959183673469388,
      txFormalizarOpcaoPagamento: 0,
      formalizacoesPorMil: 0,
      classificacao: "Conversão baixa",
      observacao: "Gargalo crítico de token",
    },
  ];

  const testesDiarios = [
    {
      data_teste: "2026-05-24",
      portal: "Portal Negocie",
      banco: "Banco Exemplo 1",
      ambiente: "Produção",
      etapa: "Login",
      status: "OK",
      motivo_erro: "-",
      severidade: "-",
      mensagem_erro: "-",
      responsavel_teste: "Estagiário",
      tempo_resposta_ms: 2100,
      sla_etapa: "3s",
      evidencia_url: "-",
      observacao: "Login validado com sucesso.",
    },
    {
      data_teste: "2026-05-24",
      portal: "Portal Negocie",
      banco: "Banco Exemplo 2",
      ambiente: "Produção",
      etapa: "Token",
      status: "Falha",
      motivo_erro: "Código inválido / Token",
      severidade: "Alta",
      mensagem_erro: "Token recebido não valida na jornada.",
      responsavel_teste: "Analista",
      tempo_resposta_ms: 12500,
      sla_etapa: "10s",
      evidencia_url: "Anexo interno",
      observacao: "Abrir chamado para Dev/TI.",
    },
    {
      data_teste: "2026-05-24",
      portal: "Portal Banco",
      banco: "Banco Exemplo 3",
      ambiente: "Homologação",
      etapa: "Busca CPF",
      status: "OK com lentidão",
      motivo_erro: "SLA excedido",
      severidade: "Média",
      mensagem_erro: "Busca retornou acima do SLA esperado.",
      responsavel_teste: "Coordenador",
      tempo_resposta_ms: 7200,
      sla_etapa: "5s",
      evidencia_url: "Anexo interno",
      observacao: "Monitorar recorrência.",
    },
  ];

  const usabilidade = [
    {
      data: "2026-05-24",
      portal: "Portal Negocie",
      banco: "Banco Exemplo 1",
      categoria: "Navegação e clareza",
      item: "Cliente entende o próximo passo da negociação",
      nota: 4,
      achado: "Fluxo claro, sem bloqueio.",
      severidade: "Baixa",
      recomendacao: "Manter padrão atual.",
      evidencia_url: "-",
    },
    {
      data: "2026-05-24",
      portal: "Portal Negocie",
      banco: "Banco Exemplo 2",
      categoria: "Erros e mensagens",
      item: "Mensagem de erro orienta o cliente",
      nota: 2,
      achado: "Mensagem técnica demais na etapa de token.",
      severidade: "Alta",
      recomendacao:
        "Trocar mensagem por orientação clara para reenvio do código.",
      evidencia_url: "Anexo interno",
    },
    {
      data: "2026-05-24",
      portal: "Portal Banco",
      banco: "Banco Exemplo 3",
      categoria: "Consistência visual/logos",
      item: "Logos e identidade visual corretos",
      nota: 5,
      achado: "Logo e identidade corretos.",
      severidade: "Baixa",
      recomendacao: "Sem ação.",
      evidencia_url: "-",
    },
  ];

  const tickets = [
    {
      ticket_id: "TCK-001",
      codigo: "PORTAL-2026-0001",
      data_abertura: "2026-05-24 09:30",
      portal: "Portal Negocie",
      banco: "Banco Exemplo 2",
      motivo: "Token inválido",
      categoria: "Token",
      severidade: "Alta",
      prioridade: "P2",
      status: "Em andamento",
      dev_responsavel: "Dev responsável",
      time_ti: "Dev/TI",
      sla_triagem: "2h",
      sla_resolucao: "8h",
      sla_status: "Dentro do prazo",
      data_resolucao: "-",
      tempo_ciclo_horas: "-",
      origem: "Teste diário",
      observacao: "Falha na validação do token em produção.",
    },
    {
      ticket_id: "TCK-002",
      codigo: "PORTAL-2026-0002",
      data_abertura: "2026-05-24 10:10",
      portal: "Portal Banco",
      banco: "Banco Exemplo 3",
      motivo: "Busca CPF acima do SLA",
      categoria: "Timeout",
      severidade: "Média",
      prioridade: "P3",
      status: "Em triagem",
      dev_responsavel: "-",
      time_ti: "TI",
      sla_triagem: "4h",
      sla_resolucao: "24h",
      sla_status: "Vencendo",
      data_resolucao: "-",
      tempo_ciclo_horas: "-",
      origem: "Teste diário",
      observacao: "Busca CPF levou 7,2s. SLA esperado: 5s.",
    },
  ];

  const portalOperacionais = dadosPortais;

  function somarPortais(rows) {
    const totalizador = rows.reduce(
      (acc, item) => {
        acc.total += toNumPortal(item.total);
        acc.riscoContrato += toNumPortal(item.riscoContrato);
        acc.buscaCliente += toNumPortal(item.buscaCliente);
        acc.enviaToken += toNumPortal(item.enviaToken);
        acc.validaToken += toNumPortal(item.validaToken);
        acc.buscaCredor += toNumPortal(item.buscaCredor);
        acc.buscaDivida += toNumPortal(item.buscaDivida);
        acc.buscaAcordo += toNumPortal(item.buscaAcordo);
        acc.buscaOpcaoPagamento += toNumPortal(item.buscaOpcaoPagamento);
        acc.formalizarAcordo += toNumPortal(item.formalizarAcordo);
        return acc;
      },
      {
        portal: "Visão Geral",
        total: 0,
        riscoContrato: 0,
        buscaCliente: 0,
        enviaToken: 0,
        validaToken: 0,
        buscaCredor: 0,
        buscaDivida: 0,
        buscaAcordo: 0,
        buscaOpcaoPagamento: 0,
        formalizarAcordo: 0,
      },
    );

    const txValidaTokenEnviaToken =
      totalizador.enviaToken > 0
        ? totalizador.validaToken / totalizador.enviaToken
        : 0;
    const perdaToken =
      totalizador.enviaToken > 0
        ? 1 - totalizador.validaToken / totalizador.enviaToken
        : 1;
    const txFormalizarOpcaoPagamento =
      totalizador.buscaOpcaoPagamento > 0
        ? totalizador.formalizarAcordo / totalizador.buscaOpcaoPagamento
        : 0;
    const formalizacoesPorMil =
      totalizador.total > 0
        ? (totalizador.formalizarAcordo / totalizador.total) * 1000
        : 0;

    return {
      ...totalizador,
      txValidaTokenEnviaToken,
      perdaToken,
      txFormalizarOpcaoPagamento,
      formalizacoesPorMil,
      classificacao: "Consolidado",
      observacao: "Soma consolidada dos portais",
    };
  }

  const consolidadoGeral = somarPortais(portalOperacionais);

  const portalSelecionado =
    selectedPortalMonitoria === "Todos"
      ? consolidadoGeral
      : portalOperacionais.find(
          (item) => item.portal === selectedPortalMonitoria,
        ) || consolidadoGeral;

  const consolidado = portalSelecionado;
  const falhasHoje = testesDiarios.filter((i) => i.status === "Falha").length;
  const criticosHoje = testesDiarios.filter(
    (i) => i.severidade === "Crítica" || i.severidade === "Alta",
  ).length;
  const bancosOk = testesDiarios.filter((i) => i.status === "OK").length;
  const pctOk =
    testesDiarios.length > 0 ? (bancosOk / testesDiarios.length) * 100 : 0;
  const ticketsAbertos = tickets.filter(
    (t) => !["Resolvido", "Cancelado"].includes(t.status),
  ).length;
  const ticketsSlaAtencao = tickets.filter(
    (t) => t.sla_status === "Vencendo" || t.sla_status === "Vencido",
  ).length;
  const notaUsabilidade =
    usabilidade.length > 0
      ? usabilidade.reduce((acc, i) => acc + Number(i.nota || 0), 0) /
        usabilidade.length
      : 0;

  const tabs = [
    { id: "monitoria", label: "Monitoria" },
    { id: "testes", label: "Testes Diários" },
    { id: "usabilidade", label: "Usabilidade" },
    { id: "tickets", label: "Tickets" },
  ];

  function statusColor(status) {
    if (status === "OK") return { color: C.emerald, bg: C.emeraldGlow };
    if (status === "OK com lentidão")
      return { color: C.amber, bg: C.amberGlow };
    if (status === "Intermitente") return { color: C.amber, bg: C.amberGlow };
    if (status === "Falha") return { color: C.rose, bg: C.roseGlow };
    return { color: C.t3, bg: C.bg3 };
  }

  function exportCurrentCsv() {
    if (tab === "monitoria") {
      const html = [
        '<div class="grid">',
        '<div class="kpi"><small>% bancos OK hoje</small><strong>' +
          pctPortal(pctOk) +
          "</strong></div>",
        '<div class="kpi"><small>Falhas hoje</small><strong>' +
          falhasHoje +
          "</strong></div>",
        '<div class="kpi"><small>Tickets abertos</small><strong>' +
          ticketsAbertos +
          "</strong></div>",
        '<div class="kpi"><small>Nota usabilidade</small><strong>' +
          notaUsabilidade.toFixed(1).replace(".", ",") +
          "/5</strong></div>",
        "</div>",
        '<div class="section">',
        "<h2>Resumo Executivo</h2>",
        "<p>O módulo de Portais consolida testes diários, usabilidade e tickets de Dev/TI. O principal ponto de atenção é a etapa de token e o acompanhamento de SLA dos tickets.</p>",
        "</div>",
      ].join("");

      exportPdf(
        "Monitoria de Portais",
        "Resumo consolidado dos portais, testes, usabilidade e tickets.",
        html,
      );
    }

    if (tab === "testes") {
      const rows = testesDiarios
        .map(
          (r) =>
            "<tr><td>" +
            r.data_teste +
            "</td><td>" +
            r.portal +
            "</td><td>" +
            r.banco +
            "</td><td>" +
            r.ambiente +
            "</td><td>" +
            r.etapa +
            "</td><td>" +
            r.status +
            "</td><td>" +
            r.motivo_erro +
            "</td><td>" +
            r.severidade +
            "</td></tr>",
        )
        .join("");

      exportPdf(
        "Relatório de Testes Diários",
        "Rotina operacional de validação dos portais em produção e homologação.",
        '<div class="section"><h2>Resumo do Dia</h2><p>Bancos OK: ' +
          bancosOk +
          " | Falhas: " +
          falhasHoje +
          " | % OK: " +
          pctPortal(pctOk) +
          '</p></div><div class="section"><h2>Detalhamento</h2><table><thead><tr><th>Data</th><th>Portal</th><th>Banco</th><th>Ambiente</th><th>Etapa</th><th>Status</th><th>Motivo</th><th>Severidade</th></tr></thead><tbody>' +
          rows +
          "</tbody></table></div>",
      );
    }

    if (tab === "usabilidade") {
      const rows = usabilidade
        .map(
          (r) =>
            "<tr><td>" +
            r.data +
            "</td><td>" +
            r.portal +
            "</td><td>" +
            r.banco +
            "</td><td>" +
            r.categoria +
            "</td><td>" +
            r.item +
            "</td><td>" +
            r.nota +
            "</td><td>" +
            r.severidade +
            "</td><td>" +
            r.recomendacao +
            "</td></tr>",
        )
        .join("");

      exportPdf(
        "Relatório de Usabilidade",
        "Avaliação de experiência, clareza, textos, visual, acessibilidade e mensagens de erro.",
        '<div class="section"><h2>Resumo</h2><p>Nota média: ' +
          notaUsabilidade.toFixed(1).replace(".", ",") +
          '/5. Itens críticos devem gerar ticket para acompanhamento.</p></div><div class="section"><h2>Checklist</h2><table><thead><tr><th>Data</th><th>Portal</th><th>Banco</th><th>Categoria</th><th>Item</th><th>Nota</th><th>Severidade</th><th>Recomendação</th></tr></thead><tbody>' +
          rows +
          "</tbody></table></div>",
      );
    }

    if (tab === "tickets") {
      const rows = tickets
        .map(
          (r) =>
            "<tr><td>" +
            r.codigo +
            "</td><td>" +
            r.data_abertura +
            "</td><td>" +
            r.portal +
            "</td><td>" +
            r.banco +
            "</td><td>" +
            r.motivo +
            "</td><td>" +
            r.severidade +
            "</td><td>" +
            r.status +
            "</td><td>" +
            r.sla_resolucao +
            "</td><td>" +
            r.sla_status +
            "</td></tr>",
        )
        .join("");

      exportPdf(
        "Relatório de Tickets dos Portais",
        "Controle de chamados Dev/TI com SLA de triagem e resolução.",
        '<div class="section"><h2>Resumo do Período</h2><p>Tickets abertos: ' +
          ticketsAbertos +
          " | SLA em atenção: " +
          ticketsSlaAtencao +
          '</p></div><div class="section"><h2>Tickets</h2><table><thead><tr><th>Código</th><th>Abertura</th><th>Portal</th><th>Banco</th><th>Motivo</th><th>Severidade</th><th>Status</th><th>SLA Resolução</th><th>SLA Status</th></tr></thead><tbody>' +
          rows +
          "</tbody></table></div>",
      );
    }
  }

  function renderDashboard() {
    return <PortalDashboard />;
  }

  function renderTestes() {
    return (
      <>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 14,
          }}
        >
          <KPICard
            icon={FileSearch}
            label="Testes registrados"
            value={testesDiarios.length}
            sub="Produção e homologação"
            color={C.blue}
            glow={C.blueGlow}
            C={C}
          />
          <KPICard
            icon={CheckCircle2}
            label="OK"
            value={bancosOk}
            sub={pctPortal(pctOk) + " da base"}
            color={C.emerald}
            glow={C.emeraldGlow}
            C={C}
          />
          <KPICard
            icon={AlertTriangle}
            label="Falhas"
            value={falhasHoje}
            sub="Com sugestão de ticket"
            color={C.rose}
            glow={C.roseGlow}
            C={C}
          />
          <KPICard
            icon={Clock}
            label="SLA máximo"
            value="3s / 5s / 10s"
            sub="Login, Busca CPF e Token"
            color={C.amber}
            glow={C.amberGlow}
            C={C}
          />
        </div>

        <div style={{ ...card(C), padding: 0, overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: 1450,
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid " + C.border }}>
                {[
                  "Data",
                  "Portal",
                  "Banco",
                  "Ambiente",
                  "Etapa",
                  "Status",
                  "Motivo",
                  "Severidade",
                  "Tempo",
                  "SLA",
                  "Responsável",
                  "Evidência",
                  "Ação",
                ].map((h) => (
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
              {testesDiarios.map((item, index) => {
                const st = statusColor(item.status);
                return (
                  <tr
                    key={index}
                    style={{ borderBottom: "1px solid " + C.border }}
                  >
                    <td
                      style={{
                        padding: "15px 16px",
                        fontSize: 12,
                        color: C.t2,
                      }}
                    >
                      {item.data_teste}
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        fontSize: 12,
                        color: C.t1,
                        fontWeight: 900,
                      }}
                    >
                      {item.portal}
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        fontSize: 12,
                        color: C.t2,
                      }}
                    >
                      {item.banco}
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        fontSize: 12,
                        color: C.t2,
                      }}
                    >
                      {item.ambiente}
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        fontSize: 12,
                        color: C.t2,
                      }}
                    >
                      {item.etapa}
                    </td>
                    <td style={{ padding: "15px 16px" }}>
                      <Chip label={item.status} color={st.color} bg={st.bg} />
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        fontSize: 12,
                        color: C.t2,
                      }}
                    >
                      {item.motivo_erro}
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        fontSize: 12,
                        color: item.severidade === "Alta" ? C.rose : C.amber,
                        fontWeight: 900,
                      }}
                    >
                      {item.severidade}
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        fontSize: 12,
                        color: C.t2,
                      }}
                    >
                      {intBR(item.tempo_resposta_ms)} ms
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        fontSize: 12,
                        color: C.blue,
                        fontWeight: 900,
                      }}
                    >
                      {item.sla_etapa}
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        fontSize: 12,
                        color: C.t2,
                      }}
                    >
                      {item.responsavel_teste}
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        fontSize: 12,
                        color: C.t2,
                      }}
                    >
                      {item.evidencia_url}
                    </td>
                    <td style={{ padding: "15px 16px" }}>
                      <button
                        onClick={() =>
                          notifyInfo("MVP: abrir ticket a partir desta falha.")
                        }
                        style={{
                          border: "1px solid " + C.border,
                          background: C.surface,
                          color: C.blue,
                          borderRadius: 10,
                          padding: "7px 10px",
                          cursor: "pointer",
                          fontSize: 11,
                          fontWeight: 900,
                        }}
                      >
                        Abrir Ticket
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  function renderUsabilidade() {
    return (
      <>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 14,
          }}
        >
          <KPICard
            icon={Star}
            label="Nota média"
            value={notaUsabilidade.toFixed(1).replace(".", ",") + "/5"}
            sub="Checklist consolidado"
            color={C.violet}
            glow={C.violetGlow}
            C={C}
          />
          <KPICard
            icon={AlertTriangle}
            label="Itens críticos"
            value={
              usabilidade.filter(
                (i) => i.severidade === "Alta" || i.severidade === "Crítica",
              ).length
            }
            sub="Gerar plano de ação"
            color={C.rose}
            glow={C.roseGlow}
            C={C}
          />
          <KPICard
            icon={Eye}
            label="Categorias"
            value="6"
            sub="Navegação, visual, texto, acessibilidade, performance e erros"
            color={C.blue}
            glow={C.blueGlow}
            C={C}
          />
        </div>

        <div style={{ ...card(C), padding: 0, overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: 1350,
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid " + C.border }}>
                {[
                  "Data",
                  "Portal",
                  "Banco",
                  "Categoria",
                  "Item",
                  "Nota",
                  "Achado",
                  "Severidade",
                  "Recomendação",
                  "Evidência",
                ].map((h) => (
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
              {usabilidade.map((item, index) => (
                <tr
                  key={index}
                  style={{ borderBottom: "1px solid " + C.border }}
                >
                  <td
                    style={{ padding: "15px 16px", fontSize: 12, color: C.t2 }}
                  >
                    {item.data}
                  </td>
                  <td
                    style={{
                      padding: "15px 16px",
                      fontSize: 12,
                      color: C.t1,
                      fontWeight: 900,
                    }}
                  >
                    {item.portal}
                  </td>
                  <td
                    style={{ padding: "15px 16px", fontSize: 12, color: C.t2 }}
                  >
                    {item.banco}
                  </td>
                  <td
                    style={{
                      padding: "15px 16px",
                      fontSize: 12,
                      color: C.blue,
                      fontWeight: 900,
                    }}
                  >
                    {item.categoria}
                  </td>
                  <td
                    style={{ padding: "15px 16px", fontSize: 12, color: C.t2 }}
                  >
                    {item.item}
                  </td>
                  <td
                    style={{
                      padding: "15px 16px",
                      fontSize: 12,
                      color:
                        item.nota >= 4
                          ? C.emerald
                          : item.nota >= 3
                            ? C.amber
                            : C.rose,
                      fontWeight: 950,
                    }}
                  >
                    {item.nota}/5
                  </td>
                  <td
                    style={{ padding: "15px 16px", fontSize: 12, color: C.t2 }}
                  >
                    {item.achado}
                  </td>
                  <td
                    style={{
                      padding: "15px 16px",
                      fontSize: 12,
                      color: item.severidade === "Alta" ? C.rose : C.t2,
                      fontWeight: 900,
                    }}
                  >
                    {item.severidade}
                  </td>
                  <td
                    style={{ padding: "15px 16px", fontSize: 12, color: C.t2 }}
                  >
                    {item.recomendacao}
                  </td>
                  <td
                    style={{ padding: "15px 16px", fontSize: 12, color: C.t2 }}
                  >
                    {item.evidencia_url}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  function renderTickets() {
    return (
      <>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 14,
          }}
        >
          <KPICard
            icon={Clock}
            label="Tickets abertos"
            value={ticketsAbertos}
            sub="Não resolvidos"
            color={C.blue}
            glow={C.blueGlow}
            C={C}
          />
          <KPICard
            icon={AlertTriangle}
            label="SLA em atenção"
            value={ticketsSlaAtencao}
            sub="Vencendo ou vencido"
            color={ticketsSlaAtencao > 0 ? C.amber : C.emerald}
            glow={ticketsSlaAtencao > 0 ? C.amberGlow : C.emeraldGlow}
            C={C}
          />
          <KPICard
            icon={Users}
            label="Times envolvidos"
            value="Dev/TI"
            sub="Triagem e resolução"
            color={C.violet}
            glow={C.violetGlow}
            C={C}
          />
        </div>

        <div style={{ ...card(C), padding: 0, overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: 1550,
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid " + C.border }}>
                {[
                  "Código",
                  "Abertura",
                  "Portal",
                  "Banco",
                  "Motivo",
                  "Categoria",
                  "Severidade",
                  "Prioridade",
                  "Status",
                  "Dev/TI",
                  "Time",
                  "SLA Triagem",
                  "SLA Resolução",
                  "SLA Status",
                  "Origem",
                ].map((h) => (
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
              {tickets.map((item) => {
                const slaColor =
                  item.sla_status === "Vencido"
                    ? C.rose
                    : item.sla_status === "Vencendo"
                      ? C.amber
                      : C.emerald;

                return (
                  <tr
                    key={item.ticket_id}
                    style={{ borderBottom: "1px solid " + C.border }}
                  >
                    <td
                      style={{
                        padding: "15px 16px",
                        fontSize: 12,
                        color: C.t1,
                        fontWeight: 950,
                      }}
                    >
                      {item.codigo}
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        fontSize: 12,
                        color: C.t2,
                      }}
                    >
                      {item.data_abertura}
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        fontSize: 12,
                        color: C.t2,
                      }}
                    >
                      {item.portal}
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        fontSize: 12,
                        color: C.t2,
                      }}
                    >
                      {item.banco}
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        fontSize: 12,
                        color: C.t2,
                      }}
                    >
                      {item.motivo}
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        fontSize: 12,
                        color: C.blue,
                        fontWeight: 900,
                      }}
                    >
                      {item.categoria}
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        fontSize: 12,
                        color: item.severidade === "Alta" ? C.rose : C.amber,
                        fontWeight: 950,
                      }}
                    >
                      {item.severidade}
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        fontSize: 12,
                        color: C.t2,
                      }}
                    >
                      {item.prioridade}
                    </td>
                    <td style={{ padding: "15px 16px" }}>
                      <Chip
                        label={item.status}
                        color={C.blue}
                        bg={C.blueGlow}
                      />
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        fontSize: 12,
                        color: C.t2,
                      }}
                    >
                      {item.dev_responsavel}
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        fontSize: 12,
                        color: C.t2,
                      }}
                    >
                      {item.time_ti}
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        fontSize: 12,
                        color: C.t2,
                      }}
                    >
                      {item.sla_triagem}
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        fontSize: 12,
                        color: C.t2,
                      }}
                    >
                      {item.sla_resolucao}
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        fontSize: 12,
                        color: slaColor,
                        fontWeight: 950,
                      }}
                    >
                      {item.sla_status}
                    </td>
                    <td
                      style={{
                        padding: "15px 16px",
                        fontSize: 12,
                        color: C.t2,
                      }}
                    >
                      {item.origem}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  function safeCsvPortais(value) {
    const text = String(value ?? "").replace(/"/g, '""');
    return '"' + text + '"';
  }

  function baixarCsvPortais(filename, rows) {
    if (!rows || rows.length === 0) {
      notifyWarning("Não há dados para exportar.");
      return;
    }

    const headers = Object.keys(rows[0]);
    const csv = [
      headers.map(safeCsvPortais).join(";"),
      ...rows.map((row) =>
        headers.map((h) => safeCsvPortais(row[h])).join(";"),
      ),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function getDadosExportPortais() {
    const currentTab = typeof tab !== "undefined" ? tab : "monitoria";

    if (currentTab === "testes") {
      return {
        title: "Relatório de Testes Diários",
        filename: "portais_testes_diarios.csv",
        rows: typeof testesDiarios !== "undefined" ? testesDiarios : [],
      };
    }

    if (currentTab === "usabilidade") {
      return {
        title: "Relatório de Usabilidade",
        filename: "portais_usabilidade.csv",
        rows: typeof usabilidade !== "undefined" ? usabilidade : [],
      };
    }

    if (currentTab === "tickets") {
      return {
        title: "Relatório de Tickets dos Portais",
        filename: "portais_tickets.csv",
        rows: typeof tickets !== "undefined" ? tickets : [],
      };
    }

    return {
      title: "Monitoria de Portais",
      filename: "portais_monitoria.csv",
      rows: typeof dadosPortais !== "undefined" ? dadosPortais : [],
    };
  }

  function exportCurrentCsv() {
    const data = getDadosExportPortais();
    baixarCsvPortais(data.filename, data.rows);
  }

  function exportCurrentPdf() {
    const data = getDadosExportPortais();
    const rows = data.rows || [];

    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
    const tableHead = headers
      .map((h) => "<th>" + String(h).replaceAll("_", " ") + "</th>")
      .join("");

    const tableRows = rows
      .slice(0, 80)
      .map((row) => {
        return (
          "<tr>" +
          headers
            .map((h) => "<td>" + String(row[h] ?? "-") + "</td>")
            .join("") +
          "</tr>"
        );
      })
      .join("");

    const janela = window.open("", "_blank", "width=1400,height=950");

    if (!janela) {
      notifyWarning(
        "O navegador bloqueou a janela de impressão. Libere pop-ups e tente novamente.",
      );
      return;
    }

    const html =
      "<!DOCTYPE html>" +
      '<html lang="pt-BR">' +
      "<head>" +
      '<meta charset="UTF-8" />' +
      "<title>" +
      data.title +
      "</title>" +
      "<style>" +
      "*{box-sizing:border-box}" +
      "body{margin:0;padding:24px;font-family:Inter,Arial,sans-serif;background:#f2f4f8;color:#0f172a;-webkit-print-color-adjust:exact;print-color-adjust:exact}" +
      ".actions{display:flex;justify-content:flex-end;gap:8px;margin-bottom:12px}" +
      ".actions button{border:0;border-radius:10px;padding:10px 14px;font-weight:900;cursor:pointer}" +
      ".primary{background:#e11d48;color:#fff}" +
      ".secondary{background:linear-gradient(135deg,#334155,#1f2937);color:#ffffff;border:1px solid #334155!important}" +
      ".cover{background:#ffffff;border:1px solid #e2e8f0;border-top:4px solid #e11d48;border-radius:14px;padding:24px;margin-bottom:18px}" +
      ".tag{display:inline-flex;background:#ffe7ef;color:#e11d48;border:1px solid #f8a0b5;border-radius:999px;padding:6px 10px;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px}" +
      "h1{font-size:28px;margin:0 0 6px;color:#0f172a}" +
      "p{color:#64748b;margin:0;line-height:1.5}" +
      ".grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:14px 0}" +
      ".kpi{background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:13px}" +
      ".kpi small{display:block;color:#64748b;text-transform:uppercase;letter-spacing:.07em;font-size:9px;margin-bottom:5px}" +
      ".kpi strong{display:block;font-size:22px;color:#0f172a}" +
      ".section{background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:16px;margin-bottom:14px;break-inside:avoid}" +
      ".section h2{font-size:16px;margin:0 0 10px;color:#1e293b}" +
      "table{width:100%;border-collapse:collapse;font-size:8.5px;table-layout:fixed}" +
      "th{background:#fef2f5;color:#1e293b;text-align:left;padding:7px 5px;text-transform:uppercase;font-size:7.5px;word-break:break-word}" +
      "td{border-bottom:1px solid #e2e8f0;padding:6px 5px;color:#0f172a;word-break:break-word}" +
      "@page{size:A4 landscape;margin:8mm}" +
      "@media print{.actions{display:none!important}body{padding:0;background:#f2f4f8}.section{break-inside:avoid}}" +
      "</style>" +
      "</head>" +
      "<body>" +
      '<div class="actions"><button class="secondary" onclick="window.close()">Fechar</button><button class="primary" onclick="window.print()">Imprimir / Salvar PDF</button></div>' +
      '<div class="cover"><div class="tag">Portais</div><h1>' +
      data.title +
      "</h1><p>Relatório executivo gerado pela plataforma de Transformação Digital.</p></div>" +
      '<div class="grid">' +
      '<div class="kpi"><small>Total de registros</small><strong>' +
      rows.length +
      "</strong></div>" +
      '<div class="kpi"><small>Módulo</small><strong>Portais</strong></div>' +
      '<div class="kpi"><small>Exportação</small><strong>PDF</strong></div>' +
      '<div class="kpi"><small>Formato</small><strong>Executivo</strong></div>' +
      "</div>" +
      '<div class="section"><h2>Detalhamento</h2><table><thead><tr>' +
      tableHead +
      "</tr></thead><tbody>" +
      tableRows +
      "</tbody></table></div>" +
      "<script>setTimeout(function(){window.focus();window.print()},700)<\\/script>" +
      "</body></html>";

    janela.document.open();
    janela.document.write(html);
    janela.document.close();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionHeader
        title="Gestão de Portais"
        sub="Centralização dos testes diários, usabilidade, tickets, SLA Dev/TI, evidências e relatórios executivos"
        actions={[
          <Btn
            key="pdf"
            label="Exportar PDF"
            icon={Download}
            C={C}
            onClick={exportCurrentPdf}
          />,
          <Btn
            key="csv"
            label="Exportar CSV"
            icon={Download}
            C={C}
            onClick={exportCurrentCsv}
          />,
        ]}
        C={C}
        sticky
      />

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {tabs.map((item) => {
          const active = tab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              style={{
                padding: "9px 14px",
                borderRadius: 12,
                border: "1px solid " + (active ? C.blue : C.border),
                background: active ? C.blueGlow : C.surface,
                color: active ? C.blue : C.t2,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: active ? 950 : 800,
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "monitoria" && renderDashboard()}
      {tab === "testes" && renderTestes()}
      {tab === "usabilidade" && renderUsabilidade()}
      {tab === "tickets" && renderTickets()}
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
    return `${Number(value || 0)
      .toFixed(1)
      .replace(".", ",")}%`;
  }

  function normalizarEtapa(etapa) {
    if (!etapa) return "Backlog";
    const e = String(etapa).trim();

    if (
      [
        "Backlog",
        "Planejamento",
        "Execução",
        "Monitoramento",
        "Encerramento",
      ].includes(e)
    ) {
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
      { totalMensagens: 0, entregue: 0, lido: 0, retorno: 0, acordos: 0 },
    );

    return {
      ...totals,
      entrega:
        totals.totalMensagens > 0
          ? (totals.entregue / totals.totalMensagens) * 100
          : 0,
      leitura:
        totals.totalMensagens > 0
          ? (totals.lido / totals.totalMensagens) * 100
          : 0,
      conversao:
        totals.totalMensagens > 0
          ? (totals.acordos / totals.totalMensagens) * 100
          : 0,
    };
  }

  function getPocStatus(record) {
    return (
      record?.status || record?.record_data?.general?.status || "Em avaliação"
    );
  }

  function getPocRecommendation(record) {
    return (
      record?.recommendation ||
      record?.record_data?.evaluation?.recommendation ||
      "Em avaliação"
    );
  }

  async function carregarIndicadores() {
    if (!isSupabaseConfigured) {
      setLoading(false);
      notifyDatabaseConfigMissingOnce();
      return;
    }

    setLoading(true);

    const [projectsRes, pocsRes, suppliersRes] = await Promise.all([
      supabase.from("registros_do_projeto_scrum").select("*"),
      supabase.from("poc_records").select("*"),
      supabase.from("fornecedores").select("*"),
    ]);

    if (projectsRes.error) {
      console.log("Erro ao carregar projetos:", projectsRes.error);
      notifyError(
        describeAppError(projectsRes.error, {
          action: "carregar",
          subject: "indicadores de projetos",
        }),
        "Erro ao carregar indicadores",
      );
    }
    if (pocsRes.error) {
      console.log("Erro ao carregar POC:", pocsRes.error);
      notifyError(
        describeAppError(pocsRes.error, {
          action: "carregar",
          subject: "indicadores de POC",
        }),
        "Erro ao carregar indicadores",
      );
    }
    if (suppliersRes.error) {
      console.log("Erro ao carregar fornecedores:", suppliersRes.error);
      notifyError(
        describeAppError(suppliersRes.error, {
          action: "carregar",
          subject: "indicadores de fornecedores",
        }),
        "Erro ao carregar indicadores",
      );
    }

    const projetosNormalizados = (projectsRes.data || []).map((registro) => {
      const dados = registro.dados_do_registro || registro.record_data || {};
      const info = dados.projectInfo || {};

      return {
        id: registro.id,
        name:
          registro.nome_do_projeto ||
          registro.project_name ||
          info.nome ||
          "Projeto sem nome",
        responsible:
          registro.responsavel ||
          registro.responsible ||
          info.responsavel ||
          "-",
        current_stage:
          registro.fase_atual ||
          registro.current_phase ||
          info.faseAtual ||
          "Backlog",
        status:
          registro.fase_atual ||
          registro.current_phase ||
          info.faseAtual ||
          "Backlog",
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
  const projetosPorEtapa = [
    "Backlog",
    "Planejamento",
    "Execução",
    "Monitoramento",
    "Encerramento",
  ].map((etapa) => {
    const qtd = projetos.filter(
      (p) => normalizarEtapa(p.current_stage || p.status) === etapa,
    ).length;
    return {
      etapa,
      qtd,
      perc: totalProjetos ? (qtd / totalProjetos) * 100 : 0,
    };
  });

  const projetosEmExecucao =
    projetosPorEtapa.find((p) => p.etapa === "Execução")?.qtd || 0;
  const projetosEncerrados =
    projetosPorEtapa.find((p) => p.etapa === "Encerramento")?.qtd || 0;
  const projetosAtrasados = projetos.filter((p) => {
    const etapa = normalizarEtapa(p.current_stage || p.status);
    return p.end_date && p.end_date < hoje && etapa !== "Encerramento";
  }).length;

  const progressoMedioProjetos =
    totalProjetos > 0
      ? Math.round(
          projetos.reduce(
            (acc, p) => acc + progressoPorEtapa(p.current_stage || p.status),
            0,
          ) / totalProjetos,
        )
      : 0;

  const totalPocs = pocs.length;
  const pocsExecucao = pocs.filter(
    (p) => getPocStatus(p) === "Em Execução",
  ).length;
  const pocsEncerradas = pocs.filter(
    (p) => getPocStatus(p) === "Encerrada",
  ).length;
  const pocsCondicoes = pocs.filter(
    (p) => getPocRecommendation(p) === "Aprovado com condições",
  ).length;

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
    { totalMensagens: 0, entregue: 0, lido: 0, retorno: 0, acordos: 0 },
  );

  const pocEntrega =
    pocTotals.totalMensagens > 0
      ? (pocTotals.entregue / pocTotals.totalMensagens) * 100
      : 0;
  const pocLeitura =
    pocTotals.totalMensagens > 0
      ? (pocTotals.lido / pocTotals.totalMensagens) * 100
      : 0;
  const pocConversao =
    pocTotals.totalMensagens > 0
      ? (pocTotals.acordos / pocTotals.totalMensagens) * 100
      : 0;

  const totalFornecedores = fornecedores.length;
  const fornecedoresAtivos = fornecedores.filter(
    (f) => f.status === "Ativo",
  ).length;
  const fornecedoresRiscoAlto = fornecedores.filter(
    (f) => f.risco === "Alto",
  ).length;
  const incidentesFornecedores = fornecedores.reduce(
    (acc, f) => acc + toNum(f.incidentes_abertos),
    0,
  );
  const scoreMedioFornecedores =
    totalFornecedores > 0
      ? Math.round(
          fornecedores.reduce((acc, f) => acc + toNum(f.performance_score), 0) /
            totalFornecedores,
        )
      : 0;

  const scoreProjetos = progressoMedioProjetos;
  const scorePocs = Math.min(
    100,
    pocEntrega * 0.45 +
      pocLeitura * 0.45 +
      Math.min(100, pocConversao * 30) * 0.1,
  );
  const scoreFornecedores = scoreMedioFornecedores;

  const healthScore = Math.round(
    scoreProjetos * 0.35 + scorePocs * 0.35 + scoreFornecedores * 0.3,
  );

  const healthColor =
    healthScore >= 80 ? C.emerald : healthScore >= 60 ? C.amber : C.rose;

  const alertas = [
    {
      label: "Projetos atrasados",
      value: projetosAtrasados,
      color: projetosAtrasados > 0 ? C.rose : C.emerald,
      desc: "Projetos com prazo vencido e ciclo não encerrado",
    },
    {
      label: "POC com condições",
      value: pocsCondicoes,
      color: pocsCondicoes > 0 ? C.amber : C.emerald,
      desc: "POC aprovada com ressalvas",
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
        sub="Central de acompanhamento da Transformação Digital: projetos, POC, fornecedores, riscos e performance."
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
        sticky
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 14,
        }}
      >
        <KPICard
          icon={Activity}
          label="Saúde geral"
          value={`${healthScore}%`}
          sub="Score consolidado"
          color={healthColor}
          glow={
            healthScore >= 80
              ? C.emeraldGlow
              : healthScore >= 60
                ? C.amberGlow
                : C.roseGlow
          }
          C={C}
        />
        <KPICard
          icon={FolderKanban}
          label="Projetos"
          value={totalProjetos}
          sub={`${projetosEmExecucao} em execução`}
          color={C.blue}
          glow={C.blueGlow}
          C={C}
        />
        <KPICard
          icon={FlaskConical}
          label="POC"
          value={totalPocs}
          sub={`${pocsExecucao} em execução`}
          color={C.violet}
          glow={C.violetGlow}
          C={C}
        />
        <KPICard
          icon={Users}
          label="Fornecedores"
          value={totalFornecedores}
          sub={`${fornecedoresAtivos} ativos`}
          color={C.emerald}
          glow={C.emeraldGlow}
          C={C}
        />
        <KPICard
          icon={AlertTriangle}
          label="Alertas"
          value={
            projetosAtrasados +
            pocsCondicoes +
            fornecedoresRiscoAlto +
            incidentesFornecedores
          }
          sub="Pontos de atenção"
          color={
            projetosAtrasados +
              pocsCondicoes +
              fornecedoresRiscoAlto +
              incidentesFornecedores >
            0
              ? C.rose
              : C.emerald
          }
          glow={
            projetosAtrasados +
              pocsCondicoes +
              fornecedoresRiscoAlto +
              incidentesFornecedores >
            0
              ? C.roseGlow
              : C.emeraldGlow
          }
          C={C}
        />
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16 }}
      >
        <div style={{ ...card(C), padding: "22px 24px" }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: C.t1,
              marginBottom: 4,
            }}
          >
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
            <div
              style={{
                fontSize: 10,
                color: C.t3,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 900,
              }}
            >
              Etapa
            </div>
            <div
              style={{
                fontSize: 10,
                color: C.t3,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 900,
                textAlign: "right",
              }}
            >
              Qtd.
            </div>
            <div
              style={{
                fontSize: 10,
                color: C.t3,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 900,
                textAlign: "right",
              }}
            >
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
                    <span
                      style={{ fontSize: 13, color: C.t2, fontWeight: 900 }}
                    >
                      {item.etapa}
                    </span>

                    <span
                      style={{
                        fontSize: 12,
                        color,
                        fontWeight: 900,
                        textAlign: "right",
                      }}
                    >
                      {item.qtd}
                    </span>

                    <span
                      style={{
                        fontSize: 12,
                        color,
                        fontWeight: 900,
                        textAlign: "right",
                      }}
                    >
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
          <div
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: C.t1,
              marginBottom: 4,
            }}
          >
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
                  <div style={{ fontSize: 13, color: C.t1, fontWeight: 900 }}>
                    {a.label}
                  </div>
                  <div style={{ fontSize: 11, color: C.t3, marginTop: 3 }}>
                    {a.desc}
                  </div>
                </div>
                <strong style={{ fontSize: 22, color: a.color }}>
                  {a.value}
                </strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}
      >
        <div style={{ ...card(C), padding: "22px 24px" }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: C.t1,
              marginBottom: 4,
            }}
          >
            Performance das POC
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 13, color: C.t2, fontWeight: 800 }}>
                  {label}
                </span>
                <span style={{ fontSize: 12, color, fontWeight: 900 }}>
                  {pct(value)}
                </span>
              </div>
              <ProgressBar val={Math.min(100, value)} color={color} C={C} />
            </div>
          ))}

          <div
            style={{
              marginTop: 16,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
            }}
          >
            <div
              style={{
                background: C.bg3,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: 10,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: C.t3,
                  textTransform: "uppercase",
                }}
              >
                Mensagens
              </div>
              <div style={{ fontSize: 16, color: C.t1, fontWeight: 900 }}>
                {pocTotals.totalMensagens}
              </div>
            </div>
            <div
              style={{
                background: C.bg3,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: 10,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: C.t3,
                  textTransform: "uppercase",
                }}
              >
                Retornos
              </div>
              <div style={{ fontSize: 16, color: C.amber, fontWeight: 900 }}>
                {pocTotals.retorno}
              </div>
            </div>
            <div
              style={{
                background: C.bg3,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: 10,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: C.t3,
                  textTransform: "uppercase",
                }}
              >
                Acordos
              </div>
              <div style={{ fontSize: 16, color: C.rose, fontWeight: 900 }}>
                {pocTotals.acordos}
              </div>
            </div>
          </div>
        </div>

        <div style={{ ...card(C), padding: "22px 24px" }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: C.t1,
              marginBottom: 4,
            }}
          >
            Fornecedores
          </div>
          <div style={{ fontSize: 12, color: C.t3, marginBottom: 18 }}>
            Performance e risco operacional
          </div>

          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 13, color: C.t2, fontWeight: 800 }}>
                Score médio
              </span>
              <span
                style={{
                  fontSize: 12,
                  color:
                    scoreMedioFornecedores >= 80
                      ? C.emerald
                      : scoreMedioFornecedores >= 60
                        ? C.amber
                        : C.rose,
                  fontWeight: 900,
                }}
              >
                {scoreMedioFornecedores}%
              </span>
            </div>
            <ProgressBar
              val={scoreMedioFornecedores}
              color={
                scoreMedioFornecedores >= 80
                  ? C.emerald
                  : scoreMedioFornecedores >= 60
                    ? C.amber
                    : C.rose
              }
              C={C}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 10,
            }}
          >
            <div
              style={{
                background: C.bg3,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: 12,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: C.t3,
                  textTransform: "uppercase",
                }}
              >
                Ativos
              </div>
              <div style={{ fontSize: 22, color: C.emerald, fontWeight: 950 }}>
                {fornecedoresAtivos}
              </div>
            </div>
            <div
              style={{
                background: C.bg3,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: 12,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: C.t3,
                  textTransform: "uppercase",
                }}
              >
                Alto risco
              </div>
              <div
                style={{
                  fontSize: 22,
                  color: fornecedoresRiscoAlto > 0 ? C.rose : C.emerald,
                  fontWeight: 950,
                }}
              >
                {fornecedoresRiscoAlto}
              </div>
            </div>
          </div>
        </div>

        <div style={{ ...card(C), padding: "22px 24px" }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: C.t1,
              marginBottom: 4,
            }}
          >
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
              const color =
                score >= 80 ? C.emerald : score >= 60 ? C.amber : C.rose;

              return (
                <div
                  key={item.id || item.nome}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
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
                    <div
                      style={{
                        fontSize: 12,
                        color: C.t1,
                        fontWeight: 900,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
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

// ---
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
      {
        disparado: 0,
        entregue: 0,
        lido: 0,
        retorno: 0,
        acordos: 0,
        totalMensagens: 0,
      },
    );

    return {
      ...totals,
      entrega:
        totals.totalMensagens > 0
          ? Math.round((totals.entregue / totals.totalMensagens) * 100)
          : 0,
      leitura:
        totals.totalMensagens > 0
          ? Math.round((totals.lido / totals.totalMensagens) * 100)
          : 0,
      conversao:
        totals.disparado > 0
          ? ((totals.acordos / totals.disparado) * 100).toFixed(2)
          : "0.00",
    };
  }

  async function carregarPocs() {
    if (!isSupabaseConfigured) {
      setLoading(false);
      notifyDatabaseConfigMissingOnce();
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("poc_records")
      .select("*")
      .order("updated_at", { ascending: false });

    setLoading(false);

    if (error) {
      console.log("Erro ao carregar POC:", error);
      notifyError(
        describeAppError(error, {
          action: "carregar",
          subject: "lista de POCs",
        }),
        "Erro ao carregar POCs",
      );
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
  const comCondicoes = records.filter(
    (r) => r.recommendation === "Aprovado com condições",
  ).length;

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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 14,
                marginBottom: 18,
              }}
            >
              <div>
                <div style={{ fontSize: 20, color: C.t1, fontWeight: 950 }}>
                  Selecionar tipo de POC
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: C.t3,
                    marginTop: 5,
                    lineHeight: 1.5,
                  }}
                >
                  Escolha o modelo antes de iniciar. O layout do relatório será
                  carregado conforme a categoria.
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

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
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
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 950,
                      color: item.color,
                      marginBottom: 8,
                    }}
                  >
                    {item.titulo}
                  </div>
                  <div style={{ fontSize: 12, color: C.t2, lineHeight: 1.55 }}>
                    {item.desc}
                  </div>
                  <div
                    style={{
                      marginTop: 18,
                      fontSize: 12,
                      fontWeight: 900,
                      color: item.color,
                    }}
                  >
                    Iniciar POC
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
        title="POC — Proof of Concept"
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
        sticky
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
        }}
      >
        <KPICard
          icon={FlaskConical}
          label="POC registrada"
          value={total}
          sub={loading ? "Carregando..." : "Registro de validações"}
          color={C.blue}
          glow={C.blueGlow}
          C={C}
        />
        <KPICard
          icon={Activity}
          label="Em execução"
          value={emExecucao}
          sub="Testes ativos"
          color={C.emerald}
          glow={C.emeraldGlow}
          C={C}
        />
        <KPICard
          icon={CheckCircle2}
          label="Encerradas"
          value={encerradas}
          sub="POC finalizada"
          color={C.violet}
          glow={C.violetGlow}
          C={C}
        />
        <KPICard
          icon={AlertTriangle}
          label="Com condições"
          value={comCondicoes}
          sub="Atenção"
          color={C.amber}
          glow={C.amberGlow}
          C={C}
        />
      </div>

      <div
        style={{
          ...card(C),
          padding: 0,
          overflowX: "auto",
          overflowY: "hidden",
        }}
      >
        <table
          style={{ width: "100%", minWidth: 1380, borderCollapse: "collapse" }}
        >
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {[
                "POC",
                "Fornecedor",
                "Responsável",
                "Status",
                "Entrega",
                "Leitura",
                "Conversão",
                "Recomendação",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "14px 16px",
                    fontSize: 11,
                    fontWeight: 600,
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
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = C.cardHov)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td style={{ padding: "15px 16px" }}>
                    <div style={{ fontSize: 13, color: C.t1, fontWeight: 800 }}>
                      {record.poc_name}
                    </div>
                    <div style={{ fontSize: 11, color: C.t3, marginTop: 3 }}>
                      Atualizada em{" "}
                      {new Date(
                        record.updated_at || record.created_at,
                      ).toLocaleDateString("pt-BR")}
                    </div>
                  </td>

                  <td
                    style={{ padding: "15px 16px", fontSize: 12, color: C.t2 }}
                  >
                    {record.supplier || "-"}
                  </td>

                  <td
                    style={{ padding: "15px 16px", fontSize: 12, color: C.t2 }}
                  >
                    {record.responsible || "-"}
                  </td>

                  <td style={{ padding: "15px 16px" }}>
                    <Chip
                      label={record.status || "Em Planejamento"}
                      color={statusColor}
                      bg={statusColor + "22"}
                    />
                  </td>

                  <td
                    style={{ padding: "15px 16px", fontSize: 12, color: C.t2 }}
                  >
                    <strong
                      style={{
                        color:
                          m.entrega >= 85
                            ? C.emerald
                            : m.entrega >= 70
                              ? C.amber
                              : C.rose,
                      }}
                    >
                      {m.entrega}%
                    </strong>
                  </td>

                  <td
                    style={{ padding: "15px 16px", fontSize: 12, color: C.t2 }}
                  >
                    <strong
                      style={{
                        color:
                          m.leitura >= 60
                            ? C.emerald
                            : m.leitura >= 45
                              ? C.amber
                              : C.rose,
                      }}
                    >
                      {m.leitura}%
                    </strong>
                  </td>

                  <td
                    style={{ padding: "15px 16px", fontSize: 12, color: C.t2 }}
                  >
                    <strong style={{ color: C.violet }}>{m.conversao}%</strong>
                  </td>

                  <td
                    style={{ padding: "15px 16px", fontSize: 12, color: C.t2 }}
                  >
                    {record.recommendation || "Em avaliação"}
                  </td>
                </tr>
              );
            })}

            {records.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    padding: 30,
                    textAlign: "center",
                    color: C.t3,
                    fontSize: 13,
                  }}
                >
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

const channelKpis = [
  {
    icon: ArrowUpRight,
    label: "Retorno Total",
    value: "30.167",
    sub: "Total de contatos",
    colorKey: "blue",
  },
  {
    icon: Handshake,
    label: "Acordos Gerados",
    value: "3.026",
    sub: "Total de acordos",
    colorKey: "emerald",
  },
  {
    icon: CreditCard,
    label: "Pagamentos",
    value: "1.031",
    sub: "Pagamentos realizados",
    colorKey: "violet",
  },
  {
    icon: CircleDollarSign,
    label: "Valor Total",
    value: "R$ 3.004.796,76",
    sub: "Valor financeiro gerado",
    colorKey: "amber",
  },
  {
    icon: Target,
    label: "Efetividade Geral",
    value: "34,47%",
    sub: "Taxa de efetividade",
    colorKey: "emerald",
  },
  {
    icon: AlertTriangle,
    label: "Gargalo dos Portais",
    value: "Token 14,83%",
    sub: "Envio de token nos portais",
    colorKey: "rose",
  },
];

const channelComparison = [
  {
    metric: "Entradas no canal",
    description: "Quantidade de contatos ou buscas que iniciaram a jornada.",
    whatsapp: 3920,
    portais: 26247,
  },
  {
    metric: "Acordos concluídos",
    description: "Negociações que avançaram até a geração de um acordo.",
    whatsapp: 2991,
    portais: 35,
  },
  {
    metric: "Valor financeiro gerado",
    description: "Soma dos valores associados aos resultados de cada canal.",
    whatsapp: 2782051,
    portais: 222745,
    isMoney: true,
  },
];

const whatsappRows = [
  ["ASC", "217", "200", "91", "R$ 83.114,07", "45,50%"],
  ["CDA", "9", "9", "5", "R$ 2.262,81", "55,56%"],
  ["OTIMA", "1.655", "1.276", "180", "R$ 1.225.123,42", "14,11%"],
  ["PRIMACOM", "970", "773", "404", "R$ 431.402,87", "52,26%"],
  ["SMARTNX", "1.068", "732", "350", "R$ 1.039.446,19", "47,81%"],
  ["ZAP2GO", "1", "1", "1", "R$ 702,00", "100,00%"],
  ["TOTAL", "3.920", "2.991", "1.031", "R$ 2.782.051,36", "34,47%"],
];

const portalRows = [
  ["Bradesco", "1.290", "53", "1", "R$ 3.767,35", "92,95%", "27,44%"],
  ["Genérico", "24.931", "302", "25", "R$ 206.716,74", "10,76%", "27,58%"],
  ["Itaú", "5", "4", "0", "R$ 0,00", "80,00%", "25,00%"],
  ["Itaú PF", "14", "81", "8", "R$ 10.162,56", "-", "-"],
  ["Itaú PJ", "0", "42", "1", "R$ 2.098,75", "-", "-"],
  ["PanRefin", "7", "0", "0", "R$ 0,00", "85,71%", "0,00%"],
  ["Total Consolidado", "26.247", "482", "35", "R$ 222.745,40", "14,83%", "27,49%"],
];

const portalFunnel = [
  { step: 1, label: "Buscas iniciadas", value: "26.247", detail: "Clientes consultados nos portais", rate: "100% da entrada", state: "neutral" },
  { step: 2, label: "Opções de pagamento", value: "482", detail: "Clientes que visualizaram uma opção", rate: "1,84% das buscas", state: "neutral" },
  { step: 3, label: "Envio de token", value: "14,83%", detail: "Taxa de tokens enviados", rate: "Gargalo principal", state: "warning" },
  { step: 4, label: "Validação do token", value: "27,49%", detail: "Taxa de tokens validados", rate: "Ponto de atenção", state: "warning" },
  { step: 5, label: "Acordos gerados", value: "35", detail: "Jornadas concluídas com acordo", rate: "0,13% das buscas", state: "success" },
];

const channelExecutiveSummary = [
  {
    icon: MessageCircle,
    label: "Canal com maior valor",
    value: "WhatsApp",
    metric: "R$ 2,78 mi",
    detail: "1.031 pagamentos realizados",
    colorKey: "emerald",
  },
  {
    icon: Landmark,
    label: "Potencial dos portais",
    value: "26.247 buscas",
    metric: "35 acordos",
    detail: "Grande entrada, baixa conversão final",
    colorKey: "blue",
  },
  {
    icon: ShieldAlert,
    label: "Atenção imediata",
    value: "Envio de token",
    metric: "14,83%",
    detail: "Etapa prioritária para otimização",
    colorKey: "rose",
  },
];

const executiveHighlights = [
  {
    label: "Canal líder",
    value: "WhatsApp",
    note: "R$ 2,78 mi gerados",
    icon: Award,
    colorKey: "emerald",
  },
  {
    label: "Ponto crítico",
    value: "Token",
    note: "14,83% de envio",
    icon: ShieldAlert,
    colorKey: "rose",
  },
  {
    label: "Alavanca",
    value: "Portais",
    note: "26.247 buscas no topo",
    icon: Target,
    colorKey: "blue",
  },
];

const executiveActions = [
  {
    title: "Revisar autenticação dos portais",
    detail: "Priorizar envio e validação de token para reduzir perda no meio do funil.",
    tone: "critical",
  },
  {
    title: "Replicar práticas de Primacom e SmartNX",
    detail: "Fornecedor com melhor equilíbrio entre escala, conversão e pagamento.",
    tone: "success",
  },
  {
    title: "Acompanhar eficiência da Ótima",
    detail: "Maior valor pago, mas efetividade abaixo dos demais fornecedores.",
    tone: "warning",
  },
];

function ChannelKpiCard({ item, C }) {
  const Icon = item.icon;
  const color = C[item.colorKey] || C.blue;
  const glow = C[`${item.colorKey}Glow`] || C.blueGlow;

  return (
    <div
      style={{
        ...card(C),
        padding: 18,
        display: "flex",
        alignItems: "center",
        gap: 14,
        minHeight: 112,
        overflow: "hidden",
        position: "relative",
        borderTop: `3px solid ${color}`,
      }}
    >
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: 12,
          background: glow,
          color,
          border: `1px solid ${color}26`,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={23} />
      </div>
      <div style={{ minWidth: 0, position: "relative", zIndex: 1 }}>
        <div style={{ color: C.t2, fontSize: 12, fontWeight: 800 }}>
          {item.label}
        </div>
        <div
          style={{
            color: C.t1,
            fontSize: item.value.length > 12 ? 18 : 22,
            fontWeight: 850,
            lineHeight: 1.15,
            marginTop: 5,
            overflowWrap: "anywhere",
          }}
        >
          {item.value}
        </div>
        <div style={{ color: C.t3, fontSize: 11, marginTop: 6 }}>
          {item.sub}
        </div>
      </div>
    </div>
  );
}

function ChannelSectionTitle({ icon: Icon, title, C, right }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        {Icon && <Icon size={17} color={C.blue} />}
        <h3 style={{ margin: 0, color: C.t1, fontSize: 16, fontWeight: 800 }}>
          {title}
        </h3>
      </div>
      {right}
    </div>
  );
}

function ChannelTable({ headers, rows, C, highlightIndexes = [] }) {
  return (
    <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${C.border}` }}>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 12 }}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} style={{ padding: "11px 10px", whiteSpace: "nowrap" }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => {
            const isTotal = rowIndex === rows.length - 1;
            return (
              <tr key={row.join("-")}>
                {row.map((cell, cellIndex) => {
                  const isPositive =
                    String(cell).includes("52,26") ||
                    String(cell).includes("47,81") ||
                    String(cell).includes("100,00");
                  const isWarning =
                    String(cell).includes("14,11") ||
                    String(cell).includes("10,76") ||
                    String(cell).includes("0,00%");

                  return (
                    <td
                      key={`${cell}-${cellIndex}`}
                      style={{
                        padding: "10px",
                        color: isPositive ? C.emerald : isWarning ? C.amber : C.t2,
                        fontWeight: isTotal || isPositive || isWarning ? 800 : 600,
                        background:
                          isTotal
                            ? C.bg3
                            : highlightIndexes.includes(rowIndex) && cellIndex === 4
                              ? C.amberGlow
                              : "transparent",
                        borderTop: rowIndex === 0 ? "none" : `1px solid ${C.border}`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {cell}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PerformanceChannelsView({ C }) {
  const chartMoneyFormatter = (value) =>
    value >= 1000000 ? `R$ ${(value / 1000000).toFixed(1).replace(".", ",")} mi` : value >= 1000 ? `R$ ${(value / 1000).toFixed(0)} mil` : value;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 10px",
              borderRadius: 999,
              background: C.blueGlow,
              color: C.blue,
              border: `1px solid ${C.blue}22`,
              fontSize: 11,
              fontWeight: 800,
              marginBottom: 10,
            }}
          >
            <TrendingUp size={13} />
            Canais digitais
          </div>
          <h1 style={{ margin: 0, color: C.t1, fontSize: 34, fontWeight: 750 }}>
            Performance de Canais
          </h1>
          <p style={{ margin: "7px 0 0", color: C.t2, fontSize: 14 }}>
            Visão executiva de geração de valor, conversão e gargalos dos canais digitais.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            style={{
              border: `1px solid ${C.border}`,
              background: C.card,
              color: C.t2,
              borderRadius: 12,
              padding: "10px 13px",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
            }}
          >
            <CalendarDays size={15} />
            01/06/2026 - 21/06/2026
          </button>
          <button
            style={{
              border: `1px solid ${C.border}`,
              background: C.card,
              color: C.t2,
              borderRadius: 12,
              padding: "10px 13px",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
            }}
          >
            <Filter size={15} />
            Filtros
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          alignItems: "stretch",
        }}
      >
        {executiveHighlights.map((item) => {
          const Icon = item.icon;
          const color = C[item.colorKey] || C.blue;
          const glow = C[`${item.colorKey}Glow`] || C.blueGlow;
          return (
            <div
              key={item.label}
              style={{
                padding: 16,
                borderRadius: 12,
                background: C.surface,
                border: `1px solid ${C.border}`,
                display: "flex",
                alignItems: "center",
                gap: 13,
                minHeight: 96,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: glow,
                  color,
                  border: `1px solid ${color}24`,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Icon size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: C.t3, fontSize: 11, fontWeight: 800 }}>{item.label}</div>
                <div style={{ color: C.t1, fontSize: 20, fontWeight: 850, marginTop: 4 }}>
                  {item.value}
                </div>
                <div style={{ color: C.t2, fontSize: 12, marginTop: 4 }}>{item.note}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 14,
        }}
      >
        {channelKpis.map((item) => (
          <ChannelKpiCard key={item.label} item={item} C={C} />
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          gap: 16,
        }}
      >
        <div style={{ ...card(C), padding: 18 }}>
          <ChannelSectionTitle icon={ClipboardList} title="Resumo executivo" C={C} />
          <div style={{ display: "grid", gap: 10 }}>
            {channelExecutiveSummary.map((item) => {
              const Icon = item.icon;
              const color = C[item.colorKey] || C.blue;
              const glow = C[`${item.colorKey}Glow`] || C.blueGlow;
              return (
                <div
                  key={item.label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "38px minmax(0, 1fr) auto",
                    alignItems: "center",
                    gap: 11,
                    padding: 12,
                    borderRadius: 11,
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <span
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      display: "grid",
                      placeItems: "center",
                      background: glow,
                      color,
                    }}
                  >
                    <Icon size={17} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: C.t3, fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>
                      {item.label}
                    </div>
                    <div style={{ color: C.t1, fontSize: 14, fontWeight: 850, marginTop: 3 }}>
                      {item.value}
                    </div>
                    <div style={{ color: C.t2, fontSize: 11, marginTop: 2 }}>
                      {item.detail}
                    </div>
                  </div>
                  <strong style={{ color, fontSize: 14, textAlign: "right" }}>{item.metric}</strong>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ ...card(C), padding: 18, minHeight: 280 }}>
          <ChannelSectionTitle title="Comparativo por canal" C={C} />
          <p style={{ color: C.t3, fontSize: 11, lineHeight: 1.5, margin: "-7px 0 14px" }}>
            Compare WhatsApp e Portais dentro da mesma métrica. As barras representam a proporção entre os dois canais.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {channelComparison.map((item) => {
              const max = Math.max(item.whatsapp, item.portais);
              const leader = item.whatsapp > item.portais ? "WhatsApp" : "Portais";
              return (
                <div
                  key={item.metric}
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 13 }}>
                    <div>
                      <div style={{ color: C.t1, fontSize: 14, fontWeight: 850 }}>{item.metric}</div>
                      <div style={{ color: C.t3, fontSize: 11, lineHeight: 1.45, marginTop: 4 }}>
                        {item.description}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "5px 8px",
                        borderRadius: 999,
                        color: leader === "WhatsApp" ? C.blue : C.violet,
                        background: leader === "WhatsApp" ? C.blueGlow : C.violetGlow,
                        fontSize: 10,
                        fontWeight: 800,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Maior resultado: {leader}
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
                    {[
                      ["WhatsApp", item.whatsapp, C.blue, C.blueGlow],
                      ["Portais", item.portais, C.violet, C.violetGlow],
                    ].map(([label, value, color, glow]) => (
                      <div
                        key={label}
                        style={{
                          padding: 12,
                          borderRadius: 10,
                          background: C.card,
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 7, color: C.t2, fontSize: 11, fontWeight: 800 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 99, background: color }} />
                          {label}
                        </div>
                        <strong style={{ display: "block", color: C.t1, fontSize: 20, marginTop: 8, letterSpacing: "-0.02em" }}>
                          {item.isMoney ? chartMoneyFormatter(value) : value.toLocaleString("pt-BR")}
                        </strong>
                        <div style={{ height: 7, borderRadius: 99, background: C.bg3, overflow: "hidden", marginTop: 10 }}>
                          <div
                            style={{
                              width: `${Math.max(4, (value / max) * 100)}%`,
                              height: "100%",
                              borderRadius: 99,
                              background: color,
                              boxShadow: `0 0 12px ${glow}`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ ...card(C), padding: 18, minWidth: 0 }}>
          <ChannelSectionTitle icon={MessageCircle} title="WhatsApp por fornecedor" C={C} />
          <ChannelTable
            C={C}
            headers={["Fornecedor", "Retorno", "Acordo", "Pagamento", "Valor Pago", "Efetividade"]}
            rows={whatsappRows}
            highlightIndexes={[2]}
          />
        </div>

        <div style={{ ...card(C), padding: 18, minWidth: 0 }}>
          <ChannelSectionTitle
            icon={Landmark}
            title="Portais de Negociação"
            C={C}
            right={
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 10px",
                  borderRadius: 999,
                  background: C.roseGlow,
                  border: `1px solid ${C.rose}28`,
                  color: C.rose,
                  fontSize: 11,
                  fontWeight: 850,
                  whiteSpace: "nowrap",
                }}
              >
                <AlertTriangle size={13} />
                Gargalo crítico: baixa conversão no token
              </span>
            }
          />
          <ChannelTable
            C={C}
            headers={[
              "Portal",
              "Busca cliente",
              "Opção pagamento",
              "Acordo gerado",
              "Valor gerado",
              "% Envio token",
              "% Validação token",
            ]}
            rows={portalRows}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          gap: 16,
        }}
      >
        <div style={{ ...card(C), padding: 18 }}>
          <ChannelSectionTitle icon={Filter} title="Funil dos Portais" C={C} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "10px 12px",
              marginBottom: 14,
              borderRadius: 10,
              background: C.surface,
              border: `1px solid ${C.border}`,
            }}
          >
            <div>
              <div style={{ color: C.t1, fontSize: 12, fontWeight: 850 }}>
                Jornada da busca até o acordo
              </div>
              <div style={{ color: C.t3, fontSize: 10, marginTop: 3 }}>
                Cada etapa mostra o volume ou a taxa disponível no relatório consolidado.
              </div>
            </div>
            <span style={{ color: C.rose, background: C.roseGlow, padding: "6px 9px", borderRadius: 999, fontSize: 10, fontWeight: 850, whiteSpace: "nowrap" }}>
              Conversão final: 0,13%
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
              gap: 10,
            }}
          >
            {portalFunnel.map((step) => {
              const isWarning = step.state === "warning";
              const isSuccess = step.state === "success";
              const accent = isSuccess ? C.emerald : isWarning ? C.amber : C.blue;
              const bg = isSuccess ? C.emeraldGlow : isWarning ? C.amberGlow : C.surface;
              return (
                <div
                  key={step.label}
                  style={{
                    border: `1px solid ${accent}30`,
                    background: bg,
                    borderRadius: 12,
                    padding: 14,
                    minHeight: 152,
                    display: "flex",
                    flexDirection: "column",
                    gridColumn: isSuccess ? "1 / -1" : "auto",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span
                      style={{
                        width: 25,
                        height: 25,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: 8,
                        color: accent,
                        background: C.card,
                        border: `1px solid ${accent}30`,
                        fontSize: 10,
                        fontWeight: 900,
                      }}
                    >
                      {step.step}
                    </span>
                    <span style={{ color: accent, fontSize: 9, fontWeight: 850, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {step.rate}
                    </span>
                  </div>
                  <div style={{ color: C.t2, fontSize: 11, fontWeight: 850, marginTop: 13 }}>
                    {step.label}
                  </div>
                  <div style={{ color: C.t1, fontSize: 24, fontWeight: 900, marginTop: 5, letterSpacing: "-0.03em" }}>
                    {step.value}
                  </div>
                  <div style={{ color: C.t3, fontSize: 10, lineHeight: 1.4, marginTop: "auto", paddingTop: 8 }}>
                    {step.detail}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ ...card(C), padding: 18 }}>
          <ChannelSectionTitle icon={Lightbulb} title="Insights do período" C={C} />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              ["success", "WhatsApp lidera a geração de valor com R$ 2,78 mi."],
              ["warning", "Ótima lidera em valor, mas apresenta menor efetividade."],
              ["success", "Primacom e SmartNX têm melhor equilíbrio entre escala e conversão."],
              ["warning", "Portais possuem potencial, mas precisam otimizar autenticação e token."],
            ].map(([type, text]) => {
              const success = type === "success";
              return (
                <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 10, color: C.t2, fontSize: 14, lineHeight: 1.55 }}>
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "grid",
                      placeItems: "center",
                      background: success ? C.emeraldGlow : C.amberGlow,
                      color: success ? C.emerald : C.amber,
                      border: `1px solid ${success ? C.emerald : C.amber}24`,
                    }}
                  >
                    {success ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                  </span>
                  <span>{text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ ...card(C), padding: 18 }}>
        <ChannelSectionTitle icon={Shield} title="Prioridades executivas" C={C} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 12,
          }}
        >
          {executiveActions.map((action, index) => {
            const tone =
              action.tone === "success"
                ? { color: C.emerald, bg: C.emeraldGlow }
                : action.tone === "warning"
                  ? { color: C.amber, bg: C.amberGlow }
                  : { color: C.rose, bg: C.roseGlow };
            return (
              <div
                key={action.title}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 9,
                    background: tone.bg,
                    color: tone.color,
                    display: "grid",
                    placeItems: "center",
                    border: `1px solid ${tone.color}24`,
                    flexShrink: 0,
                    fontSize: 12,
                    fontWeight: 850,
                  }}
                >
                  {index + 1}
                </div>
                <div>
                  <div style={{ color: C.t1, fontSize: 13, fontWeight: 850 }}>
                    {action.title}
                  </div>
                  <div style={{ color: C.t2, fontSize: 12, lineHeight: 1.55, marginTop: 5 }}>
                    {action.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---
const navItems = [
  { id: "indicators", label: "Control Tower", icon: BarChart3 },
  { id: "performanceChannels", label: "Performance de Canais", icon: TrendingUp },
  { id: "projects", label: "Projetos", icon: FolderKanban },
  { id: "poc", label: "POC", icon: FlaskConical },
  { id: "suppliers", label: "Fornecedores", icon: Globe },
  { id: "portals", label: "Portais", icon: FileSearch },
  { id: "errorBot", label: "Bot de Erros", icon: ShieldAlert },
];

function Sidebar({ active, setActive, C }) {
  return (
    <div
      className="app-sidebar"
      style={{
        width: C.sidebarW,
        flexShrink: 0,
        background: C.bg1,
        borderRight: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        boxShadow: "8px 0 32px rgba(15,23,42,0.045)",
        transition: "background 0.3s, border-color 0.3s",
      }}
    >
      <div
        style={{
          padding: "24px 20px",
          borderBottom: `1px solid ${C.border}55`,
          background: `linear-gradient(180deg, ${C.blue}12, transparent)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              border: `1px solid ${C.border}`,
              boxShadow: "0 10px 28px rgba(15,23,42,0.10)",
              overflow: "hidden",
            }}
          >
            <img
              src="/app-icon.svg"
              alt="Bellinati Perez"
              style={{
                width: 48,
                height: 48,
                display: "block",
                objectFit: "contain",
              }}
            />
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: C.t1,
                lineHeight: 1.2,
                letterSpacing: 0,
              }}
            >
              Bellinati Perez
            </div>
            <div
              style={{
                fontSize: 9,
                color: C.t3,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginTop: 3,
              }}
            >
              Transformação Digital
            </div>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "14px 12px", overflowY: "auto" }}>
        <div
          style={{
            fontSize: 10,
            color: C.t3,
            letterSpacing: "0.09em",
            padding: "8px 10px 10px",
            textTransform: "uppercase",
            fontWeight: 800,
          }}
        >
          Principal
        </div>
        {navItems.map((item) => {
          const isA = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                minHeight: 42,
                padding: "10px 12px",
                borderRadius: 12,
                border: `1px solid ${isA ? C.blue + "24" : "transparent"}`,
                cursor: "pointer",
                background: isA ? C.blueGlow : "transparent",
                color: isA ? C.blue : C.t2,
                fontSize: 13,
                fontWeight: isA ? 750 : 600,
                marginBottom: 4,
                transition: "var(--transition-base)",
                boxShadow: isA ? `0 8px 18px ${C.blue}12` : "none",
              }}
              onMouseEnter={(e) => {
                if (!isA) {
                  e.currentTarget.style.background = C.surface;
                  e.currentTarget.style.color = C.t1;
                }
              }}
              onMouseLeave={(e) => {
                if (!isA) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = C.t2;
                }
              }}
            >
              <item.icon size={15} />
              <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    fontSize: 9,
                    padding: "1px 6px",
                    borderRadius: 10,
                    background: C.blueGlow,
                    color: C.blue,
                    fontWeight: 700,
                    border: `1px solid ${C.blue}33`,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "16px 18px", borderTop: `1px solid ${C.border}` }}>
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            background: C.emeraldGlow,
            border: `1px solid ${C.emerald}28`,
            boxShadow: `0 8px 20px ${C.emerald}12`,
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: C.emerald,
              boxShadow: `0 0 6px ${C.emerald}`,
            }}
          />
          <span style={{ fontSize: 11, color: C.emerald, fontWeight: 700 }}>
            Todos os sistemas OK
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 2px 0" }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: `linear-gradient(135deg,${C.blue},${C.violet})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 800,
              color: "#fff",
            }}
          >
            EP
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.t1 }}>
              Equipe Projetos
            </div>
            <div style={{ fontSize: 10, color: C.t3 }}>Administrador</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---
function Topbar({ page, C, dark, toggleTheme, userEmail, onLogout }) {
  const now = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const iconButton = {
    width: 38,
    height: 38,
    borderRadius: 12,
    border: `1px solid ${C.border}`,
    background: C.surface,
    color: C.t2,
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    transition: "var(--transition-base)",
    boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
  };

  const popoverStyle = {
    position: "absolute",
    top: 48,
    right: 0,
    width: "min(340px, calc(100vw - 32px))",
    background: C.bg1,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    boxShadow: "var(--app-shadow-lg)",
    padding: 16,
    zIndex: 1001,
  };

  function closeAll() {
    setShowNotifications(false);
    setShowSettings(false);
  }

  return (
    <div
      className="app-topbar"
      style={{
        minHeight: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        borderBottom: `1px solid ${C.border}`,
        background: `${C.bg1}ee`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 1px 0 rgba(15,23,42,0.06), 0 10px 30px rgba(15,23,42,0.035)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        transition: "background 0.3s, border-color 0.3s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          fontSize: 13,
          color: C.t3,
          minWidth: 0,
        }}
      >
        <span style={{ fontWeight: 700 }}>Bellinati Perez</span>
        <ChevronRight size={13} />
        <span style={{ color: C.t1, fontWeight: 500 }}>
          {navItems.find((n) => n.id === page)?.label || "Control Tower"}
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
            onMouseEnter={(e) => {
              e.currentTarget.style.background = C.blueGlow;
              e.currentTarget.style.borderColor = C.borderHov;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = C.surface;
              e.currentTarget.style.borderColor = C.border;
            }}
          >
            <Bell size={16} />
            <span
              style={{
                position: "absolute",
                top: 7,
                right: 7,
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: C.rose,
                border: `2px solid ${C.bg1}`,
              }}
            />
          </button>

          {showNotifications && (
            <div style={popoverStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 950, color: C.t1 }}>
                    Notificações
                  </div>
                  <div style={{ fontSize: 11, color: C.t3, marginTop: 2 }}>
                    Acompanhamento da plataforma
                  </div>
                </div>

                <button
                  onClick={closeAll}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: C.t3,
                    cursor: "pointer",
                    fontSize: 18,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>

              {[
                {
                  title: "Login demonstrativo ativo",
                  desc: "Ambiente configurado para apresentação do MVP.",
                  color: C.blue,
                },
                {
                  title: "Control Tower disponível",
                  desc: "Indicadores consolidados carregados na tela inicial.",
                  color: C.emerald,
                },
                {
                  title: "Pontos de atenção",
                  desc: "Alertas operacionais podem ser acompanhados pela liderança.",
                  color: C.amber,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    display: "flex",
                    gap: 10,
                    padding: "10px 0",
                    borderTop: `1px solid ${C.border}`,
                  }}
                >
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      background: item.color,
                      marginTop: 5,
                      flexShrink: 0,
                      boxShadow: `0 0 8px ${item.color}`,
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 12, color: C.t1, fontWeight: 900 }}>
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: C.t3,
                        marginTop: 3,
                        lineHeight: 1.45,
                      }}
                    >
                      {item.desc}
                    </div>
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
            onMouseEnter={(e) => {
              e.currentTarget.style.background = C.blueGlow;
              e.currentTarget.style.borderColor = C.borderHov;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = C.surface;
              e.currentTarget.style.borderColor = C.border;
            }}
          >
            <Settings size={16} />
          </button>

          {showSettings && (
            <div style={popoverStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 950, color: C.t1 }}>
                    Configurações
                  </div>
                  <div style={{ fontSize: 11, color: C.t3, marginTop: 2 }}>
                    Preferências da plataforma
                  </div>
                </div>

                <button
                  onClick={closeAll}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: C.t3,
                    cursor: "pointer",
                    fontSize: 18,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>

              <div
                style={{
                  borderTop: `1px solid ${C.border}`,
                  paddingTop: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <button
                  onClick={toggleTheme}
                  aria-label={`Alternar para modo ${dark ? "claro" : "escuro"}`}
                  title={`Alternar para modo ${dark ? "claro" : "escuro"}`}
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
                    fontWeight: 600,
                  }}
                >
                  <span>Modo de exibição</span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      color: dark ? C.amber : C.blue,
                    }}
                  >
                    {dark ? <Sun size={14} /> : <Moon size={14} />}
                    {dark ? "Light" : "Dark"}
                  </span>
                </button>

                <div
                  style={{
                    background: C.bg3,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: "11px 12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: C.t3,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontWeight: 900,
                    }}
                  >
                    Ambiente
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: C.t1,
                      fontWeight: 900,
                      marginTop: 4,
                    }}
                  >
                    MVP Demonstrativo
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: C.t3,
                      marginTop: 4,
                      lineHeight: 1.45,
                    }}
                  >
                    Login e permissões definitivas serão integrados após
                    aprovação da Infra e Segurança da Informação.
                  </div>
                </div>

                <div
                  style={{
                    background: C.bg3,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: "11px 12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: C.t3,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontWeight: 900,
                    }}
                  >
                    Usuário atual
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: C.t1,
                      fontWeight: 900,
                      marginTop: 4,
                    }}
                  >
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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 10px 5px 5px",
            borderRadius: 999,
            background: C.surface,
            border: `1px solid ${C.border}`,
            boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: `linear-gradient(135deg,${C.blue},${C.violet})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 800,
              color: "#fff",
            }}
          >
            TD
          </div>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.t1 }}>
              Teste Digital
            </div>
            <div style={{ fontSize: 9, color: C.t3 }}>
              {userEmail || "teste@digital.com.br"}
            </div>
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

// ---
function LoginScreen({ C, dark, toggleTheme, onLogin }) {
  const [email, setEmail] = useState("teste@digital.com.br");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const DEMO_EMAIL = "teste@digital.com.br";
  const DEMO_PASSWORD = "Teste@2026";

  const field = {
    width: "100%",
    minHeight: 48,
    borderRadius: 12,
    border: `1px solid ${C.border}`,
    background: C.bg2,
    color: C.t1,
    padding: "12px 14px",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    boxShadow: "0 1px 2px rgba(15,23,42,0.03)",
  };

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (
        email.trim().toLowerCase() === DEMO_EMAIL &&
        password === DEMO_PASSWORD
      ) {
        onLogin(DEMO_EMAIL);
      } else {
        setError("E-mail ou senha inválidos. Use o login de teste informado.");
      }

      setLoading(false);
    }, 450);
  }

  return (
    <div
      className="login-page"
      style={{
        minHeight: "100vh",
        backgroundImage: dark
          ? `linear-gradient(rgba(15,23,42,0.28), rgba(15,23,42,0.28)), url('/login-bp-relevo.png'), linear-gradient(135deg, ${C.bg0} 0%, ${C.bg2} 56%, ${C.bg3} 100%)`
          : `linear-gradient(rgba(255,255,255,0.30), rgba(255,255,255,0.30)), url('/login-bp-relevo.png'), linear-gradient(135deg, ${C.bg0} 0%, ${C.bg2} 56%, ${C.bg3} 100%)`,
        backgroundSize: "auto, cover, auto",
        backgroundPosition: "center, center center, auto",
        backgroundRepeat: "no-repeat",
        display: "grid",
        placeItems: "center",
        padding: 32,
        fontFamily: "'Inter','Geist','Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,sans-serif",
        color: C.t1,
      }}
    >
      <div
        className="login-panel"
        style={{
          width: "100%",
          maxWidth: 600,
          transform: "translateX(70px)",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            ...card(C),
            padding: 34,
            borderRadius: 12,
            position: "relative",
            overflow: "hidden",
            background: dark ? "rgba(15,23,42,0.94)" : "rgba(255,255,255,0.94)",
            backdropFilter: "none",
            borderTop: `4px solid ${C.blue}`,
            minHeight: 540,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            boxShadow: "var(--app-shadow-lg)",
          }}
        >
          <div
            style={{
              display: "none",
              position: "absolute",
              top: -80,
              right: -80,
              width: 280,
              height: 280,
              borderRadius: "50%",
              background: C.violetGlow,
              filter: "blur(28px)",
            }}
          />
          <div
            style={{
              display: "none",
              position: "absolute",
              bottom: -60,
              left: -60,
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: C.violetGlow,
              filter: "blur(18px)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 32,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: `1px solid ${C.border}`,
                  boxShadow: "0 10px 28px rgba(15,23,42,0.10)",
                  overflow: "hidden",
                }}
              >
                <img src="/app-icon.svg" alt="Bellinati Perez" style={{ width: 48, height: 48, display: "block", objectFit: "contain" }} />
              </div>

              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.t1 }}>
                  Bellinati Perez
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: C.t3,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontWeight: 800,
                  }}
                >
                  Transformação Digital
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: 34,
                lineHeight: 1.12,
                letterSpacing: 0,
                fontWeight: 650,
                color: C.t1,
                maxWidth: 520,
              }}
            >
              Plataforma de Gestão Transformação Digital
            </div>

            <div
              style={{
                fontSize: 14,
                color: C.t2,
                lineHeight: 1.7,
                marginTop: 18,
                maxWidth: 560,
              }}
            >
              Central de acompanhamento para Projetos, POC, Fornecedores,
              riscos, indicadores e decisões executivas.
            </div>
          </div>

          <div
            style={{
              marginTop: 34,
              paddingTop: 28,
              borderTop: `1px solid ${C.border}`,
            }}
          >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
              marginBottom: 28,
            }}
          >
            <div>
              <div style={{ fontSize: 30, color: C.t1, fontWeight: 650, lineHeight: 1.18 }}>
                Acessar plataforma
              </div>
              <div style={{ fontSize: 14, color: C.t3, marginTop: 8, lineHeight: 1.5 }}>
                Entre com as credenciais de teste
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Alternar para modo ${dark ? "claro" : "escuro"}`}
              title={`Alternar para modo ${dark ? "claro" : "escuro"}`}
              style={{
                border: `1px solid ${C.border}`,
                background: C.surface,
                color: C.t2,
                borderRadius: 999,
                padding: "9px 12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
              }}
            >
              {dark ? (
                <Sun size={14} color={C.amber} />
              ) : (
                <Moon size={14} color={C.blue} />
              )}
              {dark ? "Light" : "Dark"}
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: C.t3,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
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
              <div
                style={{
                  fontSize: 11,
                  color: C.t3,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
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
              <div
                style={{
                  background: C.roseGlow,
                  border: `1px solid ${C.rose}44`,
                  color: C.rose,
                  borderRadius: 12,
                  padding: "10px 12px",
                  fontSize: 12,
                  fontWeight: 650,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 8,
                width: "100%",
                minHeight: 50,
                borderRadius: 12,
                border: "none",
                background: C.blue,
                color: "#fff",
                fontSize: 14,
                fontWeight: 650,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.75 : 1,
                boxShadow: "0 16px 30px rgba(225,29,72,0.22)",
                letterSpacing: 0,
                transition: "var(--transition-base)",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.opacity = "0.88";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = loading ? "0.75" : "1";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {loading ? "Validando acesso..." : "Entrar"}
            </button>
          </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---
export default function DashboardPage() {
  const [dark, setDark] = useState(false);
  const [active, setActive] = useState("indicators");
  const [auth, setAuth] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const C = getC(dark);

  useEffect(() => {
    (async () => {
      const theme = await readThemePreference();
      const nextDark = theme === "dark";
      setDark(nextDark);
      applyThemePreference(nextDark);
    })();
  }, []);

  const toggleTheme = useCallback(async () => {
    const next = !dark;
    setDark(next);
    applyThemePreference(next);
    await saveThemePreference(next ? "dark" : "light");
  }, [dark]);

  function handleLogin(email) {
    setAuth(true);
    setAuthEmail(email);

    // Login demonstrativo não será persistido para garantir que a plataforma abra sempre na tela de login.
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

  const views = {
    indicators: IndicatorsView,
    performanceChannels: PerformanceChannelsView,
    errorBot: ErrorBotDashboard,
    projects: ProjectsView,
    scrum: ScrumView,
    poc: PocView,
    suppliers: SuppliersView,
    portals: PortaisView,
  };
  const View = views[active] || IndicatorsView;

  if (!auth) {
    return (
      <ThemeCtx.Provider value={{ dark, toggle: toggleTheme }}>
        <LoginScreen
          C={C}
          dark={dark}
          toggleTheme={toggleTheme}
          onLogin={handleLogin}
        />
      </ThemeCtx.Provider>
    );
  }

  return (
    <ThemeCtx.Provider value={{ dark, toggle: toggleTheme }}>
      <div
        className="app-shell"
        style={{
          display: "flex",
          background: C.bg0,
          minHeight: "100vh",
          fontFamily: "'Inter','Geist','Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,sans-serif",
          color: C.t1,
          transition: "background 0.3s",
        }}
      >
        <Sidebar active={active} setActive={setActive} C={C} />
        <div
          className="app-content"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <Topbar
            page={active}
            C={C}
            dark={dark}
            toggleTheme={toggleTheme}
            userEmail={authEmail}
            onLogout={handleLogout}
          />
          <main className="app-main" style={{ flex: 1, padding: 26, overflowY: "auto" }}>
            <Suspense
              fallback={(
                <div style={{ color: C.t3, padding: 24, textAlign: "center" }}>
                  Carregando módulo...
                </div>
              )}
            >
              <View C={C} />
            </Suspense>
          </main>
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}
