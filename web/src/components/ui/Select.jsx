import { ChevronDown } from "lucide-react";

export default function Select({ label, error, value, onChange, children, required = false, className = "" }) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-body-sm font-medium text-text-secondary">
          {label} {required && <span className="text-accent-red">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className={`w-full appearance-none rounded-lg border bg-bg-hover px-3 py-2 pr-9 text-body text-text-primary focus:outline-none focus:ring-1 ${
            error ? "border-accent-red focus:ring-accent-red" : "border-border focus:ring-accent-green"
          }`}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
      </div>
      {error && <p className="mt-1 text-muted text-accent-red">{error}</p>}
    </div>
  );
}
