import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import EstadoConexion from "@/components/EstadoConexion";
import ProductosApp from "@/components/ProductosApp";

export const metadata: Metadata = {
  title: "Productos · UPB Test",
  description: "Catálogo de productos: crear, leer, editar y eliminar.",
};

export default function ProductosPage() {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
        <p className="eyebrow">Gestión del catálogo</p>
        <h1 className="mt-3 text-3xl font-extrabold">Productos</h1>
        <p className="mt-2 max-w-2xl" style={{ color: "var(--muted)" }}>
          Cada acción se envía al backend Express a través de su API REST:
          <span className="font-mono text-sm"> GET/POST /api/productos</span> y
          <span className="font-mono text-sm"> PUT/DELETE /api/productos/:id</span>.
        </p>

        <div className="mt-8">
          <ProductosApp />
        </div>
      </main>

      <SiteFooter />
      <EstadoConexion />
    </>
  );
}
