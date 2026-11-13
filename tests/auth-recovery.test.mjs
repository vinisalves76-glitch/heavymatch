import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const load = path => readFile(new URL(path, import.meta.url), "utf8");
const auth = await load("../supabase-integration.js");
const index = await load("../index.html");
test("a tela de login oferece recuperação e formulário de nova senha", () => {
  for(const id of ["hmAuthForgot","hmAuthRecoveryRequestForm","hmRecoveryEmail","hmAuthNewPasswordForm","hmRecoveryNewPassword","hmRecoveryConfirmPassword"]){
    assert.match(auth, new RegExp('id="'+id+'"'));
  }
  assert.match(auth, /setAuthMode\("reset-request"\)/);
  assert.match(auth, /setAuthMode\("reset-update"\)/);
});
test("envio da recuperação usa o cliente Supabase e retorna para a Preview",()=>{
  assert.match(auth, /auth\.resetPasswordForEmail\(email,\s*\{\s*redirectTo\s*\}\)/);
  assert.match(auth, /window\.location\.origin\s*\+\s*window\.location\.pathname/);
  assert.match(auth, /auth\s*:\s*true|auth=recover/);
});
test("link de recuperação exige sessão antes de alterar a senha",()=>{
  assert.match(auth, /event\s*===\s*"PASSWORD_RECOVERY"/);
  assert.match(auth, /if\s*\(sessionError\s*\|\|\s*!session\?\.user\)/);
  assert.match(auth, /auth\.updateUser\(\{\s*password\s*\}\)/);
  assert.match(auth, /password\s*!==\s*confirm/);
  assert.match(auth, /auth\.signOut\(\)/);
});
test("mensagens de erro não revelam dados de conta e indicam recuperação",()=>{
  assert.match(auth, /Se este e-mail estiver cadastrado/);
  assert.match(auth, /Esqueci minha senha/);
  assert.match(auth, /Confirme sua conta pelo link enviado/);
});
test("botões e gestos do marketplace não foram alterados",()=>{
  assert.match(index, /swipeActions=\{left:pass,right:like\}/);
  assert.match(index, /if\(dx>0\)\{like\(\);\}else\{pass\(\);\}/);
});
