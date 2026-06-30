import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

const VARIANT_STYLES = {
  success: { icon: CheckCircle2, color: "text-accent-green", border: "border-accent-green/30" },
  error: { icon: XCircle, color: "text-accent-red", border: "border-accent-red/30" },
  info: { icon: Info, color: "text-accent-blue", border: "border-accent-blue/30" },
};

export default function ToastContainer() {
  const toasts = useAppStore((s) => s.toasts);
  const removeToast = useAppStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-36 right-4 z-[100] flex flex-col gap-2 sm:max-w-sm md:bottom-24">
      {toasts.map((toast) => {
        const { icon: Icon, color, border } = VARIANT_STYLES[toast.type] || VARIANT_STYLES.info;
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-2 rounded-lg border bg-bg-card px-4 py-3 shadow-lg animate-slide-up ${border}`}
          >
            <Icon size={18} className={`mt-0.5 shrink-0 ${color}`} />
            <p className="flex-1 text-body-sm text-text-primary">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Fechar notificação"
              className="shrink-0 text-text-muted hover:text-text-primary"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
