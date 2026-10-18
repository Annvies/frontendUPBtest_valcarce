"use client";

import { useCallback, useEffect, useState } from "react";
import { getApiUrl, hayApiConfigurada } from "@/lib/api";

type Estado = "cargando" | "ok" | "error";

function Item({ label, estado, detalle }: { label: string; estado: Estado; detalle?: string }) {
  const color =
    estado === "ok" ? "var(--success)" : estado === "error" ? "var(--danger)" : "var(--warning)";
  const icono = estado === "ok" ? "✅" : estado === "error" ? "❌" : "⏳";
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span aria-hidden="true">{icono}</span>
      <span className="w-[110px] font-semibold">{label}</span>
      <span style={{ color }}>
        {estado === "cargando" ? "Verificando…" : estado === "ok" ? "Conectado" : `Error: ${detalle ?? ""}`}
      </span>
    </div>
  );
}

// Panel flotante que verifica el backend (GET /) y la base de datos (GET /api/productos)
export default function EstadoConexion() {
  const sinApi = !hayApiConfigurada();
  const [backend, setBackend] = useState<Estado>(sinApi ? "error" : "cargando");
  const [db, setDb] = useState<Estado>(sinApi ? "error" : "cargando");
  const [detalleDb, setDetalleDb] = useState<string | undefined>(
    sinApi ? "NEXT_PUBLIC_API_URL no definida" : undefined,
  );
  const [abierto, setAbierto] = useState(false);
  const [probando, setProbando] = useState(false);

  const consultar = useCallback(() => {
    const API = getApiUrl();
    if (!API) return;

    fetch(`${API}/`)
      .then((r) => (r.ok ? setBackend("ok") : Promise.reject(r.status)))
      .catch(() => setBackend("error"));

    fetch(`${API}/api/productos`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(() => setDb("ok"))
      .catch((err) => {
        setDb("error");
        setDetalleDb(String(err));
      });
  }, []);

  useEffect(() => {
    consultar();
  }, [consultar]);

  const reintentar = () => {
    setProbando(true);
    setBackend("cargando");
    setDb("cargando");
    setDetalleDb(undefined);
    consultar();
    window.setTimeout(() => setProbando(false), 600);
  };

  return (
    <div className="fixed right-4 bottom-4 z-50">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-label="Mostrar estado de conexión"
        className="btn btn--primary btn--sm"
        style={{ boxShadow: "0 10px 24px -10px rgba(0,0,0,.5)" }}
      >
        🔗 {abierto ? "Ocultar" : "Estado"}
      </button>

      {abierto && (
        <div
          className="card absolute right-0 bottom-12 max-w-[320px] p-4 text-sm"
          style={{ boxShadow: "0 12px 32px -12px rgba(0,0,0,.45)" }}
        >
          <div className="mb-1 font-bold">Estado de conexión</div>
          <Item label="Frontend" estado="ok" />
          <Item label="Backend" estado={backend} />
          <Item label="Base de datos" estado={db} detalle={detalleDb} />

          <button
            type="button"
            onClick={reintentar}
            disabled={probando}
            className="btn btn--soft btn--sm mt-2 w-full"
          >
            {probando ? "Probando…" : "Probar conexión"}
          </button>

          <div className="mt-2 text-[11px]" style={{ color: "var(--muted)" }}>
            API: {getApiUrl() ?? "no definida"}
          </div>
        </div>
      )}
    </div>
  );
}
