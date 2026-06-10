export const SPLUNK_PORTALS_QUERY = `
search index="api" Servico IN ("BuscaCliente", "EnviaToken", "ValidaToken", "BuscaCredor", "BuscaDivida", "BuscaAcordo", "BuscaOpcaoPagamento", "FormalizarAcordo")
Origem="log-evento" HttpStatus=200
"Canal.Nome" IN (
    "Bellinati - Portal - Generico",
    "Bellinati - Portal - Bradesco",
    "Bellinati - Portal - Generico V4",
    "Bellinati - Portal - Itau",
    "Bellinati - Portal - Itau PF",
    "Bellinati - Portal - Itau PJ",
    "Bellinati - Portal - PanRefin"
)
| spath path=Response{}.Valor output=ResponseValor
| spath path=Response{}.ValorTotal output=ResponseValorTotal
| eval Canal_Unificado=case(
    'Canal.Nome'="Bellinati - Portal - Generico" OR 'Canal.Nome'="Bellinati - Portal - Generico V4", "Bellinati - Portal - Generico",
    true(), 'Canal.Nome'
)
| eval valor_negociacao=if(Servico="FormalizarAcordo", tonumber(mvindex(ResponseValorTotal,0)), 0)
| eval risco_contrato_valor=if(Servico="BuscaDivida", tonumber(mvindex(ResponseValor,0)), 0)
| stats
    sum(valor_negociacao) as total
    sum(risco_contrato_valor) as risco_contrato
    count(eval(Servico="BuscaCliente")) as BuscaCliente
    count(eval(Servico="EnviaToken")) as EnviaToken
    count(eval(Servico="ValidaToken")) as ValidaToken
    count(eval(Servico="BuscaCredor")) as BuscaCredor
    count(eval(Servico="BuscaDivida")) as BuscaDivida
    count(eval(Servico="BuscaAcordo")) as BuscaAcordo
    count(eval(Servico="BuscaOpcaoPagamento")) as BuscaOpcaoPagamento
    count(eval(Servico="FormalizarAcordo")) as FormalizarAcordo
    by Canal_Unificado
| eval Ordem=1
| appendpipe [
    stats
        sum(total) as total
        sum(risco_contrato) as risco_contrato
        sum(BuscaCliente) as BuscaCliente
        sum(EnviaToken) as EnviaToken
        sum(ValidaToken) as ValidaToken
        sum(BuscaCredor) as BuscaCredor
        sum(BuscaDivida) as BuscaDivida
        sum(BuscaAcordo) as BuscaAcordo
        sum(BuscaOpcaoPagamento) as BuscaOpcaoPagamento
        sum(FormalizarAcordo) as FormalizarAcordo
    | eval Canal_Unificado="Bellinati - Portal - Unificado", Ordem=2
]
| sort Ordem Canal_Unificado
| fields - Ordem
| table Canal_Unificado total risco_contrato BuscaCliente EnviaToken ValidaToken BuscaCredor BuscaDivida BuscaAcordo BuscaOpcaoPagamento FormalizarAcordo
`.trim();

export const PERIOD_TO_EARLIEST = {
  Hoje: "-24h",
  "7 dias": "-7d",
  "30 dias": "-30d",
};
