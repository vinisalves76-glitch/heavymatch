import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(path, import.meta.url), "utf8");
const [ui, profileApi, html] = await Promise.all([
  read("../supabase-integration.js"),
  read("../api/auth/profile.js"),
  read("../index.html")
]);

function formHarness() {
  const begin = ui.indexOf("  function setAuthMode(mode) {");
  const end = ui.indexOf("  function resetAuthForm() {", begin);
  assert.ok(begin > -1 && end > begin);
  const nodes = new Map();
  const lookup = name => {
    if (!nodes.has(name)) nodes.set(name, { id: name, hidden: false, required: true, value: "", textContent: "", autocomplete: "" });
    return nodes.get(name);
  };
  const context = {
    document: {
      getElementById: lookup,
      querySelector: lookup
    },
    authMode: "login",
    currentUser: null,
    message() {}
  };
  vm.runInNewContext(ui.slice(begin, end) + "\nthis.setAuthMode=setAuthMode;this.getMode=()=>authMode;", context);
  return {context, lookup};
}

test("formulário de recuperação pede somente e-mail", () => {
  const {context, lookup} = formHarness();
  context.setAuthMode("recover");
  assert.equal(context.getMode(), "recover");
  assert.equal(lookup("hmAuthEmail").required, true);
  assert.equal(lookup("hmAuthPassword").hidden, true);
  assert.equal(lookup("hmAuthPassword").required, false);
  assert.equal(lookup("hmAuthConfirmPassword").hidden, true);
  assert.equal(lookup("hmAuthSubmit").textContent, "Enviar link de recuperação");
});

test("link de recuperação exige nova senha e confirmação, não email", () => {
  const {context, lookup} = formHarness();
  context.setAuthMode("reset");
  assert.equal(lookup("hmAuthEmail").hidden, true);
  assert.equal(lookup("hmAuthEmail").required, false);
  assert.equal(lookup("hmAuthPassword").required, true);
  assert.equal(lookup("hmAuthConfirmPassword").required, true);
  assert.equal(lookup("hmAuthSubmit").textContent, "Atualizar senha");
});

test("cadastro preserva a separação de nome/telefone/endereço e senha", () => {
  const {context, lookup} = formHarness();
  context.setAuthMode("signup");
  for (const field of ["Name", "Phone", "Address"]) {
    assert.equal(lookup("hmAuth" + field).hidden, false);
    assert.equal(lookup("hmAuth" + field).required, true);
  }
  assert.equal(lookup("hmAuthConfirmPassword").required, true);
  context.setAuthMode("login");
  assert.equal(lookup("hmAuthConfirmPassword").hidden, true);
  assert.equal(lookup("hmAuthRecovery").hidden, false);
});

test("recuperação usa link por e-mail e valida sessão antes de salvar senha", () => {
  assert.match(ui, /auth\.resetPasswordForEmail\(email,\s*\{ redirectTo \}\)/);
  assert.match(ui, /event === "PASSWORD_RECOVERY"/);
  assert.match(ui, /authMode === "recover"/);
  assert.match(ui, /if \(!recoveryPending\) throw new Error/);
  assert.match(ui, /auth\.getUser\(\)/);
  assert.match(ui, /auth\.updateUser\(\{ password \}\)/);
  assert.match(ui, /auth\.signOut\(\)/);
  assert.doesNotMatch(ui, /authMode === "forgot"/);
});

test("login de comprador cria perfil próprio e não aceita role do navegador", () => {
  assert.match(ui, /ensureAccountProfile\(\)/);
  assert.match(profileApi, /role: "buyer"/);
  assert.match(profileApi, /auth\.getUser\(token\)/);
  assert.match(profileApi, /role: profile\.role/);
});

test("correção não altera ações do swipe", () => {
  assert.match(html, /swipeActions=\{left:pass,right:like\}/);
  assert.match(html, /if\(dx>0\)\{like\(\);\}else\{pass\(\);\}/);
});
