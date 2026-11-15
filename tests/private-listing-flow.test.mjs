import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createMercadoPagoWebhook, validMercadoPagoSignature } from "../api/payments/mercadopago.js";

const read = path => readFile(new URL(path, import.meta.url), "utf8");
const [authUi, profileApi, privateApi, adminApi, index, sql, mobileMenu] = await Promise.all([
  read("../supabase-integration.js"), read("../api/auth/profile.js"), read("../lib/private-listings-handler.js"),
  read("../lib/admin-marketplace-handler.js"), read("../index.html"), read("../docs/private-listings-migration.sql"), read("../mobile-discovery.js")
]);

test("cadastro público separa pessoa física de solicitação de agência sem elevar role", () => {
  assert.match(authUi, /value="buyer" checked/);
  assert.match(authUi, /value="agency_request"/);
  assert.match(authUi, /Um especialista entrará em contato para finalizar seu cadastro de vendedor/);
  assert.match(profileApi, /account_type === "agency_request"/);
  assert.match(profileApi, /role: "buyer"/);
  assert.match(profileApi, /role: profile\.role/);
  assert.doesNotMatch(profileApi, /role:\s*metadata\.account_type/);
  assert.match(mobileMenu, /hmMenuPrivateListing/);
  assert.match(mobileMenu, /accountRole!=="buyer" \|\| !!agencyRequestStatus/);
});

test("anúncio particular usa APIs dedicadas e exige role buyer validado no servidor", () => {
  assert.match(privateApi, /profile\?\.role !== "buyer"/);
  assert.match(privateApi, /agency_signup_requests/);
  assert.match(privateApi, /private_listings/);
  assert.match(privateApi, /status !== "draft"/);
  assert.doesNotMatch(privateApi, /from\("vehicles"\)\.insert/);
  assert.match(index, /private-listing\.js/);
});

test("taxa e revisão são congeladas no pagamento e o valor vem do servidor", () => {
  assert.match(privateApi, /VERCEL_ENV === "production" \? "production" : "preview"/);
  assert.match(privateApi, /marketplace_fees/);
  assert.match(privateApi, /fee_cents: fee\.private_listing_fee_cents/);
  assert.match(privateApi, /fee_revision: fee\.revision/);
  assert.match(privateApi, /MERCADOPAGO_ACCESS_TOKEN/);
  assert.match(privateApi, /checkout\/preferences/);
});

test("assinatura HMAC do Mercado Pago aceita apenas a assinatura correta", () => {
  const secret = "webhook-secret-test", id = "123456", requestId = "req-test", ts = "1794760000";
  const manifest = `id:${id};request-id:${requestId};ts:${ts};`;
  const digest = createHmac("sha256", secret).update(manifest).digest("hex");
  const signature = `ts=${ts},v1=${digest}`;
  assert.equal(validMercadoPagoSignature({ signature, requestId, dataId: id, secret }), true);
  assert.equal(validMercadoPagoSignature({ signature, requestId: "other", dataId: id, secret }), false);
  assert.equal(validMercadoPagoSignature({ signature, requestId, dataId: id, secret: "wrong-secret" }), false);
});

test("webhook consulta Mercado Pago e só avança anúncio após pagamento confirmado", async () => {
  const secret = "webhook-secret-test", dataId = "555", requestId = "req-555", ts = "1794760000";
  const signature = `ts=${ts},v1=${createHmac("sha256", secret).update(`id:${dataId};request-id:${requestId};ts:${ts};`).digest("hex")}`;
  const calls = [];
  const record = { id: "payrow", private_listing_id: "listing1", mercadopago_preference_id: "pref1", fee_cents: 4990 };
  const db = {
    from(table) {
      return {
        select() {
          const query = { eq() { return query; }, order() { return query; }, limit() { return query; }, async maybeSingle() { return { data: table === "private_listing_payments" ? record : null, error: null }; } };
          return query;
        },
        update(values) {
          const query = { eq() { return query; }, then(resolve) { calls.push({ table, values }); resolve({ error: null }); } };
          return query;
        }
      };
    }
  };
  const handler = createMercadoPagoWebhook({
    createClient: () => db,
    env: { SUPABASE_URL: "https://example.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "server-secret", MERCADOPAGO_ACCESS_TOKEN: "mp-token", MERCADOPAGO_WEBHOOK_SECRET: secret },
    fetchImpl: async () => ({ ok: true, async json() { return { id: dataId, external_reference: "listing1", preference_id: "pref1", transaction_amount: 49.9, currency_id: "BRL", status: "approved", metadata: { payment_record_id: "payrow" } }; } })
  });
  const res = { statusCode: 0, setHeader() {}, status(code) { this.statusCode = code; return this; }, json(value) { this.body = value; return this; } };
  await handler({ method: "POST", query: { "data.id": dataId }, headers: { "x-signature": signature, "x-request-id": requestId }, body: {} }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(calls.find(call => call.table === "private_listing_payments")?.values.status, "approved");
  assert.equal(calls.find(call => call.table === "private_listings")?.values.status, "under_review");
});

test("ADM solicita ajuste de fotos e publica somente com vendedor e pagamento aprovado", () => {
  assert.match(adminApi, /action === "request_photos"/);
  assert.match(adminApi, /action === "publish"/);
  assert.match(adminApi, /seller\.role !== "seller"/);
  assert.match(adminApi, /publish_private_listing/);
  assert.doesNotMatch(adminApi, /action === "reject"/);
  assert.match(sql, /'changes_requested'/);
  assert.match(sql, /'published'/);
  assert.match(sql, /p\.status = 'approved'/);
  assert.match(sql, /grant execute on function public\.publish_private_listing/);
});

test("dados privados ficam atrás de RLS e as APIs têm permissão exclusiva do backend", () => {
  assert.match(sql, /alter table public\.agency_signup_requests enable row level security/i);
  assert.match(sql, /alter table public\.private_listings enable row level security/i);
  assert.match(sql, /alter table public\.private_listing_payments enable row level security/i);
  assert.match(sql, /revoke all .* from public, anon, authenticated/i);
  assert.match(sql, /grant select, insert, update, delete .* to service_role/i);
});
