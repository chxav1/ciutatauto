// Detecta artículos recién publicados antes de que salgan en el RSS:
// laciutat.cat redirige cualquier /x_<id>_102.html a la noticia si ya está publicada (404 si no).
const UA = { "user-agent": "Mozilla/5.0 (CiutatStudio)", "cache-control": "no-cache" };
const meta = (h, p) => {
  const m = h.match(new RegExp(`<meta[^>]+(?:property|name)=["']${p}["'][^>]*content=["']([^"']*)["']`, "i")) ||
    h.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${p}["']`, "i"));
  return m ? m[1] : "";
};
const dec = s => s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
  .replace(/&quot;/g, '"').replace(/&apos;|&#039;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim();

async function one(id) {
  try {
    const r = await fetch(`https://laciutat.cat/x_${id}_102.html?nc=${Date.now()}`, { headers: UA, redirect: "follow", cache: "no-store" });
    if (!r.ok || !r.url.includes(`_${id}_`)) return null;
    const h = await r.text();
    const link = r.url.split("?")[0];
    const h2 = (h.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i) || [])[1] || "";
    return {
      id, link,
      title: dec(meta(h, "og:title")),
      sub: dec(h2.replace(/<[^>]+>/g, "") || meta(h, "og:description")),
      img: meta(h, "og:image"),
      date: meta(h, "article:published_time") || new Date().toISOString(),
      cats: [dec(meta(h, "article:section"))].filter(Boolean),
      live: true
    };
  } catch { return null; }
}

export async function GET(request) {
  const ids = (new URL(request.url).searchParams.get("ids") || "").split(",").map(Number).filter(n => n > 0).slice(0, 24);
  const items = (await Promise.all(ids.map(one))).filter(Boolean);
  return Response.json({ items }, { headers: { "cache-control": "no-store, max-age=0" } });
}
