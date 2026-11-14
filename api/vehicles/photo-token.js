import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const MIME = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};
function reply(res, status, body) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).json(body);
}
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return reply(res, 405, { error: "Método não permitido." });
  }
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !serviceKey) return reply(res, 503, { error: "Serviço de fotos indisponível." });
  const type = String(req.body?.content_type || "").toLowerCase();
  const size = Number(req.body?.size);
  if (!MIME[type] || !Number.isInteger(size) || size < 1 || size > 10 * 1024 * 1024) {
    return reply(res, 400, { error: "Escolha uma foto JPG, PNG ou WebP com até 10 MB." });
  }
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return reply(res, 401, { error: "Faça login como vendedor ou administrador." });

  const options = { auth: { persistSession: false, autoRefreshToken: false } };
  const publicClient = createClient(url, anon, options);
  const adminClient = createClient(url, serviceKey, options);
  try {
    const { data: identity, error: identityError } = await publicClient.auth.getUser(token);
    if (identityError || !identity?.user) return reply(res, 401, { error: "Sessão expirada." });
    const { data: profile, error: profileError } = await adminClient.from("profiles")
      .select("role").eq("id", identity.user.id).maybeSingle();
    if (profileError) throw profileError;
    if (!["seller", "admin"].includes(profile?.role)) {
      return reply(res, 403, { error: "Somente vendedores e administradores podem enviar fotos." });
    }

    // O caminho é gerado no servidor, não no navegador.
    const path = identity.user.id + "/" + randomUUID() + "." + MIME[type];
    const { data, error } = await adminClient.storage.from("vehicle-photos")
      .createSignedUploadUrl(path);
    if (error || !data?.token) throw error || new Error("Sem token de upload.");
    return reply(res, 200, { path, token: data.token });
  } catch (error) {
    console.error("[HeavyMatch photo token]", error?.code || "error");
    return reply(res, 500, { error: "Não foi possível preparar a foto. Tente novamente." });
  }
}
