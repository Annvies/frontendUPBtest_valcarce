import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import EstadoConexion from "@/components/EstadoConexion";
import ResumenCatalogo from "@/components/ResumenCatalogo";

const pasos = [
  {
    numero: "01",
    titulo: "Crear",
    descripcion:
      "Registra un producto con nombre, precio y stock desde un formulario con validación en tiempo real.",
    icono: "＋",
  },
  {
    numero: "02",
    titulo: "Editar",
    descripcion:
      "Actualiza cualquier producto del catálogo con actualización parcial: cambia solo lo que necesites.",
    icono: "✎",
  },
  {
    numero: "03",
    titulo: "Eliminar",
    descripcion:
      "Borra productos con confirmación previa y recibe el mensaje exacto del backend si algo falla.",
    icono: "✕",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <span aria-hidden="true" className="hero-glow hero-glow--one" />
          <span aria-hidden="true" className="hero-glow hero-glow--two" />

          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
            <div>
              <p className="eyebrow">Frontend + Backend conectados</p>
              <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
                Tu catálogo de productos,{" "}
                <span style={{ color: "var(--brand)" }}>listo para funcionar.</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed" style={{ color: "var(--muted)" }}>
                Esta aplicación fue creada desde cero con Next.js y desplegada en
                Firebase Hosting. Consume la API REST del backend Express + PostgreSQL
                para gestionar productos en tiempo real.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/productos" className="btn btn--primary">
                  Abrir catálogo <span aria-hidden="true">→</span>
                </Link>
                <ResumenCatalogo />
              </div>
            </div>

            <div className="card floaty relative mx-auto w-full max-w-sm p-6" role="img" aria-label="Vista ilustrativa del catálogo de productos">
              <div className="flex items-center justify-between">
                <span className="pill pill--ok">● API conectada</span>
                <span className="text-xs font-bold" style={{ color: "var(--muted)" }}>
                  /api/productos
                </span>
              </div>

              <ul className="mt-5 space-y-3">
                {[
                  { nombre: "Laptop Pro 14", precio: "$ 999.00", stock: 12 },
                  { nombre: "Mouse inalámbrico", precio: "$ 24.90", stock: 58 },
                  { nombre: "Teclado mecánico", precio: "$ 89.00", stock: 3 },
                ].map((p) => (
                  <li
                    key={p.nombre}
                    className="flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3"
                  >
                    <div>
                      <div className="text-sm font-bold">{p.nombre}</div>
                      <div className="text-xs" style={{ color: "var(--muted)" }}>
                        {p.precio}
                      </div>
                    </div>
                    <span
                      className={`pill ${p.stock > 10 ? "pill--ok" : p.stock > 5 ? "pill--warn" : "pill--low"}`}
                    >
                      {p.stock} uds.
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 text-center text-xs font-semibold" style={{ color: "var(--muted)" }}>
                GET · POST · PUT · DELETE — todo desde el navegador
              </div>
            </div>
          </div>
        </section>

        {/* Pasos */}
        <section className="mx-auto w-full max-w-6xl px-5 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow justify-center">Cómo funciona</p>
            <h2 className="mt-3 text-3xl font-extrabold">
              Un CRUD completo en tres pasos
            </h2>
            <p className="mt-3" style={{ color: "var(--muted)" }}>
              Cada acción del frontend se traduce en una petición HTTP real hacia el
              backend de la certificación.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {pasos.map((paso) => (
              <article key={paso.numero} className="card p-6">
                <div className="flex items-center justify-between">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold"
                    style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
                    aria-hidden="true"
                  >
                    {paso.icono}
                  </span>
                  <span className="text-sm font-extrabold" style={{ color: "var(--border)" }}>
                    {paso.numero}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold">{paso.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {paso.descripcion}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/productos" className="btn btn--soft">
              Probar el catálogo ahora <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
      <EstadoConexion />
    </>
  );
}
