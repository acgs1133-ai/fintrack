import { useAppStore } from "../store/useAppStore";

export function useMetas() {
  const metas = useAppStore((s) => s.metas);
  const loading = useAppStore((s) => s.loadingMetas);
  const erro = useAppStore((s) => s.erroMetas);
  const fetchMetas = useAppStore((s) => s.fetchMetas);
  const addMeta = useAppStore((s) => s.addMeta);
  const updateMeta = useAppStore((s) => s.updateMeta);
  const depositarMeta = useAppStore((s) => s.depositarMeta);
  const deleteMeta = useAppStore((s) => s.deleteMeta);

  return { metas, loading, erro, fetchMetas, addMeta, updateMeta, depositarMeta, deleteMeta };
}
