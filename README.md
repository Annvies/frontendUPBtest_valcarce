# UPB Test — Frontend propio (Next.js + Firebase Hosting)

Frontend creado desde cero para la certificación de **Desarrollo de IA (Trimestre 2, Valcarce)**.

Consume la API REST del backend `backendUpbtest_valcarce` (Express + PostgreSQL) para
gestionar un catálogo de productos.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4**
- **Export estático** (`output: "export"`) para desplegar en **Firebase Hosting**

## Endpoints consumidos

| Método | Ruta                    | Acción                    |
| ------ | ----------------------- | ------------------------- |
| GET    | `/`                     | Health check del backend  |
| GET    | `/api/productos`        | Listar productos          |
| GET    | `/api/productos/:id`    | Obtener un producto       |
| POST   | `/api/productos`        | Crear `{nombre, precio, stock}` |
| PUT    | `/api/productos/:id`    | Actualizar (parcial)      |
| DELETE | `/api/productos/:id`    | Eliminar                  |

## Configuración

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Define la URL del backend en `.env.local` (desarrollo):

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

   En producción se usa `.env.production`:

   ```env
   NEXT_PUBLIC_API_URL=https://backendupbtest-valcarce.onrender.com
   ```

   Referencia: `.env.example`.

## Desarrollo

```bash
npm run dev
```

Abre <http://localhost:3001> (el backend ocupa el puerto 3000).

## Build y despliegue en Firebase Hosting

```bash
npm run build          # genera la carpeta `out/`
firebase deploy --only hosting
```

La configuración de hosting vive en `firebase.json` (directorio público `out`,
rewrite de SPA a `/index.html`).

## Estructura

```
app/
  layout.tsx            Layout raíz (fuentes, metadata)
  page.tsx              Landing con hero, pasos y resumen en vivo
  productos/page.tsx    Página del CRUD de productos
  globals.css           Sistema de diseño (tema, botones, tarjetas)
components/
  SiteHeader.tsx        Cabecera compartida
  SiteFooter.tsx        Pie compartido
  ProductosApp.tsx      CRUD completo (listar/crear/editar/eliminar)
  EstadoConexion.tsx    Panel flotante de estado frontend/backend/DB
  ResumenCatalogo.tsx   Contador en vivo del catálogo
lib/
  api.ts                Cliente HTTP tipado del backend
```
