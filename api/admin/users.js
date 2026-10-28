import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8"
};

function reply(res, status, body) {
  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
  return res.status(status).json(body);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return reply(res, 405, { error: "Method not allowed" });
  }

  const url = process.env.SUPABASE_URL;
  const publicKey = process.env.SUPABASE_ANON_KEY;
  const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !publicKey || !secretKey) {
    return reply(res, 503, {
      error: "Configuração administrativa incompleta. Configure SUPABASE_SERVICE_ROLE_KEY no ambiente Preview do Vercel."
    });
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return reply(res, 401, { error: "Faça login novamente para continuar." });

  const authClient = createClient(url, publicKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const adminClient = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  try {
    const { data: userData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !userData?.user) {
      return reply(res, 401, { error: "Sessão inválida ou expirada. Entre novamente." });
    }

    const { data: profile, error: profileError } = await adminClient
      .from("profiles").select("role").eq("id", userData.user.id).maybeSingle();

    if (profileError) throw profileError;
    if (profile?.role !== "admin") {
      return reply(res, 403, { error: "Acesso restrito ao ADM Master." });
    }

    const body = req.body || {};
    if (body.action === "list") {
      const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (usersError) throw usersError;
      const users = usersData.users || [];
      const ids = users.map(user => user.id);
      let profiles = [];
      if (ids.length) {
        const { data, error } = await adminClient.from("profiles").select("id, full_name, phone, role").in("id", ids);
        if (error) throw error;
        profiles = data || [];
      }
      const byId = new Map(profiles.map(item => [item.id, item]));
      return reply(res, 200, {
        users: users.map(user => ({
          id: user.id,
          email: user.email || "",
          created_at: user.created_at,
          full_name: byId.get(user.id)?.full_name || "",
          role: byId.get(user.id)?.role || "buyer"
        }))
      });
    }

    if (body.action === "create") {
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const fullName = String(body.full_name || "").trim();
      const role = String(body.role || "");

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return reply(res, 400, { error: "Informe um e-mail válido." });
      }
      if (password.length < 8) return reply(res, 400, { error: "A senha precisa ter pelo menos 8 caracteres." });
      if (!["seller", "admin"].includes(role)) return reply(res, 400, { error: "Perfil inválido." });

      const { data: created, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName }
      });
      if (createError) {
        const status = /already|registered|exists/i.test(createError.message) ? 409 : 400;
        return reply(res, status, { error: createError.message });
      }

      const { error: profileUpsertError } = await adminClient.from("profiles").upsert({
        id: created.user.id,
        full_name: fullName || null,
        role
      }, { onConflict: "id" });

      if (profileUpsertError) {
        await adminClient.auth.admin.deleteUser(created.user.id);
        throw profileUpsertError;
      }

      return reply(res, 201, {
        message: role === "admin" ? "Administrador criado com sucesso." : "Vendedor criado com sucesso.",
        user: { id: created.user.id, email, full_name: fullName, role }
      });
    }

    return reply(res, 400, { error: "Ação inválida." });
  } catch (error) {
    console.error("[HeavyMatch ADM]", error);
    return reply(res, 500, { error: "Não foi possível concluir a operação administrativa." });
  }
}
