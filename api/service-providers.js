import { createClient } from "@supabase/supabase-js";

const HEADERS = { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" };
const OPTIONS = { auth: { persistSession: false, autoRefreshToken: false } };
const ALLOWED_SERVICES = new Set([
  "freight_broker", "dispatcher", "parts_store", "tow_service",
  "electrician", "mechanic", "insurance_benefits", "other"
]);

function reply(res, status, body) {
  Object.entries(HEADERS).forEach(([key, value]) => res.setHeader(key, value));
  return res.status(status).json(body);
}

function text(value, max = 160) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function services(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(item => text(item, 40)).filter(item => ALLOWED_SERVICES.has(item)))].slice(0, 8);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return reply(res, 405, { error: "Método não permitido." });
  }

  const url = process.env.SUPABASE_URL;
  const publicKey = process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !publicKey || !serviceKey) {
    return reply(res, 503, { error: "Configuração de prestadores indisponível." });
  }

  const token = (req.headers.authorization || "").replace(/^Bearer /, "");
  if (!token) return reply(res, 401, { error: "Entre na sua conta para continuar." });

  const auth = createClient(url, publicKey, OPTIONS);
  const db = createClient(url, serviceKey, OPTIONS);

  try {
    const { data: identity, error: authError } = await auth.auth.getUser(token);
    if (authError || !identity?.user) {
      return reply(res, 401, { error: "Sessão inválida ou expirada. Entre novamente." });
    }

    const user = identity.user;
    const { data: profile, error: profileError } = await db
      .from("profiles").select("id, full_name, phone, role").eq("id", user.id).maybeSingle();
    if (profileError) throw profileError;
    if (!profile) return reply(res, 409, { error: "Seu perfil ainda está sendo preparado. Entre novamente." });

    const body = req.body || {};
    const action = text(body.action, 30);

    if (action === "request") {
      const requestedServices = services(body.services);
      if (!requestedServices.length) {
        return reply(res, 400, { error: "Selecione pelo menos um serviço oferecido." });
      }

      const { data: current, error: currentError } = await db
        .from("service_provider_requests").select("*").eq("user_id", user.id).maybeSingle();
      if (currentError) throw currentError;
      if (current?.status === "approved") {
        return reply(res, 409, { error: "Seu cadastro de prestador já foi aprovado." });
      }

      const record = {
        user_id: user.id,
        business_name: text(body.business_name, 120) || profile.full_name || null,
        services: requestedServices,
        status: "pending",
        admin_note: null,
        reviewed_by: null,
        reviewed_at: null,
        updated_at: new Date().toISOString()
      };
      const { data, error } = await db.from("service_provider_requests")
        .upsert(record, { onConflict: "user_id" }).select().single();
      if (error) throw error;
      return reply(res, 200, {
        request: data,
        message: "Cadastro de prestador enviado para aprovação do ADM."
      });
    }

    if (action === "status") {
      const { data, error } = await db.from("service_provider_requests")
        .select("id, business_name, services, status, admin_note, reviewed_at, created_at")
        .eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      return reply(res, 200, { request: data || null });
    }

    if (profile.role !== "admin") {
      return reply(res, 403, { error: "Acesso restrito ao ADM Master." });
    }

    if (action === "list") {
      const { data: requests, error } = await db.from("service_provider_requests")
        .select("*").order("created_at", { ascending: false });
      if (error) throw error;
      const ids = [...new Set((requests || []).map(item => item.user_id))];
      let profiles = [];
      if (ids.length) {
        const result = await db.from("profiles").select("id, full_name, phone, role").in("id", ids);
        if (result.error) throw result.error;
        profiles = result.data || [];
      }
      const byId = new Map(profiles.map(item => [item.id, item]));
      return reply(res, 200, {
        requests: (requests || []).map(item => ({ ...item, profile: byId.get(item.user_id) || {} }))
      });
    }

    if (action === "review") {
      const requestId = text(body.request_id, 60);
      const decision = body.decision === "approve" ? "approved" : body.decision === "reject" ? "rejected" : "";
      if (!requestId || !decision) return reply(res, 400, { error: "Decisão inválida." });

      const { data: request, error: findError } = await db.from("service_provider_requests")
        .select("*").eq("id", requestId).maybeSingle();
      if (findError) throw findError;
      if (!request) return reply(res, 404, { error: "Solicitação não encontrada." });
      if (request.status !== "pending") {
        return reply(res, 409, { error: "Esta solicitação já foi analisada." });
      }

      const { data: updated, error: updateError } = await db.from("service_provider_requests")
        .update({
          status: decision,
          admin_note: text(body.admin_note, 500) || null,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", requestId).eq("status", "pending").select().maybeSingle();
      if (updateError) throw updateError;
      if (!updated) return reply(res, 409, { error: "A solicitação foi analisada por outro administrador." });

      if (decision === "approved" && request.services.includes("freight_broker")) {
        const { error: roleError } = await db.from("profiles")
          .update({ role: "broker" }).eq("id", request.user_id);
        if (roleError) throw roleError;
      }

      return reply(res, 200, {
        request: updated,
        message: decision === "approved"
          ? "Prestador aprovado. Os acessos correspondentes foram liberados."
          : "Solicitação recusada."
      });
    }

    return reply(res, 400, { error: "Ação inválida." });
  } catch (error) {
    console.error("[CatiraMatch prestadores]", error);
    return reply(res, 500, { error: "Não foi possível concluir a operação de prestadores." });
  }
}
