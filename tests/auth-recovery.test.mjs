import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const ui = await readFile(new URL("../supabase-integration.js", import.meta.url), "utf8");
const profile = await readFile(new URL("../api/auth/profile.js", import.meta.url), "utf8");
const index = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("login exibe recuperação de senha com email obrigatório", () => {
  assert.match(ui, /id="hmAuthForgot">Esqueci minha senha/);
  assert.match(ui, /resetPasswordForEmail\(email, \{ redirectTo \}\)/);
  assert.match(ui, /\?hmRecovery=1/);
  assert.match(ui, /authMode === "forgot"/);
  assert.match(ui, /password\.required = !forgot/);
});

test("link de recuperação apresenta nova senha com confirmação", () => {
  assert.match(ui, /event === "PASSWORD_RECOVERY"/);
  assert.match(ui, /function enterResetFlow\(/);
  assert.match(ui, /supabaseClient\.auth\.updateUser\(\{ password \}\)/);
  assert.match(ui, /password !== confirmPassword/);
  assert.match(ui, /const \{ error: signOutError \} = await supabaseClient\.auth\.signOut\(\)/);
  assert.match(ui, /cleanUrl\.searchParams\.delete\("hmRecovery"\)/);
});

test("perfil é criado para usuário autenticado, sem aceitar role enviada pelo cliente", () => {
  assert.match(ui, /await ensureAccountProfile\(\)/);
  assert.match(ui, /method: "POST"/);
  assert.match(ui, /"\/api\/auth\/profile"/);
  assert.match(profile, /authClient\.auth\.getUser\(token\)/);
  assert.match(profile, /role: "buyer"/);
  assert.match(profile, /if \(!profile\)/);
  assert.match(profile, /if \(insertError && insertError\.code !== "23505"\)/);
});

test("cadastro existente tem mensagem neutra e orienta para recuperar acesso", () => {
  assert.match(ui, /Se você já tinha uma conta, use Entrar ou Esqueci minha senha/);
  assert.match(ui, /Não foi possível entrar com esse e-mail e senha/);
  assert.match(ui, /Confira também o spam/);
});

test("não há regressão nas ações dos cartões", () => {
  assert.match(index, /const swipeActions=\{left:pass,right:like\}/);
  assert.match(index, /if\(dx>0\)\{like\(\);\}else\{pass\(\);\}/);
});
