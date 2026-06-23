import React, { useState, useRef } from "react";

// ============================================================
// THEME & CONSTANTS
// ============================================================
import { initialData } from "../data/initialScrumProject";
import { CheckItem, DateInput, DeleteBtn, EditField, FieldRow, GhostBtn, MonitoringConversionSection, PhaseSection, RiskBadge, SelectInput, StatusBadge, SubSection, TableWrap, Td, Th, THead } from "../components/ScrumFormComponents";
import {
  deleteScrumProjectRecord,
  saveScrumProjectRecord,
} from "../services/scrumProjectService";
import { theme } from "../styles/scrumTheme";
import {
  Activity,
  CalendarClock,
  ClipboardList,
  Flag,
  LayoutDashboard,
  PlayCircle,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import {
  notifyError,
  notifySuccess,
  notifyWarning,
  requestAppPrompt,
} from "../../../shared/notifications";
import {
  describeAppError,
  getMissingFields,
  missingFieldsMessage,
} from "../../../shared/errorMessages";
export default function ScrumProjectRegisterPage({
  registroInicial = null,
  onSaved = null,
  onClose = null,
} = {}) {
  const [data, setData] = useState(() => {
    const dadosSalvos =
      registroInicial?.dados_do_registro ||
      registroInicial?.record_data ||
      null;

    return dadosSalvos || initialData;
  });
  const [phases, setPhases] = useState({
    0: false,
    A: false,
    1: true,
    2: false,
    3: false,
    4: false,
    5: false,
  });
  const [activeProjectSection, setActiveProjectSection] = useState("id");
  const [monitorTab, setMonitorTab] = useState("disparos");
  const [flash, setFlash] = useState("");
  const [saving, setSaving] = useState(false);
  const printRef = useRef(null);

  const toggle = (n) => setPhases((p) => ({ ...p, [n]: !p[n] }));

  const openPhase = (phaseKey) => {
    setActiveProjectSection(String(phaseKey));
    setPhases((p) => ({ ...p, [phaseKey]: true }));

    window.setTimeout(() => {
      document
        .getElementById(`project-phase-${phaseKey}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 40);
  };

  const scrollToIdentification = () => {
    setActiveProjectSection("id");
    document
      .getElementById("project-identification")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const setPI = (field, val) =>
    setData((d) => ({ ...d, projectInfo: { ...d.projectInfo, [field]: val } }));

  const setOrcamento = (field, val) =>
    setData((d) => ({
      ...d,
      orcamentoProjeto: {
        ...(d.orcamentoProjeto || {}),
        [field]: val,
      },
    }));

  const setAprovacao = (field, val) =>
    setData((d) => ({
      ...d,
      aprovacaoProjeto: {
        ...(d.aprovacaoProjeto || {}),
        [field]: val,
      },
    }));

  function aprovacaoCompleta(aprovacao = data.aprovacaoProjeto || {}) {
    const statusOk = aprovacao.statusAprovacao === "Aprovado pela Diretoria";
    const aprovadorOk = Boolean(String(aprovacao.aprovador || "").trim());

    // Nota: tornamos o anexo (evidenciaArquivo) opcional — somente status e aprovador são requeridos
    return statusOk && aprovadorOk;
  }

  function faseRequerAprovacao(fase) {
    return !["Início", "Backlog"].includes(fase);
  }

  function setFaseAtualComValidacao(fase) {
    // Removida a obrigatoriedade do "De Acordo" para avançar de fase.
    setPI("faseAtual", fase);
  }

  function parseNumber(value) {
    const normalizado = String(value || "")
      .replace(/R\$/g, "")
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^0-9.-]/g, "");

    const numero = Number(normalizado);
    return Number.isFinite(numero) ? numero : 0;
  }

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

  function formatPct(value) {
    const numero = Number(value || 0);

    return `${numero.toFixed(1).replace(".", ",")}%`;
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
    setData((d) => ({ ...d, phase1: { ...d.phase1, [field]: val } }));

  const setCheckP1 = (key, val) =>
    setData((d) => ({
      ...d,
      phase1: { ...d.phase1, checklist: { ...d.phase1.checklist, [key]: val } },
    }));

  const setCheckP5 = (key, val) =>
    setData((d) => ({
      ...d,
      phase5: { ...d.phase5, checklist: { ...d.phase5.checklist, [key]: val } },
    }));

  const addRow = (phase, field, tpl) =>
    setData((d) => ({
      ...d,
      [phase]: {
        ...d[phase],
        [field]: [...(d[phase][field] || []), { ...tpl, id: Date.now() }],
      },
    }));

  const updRow = (phase, field, id, key, val) =>
    setData((d) => ({
      ...d,
      [phase]: {
        ...d[phase],
        [field]: (d[phase][field] || []).map((r) =>
          r.id === id ? { ...r, [key]: val } : r,
        ),
      },
    }));

  const delRow = (phase, field, id) =>
    setData((d) => ({
      ...d,
      [phase]: {
        ...d[phase],
        [field]: (d[phase][field] || []).filter((r) => r.id !== id),
      },
    }));

  const setP4Conversion = (field, val) =>
    setData((d) => ({
      ...d,
      phase4: {
        ...d.phase4,
        conversaoCustos: {
          ...(d.phase4.conversaoCustos || {}),
          [field]: val,
        },
      },
    }));

  const handleSave = async () => {
    const info = data.projectInfo || {};
    const camposObrigatorios = [
      { label: "Nome do projeto", value: info.nome },
      { label: "Código / ID", value: info.codigoId },
      { label: "Fornecedor", value: info.fornecedor },
      { label: "Responsável", value: info.responsavel },
      { label: "Data de abertura", value: info.dataAbertura },
      { label: "Previsão de encerramento", value: info.previsaoEncerramento },
    ];
    const camposPendentes = getMissingFields(camposObrigatorios);

    if (camposPendentes.length > 0) {
      scrollToIdentification();
      notifyWarning(
        missingFieldsMessage(camposPendentes, "projeto"),
        "Campos obrigatórios pendentes",
      );
      return;
    }

    if (
      info.dataAbertura &&
      info.previsaoEncerramento &&
      info.previsaoEncerramento < info.dataAbertura
    ) {
      scrollToIdentification();
      notifyWarning(
        "A previsão de encerramento não pode ser anterior à data de abertura do projeto.",
        "Período inválido",
      );
      return;
    }

    // Removida validação que exigia aprovação executiva (De Acordo)
    // A partir de agora é possível salvar e avançar de fase sem esse requisito.

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
      { ...payloadBase, código_do_projeto: codigo },
      payloadBase,
    ];

    const ultimoErro = await saveScrumProjectRecord({
      id: registroInicial?.id,
      payloads: tentativas,
    });

    setSaving(false);

    if (ultimoErro) {
      console.log("Erro ao salvar registro Scrum:", ultimoErro);
      notifyError(
        describeAppError(ultimoErro, { action: "salvar", subject: "projeto" }),
      );
      return;
    }

    setFlash("saved");
    notifySuccess(
      registroInicial?.id
        ? "Projeto atualizado com sucesso!"
        : "Projeto salvo com sucesso!",
    );

    if (typeof onSaved === "function") {
      await onSaved();
    }

    setTimeout(() => setFlash(""), 2000);
  };

  const handleExportPdf = () => {
    const conteudo = printRef.current;

    if (!conteudo) {
      notifyError("Não foi possível preparar o PDF.");
      return;
    }

    const clone = conteudo.cloneNode(true);

    // Remove botões
    clone.querySelectorAll("button").forEach((button) => button.remove());

    // Remove textos de recolher/expandir
    clone.querySelectorAll("span").forEach((span) => {
      const text = String(span.textContent || "").trim();
      if (text.includes("Recolher") || text.includes("Expandir")) {
        span.remove();
      }
    });

    // Converte radio: mostra somente opção marcada
    clone.querySelectorAll('input[type="radio"]').forEach((input) => {
      const label = input.closest("label");

      if (!input.checked && label) {
        label.remove();
        return;
      }

      const replacement = document.createElement("span");
      replacement.textContent = "●";
      replacement.style.display = "inline-flex";
      replacement.style.padding = "0 3px";
      replacement.style.fontSize = "9px";
      replacement.style.fontWeight = "900";
      replacement.style.color = "inherit";

      input.parentNode.replaceChild(replacement, input);
    });

    // Converte checkbox
    clone.querySelectorAll('input[type="checkbox"]').forEach((input) => {
      const replacement = document.createElement("span");
      replacement.textContent = input.checked ? "☑" : "☐";
      replacement.style.display = "inline-flex";
      replacement.style.padding = "0 3px";
      replacement.style.fontSize = "9px";
      replacement.style.fontWeight = "900";
      replacement.style.color = "inherit";

      input.parentNode.replaceChild(replacement, input);
    });

    // Converte campos preenchíveis em texto
    clone
      .querySelectorAll(
        "input:not([type='radio']):not([type='checkbox']), textarea, select",
      )
      .forEach((element) => {
        const tag = element.tagName.toLowerCase();
        let value = "";

        if (tag === "select") {
          value =
            element.options && element.selectedIndex >= 0
              ? element.options[element.selectedIndex].text
              : element.value || "";
        } else {
          value = element.value || element.getAttribute("value") || "";
        }

        const replacement = document.createElement("span");
        replacement.textContent = value || "-";
        replacement.style.display = "block";
        replacement.style.minHeight = "14px";
        replacement.style.padding = "2px 4px";
        replacement.style.borderRadius = "4px";
        replacement.style.background = "rgba(15, 23, 42, 0.035)";
        replacement.style.color = "inherit";
        replacement.style.fontSize = "8.5px";
        replacement.style.fontWeight = "700";
        replacement.style.whiteSpace = "normal";
        replacement.style.wordBreak = "break-word";

        element.parentNode.replaceChild(replacement, element);
      });

    clone.querySelectorAll("*").forEach((el) => {
      el.style.maxWidth = "100%";
      el.style.overflow = "visible";
      el.style.boxSizing = "border-box";
    });

    const safeTitle = String(data.projectInfo.nome || "Projeto")
      .replace(/</g, "")
      .replace(/>/g, "");

    const janela = window.open("", "_blank", "width=1400,height=950");

    if (!janela) {
      notifyWarning(
        "O navegador bloqueou a janela de impressão. Libere pop-ups para exportar o PDF.",
      );
      return;
    }

    const html =
      "<!DOCTYPE html>" +
      '<html lang="pt-BR">' +
      "<head>" +
      '<meta charset="UTF-8" />' +
      "<title>Template de Projeto - " +
      safeTitle +
      "</title>" +
      "<style>" +
      "* { box-sizing: border-box !important; }" +
      "html, body { margin: 0; padding: 0; font-family: Inter, Arial, sans-serif; background: #f0f4f8; color: #1e293b; -webkit-print-color-adjust: exact; print-color-adjust: exact; }" +
      "body { padding: 5mm; font-size: 9px; }" +
      "button { display: none !important; }" +
      ".pdf-phase-section { margin-bottom: 5mm !important; overflow: visible !important; break-before: page !important; page-break-before: always !important; break-inside: auto !important; page-break-inside: auto !important; }" +
      ".pdf-phase-section:first-of-type { break-before: auto !important; page-break-before: auto !important; }" +
      ".pdf-phase-header { padding: 8px 14px !important; break-after: avoid-page !important; page-break-after: avoid !important; page-break-inside: avoid !important; }" +
      ".pdf-phase-body { padding: 9px 10px 7px !important; overflow: visible !important; }" +
      ".pdf-subsection { margin-bottom: 4mm !important; break-before: auto !important; page-break-before: auto !important; break-inside: avoid-page !important; page-break-inside: avoid !important; }" +
      ".pdf-subsection h4 { margin-bottom: 5px !important; padding-bottom: 4px !important; break-after: avoid-page !important; page-break-after: avoid !important; page-break-inside: avoid !important; }" +
      ".pdf-subsection h4 + * { break-before: avoid-page !important; page-break-before: avoid !important; }" +
      ".pdf-table-wrap { overflow: visible !important; break-inside: auto !important; page-break-inside: auto !important; }" +
      "table { width: 100% !important; min-width: 0 !important; border-collapse: collapse !important; table-layout: fixed !important; font-size: 7.4px !important; break-inside: auto !important; page-break-inside: auto !important; }" +
      "thead { display: table-header-group !important; break-after: avoid-page !important; page-break-after: avoid !important; }" +
      "tbody tr, tr, td, th { break-inside: avoid-page !important; page-break-inside: avoid !important; }" +
      "th, td { padding: 2.5px 3px !important; white-space: normal !important; word-break: break-word !important; vertical-align: top !important; }" +
      "input, textarea, select { border: none !important; background: transparent !important; color: inherit !important; pointer-events: none !important; }" +
      "textarea { resize: none !important; }" +
      '[style*="overflow"] { overflow: visible !important; }' +
      '[style*="min-width"] { min-width: 0 !important; }' +
      '[style*="minHeight"], [style*="min-height"] { min-height: auto !important; }' +
      '[style*="height: 100vh"], [style*="minHeight: 100vh"], [style*="min-height: 100vh"] { min-height: auto !important; height: auto !important; }' +
      '[style*="padding: 32px 40px 48px"] { padding: 10px 14px 14px !important; }' +
      "h1, h2, h3, h4 { margin-top: 0 !important; }" +
      "@page { size: A4 landscape; margin: 7mm; }" +
      "@media print { body { background: #ffffff; } }" +
      "</style>" +
      "</head>" +
      "<body>" +
      clone.innerHTML +
      "</body>" +
      "</html>";

    janela.document.write(html);
    janela.document.close();

    setTimeout(() => {
      janela.focus();
      janela.print();
    }, 700);
  };

  const handleDeleteProject = async () => {
    if (!registroInicial?.id) {
      notifyError("Não é possível excluir um projeto sem ID.");
      return;
    }

    const nomeProjeto =
      data?.projectInfo?.nome || registroInicial?.nome_do_projeto || "Projeto";

    const confirmed = await requestAppPrompt({
      title: "Confirmar exclusão",
      message: `Tem certeza que deseja excluir o projeto "${nomeProjeto}"?`,
      type: "confirm",
      confirmLabel: "Sim",
      cancelLabel: "Não",
    });

    if (!confirmed) {
      notifyWarning("Exclusão cancelada.");
      return;
    }

    const { data: delData, error } = await deleteScrumProjectRecord(
      registroInicial.id,
    );

    if (error) {
      console.error("Erro ao excluir projeto:", error);
      notifyError(describeAppError(error, { action: "excluir", subject: "projeto" }));
      return;
    }

    if (!delData || delData.length === 0) {
      notifyWarning("Nenhum registro foi excluído. Verifique permissão ou existência do projeto.");
      return;
    }

    notifySuccess("Projeto excluído com sucesso.");

    if (typeof onSaved === "function") {
      await onSaved();
    }
    // Se o pai forneceu um callback onClose, chame-o para fechar o modal
    if (typeof onClose === "function") {
      try {
        await onClose();
        return;
      } catch (e) {
        // ignore and continue
      }
    }

    // Fallback: recarregar para garantir sincronização (menos ideal)
    window.setTimeout(() => window.location.reload(), 400);
  };

  const {
    projectInfo: pi,
    orcamentoProjeto = {},
    aprovacaoProjeto = {},
    phase1,
    phase2,
    phase3,
    phase4,
    phase5,
  } = data;

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
  const actDone = phase3.atividades.filter(
    (a) => a.status === "Concluída",
  ).length;
  const blockers = phase3.impedimentos.filter(
    (i) => !i.resolucao || i.resolucao.trim() === "",
  ).length;

  const monitoringRows = phase4.disparosRetornos || [];
  const conversion = phase4.conversaoCustos || {};

  const monitoringTotals = monitoringRows.reduce(
    (acc, row) => {
      acc.disparos += parseNumber(row.disparos);
      acc.retornos += parseNumber(row.retornos);
      acc.valorBase += parseMoney(row.valorBase);
      acc.qtdAcordos += parseNumber(row.qtdAcordos);
      acc.valorAcordo += parseMoney(row.valorAcordo);
      return acc;
    },
    { disparos: 0, retornos: 0, valorBase: 0, qtdAcordos: 0, valorAcordo: 0 },
  );

  const percentualRetornoGeral =
    monitoringTotals.disparos > 0
      ? (monitoringTotals.retornos / monitoringTotals.disparos) * 100
      : 0;

  const custoTotalDisparoCalculado =
    parseNumber(conversion.disparado) * parseMoney(conversion.custoUnitario);

  const custoPorRetornoCalculado =
    parseNumber(conversion.retorno) > 0
      ? custoTotalDisparoCalculado / parseNumber(conversion.retorno)
      : 0;

  const custoPorAcordoCalculado =
    parseNumber(conversion.acordoFormalizado) > 0
      ? custoTotalDisparoCalculado / parseNumber(conversion.acordoFormalizado)
      : 0;

  const roiCalculado =
    custoTotalDisparoCalculado > 0
      ? ((parseMoney(conversion.valorAcordo) - custoTotalDisparoCalculado) /
          custoTotalDisparoCalculado) *
        100
      : 0;

  const requiredFields = [
    pi.nome,
    pi.codigoId,
    pi.responsavel,
    pi.fornecedor,
    pi.dataAbertura,
    pi.previsaoEncerramento,
  ];
  const completedRequired = requiredFields.filter((value) =>
    String(value || "").trim(),
  ).length;
  const essentialProgress = Math.round(
    (completedRequired / requiredFields.length) * 100,
  );

  const approvalReady = aprovacaoCompleta(aprovacaoProjeto);
  const projectMode = registroInicial?.id ? "Editar projeto" : "Novo projeto";
  const phaseNavItems = [
    {
      key: "id",
      label: "Essenciais",
      helper: "Identidade do projeto",
      icon: ClipboardList,
      color: theme.gold,
      light: "#fef2f5",
    },
    {
      key: 0,
      label: "Orçamento",
      helper: "Custos e previsão",
      icon: WalletCards,
      color: theme.phases[0].bg,
      light: theme.phases[0].light,
    },
    {
      key: "A",
      label: "Aprovação",
      helper: "De Acordo executivo",
      icon: ShieldCheck,
      color: theme.phases.A.bg,
      light: theme.phases.A.light,
    },
    {
      key: 1,
      label: "Backlog",
      helper: "Objetivo e abertura",
      icon: LayoutDashboard,
      color: theme.phases[1].bg,
      light: theme.phases[1].light,
    },
    {
      key: 2,
      label: "Planejamento",
      helper: "Escopo, riscos e cronograma",
      icon: CalendarClock,
      color: theme.phases[2].bg,
      light: theme.phases[2].light,
    },
    {
      key: 3,
      label: "Execução",
      helper: "Atividades e impedimentos",
      icon: PlayCircle,
      color: theme.phases[3].bg,
      light: theme.phases[3].light,
    },
    {
      key: 4,
      label: "Monitoramento",
      helper: "KPIs e desempenho",
      icon: Activity,
      color: theme.phases[4].bg,
      light: theme.phases[4].light,
    },
    {
      key: 5,
      label: "Encerramento",
      helper: "Aceites e resultados",
      icon: Flag,
      color: theme.phases[5].bg,
      light: theme.phases[5].light,
    },
  ];
  const activeNavItem =
    phaseNavItems.find((item) => String(item.key) === activeProjectSection) ||
    phaseNavItems[0];
  const ActiveNavIcon = activeNavItem.icon;

  // ──────────────────────────────────────────────────────────
  return (
    <div
      ref={printRef}
      style={{
        minHeight: "100vh",
        background: theme.bg,
        fontFamily: theme.fontSans,
        color: theme.text,
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          background: theme.white,
          borderBottom: `1px solid ${theme.border}`,
          boxShadow: theme.shadowCard,
          padding: "0 32px",
          position: "sticky",
          top: 0,
          zIndex: 9990,
          overflow: "hidden",
        }}
      >
        {/* gold top stripe */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: theme.gold,
          }}
        />
        {/* subtle bg pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(180deg, rgba(254,242,245,0.68), rgba(255,255,255,0))",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "32px 0 28px",
            position: "relative",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 7,
              }}
            >
              <span
                style={{
                  background: theme.gold,
                  color: theme.white,
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "4px 12px",
                  borderRadius: 20,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                }}
              >
                Transformação Digital
              </span>
              <span style={{ color: theme.border, fontSize: 14 }}>
                |
              </span>
              <span style={{ color: theme.textSecondary, fontSize: 13 }}>
                Cadastro integrado
              </span>
            </div>
            <h1
              style={{
                margin: "0 0 5px",
                color: theme.text,
                fontSize: 32,
                fontWeight: 700,
                letterSpacing: 0,
                lineHeight: 1.16,
              }}
            >
              {projectMode}
            </h1>
            <p
              style={{
                margin: 0,
                color: theme.textSecondary,
                fontSize: 14,
                lineHeight: 1.55,
              }}
            >
              Registro e acompanhamento completo — Metodologia Scrum/PMI
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            {[
              {
                label: saving
                  ? "⏳  Salvando..."
                  : flash === "saved"
                    ? "✓  Salvo!"
                    : "Salvar projeto",
                fn: handleSave,
                style: {
                  background:
                    flash === "saved" ? "#16a34a" : theme.gold,
                  color: "#fff",
                  border: `1px solid ${flash === "saved" ? "#16a34a" : theme.gold}`,
                },
              },
              {
                label: "Exportar PDF",
                fn: handleExportPdf,
                style: {
                  background: theme.gold,
                  color: theme.white,
                  border: `1px solid ${theme.gold}`,
                },
              },
              registroInicial?.id
                ? {
                    label: "Excluir projeto",
                    fn: async () => await handleDeleteProject(),
                    style: {
                      background: "#fff",
                      color: "#991b1b",
                      border: `1px solid #fee2e2`,
                    },
                  }
                : null,
            ]
              .filter(Boolean)
              .map((btn) => (
                <button
                  key={btn.label}
                  onClick={btn.fn}
                  style={{
                    ...btn.style,
                    minHeight: 42,
                    padding: "10px 18px",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    letterSpacing: 0,
                    boxShadow: "0 10px 22px rgba(225,29,72,0.18)",
                    transition: theme.transitionBase,
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  {btn.label}
                </button>
              ))}
          </div>
        </div>
      </div>

      <div
        style={{
          background:
            "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          borderBottom: `1px solid ${theme.border}`,
          padding: "20px 32px 22px",
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "minmax(260px, 0.9fr) minmax(420px, 1.6fr)",
            gap: 16,
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              background: activeNavItem.light,
              border: `1px solid ${activeNavItem.color}2e`,
              borderRadius: 16,
              padding: 18,
              boxShadow: "0 14px 34px rgba(15,23,42,0.07)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: activeNavItem.color,
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  boxShadow: `0 10px 22px ${activeNavItem.color}30`,
                }}
              >
                <ActiveNavIcon size={20} />
              </span>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: activeNavItem.color,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Etapa ativa
                </div>
                <div style={{ fontSize: 18, color: theme.text, fontWeight: 950 }}>
                  {activeNavItem.label}
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 28, fontWeight: 950, color: theme.text }}>
                  {essentialProgress}%
                </div>
                <div style={{ fontSize: 12, color: theme.textSecondary }}>
                  Campos essenciais preenchidos
                </div>
              </div>
              <StatusBadge status={pi.status} />
            </div>
            <div
              style={{
                height: 8,
                background: theme.borderLight,
                borderRadius: 999,
                marginTop: 14,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${essentialProgress}%`,
                  height: "100%",
                  background: activeNavItem.color,
                  borderRadius: 999,
                }}
              />
            </div>
          </div>

          <div
            style={{
              background: theme.white,
              border: `1px solid ${theme.border}`,
              borderRadius: 16,
              padding: 16,
              boxShadow: "0 14px 34px rgba(15,23,42,0.07)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: 10,
                marginBottom: 14,
              }}
            >
              {[
                ["Fase atual", pi.faseAtual || "Backlog"],
                ["Previsão", pi.previsaoEncerramento || "-"],
                ["Aprovação", approvalReady ? "Liberada" : "Pendente"],
                ["Impedimentos", blockers > 0 ? `${blockers} ativo(s)` : "Nenhum"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    background: "#f8fafc",
                    border: `1px solid ${theme.borderLight}`,
                    borderRadius: 10,
                    padding: "10px 12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: theme.textMuted,
                      fontWeight: 850,
                      marginBottom: 5,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color:
                        label === "Impedimentos" && blockers > 0
                          ? "#dc2626"
                          : theme.text,
                      fontWeight: 850,
                      lineHeight: 1.25,
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
                gridTemplateColumns: "repeat(auto-fit, minmax(118px, 1fr))",
                gap: 8,
              }}
            >
              {phaseNavItems.map((item) => {
                const active = activeProjectSection === String(item.key);
                const Icon = item.icon;

                return (
                  <button
                    key={String(item.key)}
                    type="button"
                    onClick={() =>
                      item.key === "id"
                        ? scrollToIdentification()
                        : openPhase(item.key)
                    }
                    style={{
                      border: `1px solid ${active ? item.color : theme.border}`,
                      background: active ? item.light : "#fff",
                      color: active ? item.color : theme.textSecondary,
                      borderRadius: 10,
                      padding: "9px 10px",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 850,
                      boxShadow: active
                        ? `0 8px 18px ${item.color}18`
                        : "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      justifyContent: "flex-start",
                      minHeight: 42,
                    }}
                    title={item.helper}
                  >
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── SUMMARY CARDS ── */}
      <div
        style={{
          background: theme.bg,
          padding: "20px 32px",
          display: "none",
          gridTemplateColumns: "repeat(6,1fr)",
          gap: 16,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        {[
          { label: "Fase atual", val: pi.faseAtual, icon: "📍" },
          {
            label: "Status",
            val: <StatusBadge status={pi.status} />,
            icon: "🔔",
          },
          {
            label: "Progresso atividades",
            val: `${actDone} / ${actTotal}`,
            icon: "✅",
          },
          {
            label: "Encerramento previsto",
            val: pi.previsaoEncerramento
              ? new Date(pi.previsaoEncerramento).toLocaleDateString("pt-BR")
              : "—",
            icon: "📅",
          },
          {
            label: "Checklist abertura",
            val: `${p1Done} / ${Object.keys(phase1.checklist).length} itens`,
            icon: "📋",
          },
          {
            label: "Impedimentos ativos",
            val:
              blockers > 0 ? (
                <span style={{ color: "#dc2626", fontWeight: 700 }}>
                  {blockers} ativo{blockers > 1 ? "s" : ""}
                </span>
              ) : (
                <span style={{ color: "#16a34a", fontWeight: 700 }}>
                  Nenhum
                </span>
              ),
            icon: "🚫",
          },
        ].map((c, i) => (
          <div
            key={i}
            style={{
              background: theme.white,
              border: `1px solid ${theme.border}`,
              borderRadius: theme.radiusCard,
              padding: "16px",
              boxShadow: theme.shadowCard,
              transition: theme.transitionBase,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = theme.shadowHover;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = theme.shadowCard;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: theme.textSecondary,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 800,
              }}
            >
              {c.icon} {c.label}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: theme.text, lineHeight: 1.25 }}>
              {c.val}
            </div>
          </div>
        ))}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div
        style={{ padding: "32px 32px 48px", maxWidth: 1320, margin: "0 auto" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px minmax(0, 1fr)",
            gap: 22,
            alignItems: "start",
          }}
        >
          <aside
            style={{
              position: "sticky",
              top: 18,
              background: "#fff",
              border: `1px solid ${theme.border}`,
              borderRadius: 16,
              padding: 14,
              boxShadow: "0 14px 34px rgba(15,23,42,0.07)",
            }}
          >
            <div
              style={{
                padding: "8px 8px 12px",
                borderBottom: `1px solid ${theme.borderLight}`,
                marginBottom: 10,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 950, color: theme.text }}>
                Project Studio
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: theme.textSecondary,
                  marginTop: 3,
                  lineHeight: 1.35,
                }}
              >
                Navegue por contexto. Cada tela mostra somente o que precisa ser tratado agora.
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {phaseNavItems.map((item, index) => {
                const active = activeProjectSection === String(item.key);
                const Icon = item.icon;

                return (
                  <button
                    key={String(item.key)}
                    type="button"
                    onClick={() =>
                      item.key === "id"
                        ? scrollToIdentification()
                        : openPhase(item.key)
                    }
                    style={{
                      width: "100%",
                      border: `1px solid ${active ? item.color : "transparent"}`,
                      background: active ? item.light : "transparent",
                      color: active ? item.color : theme.textSecondary,
                      borderRadius: 12,
                      padding: "10px 11px",
                      cursor: "pointer",
                      display: "grid",
                      gridTemplateColumns: "32px 1fr",
                      gap: 10,
                      alignItems: "center",
                      textAlign: "left",
                    }}
                  >
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        display: "grid",
                        placeItems: "center",
                        background: active ? item.color : "#f8fafc",
                        color: active ? "#fff" : theme.textMuted,
                        border: `1px solid ${active ? item.color : theme.border}`,
                      }}
                    >
                      <Icon size={16} />
                    </span>
                    <span>
                      <span
                        style={{
                          display: "block",
                          fontSize: 12,
                          fontWeight: 900,
                          color: active ? item.color : theme.text,
                        }}
                      >
                        {String(index + 1).padStart(2, "0")} - {item.label}
                      </span>
                      <span
                        style={{
                          display: "block",
                          fontSize: 10,
                          color: theme.textMuted,
                          marginTop: 2,
                          lineHeight: 1.25,
                        }}
                      >
                        {item.helper}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div style={{ minWidth: 0 }}>
        {/* ===== IDENTIFICAÇÃO ===== */}
        <div
          id="project-identification"
          style={{
            display: activeProjectSection === "id" ? "block" : "none",
            background: "#fff",
            borderRadius: theme.radiusCard,
            border: `1px solid ${theme.border}`,
            marginBottom: 24,
            overflow: "hidden",
            boxShadow: theme.shadowCard,
          }}
        >
          <div
            style={{
              background: theme.navy,
              color: "#fff",
              padding: "15px 24px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 18 }}>📋</span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              Identificação do Projeto
            </span>
          </div>

          <div style={{ padding: "24px 28px" }}>
            {/* Full-width: Nome */}
            <FieldRow label="Nome do projeto">
              <EditField
                value={pi.nome}
                onChange={(v) => setPI("nome", v)}
                placeholder="Nome completo do projeto"
              />
            </FieldRow>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0 48px",
              }}
            >
              {/* LEFT */}
              <div>
                <FieldRow label="Código / ID">
                  <EditField
                    value={pi.codigoId}
                    onChange={(v) => setPI("codigoId", v)}
                    placeholder="Ex: TD-2025-001"
                  />
                </FieldRow>
                <FieldRow label="Tipo">
                  <div style={{ display: "flex", gap: 24, paddingLeft: 2 }}>
                    {["Fornecedor", "Interno"].map((opt) => (
                      <label
                        key={opt}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          cursor: "pointer",
                          fontSize: 13,
                        }}
                      >
                        <input
                          type="radio"
                          name="tipo"
                          value={opt}
                          checked={pi.tipo === opt}
                          onChange={() => setPI("tipo", opt)}
                          style={{ accentColor: theme.navy }}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </FieldRow>
                <FieldRow label="Canal / Produto">
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      flexWrap: "wrap",
                      paddingLeft: 2,
                    }}
                  >
                    {[
                      "WhatsApp",
                      "RCS",
                      "SMS",
                      "E-mail",
                      "Portal",
                      "IA",
                      "Outros",
                    ].map((opt) => (
                      <label
                        key={opt}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        <input
                          type="checkbox"
                          value={opt}
                          checked={pi.canais.includes(opt)}
                          onChange={(e) => {
                            const canaisSemNA = pi.canais.filter(
                              (c) => c !== "N/A",
                            );
                            const canaisAtualizados = e.target.checked
                              ? [...canaisSemNA, opt]
                              : canaisSemNA.filter((c) => c !== opt);

                            setData((d) => ({
                              ...d,
                              projectInfo: {
                                ...d.projectInfo,
                                canais: canaisAtualizados,
                                ...(opt === "Outros" && !e.target.checked
                                  ? { outroCanalProduto: "" }
                                  : {}),
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
                        onChange={(e) =>
                          setPI("outroCanalProduto", e.target.value)
                        }
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
                        onFocus={(e) => {
                          e.target.style.border = `1px solid ${theme.navy}`;
                          e.target.style.background = "#f8fafc";
                        }}
                        onBlur={(e) => {
                          e.target.style.border = `1px solid ${theme.border}`;
                          e.target.style.background = "#fff";
                        }}
                      />
                    )}
                  </div>
                </FieldRow>
                <FieldRow label="Fornecedor">
                  <EditField
                    value={pi.fornecedor}
                    onChange={(v) => setPI("fornecedor", v)}
                    placeholder="Nome do fornecedor"
                  />
                </FieldRow>
                <FieldRow label="Responsável">
                  <EditField
                    value={pi.responsavel}
                    onChange={(v) => setPI("responsavel", v)}
                    placeholder="Responsável pelo projeto"
                  />
                </FieldRow>
                <FieldRow label="Solicitante / Carteira">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <EditField
                      value={pi.solicitante}
                      onChange={(v) => setPI("solicitante", v)}
                      placeholder="Ex: Rodrigo Pacheco — Marketing"
                    />
                    <EditField
                      value={pi.carteira}
                      onChange={(v) => setPI("carteira", v)}
                      placeholder="Ex: Cartões, Varejo, Pessoa Física"
                    />
                  </div>
                </FieldRow>
              </div>
              {/* RIGHT */}
              <div>
                <FieldRow label="Equipe envolvida">
                  <EditField
                    value={pi.equipe}
                    onChange={(v) => setPI("equipe", v)}
                    placeholder="Membros da equipe"
                  />
                </FieldRow>
                <FieldRow label="Data de abertura">
                  <DateInput
                    value={pi.dataAbertura}
                    onChange={(v) => setPI("dataAbertura", v)}
                  />
                </FieldRow>
                <FieldRow label="Prev. de encerramento">
                  <DateInput
                    value={pi.previsaoEncerramento}
                    onChange={(v) => setPI("previsaoEncerramento", v)}
                  />
                </FieldRow>
                <FieldRow label="Fase atual">
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                      paddingLeft: 2,
                    }}
                  >
                    {[
                      "Início",
                      "Planejamento",
                      "Execução",
                      "Monitoramento",
                      "Encerramento",
                    ].map((opt) => (
                      <label
                        key={opt}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        <input
                          type="radio"
                          name="fase"
                          value={opt}
                          checked={pi.faseAtual === opt}
                          onChange={() => setFaseAtualComValidacao(opt)}
                          style={{ accentColor: theme.navy }}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </FieldRow>
                <FieldRow label="Status">
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      flexWrap: "wrap",
                      paddingLeft: 2,
                    }}
                  >
                    {["Em dia", "Atenção", "Atrasado", "Concluído"].map(
                      (opt) => (
                        <label
                          key={opt}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="radio"
                            name="status"
                            value={opt}
                            checked={pi.status === opt}
                            onChange={() => setPI("status", opt)}
                            style={{ accentColor: theme.navy }}
                          />
                          <StatusBadge status={opt} size="small" />
                        </label>
                      ),
                    )}
                  </div>
                </FieldRow>
              </div>
            </div>
          </div>
        </div>

        {/* ===== FASE 0 — ORÇAMENTO DO PROJETO ===== */}
        <PhaseSection
          id="project-phase-0"
          visible={activeProjectSection === "0"}
          phaseNum={0}
          title="Orçamento do Projeto"
          expanded={phases[0]}
          onToggle={() => toggle(0)}
        >
          <SubSection title="0.1 Planejamento financeiro">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0 48px",
              }}
            >
              <div>
                <FieldRow label="Orçamento total">
                  <EditField
                    value={orcamentoProjeto.orcamentoTotal || ""}
                    onChange={(v) => setOrcamentoMoeda("orcamentoTotal", v)}
                    placeholder="Ex: R$ 13.000,00"
                  />
                </FieldRow>

                <FieldRow label="Custo de implementação">
                  <EditField
                    value={orcamentoProjeto.custoImplementacao || ""}
                    onChange={(v) => setOrcamentoMoeda("custoImplementacao", v)}
                    placeholder="Ex: R$ 5.000,00"
                  />
                </FieldRow>

                <FieldRow label="Carteira / Banco">
                  <EditField
                    value={
                      orcamentoProjeto.carteiraBanco ||
                      orcamentoProjeto.fornecedorSolucao ||
                      ""
                    }
                    onChange={(v) => setOrcamento("carteiraBanco", v)}
                    placeholder="Ex: Bradesco, Santander, Renner, BV..."
                  />
                </FieldRow>
              </div>

              <div>
                <FieldRow label="Cobrança mensal">
                  <EditField
                    value={orcamentoProjeto.cobrancaMensal || ""}
                    onChange={(v) => setOrcamentoMoeda("cobrancaMensal", v)}
                    placeholder="Ex: R$ 3.000,00"
                  />
                </FieldRow>

                <FieldRow label="Valor dos disparos">
                  <EditField
                    value={orcamentoProjeto.valorDisparoUnitario || ""}
                    onChange={(v) =>
                      setOrcamentoMoeda("valorDisparoUnitario", v)
                    }
                    placeholder="Ex: R$ 0,15"
                  />
                </FieldRow>

                <FieldRow label="Disparos por dia">
                  <EditField
                    value={orcamentoProjeto.quantidadeDisparosDia || ""}
                    onChange={(v) => setOrcamento("quantidadeDisparosDia", v)}
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
                      marginBottom: 6,
                    }}
                  >
                    {item.label}
                  </div>

                  <div
                    style={{
                      fontSize: 20,
                      color: theme.phases[0].bg,
                      fontWeight: 900,
                    }}
                  >
                    {item.value}
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: theme.textSecondary,
                      marginTop: 6,
                      lineHeight: 1.4,
                    }}
                  >
                    {item.helper}
                  </div>
                </div>
              ))}
            </div>
          </SubSection>
        </PhaseSection>

        {/* ===== DE ACORDO — APROVAÇÃO EXECUTIVA ===== */}
        <PhaseSection
          id="project-phase-A"
          visible={activeProjectSection === "A"}
          phaseNum="A"
          title="De Acordo — Aprovação Executiva"
          expanded={phases.A}
          onToggle={() => toggle("A")}
        >
          <SubSection title="Aprovação da Diretoria/ Superintendentes">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0 48px",
              }}
            >
              <div>
                <FieldRow label="Status de aprovação">
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      flexWrap: "wrap",
                      paddingLeft: 2,
                    }}
                  >
                    {[
                      "Em Análise",
                      "Aprovado pela Diretoria",
                      "Reprovado/Ajustes Necessários",
                    ].map((opt) => {
                      const color =
                        opt === "Aprovado pela Diretoria"
                          ? "#047857"
                          : opt === "Reprovado/Ajustes Necessários"
                            ? "#be123c"
                            : "#b45309";

                      const bg =
                        opt === "Aprovado pela Diretoria"
                          ? "#d1fae5"
                          : opt === "Reprovado/Ajustes Necessários"
                            ? "#ffe4e6"
                            : "#fef3c7";

                      return (
                        <label
                          key={opt}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="radio"
                            name="statusAprovacao"
                            value={opt}
                            checked={
                              (aprovacaoProjeto.statusAprovacao ||
                                "Em Análise") === opt
                            }
                            onChange={() =>
                              setAprovacao("statusAprovacao", opt)
                            }
                            style={{ accentColor: color }}
                          />
                          <span
                            style={{
                              background: bg,
                              color,
                              borderRadius: 20,
                              padding: "3px 10px",
                              fontSize: 11,
                              fontWeight: 800,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {opt}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </FieldRow>

                <FieldRow label="Aprovador">
                  <EditField
                    value={aprovacaoProjeto.aprovador || ""}
                    onChange={(v) => setAprovacao("aprovador", v)}
                    placeholder="Nome do Diretor ou Superintendente"
                  />
                </FieldRow>
              </div>

              <div>
                <FieldRow label="Anexo De Acordo">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) =>
                        setAprovacao(
                          "evidenciaArquivo",
                          e.target.files?.[0]?.name || "",
                        )
                      }
                      style={{
                        fontSize: 12,
                        color: theme.textSecondary,
                        maxWidth: 260,
                      }}
                    />

                    {aprovacaoProjeto.evidenciaArquivo && (
                      <span
                        style={{
                          fontSize: 11,
                          color: theme.phases.A.bg,
                          background: theme.phases.A.light,
                          borderRadius: 20,
                          padding: "4px 10px",
                          fontWeight: 800,
                        }}
                      >
                        {aprovacaoProjeto.evidenciaArquivo}
                      </span>
                    )}
                  </div>
                </FieldRow>
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                border: `1px solid ${aprovacaoCompleta(aprovacaoProjeto) ? "#86efac" : "#fde68a"}`,
                background: aprovacaoCompleta(aprovacaoProjeto)
                  ? "#f0fdf4"
                  : "#fffbeb",
                borderRadius: theme.radiusCard,
                padding: "14px 16px",
                fontSize: 12,
                color: aprovacaoCompleta(aprovacaoProjeto)
                  ? "#166534"
                  : "#92400e",
                lineHeight: 1.5,
                fontWeight: 700,
              }}
            >
              {aprovacaoCompleta(aprovacaoProjeto)
                ? "✓ De Acordo registrado. Projeto liberado para avançar no fluxo técnico."
                : "⚠ Projeto aguardando validação executiva. Para avançar, registre status aprovado e aprovador."}
            </div>
          </SubSection>
        </PhaseSection>

        {/* ===== FASE 1 — BACKLOG ===== */}
        <PhaseSection
          id="project-phase-1"
          visible={activeProjectSection === "1"}
          phaseNum={1}
          title="Fase 1 — Backlog"
          expanded={phases[1]}
          onToggle={() => toggle(1)}
        >
          <SubSection title="1.1 Objetivo e Justificativa">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: theme.textSecondary,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    marginBottom: 6,
                  }}
                >
                  Objetivo principal
                </div>
                <div
                  style={{
                    border: `1px solid ${theme.border}`,
                    borderRadius: 6,
                    padding: 2,
                    minHeight: 90,
                  }}
                >
                  <EditField
                    value={phase1.objetivo}
                    onChange={(v) => setP1("objetivo", v)}
                    placeholder="Descreva em 1–2 frases o que este projeto deve entregar..."
                    multi
                    minH={80}
                  />
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: theme.textSecondary,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    marginBottom: 6,
                  }}
                >
                  Justificativa / Problema que resolve
                </div>
                <div
                  style={{
                    border: `1px solid ${theme.border}`,
                    borderRadius: 6,
                    padding: 2,
                    minHeight: 90,
                  }}
                >
                  <EditField
                    value={phase1.justificativa}
                    onChange={(v) => setP1("justificativa", v)}
                    placeholder="Por que este projeto é necessário agora?"
                    multi
                    minH={80}
                  />
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
                  <tr
                    key={row.id}
                    style={{ background: i % 2 === 0 ? "#fff" : "#1e293b" }}
                  >
                    <Td>
                      <EditField
                        value={row.nome}
                        onChange={(v) =>
                          updRow("phase1", "stakeholders", row.id, "nome", v)
                        }
                        placeholder="Nome / Área"
                      />
                    </Td>
                    <Td>
                      <EditField
                        value={row.papel}
                        onChange={(v) =>
                          updRow("phase1", "stakeholders", row.id, "papel", v)
                        }
                        placeholder="Papel"
                      />
                    </Td>
                    <Td>
                      <EditField
                        value={row.envolvimento}
                        onChange={(v) =>
                          updRow(
                            "phase1",
                            "stakeholders",
                            row.id,
                            "envolvimento",
                            v,
                          )
                        }
                        placeholder="Tipo de envolvimento"
                      />
                    </Td>
                    <Td>
                      <DeleteBtn
                        onClick={() => delRow("phase1", "stakeholders", row.id)}
                      />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            <div style={{ marginTop: 10 }}>
              <GhostBtn
                onClick={() =>
                  addRow("phase1", "stakeholders", {
                    nome: "",
                    papel: "",
                    envolvimento: "",
                  })
                }
              >
                ＋ Adicionar stakeholder
              </GhostBtn>
            </div>
          </SubSection>

          <SubSection title="1.3 Termo de Abertura (checklist)">
            <div
              style={{
                background: "#f8f9fb",
                border: `1px solid ${theme.border}`,
                borderRadius: 6,
                padding: "10px 20px",
              }}
            >
              {[
                {
                  key: "objetivoAprovado",
                  label: "Objetivo aprovado pelo solicitante",
                },
                {
                  key: "stakeholdersIdentificados",
                  label: "Stakeholders identificados",
                },
                { key: "escopoDefinido", label: "Escopo inicial definido" },
                {
                  key: "recursosAprovados",
                  label: "Recursos aprovados (equipe/orçamento)",
                },
              ].map((item) => (
                <CheckItem
                  key={item.key}
                  checked={phase1.checklist[item.key]}
                  onChange={(v) => setCheckP1(item.key, v)}
                  label={item.label}
                />
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: theme.textMuted }}>
              <span
                style={{
                  background: theme.phases[1].light,
                  color: theme.phases[1].bg,
                  padding: "2px 10px",
                  borderRadius: 20,
                  fontWeight: 700,
                }}
              >
                {p1Done} / {Object.keys(phase1.checklist).length} itens
                concluídos
              </span>
            </div>
          </SubSection>
        </PhaseSection>

        {/* ===== FASE 2 — PLANEJAMENTO ===== */}
        <PhaseSection
          id="project-phase-2"
          visible={activeProjectSection === "2"}
          phaseNum={2}
          title="Fase 2 — Planejamento"
          expanded={phases[2]}
          onToggle={() => toggle(2)}
        >
          <SubSection title="2.1 Escopo">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              {[
                {
                  label: "✓ Dentro do escopo",
                  key: "dentro",
                  hBg: "#dcfce7",
                  hText: "#065f46",
                  bBorder: "#bbf7d0",
                  dotColor: "#16a34a",
                },
                {
                  label: "✗ Fora do escopo",
                  key: "fora",
                  hBg: "#fee2e2",
                  hText: "#991b1b",
                  bBorder: "#fecaca",
                  dotColor: "#dc2626",
                },
              ].map((col) => (
                <div key={col.key}>
                  <div
                    style={{
                      background: col.hBg,
                      color: col.hText,
                      padding: "8px 14px",
                      borderRadius: "6px 6px 0 0",
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                    }}
                  >
                    {col.label}
                  </div>
                  <div
                    style={{
                      border: `1px solid ${col.bBorder}`,
                      borderTop: "none",
                      borderRadius: "0 0 6px 6px",
                      padding: "12px 14px",
                      minHeight: 100,
                      background: "#fff",
                    }}
                  >
                    {phase2.escopo[col.key].map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            color: col.dotColor,
                            marginTop: 3,
                            flexShrink: 0,
                          }}
                        >
                          •
                        </span>
                        <EditField
                          value={item}
                          onChange={(v) => {
                            const arr = [...phase2.escopo[col.key]];
                            arr[i] = v;
                            setData((d) => ({
                              ...d,
                              phase2: {
                                ...d.phase2,
                                escopo: { ...d.phase2.escopo, [col.key]: arr },
                              },
                            }));
                          }}
                          placeholder="Descreva o item..."
                        />
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        setData((d) => ({
                          ...d,
                          phase2: {
                            ...d.phase2,
                            escopo: {
                              ...d.phase2.escopo,
                              [col.key]: [...d.phase2.escopo[col.key], ""],
                            },
                          },
                        }))
                      }
                      style={{
                        fontSize: 12,
                        color: col.hText,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px 0",
                        fontWeight: 600,
                      }}
                    >
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
                  <tr
                    key={row.id}
                    style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}
                  >
                    <Td>
                      <EditField
                        value={row.tarefa}
                        onChange={(v) =>
                          updRow("phase2", "cronograma", row.id, "tarefa", v)
                        }
                        placeholder="Descrição da tarefa"
                      />
                    </Td>
                    <Td>
                      <DateInput
                        value={row.previsto}
                        onChange={(v) =>
                          updRow("phase2", "cronograma", row.id, "previsto", v)
                        }
                      />
                    </Td>
                    <Td>
                      <DateInput
                        value={row.realizado}
                        onChange={(v) =>
                          updRow("phase2", "cronograma", row.id, "realizado", v)
                        }
                      />
                    </Td>
                    <Td>
                      <SelectInput
                        value={row.status}
                        onChange={(v) =>
                          updRow("phase2", "cronograma", row.id, "status", v)
                        }
                        options={["Pendente", "Em andamento", "Concluída"]}
                      />
                      <div style={{ marginTop: 4 }}>
                        <StatusBadge status={row.status} size="small" />
                      </div>
                    </Td>
                    <Td>
                      <DeleteBtn
                        onClick={() => delRow("phase2", "cronograma", row.id)}
                      />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            <div style={{ marginTop: 10 }}>
              <GhostBtn
                onClick={() =>
                  addRow("phase2", "cronograma", {
                    tarefa: "",
                    previsto: "",
                    realizado: "",
                    status: "Pendente",
                  })
                }
              >
                ＋ Adicionar tarefa
              </GhostBtn>
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
                  <tr
                    key={row.id}
                    style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}
                  >
                    <Td>
                      <EditField
                        value={row.risco}
                        onChange={(v) =>
                          updRow("phase2", "riscos", row.id, "risco", v)
                        }
                        placeholder="Descrição do risco"
                        multi
                      />
                    </Td>
                    <Td style={{ verticalAlign: "top" }}>
                      <SelectInput
                        value={row.probabilidade}
                        onChange={(v) =>
                          updRow("phase2", "riscos", row.id, "probabilidade", v)
                        }
                        options={["Alta", "Média", "Baixa"]}
                      />
                      <div style={{ marginTop: 5 }}>
                        <RiskBadge level={row.probabilidade} />
                      </div>
                    </Td>
                    <Td style={{ verticalAlign: "top" }}>
                      <SelectInput
                        value={row.impacto}
                        onChange={(v) =>
                          updRow("phase2", "riscos", row.id, "impacto", v)
                        }
                        options={["Alto", "Médio", "Baixo"]}
                      />
                      <div style={{ marginTop: 5 }}>
                        <RiskBadge level={row.impacto} />
                      </div>
                    </Td>
                    <Td>
                      <EditField
                        value={row.mitigacao}
                        onChange={(v) =>
                          updRow("phase2", "riscos", row.id, "mitigacao", v)
                        }
                        placeholder="Plano de mitigação"
                        multi
                      />
                    </Td>
                    <Td>
                      <DeleteBtn
                        onClick={() => delRow("phase2", "riscos", row.id)}
                      />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            <div style={{ marginTop: 10 }}>
              <GhostBtn
                onClick={() =>
                  addRow("phase2", "riscos", {
                    risco: "",
                    probabilidade: "Média",
                    impacto: "Médio",
                    mitigacao: "",
                  })
                }
              >
                ＋ Adicionar risco
              </GhostBtn>
            </div>
          </SubSection>
        </PhaseSection>

        {/* ===== FASE 3 — EXECUÇÃO ===== */}
        <PhaseSection
          id="project-phase-3"
          visible={activeProjectSection === "3"}
          phaseNum={3}
          title="Fase 3 — Execução"
          expanded={phases[3]}
          onToggle={() => toggle(3)}
        >
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
                  <tr
                    key={row.id}
                    style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}
                  >
                    <Td>
                      <EditField
                        value={row.atividade}
                        onChange={(v) =>
                          updRow("phase3", "atividades", row.id, "atividade", v)
                        }
                        placeholder="Descrição da atividade"
                      />
                    </Td>
                    <Td>
                      <EditField
                        value={row.responsavel}
                        onChange={(v) =>
                          updRow(
                            "phase3",
                            "atividades",
                            row.id,
                            "responsavel",
                            v,
                          )
                        }
                        placeholder="Responsável"
                      />
                    </Td>
                    <Td>
                      <DateInput
                        value={row.prazo}
                        onChange={(v) =>
                          updRow("phase3", "atividades", row.id, "prazo", v)
                        }
                      />
                    </Td>
                    <Td>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 5,
                        }}
                      >
                        {["Pendente", "Em andamento", "Concluída"].map(
                          (opt) => (
                            <label
                              key={opt}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                cursor: "pointer",
                              }}
                            >
                              <input
                                type="radio"
                                name={`at-${row.id}`}
                                checked={row.status === opt}
                                onChange={() =>
                                  updRow(
                                    "phase3",
                                    "atividades",
                                    row.id,
                                    "status",
                                    opt,
                                  )
                                }
                                style={{ accentColor: theme.phases[3].bg }}
                              />
                              <StatusBadge status={opt} size="small" />
                            </label>
                          ),
                        )}
                      </div>
                    </Td>
                    <Td>
                      <DeleteBtn
                        onClick={() => delRow("phase3", "atividades", row.id)}
                      />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            <div style={{ marginTop: 10 }}>
              <GhostBtn
                onClick={() =>
                  addRow("phase3", "atividades", {
                    atividade: "",
                    responsavel: "",
                    prazo: "",
                    status: "Pendente",
                  })
                }
              >
                ＋ Adicionar atividade
              </GhostBtn>
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
                  <tr
                    key={row.id}
                    style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}
                  >
                    <Td>
                      <EditField
                        value={row.impedimento}
                        onChange={(v) =>
                          updRow(
                            "phase3",
                            "impedimentos",
                            row.id,
                            "impedimento",
                            v,
                          )
                        }
                        placeholder="Descrição do impedimento"
                        multi
                      />
                    </Td>
                    <Td>
                      <DateInput
                        value={row.dataIdentificado}
                        onChange={(v) =>
                          updRow(
                            "phase3",
                            "impedimentos",
                            row.id,
                            "dataIdentificado",
                            v,
                          )
                        }
                      />
                    </Td>
                    <Td>
                      <EditField
                        value={row.responsavel}
                        onChange={(v) =>
                          updRow(
                            "phase3",
                            "impedimentos",
                            row.id,
                            "responsavel",
                            v,
                          )
                        }
                        placeholder="Responsável"
                      />
                    </Td>
                    <Td>
                      <EditField
                        value={row.resolucao}
                        onChange={(v) =>
                          updRow(
                            "phase3",
                            "impedimentos",
                            row.id,
                            "resolucao",
                            v,
                          )
                        }
                        placeholder="Descrição da resolução e data"
                        multi
                      />
                    </Td>
                    <Td>
                      <DeleteBtn
                        onClick={() => delRow("phase3", "impedimentos", row.id)}
                      />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            <div style={{ marginTop: 10 }}>
              <GhostBtn
                onClick={() =>
                  addRow("phase3", "impedimentos", {
                    impedimento: "",
                    dataIdentificado: "",
                    responsavel: "",
                    resolucao: "",
                  })
                }
              >
                ＋ Adicionar impedimento
              </GhostBtn>
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
                  <tr
                    key={row.id}
                    style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}
                  >
                    <Td>
                      <DateInput
                        value={row.data}
                        onChange={(v) =>
                          updRow("phase3", "decisoes", row.id, "data", v)
                        }
                      />
                    </Td>
                    <Td>
                      <EditField
                        value={row.decisao}
                        onChange={(v) =>
                          updRow("phase3", "decisoes", row.id, "decisao", v)
                        }
                        placeholder="Decisão tomada"
                        multi
                      />
                    </Td>
                    <Td>
                      <EditField
                        value={row.quemDecidiu}
                        onChange={(v) =>
                          updRow("phase3", "decisoes", row.id, "quemDecidiu", v)
                        }
                        placeholder="Nome / cargo"
                      />
                    </Td>
                    <Td>
                      <DeleteBtn
                        onClick={() => delRow("phase3", "decisoes", row.id)}
                      />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            <div style={{ marginTop: 10 }}>
              <GhostBtn
                onClick={() =>
                  addRow("phase3", "decisoes", {
                    data: "",
                    decisao: "",
                    quemDecidiu: "",
                  })
                }
              >
                ＋ Adicionar decisão
              </GhostBtn>
            </div>
          </SubSection>
        </PhaseSection>

        {/* ===== FASE 4 — MONITORAMENTO ===== */}
        <PhaseSection
          id="project-phase-4"
          visible={activeProjectSection === "4"}
          phaseNum={4}
          title="Fase 4 — Monitoramento / Desempenho"
          expanded={phases[4]}
          onToggle={() => toggle(4)}
        >
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
                  <tr
                    key={row.id}
                    style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}
                  >
                    <Td style={{ fontWeight: 500, color: theme.navy }}>
                      {row.indicador}
                    </Td>
                    <Td>
                      <EditField
                        value={row.meta}
                        onChange={(v) =>
                          updRow("phase4", "kpis", row.id, "meta", v)
                        }
                        placeholder="Meta"
                      />
                    </Td>
                    <Td>
                      <EditField
                        value={row.realizado}
                        onChange={(v) =>
                          updRow("phase4", "kpis", row.id, "realizado", v)
                        }
                        placeholder="Realizado"
                      />
                    </Td>
                    <Td>
                      <EditField
                        value={row.variacao}
                        onChange={(v) =>
                          updRow("phase4", "kpis", row.id, "variacao", v)
                        }
                        placeholder="—"
                      />
                    </Td>
                    <Td>
                      <SelectInput
                        value={row.status}
                        onChange={(v) =>
                          updRow("phase4", "kpis", row.id, "status", v)
                        }
                        options={["Em dia", "Atenção", "Atrasado", "Pendente"]}
                      />
                      <div style={{ marginTop: 5 }}>
                        <StatusBadge status={row.status} size="small" />
                      </div>
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
                  <tr
                    key={row.id}
                    style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}
                  >
                    <Td>
                      <DateInput
                        value={row.data}
                        onChange={(v) =>
                          updRow("phase4", "relatorioStatus", row.id, "data", v)
                        }
                      />
                    </Td>
                    <Td>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 5,
                        }}
                      >
                        {["Em dia", "Atenção", "Atrasado"].map((opt) => (
                          <label
                            key={opt}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="radio"
                              name={`rel-${row.id}`}
                              checked={row.statusGeral === opt}
                              onChange={() =>
                                updRow(
                                  "phase4",
                                  "relatorioStatus",
                                  row.id,
                                  "statusGeral",
                                  opt,
                                )
                              }
                              style={{ accentColor: theme.phases[4].bg }}
                            />
                            <StatusBadge status={opt} size="small" />
                          </label>
                        ))}
                      </div>
                    </Td>
                    <Td>
                      <EditField
                        value={row.feito}
                        onChange={(v) =>
                          updRow(
                            "phase4",
                            "relatorioStatus",
                            row.id,
                            "feito",
                            v,
                          )
                        }
                        placeholder="O que foi feito neste período..."
                        multi
                      />
                    </Td>
                    <Td>
                      <EditField
                        value={row.proximos}
                        onChange={(v) =>
                          updRow(
                            "phase4",
                            "relatorioStatus",
                            row.id,
                            "proximos",
                            v,
                          )
                        }
                        placeholder="Próximos passos..."
                        multi
                      />
                    </Td>
                    <Td>
                      <DeleteBtn
                        onClick={() =>
                          delRow("phase4", "relatorioStatus", row.id)
                        }
                      />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            <div style={{ marginTop: 10 }}>
              <GhostBtn
                onClick={() =>
                  addRow("phase4", "relatorioStatus", {
                    data: "",
                    statusGeral: "Em dia",
                    feito: "",
                    proximos: "",
                  })
                }
              >
                ＋ Adicionar relatório de status
              </GhostBtn>
            </div>
          </SubSection>

          <MonitoringConversionSection
            phase4={phase4}
            setP4Conversion={setP4Conversion}
          />
        </PhaseSection>

        {/* ===== FASE 5 — ENCERRAMENTO ===== */}
        <PhaseSection
          id="project-phase-5"
          visible={activeProjectSection === "5"}
          phaseNum={5}
          title="Fase 5 — Encerramento"
          expanded={phases[5]}
          onToggle={() => toggle(5)}
        >
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
                  <tr
                    key={row.id}
                    style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}
                  >
                    <Td>
                      <EditField
                        value={row.entregavel}
                        onChange={(v) =>
                          updRow(
                            "phase5",
                            "entregaveis",
                            row.id,
                            "entregavel",
                            v,
                          )
                        }
                        placeholder="Descrição do entregável"
                      />
                    </Td>
                    <Td>
                      <div style={{ display: "flex", gap: 16 }}>
                        {[
                          { val: true, label: "Sim", color: "#16a34a" },
                          { val: false, label: "Não", color: "#dc2626" },
                        ].map((opt) => (
                          <label
                            key={String(opt.val)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="radio"
                              name={`aceite-${row.id}`}
                              checked={row.aceite === opt.val}
                              onChange={() =>
                                updRow(
                                  "phase5",
                                  "entregaveis",
                                  row.id,
                                  "aceite",
                                  opt.val,
                                )
                              }
                              style={{ accentColor: opt.color }}
                            />
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: opt.color,
                              }}
                            >
                              {opt.label}
                            </span>
                          </label>
                        ))}
                        {row.aceite === null && (
                          <span
                            style={{
                              fontSize: 11,
                              color: theme.textMuted,
                              fontStyle: "italic",
                            }}
                          >
                            Pendente
                          </span>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <EditField
                        value={row.responsavel}
                        onChange={(v) =>
                          updRow(
                            "phase5",
                            "entregaveis",
                            row.id,
                            "responsavel",
                            v,
                          )
                        }
                        placeholder="Responsável"
                      />
                    </Td>
                    <Td>
                      <DeleteBtn
                        onClick={() => delRow("phase5", "entregaveis", row.id)}
                      />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            <div style={{ marginTop: 10 }}>
              <GhostBtn
                onClick={() =>
                  addRow("phase5", "entregaveis", {
                    entregavel: "",
                    aceite: null,
                    responsavel: "",
                  })
                }
              >
                ＋ Adicionar entregável
              </GhostBtn>
            </div>
          </SubSection>

          <SubSection title="5.2 Lições Aprendidas">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              {[
                {
                  label: "✓ O que funcionou bem?",
                  key: "funcionouBem",
                  hBg: "#dcfce7",
                  hText: "#065f46",
                  bBorder: "#bbf7d0",
                },
                {
                  label: "↑ O que deve ser melhorado?",
                  key: "melhorar",
                  hBg: "#fef9c3",
                  hText: "#854d0e",
                  bBorder: "#fef08a",
                },
              ].map((col) => (
                <div key={col.key}>
                  <div
                    style={{
                      background: col.hBg,
                      color: col.hText,
                      padding: "8px 14px",
                      borderRadius: "6px 6px 0 0",
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                    }}
                  >
                    {col.label}
                  </div>
                  <div
                    style={{
                      border: `1px solid ${col.bBorder}`,
                      borderTop: "none",
                      borderRadius: "0 0 6px 6px",
                      padding: 2,
                      minHeight: 90,
                    }}
                  >
                    <EditField
                      value={phase5.licoesAprendidas[col.key]}
                      onChange={(v) =>
                        setData((d) => ({
                          ...d,
                          phase5: {
                            ...d.phase5,
                            licoesAprendidas: {
                              ...d.phase5.licoesAprendidas,
                              [col.key]: v,
                            },
                          },
                        }))
                      }
                      placeholder={
                        col.key === "funcionouBem"
                          ? "Descreva o que funcionou bem..."
                          : "Descreva o que deve melhorar em projetos futuros..."
                      }
                      multi
                      minH={80}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SubSection>

          <SubSection title="5.3 Checklist de Encerramento">
            <div
              style={{
                background: "#f8f9fb",
                border: `1px solid ${theme.border}`,
                borderRadius: 6,
                padding: "10px 20px",
              }}
            >
              {[
                {
                  key: "entregaveisAceitos",
                  label: "Todos os entregáveis aceitos formalmente",
                },
                {
                  key: "licoesRegistradas",
                  label: "Lições aprendidas registradas",
                },
                {
                  key: "comunicadoEnviado",
                  label: "Comunicado de encerramento enviado",
                },
                {
                  key: "recursosLiberados",
                  label: "Recursos da equipe liberados",
                },
                {
                  key: "projetoMarcado",
                  label: "Projeto marcado como Concluído no portfólio",
                },
              ].map((item) => (
                <CheckItem
                  key={item.key}
                  checked={phase5.checklist[item.key]}
                  onChange={(v) => setCheckP5(item.key, v)}
                  label={item.label}
                />
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: theme.textMuted }}>
              <span
                style={{
                  background: theme.phases[5].light,
                  color: theme.phases[5].bg,
                  padding: "2px 10px",
                  borderRadius: 20,
                  fontWeight: 700,
                }}
              >
                {p5Done} / {Object.keys(phase5.checklist).length} itens
                concluídos
              </span>
            </div>
          </SubSection>

          <SubSection title="5.4 Resumo Executivo de Encerramento">
            <div
              style={{
                background: "#f8f9fb",
                border: `1px solid ${theme.border}`,
                borderRadius: 6,
                padding: "20px 24px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0 48px",
                  marginBottom: 4,
                }}
              >
                <FieldRow label="Data de encerramento real">
                  <DateInput
                    value={phase5.resumo.dataEncerramento}
                    onChange={(v) =>
                      setData((d) => ({
                        ...d,
                        phase5: {
                          ...d.phase5,
                          resumo: { ...d.phase5.resumo, dataEncerramento: v },
                        },
                      }))
                    }
                  />
                </FieldRow>
                <FieldRow label="Data prevista original">
                  <DateInput
                    value={phase5.resumo.dataPrevista}
                    onChange={(v) =>
                      setData((d) => ({
                        ...d,
                        phase5: {
                          ...d.phase5,
                          resumo: { ...d.phase5.resumo, dataPrevista: v },
                        },
                      }))
                    }
                  />
                </FieldRow>
              </div>
              <div
                style={{
                  padding: "9px 0",
                  borderBottom: `1px solid ${theme.borderLight}`,
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
                  Objetivo atingido?
                </span>
                <div
                  style={{
                    display: "flex",
                    gap: 28,
                    paddingLeft: 2,
                    marginTop: 8,
                  }}
                >
                  {["Totalmente", "Parcialmente", "Não atingido"].map((opt) => (
                    <label
                      key={opt}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      <input
                        type="radio"
                        name="objAtingido"
                        value={opt}
                        checked={phase5.resumo.objetivoAtingido === opt}
                        onChange={() =>
                          setData((d) => ({
                            ...d,
                            phase5: {
                              ...d.phase5,
                              resumo: {
                                ...d.phase5.resumo,
                                objetivoAtingido: opt,
                              },
                            },
                          }))
                        }
                        style={{ accentColor: theme.navy }}
                      />
                      <span
                        style={{
                          fontWeight: 600,
                          color:
                            opt === "Totalmente"
                              ? "#166534"
                              : opt === "Parcialmente"
                                ? "#854d0e"
                                : "#991b1b",
                        }}
                      >
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div
                style={{
                  padding: "9px 0",
                  borderBottom: `1px solid ${theme.borderLight}`,
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: theme.textSecondary,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    marginBottom: 6,
                  }}
                >
                  Principais resultados
                </span>
                <EditField
                  value={phase5.resumo.resultados}
                  onChange={(v) =>
                    setData((d) => ({
                      ...d,
                      phase5: {
                        ...d.phase5,
                        resumo: { ...d.phase5.resumo, resultados: v },
                      },
                    }))
                  }
                  placeholder="Descreva os principais resultados e entregas alcançadas pelo projeto..."
                  multi
                  minH={72}
                />
              </div>
              <div style={{ padding: "9px 0" }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: theme.textSecondary,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    marginBottom: 6,
                  }}
                >
                  Aprovação final por
                </span>
                <EditField
                  value={phase5.resumo.aprovadoPor}
                  onChange={(v) =>
                    setData((d) => ({
                      ...d,
                      phase5: {
                        ...d.phase5,
                        resumo: { ...d.phase5.resumo, aprovadoPor: v },
                      },
                    }))
                  }
                  placeholder="Nome, cargo e assinatura do aprovador final"
                />
              </div>
            </div>
          </SubSection>
        </PhaseSection>

        {/* ── FOOTER ── */}
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            padding: "20px 0 16px",
            color: theme.textMuted,
            fontSize: 12,
            borderTop: `1px solid ${theme.border}`,
          }}
        >
          <span style={{ fontWeight: 600 }}>Template de Projeto</span> · Equipe
          de Transformação Digital · Documento confidencial — uso interno
        </div>
      </div>
    </div>
  );
}
