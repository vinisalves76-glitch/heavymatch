import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const OPTIONS = { auth: { persistSession: false, autoRefreshToken: false } };
function reply(res, status, body) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  return res.status(status).json(body);
}
export function validMercadoPagoSignature({ signature, requestId, dataId, secret }) {
  if (!signature || !requestId || !dataId || !secret) return false;
  const parts = Object.fromEntries(signature.split(",").map(part => part.trim().split("=", 2)));
  if (!parts.ts || !parts.v1 || !/^[a-f0-9]+$/i.test(parts.v1)) return false;
  const manifest = `id:${String(dataId).toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest();
  let supplied;
  try { supplied = Buffer.from(parts.v1, "hex"); } catch { return false; }
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export function createMercadoPagoWebhook({ createClient, env = process.env, fetchImpl = fetch }) {
  return async function handler(req, res) {
    if (req.method !== "POST") { res.setHeader("Allow", "POST"); return reply(res, 405, { error: "Método não permitido." }); }
    const dataId = String(req.query?.["data.id"] || req.query?.data?.id || req.body?.data?.id || "");
    if (!validMercadoPagoSignature({
      signature: req.headers["x-signature"], requestId: req.headers["x-request-id"], dataId, secret: env.MERCADOPAGO_WEBHOOK_SECRET
    })) return reply(res, 401, { error: "Assinatura de notificação inválida." });
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.MERCADOPAGO_ACCESS_TOKEN) return reply(res, 503, { error: "Confirmação de pagamento indisponível." });
    const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, OPTIONS);
    try {
      const response = await fetchImpl("https://api.mercadopago.com/v1/payments/" + encodeURIComponent(dataId), {
        headers: { Authorization: "Bearer " + env.MERCADOPAGO_ACCESS_TOKEN }
      });
      const payment = await response.json().catch(() => ({}));
      if (!response.ok || !payment.id) return reply(res, 502, { error: "Não foi possível consultar o pagamento." });
      const paymentRecordId = payment.metadata?.payment_record_id;
      let paymentQuery = db.from("private_listing_payments").select("*");
      paymentQuery = paymentRecordId
        ? paymentQuery.eq("id", paymentRecordId)
        : paymentQuery.eq("mercadopago_preference_id", String(payment.preference_id || ""));
      const { data: record, error: recordError } = await paymentQuery.maybeSingle();
      if (recordError) throw recordError;
      if (!record || String(payment.external_reference || "") !== record.private_listing_id || String(payment.preference_id || "") !== String(record.mercadopago_preference_id || "")) {
        return reply(res, 200, { received: true, ignored: true });
      }
      const amountCents = Math.round(Number(payment.transaction_amount) * 100);
      if (payment.currency_id !== "BRL" || amountCents !== Number(record.fee_cents)) return reply(res, 200, { received: true, ignored: true });
      const status = payment.status === "approved" ? "approved" : payment.status === "rejected" ? "rejected" : payment.status === "cancelled" ? "cancelled" : "pending";
      const { error: updateError } = await db.from("private_listing_payments").update({
        mercadopago_payment_id: String(payment.id), status,
        approved_at: status === "approved" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }).eq("id", record.id);
      if (updateError) throw updateError;
      const { data: latestPayment, error: latestError } = await db.from("private_listing_payments")
        .select("id").eq("private_listing_id", record.private_listing_id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (latestError) throw latestError;
      if (latestPayment?.id !== record.id) return reply(res, 200, { received: true, ignored: true });
      if (status === "approved") {
        const { error } = await db.from("private_listings").update({
          status: "under_review", updated_at: new Date().toISOString()
        }).eq("id", record.private_listing_id).eq("status", "awaiting_payment");
        if (error) throw error;
      } else if (["rejected", "cancelled"].includes(status)) {
        const { error } = await db.from("private_listings").update({ status: "draft", updated_at: new Date().toISOString() })
          .eq("id", record.private_listing_id).eq("status", "awaiting_payment");
        if (error) throw error;
      }
      return reply(res, 200, { received: true });
    } catch (error) {
      console.error("[CatiraMatch Mercado Pago webhook]", error?.code || "unexpected_error");
      return reply(res, 500, { error: "Não foi possível processar a notificação." });
    }
  };
}

export default createMercadoPagoWebhook({ createClient });
