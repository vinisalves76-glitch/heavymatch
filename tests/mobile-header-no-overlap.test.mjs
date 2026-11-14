import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const read=path=>readFile(new URL(path,import.meta.url),"utf8");
const [page,theme,auth,tour]=await Promise.all([
  read("../index.html"),
  read("../styles/catiramatch-theme.css"),
  read("../supabase-integration.js"),
  read("../guided-tour.js")
]);

test("logo do CatiraMatch usa PNG transparente e não muda no mobile",()=>{
  assert.match(page,/<header class="topbar"><div class="brand"><img class="brand-logo" src="\/assets\/catiramatch-logo-header.png"/);
  assert.match(theme,/\.brand \.brand-logo\{[^}]*background:transparent;[^}]*border:0;[^}]*border-radius:0;[^}]*padding:0;[^}]*box-shadow:none/);
  assert.match(theme,/\.topbar \.brand \.brand-logo\{[^}]*background:transparent;[^}]*box-shadow:none/);
});

test("no celular a marca ocupa linha independente dos botões",()=>{
  assert.match(theme,/@media\(max-width:799px\)\{[\s\S]*?\.topbar\{height:auto;min-height:105px;display:grid;grid-template-columns:minmax\(0,1fr\);grid-template-rows:minmax\(42px,auto\) 39px/);
  assert.match(theme,/\.topbar \.brand\{grid-column:1;grid-row:1;/);
  assert.match(theme,/\.topbar \.top-actions\{grid-column:1;grid-row:2;/);
  assert.match(theme,/\.topbar \.brand:after\{content:'Pra você'/);
  assert.match(theme,/\.topbar \.top-actions\{[^}]*flex-wrap:nowrap/);
  assert.doesNotMatch(theme,/\.topbar\{height:76px/);
});

test("ações superiores ficam compactas mas continuam acessíveis",()=>{
  assert.match(theme,/\.topbar #hmAccountButton\{[^}]*max-width:110px/);
  assert.match(theme,/\.topbar #hmTopLogout:not\(\[hidden\]\)\{[^}]*min-height:36px/);
  assert.match(theme,/\.topbar \.top-btn\{[^}]*width:36px/);
  assert.match(theme,/\.topbar #hmTourHelp\{[^}]*width:36px/);
  assert.match(theme,/\.topbar #hmTourHelp:before\{content:'\?'/);
  assert.match(theme,/@media\(max-width:360px\)\{/);
  assert.match(auth,/id = "hmAccountButton"/);
  assert.match(auth,/id = "hmTopLogout"/);
  assert.match(tour,/help\.id = "hmTourHelp"/);
  assert.match(tour,/help\.setAttribute\("aria-label", "Aprender a usar o CatiraMatch"\)/);
  assert.match(page,/id="filtersNav"/);
  assert.match(page,/id="favoritesJump"/);
});

test("o cabeçalho não altera gestos do CatiraMatch",()=>{
  assert.match(page,/const swipeActions=\{left:pass,right:like\}/);
  assert.match(page,/if\(dx>0\)\{like\(\);\}else\{pass\(\);\}/);
});
