import { Loader2 } from "lucide-react";

const VARIANT_CLASSES = {
  primary: "bg-accent-green text-bg-base hover:bg-accent-green/90",
  ghost: "bg-transparent text-text-primary border border-border hover:bg-bg-hover",
  danger: "bg-accent-red text-white hover:bg-accent-red/90",
};

export default function Button({
  variant = "primary",
  loading = false,
  disabled = false,
  fullWidth = false,
  type = "button",
  onClick,
  children,
  className = "",
}) {
  const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-body font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClass} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : null}
      {children}
    </button>
  );
}
