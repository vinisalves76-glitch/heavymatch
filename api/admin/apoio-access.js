import { createClient } from "@supabase/supabase-js";

// Endpoint somente-leitura: a Preview nunca altera perfis nem dados do Supabase.
// Não confiar em role do navegador, URL ou user_metadata.
const options = { auth: { persistSession: false, autoRefreshToken: false } };
function reply(res, status, data) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  return res.status(status).json(data);
}
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return reply(res, 405, { error: "Método não permitido." });
  }
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !service) return reply(res, 503, { error: "Acesso administrativo indisponível neste ambiente." });
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return reply(res, 401, { error: "Entre com uma conta ADM Master." });
  try {
    const auth = createClient(url, anon, options);
    const db = createClient(url, service, options);
    const { data: identity, error: authError } = await auth.auth.getUser(token);
    if (authError || !identity?.user) return reply(res, 401, { error: "Sessão inválida ou expirada." });
    const { data: profile, error: profileError } = await db.from("profiles")
      .select("role").eq("id", identity.user.id).maybeSingle();
    if (profileError) throw profileError;
    if (profile?.role !== "admin") return reply(res, 403, { error: "Acesso permitido somente ao ADM Master." });
    return reply(res, 200, { authorized: true, mode: "preview-local" });
  } catch (error) {
    console.error("[CatiraMatch apoio-access]", error?.code || "unexpected_error");
    return reply(res, 500, { error: "Não foi possível verificar as permissões." });
  }
}
