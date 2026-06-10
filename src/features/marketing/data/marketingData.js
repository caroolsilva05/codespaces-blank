export const marketingChannels = ["Email", "WhatsApp", "RCS", "SMS"];

export const marketingPhases = [
  { id: "briefing", label: "Briefing", tone: "blue" },
  { id: "template", label: "Template", tone: "amber" },
  { id: "validacao", label: "Validacao", tone: "red" },
  { id: "disparo", label: "Disparo", tone: "green" },
  { id: "auditoria", label: "Auditoria", tone: "purple" },
];

const providerLabels = {
  ok: "Disponivel",
  attention: "Validar",
  mapped: "Mapeado",
  none: "Sem mapeamento",
};

const phaseCycle = ["Briefing", "Template", "Validacao", "Disparo", "Auditoria"];
const channelCycle = ["WhatsApp", "SMS", "Email", "RCS"];
const ownerCycle = ["Kauane", "Edu", "Talita", "Murilo", "Renata", "Amanda"];

function inferWalletGroup(carteira) {
  if (carteira.startsWith("ARC4U")) return "ARC4U";
  if (carteira.startsWith("Bradesco")) return "Bradesco";
  if (carteira.startsWith("BV ") || carteira.startsWith("BVC ")) return "BV";
  if (carteira.startsWith("C6")) return "C6";
  if (carteira.startsWith("Crefaz")) return "Crefaz";
  if (carteira.startsWith("Itau")) return "Itau";
  if (carteira.startsWith("Mercado Pago")) return "Mercado Pago";
  if (carteira.startsWith("Pan ")) return "Pan";
  if (carteira.startsWith("PicPay")) return "PicPay";
  if (carteira.startsWith("Porto")) return "Porto Seguro";
  if (carteira.startsWith("Recovery")) return "Recovery";
  if (carteira.startsWith("Santander")) return "Santander";
  if (carteira.startsWith("Via Varejo")) return "Via Varejo";
  return carteira.split(" ")[0];
}

function activeProviders(providers) {
  return Object.entries(providers)
    .filter(([, status]) => status && status !== "none")
    .map(([provider]) => provider)
    .join(" / ");
}

