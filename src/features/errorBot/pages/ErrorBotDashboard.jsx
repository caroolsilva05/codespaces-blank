import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bot,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  FilterX,
  Layers3,
  Search,
  Send,
  ServerCog,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { loadErrorBotData } from "../services/errorBotDataService";
import "./ErrorBotDashboard.css";

const MONTHS = ["Fevereiro", "Março", "Abril", "Maio", "Junho"];
const CHANNEL_COLORS = {
  RCS: "#e11d48",
  EMAIL: "#f59e0b",
  SMS: "#64748b",
};
const PAGE_SIZE = 12;
const numberFormatter = new Intl.NumberFormat("pt-BR");
const compactFormatter = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function sumErrors(records) {
  return records.reduce((total, record) => total + record.errorCount, 0);
}

function aggregate(records, field, limit) {
  const groups = new Map();
  records.forEach((record) => {
    const name = record[field] || "Não informado";
    const current = groups.get(name) || { name, errors: 0, occurrences: 0 };
    current.errors += record.errorCount;
    current.occurrences += 1;
    groups.set(name, current);
  });
  const result = [...groups.values()].sort((a, b) => b.errors - a.errors);
  return limit ? result.slice(0, limit) : result;
}

function uniqueOptions(records, field) {
  return [...new Set(records.map((record) => record[field]).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "pt-BR"),
  );
}

function formatDate(value) {
  return value ? dateFormatter.format(new Date(value)) : "—";
}

function ChartTooltip({ active, payload, label, C }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="error-bot-tooltip"
      style={{ background: C.card, borderColor: C.borderStrong, color: C.t1 }}
    >
      {label && <strong>{label}</strong>}
      {payload.map((item) => (
        <span key={`${item.name}-${item.value}`} style={{ color: item.color || C.t2 }}>
          {item.name}: {numberFormatter.format(item.value)}
        </span>
      ))}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, detail, tone, C }) {
  return (
    <article className="error-bot-kpi" style={{ background: C.card, borderColor: C.border }}>
      <div className="error-bot-kpi-top">
        <span className="error-bot-kpi-label" style={{ color: C.t2 }}>{label}</span>
        <span className="error-bot-kpi-icon" style={{ background: `${tone}18`, color: tone }}>
          <Icon size={18} />
        </span>
      </div>
      <strong style={{ color: C.t1 }}>{value}</strong>
      <small style={{ color: C.t3 }}>{detail}</small>
    </article>
  );
}

