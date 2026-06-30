// Sugestão automática de necessidade vs desejo por categoria.
// Espelha o mapa do backend (src/lib/financas.js) para pré-seleção imediata na UI.
const MAP = {
  Alimentação: "NECESSIDADE",
  Transporte: "NECESSIDADE",
  Moradia: "NECESSIDADE",
  Saúde: "NECESSIDADE",
  Educação: "NECESSIDADE",
  Lazer: "DESEJO",
};

export function essencialidadePadrao(nomeCategoria) {
  return MAP[nomeCategoria] || null;
}

export const ESSENCIAL_LABEL = {
  NECESSIDADE: "Necessidade",
  DESEJO: "Desejo",
};
