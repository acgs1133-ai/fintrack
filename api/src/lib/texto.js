// Utilitários de normalização e extração de palavras-chave usados pela
// categorização automática (aprendizado simples) e pelo agrupamento de recorrências.

const STOPWORDS = new Set([
  "de", "da", "do", "das", "dos", "com", "sem", "para", "por", "em", "no", "na",
  "nos", "nas", "os", "as", "um", "uma", "uns", "umas", "e", "ou", "the", "and",
  "of", "pra", "pro",
]);

function normalizar(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Chave estável para agrupar transações recorrentes de mesmo nome.
function chaveRecorrencia(descricao) {
  return normalizar(descricao);
}

function extrairPalavras(texto) {
  const palavras = normalizar(texto)
    .split(" ")
    .filter((p) => p.length >= 3 && !STOPWORDS.has(p) && !/^\d+$/.test(p));
  return [...new Set(palavras)];
}

module.exports = { normalizar, chaveRecorrencia, extrairPalavras, STOPWORDS };
