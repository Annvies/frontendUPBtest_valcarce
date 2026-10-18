// Cliente HTTP tipado para el backend Express + PostgreSQL (backendUpbtest_valcarce)
// Endpoints: /api/productos (CRUD) y / (health check)

const API = process.env.NEXT_PUBLIC_API_URL;

export type Producto = {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  createdAt: string | null;
};

export type ProductoInput = {
  nombre: string;
  precio: number;
  stock: number;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getApiUrl(): string | undefined {
  return API;
}

export function hayApiConfigurada(): boolean {
  return Boolean(API);
}

// El backend responde errores como { error: string }
async function manejarRespuesta<T>(res: Response): Promise<T> {
  if (res.ok) {
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }
  let mensaje = `Error ${res.status}`;
  try {
    const cuerpo = (await res.json()) as { error?: string };
    if (cuerpo?.error) mensaje = cuerpo.error;
  } catch {
    // respuesta sin cuerpo JSON
  }
  throw new ApiError(res.status, mensaje);
}

function exigirApi(): string {
  if (!API) {
    throw new ApiError(
      0,
      "NEXT_PUBLIC_API_URL no definida (crea .env.local con la URL del backend)",
    );
  }
  return API;
}

export async function listarProductos(): Promise<Producto[]> {
  const res = await fetch(`${exigirApi()}/api/productos`, { cache: "no-store" });
  return manejarRespuesta<Producto[]>(res);
}

export async function obtenerProducto(id: number): Promise<Producto> {
  const res = await fetch(`${exigirApi()}/api/productos/${id}`, {
    cache: "no-store",
  });
  return manejarRespuesta<Producto>(res);
}

export async function crearProducto(datos: ProductoInput): Promise<Producto> {
  const res = await fetch(`${exigirApi()}/api/productos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return manejarRespuesta<Producto>(res);
}

export async function actualizarProducto(
  id: number,
  datos: Partial<ProductoInput>,
): Promise<Producto> {
  const res = await fetch(`${exigirApi()}/api/productos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return manejarRespuesta<Producto>(res);
}

export async function eliminarProducto(id: number): Promise<void> {
  const res = await fetch(`${exigirApi()}/api/productos/${id}`, {
    method: "DELETE",
  });
  return manejarRespuesta<void>(res);
}

export function formatearPrecio(valor: number): string {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(valor);
}
