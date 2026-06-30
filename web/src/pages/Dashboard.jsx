import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Bell, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { useTransacoes } from "../hooks/useTransacoes";
import { useToast } from "../hooks/useToast";
import api from "../services/api";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Skeleton, { SkeletonList } from "../components/ui/Skeleton";
import SaldoCard from "../components/dashboard/SaldoCard";
import SeguroCard from "../components/dashboard/SeguroCard";
import MetricCard from "../components/dashboard/MetricCard";
import OrcamentoBar from "../components/dashboard/OrcamentoBar";
import GraficoSaldo from "../components/dashboard/GraficoSaldo";
import GraficoPizza from "../components/dashboard/GraficoPizza";
import CategoriaItem from "../components/dashboard/CategoriaItem";
import EssencialidadeResumo from "../components/dashboard/EssencialidadeResumo";
import ComparativoCategorias from "../components/dashboard/ComparativoCategorias";
import InsightsSemanais from "../components/dashboard/InsightsSemanais";
import AReceberCard from "../components/dashboard/AReceberCard";
import TransacaoItem from "../components/transacoes/TransacaoItem";
import TransacaoForm from "../components/transacoes/TransacaoForm";
import LancamentoRapido from "../components/transacoes/LancamentoRapido";
import { fmtMesAno } from "../utils/formatters";

const hoje = new Date();
const mesAtual = hoje.getMonth() + 1;
const anoAtual = hoje.getFullYear();

