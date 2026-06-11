const FIELD_LABELS = {
  codigo_do_projeto: "Código / ID",
  "código_do_projeto": "Código / ID",
  nome_do_projeto: "Nome do projeto",
  fornecedor: "Fornecedor",
  responsavel: "Responsável",
  fase_atual: "Fase atual",
  status_geral: "Status geral",
  dados_do_registro: "Dados do registro",
  poc_name: "Nome da POC",
  supplier: "Fornecedor / tecnologia",
  responsible: "Responsável",
  status: "Status",
  recommendation: "Recomendação",
  nome: "Nome",
  categoria: "Categoria",
  canais: "Canais",
  contato: "Contato",
  email: "E-mail",
};

export function getMissingFields(fields) {
  return fields
    .filter((field) => {
      if (typeof field.when === "function" && !field.when()) return false;
      const value = field.value;
      if (Array.isArray(value)) return value.length === 0;
      return !String(value ?? "").trim();
    })
    .map((field) => field.label);
}

function joinFields(fields) {
  if (fields.length <= 1) return fields.join("");
  if (fields.length === 2) return fields.join(" e ");

  return `${fields.slice(0, -1).join(", ")} e ${fields[fields.length - 1]}`;
}

export function missingFieldsMessage(fields, subject = "registro") {
  const missing = Array.isArray(fields) ? fields : getMissingFields(fields);

  if (missing.length === 0) return "";

  const list = joinFields(missing);

  if (missing.length === 1) {
    return `Para salvar este ${subject}, preencha este campo obrigatório: ${list}.`;
  }

  return `Para salvar este ${subject}, preencha estes campos obrigatórios: ${list}.`;
}

function readErrorText(error) {
  if (!error) return "";

  return String(
    error.message ||
      error.details ||
      error.hint ||
      error.error_description ||
      error.error ||
      error,
  );
}

function extractColumnName(error) {
  const text = [
    error?.message,
    error?.details,
    error?.hint,
    error?.error_description,
    error?.error,
    typeof error === "string" ? error : "",
  ]
    .filter(Boolean)
    .join(" ");

  const columnMatch = text.match(/column "([^"]+)"/i);
  const keyMatch = text.match(/Key \(([^)]+)\)=/i);
  const rawName = columnMatch?.[1] || keyMatch?.[1] || "";

  return rawName.trim();
}

function fieldLabelFromError(error) {
  const rawName = extractColumnName(error);
  if (!rawName) return "";

  return FIELD_LABELS[rawName] || rawName.replace(/_/g, " ");
}

function formatTechnicalDetail(error) {
  const code = error?.code || error?.status || error?.statusCode || "";
  const text = readErrorText(error);
  const detail = [code ? `código ${code}` : "", text]
    .filter(Boolean)
    .join(" - ");

  return detail ? `Detalhe: ${detail}` : "";
}

export function describeAppError(
  error,
  { action = "salvar", subject = "registro" } = {},
) {
  const text = readErrorText(error).toLowerCase();
  const technicalDetail = formatTechnicalDetail(error);
  const fieldLabel = fieldLabelFromError(error);

  if (text.includes("supabase nao configurado")) {
    return `Não foi possível ${action} este ${subject} porque o banco de dados ainda não está configurado neste ambiente. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.`;
  }

  if (
    text.includes("not-null") ||
    text.includes("not null") ||
    text.includes("null value")
  ) {
    const fieldText = fieldLabel
      ? ` Campo obrigatório recusado pelo banco: ${fieldLabel}.`
      : "";

    return `Não foi possível ${action} este ${subject} porque falta uma informação obrigatória.${fieldText} Revise os campos obrigatórios destacados na tela. ${technicalDetail}`.trim();
  }

  if (
    text.includes("duplicate key") ||
    text.includes("already exists") ||
    error?.code === "23505"
  ) {
    const fieldText = fieldLabel ? ` para o campo ${fieldLabel}` : "";

    return `Não foi possível ${action} este ${subject} porque já existe um registro com o mesmo valor${fieldText}. Ajuste a informação e tente novamente. ${technicalDetail}`.trim();
  }

  if (
    text.includes("invalid input syntax") ||
    text.includes("invalid value") ||
    text.includes("date/time field value out of range")
  ) {
    return `Não foi possível ${action} este ${subject} porque há um campo com formato inválido. Revise datas, números e e-mails antes de tentar novamente. ${technicalDetail}`.trim();
  }

  if (text.includes("could not find") && text.includes("column")) {
    return `Não foi possível ${action} este ${subject} porque há divergência entre os campos da tela e a estrutura do banco. Acione o time responsável pela plataforma. ${technicalDetail}`.trim();
  }

  if (text.includes("permission") || text.includes("policy") || text.includes("rls")) {
    return `Não foi possível ${action} este ${subject} por falta de permissão para esta operação. Verifique seu perfil de acesso. ${technicalDetail}`.trim();
  }

  if (
    text.includes("network") ||
    text.includes("failed to fetch") ||
    text.includes("fetch failed")
  ) {
    return `Não foi possível ${action} este ${subject} por falha de conexão. Verifique a internet/VPN e tente novamente. ${technicalDetail}`.trim();
  }

  return `Não foi possível ${action} este ${subject}. Tente novamente; se continuar, acione o time responsável pela plataforma. ${technicalDetail}`.trim();
}
