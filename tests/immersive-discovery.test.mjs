import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const read=path=>readFile(new URL(path,import.meta.url),"utf8");
const [html,css,menu,tour,form]=await Promise.all([
  read("../index.html"),
  read("../styles/mobile-discovery.css"),
  read("../mobile-discovery.js"),
  read("../guided-tour.js"),
  read("../equipment-marketplace.js")
]);

test("a imagem domina a tela no celular com fotos horizontais inteiras",()=>{
  assert.match(html,/id="hmPhotoBackdrop"/);
  assert.match(html,/id="activeEquipmentPhoto"/);
  assert.ok(html.includes("const blurred=$(\'hmPhotoBackdrop\')"));
  assert.match(css,/\.feed \.photo\{[^}]*height:calc\(100svh - 136px\);height:calc\(100dvh - 136px - env\(safe-area-inset-bottom\)\)/);
  assert.match(css,/\.feed \.photo #activeEquipmentPhoto\{[^}]*object-fit:contain/);
  assert.match(css,/\.feed \.photo \.hm-photo-backdrop\{[^}]*object-fit:cover/);
  assert.match(css,/filter:blur\(19px\) brightness\(\.52\)/);
  assert.match(css,/\.feed \.photo-info\{[^}]*bottom:105px/);
  assert.match(html,/class="hm-hero-price">\$\{esc\(v\.price\)\}/);
  assert.match(css,/\.feed \.hm-hero-price\{display:block/);
});

test("X, detalhes, WhatsApp e coração acessíveis sobre a foto",()=>{
  const action=html.match(/<div class="secondary-actions"[^>]*>([\s\S]*?)<\/div>/)?.[1]||"";
  const expected=["passBtn","hmMobileDetails","hmMobileContact","likeBtn"];
  let last=-1;for(const id of expected){const at=action.indexOf('id="'+id+'"');assert.ok(at>last,'ordem '+id);last=at;}
  assert.match(css,/#secondaryActions #passBtn\{order:0/);
  assert.match(css,/#secondaryActions #hmMobileContact\{order:2/);
  assert.match(css,/#secondaryActions #likeBtn\{order:3/);
  assert.match(css,/#secondaryActions\{[^}]*backdrop-filter:blur\(15px\)/);
  assert.ok(html.includes("$(\'hmMobileDetails\').addEventListener(\'click\',openDetails)"));
  assert.ok(html.includes("$(\'hmMobileContact\').addEventListener(\'click\',contact)"));
  assert.match(html,/const swipeActions=\{left:pass,right:like\}/);
});

test("somente quatro destinos principais visíveis no rodapé do comprador",()=>{
  const nav=html.match(/<nav class="bottom-nav"[\s\S]*?<\/nav>/)?.[0]||"";
  for(const id of ["homeNav","exploreNav","savedNav","profileNav"])assert.match(nav,new RegExp('id="'+id+'"'));
  assert.match(css,/\.bottom-nav #chatNav,\.bottom-nav #sellerNav,\.bottom-nav #hmAdminNav\{display:none!important\}/);
  assert.match(css,/\.bottom-nav\{[^}]*min-height:70px/);
  assert.match(css,/\.bottom-nav \.nav-item svg\{[^}]*width:23px/);
  assert.match(html,/hmMobileOpenMenu\?\.\(\)/);
});

test("CTA do vendedor e do ADM e funções de login estão no menu Conta",()=>{
  assert.match(menu,/id="hmMenuAccount"/);
  assert.match(menu,/id="hmMenuListings" hidden/);
  assert.match(menu,/id="hmMenuAdmin" hidden/);
  assert.match(menu,/id="hmMenuProfile" hidden/);
  assert.match(menu,/id="hmMenuHelp"/);
  assert.match(menu,/id="hmMenuLogout" hidden/);
  assert.match(menu,/forward\("hmMenuListings","sellerNav"\)/);
  assert.match(menu,/forward\("hmMenuAdmin","hmAdminNav"\)/);
  assert.match(menu,/forward\("hmMenuAccount","hmAccountButton"\)/);
  assert.match(menu,/forward\("hmMenuLogout","hmTopLogout"\)/);
  assert.match(form,/sellerNav\?\.addEventListener\("click",open\)/);
  assert.match(form,/if\(!await getSession\(\)\)throw new Error\("Somente vendedor ou ADM Master pode cadastrar anúncios\."\)/);
});

test("tutorial acompanha os novos atalhos e o desktop permanece independente",()=>{
  assert.match(tour,/selector: "#exploreNav"/);
  assert.match(tour,/selector: "#hmMobileDetails"/);
  assert.match(tour,/selector: "#hmMobileContact"/);
  assert.match(tour,/selector: "#profileNav"/);
  assert.match(css,/@media\(max-width:799px\)/);
  assert.match(css,/@media\(min-width:800px\)\{\.hm-mobile-menu\{display:none!important\}\}/);
  assert.match(html,/<link rel="stylesheet" href="\/styles\/catiramatch-theme.css">\s*<link rel="stylesheet" href="\/styles\/mobile-discovery.css">/);
});
