import test from "node:test";
import assert from "node:assert/strict";
import { createFeesHandler } from "../lib/admin-fees-handler.js";
import { parseFeeInput, formatFee, feeInputValue } from "../lib/listing-fee.js";

function app({ role = "admin", valid = true, environment = "preview", missing = false } = {}) {
  const rows = new Map(["preview", "production"].map(scope => [scope, { private_listing_fee_cents: null, revision: 0, updated_at: null }]));
  let writes = 0;
  const db = { from(table) {
    let update = null;
    const filters = {};
    return {
      update(value) { update = value; return this; },
      select() { return this; },
      eq(key, value) { filters[key] = value; return this; },
      async maybeSingle() {
        if (table === "profiles") return { data: { role }, error: null };
        if (missing) return { data: null, error: { code: "PGRST205" } };
        const row = rows.get(filters.scope);
        if (update && row?.revision !== filters.revision) return { data: null, error: null };
        if (update) { Object.assign(row, update); writes++; }
        return { data: row ? { ...row } : null, error: null };
      }
    };
  } };
  const handler = createFeesHandler({
    env: { SUPABASE_URL: "https://test.supabase.co", SUPABASE_ANON_KEY: "anon", SUPABASE_SERVICE_ROLE_KEY: "service", VERCEL_ENV: environment },
    now: () => "2026-11-15T15:00:00Z",
    createClient: (_url, key) => key === "anon" ? { auth: { getUser: async () => ({ data: valid ? { user: { id: "admin-id", user_metadata: { role: "admin" } } } : null, error: valid ? null : {} }) } } : db
  });
  return {
    rows, get writes() { return writes; },
    async request(method = "GET", body, token = "session") {
      const response = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(code) { this.code = code; return this; }, json(value) { this.body = value; return this; } };
      await handler({ method, headers: token ? { authorization: "Bearer " + token } : {}, body }, response);
      return response;
    }
  };
}

test("taxa aceita reais e centavos sem converter campo vazio em gratuidade", () => {
  for (const [value, cents] of [["49,90", 4990], ["R$ 1.234,56", 123456], ["49.90", 4990], ["50", 5000], ["0,01", 1]]) assert.equal(parseFeeInput(value), cents);
  for (const value of ["", " ", "0", "-1", "1,234", "2e2", "NaN", "1.2.3", "1 000,00", "99999999999999999999"]) assert.equal(parseFeeInput(value), null);
  assert.equal(formatFee(null), "Não definida");
  assert.equal(feeInputValue(4990), "49,90");
});

test("sem sessão ou com sessão inválida não pode ler nem alterar taxa", async () => {
  const a = app();
  assert.equal((await a.request("GET", null, "")).code, 401);
  assert.equal((await app({ valid: false }).request("PUT", { amount_cents: 100, revision: 0 })).code, 401);
  assert.equal(a.writes, 0);
});

test("seller e buyer são negados mesmo com metadata admin", async () => {
  for (const role of ["seller", "buyer"]) {
    const a = app({ role });
    assert.equal((await a.request()).code, 403);
    assert.equal((await a.request("PUT", { amount_cents: 100, revision: 0 })).code, 403);
    assert.equal(a.writes, 0);
  }
});

test("ADM encontra taxa inicialmente indefinida e salva/reabre valor persistido", async () => {
  const a = app();
  assert.equal((await a.request()).body.fee.amount_cents, null);
  const saved = await a.request("PUT", { amount_cents: 4990, revision: 0 });
  assert.equal(saved.code, 200);
  assert.equal(saved.body.fee.revision, 1);
  assert.equal((await a.request()).body.fee.amount_cents, 4990);
  assert.equal(a.rows.get("preview").updated_by, "admin-id");
});

test("valor negativo, nulo, fracionário, string ou revisão inválida não grava", async () => {
  const a = app();
  for (const amount of [null, undefined, 0, -1, 0.5, "4990", NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal((await a.request("PUT", { amount_cents: amount, revision: 0 })).code, 400);
  }
  assert.equal((await a.request("PUT", { amount_cents: 100, revision: -1 })).code, 400);
  assert.equal(a.writes, 0);
});

test("Preview e produção usam configurações separadas", async () => {
  const preview = app();
  await preview.request("PUT", { amount_cents: 4990, revision: 0, scope: "production" });
  assert.equal(preview.rows.get("production").private_listing_fee_cents, null);
  const prod = app({ environment: "production" });
  await prod.request("PUT", { amount_cents: 5990, revision: 0, scope: "preview" });
  assert.equal(prod.rows.get("preview").private_listing_fee_cents, null);
  assert.equal(prod.rows.get("production").private_listing_fee_cents, 5990);
});

test("edição concorrente é recusada sem sobrescrever valor mais recente", async () => {
  const a = app();
  await a.request("PUT", { amount_cents: 4990, revision: 0 });
  assert.equal((await a.request("PUT", { amount_cents: 9990, revision: 0 })).code, 409);
  assert.equal((await a.request()).body.fee.amount_cents, 4990);
  assert.equal(a.writes, 1);
});

test("estrutura ainda não habilitada retorna indisponibilidade, sem simular sucesso", async () => {
  const a = app({ missing: true });
  assert.equal((await a.request()).code, 503);
  assert.equal((await a.request("PUT", { amount_cents: 100, revision: 0 })).code, 503);
});

test("métodos inesperados são recusados e respostas não ficam em cache", async () => {
  const a = app();
  assert.equal((await a.request("POST")).code, 405);
  assert.equal((await a.request()).headers["Cache-Control"], "no-store");
});
