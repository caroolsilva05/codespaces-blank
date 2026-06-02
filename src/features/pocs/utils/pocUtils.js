export const toNum = (value) => {
  const parsed = Number(String(value || "0").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};
export const pct = (value) =>
  `${Number(value || 0)
    .toFixed(1)
    .replace(".", ",")}%`;
export const brDate = (value) => {
  if (!value) return "-";
  const parts = String(value).split("-");
  if (parts.length !== 3) return value;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};
export function calcMetrics(rows) {
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
    },
  );
  const taxaEntrega =
    totals.totalMensagens > 0
      ? (totals.entregue / totals.totalMensagens) * 100
      : 0;
  const taxaLeituraEntregues =
    totals.entregue > 0 ? (totals.lido / totals.entregue) * 100 : 0;
  const taxaLeituraDisparados =
    totals.totalMensagens > 0 ? (totals.lido / totals.totalMensagens) * 100 : 0;
  const taxaRetornoLidos =
    totals.lido > 0 ? (totals.retornoCliente / totals.lido) * 100 : 0;
  const taxaConversaoFinal =
    totals.totalMensagens > 0
      ? (totals.acordos / totals.totalMensagens) * 100
      : 0;
  return {
    ...totals,
    taxaEntrega,
    taxaLeituraEntregues,
    taxaLeituraDisparados,
    taxaRetornoLidos,
    taxaConversaoFinal,
  };
}
export function calcEnrichmentMetrics(rows) {
  const totals = rows.reduce(
    (acc, row) => {
      acc.baseRecebida += toNum(row.baseRecebida);
      acc.baseProcessada += toNum(row.baseProcessada);
      acc.registrosEnriquecidos += toNum(row.registrosEnriquecidos);
      acc.naoLocalizados += toNum(row.naoLocalizados);
      acc.invalidos += toNum(row.invalidos);
      acc.retorno += toNum(row.retorno);
      acc.cpcNovo += toNum(row.cpcNovo);
      acc.telefonesNovos += toNum(row.telefonesNovos);
      acc.emailsNovos += toNum(row.emailsNovos);
      return acc;
    },
    {
      baseRecebida: 0,
      baseProcessada: 0,
      registrosEnriquecidos: 0,
      naoLocalizados: 0,
      invalidos: 0,
      retorno: 0,
      cpcNovo: 0,
      telefonesNovos: 0,
      emailsNovos: 0,
    },
  );
  const taxaProcessamento =
    totals.baseRecebida > 0
      ? (totals.baseProcessada / totals.baseRecebida) * 100
      : 0;
  const taxaEnriquecimento =
    totals.baseProcessada > 0
      ? (totals.registrosEnriquecidos / totals.baseProcessada) * 100
      : 0;
  const taxaInvalidos =
    totals.baseProcessada > 0
      ? (totals.invalidos / totals.baseProcessada) * 100
      : 0;
  const taxaRetorno =
    totals.baseProcessada > 0
      ? (totals.retorno / totals.baseProcessada) * 100
      : 0;
  const taxaCpcNovo =
    totals.baseProcessada > 0
      ? (totals.cpcNovo / totals.baseProcessada) * 100
      : 0;
  const metaCpcNovo = 15;
  const percentualMeta =
    metaCpcNovo > 0 ? (taxaCpcNovo / metaCpcNovo) * 100 : 0;
  return {
    ...totals,
    taxaProcessamento,
    taxaEnriquecimento,
    taxaInvalidos,
    taxaRetorno,
    taxaCpcNovo,
    metaCpcNovo,
    percentualMeta,
  };
}
export function calcOrchestrationMetrics(rows) {
  const totals = rows.reduce(
    (acc, row) => {
      acc.baseElegivel += toNum(row.baseElegivel);
      acc.acionados += toNum(row.acionados);
      acc.retornoPositivo += toNum(row.retornoPositivo);
      acc.retornoNegativo += toNum(row.retornoNegativo);
      acc.avancaramFase += toNum(row.avancaramFase);
      acc.acordos += toNum(row.acordos);
      return acc;
    },
    {
      baseElegivel: 0,
      acionados: 0,
      retornoPositivo: 0,
      retornoNegativo: 0,
      avancaramFase: 0,
      acordos: 0,
    },
  );

  const taxaAcionamento =
    totals.baseElegivel > 0
      ? (totals.acionados / totals.baseElegivel) * 100
      : 0;

  const taxaRetornoPositivo =
    totals.acionados > 0
      ? (totals.retornoPositivo / totals.acionados) * 100
      : 0;

  const taxaRetornoNegativo =
    totals.acionados > 0
      ? (totals.retornoNegativo / totals.acionados) * 100
      : 0;

  const taxaAvanco =
    totals.acionados > 0 ? (totals.avancaramFase / totals.acionados) * 100 : 0;

  const taxaAcordo =
    totals.acionados > 0 ? (totals.acordos / totals.acionados) * 100 : 0;

  return {
    ...totals,
    taxaAcionamento,
    taxaRetornoPositivo,
    taxaRetornoNegativo,
    taxaAvanco,
    taxaAcordo,
  };
}

export function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}
export function deepMerge(base, extra) {
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
