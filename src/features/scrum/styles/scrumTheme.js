export const theme = {
  navy: "#1e293b",
  navyDark: "#0f172a",
  navyLight: "#334155",
  gold: "#e11d48",
  white: "#ffffff",
  bg: "#f2f4f8",
  border: "#e2e8f0",
  borderLight: "#f8fafc",
  text: "#0f172a",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
  phases: {
    0: { bg: "#e11d48", light: "#ffe7ef", label: "Orçamento" },
    A: { bg: "#334155", light: "#f8fafc", label: "Aprovação" },
    1: { bg: "#e11d48", light: "#fef2f5", label: "Backlog" },
    2: { bg: "#16a34a", light: "#f0fdf4", label: "Planejamento" },
    3: { bg: "#d97706", light: "#fff7ed", label: "Execução" },
    4: { bg: "#64748b", light: "#f8fafc", label: "Monitoramento" },
    5: { bg: "#dc2626", light: "#fee2e2", label: "Encerramento" },
  },
  statusColors: {
    "Em dia": { bg: "#dcfce7", text: "#166534", dot: "#16a34a" },
    Atenção: { bg: "#fff7ed", text: "#9a3412", dot: "#d97706" },
    Atrasado: { bg: "#fee2e2", text: "#991b1b", dot: "#dc2626" },
    Concluído: { bg: "#f0fdf4", text: "#166534", dot: "#16a34a" },
    Pendente: { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" },
    "Em andamento": { bg: "#fef2f5", text: "#9f1239", dot: "#e11d48" },
    Concluída: { bg: "#dcfce7", text: "#166534", dot: "#16a34a" },
  },
  riskColors: {
    Alta: { bg: "#fee2e2", text: "#991b1b" },
    Média: { bg: "#fff7ed", text: "#9a3412" },
    Baixa: { bg: "#dcfce7", text: "#166534" },
    Alto: { bg: "#fee2e2", text: "#991b1b" },
    Médio: { bg: "#fff7ed", text: "#9a3412" },
    Baixo: { bg: "#dcfce7", text: "#166534" },
  },
};

// ============================================================
// MOCK DATA
// ============================================================
