import Papa from "papaparse";

export const REGRAS_CATEGORIA = [
  { keywords: ["uber", "99pop", "99", "cabify", "ônibus", "onibus", "metro", "metrô", "estacionamento"], categoria: "Transporte" },
  { keywords: ["ifood", "rappi", "restaurante", "lanchonete", "padaria", "mercado", "supermercado", "extra", "carrefour", "pão de açúcar", "pao de acucar"], categoria: "Alimentação" },
  { keywords: ["farmácia", "farmacia", "drogaria", "droga", "ultrafarma", "consulta", "médico", "medico", "dentista", "hospital"], categoria: "Saúde" },
  { keywords: ["aluguel", "condomínio", "condominio", "luz", "energia", "água", "agua", "gás", "gas", "internet", "net", "vivo", "claro"], categoria: "Moradia" },
  { keywords: ["udemy", "coursera", "alura", "escola", "faculdade", "livro", "amazon"], categoria: "Educação" },
  { keywords: ["netflix", "spotify", "steam", "cinema", "ingresso", "show"], categoria: "Lazer" },
];

function isWordChar(char) {
  return !!char && /[a-z0-9à-ÿ]/i.test(char);
}

function contemPalavra(texto, palavra) {
  let indice = texto.indexOf(palavra);
  while (indice !== -1) {
    const antes = texto[indice - 1];
    const depois = texto[indice + palavra.length];
    if (!isWordChar(antes) && !isWordChar(depois)) return true;
    indice = texto.indexOf(palavra, indice + 1);
  }
  return false;
}

export function classificarPorDescricao(descricao) {
  const texto = (descricao || "").toLowerCase();
  for (const regra of REGRAS_CATEGORIA) {
    if (regra.keywords.some((kw) => contemPalavra(texto, kw))) {
      return regra.categoria;
    }
  }
  return "Outros";
}

function parseValorCSV(valorStr) {
  if (typeof valorStr === "number") return valorStr;
  let texto = String(valorStr).trim().replace(/R\$\s?/g, "");
  const temVirgulaDecimal = /,\d{1,2}$/.test(texto);
  if (temVirgulaDecimal) {
    texto = texto.replace(/\./g, "").replace(",", ".");
  } else {
    texto = texto.replace(/,/g, "");
  }
  return parseFloat(texto);
}

function parseDataCSV(dataStr) {
  const texto = String(dataStr).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(texto)) {
    return new Date(texto);
  }
  const match = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (match) {
    const [, dia, mes, anoStr] = match;
    const ano = anoStr.length === 2 ? `20${anoStr}` : anoStr;
    return new Date(Number(ano), Number(mes) - 1, Number(dia));
  }
  return new Date(texto);
}

function detectarColunas(headers) {
  const lower = headers.map((h) => h.toLowerCase().trim());

  const dataCol = headers[lower.findIndex((h) => h.includes("data"))] || headers[0];
  const valorCol =
    headers[lower.findIndex((h) => h.includes("valor") || h.includes("montante") || h.includes("amount"))] ||
    headers[2];
  const descricaoCol =
    headers[
      lower.findIndex(
        (h) => h.includes("descri") || h.includes("título") || h.includes("titulo") || h.includes("histórico") || h.includes("historico")
      )
    ] || headers[1];

  return { dataCol, valorCol, descricaoCol };
}

export function extrairLinhas(fileContent) {
  const resultado = Papa.parse(fileContent.trim(), {
    header: true,
    skipEmptyLines: true,
    delimiter: "",
  });

  const headers = resultado.meta.fields || [];
  const colunasDetectadas = detectarColunas(headers);

  return { headers, rows: resultado.data, colunasDetectadas };
}

export function montarTransacoes(rows, colunas) {
  const { dataCol, valorCol, descricaoCol } = colunas;

  return rows
    .filter((row) => row[dataCol] && row[valorCol])
    .map((row) => {
      const descricao = row[descricaoCol] || "Transação importada";
      return {
        descricao,
        valor: parseValorCSV(row[valorCol]),
        data: parseDataCSV(row[dataCol]),
        categoriaDetectada: classificarPorDescricao(descricao),
      };
    });
}

export function parseCSV(fileContent) {
  const { headers, rows, colunasDetectadas } = extrairLinhas(fileContent);
  const transacoes = montarTransacoes(rows, colunasDetectadas);
  return { transacoes, colunas: colunasDetectadas, headers };
}
