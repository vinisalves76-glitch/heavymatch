import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const read=path=>readFile(new URL(path,import.meta.url),"utf8");
const [page,brandCss,mobileCss,auth,tour,menu]=await Promise.all([
  read("../index.html"),
  read("../styles/catiramatch-theme.css"),
  read("../styles/mobile-discovery.css"),
  read("../supabase-integration.js"),
  read("../guided-tour.js"),
  read("../mobile-discovery.js")
]);

test("logo do Catira.com continua PNG transparente no cabeçalho",()=>{
  assert.match(page,/<header class="topbar"><div class="brand"><div class="brand-signature"><img class="brand-logo" src="\/assets\/catiracom-icon-dark.png"/);
  assert.match(page,/class="brand-name">Catira\.com<\/span>/);
  assert.match(brandCss,/\.brand \.brand-logo\{[^}]*background:transparent;[^}]*border:0;[^}]*border-radius:0;[^}]*padding:0;[^}]*box-shadow:none/);
  assert.match(mobileCss,/\.topbar \.brand \.brand-logo\{[^}]*background:transparent;border-radius:0;box-shadow:none/);
});

test("layout efetivo agora usa UMA linha compacta no mobile e não sobrepõe a logo",()=>{
  assert.match(page,/<link rel="stylesheet" href="\/styles\/catiramatch-theme.css">\s*<link rel="stylesheet" href="\/styles\/mobile-discovery.css">/);
  assert.match(mobileCss,/\.topbar\{position:relative;[^}]*height:56px;min-height:56px;display:flex;/);
  assert.match(mobileCss,/\.topbar \.brand\{[^}]*flex-direction:row;/);
  assert.match(mobileCss,/\.topbar \.top-actions\{display:none!important\}/);
  assert.match(mobileCss,/\.topbar \.brand:after\{content:'Pra você'/);
});

test("Entrar, Ajuda, Sair e gestão de anúncios continuam acessíveis pelo menu Conta",()=>{
  assert.match(menu,/id="hmMenuAccount"/);
  assert.match(menu,/id="hmMenuHelp"/);
  assert.match(menu,/id="hmMenuLogout"/);
  assert.match(menu,/id="hmMenuListings"/);
  assert.match(menu,/id="hmMenuAdmin"/);
  assert.match(menu,/forward\("hmMenuAccount","hmAccountButton"\)/);
  assert.match(menu,/forward\("hmMenuHelp","hmTourHelp"\)/);
  assert.match(menu,/forward\("hmMenuLogout","hmTopLogout"\)/);
  assert.match(menu,/forward\("hmMenuListings","sellerNav"\)/);
  assert.match(menu,/forward\("hmMenuAdmin","hmAdminNav"\)/);
  assert.match(auth,/id = "hmAccountButton"/);
  assert.match(tour,/help\.id = "hmTourHelp"/);
  assert.match(page,/id="profileNav"/);
  assert.match(page,/hmMobileOpenMenu\?\.\(\)/);
});

test("cabeçalho e menu não mudam a direção de curtir/passar",()=>{
  assert.match(page,/const swipeActions=\{left:pass,right:like\}/);
  assert.match(page,/if\(dx>0\)\{like\(\);\}else\{pass\(\);\}/);
});
