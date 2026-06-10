export function parseSplunkExport(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .map((entry) => entry.result || entry)
    .filter((entry) => entry && entry.Canal_Unificado);
}
