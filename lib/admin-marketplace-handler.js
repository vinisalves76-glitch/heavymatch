const BUCKET = "vehicle-photos";
const HEADERS = { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" };
const OPTIONS = { auth: { persistSession: false, autoRefreshToken: false } };
const reply = (res, status, body) => { Object.entries(HEADERS).forEach(([key, value]) => res.setHeader(key, value)); return res.status(status).json(body); };
const clean = (value, max = 1000) => typeof value === "string" ? value.trim().slice(0, max) : "";

export function createAdminMarketplaceHandler({ createClient, env = process.env }) {
  return async function handler(req, res) {
    if (!["GET", "POST"].includes(req.method)) { res.setHeader("Allow", "GET, POST"); return reply(res, 405, { error: "Método não permitido." }); }
    const { SUPABASE_URL: url, SUPABASE_ANON_KEY: anon, SUPABASE_SERVICE_ROLE_KEY: service } = env;
    if (!url || !anon || !service) return reply(res, 503, { error: "Gestão de solicitações indisponível." });
    const token = (req.headers.authorization || "").match(/^Bearer (\S+)$/)?.[1];
    if (!token) return reply(res, 401, { error: "Entre na sua conta para continuar." });
    const auth = createClient(url, anon, OPTIONS), db = createClient(url, service, OPTIONS);
    try {
      const { data: identity, error: authError } = await auth.auth.getUser(token);
      if (authError || !identity?.user) return reply(res, 401, { error: "Sessão inválida ou expirada." });
      const { data: admin, error: roleError } = await db.from("profiles").select("role").eq("id", identity.user.id).maybeSingle();
      if (roleError) throw roleError;
      if (admin?.role !== "admin") return reply(res, 403, { error: "Acesso restrito ao ADM Master." });

      if (req.method === "GET") {
        const [requestsResult, profilesResult, listingsResult, sellersResult, paymentsResult] = await Promise.all([
          db.from("agency_signup_requests").select("*").neq("status", "approved").order("created_at", { ascending: true }),
          db.from("profiles").select("id, full_name, phone, role"),
          db.from("private_listings").select("*").neq("status", "published").order("created_at", { ascending: true }),
          db.from("profiles").select("id, full_name, phone").eq("role", "seller").order("full_name", { ascending: true }),
          db.from("private_listing_payments").select("private_listing_id, fee_cents, status, approved_at, created_at").order("created_at", { ascending: false })
        ]);
        for (const result of [requestsResult, profilesResult, listingsResult, sellersResult, paymentsResult]) if (result.error) throw result.error;
        const profiles = new Map((profilesResult.data || []).map(row => [row.id, row]));
        const latestPayment = new Map();
        (paymentsResult.data || []).forEach(payment => { if (!latestPayment.has(payment.private_listing_id) || payment.status === "approved") latestPayment.set(payment.private_listing_id, payment); });
        const agencies = await Promise.all((requestsResult.data || []).map(async request => {
          const profile = profiles.get(request.user_id) || {};
          const { data } = await db.auth.admin.getUserById(request.user_id);
          return { ...request, full_name: profile.full_name || "", phone: profile.phone || "", email: data?.user?.email || "" };
        }));
        const listings = await Promise.all((listingsResult.data || []).map(async listing => {
          const photos = await Promise.all((listing.photo_paths || []).map(async (path, position) => {
            const { data } = await db.storage.from(BUCKET).createSignedUrl(path, 3600);
            return { url: data?.signedUrl || "", position };
          }));
          const owner = profiles.get(listing.owner_id) || {};
          return { ...listing, owner_name: owner.full_name || "", owner_phone: owner.phone || "", photos, payment: latestPayment.get(listing.id) || null };
        }));
        return reply(res, 200, { agencies, listings, sellers: sellersResult.data || [] });
      }

      const body = req.body || {};
      if (body.action === "agency_status") {
        const id = clean(body.id, 50), status = clean(body.status, 30), note = clean(body.note, 1000);
        if (!id || !["contacted", "needs_information", "approved"].includes(status)) return reply(res, 400, { error: "Ação da solicitação inválida." });
        const { data: request, error: requestError } = await db.from("agency_signup_requests").select("id, user_id, status").eq("id", id).maybeSingle();
        if (requestError) throw requestError;
        if (!request) return reply(res, 404, { error: "Solicitação não encontrada." });
        if (status === "approved") {
          const { data: profile, error: profileReadError } = await db.from("profiles").select("id, phone, role").eq("id", request.user_id).maybeSingle();
          if (profileReadError) throw profileReadError;
          const phone = String(profile?.phone || "").replace(/\D/g, "");
          if (!profile || phone.length < 10 || phone.length > 13) return reply(res, 409, { error: "Atualize o WhatsApp do vendedor antes de liberar o acesso." });
          const { error: promoteError } = await db.from("profiles").update({ role: "seller" }).eq("id", request.user_id).eq("role", "buyer");
          if (promoteError) throw promoteError;
        }
        const { error } = await db.from("agency_signup_requests").update({
          status, admin_note: note || null, reviewed_by: identity.user.id, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString()
        }).eq("id", id);
        if (error) throw error;
        return reply(res, 200, { message: status === "approved" ? "Acesso de vendedor liberado." : "Solicitação atualizada." });
      }

      if (body.action === "request_photos") {
        const id = clean(body.id, 50), note = clean(body.note, 1000);
        if (!id || note.length < 8) return reply(res, 400, { error: "Explique quais fotos precisam ser ajustadas." });
        const { data, error } = await db.from("private_listings").update({
          status: "changes_requested", review_note: note, updated_at: new Date().toISOString()
        }).eq("id", id).eq("status", "under_review").select("id").maybeSingle();
        if (error) throw error;
        if (!data) return reply(res, 409, { error: "O anúncio não está aguardando revisão." });
        return reply(res, 200, { message: "Ajuste solicitado. O anúncio continua fora da vitrine até a nova revisão." });
      }

      if (body.action === "publish") {
        const id = clean(body.id, 50), sellerId = clean(body.seller_id, 50);
        if (!id || !sellerId) return reply(res, 400, { error: "Selecione o vendedor responsável." });
        const { data: seller, error: sellerError } = await db.from("profiles").select("id, role, phone").eq("id", sellerId).maybeSingle();
        if (sellerError) throw sellerError;
        const phone = String(seller?.phone || "").replace(/\D/g, "");
        if (!seller || seller.role !== "seller" || phone.length < 10 || phone.length > 13) return reply(res, 400, { error: "Selecione um vendedor com WhatsApp válido." });
        const { data: vehicleId, error } = await db.rpc("publish_private_listing", { p_listing_id: id, p_seller_id: sellerId });
        if (error) {
          const code = error.message || "";
          if (code.includes("payment_not_approved")) return reply(res, 409, { error: "O pagamento ainda não foi confirmado." });
          if (code.includes("listing_not_ready")) return reply(res, 409, { error: "O anúncio precisa estar pago e aguardando revisão." });
          if (code.includes("seller_contact_invalid")) return reply(res, 409, { error: "O WhatsApp do vendedor precisa ser atualizado." });
          throw error;
        }
        return reply(res, 200, { vehicle_id: vehicleId, message: "Anúncio aprovado, vinculado ao vendedor e publicado." });
      }
      return reply(res, 400, { error: "Ação inválida." });
    } catch (error) {
      console.error("[CatiraMatch admin marketplace]", error?.code || "unexpected_error");
      return reply(res, 500, { error: "Não foi possível atualizar as solicitações." });
    }
  };
}
