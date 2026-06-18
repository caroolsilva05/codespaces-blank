import React, { useEffect, useState } from "react";
import {
  APP_NOTIFICATION_EVENT,
  APP_PROMPT_EVENT,
  resolveAppPrompt,
} from "./notifications";

const styles = {
  success: {
    accent: "#16a34a",
    bg: "#f0fdf4",
    title: "#166534",
  },
  error: {
    accent: "#dc2626",
    bg: "#fef2f2",
    title: "#991b1b",
  },
  warning: {
    accent: "#d97706",
    bg: "#fffbeb",
    title: "#92400e",
  },
  info: {
    accent: "#2563eb",
    bg: "#eff6ff",
    title: "#1d4ed8",
  },
};

export default function NotificationHost() {
  const [items, setItems] = useState([]);
  const [prompt, setPrompt] = useState(null);
  const [promptValue, setPromptValue] = useState("");

  useEffect(() => {
    function handleNotification(event) {
      const detail = event.detail || {};
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const item = {
        id,
        type: detail.type || "info",
        title: detail.title,
        message: detail.message,
      };
      const fingerprint = `${item.type}|${item.title || ""}|${item.message || ""}`;

      setItems((current) => {
        const alreadyVisible = current.some(
          (entry) =>
            `${entry.type}|${entry.title || ""}|${entry.message || ""}` ===
            fingerprint,
        );

        if (alreadyVisible) return current;

        return [...current, item].slice(-4);
      });

      if (detail.duration !== 0) {
        window.setTimeout(() => {
          setItems((current) => current.filter((entry) => entry.id !== id));
        }, detail.duration || 5200);
      }
    }

    function handlePrompt(event) {
      setPrompt(event.detail || null);
      setPromptValue("");
    }

    window.addEventListener(APP_NOTIFICATION_EVENT, handleNotification);
    window.addEventListener(APP_PROMPT_EVENT, handlePrompt);

    return () => {
      window.removeEventListener(APP_NOTIFICATION_EVENT, handleNotification);
      window.removeEventListener(APP_PROMPT_EVENT, handlePrompt);
    };
  }, []);

  function closePrompt(value) {
    if (prompt?.id) resolveAppPrompt(prompt.id, value);
    setPrompt(null);
    setPromptValue("");
  }

  return (
    <>
      <div
        aria-live="polite"
        style={{
          position: "fixed",
          top: 18,
          right: 18,
          zIndex: 20000,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          width: "min(420px, calc(100vw - 32px))",
          pointerEvents: "none",
        }}
      >
        {items.map((item) => {
          const color = styles[item.type] || styles.info;

          return (
            <div
              key={item.id}
              style={{
                pointerEvents: "auto",
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderLeft: `5px solid ${color.accent}`,
                borderRadius: 12,
                boxShadow:
                  "0 18px 42px rgba(15,23,42,0.14), 0 3px 10px rgba(15,23,42,0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background: color.bg,
                  padding: "12px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      color: color.title,
                      fontSize: 13,
                      fontWeight: 850,
                      marginBottom: 3,
                    }}
                  >
                    {item.title || "Mensagem"}
                  </div>
                  <div
                    style={{
                      color: "#334155",
                      fontSize: 13,
                      lineHeight: 1.45,
                    }}
                  >
                    {item.message}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setItems((current) =>
                      current.filter((entry) => entry.id !== item.id),
                    )
                  }
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#64748b",
                    cursor: "pointer",
                    fontSize: 18,
                    lineHeight: 1,
                    padding: 0,
                  }}
                  aria-label="Fechar mensagem"
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {prompt && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 21000,
            background: "rgba(15,23,42,0.42)",
            display: "grid",
            placeItems: "center",
            padding: 18,
          }}
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              // For confirm dialogs we don't use the input value — return true
              if (prompt?.type === "confirm") {
                closePrompt(true);
                return;
              }

              closePrompt(promptValue);
            }}
            style={{
              width: "min(440px, 100%)",
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              boxShadow: "0 24px 70px rgba(15,23,42,0.24)",
              padding: 18,
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 850,
                color: "#0f172a",
                marginBottom: 6,
              }}
            >
              {prompt.title}
            </div>
            {prompt.message && (
              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.45,
                  color: "#64748b",
                  marginBottom: 16,
                }}
              >
                {prompt.message}
              </div>
            )}
            {prompt?.type !== "confirm" && (
              <>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#475569",
                    marginBottom: 7,
                  }}
                >
                  {prompt.label}
                </label>
                <input
                  autoFocus
                  type={prompt.type || "text"}
                  value={promptValue}
                  onChange={(event) => setPromptValue(event.target.value)}
                  placeholder={prompt.placeholder}
                  style={{
                    width: "100%",
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    minHeight: 42,
                    padding: "9px 11px",
                    fontSize: 14,
                    marginBottom: 16,
                  }}
                />
              </>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={() =>
                  closePrompt(prompt?.type === "confirm" ? false : null)
                }
                style={{
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  color: "#475569",
                  borderRadius: 10,
                  padding: "9px 14px",
                  cursor: "pointer",
                  fontWeight: 750,
                }}
              >
                {prompt.cancelLabel || "Cancelar"}
              </button>
              <button
                type="submit"
                style={{
                  border: "1px solid #e11d48",
                  background: "#e11d48",
                  color: "#fff",
                  borderRadius: 10,
                  padding: "9px 14px",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                {prompt.confirmLabel || "Confirmar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
