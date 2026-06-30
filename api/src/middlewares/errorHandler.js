function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.status) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }

  if (err.code === "P2025") {
    return res.status(404).json({ error: "Registro não encontrado." });
  }

  if (err.code === "P2002") {
    return res.status(409).json({ error: "Já existe um registro com esse valor único.", details: err.meta });
  }

  return res.status(500).json({ error: "Erro interno do servidor.", details: err.message });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: "Rota não encontrada." });
}

class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

module.exports = { errorHandler, notFoundHandler, ApiError };
