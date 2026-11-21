// Registro de publicaciones: un archivo por mes (log/AAAA-MM.json) en Vercel Blob privado.
import { monthOf, okMonth, read, write, clean, addRow, removeAid, mergeKind } from "./_logstore.js";

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
      const r = await addRow(op.row, op.keep);
      return Response.json({ ok: true, ...r });
    }
    if (op.type === "kind") { await mergeKind(op.aid, op.kind); return Response.json({ ok: true }); }
    if (op.type === "removeAid") {
      await removeAid(op.aid);
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
