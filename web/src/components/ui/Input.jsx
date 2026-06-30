export default function Input({
  label,
  error,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  step,
  min,
  className = "",
  ...rest
}) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-body-sm font-medium text-text-secondary">
          {label} {required && <span className="text-accent-red">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        step={step}
        min={min}
        className={`w-full rounded-lg border bg-bg-hover px-3 py-2 text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 ${
          error ? "border-accent-red focus:ring-accent-red" : "border-border focus:ring-accent-green"
        }`}
        {...rest}
      />
      {error && <p className="mt-1 text-muted text-accent-red">{error}</p>}
    </div>
  );
}