export default function Dashboard() {
  const { fetchTransacoes, addTransacao } = useTransacoes();
  const { showToast } = useToast();
  const categorias = useAppStore((s) => s.categorias);
  const fetchCategorias = useAppStore((s) => s.fetchCategorias);

  const [resumo, setResumo] = useState(null);
  const [porCategoria, setPorCategoria] = useState([]);
  const [recentes, setRecentes] = useState([]);
  const [seguro, setSeguro] = useState(null);
  const [essencialidade, setEssencialidade] = useState(null);
  const [comparativo, setComparativo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [modalNovaTransacao, setModalNovaTransacao] = useState(false);

  async function carregarDados() {
    setLoading(true);
    setErro(null);
    try {
      const [resumoData, categoriaData, recentesData, seguroData, essencialData, comparativoData] =
        await Promise.all([
          api.get("/api/relatorios/resumo", { params: { mes: mesAtual, ano: anoAtual } }),
          api.get("/api/relatorios/por-categoria", { params: { mes: mesAtual, ano: anoAtual } }),
          api.get("/api/transacoes", { params: { mes: mesAtual, ano: anoAtual, limit: 5 } }),
          api.get("/api/relatorios/seguro-para-gastar"),
          api.get("/api/relatorios/essencialidade", { params: { mes: mesAtual, ano: anoAtual } }),
          api.get("/api/relatorios/comparativo", { params: { mes: mesAtual, ano: anoAtual } }),
        ]);
      setResumo(resumoData);
      setPorCategoria(categoriaData);
      setRecentes(recentesData);
      setSeguro(seguroData);
      setEssencialidade(essencialData);
      setComparativo(comparativoData);
      await fetchCategorias();
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const categoriasEmAlerta = useMemo(
    () => porCategoria.filter((c) => c.orcamento && c.gasto / c.orcamento >= 0.9),
    [porCategoria]
  );

  const evolucaoSaldo = useMemo(() => {
    if (!resumo) return [];
    const diasNoMes = new Date(anoAtual, mesAtual, 0).getDate();
    const pontos = [];
    let acumulado = 0;
    const diaHoje = hoje.getDate();
    const incrementoPorDia = diaHoje > 0 ? resumo.saldo / diaHoje : 0;
    for (let dia = 1; dia <= diasNoMes; dia++) {
      if (dia <= diaHoje) acumulado += incrementoPorDia;
      pontos.push({ dia, saldo: Math.round(acumulado) });
    }
    return pontos;
  }, [resumo]);

  async function handleSalvarTransacao(payload) {
    await addTransacao(payload);
    setModalNovaTransacao(false);
    await carregarDados();
  }

  if (erro) {
    return (
      <div className="rounded-xl border border-accent-red/30 bg-accent-red/5 p-5 text-body-sm text-accent-red">
        Erro ao carregar dashboard: {erro}
        <Button variant="ghost" className="mt-3" onClick={carregarDados}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-title font-semibold text-text-primary">Olá! 👋</h1>
          <p className="text-body-sm text-text-secondary">
            {fmtMesAno(mesAtual, anoAtual).replace(/^./, (c) => c.toUpperCase())}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              aria-label="Notificações"
              className="rounded-lg border border-border bg-bg-card p-2.5 text-text-secondary hover:bg-bg-hover"
              onClick={() =>
                showToast(
                  categoriasEmAlerta.length > 0
                    ? `${categoriasEmAlerta.length} categoria(s) acima de 90% do orçamento`
                    : "Nenhum alerta de orçamento no momento",
                  categoriasEmAlerta.length > 0 ? "error" : "info"
                )
              }
            >
              <Bell size={18} />
            </button>
            {categoriasEmAlerta.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-red text-[10px] font-semibold text-white">
                {categoriasEmAlerta.length}
              </span>
            )}
          </div>
          <Button variant="primary" onClick={() => setModalNovaTransacao(true)}>
            <Plus size={16} />
            <span className="hidden sm:inline">Nova transação</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-5">
          <Skeleton variant="card" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </div>
          <Skeleton variant="card" className="h-64" />
          <SkeletonList rows={3} />
        </div>
      ) : (
        <>
          <LancamentoRapido ultimaTransacao={recentes[0]} onSaved={carregarDados} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SaldoCard
              saldo={resumo.saldo}
              variacaoPercentual={resumo.variacaoPercentual}
              mesLabel={fmtMesAno(mesAtual, anoAtual)}
            />
            <SeguroCard dados={seguro} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricCard label="Receitas" valor={resumo.receitas} icon={TrendingUp} color="#22C55E" />
            <MetricCard label="Despesas" valor={resumo.despesas} icon={TrendingDown} color="#EF4444" />
            <MetricCard label="Economia" valor={resumo.saldo} icon={PiggyBank} color="#3B82F6" />
          </div>

          <OrcamentoBar gasto={resumo.despesas} orcamentoTotal={resumo.orcamentoTotal} />

          <InsightsSemanais />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <EssencialidadeResumo dados={essencialidade} />
            <ComparativoCategorias dados={comparativo} />
          </div>

          <AReceberCard />

          <GraficoSaldo dados={evolucaoSaldo} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-bg-card p-5">
              <p className="text-body-sm font-medium text-text-secondary">Gastos por categoria</p>
              <div className="mt-2 divide-y divide-border">
                {porCategoria.length === 0 ? (
                  <p className="py-6 text-center text-body-sm text-text-muted">Nenhum gasto registrado este mês.</p>
                ) : (
                  porCategoria.map((c) => (
                    <CategoriaItem key={c.id} nome={c.nome} cor={c.cor} gasto={c.gasto} orcamento={c.orcamento} />
                  ))
                )}
              </div>
            </div>
            <GraficoPizza dados={porCategoria.filter((c) => c.gasto > 0)} />
          </div>

          <div className="rounded-xl border border-border bg-bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-body-sm font-medium text-text-secondary">Transações recentes</p>
              <Link to="/transacoes" className="text-body-sm font-medium text-accent-green hover:underline">
                Ver todas
              </Link>
            </div>
            <div className="mt-3 space-y-2">
              {recentes.length === 0 ? (
                <p className="py-6 text-center text-body-sm text-text-muted">Nenhuma transação ainda.</p>
              ) : (
                recentes.map((t) => <TransacaoItem key={t.id} transacao={t} />)
              )}
            </div>
          </div>
        </>
      )}

      <Modal isOpen={modalNovaTransacao} onClose={() => setModalNovaTransacao(false)} title="Nova transação">
        <TransacaoForm onSave={handleSalvarTransacao} onCancel={() => setModalNovaTransacao(false)} />
      </Modal>
    </div>
  );
}
