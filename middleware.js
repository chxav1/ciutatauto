// Acceso con contraseña. Se recuerda por IP (red de la oficina) y por dispositivo (cookie de 1 año).
import { next, ipAddress } from "@vercel/functions";
import { get, put } from "@vercel/blob";

export const config = { runtime: "nodejs", matcher: ["/((?!assets/|favicon\\.ico).*)"] };

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

const page = err => `<!doctype html><html lang="ca"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Ciutat Studio</title><link rel="icon" href="/assets/icon.svg"><meta name="theme-color" content="#ffffff"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}html,body{height:100%}
body{margin:0;display:grid;place-items:center;background:#fff;color:#17181c;font:15px/1.5 "Instrument Sans",system-ui,-apple-system,"Segoe UI",sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased}
body:before{content:"";position:fixed;left:50%;top:50%;width:900px;height:900px;margin:-450px 0 0 -450px;border-radius:50%;background:radial-gradient(closest-side,rgba(229,0,126,.10),rgba(229,0,126,0));animation:glow 6s ease-in-out infinite alternate;pointer-events:none}
@keyframes glow{to{transform:scale(1.15) translateY(-20px)}}
main{position:relative;width:min(360px,88vw);text-align:center}
.mk{width:68px;height:65px;margin:0 auto 22px;display:block;overflow:visible}
.mk .c0{transform-origin:30px 28px;animation:pop .55s cubic-bezier(.2,.9,.25,1.2) both}.mk .c1{animation:fade .3s ease .25s both}.mk .c2{transform-origin:45px 40px;animation:drop .5s cubic-bezier(.3,1.5,.5,1) .35s both}
@keyframes pop{from{transform:scale(0)}}@keyframes fade{from{opacity:0}}@keyframes drop{from{transform:translateY(-20px);opacity:0}}
h1{margin:0;font-size:26px;font-weight:600;letter-spacing:-.025em}h1 span{color:#9a9da5;font-weight:500}
p.s{margin:6px 0 28px;color:#6b6e76}
.up{animation:up .5s cubic-bezier(.2,.8,.2,1) both}.d1{animation-delay:.15s}.d2{animation-delay:.25s}.d3{animation-delay:.35s}
@keyframes up{from{opacity:0;transform:translateY(10px)}}
.f{position:relative}
input{width:100%;height:54px;border:1px solid #e2e3e8;border-radius:14px;padding:0 52px;font:inherit;font-size:22px;letter-spacing:.35em;text-align:center;outline:none;background:#fff;color:inherit;transition:border-color .15s,box-shadow .15s}
input::placeholder{letter-spacing:.02em;font-size:15px;color:#9a9da5}
input:focus{border-color:#E5007E;box-shadow:0 0 0 4px rgba(229,0,126,.12)}
.eye{position:absolute;right:8px;top:8px;width:38px;height:38px;border:0;border-radius:10px;background:none;color:#9a9da5;cursor:pointer;display:grid;place-items:center}.eye:hover{color:#17181c;background:#f2f3f5}
button.go{width:100%;height:52px;margin-top:12px;border:0;border-radius:14px;background:#E5007E;color:#fff;font:inherit;font-size:16px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:background .15s,transform .1s}
button.go:hover{background:#cc0070}button.go:active{transform:scale(.98)}button.go svg{transition:transform .2s}button.go:hover svg{transform:translateX(3px)}
.e{color:#dc2626;font-size:13.5px;margin:12px 0 0;min-height:20px}
.err .f{animation:shake .4s}@keyframes shake{20%,60%{transform:translateX(-7px)}40%,80%{transform:translateX(7px)}}
.err input{border-color:#dc2626;box-shadow:0 0 0 4px rgba(220,38,38,.1)}
footer{position:fixed;bottom:22px;left:0;right:0;text-align:center;font-size:12px;color:#9a9da5;letter-spacing:.02em}
@media(prefers-color-scheme:dark){body{background:#0e0f12;color:#eceef2}input{background:#16171b;border-color:#2a2c33}.eye:hover{color:#eceef2;background:#1d1f24}p.s{color:#9a9ea8}h1 span{color:#6c707a}}
@media(prefers-reduced-motion:reduce){*{animation:none!important}}
</style></head>
<body><main class="${err ? "err" : ""}"><svg class="mk" viewBox="0 0 59 56" aria-hidden="true"><path class="c0" d="M58.4202 28C58.4202 43.4661 45.7922 56 30.2101 56C14.6279 56 2 43.4661 2 28C2 12.5339 14.6279 0 30.2101 0C45.7922 0 58.4202 12.5339 58.4202 28Z" fill="#E5007E"/><path class="c1" d="M7.09753 27.885C7.09753 17.9384 14.6859 11.2115 23.6644 11.2115C33.2802 11.2115 37.5667 17.3634 38.6094 21.963L31.89 24.0903C31.3686 21.9055 29.3412 18.1684 23.7224 18.1684C19.4358 18.1684 14.57 21.2156 14.57 27.9425C14.57 33.922 19.0303 37.3717 23.7803 37.3717C29.3412 37.3717 31.5424 33.692 32.1796 31.3922L39.0149 33.347C37.9722 37.7166 33.7436 44.501 23.7803 44.501C14.5121 44.386 7.09753 37.8316 7.09753 27.885Z" fill="#fff"/><path class="c2" d="M45.4446 44.386C44.1123 44.386 43.0117 43.9836 42.2008 43.1211C41.3319 42.2587 40.9264 41.2813 40.9264 40.1314C40.9264 38.924 41.3319 37.9466 42.2008 37.1417C43.0697 36.3368 44.1123 35.9343 45.4446 35.9343C46.7769 35.9343 47.8775 36.3368 48.7464 37.1417C49.5574 37.9466 50.0208 38.924 50.0208 40.1314C50.0208 41.3388 49.6153 42.3162 48.7464 43.1211C47.8775 43.9836 46.7769 44.386 45.4446 44.386ZM42.4904 32.6571L41.0422 11.2115H49.847L48.3989 32.6571H42.4904Z" fill="#fff"/></svg>
<h1 class="up d1">Ciutat <span>Studio</span></h1><p class="s up d1">Introdueix la contrasenya per entrar</p>
<form method="post" action="/__login" class="up d2"><div class="f"><input id="p" type="password" name="p" autofocus inputmode="numeric" autocomplete="current-password" placeholder="Contrasenya" aria-label="Contrasenya" required>
<button type="button" class="eye" aria-label="Mostrar la contrasenya" onclick="var i=document.getElementById('p');i.type=i.type=='password'?'text':'password';i.focus()"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button></div>
<button class="go">Entrar<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
<p class="e" role="alert">${err ? "Contrasenya incorrecta. Torna-ho a provar." : ""}</p></form></main>
<footer class="up d3">laciutat.cat</footer></body></html>`;
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
  return html(page(false));
}
