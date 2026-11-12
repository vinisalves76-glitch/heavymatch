import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../api/auth/profile.js", import.meta.url), "utf8");

function setup({ user, existing } = {}) {
  const records = new Map();
  if (existing) records.set(existing.id, existing);
  const writes = [];
  const db = {
    from(table) {
      assert.equal(table, "profiles");
      return {
        select(fields) {
          assert.match(fields, /role/);
          return {
            eq(column, id) {
              assert.equal(column, "id");
              return {
                async maybeSingle() {
                  return { data: records.get(id) || null, error: null };
                }
              };
            }
          };
        },
        async insert(profile) {
          writes.push(profile);
          records.set(profile.id, profile);
          return { error: null };
        }
      };
    }
  };
  const createClient = (_url, key) => key === "public"
    ? { auth: { getUser: async token => ({ data: { user: token === "valid" ? user : null }, error: null }) } }
    : db;
  const context = {
    createClient,
    process: { env: {
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_ANON_KEY: "public",
      SUPABASE_SERVICE_ROLE_KEY: "private"
    }},
    console
  };
  const script = source
    .replace(/^import .*;\s*/, "")
    .replace("export default async function handler", "async function handler") +
    "\nthis.handler = handler;";
  vm.runInNewContext(script, context);
  const response = () => ({
    code: 200,
    setHeader() {},
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; }
  });
  return { handler: context.handler, response, writes, records };
}

test("sem token, criação de perfil não é permitida", async () => {
  const app = setup();
  const res = app.response();
  await app.handler({ method: "POST", headers: {} }, res);
  assert.equal(res.code, 401);
  assert.equal(app.writes.length, 0);
});

test("criação de login provisiona comprador sem aceitar elevação por metadata", async () => {
  const user = { id: "buyer-1", user_metadata: {
    full_name: "Cliente Teste",
    phone: "(31) 99999-9999",
    role: "admin", account_type: "seller"
  }};
  const app = setup({ user });
  const res = app.response();
  await app.handler({ method: "POST", headers: { authorization: "Bearer valid" } }, res);
  assert.equal(res.code, 200);
  assert.equal(res.body.profile.role, "buyer");
  assert.equal(app.writes[0].role, "buyer");
  assert.equal(app.writes[0].full_name, "Cliente Teste");
  assert.equal(app.writes[0].phone, "(31) 99999-9999");
});

test("login existente preserva os privilégios dos vendedores e admins", async () => {
  const user = { id: "seller-1", user_metadata: { account_type: "buyer" } };
  const app = setup({ user, existing: { id: "seller-1", role: "seller", full_name: "Vendedor", phone: "" } });
  const res = app.response();
  await app.handler({ method: "POST", headers: { authorization: "Bearer valid" } }, res);
  assert.equal(res.code, 200);
  assert.equal(res.body.profile.role, "seller");
  assert.equal(app.writes.length, 0);
});

test("fluxo da interface chama API de perfil na entrada e ao criar sessão", async () => {
  const ui = await readFile(new URL("../supabase-integration.js", import.meta.url), "utf8");
  assert.match(ui, /hmApiRequest\("\/api\/auth\/profile"/);
  assert.match(ui, /await showSignedIn\(data\.user\)/);
  assert.match(ui, /ensureAccountProfile\(data\.session\.access_token\)/);
});
