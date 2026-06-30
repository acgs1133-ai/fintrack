import Button from "./Button";

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      {Icon && (
        <div className="rounded-full bg-bg-hover p-3">
          <Icon size={48} className="text-text-muted" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-subtitle font-semibold text-text-primary">{title}</h3>
      {description && <p className="max-w-sm text-body-sm text-text-secondary">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
