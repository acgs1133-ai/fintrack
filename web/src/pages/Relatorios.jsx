import { useEffect, useMemo, useRef, useState } from "react";
import { Download } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Skeleton from "../components/ui/Skeleton";
import GraficoPizza from "../components/dashboard/GraficoPizza";
import EssencialidadeResumo from "../components/dashboard/EssencialidadeResumo";
import ComparativoCategorias from "../components/dashboard/ComparativoCategorias";
import { useToast } from "../hooks/useToast";
import api from "../services/api";
import { fmtMoeda, fmtMesAno, fmtPorcentagem } from "../utils/formatters";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-bg-card px-3 py-2 text-body-sm shadow-lg">
      <p className="text-text-muted">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="tabular-nums" style={{ color: p.color }}>
          {p.name}: {fmtMoeda(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function Relatorios() {
  const { showToast } = useToast();
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());

  const [historico, setHistorico] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [porCategoria, setPorCategoria] = useState([]);
  const [essencialidade, setEssencialidade] = useState(null);
  const [comparativoCat, setComparativoCat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [exportando, setExportando] = useState(false);

  const pizzaRef = useRef(null);

  async function carregarDados() {
    setLoading(true);
    setErro(null);
    try {
      const [historicoData, resumoData, categoriaData, essencialData, comparativoData] = await Promise.all([
        api.get("/api/relatorios/historico", { params: { meses: 6 } }),
        api.get("/api/relatorios/resumo", { params: { mes, ano } }),
        api.get("/api/relatorios/por-categoria", { params: { mes, ano } }),
        api.get("/api/relatorios/essencialidade", { params: { mes, ano } }),
        api.get("/api/relatorios/comparativo", { params: { mes, ano } }),
      ]);
      setHistorico(historicoData);
      setResumo(resumoData);
      setPorCategoria(categoriaData.filter((c) => c.gasto > 0));
      setEssencialidade(essencialData);
      setComparativoCat(comparativoData);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, [mes, ano]);

  const comparativo = useMemo(() => {
    if (historico.length === 0) return null;
    const idxAtual = historico.findIndex((h) => h.mes === mes && h.ano === ano);
    const atual = idxAtual >= 0 ? historico[idxAtual] : historico[historico.length - 1];
    const anterior = idxAtual >= 1 ? historico[idxAtual - 1] : null;
    const tresMeses = idxAtual >= 3 ? historico[idxAtual - 3] : null;
    return { atual, anterior, tresMeses };
  }, [historico, mes, ano]);

  const gastoTotal = porCategoria.reduce((acc, c) => acc + c.gasto, 0);

  async function handleExportarPDF() {
    setExportando(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(`FinTrack — Relatório ${fmtMesAno(mes, ano)}`, 14, 18);

      doc.setFontSize(12);
      doc.text(`Saldo do período: ${fmtMoeda(resumo?.saldo || 0)}`, 14, 30);
      doc.text(`Receitas: ${fmtMoeda(resumo?.receitas || 0)}`, 14, 37);
      doc.text(`Despesas: ${fmtMoeda(resumo?.despesas || 0)}`, 14, 44);

      let y = 56;
      doc.setFontSize(13);
      doc.text("Gastos por categoria", 14, y);
      y += 7;
      doc.setFontSize(10);
      porCategoria.forEach((c) => {
        const percentual = fmtPorcentagem(c.gasto, gastoTotal);
        doc.text(`${c.nome}: ${fmtMoeda(c.gasto)} (${percentual} do total)`, 14, y);
        y += 6;
      });

      if (pizzaRef.current) {
        const canvas = await html2canvas(pizzaRef.current, { backgroundColor: "#161616" });
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = 90;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        doc.addImage(imgData, "PNG", 110, 56, imgWidth, imgHeight);
      }

      doc.save(`fintrack-relatorio-${mes}-${ano}.pdf`);
      showToast("PDF exportado com sucesso", "success");
    } catch (err) {
      showToast("Erro ao exportar PDF: " + err.message, "error");
    } finally {
      setExportando(false);
    }
  }

  const anos = [hoje.getFullYear() - 1, hoje.getFullYear(), hoje.getFullYear() + 1];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-title font-semibold text-text-primary">Relatórios</h1>
        <Button variant="primary" onClick={handleExportarPDF} loading={exportando} disabled={loading}>
          <Download size={16} />
          Exportar PDF
        </Button>
      </div>

      <div className="flex gap-3">
        <Select label="Mês" value={mes} onChange={(e) => setMes(Number(e.target.value))} className="flex-1 sm:flex-none sm:w-40">
          {MESES.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </Select>
        <Select label="Ano" value={ano} onChange={(e) => setAno(Number(e.target.value))} className="w-24 sm:w-28">
          {anos.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>
      </div>

      {erro && !loading && (
        <div className="rounded-xl border border-accent-red/30 bg-accent-red/5 p-4 text-body-sm text-accent-red">
          {erro}
        </div>
      )}

      {loading ? (
        <div className="space-y-5">
          <Skeleton variant="card" className="h-20" />
          <Skeleton variant="card" className="h-64" />
          <Skeleton variant="card" className="h-64" />
        </div>
      ) : (
        <>
          {comparativo && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-bg-card p-4">
                <p className="text-body-sm text-text-secondary">Saldo atual</p>
                <p className="mt-1 text-subtitle font-semibold tabular-nums text-text-primary">
                  {fmtMoeda(comparativo.atual?.saldo || 0)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-bg-card p-4">
                <p className="text-body-sm text-text-secondary">Mês anterior</p>
                <p className="mt-1 text-subtitle font-semibold tabular-nums text-text-secondary">
                  {comparativo.anterior ? fmtMoeda(comparativo.anterior.saldo) : "—"}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-bg-card p-4">
                <p className="text-body-sm text-text-secondary">Há 3 meses</p>
                <p className="mt-1 text-subtitle font-semibold tabular-nums text-text-secondary">
                  {comparativo.tresMeses ? fmtMoeda(comparativo.tresMeses.saldo) : "—"}
                </p>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border bg-bg-card p-4 sm:p-5">
            <p className="text-body-sm font-medium text-text-secondary">Receitas vs despesas (últimos 6 meses)</p>
            <div className="mt-3 h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historico}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                  <XAxis dataKey="label" stroke="#52525B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525B" fontSize={12} tickLine={false} axisLine={false} width={50} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "#A1A1AA" }} />
                  <Bar dataKey="receitas" name="Receitas" fill="#22C55E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesas" name="Despesas" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-bg-card p-4 sm:p-5">
            <p className="text-body-sm font-medium text-text-secondary">Evolução do saldo (últimos 6 meses)</p>
            <div className="mt-3 h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historico}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                  <XAxis dataKey="label" stroke="#52525B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525B" fontSize={12} tickLine={false} axisLine={false} width={50} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="saldo" name="Saldo" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <EssencialidadeResumo dados={essencialidade} />
            <ComparativoCategorias dados={comparativoCat} />
          </div>

          <div ref={pizzaRef}>
            <GraficoPizza dados={porCategoria} />
          </div>

          <div className="rounded-xl border border-border bg-bg-card p-4 sm:p-5">
            <p className="mb-3 text-body-sm font-medium text-text-secondary">Resumo por categoria</p>
            {porCategoria.length === 0 ? (
              <p className="py-6 text-center text-body-sm text-text-muted">Nenhum gasto registrado neste período.</p>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full min-w-[320px] text-body-sm">
                  <thead className="text-muted text-text-muted">
                    <tr className="border-b border-border">
                      <th className="px-4 py-2 text-left sm:px-2">Categoria</th>
                      <th className="px-4 py-2 text-right sm:px-2">Gasto</th>
                      <th className="px-4 py-2 text-right sm:px-2">%</th>
                      <th className="hidden px-2 py-2 text-right sm:table-cell">vs orçamento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {porCategoria.map((c) => (
                      <tr key={c.id}>
                        <td className="px-4 py-2 sm:px-2">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: c.cor }} />
                            <span className="truncate max-w-[120px] sm:max-w-none">{c.nome}</span>
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums text-text-primary sm:px-2">{fmtMoeda(c.gasto)}</td>
                        <td className="px-4 py-2 text-right tabular-nums text-text-secondary sm:px-2">
                          {fmtPorcentagem(c.gasto, gastoTotal)}
                        </td>
                        <td className="hidden px-2 py-2 text-right tabular-nums text-text-secondary sm:table-cell">
                          {c.orcamento ? fmtPorcentagem(c.gasto, c.orcamento) : "sem limite"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
