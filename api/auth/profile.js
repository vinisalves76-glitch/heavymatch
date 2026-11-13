import { createClient } from "@supabase/supabase-js";

// Inicializa o perfil de um usuário já autenticado, sem confiar no papel vindo do navegador.
function respond(res, status, body) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  return res.status(status).json(body);
}

function metadataText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return respond(res, 405, { error: "Método não permitido." });
  }

  const url = process.env.SUPABASE_URL;
  const publicKey = process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !publicKey || !serviceKey) {
    return respond(res, 503, { error: "Configuração de contas indisponível neste ambiente." });
  }

  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return respond(res, 401, { error: "Entre na sua conta para continuar." });

  const options = { auth: { persistSession: false, autoRefreshToken: false } };
  const authClient = createClient(url, publicKey, options);
  const db = createClient(url, serviceKey, options);

  try {
    const { data: identity, error: identityError } = await authClient.auth.getUser(token);
    if (identityError || !identity?.user) {
      return respond(res, 401, { error: "Sessão inválida ou expirada. Entre novamente." });
    }

    const user = identity.user;
    const lookup = () => db.from("profiles")
      .select("id, full_name, phone, role")
      .eq("id", user.id)
      .maybeSingle();

    let { data: profile, error: readError } = await lookup();
    if (readError) throw readError;

    if (!profile) {
      const metadata = user.user_metadata || {};
      const name = metadataText(metadata.full_name, 120);
      const phone = metadataText(metadata.phone, 30);
      const { error: insertError } = await db.from("profiles").insert({
        id: user.id,
        full_name: name || null,
        phone: phone || null,
        role: "buyer"
      });

      // Dois acessos simultâneos podem criar o mesmo perfil: releia se já existir.
      if (insertError && insertError.code !== "23505") throw insertError;
      const result = await lookup();
      if (result.error) throw result.error;
      profile = result.data;
    }

    if (!profile) throw new Error("Perfil não disponível após a criação.");
    // Nunca usar user_metadata.account_type para determinar permissões.
    return respond(res, 200, {
      profile: {
        id: profile.id,
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        role: profile.role
      }
    });
  } catch (error) {
    console.error("[HeavyMatch auth/profile]", error?.code || "unexpected_error");
    return respond(res, 500, {
      error: "Não foi possível configurar seu perfil. Tente entrar novamente."
    });
  }
}
