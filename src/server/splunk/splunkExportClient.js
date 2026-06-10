import https from "node:https";
import axios from "axios";

export async function postSplunkExport({ baseUrl, authToken, body }) {
  const url = new URL("/services/search/jobs/export", baseUrl);
  const rejectUnauthorized = process.env.SPLUNK_REJECT_UNAUTHORIZED !== "false";
  const timeoutMs = Number(process.env.SPLUNK_TIMEOUT_MS || 120000);

  try {
    const splunkResponse = await axios.post(url.toString(), body, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      httpsAgent: new https.Agent({ rejectUnauthorized }),
      timeout: timeoutMs,
      responseType: "text",
      transformResponse: [(data) => data],
      validateStatus: () => true,
    });

    return {
      ok: splunkResponse.status >= 200 && splunkResponse.status < 300,
      status: splunkResponse.status,
      text: splunkResponse.data || "",
    };
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      throw new Error(
        `Timeout ao consultar Splunk apos ${timeoutMs}ms. Verifique VPN, rede interna e acesso a ${url.hostname}:${url.port || 443}.`,
      );
    }

    throw error;
  }
}
