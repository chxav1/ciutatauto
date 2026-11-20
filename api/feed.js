const tag = (s, t) => { const m = s.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`, "i")); return m ? m[1].replace(/^<!\[CDATA\[|\]\]>$/g, "").trim() : "" };
export async function GET() {
  const r = await fetch("https://laciutat.cat/uploads/feeds/feed_laciutat_ca.xml?t=" + Date.now(), { cache: "no-store", headers: { "user-agent": "Mozilla/5.0 (AutomaticCiutat)", "cache-control": "no-cache", pragma: "no-cache" } });
  if (!r.ok) return Response.json({ error: "feed " + r.status }, { status: 502 });
  const x = await r.text();
  const items = [...x.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, s]) => ({
    title: tag(s, "title"), link: tag(s, "link"), date: tag(s, "pubDate"), sub: tag(s, "description"),
    cats: [...s.matchAll(/<category>([\s\S]*?)<\/category>/g)].map(m => m[1].replace(/^<!\[CDATA\[|\]\]>$/g, "").trim()),
    img: (s.match(/<enclosure[^>]+url="([^"]+)"/) || [])[1] || ""
  }));
  return Response.json({ items }, { headers: { "cache-control": "no-store, max-age=0" } });
}
