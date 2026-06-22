const MOCK_DATA_URL = `${import.meta.env.BASE_URL}mocks/error-bot-records.json`;

export async function loadErrorBotData() {
  const response = await fetch(MOCK_DATA_URL);

  if (!response.ok) {
    throw new Error(`Não foi possível carregar os dados do bot (${response.status}).`);
  }

  return response.json();
}
