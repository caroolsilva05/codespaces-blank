export const initialData = {
  projectInfo: {
    nome: "",
    codigoId: "",
    tipo: "Fornecedor",
    canais: [],
    outroCanalProduto: "",
    fornecedor: "",
    responsavel: "",
    solicitante: "",
    carteira: "",
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
  aprovacaoProjeto: {
    statusAprovacao: "Em Análise",
    evidenciaDeAcordo: "",
    evidenciaArquivo: "",
    aprovador: "",
  },
  phase1: {
    objetivo: "",
    justificativa: "",
    stakeholders: [{ id: 1, nome: "", papel: "", envolvimento: "" }],
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
      {
        id: 1,
        risco: "",
        probabilidade: "Média",
        impacto: "Médio",
        mitigacao: "",
      },
    ],
  },
  phase3: {
    atividades: [
      { id: 1, atividade: "", responsavel: "", prazo: "", status: "Pendente" },
    ],
    impedimentos: [
      {
        id: 1,
        impedimento: "",
        dataIdentificado: "",
        responsavel: "",
        resolucao: "",
      },
    ],
    decisoes: [{ id: 1, data: "", decisao: "", quemDecidiu: "" }],
  },
  phase4: {
    kpis: [
      {
        id: 1,
        indicador: "% de conclusão das atividades",
        meta: "",
        realizado: "",
        variacao: "",
        status: "Pendente",
      },
      {
        id: 2,
        indicador: "Prazo: dias de atraso / adiantamento",
        meta: "",
        realizado: "",
        variacao: "",
        status: "Pendente",
      },
      {
        id: 3,
        indicador: "Orçamento: realizado vs previsto",
        meta: "",
        realizado: "",
        variacao: "",
        status: "Pendente",
      },
      {
        id: 4,
        indicador: "Nº de mudanças de escopo",
        meta: "",
        realizado: "",
        variacao: "",
        status: "Pendente",
      },
      {
        id: 5,
        indicador: "Nível de satisfação do cliente interno",
        meta: "",
        realizado: "",
        variacao: "",
        status: "Pendente",
      },
    ],
    relatorioStatus: [
      { id: 1, data: "", statusGeral: "Em dia", feito: "", proximos: "" },
    ],
    disparosRetornos: [
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
    conversaoCustos: {
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
  },
  phase5: {
    entregaveis: [{ id: 1, entregavel: "", aceite: null, responsavel: "" }],
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
