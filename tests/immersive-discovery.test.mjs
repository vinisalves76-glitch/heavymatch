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
  assert.match(css,/\.feed \.photo-info\{[^}]*bottom:22px/);
  assert.match(html,/class="hm-hero-price">\$\{esc\(v\.price\)\}/);
  assert.match(css,/\.feed \.hm-hero-price\{display:block/);
});

test("não existe segunda barra de menu: só X e coração discretos nos cantos da foto",()=>{
  const action=html.match(/<div class="secondary-actions"[^>]*>([\s\S]*?)<\/div>/)?.[1]||"";
  assert.match(action,/id="passBtn" data-swipe-action="left"/);
  assert.match(action,/id="likeBtn" data-swipe-action="right"/);
  assert.match(css,/#secondaryActions\{display:contents!important\}/);
  assert.match(css,/#secondaryActions\[style\*="display: none"\]\{display:none!important\}/);
  assert.match(css,/#secondaryActions \.hm-mobile-card-action\{display:none!important\}/);
  assert.match(css,/#secondaryActions #passBtn,#secondaryActions #likeBtn\{position:fixed;[^}]*top:170px/);
  assert.match(css,/#secondaryActions #passBtn\{left:max\(14px/);
  assert.match(css,/#secondaryActions #likeBtn\{right:max\(14px/);
  assert.doesNotMatch(css,/#secondaryActions\{[^}]*width:min\(296px/);
  assert.match(html,/const swipeActions=\{left:pass,right:like\}/);
});

test("bio e WhatsApp continuam acessíveis a partir da foto, sem outra barra",()=>{
  assert.match(html,/id="hmPhotoBio" aria-label="Ver bio, detalhes e WhatsApp do vendedor"/);
  assert.match(html,/Ver bio e contato ›/);
  assert.match(css,/\.feed \.hm-photo-bio-link\{display:inline-flex/);
  assert.ok(html.includes("if(e.target.closest('#hmPhotoBio')){e.preventDefault();e.stopPropagation();openDetails();return;}"));
  assert.match(html,/id="modalContact"[^>]*>☏ &nbsp; Conversar com o vendedor no WhatsApp/);
  assert.ok(html.includes("$(\'modalContact\').addEventListener(\'click\',contact)"));
  assert.match(html,/changeEquipmentPhoto\(1\);\}\);/);
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
  assert.match(tour,/selector: "#hmPhotoBio"/);
  assert.match(tour,/selector: "#modalContact"/);
  assert.match(tour,/selector: "#profileNav"/);
  assert.match(css,/@media\(max-width:799px\)/);
  assert.match(css,/@media\(min-width:800px\)\{\.hm-mobile-menu\{display:none!important\}\}/);
  assert.match(html,/<link rel="stylesheet" href="\/styles\/catiramatch-theme.css">\s*<link rel="stylesheet" href="\/styles\/mobile-discovery.css">/);
});
