import { useEffect, useRef, useState } from "react";
import { Sparkles, X, Send, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const MENSAGEM_INICIAL = {
  role: "assistant",
  content: "Olá! Sou o assistente financeiro do FinTrack. Posso analisar seus gastos, dar dicas e responder dúvidas sobre suas finanças. Como posso ajudar?",
};

export default function ChatWidget() {
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState([MENSAGEM_INICIAL]);
  const [input, setInput] = useState("");
  const [enviando, setEnviando] = useState(false);
  const scrollRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensagens, aberto]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function handleEnviar(e) {
    e.preventDefault();
    const texto = input.trim();
    if (!texto || enviando) return;

    const novaHistoria = [...mensagens, { role: "user", content: texto }];
    setMensagens([...novaHistoria, { role: "assistant", content: "" }]);
    setInput("");
    setEnviando(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(`${API_URL}/api/assistente/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagens: novaHistoria }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao conectar com o assistente.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let textoAcumulado = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const partes = buffer.split("\n\n");
        buffer = partes.pop();

        for (const parte of partes) {
          const linha = parte.trim();
          if (!linha.startsWith("data:")) continue;
          const dado = linha.slice(5).trim();
          if (dado === "[DONE]") continue;

          const payload = JSON.parse(dado);
          if (payload.error) throw new Error(payload.error);
          if (payload.text) {
            textoAcumulado += payload.text;
            setMensagens((prev) => {
              const atualizado = [...prev];
              atualizado[atualizado.length - 1] = { role: "assistant", content: textoAcumulado };
              return atualizado;
            });
          }
        }
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      setMensagens((prev) => {
        const atualizado = [...prev];
        atualizado[atualizado.length - 1] = {
          role: "assistant",
          content: `Desculpe, ocorreu um erro: ${err.message}`,
          erro: true,
        };
        return atualizado;
      });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      {aberto && (
        <div className="fixed bottom-20 right-4 z-50 flex h-[500px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-bg-card shadow-2xl animate-slide-up md:bottom-24 md:right-6">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-green/15">
                <Sparkles size={14} className="text-accent-green" />
              </div>
              <span className="text-body-sm font-semibold text-text-primary">Assistente FinTrack</span>
            </div>
            <button
              onClick={() => setAberto(false)}
              aria-label="Fechar chat"
              className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-hover hover:text-text-primary"
            >
              <X size={16} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {mensagens.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-body-sm ${
                    m.role === "user"
                      ? "bg-accent-green/15 text-text-primary"
                      : m.erro
                        ? "bg-accent-red/10 text-accent-red"
                        : "bg-bg-hover text-text-primary"
                  }`}
                >
                  {m.content || (
                    <Loader2 size={14} className="animate-spin text-text-muted" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleEnviar} className="flex gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre suas finanças..."
              disabled={enviando}
              className="flex-1 rounded-lg border border-border bg-bg-hover px-3 py-2 text-body-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-green disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={enviando || !input.trim()}
              aria-label="Enviar mensagem"
              className="flex items-center justify-center rounded-lg bg-accent-green px-3 text-bg-base disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setAberto((v) => !v)}
        aria-label={aberto ? "Fechar assistente" : "Abrir assistente financeiro"}
        className="fixed bottom-20 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-accent-green text-bg-base shadow-lg transition-transform hover:scale-105 md:bottom-6 md:right-6"
      >
        {aberto ? <X size={20} /> : <Sparkles size={20} />}
      </button>
    </>
  );
}
