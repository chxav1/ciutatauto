const pick = (h, re) => { const m = h.match(re); return m ? m[1] : "" };
const meta = (h, p) => pick(h, new RegExp(`<meta[^>]+(?:property|name)=["']${p}["'][^>]*content=["']([^"']*)["']`, "i")) ||
  pick(h, new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${p}["']`, "i"));
const dec = s => s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
  .replace(/&quot;/g, '"').replace(/&apos;|&#039;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");

async function handle(req) {
  const u = new URL(req.url).searchParams.get("url") || "";
  let target;
  try { target = new URL(u); } catch { return Response.json({ error: "URL no válida" }, { status: 400 }); }
  if (!/(^|\.)laciutat\.cat$/.test(target.hostname)) return Response.json({ error: "Solo enlaces de laciutat.cat" }, { status: 400 });
  const ua = { "user-agent": "Mozilla/5.0 (AutomaticCiutat)" };
  const r = await fetch(target, { headers: ua });
  if (!r.ok) return Response.json({ error: "No se pudo abrir el artículo (" + r.status + ")" }, { status: 502 });
  const h = await r.text();
  const title = dec(meta(h, "og:title") || pick(h, /<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, "")).trim();
  const sub = dec(pick(h, /<h2[^>]*>([\s\S]*?)<\/h2>/i).replace(/<[^>]+>/g, "") || meta(h, "og:description")).trim();
  const img = meta(h, "og:image") || meta(h, "twitter:image") || pick(h, /<img[^>]+(?:data-src|src)=["']([^"']*\/uploads\/[^"']+)["']/i);
  let image = "";
  if (img) {
    const ir = await fetch(new URL(img, target), { headers: ua }).catch(() => ({ ok: false }));
    if (ir.ok) {
      const b = Buffer.from(await ir.arrayBuffer());
      image = `data:${ir.headers.get("content-type") || "image/jpeg"};base64,${b.toString("base64")}`;
    }
  }
  return Response.json({ title, sub, image, url: target.href, path: target.pathname });
};

export async function GET(request) { return handle(request); }
