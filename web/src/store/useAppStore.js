import { create } from "zustand";
import api from "../services/api";

let toastId = 0;

const CACHE_KEYS = {
  transacoes: "fintrack_cache_transacoes",
  categorias: "fintrack_cache_categorias",
  metas: "fintrack_cache_metas",
};

function salvarCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // armazenamento indisponível, ignora cache
  }
}

function lerCache(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const useAppStore = create((set, get) => ({
  // Transações
  transacoes: lerCache(CACHE_KEYS.transacoes),
  loadingTransacoes: false,
  erroTransacoes: null,
  fetchTransacoes: async (filtros = {}) => {
    set({ loadingTransacoes: true, erroTransacoes: null });
    try {
      const params = {};
      if (filtros.mes) params.mes = filtros.mes;
      if (filtros.ano) params.ano = filtros.ano;
      if (filtros.categoriaId) params.categoriaId = filtros.categoriaId;
      if (filtros.tipo) params.tipo = filtros.tipo;
      if (filtros.q) params.q = filtros.q;
      if (filtros.limit) params.limit = filtros.limit;

      const data = await api.get("/api/transacoes", { params });
      set({ transacoes: data, loadingTransacoes: false });
      salvarCache(CACHE_KEYS.transacoes, data);
      return data;
    } catch (err) {
      set({ loadingTransacoes: false, erroTransacoes: err.message, transacoes: lerCache(CACHE_KEYS.transacoes) });
      throw err;
    }
  },
  addTransacao: async (data) => {
    const novaTransacao = await api.post("/api/transacoes", data);
    set((state) => ({ transacoes: [novaTransacao, ...state.transacoes] }));
    return novaTransacao;
  },
  updateTransacao: async (id, data) => {
    const atualizada = await api.put(`/api/transacoes/${id}`, data);
    set((state) => ({
      transacoes: state.transacoes.map((t) => (t.id === id ? atualizada : t)),
    }));
    return atualizada;
  },
  deleteTransacao: async (id) => {
    await api.delete(`/api/transacoes/${id}`);
    set((state) => ({ transacoes: state.transacoes.filter((t) => t.id !== id) }));
  },
  importarTransacoes: async (transacoes) => {
    const importadas = await api.post("/api/transacoes/importar", { transacoes });
    set((state) => ({ transacoes: [...importadas, ...state.transacoes] }));
    return importadas;
  },
  // Sugere categoria/essencialidade a partir de texto livre (lançamento rápido + form).
  sugerirCategoria: async (texto) => {
    return api.post("/api/transacoes/sugerir-categoria", { texto });
  },

  // Recorrências / assinaturas
  setRecorrenciaStatus: async ({ chave, descricao, ativa }) => {
    return api.patch("/api/recorrencias/status", { chave, descricao, ativa });
  },

  // Dividir conta
  toggleParticipante: async (id, quitado) => {
    return api.patch(`/api/divisoes/participantes/${id}`, { quitado });
  },

  // Projeção realista de meta
  metaProjecao: async (id) => {
    return api.get(`/api/metas/${id}/projecao`);
  },

  // Categorias
  categorias: lerCache(CACHE_KEYS.categorias),
  loadingCategorias: false,
  erroCategorias: null,
  fetchCategorias: async () => {
    set({ loadingCategorias: true, erroCategorias: null });
    try {
      const data = await api.get("/api/categorias");
      set({ categorias: data, loadingCategorias: false });
      salvarCache(CACHE_KEYS.categorias, data);
      return data;
    } catch (err) {
      set({ loadingCategorias: false, erroCategorias: err.message, categorias: lerCache(CACHE_KEYS.categorias) });
      throw err;
    }
  },
  addCategoria: async (data) => {
    const nova = await api.post("/api/categorias", data);
    set((state) => ({ categorias: [...state.categorias, nova] }));
    return nova;
  },
  updateCategoria: async (id, data) => {
    const atualizada = await api.put(`/api/categorias/${id}`, data);
    set((state) => ({
      categorias: state.categorias.map((c) => (c.id === id ? atualizada : c)),
    }));
    return atualizada;
  },
  deleteCategoria: async (id) => {
    await api.delete(`/api/categorias/${id}`);
    set((state) => ({ categorias: state.categorias.filter((c) => c.id !== id) }));
  },

  // Metas
  metas: lerCache(CACHE_KEYS.metas),
  loadingMetas: false,
  erroMetas: null,
  fetchMetas: async () => {
    set({ loadingMetas: true, erroMetas: null });
    try {
      const data = await api.get("/api/metas");
      set({ metas: data, loadingMetas: false });
      salvarCache(CACHE_KEYS.metas, data);
      return data;
    } catch (err) {
      set({ loadingMetas: false, erroMetas: err.message, metas: lerCache(CACHE_KEYS.metas) });
      throw err;
    }
  },
  addMeta: async (data) => {
    const nova = await api.post("/api/metas", data);
    set((state) => ({ metas: [...state.metas, nova] }));
    return nova;
  },
  updateMeta: async (id, data) => {
    const atualizada = await api.put(`/api/metas/${id}`, data);
    set((state) => ({ metas: state.metas.map((m) => (m.id === id ? atualizada : m)) }));
    return atualizada;
  },
  depositarMeta: async (id, valor) => {
    const atualizada = await api.patch(`/api/metas/${id}/depositar`, { valor });
    set((state) => ({ metas: state.metas.map((m) => (m.id === id ? atualizada : m)) }));
    return atualizada;
  },
  deleteMeta: async (id) => {
    await api.delete(`/api/metas/${id}`);
    set((state) => ({ metas: state.metas.filter((m) => m.id !== id) }));
  },

  // UI
  modalAberto: null,
  setModal: (modal) => set({ modalAberto: modal }),

  // Toast
  toasts: [],
  showToast: (message, type = "info") => {
    const id = ++toastId;
    set((state) => {
      const toasts = [...state.toasts, { id, message, type }];
      return { toasts: toasts.length > 3 ? toasts.slice(toasts.length - 3) : toasts };
    });
    setTimeout(() => get().removeToast(id), 4000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
