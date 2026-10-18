"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  Producto,
  ProductoInput,
  crearProducto,
  eliminarProducto,
  formatearPrecio,
  getApiUrl,
  hayApiConfigurada,
  listarProductos,
  actualizarProducto,
} from "@/lib/api";

type Estado = "cargando" | "ok" | "error";

const STOCK_MINIMO = 5;

const vacio = (): ProductoInput => ({ nombre: "", precio: 0, stock: 0 });

// Valida en el cliente con las mismas reglas del DTO del backend
function validar(datos: ProductoInput): string[] {
  const errores: string[] = [];
  if (!datos.nombre.trim()) errores.push('El "nombre" es obligatorio');
  else if (datos.nombre.trim().length > 100) errores.push('El "nombre" no puede superar 100 caracteres');
  if (datos.precio < 0) errores.push('El "precio" debe ser mayor o igual a 0');
  if (!Number.isInteger(datos.stock) || datos.stock < 0) errores.push('El "stock" debe ser un entero mayor o igual a 0');
  return errores;
}

export default function ProductosApp() {
  const sinApi = !hayApiConfigurada();
  const [estado, setEstado] = useState<Estado>(sinApi ? "error" : "cargando");
  const [error, setError] = useState<string | undefined>(
    sinApi ? "NEXT_PUBLIC_API_URL no definida (crea .env.local)" : undefined,
  );
  const [productos, setProductos] = useState<Producto[]>([]);

  const [busqueda, setBusqueda] = useState("");
  const [creando, setCreando] = useState(false);
  const [formulario, setFormulario] = useState<ProductoInput>(vacio());
  const [erroresForm, setErroresForm] = useState<string[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [borrandoId, setBorrandoId] = useState<number | null>(null);
  const [aviso, setAviso] = useState<string | undefined>(undefined);

  const cargar = useCallback(async () => {
    if (!hayApiConfigurada()) return;
    setEstado("cargando");
    setError(undefined);
    try {
      const datos = await listarProductos();
      setProductos(datos);
      setEstado("ok");
    } catch (err) {
      setEstado("error");
      setError(err instanceof ApiError ? err.message : String(err));
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      cargar();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [cargar]);

  const mostrarAviso = (mensaje: string, ms = 2600) => {
    setAviso(mensaje);
    window.setTimeout(() => setAviso(undefined), ms);
  };

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return productos;
    return productos.filter((p) => p.nombre.toLowerCase().includes(texto));
  }, [productos, busqueda]);

  // ---------- Crear ----------
  const abrirFormulario = () => {
    setFormulario(vacio());
    setErroresForm([]);
    setCreando(true);
    setEditandoId(null);
  };

  const enviarFormulario = async (event: FormEvent) => {
    event.preventDefault();
    const erroresCliente = validar(formulario);
    if (erroresCliente.length > 0) {
      setErroresForm(erroresCliente);
      return;
    }
    try {
      const creado = await crearProducto({
        nombre: formulario.nombre.trim(),
        precio: formulario.precio,
        stock: formulario.stock,
      });
      setProductos((prev) => [...prev, creado]);
      setCreando(false);
      setErroresForm([]);
      mostrarAviso(`Producto "${creado.nombre}" creado ✓`);
    } catch (err) {
      setErroresForm([err instanceof ApiError ? err.message : String(err)]);
    }
  };

  // ---------- Editar ----------
  const abrirEdicion = (producto: Producto) => {
    setEditandoId(producto.id);
    setCreando(false);
    setErroresForm([]);
    setFormulario({
      nombre: producto.nombre,
      precio: producto.precio,
      stock: producto.stock,
    });
  };

  const guardarEdicion = async (event: FormEvent) => {
    event.preventDefault();
    if (editandoId === null) return;
    const erroresCliente = validar(formulario);
    if (erroresCliente.length > 0) {
      setErroresForm(erroresCliente);
      return;
    }
    try {
      const actualizado = await actualizarProducto(editandoId, {
        nombre: formulario.nombre.trim(),
        precio: formulario.precio,
        stock: formulario.stock,
      });
      setProductos((prev) => prev.map((p) => (p.id === actualizado.id ? actualizado : p)));
      setEditandoId(null);
      setErroresForm([]);
      mostrarAviso("Producto actualizado ✓");
    } catch (err) {
      setErroresForm([err instanceof ApiError ? err.message : String(err)]);
    }
  };

  // ---------- Eliminar ----------
  const confirmarEliminacion = async (producto: Producto) => {
    setBorrandoId(producto.id);
    try {
      await eliminarProducto(producto.id);
      setProductos((prev) => prev.filter((p) => p.id !== producto.id));
      mostrarAviso(`Producto "${producto.nombre}" eliminado ✓`);
    } catch (err) {
      mostrarAviso(err instanceof ApiError ? err.message : String(err), 4000);
    } finally {
      setBorrandoId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Barra de acciones */}
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <div className="field min-w-[220px] flex-1">
          <label htmlFor="buscar">Buscar por nombre</label>
          <input
            id="buscar"
            className="input"
            type="search"
            placeholder="Ejemplo: laptop…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <button type="button" className="btn btn--ghost btn--sm" onClick={cargar} disabled={estado === "cargando"}>
          ↻ Recargar
        </button>
        <button type="button" className="btn btn--primary" onClick={abrirFormulario} disabled={sinApi}>
          ＋ Nuevo producto
        </button>
      </div>

      {/* Aviso flotante */}
      {aviso && (
        <div
          role="status"
          className="pill pill--ok fixed top-20 left-1/2 z-50 -translate-x-1/2 px-4 py-2 text-sm"
          style={{ boxShadow: "0 10px 24px -12px rgba(0,0,0,.4)" }}
        >
          {aviso}
        </div>
      )}

      {/* Formulario crear / editar */}
      {creando && (
        <form onSubmit={enviarFormulario} className="card p-5" noValidate>
          <h2 className="text-lg font-bold">Nuevo producto</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="field sm:col-span-3">
              <label htmlFor="nombre">Nombre *</label>
              <input
                id="nombre"
                className="input"
                maxLength={100}
                placeholder="Nombre del producto"
                value={formulario.nombre}
                onChange={(e) => setFormulario((f) => ({ ...f, nombre: e.target.value }))}
              />
            </div>
            <div className="field">
              <label htmlFor="precio">Precio (USD)</label>
              <input
                id="precio"
                className="input"
                type="number"
                min={0}
                step="0.01"
                value={formulario.precio}
                onChange={(e) => setFormulario((f) => ({ ...f, precio: Number(e.target.value) }))}
              />
            </div>
            <div className="field">
              <label htmlFor="stock">Stock (unidades)</label>
              <input
                id="stock"
                className="input"
                type="number"
                min={0}
                step={1}
                value={formulario.stock}
                onChange={(e) => setFormulario((f) => ({ ...f, stock: Number(e.target.value) }))}
              />
            </div>
          </div>

          {erroresForm.length > 0 && (
            <ul className="mt-3 text-sm font-semibold" style={{ color: "var(--danger)" }}>
              {erroresForm.map((e) => (
                <li key={e}>⚠ {e}</li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex gap-3">
            <button type="submit" className="btn btn--primary btn--sm">
              Guardar producto
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setCreando(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Estados de carga / error */}
      {estado === "cargando" && (
        <div className="card p-10 text-center font-semibold" style={{ color: "var(--muted)" }}>
          Cargando productos…
        </div>
      )}

      {estado === "error" && (
        <div className="card p-10 text-center">
          <div className="text-lg font-bold" style={{ color: "var(--danger)" }}>
            No se pudo conectar con el backend
          </div>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
            {error}
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
            API: {getApiUrl() ?? "no definida"}
          </p>
          <button type="button" className="btn btn--soft btn--sm mt-4" onClick={cargar}>
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla de productos */}
      {estado === "ok" && (
        <div className="card overflow-x-auto">
          {productosFiltrados.length === 0 ? (
            <div className="p-10 text-center font-semibold" style={{ color: "var(--muted)" }}>
              {productos.length === 0
                ? "Aún no hay productos. ¡Crea el primero!"
                : `Ningún producto coincide con "${busqueda}".`}
            </div>
          ) : (
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr
                  className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide"
                  style={{ color: "var(--muted)" }}
                >
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3 text-right">Precio</th>
                  <th className="px-4 py-3 text-center">Stock</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((producto) => (
                  <tr key={producto.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--muted)" }}>
                      #{producto.id}
                    </td>
                    <td className="px-4 py-3 font-semibold">{producto.nombre}</td>
                    <td className="px-4 py-3 text-right font-mono">
                      {formatearPrecio(producto.precio)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`pill ${producto.stock > STOCK_MINIMO ? "pill--ok" : producto.stock > 0 ? "pill--warn" : "pill--low"}`}
                      >
                        {producto.stock} uds.
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="btn btn--soft btn--sm"
                          onClick={() => abrirEdicion(producto)}
                          disabled={editandoId === producto.id}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn--danger btn--sm"
                          onClick={() => confirmarEliminacion(producto)}
                          disabled={borrandoId === producto.id}
                        >
                          {borrandoId === producto.id ? "Borrando…" : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Formulario de edición en línea */}
      {editandoId !== null && (
        <form onSubmit={guardarEdicion} className="card p-5" noValidate>
          <h2 className="text-lg font-bold">
            Editar producto <span className="font-mono text-sm">#{editandoId}</span>
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="field sm:col-span-3">
              <label htmlFor="editar-nombre">Nombre *</label>
              <input
                id="editar-nombre"
                className="input"
                maxLength={100}
                value={formulario.nombre}
                onChange={(e) => setFormulario((f) => ({ ...f, nombre: e.target.value }))}
              />
            </div>
            <div className="field">
              <label htmlFor="editar-precio">Precio (USD)</label>
              <input
                id="editar-precio"
                className="input"
                type="number"
                min={0}
                step="0.01"
                value={formulario.precio}
                onChange={(e) => setFormulario((f) => ({ ...f, precio: Number(e.target.value) }))}
              />
            </div>
            <div className="field">
              <label htmlFor="editar-stock">Stock (unidades)</label>
              <input
                id="editar-stock"
                className="input"
                type="number"
                min={0}
                step={1}
                value={formulario.stock}
                onChange={(e) => setFormulario((f) => ({ ...f, stock: Number(e.target.value) }))}
              />
            </div>
          </div>

          {erroresForm.length > 0 && (
            <ul className="mt-3 text-sm font-semibold" style={{ color: "var(--danger)" }}>
              {erroresForm.map((e) => (
                <li key={e}>⚠ {e}</li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex gap-3">
            <button type="submit" className="btn btn--primary btn--sm">
              Guardar cambios
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditandoId(null)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Pie de información */}
      {estado === "ok" && (
        <p className="text-center text-xs" style={{ color: "var(--muted)" }}>
          {productosFiltrados.length} de {productos.length} productos · API:{" "}
          {getApiUrl() ?? "no definida"}
        </p>
      )}
    </div>
  );
}
