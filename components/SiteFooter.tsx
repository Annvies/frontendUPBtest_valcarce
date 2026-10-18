import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--border)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-sm sm:flex-row">
        <span style={{ color: "var(--muted)" }}>
          Certificación Desarrollo de IA · Trimestre 2 · Valcarce
        </span>
        <nav aria-label="Navegación del pie" className="flex gap-4 font-medium">
          <Link href="/" className="hover:opacity-70">
            Inicio
          </Link>
          <Link href="/productos" className="hover:opacity-70">
            Productos
          </Link>
        </nav>
        <span style={{ color: "var(--muted)" }}>© {new Date().getFullYear()} UPB Test</span>
      </div>
    </footer>
  );
}
