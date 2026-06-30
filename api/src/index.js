require("dotenv").config();
const express = require("express");
const cors = require("cors");

const transacoesRouter = require("./routes/transacoes");
const categoriasRouter = require("./routes/categorias");
const metasRouter = require("./routes/metas");
const relatoriosRouter = require("./routes/relatorios");
const assistenteRouter = require("./routes/assistente");
const recorrenciasRouter = require("./routes/recorrencias");
const divisoesRouter = require("./routes/divisoes");
const insightsRouter = require("./routes/insights");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ data: { status: "ok" } }));

app.use("/api/transacoes", transacoesRouter);
app.use("/api/categorias", categoriasRouter);
app.use("/api/metas", metasRouter);
app.use("/api/relatorios", relatoriosRouter);
app.use("/api/assistente", assistenteRouter);
app.use("/api/recorrencias", recorrenciasRouter);
app.use("/api/divisoes", divisoesRouter);
app.use("/api/insights", insightsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`FinTrack API rodando na porta ${PORT}`);
});
