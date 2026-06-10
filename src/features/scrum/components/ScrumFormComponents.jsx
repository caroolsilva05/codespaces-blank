import React from "react";
import { theme } from "../styles/scrumTheme";

export const StatusBadge = ({ status, size = "normal" }) => {
  const s = theme.statusColors[status] || {
    bg: "#f1f5f9",
    text: "#475569",
    dot: "#94a3b8",
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: size === "small" ? "3px 8px" : "5px 11px",
        borderRadius: 20,
        background: s.bg,
        color: s.text,
        fontSize: size === "small" ? 11 : 12,
        fontWeight: 700,
        whiteSpace: "nowrap",
        letterSpacing: "0.3px",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: s.dot,
          flexShrink: 0,
        }}
      />
      {status}
    </span>
  );
};

export const RiskBadge = ({ level }) => {
  const c = theme.riskColors[level] || { bg: "#f1f5f9", text: "#475569" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        background: c.bg,
        color: c.text,
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {level}
    </span>
  );
};

export const PhaseSection = ({ phaseNum, title, expanded, onToggle, children }) => {
  const p = theme.phases[phaseNum];
  return (
    <div
      className="pdf-phase-section"
      style={{
        marginBottom: 24,
        borderRadius: theme.radiusCard,
        overflow: "hidden",
        border: `1px solid ${theme.border}`,
        boxShadow: theme.shadowCard,
        transition: theme.transitionBase,
      }}
    >
      <div
        className="pdf-phase-header"
        onClick={onToggle}
        style={{
          background: p.bg,
          color: "#fff",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {phaseNum !== "A" && phaseNum !== 0 && (
            <span
              style={{
                background: "rgba(255,255,255,0.18)",
                borderRadius: 10,
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              {phaseNum}
            </span>
          )}
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {title}
          </span>
        </div>
        <span style={{ fontSize: 13, opacity: 0.8, fontWeight: 700 }}>
          {expanded ? "▲ Recolher" : "▼ Expandir"}
        </span>
      </div>
      {expanded && (
        <div
          className="pdf-phase-body"
          style={{ padding: "24px", background: "#fff" }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const SubSection = ({ title, children }) => (
  <div className="pdf-subsection" style={{ marginBottom: 24 }}>
    <h4
      style={{
        margin: "0 0 14px 0",
        fontSize: 13,
        fontWeight: 700,
        color: theme.navy,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        borderBottom: `1px solid ${theme.border}`,
        paddingBottom: 8,
      }}
    >
      {title}
    </h4>
    {children}
  </div>
);

export const TableWrap = ({ children }) => (
  <div
    className="pdf-table-wrap"
    style={{
      overflowX: "auto",
      borderRadius: theme.radiusCard,
      border: `1px solid ${theme.border}`,
      boxShadow: "0 1px 2px rgba(15,23,42,0.03)",
    }}
  >
    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13 }}>
      {children}
    </table>
  </div>
);

export const THead = ({ children }) => (
  <thead style={{ background: theme.navy }}>{children}</thead>
);

export const Th = ({ children, w }) => (
  <th
    style={{
      padding: "12px 14px",
      color: "#fff",
      fontWeight: 700,
      textAlign: "left",
      fontSize: 11,
      letterSpacing: "0.04em",
      width: w || "auto",
      whiteSpace: "nowrap",
      textTransform: "uppercase",
    }}
  >
    {children}
  </th>
);

export const Td = ({ children, style: sx = {} }) => (
  <td
    style={{
      padding: "10px 14px",
      borderBottom: `1px solid ${theme.borderLight}`,
      color: theme.text,
      verticalAlign: "middle",
      ...sx,
    }}
  >
    {children}
  </td>
);

export const EditField = ({ value, onChange, placeholder, multi, minH }) => {
  const base = {
    width: "100%",
    padding: "8px 10px",
    border: `1px solid transparent`,
    borderRadius: 10,
    fontSize: 13,
    color: theme.text,
    background: "transparent",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    resize: multi ? "vertical" : "none",
    minHeight: minH || (multi ? 72 : 36),
    transition: theme.transitionBase,
  };
  const focus = (e) => {
    e.target.style.border = `1px solid ${theme.gold}`;
    e.target.style.background = theme.borderLight;
    e.target.style.boxShadow = "0 0 0 3px #ffe4ea";
  };
  const blur = (e) => {
    e.target.style.border = "1px solid transparent";
    e.target.style.background = "transparent";
    e.target.style.boxShadow = "none";
  };
  return multi ? (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={base}
      onFocus={focus}
      onBlur={blur}
    />
  ) : (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={base}
      onFocus={focus}
      onBlur={blur}
    />
  );
};

export const DateInput = ({ value, onChange }) => (
  <input
    type="date"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{
      fontSize: 12,
      border: `1px solid ${theme.border}`,
      borderRadius: 10,
      padding: "8px 10px",
      color: theme.text,
      fontFamily: "inherit",
      background: "#fff",
      minHeight: 38,
    }}
  />
);

export const SelectInput = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{
      fontSize: 12,
      border: `1px solid ${theme.border}`,
      borderRadius: 10,
      padding: "8px 10px",
      color: theme.text,
      fontFamily: "inherit",
      background: "#fff",
      cursor: "pointer",
      minHeight: 38,
    }}
  >
    {options.map((o) => (
      <option key={o}>{o}</option>
    ))}
  </select>
);

export const CheckItem = ({ checked, onChange, label }) => (
  <label
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
      cursor: "pointer",
      padding: "9px 0",
      borderBottom: `1px solid ${theme.borderLight}`,
    }}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      style={{
        marginTop: 2,
        accentColor: theme.navy,
        width: 15,
        height: 15,
        cursor: "pointer",
        flexShrink: 0,
      }}
    />
    <span
      style={{
        fontSize: 13,
        color: checked ? theme.textSecondary : theme.text,
        textDecoration: checked ? "line-through" : "none",
        lineHeight: 1.5,
      }}
    >
      {label}
    </span>
    {checked && (
      <span
        style={{
          marginLeft: "auto",
          fontSize: 11,
          color: "#16a34a",
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        ✓
      </span>
    )}
  </label>
);

export const GhostBtn = ({ onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "9px 16px",
      borderRadius: 10,
      border: `1px dashed ${theme.border}`,
      background: "#f8fafc",
      color: theme.textSecondary,
      fontSize: 12,
      fontWeight: 600,
      cursor: "pointer",
      transition: theme.transitionBase,
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.borderColor = theme.navy;
      e.currentTarget.style.color = theme.navy;
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.borderColor = theme.border;
      e.currentTarget.style.color = theme.textSecondary;
    }}
  >
    {children}
  </button>
);

export const DeleteBtn = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: "none",
      border: "none",
      color: "#cbd5e1",
      cursor: "pointer",
      fontSize: 16,
      padding: "4px 8px",
      transition: theme.transitionBase,
    }}
    onMouseOver={(e) => (e.currentTarget.style.color = "#dc2626")}
    onMouseOut={(e) => (e.currentTarget.style.color = "#cbd5e1")}
  >
    ✕
  </button>
);

