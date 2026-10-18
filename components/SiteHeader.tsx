import Link from "next/link";

function BrandMark() {
  return (
    <span aria-hidden="true" className="brand-dots">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

export default function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-50 border-b border-[var(--border)] backdrop-blur"
      style={{ background: "color-mix(in srgb, var(--background) 82%, transparent)" }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex items-center gap-3 text-base font-bold">
          <BrandMark />
          <span>
            UPB <span style={{ color: "var(--brand)" }}>test</span>
          </span>
        </Link>

        <nav aria-label="Navegación principal" className="flex items-center gap-5 text-sm font-medium">
          <Link href="/" className="hover:opacity-70">
            Inicio
          </Link>
          <Link href="/productos" className="hover:opacity-70">
            Productos
          </Link>
        </nav>

        <Link href="/productos" className="btn btn--primary btn--sm">
          Ir al catálogo <span aria-hidden="true">→</span>
        </Link>
      </div>
    </header>
  );
}
