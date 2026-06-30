import { useState, useRef } from "react";
import { Upload, FileText } from "lucide-react";
import Button from "../ui/Button";
import Select from "../ui/Select";
import { useCategorias } from "../../hooks/useCategorias";
import { useTransacoes } from "../../hooks/useTransacoes";
import { useToast } from "../../hooks/useToast";
import { extrairLinhas, montarTransacoes } from "../../utils/csvParser";
import { fmtMoeda, fmtData } from "../../utils/formatters";

export default function ImportarCSV({ onClose }) {
  const { categorias } = useCategorias();
  const { importarTransacoes } = useTransacoes();
  const { showToast } = useToast();

  const [etapa, setEtapa] = useState("upload");
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [colunas, setColunas] = useState({ dataCol: "", valorCol: "", descricaoCol: "" });
  const [transacoes, setTransacoes] = useState([]);
  const [arrastando, setArrastando] = useState(false);
  const [importando, setImportando] = useState(false);
  const [erro, setErro] = useState(null);
  const fileInputRef = useRef(null);

  function processarArquivo(file) {
    if (!file) return;
    setErro(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const { headers: hs, rows: rs, colunasDetectadas } = extrairLinhas(e.target.result);
        if (hs.length === 0 || rs.length === 0) {
          setErro("Não foi possível ler o arquivo. Verifique o formato do CSV.");
          return;
        }
        setHeaders(hs);
        setRows(rs);
        setColunas(colunasDetectadas);
        setTransacoes(montarTransacoes(rs, colunasDetectadas));
        setEtapa("preview");
      } catch {
        setErro("Erro ao processar o arquivo CSV.");
      }
    };
    reader.readAsText(file, "UTF-8");
  }

  function handleColunaChange(campo, valor) {
    const novasColunas = { ...colunas, [campo]: valor };
    setColunas(novasColunas);
    setTransacoes(montarTransacoes(rows, novasColunas));
  }

  function handleCategoriaChange(index, categoriaNome) {
    setTransacoes((prev) => prev.map((t, i) => (i === index ? { ...t, categoriaDetectada: categoriaNome } : t)));
  }

  async function handleImportar() {
    setImportando(true);
    try {
      const importadas = await importarTransacoes(transacoes);
      showToast(`${importadas.length} transações importadas com sucesso.`, "success");
      onClose();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setImportando(false);
    }
  }

  if (etapa === "upload") {
    return (
      <div>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setArrastando(true);
          }}
          onDragLeave={() => setArrastando(false)}
          onDrop={(e) => {
            e.preventDefault();
            setArrastando(false);
            processarArquivo(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
            arrastando ? "border-accent-green bg-accent-green/5" : "border-border hover:bg-bg-hover"
          }`}
        >
          <Upload size={32} className="text-text-muted" />
          <p className="text-body-sm text-text-secondary">
            Arraste seu arquivo CSV aqui ou <span className="text-accent-green">clique para selecionar</span>
          </p>
          <p className="text-muted text-text-muted">Suporta extratos Nubank, Inter e CSV genérico</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => processarArquivo(e.target.files[0])}
        />
        {erro && <p className="mt-3 text-body-sm text-accent-red">{erro}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Select label="Coluna de data" value={colunas.dataCol} onChange={(e) => handleColunaChange("dataCol", e.target.value)}>
          {headers.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </Select>
        <Select label="Coluna de descrição" value={colunas.descricaoCol} onChange={(e) => handleColunaChange("descricaoCol", e.target.value)}>
          {headers.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </Select>
        <Select label="Coluna de valor" value={colunas.valorCol} onChange={(e) => handleColunaChange("valorCol", e.target.value)}>
          {headers.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2 text-body-sm font-medium text-text-secondary">
          <FileText size={15} />
          Pré-visualização ({transacoes.length} transações detectadas)
        </div>
        <div className="max-h-72 overflow-y-auto rounded-lg border border-border">
          <table className="w-full text-body-sm">
            <thead className="sticky top-0 bg-bg-hover text-muted text-text-muted">
              <tr>
                <th className="px-3 py-2 text-left">Data</th>
                <th className="px-3 py-2 text-left">Descrição</th>
                <th className="px-3 py-2 text-right">Valor</th>
                <th className="px-3 py-2 text-left">Categoria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transacoes.slice(0, 50).map((t, i) => (
                <tr key={i}>
                  <td className="whitespace-nowrap px-3 py-2 text-text-secondary">{fmtData(t.data)}</td>
                  <td className="px-3 py-2 text-text-primary">{t.descricao}</td>
                  <td
                    className={`whitespace-nowrap px-3 py-2 text-right tabular-nums ${
                      t.valor >= 0 ? "text-accent-green" : "text-text-primary"
                    }`}
                  >
                    {fmtMoeda(t.valor)}
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={t.categoriaDetectada}
                      onChange={(e) => handleCategoriaChange(i, e.target.value)}
                      className="rounded-md border border-border bg-bg-hover px-2 py-1 text-muted text-text-primary"
                    >
                      {categorias.map((c) => (
                        <option key={c.id} value={c.nome}>
                          {c.nome}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={() => setEtapa("upload")}>
          Voltar
        </Button>
        <Button variant="primary" onClick={handleImportar} loading={importando} disabled={transacoes.length === 0}>
          Importar {transacoes.length} transações
        </Button>
      </div>
    </div>
  );
}
