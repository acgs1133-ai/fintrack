const { sugerirCategoria } = require("../lib/keywords");
const { essencialidadeSugerida } = require("../lib/financas");

// Lançamento rápido: recebe um texto livre e sugere uma categoria com base no
// histórico do usuário, além da classificação necessidade/desejo sugerida.
async function sugerir(req, res, next) {
  try {
    const { texto } = req.body;
    const resultado = await sugerirCategoria(texto || "");

    if (!resultado) {
      return res.json({ data: { categoria: null, fonte: "nenhuma", essencial: null } });
    }

    res.json({
      data: {
        categoria: resultado.categoria,
        fonte: resultado.fonte,
        essencial: essencialidadeSugerida(resultado.categoria.nome),
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { sugerir };
