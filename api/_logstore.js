// Almacén del registro (compartido por /api/log y /api/state).
import { get, put, BlobPreconditionFailedError } from "@vercel/blob";

export const TZ = "Europe/Madrid";
export const monthOf = t => new Date(t).toLocaleString("sv-SE", { timeZone: TZ }).slice(0, 7);
export const okMonth = m => /^\d{4}-\d{2}$/.test(m || "");
const pathOf = m => `log/${m}.json`;
const cache = new Map();

export async function read(m, fresh) {
  const c = cache.get(m);
  if (!fresh && c && Date.now() - c.at < 1500) return c;
  const r = await get(pathOf(m), { access: "private", useCache: false, ...(c && c.etag ? { ifNoneMatch: c.etag } : {}) });
  let n;
  if (!r) n = { etag: null, rows: [], at: Date.now() };
  else if (r.statusCode === 304) n = { ...c, at: Date.now() };
  else n = { etag: String(r.blob.etag).replace(/^W\//, ""), rows: JSON.parse(await new Response(r.stream).text()), at: Date.now() };
  cache.set(m, n);
  return n;
}

export async function write(m, fn) {
  for (let i = 0; i < 6; i++) {
    const c = await read(m, true);
    if (i) cache.delete(m);
    const rows = fn(structuredClone(c.rows));
    if (rows === null) return c;
    try {
      const r = await put(pathOf(m), JSON.stringify(rows), {
        access: "private", contentType: "application/json", addRandomSuffix: false, cacheControlMaxAge: 60,
        ...(c.etag && i < 4 ? { ifMatch: c.etag } : { allowOverwrite: true })
      });
      const n = { etag: String(r.etag).replace(/^W\//, ""), rows, at: Date.now() };
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
export const KINDS = ["Post + historia", "Historia", "Post"];
export function clean(r, base = {}) {
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
export const newId = () => "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);


export async function addRow(row0, keep) {
  const row = clean(row0 || {});
  if (!row.at) row.at = Date.now();
  if (!row.by) throw new Error("Falta la persona");
  const m = monthOf(row.at);
  let id = null;
  await write(m, rows => {
    const i = row.aid ? rows.findIndex(x => x.aid === row.aid) : -1;
    if (i >= 0) { if (keep) return null; rows[i] = { ...rows[i], ...row }; id = rows[i].id; }
    else { id = newId(); rows.push({ id, kind: KINDS[0], title: "", link: "", acc: "", note: "", aid: 0, ...row }); }
    return rows;
  });
  return { id, m };
}
export async function removeAid(aid) {
  aid = +aid; if (!aid) return;
  const now = Date.now();
  for (const m of new Set([monthOf(now), monthOf(now - 864e5 * 31)]))
    await write(m, rows => { const n = rows.filter(x => x.aid !== aid); return n.length === rows.length ? null : n; });
}