export const FieldRow = ({ label, children }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "190px 1fr",
      gap: 16,
      padding: "12px 0",
      borderBottom: `1px solid ${theme.borderLight}`,
      alignItems: "center",
    }}
  >
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: theme.textSecondary,
        textTransform: "uppercase",
        letterSpacing: "0.8px",
      }}
    >
      {label}
    </span>
    <div>{children}</div>
  </div>
);

export const MonitoringConversionSection = ({ phase4, setP4Conversion }) => {
  const conv = phase4.conversaoCustos || {};

  const parseNumber = (value) => {
    const normalizado = String(value || "")
      .replace(/R\$/g, "")
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^0-9.-]/g, "");

    const numero = Number(normalizado);
    return Number.isFinite(numero) ? numero : 0;
  };

  const parseCurrency = (value) => {
    const normalizado = String(value || "")
      .replace(/R\$/g, "")
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".");

    const numero = Number(normalizado);
    return Number.isFinite(numero) ? numero : 0;
  };

  const money = (value) =>
    Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const pct = (value) =>
    `${Number(value || 0)
      .toFixed(1)
      .replace(".", ",")}%`;

  const disparado = parseNumber(conv.disparado);
  const entregue = parseNumber(conv.entregue);
  const lido = parseNumber(conv.lido);
  const retorno = parseNumber(conv.retorno);
  const intencaoPagamento = parseNumber(conv.intencaoPagamento);
  const acordoFormalizado = parseNumber(conv.acordoFormalizado);

  const valorAcordo = parseCurrency(conv.valorAcordo);
  const custoUnitario = parseCurrency(conv.custoUnitario);
  const custoTotalDisparo = entregue * custoUnitario;

  const taxaEntregue = disparado > 0 ? (entregue / disparado) * 100 : 0;
  const taxaLido = entregue > 0 ? (lido / entregue) * 100 : 0;
  const taxaRetorno = entregue > 0 ? (retorno / entregue) * 100 : 0;
  const taxaIntencao = retorno > 0 ? (intencaoPagamento / retorno) * 100 : 0;
  const taxaConversao = retorno > 0 ? (acordoFormalizado / retorno) * 100 : 0;

  const roi =
    custoTotalDisparo > 0
      ? (valorAcordo - custoTotalDisparo) / custoTotalDisparo / 100
      : 0;

  const custoPorRetorno = retorno > 0 ? custoTotalDisparo / retorno : 0;

  const custoPorAcordo =
    acordoFormalizado > 0 ? custoTotalDisparo / acordoFormalizado : 0;

  return (
    <SubSection title="4.3 Monitoramento de Conversão e Custos">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 12,
          marginBottom: 18,
        }}
      >
        {[
          ["Disparado", disparado],
          ["Entregue", entregue + " (" + pct(taxaEntregue) + ")"],
          ["Retorno", retorno + " (" + pct(taxaRetorno) + ")"],
          ["Acordos", acordoFormalizado],
          ["ROI", pct(roi * 100)],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              border: "1px solid " + theme.border,
              borderRadius: theme.radiusCard,
              background: "#f8fafc",
              padding: "16px",
              boxShadow: "0 1px 2px rgba(15,23,42,0.03)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: theme.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                fontWeight: 800,
                marginBottom: 5,
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontSize: 18,
                color: theme.phases[4].bg,
                fontWeight: 900,
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0 48px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: theme.textSecondary,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              marginBottom: 8,
            }}
          >
            Dados operacionais
          </div>

          {[
            ["Disparado", "disparado"],
            ["Cancelado", "cancelado"],
            ["Entregue", "entregue"],
            ["Lido", "lido"],
            ["Não entregue", "naoEntregue"],
            ["Retorno", "retorno"],
            ["Intenção de pagamento", "intencaoPagamento"],
            ["Acordo formalizado", "acordoFormalizado"],
            ["Valor do acordo", "valorAcordo"],
            ["Custo unitário/disparo", "custoUnitario"],
          ].map(([label, key]) => (
            <FieldRow key={key} label={label}>
              <EditField
                value={conv[key] || ""}
                onChange={(v) => setP4Conversion(key, v)}
                placeholder={
                  key === "valorAcordo" || key === "custoUnitario"
                    ? "R$ 0,00"
                    : "0"
                }
              />
            </FieldRow>
          ))}
        </div>

        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: theme.textSecondary,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              marginBottom: 8,
            }}
          >
            CONVERSÃO
          </div>

          {[
            ["Custo total de disparo", money(custoTotalDisparo)],
            ["% Entregue", pct(taxaEntregue)],
            ["% Lido sobre entregue", pct(taxaLido)],
            ["% Retorno sobre entregue", pct(taxaRetorno)],
            ["% Intenção sobre retorno", pct(taxaIntencao)],
            ["% Conversão acordo/retorno", pct(taxaConversao)],
            ["ROI", pct(roi * 100)],
            ["Custo por retorno", money(custoPorRetorno)],
            ["Custo por acordo", money(custoPorAcordo)],
          ].map(([label, value]) => (
            <FieldRow key={label} label={label}>
              <div
                style={{
                  padding: "6px 8px",
                  borderRadius: 4,
                  background: "#f1f5f9",
                  border: "1px solid " + theme.border,
                  color: theme.phases[4].bg,
                  fontSize: 13,
                  fontWeight: 900,
                }}
              >
                {value}
              </div>
            </FieldRow>
          ))}
        </div>
      </div>
    </SubSection>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
