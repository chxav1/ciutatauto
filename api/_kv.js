// Almacén en Supabase (Postgres) con la misma interfaz get/put con versión (etag) que usábamos.
import postgres from "postgres";

export class BlobPreconditionFailedError extends Error {}

let sql = null, ready = null;
function db() {
  const url = process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;
  if (!url) throw new Error("Falta conectar la base de datos (Supabase)");
  if (!sql) sql = postgres(url.split("?")[0], { prepare: false, onnotice: () => {}, max: 3, idle_timeout: 20, connect_timeout: 10, ssl: /sslmode=disable/.test(url) ? false : { rejectUnauthorized: false } });
  if (!ready) ready = sql`create table if not exists cs_kv (k text primary key, d text not null, v text not null, updated_at timestamptz default now())`
    .then(() => sql`alter table cs_kv enable row level security`).catch(e => { ready = null; throw e; });
  return ready.then(() => sql);
}
// aviso instantáneo a todos los navegadores (Supabase Realtime, canal "ciutat")
async function ping(k) {
  const u = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!u || !key) return;
  try {
    await fetch(u.replace(/\/$/, "") + "/realtime/v1/api/broadcast", { method: "POST", signal: AbortSignal.timeout(2500),
      headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ messages: [{ topic: "ciutat", event: "change", payload: { k } }] }) });
  } catch {}
}
const nv = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export async function get(path, opts = {}) {
  const s = await db();
  const [r] = await s`select d, v from cs_kv where k = ${path}`;
  if (!r) return null;
  if (opts.ifNoneMatch && opts.ifNoneMatch === r.v) return { statusCode: 304 };
  return { statusCode: 200, blob: { etag: r.v }, stream: r.d };
}

export async function put(path, body, opts = {}) {
  const s = await db(), v = nv(), d = String(body);
  if (opts.ifMatch) {
    const u = await s`update cs_kv set d = ${d}, v = ${v}, updated_at = now() where k = ${path} and v = ${opts.ifMatch} returning k`;
    if (u.length) { await ping(path); return { etag: v }; }
    const [e] = await s`select 1 from cs_kv where k = ${path}`;
    if (e) throw new BlobPreconditionFailedError("cambió");
    const i = await s`insert into cs_kv (k, d, v) values (${path}, ${d}, ${v}) on conflict (k) do nothing returning k`;
    if (!i.length) throw new BlobPreconditionFailedError("cambió");
    await ping(path); return { etag: v };
  }
  await s`insert into cs_kv (k, d, v) values (${path}, ${d}, ${v}) on conflict (k) do update set d = excluded.d, v = excluded.v, updated_at = now()`;
  await ping(path); return { etag: v };
}
