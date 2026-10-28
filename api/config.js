export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return res.status(503).json({
      error: "Supabase ainda não foi configurado no ambiente deste deploy."
    });
  }

  // A URL e a chave publishable/anon são públicas por definição.
  // Nunca exponha SUPABASE_SERVICE_ROLE_KEY ou chaves secret neste endpoint.
  return res.status(200).json({ url, anonKey: key });
}