function FilterSelect({ label, value, onChange, options, C }) {
  return (
    <label className="error-bot-filter">
      <span style={{ color: C.t3 }}>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{ background: C.bg2, borderColor: C.border, color: C.t1 }}
      >
        <option value="all">Todos</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Panel({ title, subtitle, children, C, className = "" }) {
  return (
    <section className={`error-bot-panel ${className}`} style={{ background: C.card, borderColor: C.border }}>
      <header>
        <div>
          <h2 style={{ color: C.t1 }}>{title}</h2>
          {subtitle && <p style={{ color: C.t3 }}>{subtitle}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

export default function ErrorBotDashboard({ C }) {
  const [records, setRecords] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    month: "all",
    channel: "all",
    supplier: "all",
    bank: "all",
    reason: "all",
    search: "",
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    loadErrorBotData()
      .then((payload) => {
        if (mounted) setRecords(payload.records || []);
      })
      .catch((error) => {
        if (mounted) setLoadError(error.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const options = useMemo(() => ({
    months: MONTHS,
    channels: uniqueOptions(records, "channel"),
    suppliers: uniqueOptions(records, "supplier"),
    banks: uniqueOptions(records, "bank"),
    reasons: uniqueOptions(records, "reason"),
  }), [records]);

  const filteredRecords = useMemo(() => {
    const search = normalize(filters.search);
    return records.filter((record) => {
      if (filters.month !== "all" && record.month !== filters.month) return false;
      if (filters.channel !== "all" && record.channel !== filters.channel) return false;
      if (filters.supplier !== "all" && record.supplier !== filters.supplier) return false;
      if (filters.bank !== "all" && record.bank !== filters.bank) return false;
      if (filters.reason !== "all" && record.reason !== filters.reason) return false;
      if (!search) return true;
      return [record.system, record.bank, record.reason, record.lotId, record.supplier, record.channel]
        .some((value) => normalize(value).includes(search));
    });
  }, [filters, records]);

  useEffect(() => setPage(1), [filters]);

  const metrics = useMemo(() => {
    const total = sumErrors(filteredRecords);
    const months = aggregate(filteredRecords, "month");
    const channels = aggregate(filteredRecords, "channel");
    const suppliers = aggregate(filteredRecords, "supplier");
    const banks = aggregate(filteredRecords, "bank");
    const validLags = [];
    let inconsistentDates = 0;
    filteredRecords.forEach((record) => {
      const lag = (new Date(record.validatedAt) - new Date(record.sentAt)) / 60000;
      if (lag < 0) inconsistentDates += 1;
      else if (Number.isFinite(lag)) validLags.push(lag);
    });
    validLags.sort((a, b) => a - b);
    const medianLag = validLags.length
      ? validLags[Math.floor(validLags.length / 2)]
      : 0;
    return {
      total,
      months,
      channels,
      suppliers,
      banks,
      medianLag,
      inconsistentDates,
      criticalMonth: months[0],
      criticalChannel: channels[0],
      criticalSupplier: suppliers[0],
      criticalBank: banks[0],
    };
  }, [filteredRecords]);

  const monthlyData = useMemo(() => MONTHS.map((month) => {
    const records = filteredRecords.filter((record) => record.month === month);
    return {
      month: month.slice(0, 3),
      RCS: sumErrors(records.filter((record) => record.channel === "RCS")),
      EMAIL: sumErrors(records.filter((record) => record.channel === "EMAIL")),
      SMS: sumErrors(records.filter((record) => record.channel === "SMS")),
    };
  }), [filteredRecords]);

  const reasonData = useMemo(() => aggregate(filteredRecords, "reason"), [filteredRecords]);
  const supplierData = useMemo(() => aggregate(filteredRecords, "supplier", 6), [filteredRecords]);
  const bankData = useMemo(() => aggregate(filteredRecords, "bank", 6), [filteredRecords]);
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const pageRecords = filteredRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = Object.entries(filters).some(([key, value]) => key === "search" ? value : value !== "all");
  const setFilter = (field) => (value) => setFilters((current) => ({ ...current, [field]: value }));
  const clearFilters = () => setFilters({ month: "all", channel: "all", supplier: "all", bank: "all", reason: "all", search: "" });

  const insight = metrics.total
    ? `${metrics.criticalMonth?.name || "O período"} concentra o maior volume filtrado. ${metrics.criticalChannel?.name || "O canal principal"} representa ${((metrics.criticalChannel?.errors || 0) / metrics.total * 100).toFixed(1).replace(".", ",")}% dos erros, com maior impacto em ${metrics.criticalSupplier?.name || "fornecedor não identificado"}.`
    : "Nenhum registro corresponde aos filtros selecionados.";

  const cssVariables = {
    "--eb-text": C.t1,
    "--eb-muted": C.t2,
    "--eb-subtle": C.t3,
    "--eb-border": C.border,
    "--eb-surface": C.bg2,
    "--eb-accent": C.blue,
    "--eb-accent-soft": C.blueGlow,
  };

  if (loading || loadError) {
    return (
      <div className="error-bot-dashboard" style={cssVariables}>
        <header className="error-bot-page-header">
          <div>
            <span className="error-bot-eyebrow" style={{ color: C.blue }}><Bot size={15} /> Monitoramento operacional</span>
            <h1 style={{ color: C.t1 }}>Bot de Alerta de Erros</h1>
          </div>
        </header>
        <div className="error-bot-loading" style={{ background: C.card, borderColor: C.border, color: loadError ? C.rose : C.t3 }}>
          {loadError ? <AlertTriangle size={26} /> : <ServerCog size={26} className="error-bot-loading-icon" />}
          <strong>{loadError || "Carregando dados do bot..."}</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="error-bot-dashboard" style={cssVariables}>
      <header className="error-bot-page-header">
        <div>
          <span className="error-bot-eyebrow" style={{ color: C.blue }}><Bot size={15} /> Monitoramento operacional</span>
          <h1 style={{ color: C.t1 }}>Bot de Alerta de Erros</h1>
          <p style={{ color: C.t2 }}>Visão executiva dos lotes com erro entre 18/02/2026 e 12/06/2026.</p>
        </div>
        <span className="error-bot-source" style={{ background: C.bg2, borderColor: C.border, color: C.t2 }}>
          <span /> Dados mockados do Excel
        </span>
      </header>

      <section className="error-bot-filters" style={{ background: C.card, borderColor: C.border }}>
        <FilterSelect label="Mês" value={filters.month} onChange={setFilter("month")} options={options.months} C={C} />
        <FilterSelect label="Canal" value={filters.channel} onChange={setFilter("channel")} options={options.channels} C={C} />
        <FilterSelect label="Fornecedor" value={filters.supplier} onChange={setFilter("supplier")} options={options.suppliers} C={C} />
        <FilterSelect label="Banco / carteira" value={filters.bank} onChange={setFilter("bank")} options={options.banks} C={C} />
        <FilterSelect label="Motivo" value={filters.reason} onChange={setFilter("reason")} options={options.reasons} C={C} />
        <button className="error-bot-clear" onClick={clearFilters} disabled={!hasFilters} style={{ color: hasFilters ? C.blue : C.t4 }}>
          <FilterX size={16} /> Limpar
        </button>
      </section>

      <section className="error-bot-kpis">
        <KpiCard icon={CircleAlert} label="Total de erros" value={numberFormatter.format(metrics.total)} detail={`${numberFormatter.format(filteredRecords.length)} lotes no recorte`} tone={C.rose} C={C} />
        <KpiCard icon={Layers3} label="Ocorrências" value={numberFormatter.format(filteredRecords.length)} detail="Cada linha representa um lote" tone={C.violet} C={C} />
        <KpiCard icon={CalendarDays} label="Mês mais crítico" value={metrics.criticalMonth?.name || "—"} detail={metrics.criticalMonth ? `${compactFormatter.format(metrics.criticalMonth.errors)} erros` : "Sem dados"} tone={C.amber} C={C} />
        <KpiCard icon={Send} label="Canal mais impactado" value={metrics.criticalChannel?.name || "—"} detail={metrics.criticalChannel ? `${(metrics.criticalChannel.errors / metrics.total * 100).toFixed(1).replace(".", ",")}% do volume` : "Sem dados"} tone={C.blue} C={C} />
        <KpiCard icon={Clock3} label="Mediana de validação" value={`${Math.round(metrics.medianLag)} min`} detail={`${metrics.inconsistentDates} datas inconsistentes`} tone={C.emerald} C={C} />
      </section>

      <section className="error-bot-insight" style={{ background: C.blueGlow, borderColor: C.borderHov }}>
        <span style={{ background: C.blue, color: "white" }}><TrendingUp size={18} /></span>
        <div>
          <strong style={{ color: C.t1 }}>Leitura executiva</strong>
          <p style={{ color: C.t2 }}>{insight}</p>
        </div>
        <span className="error-bot-partial" style={{ background: C.amberGlow, color: C.amber }}>
          <AlertTriangle size={14} /> Junho parcial
        </span>
      </section>

      <div className="error-bot-grid error-bot-grid-main">
        <Panel title="Evolução mensal" subtitle="Volume de erros por canal" C={C} className="error-bot-wide">
          <div className="error-bot-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 15, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  {Object.entries(CHANNEL_COLORS).map(([channel, color]) => (
                    <linearGradient key={channel} id={`errorBot${channel}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke={C.border} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: C.t3, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(value) => compactFormatter.format(value)} tick={{ fill: C.t3, fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
                <Tooltip content={<ChartTooltip C={C} />} />
                {Object.entries(CHANNEL_COLORS).map(([channel, color]) => (
                  <Area key={channel} type="monotone" dataKey={channel} stackId="1" stroke={color} fill={`url(#errorBot${channel})`} strokeWidth={2} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="error-bot-legend">
            {Object.entries(CHANNEL_COLORS).map(([channel, color]) => <span key={channel} style={{ color: C.t2 }}><i style={{ background: color }} />{channel}</span>)}
          </div>
        </Panel>

        <Panel title="Distribuição por canal" subtitle="Participação no volume total" C={C}>
          <div className="error-bot-donut-wrap">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={metrics.channels} dataKey="errors" nameKey="name" innerRadius={58} outerRadius={84} paddingAngle={3}>
                  {metrics.channels.map((entry) => <Cell key={entry.name} fill={CHANNEL_COLORS[entry.name] || C.cyan} />)}
                </Pie>
                <Tooltip content={<ChartTooltip C={C} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="error-bot-donut-center"><strong style={{ color: C.t1 }}>{compactFormatter.format(metrics.total)}</strong><span style={{ color: C.t3 }}>erros</span></div>
          </div>
          <div className="error-bot-channel-list">
            {metrics.channels.map((channel) => (
              <div key={channel.name}><span style={{ color: C.t2 }}><i style={{ background: CHANNEL_COLORS[channel.name] || C.cyan }} />{channel.name}</span><strong style={{ color: C.t1 }}>{metrics.total ? (channel.errors / metrics.total * 100).toFixed(1).replace(".", ",") : 0}%</strong></div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="error-bot-grid error-bot-rank-grid">
        <Panel title="Fornecedores críticos" subtitle="Top 6 por volume de erros" C={C}>
          <div className="error-bot-ranking">
            {supplierData.map((item, index) => (
              <div key={item.name}>
                <span className="error-bot-rank" style={{ background: C.bg2, color: C.t3 }}>{index + 1}</span>
                <div><strong style={{ color: C.t1 }}>{item.name}</strong><span style={{ color: C.t3 }}>{numberFormatter.format(item.occurrences)} ocorrências</span></div>
                <b style={{ color: C.t1 }}>{compactFormatter.format(item.errors)}</b>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Bancos e carteiras" subtitle="Top 6 por volume de erros" C={C}>
          <div className="error-bot-ranking">
            {bankData.map((item, index) => (
              <div key={item.name}>
                <span className="error-bot-rank" style={{ background: C.bg2, color: C.t3 }}>{index + 1}</span>
                <div><strong style={{ color: C.t1 }}>{item.name}</strong><span style={{ color: C.t3 }}>{numberFormatter.format(item.occurrences)} ocorrências</span></div>
                <b style={{ color: C.t1 }}>{compactFormatter.format(item.errors)}</b>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Motivos dos erros" subtitle="Volume consolidado por classificação" C={C}>
          <div className="error-bot-chart error-bot-reason-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reasonData} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke={C.border} horizontal={false} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={112} tick={{ fill: C.t2, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip C={C} />} />
                <Bar dataKey="errors" name="Erros" fill={C.blue} radius={[0, 5, 5, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="Detalhamento dos lotes" subtitle={`${numberFormatter.format(filteredRecords.length)} registros encontrados`} C={C}>
        <div className="error-bot-table-toolbar">
          <label style={{ background: C.bg2, borderColor: C.border }}>
            <Search size={16} color={C.t3} />
            <input value={filters.search} onChange={(event) => setFilter("search")(event.target.value)} placeholder="Buscar sistema, lote, banco ou fornecedor" style={{ color: C.t1 }} />
          </label>
          {metrics.inconsistentDates > 0 && <span style={{ color: C.amber }}><AlertTriangle size={15} /> {metrics.inconsistentDates} inconsistências de data</span>}
        </div>
        <div className="error-bot-table-scroll">
          <table>
            <thead style={{ background: C.bg2, color: C.t3 }}><tr><th>Lote</th><th>Sistema</th><th>Banco / carteira</th><th>Motivo</th><th>Fornecedor</th><th>Canal</th><th>Erros</th><th>Disparo</th><th>Validação</th></tr></thead>
            <tbody>
              {pageRecords.map((record) => (
                <tr key={record.id} style={{ borderColor: C.border }}>
                  <td style={{ color: C.t2 }}>#{record.lotId}</td>
                  <td style={{ color: C.t1 }}>{record.system}</td>
                  <td><span className="error-bot-bank" style={{ background: C.violetGlow, color: C.violet }}><Building2 size={12} />{record.bank}</span></td>
                  <td style={{ color: C.t2 }}>{record.reason}</td>
                  <td style={{ color: C.t2 }}>{record.supplier}</td>
                  <td><span className="error-bot-channel" style={{ borderColor: CHANNEL_COLORS[record.channel], color: CHANNEL_COLORS[record.channel] }}>{record.channel}</span></td>
                  <td style={{ color: C.t1 }}><strong>{numberFormatter.format(record.errorCount)}</strong></td>
                  <td style={{ color: C.t3 }}>{formatDate(record.sentAt)}</td>
                  <td style={{ color: C.t3 }}>{formatDate(record.validatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!pageRecords.length && <div className="error-bot-empty" style={{ color: C.t3 }}><ServerCog size={30} />Nenhum lote encontrado com os filtros atuais.</div>}
        </div>
        <footer className="error-bot-pagination">
          <span style={{ color: C.t3 }}>Página {page} de {totalPages}</span>
          <div>
            <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} style={{ borderColor: C.border, color: C.t2 }}><ChevronLeft size={16} /></button>
            <button onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages} style={{ borderColor: C.border, color: C.t2 }}><ChevronRight size={16} /></button>
          </div>
        </footer>
      </Panel>
    </div>
  );
}
