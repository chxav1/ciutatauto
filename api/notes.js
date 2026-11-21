// Notas del equipo (tareas, avisos, ideas). Un único archivo notes.json en Vercel Blob privado.
import { get, put, BlobPreconditionFailedError } from "@vercel/blob";

const PATH = "notes.json";
let cache = { etag: null, rows: [], at: 0 };
const strip = e => String(e || "").replace(/^W\//, "");

async function read(fresh) {
  if (!fresh && Date.now() - cache.at < 1500) return cache;
  const r = await get(PATH, { access: "private", useCache: false, ...(cache.etag && !fresh ? { ifNoneMatch: cache.etag } : {}) });
  if (!r) cache = { etag: null, rows: [], at: Date.now() };
  else if (r.statusCode === 304) cache.at = Date.now();
  else cache = { etag: strip(r.blob.etag), rows: JSON.parse(await new Response(r.stream).text()), at: Date.now() };
  return cache;
}
async function write(fn) {
  for (let i = 0; i < 6; i++) {
    const c = await read(true), rows = fn(structuredClone(c.rows));
    try {
      const r = await put(PATH, JSON.stringify(rows), { access: "private", contentType: "application/json", addRandomSuffix: false, cacheControlMaxAge: 60,
        ...(c.etag && i < 4 ? { ifMatch: c.etag } : { allowOverwrite: true }) });
      cache = { etag: strip(r.etag), rows, at: Date.now() };
      return cache;
    } catch (e) { if (e instanceof BlobPreconditionFailedError) continue; throw e; }
  }
  throw new Error("No se pudo guardar, prueba otra vez");
}

const TYPES = ["tarea", "aviso", "idea"];
const str = (v, n) => String(v ?? "").trim().slice(0, n);
function clean(n) {
  const o = {};
  if ("text" in n) o.text = str(n.text, 1000);
  if ("type" in n) o.type = TYPES.includes(n.type) ? n.type : "tarea";
  if ("to" in n) o.to = str(n.to, 40);               // "" = todo el equipo
  if ("due" in n) o.due = +n.due > 1e12 ? +n.due : 0; // fecha/hora límite (opcional)
  if ("pin" in n) o.pin = !!n.pin;
  if ("link" in n) o.link = /^https?:\/\//.test(n.link || "") ? str(n.link, 500) : "";
  if ("ltitle" in n) o.ltitle = str(n.ltitle, 200);
  return o;
}
const out = (c, extra = {}) => Response.json({ v: c.etag, notes: c.rows, ...extra }, { headers: { "cache-control": "no-store" } });

export async function GET(request) {
  try {
    const v = new URL(request.url).searchParams.get("v"), c = await read(false);
    if (v && c.etag && v === c.etag) return Response.json({ v, same: true }, { headers: { "cache-control": "no-store" } });
    return out(c);
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function POST(request) {
  let op;
  try { op = await request.json(); } catch { return Response.json({ error: "JSON no válido" }, { status: 400 }); }
  try {
    const by = str(op.by, 40);
    if (!by) throw new Error("Elige un perfil primero");
    let c;
    if (op.type === "add") {
      const n = clean(op.note || {});
      if (!n.text) throw new Error("La nota está vacía");
      c = await write(rows => {
        rows.push({ id: "n" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), type: "tarea", to: "", due: 0, pin: false, link: "", ltitle: "", ...n, by, at: Date.now(), done: null });
        // limpieza: hechas de hace más de 60 días y máximo 600 notas
        const lim = Date.now() - 864e5 * 60;
        return rows.filter(r => !r.done || r.done.at > lim).slice(-600);
      });
    } else if (op.type === "update") {
      const p = clean(op.patch || {});
      c = await write(rows => { const r = rows.find(x => x.id === op.id); if (!r) throw new Error("Esa nota ya no existe"); Object.assign(r, p, { edited: Date.now() }); return rows; });
    } else if (op.type === "done") {
      c = await write(rows => { const r = rows.find(x => x.id === op.id); if (!r) throw new Error("Esa nota ya no existe"); r.done = op.on ? { by, at: Date.now() } : null; return rows; });
    } else if (op.type === "delete") {
      c = await write(rows => rows.filter(x => x.id !== op.id));
    } else throw new Error("Operación no válida");
    return out(c);
  } catch (e) { return Response.json({ error: e.message }, { status: 400 }); }
}
