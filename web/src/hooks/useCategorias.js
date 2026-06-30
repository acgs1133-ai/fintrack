import { useAppStore } from "../store/useAppStore";

export function useCategorias() {
  const categorias = useAppStore((s) => s.categorias);
  const loading = useAppStore((s) => s.loadingCategorias);
  const erro = useAppStore((s) => s.erroCategorias);
  const fetchCategorias = useAppStore((s) => s.fetchCategorias);
  const addCategoria = useAppStore((s) => s.addCategoria);
  const updateCategoria = useAppStore((s) => s.updateCategoria);
  const deleteCategoria = useAppStore((s) => s.deleteCategoria);

  return { categorias, loading, erro, fetchCategorias, addCategoria, updateCategoria, deleteCategoria };
}
