export function Brand({ compacto = false }: { compacto?: boolean }) {
  return (
    <span className={`brand ${compacto ? "brand-small" : ""}`}>
      <span className="brand-mark" aria-hidden="true">
        <i />
      </span>
      Stable
    </span>
  );
}
