import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Script } from "node:vm";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const admin = read("apoio-gestao-preview.html");
const catalog = read("apoio-motorista-preview.html");
const integration = read("supabase-integration.js");
const access = read("api/admin/apoio-access.js");

test("gestão integrada como aba própria do ADM, sem duplicar navegação", () => {
  assert.match(integration, /data-pane="support">Apoio ao motorista/);
  assert.match(integration, /id="hmAdminApoio"/);
  assert.match(integration, /href="\/apoio-gestao-preview\.html"/);
  assert.match(integration, /document\.getElementById\("hmAdminApoio"\)\.hidden = pane !== "support"/);
  assert.match(integration, /hmAdminNav/);
});

test("somente o servidor decide quem pode abrir a gestão", () => {
  assert.match(admin, /\/api\/admin\/apoio-access/);
  assert.match(admin, /if\(!access\.ok\|\|!result\.authorized\)/);
  assert.match(access, /auth\.getUser\(token\)/);
  assert.match(access, /\.from\("profiles"\)/);
  assert.match(access, /profile\?\.role !== "admin"/);
  assert.doesNotMatch(access, /\.insert\(|\.upsert\(|\.update\(|\.delete\(/);
  assert.match(access, /req\.method !== "GET"/);
});

test("rascunhos e anúncios não são gravados no banco compartilhado", () => {
  assert.match(admin, /catiramatch_apoio_preview_v1/);
  assert.match(catalog, /catiramatch_apoio_preview_v1/);
  assert.match(admin, /localStorage\.setItem/);
  assert.doesNotMatch(admin, /\.from\("vehicles"\)|\.from\("support_partners"\)/);
  assert.match(catalog, /x\.status==="published"/);
});

test("cadastro oferece todas as categorias, fotos, WhatsApp e publicação", () => {
  for (const kind of ["despachante", "pecas", "guincho", "reboque", "eletricista", "mecanica", "outros"]) {
    assert.ok(admin.includes(kind), "Faltou " + kind);
    assert.ok(catalog.includes(kind), "Faltou " + kind + " na vitrine");
  }
  for (const id of ["partnerForm","addPartner","status","phone","image","search","filterCategory","removeImage"]) {
    assert.ok(admin.includes('id="' + id + '"'), "Faltou controle " + id);
  }
  assert.match(admin, /validPhone\(value\.phone\)/);
  assert.match(catalog, /https:\/\/wa\.me\/55/);
});

test("scripts inline das páginas são sintaticamente válidos", () => {
  for (const page of [admin, catalog]) {
    const scripts = [...page.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
    assert.ok(scripts.length, "Página sem script");
    for (const match of scripts) new Script(match[1]);
  }
});

test("apenas nome, telefone e setor são obrigatórios no formulário", () => {
  const field = id => {
    const match = admin.match(new RegExp("<(?:input|select|textarea)\\\\b[^>]*\\\\bid=\\\"" + id + "\\\"[^>]*>"));
    assert.ok(match, "Campo ausente: " + id);
    return match[0];
  };
  for (const id of ["name", "category", "phone"]) assert.match(field(id), /\\brequired\\b/, id + " deveria ser obrigatório");
  for (const id of ["city", "state", "description", "address", "region", "hours", "image"]) {
    assert.doesNotMatch(field(id), /\\brequired\\b/, id + " deve ser opcional");
  }
  assert.match(admin, /if\\(!value\\.name\\|\\|!CATS\\[value\\.category\\]\\|\\|!value\\.phone\\)/);
  assert.doesNotMatch(admin, /!value\\.city|!value\\.description|!STATES\\.includes\\(value\\.state\\)\\|\\|/);
  assert.match(admin, /value\\.state&&\\!STATES\\.includes\\(value\\.state\\)/);
  assert.match(catalog, /var location=\\[p\\.city,p\\.state\\]\\.filter\\(Boolean\\)/);
});
