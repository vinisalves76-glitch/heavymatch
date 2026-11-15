const FIELDS = "private_listing_fee_cents, revision, updated_at";
const unavailable = "A configuração de taxas ainda não está disponível neste ambiente.";

export function createFeesHandler({ createClient, env = process.env, now = () => new Date().toISOString() }) {
  return async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    const reply = (status, body) => res.status(status).json(body);
    if (!["GET", "PUT"].includes(req.method)) {
      res.setHeader("Allow", "GET, PUT");
      return reply(405, { error: "Método não permitido." });
    }
    const token = (req.headers.authorization || "").match(/^Bearer (\S+)$/)?.[1];
    if (!token) return reply(401, { error: "Entre na sua conta para continuar." });
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return reply(503, { error: unavailable });
    }
    try {
      const options = { auth: { persistSession: false, autoRefreshToken: false } };
      const auth = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, options);
      const { data: identity, error: identityError } = await auth.auth.getUser(token);
      if (identityError || !identity?.user) return reply(401, { error: "Sessão inválida ou expirada. Entre novamente." });
      const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, options);
      const { data: profile, error: roleError } = await db.from("profiles").select("role").eq("id", identity.user.id).maybeSingle();
      if (roleError) throw roleError;
      if (profile?.role !== "admin") return reply(403, { error: "Somente o ADM Master pode gerenciar a taxa." });
      // A Preview nunca altera a taxa de produção, mesmo compartilhando o projeto Supabase.
      const scope = env.VERCEL_ENV === "production" ? "production" : "preview";
      let result;
      if (req.method === "PUT") {
        const { amount_cents: amount, revision } = req.body || {};
        if (!Number.isSafeInteger(amount) || amount <= 0 || !Number.isSafeInteger(revision) || revision < 0) {
          return reply(400, { error: "Informe uma taxa válida, maior que zero, e recarregue a configuração se necessário." });
        }
        result = await db.from("marketplace_fees").update({
          private_listing_fee_cents: amount, revision: revision + 1,
          updated_at: now(), updated_by: identity.user.id
        }).eq("scope", scope).eq("revision", revision).select(FIELDS).maybeSingle();
        if (!result.error && !result.data) return reply(409, { error: "A configuração foi atualizada em outro acesso. Recarregue antes de salvar novamente." });
      } else {
        result = await db.from("marketplace_fees").select(FIELDS).eq("scope", scope).maybeSingle();
      }
      if (result.error) {
        if (["42P01", "PGRST205", "PGRST204"].includes(result.error.code)) return reply(503, { error: unavailable });
        throw result.error;
      }
      if (!result.data) return reply(503, { error: unavailable });
      return reply(200, { fee: {
        amount_cents: result.data.private_listing_fee_cents,
        revision: result.data.revision,
        updated_at: result.data.updated_at
      } });
    } catch {
      return reply(500, { error: "Não foi possível acessar a taxa. Tente novamente." });
    }
  };
}