const walletMatrix = [
  ["ARC4U BTG Pactual", { pg: "ok", ip3: "ok", maestro: "mapped" }],
  ["ARC4U BTG Pactual BTG Veiculos", { pg: "ok", ip3: "ok", maestro: "mapped" }],
  ["Bradesco Comercial", { pg: "ok", ip3: "ok", maestro: "mapped" }],
  ["Bradesco Comercial Altos Valores CA PJ", { pg: "attention", ip3: "mapped", maestro: "mapped" }],
  ["Bradesco Comercial Comercial PJ", { pg: "attention", ip3: "mapped", maestro: "mapped" }],
  ["Bradesco Comercial PJ", { pg: "ok", ip3: "mapped", maestro: "mapped" }],
  ["Bradesco Digital", { pg: "ok", ip3: "mapped", maestro: "mapped" }],
  ["Bradesco EAVM LP", { pg: "ok", ip3: "mapped", maestro: "mapped" }],
  ["Bradesco EAVM LP EAVM CA PJ", { pg: "ok", ip3: "mapped", maestro: "mapped" }],
  ["Bradesco EAVM LP EAVM LP PJ", { pg: "ok", ip3: "mapped", maestro: "mapped" }],
  ["Bradesco LP", { pg: "ok", ip3: "mapped", maestro: "mapped" }],
  ["Bradesco LP Bradesco LP PJ", { pg: "attention", ip3: "attention", maestro: "mapped" }],
  ["Bradesco Telecobranca", { pg: "attention", ip3: "mapped", maestro: "mapped" }],
  ["BV Cartoes Amigavel", { pg: "mapped", ip3: "mapped", maestro: "ok" }],
  ["BV Cartoes CL", { pg: "mapped", ip3: "mapped", maestro: "ok" }],
  ["BV Contencioso 1", { pg: "mapped", ip3: "mapped", maestro: "ok" }],
  ["BV Contencioso 2", { pg: "mapped", ip3: "mapped", maestro: "ok" }],
  ["BV Contencioso 3", { pg: "mapped", ip3: "mapped", maestro: "ok" }],
  ["BV CP", { pg: "mapped", ip3: "mapped", maestro: "ok" }],
  ["BV Juridico WO", { pg: "mapped", ip3: "mapped", maestro: "ok" }],
  ["BV Reneg", { pg: "mapped", ip3: "mapped", maestro: "ok" }],
  ["BV Solar", { pg: "mapped", ip3: "mapped", maestro: "ok" }],
  ["BVC (Lote) BV ADM", { pg: "mapped", ip3: "mapped", maestro: "attention" }],
  ["BVC (Lote) BV BOM PAGADOR", { pg: "mapped", ip3: "mapped", maestro: "attention" }],
  ["C6 Auto", { pg: "attention", ip3: "ok", maestro: "mapped" }],
  ["C6 Bank", { pg: "attention", ip3: "ok", maestro: "mapped" }],
  ["Crefaz Energia", { pg: "mapped", ip3: "ok", maestro: "mapped" }],
  ["Crefaz Veiculos", { pg: "ok", ip3: "ok", maestro: "mapped" }],
  ["Honda", { pg: "ok", ip3: "ok", maestro: "mapped" }],
  ["Itau Atraso Curto BPF", { pg: "attention", ip3: "ok", maestro: "mapped" }],
  ["Itau Cartoes", { pg: "attention", ip3: "ok", maestro: "mapped" }],
  ["Itau Cartoes Colchao", { pg: "attention", ip3: "ok", maestro: "mapped" }],
  ["Itau Imobiliario", { pg: "attention", ip3: "ok", maestro: "mapped" }],
  ["Itau Personnalite", { pg: "ok", ip3: "ok", maestro: "mapped" }],
  ["Itau Personnalite Colchao", { pg: "ok", ip3: "ok", maestro: "mapped" }],
  ["Itau PF", { pg: "attention", ip3: "ok", maestro: "mapped" }],
  ["Itau PF Colchao", { pg: "attention", ip3: "ok", maestro: "mapped" }],
  ["Itau PJ", { pg: "attention", ip3: "none", maestro: "mapped" }],
  ["Itau Veiculos", { pg: "attention", ip3: "ok", maestro: "mapped" }],
  ["Itau Veiculos PJ EMP", { pg: "attention", ip3: "ok", maestro: "mapped" }],
  ["Mercado Pago", { pg: "attention", ip3: "ok", maestro: "mapped" }],
  ["Mercado Pago Mercado Emprestimo", { pg: "none", ip3: "attention", maestro: "mapped" }],
  ["Mercado Pago Mercado Pago Alto Valor", { pg: "none", ip3: "attention", maestro: "mapped" }],
  ["Mercado Pago Mercado Pago BC", { pg: "attention", ip3: "attention", maestro: "mapped" }],
  ["Mercado Pago Mercado Pago Cartao de Credito", { pg: "none", ip3: "attention", maestro: "mapped" }],
  ["Pan Ajuizados", { pg: "attention", ip3: "attention", maestro: "mapped" }],
  ["Pan Contact Center", { pg: "attention", ip3: "attention", maestro: "mapped" }],
  ["Pan Entrega Amigavel", { pg: "attention", ip3: "attention", maestro: "mapped" }],
  ["Pan PAN WO COBRANCA 2", { pg: "attention", ip3: "attention", maestro: "mapped" }],
  ["Pan WO", { pg: "attention", ip3: "attention", maestro: "mapped" }],
  ["PicPay", { pg: "ok", ip3: "ok", maestro: "mapped" }],
  ["Porto E&F Amigavel", { pg: "attention", ip3: "ok", maestro: "mapped" }],
  ["Porto Seguro", { pg: "attention", ip3: "attention", maestro: "mapped" }],
  ["Porto Seguro Contencioso", { pg: "none", ip3: "ok", maestro: "mapped" }],
  ["Porto Seguro MV Bank", { pg: "ok", ip3: "ok", maestro: "mapped" }],
  ["Recovery", { pg: "ok", ip3: "ok", maestro: "mapped" }],
  ["Recovery Veiculos", { pg: "none", ip3: "mapped", maestro: "mapped" }],
  ["Renner", { pg: "ok", ip3: "mapped", maestro: "mapped" }],
  ["Revolut", { pg: "ok", ip3: "mapped", maestro: "mapped" }],
  ["Santander Financeira", { pg: "ok", ip3: "attention", maestro: "mapped" }],
  ["Santander Varejo Santander Varejo Over PF", { pg: "ok", ip3: "none", maestro: "mapped" }],
  ["Santander Varejo Santander Varejo Over PJ", { pg: "ok", ip3: "none", maestro: "mapped" }],
  ["Via Varejo Casas Bahia Grupo B", { pg: "none", ip3: "attention", maestro: "mapped" }],
  ["Via Varejo Casas Bahia Recovery", { pg: "none", ip3: "attention", maestro: "mapped" }],
];

export const marketingWallets = walletMatrix.map(([carteira, providers], index) => {
  const grupoCarteira = inferWalletGroup(carteira);
  const status = Object.values(providers).includes("attention")
    ? "Atencao"
    : Object.values(providers).includes("none")
      ? "Pendente"
      : "Ok";

  return {
    id: `mkt-${String(index + 1).padStart(3, "0")}`,
    carteira,
    grupoCarteira,
    responsavel: ownerCycle[index % ownerCycle.length],
    fornecedor: activeProviders(providers) || "Sem fornecedor",
    fornecedores: {
      "PG+": providers.pg,
      IP3: providers.ip3,
      MAESTRO: providers.maestro,
    },
    ultimaValidacao: ownerCycle[(index + 2) % ownerCycle.length],
    template: "Auditoria",
    status,
    inicioProjeto: `${String((index % 27) + 1).padStart(2, "0")}/03/26`,
    terminoProjeto: `${String((index % 27) + 1).padStart(2, "0")}/06/26`,
    prazoEstabelecido: index % 3 === 0 ? "3 meses" : index % 3 === 1 ? "30 dias" : "7 dias",
    canal: channelCycle[index % channelCycle.length],
    fase: phaseCycle[index % phaseCycle.length],
  };
});

export const marketingWalletGroups = Array.from(
  new Set(marketingWallets.map((wallet) => wallet.grupoCarteira)),
).sort((a, b) => a.localeCompare(b, "pt-BR"));

export const providerStatusLabels = providerLabels;
