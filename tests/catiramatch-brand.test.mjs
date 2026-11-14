import test from "node:test";
import assert from "node:assert/strict";
import {readFile, stat} from "node:fs/promises";

const src = async p => readFile(new URL(p,import.meta.url),"utf8");
const [html,theme,login,form,profile,tour] = await Promise.all([
  src("../index.html"),
  src("../styles/catiramatch-theme.css"),
  src("../supabase-integration.js"),
  src("../equipment-marketplace.js"),
  src("../buyer-profile.js"),
  src("../guided-tour.js")
]);

test("nome e identidade CatiraMatch consistentes em toda a interface",()=>{
  assert.match(html,/<title>CatiraMatch — Seu próximo negócio começa aqui\.<\/title>/);
  assert.match(html,/class="brand-logo" src="\/assets\/catiramatch-logo\.png"/);
  assert.match(html,/href="\/styles\/catiramatch-theme\.css"/);
  assert.match(html,/href="\/assets\/catiramatch-icon\.png"/);
  for(const [name,source] of [
    ["index",html],["login",login],["vendedor",form],["perfil",profile],["tutorial",tour]
  ]){
    assert.doesNotMatch(source, /HeavyMatch|HEAVYMATCH/, name+" mantém a marca antiga");
  }
  assert.match(login,/class="hm-auth-brand"/);
  assert.match(profile,/CATIRAMATCH · PERFIL DE COMPRA/);
});

test("logo original do usuário e ícone estão incluídos no deploy",async()=>{
  for(const path of ["../assets/catiramatch-logo.png","../assets/catiramatch-icon.png"]){
    const file=new URL(path,import.meta.url);
    const b=await readFile(file);
    assert.deepEqual(Array.from(b.subarray(0,8)),[137,80,78,71,13,10,26,10],path);
    assert.ok((await stat(file)).size>400,path);
  }
});

test("cores correspondem à identidade vermelha, carvão e branca",()=>{
  assert.match(theme,/--site-primary:#E32227/);
  assert.match(theme,/--site-secondary:#181818/);
  assert.match(theme,/--site-on-primary:#FFFFFF/);
  assert.match(theme,/--site-background:#F3F3F3/);
  assert.match(theme,/\.brand \.brand-logo/);
  assert.match(theme,/Pra você/);
  assert.match(theme,/\.round-action\.like\{background:#E32227/);
  assert.match(theme,/\.round-action\.pass\{background:#303030/);
});

test("bio do equipamento contém preço gerado do anúncio e descrição própria",()=>{
  const start=html.indexOf('function openDetails(){');
  const end=html.indexOf("function",start+18);
  const details=html.slice(start,end>start?end:undefined);
  assert.match(details,/class="hm-equipment-bio" aria-label="Bio do equipamento"/);
  assert.match(details,/<h3>Bio do equipamento<\/h3>/);
  assert.match(details,/class="hm-price-detail"><span>Preço anunciado<\/span><strong>\$\{esc\(v\.price\)\}<\/strong>/);
  assert.match(details,/esc\(v\.description\|\|"Informações adicionais disponíveis com o vendedor\."\)/);
  assert.ok(details.indexOf("hm-price-detail")<details.indexOf("v.description"));
  assert.match(form,/label for="hmVDescription">Bio do equipamento<\/label>/);
  assert.match(form,/O preço informado acima aparecerá automaticamente no início da bio pública/);
  assert.match(form,/price:priceValue/);
  assert.match(form,/description:\$\("hmVDescription"\)\.value\.trim\(\)/);
});

test("gestos, navegação, seleção do vendedor e catálogo continuam disponíveis",()=>{
  assert.match(html,/swipeActions=\{left:pass,right:like\}/);
  assert.match(html,/if\(dx>0\)\{like\(\);\}else\{pass\(\);\}/);
  assert.match(html,/id="sellerNav"/);
  assert.match(html,/data-cat="Cavalo mecânico"/);
  assert.match(html,/data-cat="Carreta \/ implemento"/);
  assert.match(form,/window\.hmOpenListings=open/);
});
