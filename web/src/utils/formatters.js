export const fmtMoeda = (valor) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor || 0);

export const fmtData = (data) => new Intl.DateTimeFormat("pt-BR").format(new Date(data));

export const fmtMesAno = (mes, ano) => {
  const d = new Date(ano, mes - 1);
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(d);
};

export const fmtPorcentagem = (valor, total) =>
  !total ? "0%" : `${Math.round((valor / total) * 100)}%`;

export const dataParaInputValue = (data) => {
  const d = new Date(data);
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};
