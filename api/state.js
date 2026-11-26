// Estado compartido del equipo: perfiles y noticias hechas. Se guarda en Vercel Blob (privado).
import { get, put, BlobPreconditionFailedError } from "./_kv.js";
import { addRow, removeAid } from "./_logstore.js";

const PATH = "state.json";
const EMPTY = { profiles: [], marks: {} };
let cache = { etag: null, data: EMPTY, at: 0 };

async function read(fresh) {
  if (!fresh && Date.now() - cache.at < 5000) return cache;
  const r = await get(PATH, { access: "private", useCache: false, ...(cache.etag ? { ifNoneMatch: cache.etag } : {}) });
  if (!r) cache = { etag: null, data: EMPTY, at: Date.now() };
  else if (r.statusCode === 304) cache.at = Date.now();
  else cache = { etag: String(r.blob.etag).replace(/^W\//, ""), data: JSON.parse(await new Response(r.stream).text()), at: Date.now() };
  return cache;
}

// distancia de color perceptual aproximada (redmean)
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
function dist(a, b) {
  const [r1, g1, b1] = rgb(a), [r2, g2, b2] = rgb(b), rm = (r1 + r2) / 2;
  return Math.sqrt((2 + rm / 256) * (r1 - r2) ** 2 + 4 * (g1 - g2) ** 2 + (2 + (255 - rm) / 256) * (b1 - b2) ** 2);
}
const MIN_DIST = 90;

function apply(s, op) {
  const d = structuredClone(s);
  if (op.type === "profile") {
    const p = op.profile || {};
    const name = String(p.name || "").trim().slice(0, 24);
    if (!name) throw new Error("Falta el nombre");
    if (!/^#[0-9a-f]{6}$/i.test(p.color || "")) throw new Error("Color no válido");
    const lang = p.lang === "ca" ? "ca" : "es";
    const others = d.profiles.filter(x => x.id !== p.id);
    if (others.some(x => x.name.toLowerCase() === name.toLowerCase())) throw new Error("Ese nombre ya existe");
    if (others.some(x => dist(x.color, p.color) < MIN_DIST)) throw new Error("Ese color ya lo usa otra persona o es muy parecido");
    const i = d.profiles.findIndex(x => x.id === p.id);
    const emo = String(p.emoji || "").trim();
    const emoji = /^img:[a-z-]{1,20}$/.test(emo) || (emo && [...emo].length <= 8 && /\p{Extended_Pictographic}/u.test(emo)) ? emo : "";
    if (emoji && others.some(x => x.emoji === emoji)) throw new Error("Ese emoji ya lo usa otra persona");
    const np = { id: p.id && i >= 0 ? p.id : "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name, color: p.color.toLowerCase(), lang, emoji };
    if (i >= 0) d.profiles[i] = { ...d.profiles[i], ...np }; else d.profiles.push({ ...np, created: Date.now() });
    d._last = np.id;
  } else if (op.type === "deleteProfile") {
    d.profiles = d.profiles.filter(x => x.id !== op.id);
  } else if (op.type === "mark") {
    const id = String(Number(op.id));
    if (!+id) throw new Error("Artículo no válido");
    if (op.on) d.marks[id] = { by: op.by, at: Date.now() }; else delete d.marks[id];
    const keys = Object.keys(d.marks);
    if (keys.length > 3000) keys.sort((a, b) => d.marks[a].at - d.marks[b].at).slice(0, keys.length - 3000).forEach(k => delete d.marks[k]);
  } else if (op.type === "restore") {
    // recupera perfiles y hechas guardados en el navegador si la base de datos está vacía
    if (d.profiles.length) return d;
    const P = Array.isArray(op.profiles) ? op.profiles.slice(0, 60) : [];
    d.profiles = P.filter(p => p && p.id && p.name).map(p => ({ id: String(p.id).slice(0, 40), name: String(p.name).slice(0, 24), color: String(p.color || "#E5007E").slice(0, 9), lang: p.lang == "es" ? "es" : "ca", emoji: String(p.emoji || "").slice(0, 40) }));
    if (op.marks && typeof op.marks == "object") for (const [k, m] of Object.entries(op.marks).slice(-3000)) if (+k && m && !d.marks[k]) d.marks[k] = { by: String(m.by || ""), at: +m.at || Date.now() };
  } else throw new Error("Operación no válida");
  return d;
}

const out = (c, extra = {}) => Response.json({ v: c.etag, profiles: c.data.profiles, marks: c.data.marks, ...extra }, { headers: { "cache-control": "no-store" } });

export async function GET(request) {
  try {
    const v = new URL(request.url).searchParams.get("v");
    const c = await read(false);
    if (v && c.etag && v === c.etag) return Response.json({ v, same: true }, { headers: { "cache-control": "no-store" } });
    return out(c);
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function POST(request) {
  let op;
  try { op = await request.json(); } catch { return Response.json({ error: "JSON no válido" }, { status: 400 }); }
  for (let i = 0; i < 6; i++) {
    try {
      const c = await read(true);
      const next = apply(c.data, op);
      const last = next._last; delete next._last;
      const r = await put(PATH, JSON.stringify(next), {
        access: "private", contentType: "application/json", addRandomSuffix: false, cacheControlMaxAge: 60,
        ...(c.etag && i < 4 ? { ifMatch: c.etag } : { allowOverwrite: true })
      });
      cache = { etag: String(r.etag).replace(/^W\//, ""), data: next, at: Date.now() };
      if (op.type === "mark") {
        // el registro se actualiza en el servidor a la vez que la marca
        try {
          const had = !!c.data.marks[String(Number(op.id))], has = !!next.marks[String(Number(op.id))];
          if (has && !had) await addRow({ ...(op.meta || {}), aid: Number(op.id), by: op.by, at: next.marks[String(Number(op.id))].at });
          else if (!has && had) await removeAid(op.id);
        } catch (e) { console.error("registro", e.message); }
      }
      return out(cache, last ? { id: last } : {});
    } catch (e) {
      if (e instanceof BlobPreconditionFailedError) { cache.at = 0; continue; }
      return Response.json({ error: e.message }, { status: 400 });
    }
  }
  return Response.json({ error: "Mucha actividad a la vez, prueba otra vez" }, { status: 409 });
}
