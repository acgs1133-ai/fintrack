export function parseValorMonetario(valor) {
  if (typeof valor === "number") return valor;
  if (!valor) return NaN;
  const limpo = String(valor).replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  return parseFloat(limpo);
}

// Lançamento rápido: separa o valor numérico do restante do texto.
// Ex.: "café 15" -> { descricao: "café", valor: 15 }; "uber 23,50" -> { descricao: "uber", valor: 23.5 }
export function parseLancamentoRapido(texto) {
  const original = String(texto || "").trim();
  const matches = original.match(/\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?/g);
  if (!matches || matches.length === 0) {
    return { descricao: original, valor: null };
  }
  const token = matches[matches.length - 1];
  const valor = parseValorMonetario(token);
  const idx = original.lastIndexOf(token);
  const descricao = (original.slice(0, idx) + original.slice(idx + token.length))
    .replace(/\s+/g, " ")
    .trim();
  return { descricao, valor: Number.isNaN(valor) ? null : valor };
}

export function validarTransacao({ descricao, valor, categoriaId, data, tipo }) {
  const erros = {};

  if (!descricao || descricao.trim().length < 2) {
    erros.descricao = "A descrição deve ter ao menos 2 caracteres.";
  }

  const valorNumerico = parseValorMonetario(valor);
  if (!valorNumerico || isNaN(valorNumerico) || valorNumerico <= 0) {
    erros.valor = "O valor deve ser maior que zero.";
  }

  if (!categoriaId) {
    erros.categoria = "Selecione uma categoria.";
  }

  if (!data) {
    erros.data = "Informe a data.";
  }

  let avisoDataFutura = null;
  if (data && tipo === "DESPESA") {
    const dataInformada = new Date(data);
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);
    if (dataInformada > hoje) {
      avisoDataFutura = "Esta despesa está com data futura.";
    }
  }

  return { erros, valido: Object.keys(erros).length === 0, avisoDataFutura };
}

export function validarCategoria({ nome, orcamento }) {
  const erros = {};
  if (!nome || nome.trim().length < 2) {
    erros.nome = "O nome deve ter ao menos 2 caracteres.";
  }
  if (orcamento !== null && orcamento !== undefined && orcamento !== "" && Number(orcamento) <= 0) {
    erros.orcamento = "O orçamento deve ser maior que zero.";
  }
  return { erros, valido: Object.keys(erros).length === 0 };
}

export function validarMeta({ nome, valorAlvo, prazo }) {
  const erros = {};
  if (!nome || nome.trim().length < 2) {
    erros.nome = "O nome deve ter ao menos 2 caracteres.";
  }
  const valorNumerico = parseValorMonetario(valorAlvo);
  if (!valorNumerico || isNaN(valorNumerico) || valorNumerico <= 0) {
    erros.valorAlvo = "O valor alvo deve ser maior que zero.";
  }
  if (!prazo) {
    erros.prazo = "Informe o prazo.";
  }
  return { erros, valido: Object.keys(erros).length === 0 };
}
