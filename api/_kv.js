// Almacén en Upstash Redis con la misma interfaz que usábamos de Vercel Blob (get/put con etag).
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export class BlobPreconditionFailedError extends Error {}

async function cmd(args) {
  if (!URL_ || !TOKEN) throw new Error("Falta conectar la base de datos (Upstash)");
  const r = await fetch(URL_, { method: "POST", headers: { authorization: `Bearer ${TOKEN}`, "content-type": "application/json" }, body: JSON.stringify(args) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(j.error || `Base de datos: ${r.status}`);
  return j.result;
}
const key = p => "cs:" + p;

export async function get(path, opts = {}) {
  const [data, v] = (await cmd(["HMGET", key(path), "d", "v"])) || [];
  if (data == null) return null;
  if (opts.ifNoneMatch && opts.ifNoneMatch === v) return { statusCode: 304 };
  return { statusCode: 200, blob: { etag: v }, stream: data };
}

// escribe solo si la versión no ha cambiado (ifMatch), de forma atómica
const CAS = `local v=redis.call('HGET',KEYS[1],'v') if ARGV[3]=='1' and v and v~=ARGV[1] then return 0 end redis.call('HSET',KEYS[1],'d',ARGV[2],'v',ARGV[4]) return 1`;
export async function put(path, body, opts = {}) {
  const nv = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const ok = await cmd(["EVAL", CAS, "1", key(path), opts.ifMatch || "", String(body), opts.ifMatch ? "1" : "0", nv]);
  if (!ok) throw new BlobPreconditionFailedError("cambió");
  return { etag: nv };
}
