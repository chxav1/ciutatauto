// Datos públicos para conectarse al aviso instantáneo (Supabase Realtime). La clave anon es pública por diseño.
export function GET() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "";
  return Response.json({ url, key }, { headers: { "cache-control": "private, max-age=3600" } });
}
