// Post-build para `output: "export"` en Windows.
//
// Next 16.4.2 tiene un bug al exportar en Windows: los segmentos RSC se
// generan como directorios con puntos en el nombre (p. ej.
// `out/productos/__next.productos/__PAGE__.txt`) en vez del archivo plano
// que el cliente pide (`out/productos/__next.productos.__PAGE__.txt`).
// Motivo: collectSegmentPaths usa rutas con `\` y la conversión a nombre de
// archivo solo reemplaza `/` por `.`, así que el `\` restante crea directorios.
//
// Este script aplan esos directorios. En Linux/macOS no hay nada que hacer
// (Next ya exporta los archivos planos), por lo que es seguro en CI.
import { readdirSync, statSync, renameSync, rmSync, existsSync } from "node:fs";
import { join, dirname, sep } from "node:path";

const outDir = join(process.cwd(), "out");

if (!existsSync(outDir)) {
  console.warn("[fix-rsc-export] No existe la carpeta out/, nada que hacer.");
  process.exit(0);
}

// Devuelve true si alguna parte del path relativo es un directorio "__next.*"
function isSegmentDir(relPath) {
  return relPath.split(sep).some((part) => part.startsWith("__next."));
}

/** Aplana recursivamente los directorios "__next.*" dentro de `dir`. */
function flatten(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return 0;
  }
  let fixed = 0;
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith("__next.")) {
        // Mover todos los archivos (recursivos) del directorio "__next.*" al
        // padre, uniendo los segmentos de ruta con "." en el nombre.
        moveFilesUp(full, dir, entry.name);
        rmSync(full, { recursive: true, force: true });
        fixed += 1;
      } else {
        fixed += flatten(full);
      }
    }
  }
  return fixed;
}

function moveFilesUp(srcDir, destDir, namePrefix) {
  for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
    const src = join(srcDir, entry.name);
    if (entry.isDirectory()) {
      moveFilesUp(src, destDir, `${namePrefix}.${entry.name}`);
    } else {
      renameSync(src, join(destDir, `${namePrefix}.${entry.name}`));
    }
  }
}

const total = flatten(outDir);

if (total > 0) {
  // Verificación: el payload RSC de /productos debe existir ahora como archivo plano
  const expected = join(outDir, "productos", "__next.productos.__PAGE__.txt");
  if (!existsSync(expected)) {
    console.error(
      "[fix-rsc-export] Verificación falló: no se encontró " + expected,
    );
    process.exit(1);
  }
  console.log(`[fix-rsc-export] ${total} directorio(s) RSC aplanados ✅`);
} else {
  console.log("[fix-rsc-export] Nada que corregir (build no-Windows) ✅");
}
