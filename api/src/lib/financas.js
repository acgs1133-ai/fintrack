// Helpers financeiros compartilhados entre controllers.

function rangeDoMes(mes, ano) {
  const inicio = new Date(Number(ano), Number(mes) - 1, 1);
  const fim = new Date(Number(ano), Number(mes), 1);
  return { gte: inicio, lt: fim };
}

// Quantidade de meses (no mínimo 1) entre hoje e o prazo de uma meta.
function mesesRestantes(prazo, base = new Date()) {
  const p = new Date(prazo);
  return Math.max(1, (p.getFullYear() - base.getFullYear()) * 12 + (p.getMonth() - base.getMonth()));
}

// Quanto precisa ser guardado por mês para bater a meta no prazo.
function economiaMensalMeta(meta, base = new Date()) {
  const faltam = meta.valorAlvo - meta.valorAtual;
  if (faltam <= 0) return 0;
  return faltam / mesesRestantes(meta.prazo, base);
}

// Sugestão automática de necessidade vs desejo a partir do nome da categoria.
const ESSENCIAL_POR_CATEGORIA = {
  "Alimentação": "NECESSIDADE",
  "Transporte": "NECESSIDADE",
  "Moradia": "NECESSIDADE",
  "Saúde": "NECESSIDADE",
  "Educação": "NECESSIDADE",
  "Lazer": "DESEJO",
};

function essencialidadeSugerida(nomeCategoria) {
  return ESSENCIAL_POR_CATEGORIA[nomeCategoria] || null;
}

module.exports = { rangeDoMes, mesesRestantes, economiaMensalMeta, essencialidadeSugerida };
