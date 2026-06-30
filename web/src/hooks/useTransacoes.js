import { useAppStore } from "../store/useAppStore";

export function useTransacoes() {
  const transacoes = useAppStore((s) => s.transacoes);
  const loading = useAppStore((s) => s.loadingTransacoes);
  const erro = useAppStore((s) => s.erroTransacoes);
  const fetchTransacoes = useAppStore((s) => s.fetchTransacoes);
  const addTransacao = useAppStore((s) => s.addTransacao);
  const updateTransacao = useAppStore((s) => s.updateTransacao);
  const deleteTransacao = useAppStore((s) => s.deleteTransacao);
  const importarTransacoes = useAppStore((s) => s.importarTransacoes);

  return {
    transacoes,
    loading,
    erro,
    fetchTransacoes,
    addTransacao,
    updateTransacao,
    deleteTransacao,
    importarTransacoes,
  };
}
