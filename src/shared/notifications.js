export const APP_NOTIFICATION_EVENT = "bp-app-notification";
export const APP_PROMPT_EVENT = "bp-app-prompt";

const promptResolvers = new Map();

export function notifyApp({
  type = "info",
  title,
  message,
  duration = 5200,
} = {}) {
  const detail = {
    type,
    title,
    message: String(message || title || ""),
    duration,
  };

  if (typeof window === "undefined") {
    console[type === "error" ? "error" : "log"](detail.message);
    return;
  }

  window.dispatchEvent(new CustomEvent(APP_NOTIFICATION_EVENT, { detail }));
}

export const notifyError = (message, title = "Não foi possível concluir") =>
  notifyApp({ type: "error", title, message, duration: 7000 });

export const notifyWarning = (message, title = "Atenção") =>
  notifyApp({ type: "warning", title, message, duration: 6500 });

export const notifySuccess = (message, title = "Tudo certo") =>
  notifyApp({ type: "success", title, message, duration: 4500 });

export const notifyInfo = (message, title = "Informação") =>
  notifyApp({ type: "info", title, message, duration: 5200 });

export function requestAppPrompt({
  title = "Confirmação",
  message = "",
  label = "Valor",
  placeholder = "",
  type = "text",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
} = {}) {
  if (typeof window === "undefined") return Promise.resolve(null);

  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return new Promise((resolve) => {
    promptResolvers.set(id, resolve);
    window.dispatchEvent(
      new CustomEvent(APP_PROMPT_EVENT, {
        detail: {
          id,
          title,
          message,
          label,
          placeholder,
          type,
          confirmLabel,
          cancelLabel,
        },
      }),
    );
  });
}

export function resolveAppPrompt(id, value) {
  const resolver = promptResolvers.get(id);
  if (!resolver) return;

  promptResolvers.delete(id);
  resolver(value);
}
