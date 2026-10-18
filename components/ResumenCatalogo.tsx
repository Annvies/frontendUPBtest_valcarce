"use client";

import { useEffect, useState } from "react";
import { hayApiConfigurada, listarProductos } from "@/lib/api";

type Estado = "cargando" | "ok" | "error";

// Contador en vivo del catálogo: consume GET /api/productos del backend
export default function ResumenCatalogo() {
  const [estado, setEstado] = useState<Estado>(hayApiConfigurada() ? "cargando" : "error");
  const [total, setTotal] = useState(0);
  const [stock, setStock] = useState(0);

  useEffect(() => {
    if (!hayApiConfigurada()) return;
    listarProductos()
      .then((productos) => {
        setTotal(productos.length);
        setStock(productos.reduce((suma, p) => suma + p.stock, 0));
        setEstado("ok");
      })
      .catch(() => setEstado("error"));
  }, []);

  if (estado === "cargando") {
    return (
      <span className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
        Consultando catálogo…
      </span>
    );
  }

  if (estado === "error") {
    return (
      <span className="text-sm font-semibold" style={{ color: "var(--warning)" }}>
        Backend no disponible
      </span>
    );
  }

  return (
    <div className="flex gap-6">
      <div>
        <div className="text-2xl font-extrabold">{total}</div>
        <div className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
          productos
        </div>
      </div>
      <div>
        <div className="text-2xl font-extrabold">{stock}</div>
        <div className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
          unidades en stock
        </div>
      </div>
    </div>
  );
}
