import { randomUUID } from "node:crypto";

const BUCKET = "vehicle-photos";
const HEADERS = { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" };
const OPTIONS = { auth: { persistSession: false, autoRefreshToken: false } };
const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const reply = (res, status, body) => {
  Object.entries(HEADERS).forEach(([key, value]) => res.setHeader(key, value));
  return res.status(status).json(body);
};
const clean = (value, max = 5000) => typeof value === "string" ? value.trim().slice(0, max) : "";
const photoPattern = /^[a-f0-9-]{36}\/[a-f0-9-]{36}\.(jpg|jpeg|png|webp)$/i;

export function createPrivateListingsHandler({ createClient, env = process.env, fetchImpl = fetch, uuid = randomUUID }) {
  return async function handler(req, res) {
    if (!["GET", "POST"].includes(req.method)) {
      res.setHeader("Allow", "GET, POST");
      return reply(res, 405, { error: "Método não permitido." });
    }
    const { SUPABASE_URL: url, SUPABASE_ANON_KEY: anon, SUPABASE_SERVICE_ROLE_KEY: service } = env;
    if (!url || !anon || !service) return reply(res, 503, { error: "Cadastro de anúncios particulares indisponível." });
    const token = (req.headers.authorization || "").match(/^Bearer (\S+)$/)?.[1];
    if (!token) return reply(res, 401, { error: "Entre na sua conta para continuar." });
    const publicClient = createClient(url, anon, OPTIONS);
    const db = createClient(url, service, OPTIONS);
    try {
      const { data: identity, error: authError } = await publicClient.auth.getUser(token);
      if (authError || !identity?.user) return reply(res, 401, { error: "Sessão inválida ou expirada." });
      const user = identity.user;
      const { data: profile, error: roleError } = await db.from("profiles").select("role").eq("id", user.id).maybeSingle();
      if (roleError) throw roleError;
      if (profile?.role !== "buyer") return reply(res, 403, { error: "Esta modalidade é exclusiva para pessoa física." });
      const { data: agencyRequest, error: agencyError } = await db.from("agency_signup_requests")
        .select("status").eq("user_id", user.id).maybeSingle();
      if (agencyError) throw agencyError;
      if (agencyRequest && agencyRequest.status !== "approved") {
        return reply(res, 403, { error: "Seu cadastro de vendedor está aguardando a finalização pelo especialista." });
      }

      if (req.method === "GET") {
        const { data, error } = await db.from("private_listings").select("*").eq("owner_id", user.id).order("created_at", { ascending: false });
        if (error) throw error;
        const listings = await Promise.all((data || []).map(async listing => ({
          ...listing,
          photos: await Promise.all((listing.photo_paths || []).map(async path => {
            const { data: signed } = await db.storage.from(BUCKET).createSignedUrl(path, 1800);
            return { path, url: signed?.signedUrl || "" };
          }))
        })));
        return reply(res, 200, { listings });
      }

      const body = req.body || {};
      if (body.action === "save") {
        const id = clean(body.id, 50);
        const intent = body.intent === "trade" ? "trade" : "sale";
        const title = clean(body.title, 140), category = clean(body.category, 80);
        const brand = clean(body.brand, 80), model = clean(body.model, 100);
        const condition = clean(body.condition, 100);
        const year = Number(body.manufacture_year);
        const priceOnRequest = body.price_on_request === true;
        const price = priceOnRequest || body.price === "" || body.price == null ? null : Number(body.price);
        const photos = Array.isArray(body.photos) ? body.photos : [];
        if (!title || !category || !brand || !model || !condition) return reply(res, 400, { error: "Preencha título, tipo, marca, modelo e estado de conservação." });
        if (!Number.isInteger(year) || year < 1900 || year > 2100) return reply(res, 400, { error: "Informe um ano válido." });
        if (!priceOnRequest && (!Number.isFinite(price) || price < 0)) return reply(res, 400, { error: "Informe um preço válido ou selecione Sob consulta." });
        if (intent === "trade" && !clean(body.desired_category, 100) && !clean(body.desired_description, 500)) return reply(res, 400, { error: "Informe qual veículo você gostaria de receber na troca." });
        if (photos.length > 10 || photos.some(path => typeof path !== "string" || !photoPattern.test(path) || !path.startsWith(user.id + "/")) || new Set(photos).size !== photos.length) {
          return reply(res, 400, { error: "Envie no máximo 10 fotos válidas do caminhão." });
        }
        const photoNames = photos.map(path => path.slice(user.id.length + 1));
        const { data: uploaded, error: storageError } = await db.storage.from(BUCKET).list(user.id, { limit: 1000 });
        if (storageError) throw storageError;
        const actual = new Set((uploaded || []).map(file => file.name));
        if (photoNames.some(name => !actual.has(name))) return reply(res, 400, { error: "Uma ou mais fotos não terminaram de enviar. Envie-as novamente." });
        const record = {
          intent, title, category, brand, model, manufacture_year: year, condition,
          city: clean(body.city, 100) || null, state: clean(body.state, 80) || null,
          description: clean(body.description) || null, price: priceOnRequest ? null : price,
          price_on_request: priceOnRequest, desired_category: intent === "trade" ? clean(body.desired_category, 100) || null : null,
          desired_description: intent === "trade" ? clean(body.desired_description, 500) || null : null,
          photo_paths: photos, updated_at: new Date().toISOString()
        };
        if (id) {
          const { data: current, error: currentError } = await db.from("private_listings").select("id, status").eq("id", id).eq("owner_id", user.id).maybeSingle();
          if (currentError) throw currentError;
          if (!current) return reply(res, 404, { error: "Rascunho não encontrado." });
          if (!["draft", "changes_requested"].includes(current.status)) return reply(res, 409, { error: "Este anúncio não pode ser editado nesta etapa." });
          if (current.status === "changes_requested" && photos.length < 1) return reply(res, 400, { error: "Envie as fotos ajustadas antes de retornar para revisão." });
          const status = current.status === "changes_requested" ? "under_review" : "draft";
          const { data, error } = await db.from("private_listings").update({ ...record, status, review_note: null }).eq("id", id).eq("owner_id", user.id).select("id, status, fee_cents_snapshot, fee_revision, review_note").single();
          if (error) throw error;
          return reply(res, 200, { listing: data, message: status === "under_review" ? "Ajustes recebidos. O ADM revisará as fotos e liberará o anúncio." : "Rascunho salvo." });
        }
        const { data, error } = await db.from("private_listings").insert({ ...record, owner_id: user.id, status: "draft" })
          .select("id, status, fee_cents_snapshot, fee_revision, review_note").single();
        if (error) throw error;
        return reply(res, 201, { listing: data, message: "Rascunho salvo." });
      }

      if (body.action === "checkout") {
        const id = clean(body.id, 50);
        if (!id) return reply(res, 400, { error: "Anúncio inválido." });
        const { data: listing, error: listingError } = await db.from("private_listings").select("*").eq("id", id).eq("owner_id", user.id).maybeSingle();
        if (listingError) throw listingError;
        if (!listing) return reply(res, 404, { error: "Anúncio não encontrado." });
        if (listing.status !== "draft" || !listing.photo_paths?.length) return reply(res, 409, { error: "Salve os dados e envie pelo menos uma foto antes de continuar." });
        const scope = env.VERCEL_ENV === "production" ? "production" : "preview";
        const { data: fee, error: feeError } = await db.from("marketplace_fees").select("private_listing_fee_cents, revision").eq("scope", scope).maybeSingle();
        if (feeError) throw feeError;
        if (!fee?.private_listing_fee_cents) return reply(res, 409, { error: "A taxa do anúncio ainda não foi definida pelo ADM." });
        if (!env.MERCADOPAGO_ACCESS_TOKEN) return reply(res, 503, { error: "O pagamento ainda não está configurado neste ambiente." });
        const baseUrl = clean(env.MERCADOPAGO_APP_URL, 300) || (env.VERCEL_URL ? "https://" + env.VERCEL_URL : "");
        if (!baseUrl) return reply(res, 503, { error: "URL de pagamento indisponível neste ambiente." });
        const paymentId = uuid();
        const notificationUrl = clean(env.MERCADOPAGO_NOTIFICATION_URL, 500) || baseUrl.replace(/\/$/, "") + "/api/payments/mercadopago";
        const preferenceResponse = await fetchImpl("https://api.mercadopago.com/checkout/preferences", {
          method: "POST",
          headers: { Authorization: "Bearer " + env.MERCADOPAGO_ACCESS_TOKEN, "Content-Type": "application/json", "X-Idempotency-Key": paymentId },
          body: JSON.stringify({
            items: [{ id: "catiramatch-private-listing", title: "Taxa única de anúncio particular - CatiraMatch", quantity: 1, currency_id: "BRL", unit_price: fee.private_listing_fee_cents / 100 }],
            external_reference: listing.id,
            notification_url: notificationUrl,
            back_urls: { success: baseUrl + "/?privatePayment=success", pending: baseUrl + "/?privatePayment=pending", failure: baseUrl + "/?privatePayment=failure" },
            auto_return: "approved",
            metadata: { private_listing_id: listing.id, payment_record_id: paymentId, fee_revision: fee.revision }
          })
        });
        const preference = await preferenceResponse.json().catch(() => ({}));
        if (!preferenceResponse.ok || !preference.id || !(preference.init_point || preference.sandbox_init_point)) {
          console.error("[CatiraMatch Mercado Pago preference]", preferenceResponse.status);
          return reply(res, 502, { error: "Não foi possível iniciar o pagamento. Tente novamente." });
        }
        const checkoutUrl = env.VERCEL_ENV === "production" ? preference.init_point : (preference.sandbox_init_point || preference.init_point);
        const { error: paymentInsertError } = await db.from("private_listing_payments").insert({
          id: paymentId, private_listing_id: listing.id, fee_cents: fee.private_listing_fee_cents,
          fee_revision: fee.revision, mercadopago_preference_id: preference.id,
          checkout_url: checkoutUrl, status: "pending"
        });
        if (paymentInsertError) throw paymentInsertError;
        const { data: updated, error: updateError } = await db.from("private_listings").update({
          status: "awaiting_payment", fee_cents_snapshot: fee.private_listing_fee_cents, fee_revision: fee.revision, updated_at: new Date().toISOString()
        }).eq("id", listing.id).eq("owner_id", user.id).select("id, status, fee_cents_snapshot, fee_revision").single();
        if (updateError) throw updateError;
        return reply(res, 200, { listing: updated, checkout_url: checkoutUrl });
      }
      return reply(res, 400, { error: "Ação inválida." });
    } catch (error) {
      console.error("[CatiraMatch private listings]", error?.code || "unexpected_error");
      return reply(res, 500, { error: "Não foi possível processar o anúncio particular." });
    }
  };
}

export function createPrivatePhotoTokenHandler({ createClient, env = process.env, uuid = randomUUID }) {
  return async function handler(req, res) {
    if (req.method !== "POST") { res.setHeader("Allow", "POST"); return reply(res, 405, { error: "Método não permitido." }); }
    const { SUPABASE_URL: url, SUPABASE_ANON_KEY: anon, SUPABASE_SERVICE_ROLE_KEY: service } = env;
    if (!url || !anon || !service) return reply(res, 503, { error: "Envio de fotos indisponível." });
    const token = (req.headers.authorization || "").match(/^Bearer (\S+)$/)?.[1];
    if (!token) return reply(res, 401, { error: "Entre na sua conta para continuar." });
    const type = clean(req.body?.content_type, 50).toLowerCase();
    const size = Number(req.body?.size), listingId = clean(req.body?.listing_id, 50);
    if (!TYPES[type] || !Number.isInteger(size) || size < 1 || size > 10 * 1024 * 1024) return reply(res, 400, { error: "Use foto JPG, PNG ou WebP de até 10 MB." });
    const publicClient = createClient(url, anon, OPTIONS), db = createClient(url, service, OPTIONS);
    try {
      const { data: identity, error: authError } = await publicClient.auth.getUser(token);
      if (authError || !identity?.user) return reply(res, 401, { error: "Sessão inválida ou expirada." });
      const { data: profile, error: profileError } = await db.from("profiles").select("role").eq("id", identity.user.id).maybeSingle();
      if (profileError) throw profileError;
      if (profile?.role !== "buyer") return reply(res, 403, { error: "O envio de fotos particulares é exclusivo para pessoa física." });
      const { data: agencyRequest, error: agencyError } = await db.from("agency_signup_requests").select("status").eq("user_id", identity.user.id).maybeSingle();
      if (agencyError) throw agencyError;
      if (agencyRequest && agencyRequest.status !== "approved") return reply(res, 403, { error: "Seu cadastro de vendedor está aguardando a finalização pelo especialista." });
      const { data: listing, error } = await db.from("private_listings").select("id, status").eq("id", listingId).eq("owner_id", identity.user.id).maybeSingle();
      if (error) throw error;
      if (!listing || !["draft", "changes_requested"].includes(listing.status)) return reply(res, 403, { error: "Este anúncio não permite novas fotos nesta etapa." });
      const path = identity.user.id + "/" + uuid() + "." + TYPES[type];
      const { data, error: signedError } = await db.storage.from(BUCKET).createSignedUploadUrl(path);
      if (signedError || !data?.token) throw signedError || new Error("missing_upload_token");
      return reply(res, 200, { path, token: data.token });
    } catch (error) {
      console.error("[CatiraMatch private photo token]", error?.code || "unexpected_error");
      return reply(res, 500, { error: "Não foi possível preparar o envio da foto." });
    }
  };
}
