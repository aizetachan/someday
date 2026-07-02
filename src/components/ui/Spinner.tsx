export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-ink-soft">
      <div
        className="h-6 w-6 animate-spin rounded-full border-2 border-ink-soft/30 border-t-seal"
        role="status"
        aria-label={label ?? 'Cargando'}
      />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
