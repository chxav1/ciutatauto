export async function GET(request) {
  const u = new URL(request.url).searchParams.get("url") || "";
  let t; try { t = new URL(u) } catch { return new Response("bad url", { status: 400 }) }
  if (!/(^|\.)laciutat\.cat$/.test(t.hostname)) return new Response("forbidden", { status: 403 });
  const r = await fetch(t, { headers: { "user-agent": "Mozilla/5.0 (AutomaticCiutat)" } });
  if (!r.ok) return new Response("not found", { status: 404 });
  return new Response(r.body, { headers: { "content-type": r.headers.get("content-type") || "image/jpeg", "cache-control": "public, max-age=86400" } });
}
