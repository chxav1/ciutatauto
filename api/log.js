// Registro de publicaciones: un archivo por mes (log/AAAA-MM.json) en Vercel Blob privado.
import { get, put, BlobPreconditionFailedError } from "@vercel/blob";

const TZ = "Europe/Madrid";
const monthOf = t => new Date(t).toLocaleString("sv-SE", { timeZone: TZ }).slice(0, 7);
const okMonth = m => /^\d{4}-\d{2}$/.test(m || "");
const pathOf = m => `log/${m}.json`;
const cache = new Map();

async function read(m, fresh) {
  const c = cache.get(m);
  if (!fresh && c && Date.now() - c.at < 1500) return c;
  const r = await get(pathOf(m), { access: "private", useCache: false, ...(c && c.etag ? { ifNoneMatch: c.etag } : {}) });
  let n;
  if (!r) n = { etag: null, rows: [], at: Date.now() };
  else if (r.statusCode === 304) n = { ...c, at: Date.now() };
  else n = { etag: r.blob.etag, rows: JSON.parse(await new Response(r.stream).text()), at: Date.now() };
  cache.set(m, n);
  return n;
}

async function write(m, fn) {
  for (let i = 0; i < 6; i++) {
    const c = await read(m, true);
    const rows = fn(structuredClone(c.rows));
    if (rows === null) return c;
    try {
      const r = await put(pathOf(m), JSON.stringify(rows), {
        access: "private", contentType: "application/json", addRandomSuffix: false, cacheControlMaxAge: 60,
        ...(c.etag ? { ifMatch: c.etag } : { allowOverwrite: true })
      });
      const n = { etag: r.etag, rows, at: Date.now() };
      cache.set(m, n);
      return n;
    } catch (e) {
      if (e instanceof BlobPreconditionFailedError) continue;
      throw e;
    }
  }
  throw new Error("Mucha actividad a la vez, prueba otra vez");
}

const str = (v, n) => String(v ?? "").trim().slice(0, n);
const KINDS = ["Post + historia", "Historia", "Post"];
function clean(r, base = {}) {
  const o = { ...base };
  if ("title" in r) o.title = str(r.title, 300);
  if ("link" in r) o.link = /^https?:\/\//.test(r.link || "") ? str(r.link, 500) : "";
  if ("acc" in r) o.acc = str(r.acc, 60);
  if ("by" in r) o.by = str(r.by, 40);
  if ("note" in r) o.note = str(r.note, 300);
  if ("kind" in r) o.kind = KINDS.includes(r.kind) ? r.kind : KINDS[0];
  if ("at" in r) { const t = +r.at; if (t > 1e12 && t < Date.now() + 864e5 * 400) o.at = t; }
  if ("aid" in r) o.aid = +r.aid || 0;
  return o;
}
const newId = () => "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export async function GET(request) {
  try {
    const ms = (new URL(request.url).searchParams.get("m") || "").split(",").filter(okMonth).slice(0, 13);
    const out = {};
    for (const m of ms) { const c = await read(m, false); out[m] = { v: c.etag, rows: c.rows }; }
    return Response.json(out, { headers: { "cache-control": "no-store" } });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function POST(request) {
  let op;
  try { op = await request.json(); } catch { return Response.json({ error: "JSON no válido" }, { status: 400 }); }
  try {
    if (op.type === "add") {
      // alta automática (al marcar) o manual; si ya existe la misma noticia ese mes, se actualiza
      const row = clean(op.row || {});
      if (!row.at) row.at = Date.now();
      if (!row.by) throw new Error("Falta la persona");
      const m = monthOf(row.at);
      let id = null;
      await write(m, rows => {
        const i = row.aid ? rows.findIndex(x => x.aid === row.aid) : -1;
        if (i >= 0) { if (op.keep) return null; rows[i] = { ...rows[i], ...row }; id = rows[i].id; }
        else { id = newId(); rows.push({ id, kind: KINDS[0], title: "", link: "", acc: "", note: "", aid: 0, ...row }); }
        return rows;
      });
      return Response.json({ ok: true, id, m });
    }
    if (op.type === "removeAid") {
      const aid = +op.aid; if (!aid) throw new Error("Artículo no válido");
      const now = Date.now();
      for (const m of new Set([monthOf(now), monthOf(now - 864e5 * 31)]))
        await write(m, rows => { const n = rows.filter(x => x.aid !== aid); return n.length === rows.length ? null : n; });
      return Response.json({ ok: true });
    }
    if (op.type === "update") {
      if (!okMonth(op.m)) throw new Error("Mes no válido");
      const patch = clean(op.patch || {});
      let moved = null;
      await write(op.m, rows => {
        const i = rows.findIndex(x => x.id === op.id); if (i < 0) throw new Error("Esa fila ya no existe");
        const r = { ...rows[i], ...patch };
        if (monthOf(r.at) !== op.m) { moved = r; rows.splice(i, 1); } else rows[i] = r;
        return rows;
      });
      if (moved) await write(monthOf(moved.at), rows => (rows.push(moved), rows));
      return Response.json({ ok: true });
    }
    if (op.type === "delete") {
      if (!okMonth(op.m)) throw new Error("Mes no válido");
      await write(op.m, rows => rows.filter(x => x.id !== op.id));
      return Response.json({ ok: true });
    }
    throw new Error("Operación no válida");
  } catch (e) { return Response.json({ error: e.message }, { status: 400 }); }
}
