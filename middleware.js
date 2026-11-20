// Acceso con contraseña. Se recuerda por IP (red de la oficina) y por dispositivo (cookie de 1 año).
import { next, ipAddress } from "@vercel/functions";
import { get, put } from "@vercel/blob";

export const config = { runtime: "nodejs", matcher: ["/((?!assets/icon\\.svg|favicon\\.ico).*)"] };

const PASS_HASH = "f6e0a1e2ac41945a9aa7ff8a8aaa0cebc12a3bcc981a929ad5cf810a090e11ae"; // sha256("111")
const COOKIE = "cs_ok", IPS = "auth/ips.json";
let cache = { at: 0, ips: [] };

const sha = async s => Buffer.from(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s))).toString("hex");
const token = () => sha("ciutat-studio:" + PASS_HASH);
async function ips(fresh) {
  if (!fresh && Date.now() - cache.at < 60000) return cache.ips;
  try { const r = await get(IPS, { access: "private", useCache: false }); cache = { at: Date.now(), ips: r ? JSON.parse(await new Response(r.stream).text()) : [] }; }
  catch { cache.at = Date.now(); }
  return cache.ips;
}
const ipOf = req => ipAddress(req) || (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();

const page = err => `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ciutat Studio</title><link rel="icon" href="/assets/icon.svg">
<style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#fff;color:#17181c;font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
body:before{content:"";position:fixed;left:0;right:0;top:0;height:4px;background:#E5007E}
form{width:min(340px,90vw);text-align:center}img{width:56px;height:56px;margin-bottom:18px}h1{font-size:22px;margin:0 0 6px;letter-spacing:-.01em}p{margin:0 0 22px;color:#6b6e76}
input{width:100%;height:46px;border:1px solid #e2e3e8;border-radius:12px;padding:0 14px;font:inherit;font-size:16px;outline:none;text-align:center;letter-spacing:.2em}input:focus{border-color:#E5007E;box-shadow:0 0 0 3px rgba(229,0,126,.12)}
button{width:100%;height:46px;margin-top:10px;border:0;border-radius:12px;background:#E5007E;color:#fff;font:inherit;font-weight:600;cursor:pointer}.e{color:#dc2626;font-size:13px;margin:10px 0 0;min-height:20px}</style></head>
<body><form method="post" action="/__login"><img src="/assets/icon.svg" alt=""><h1>Ciutat Studio</h1><p>Introduce la contraseña para entrar</p>
<input type="password" name="p" autofocus autocomplete="current-password" aria-label="Contraseña"><button>Entrar</button><p class="e">${err ? "Contraseña incorrecta" : ""}</p></form></body></html>`;
const html = (s, status = 200, h = {}) => new Response(s, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", ...h } });

export default async function middleware(req) {
  const url = new URL(req.url), tok = await token();
  if (url.pathname === "/__login" && req.method === "POST") {
    const f = await req.formData().catch(() => null);
    if (!f || (await sha(String(f.get("p") || ""))) !== PASS_HASH) return html(page(true), 401);
    const ip = ipOf(req);
    if (ip) { try { const l = await ips(true); if (!l.includes(ip)) { l.push(ip); await put(IPS, JSON.stringify(l.slice(-200)), { access: "private", contentType: "application/json", addRandomSuffix: false, allowOverwrite: true }); cache = { at: Date.now(), ips: l }; } } catch {} }
    return new Response(null, { status: 303, headers: { location: "/", "set-cookie": `${COOKIE}=${tok}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax` } });
  }
  const ck = (req.headers.get("cookie") || "").split(/;\s*/).find(c => c.startsWith(COOKIE + "="));
  if (ck && ck.slice(COOKIE.length + 1) === tok) return next();
  const ip = ipOf(req);
  if (ip && (await ips(false)).includes(ip)) return next({ headers: { "set-cookie": `${COOKIE}=${tok}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax` } });
  if (url.pathname.startsWith("/api/")) return Response.json({ error: "Acceso restringido" }, { status: 401 });
  return html(page(false), 401);
}
