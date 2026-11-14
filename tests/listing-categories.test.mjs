import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(path, import.meta.url), "utf8");
const [taxonomySource, form, index, buyerSource, api] = await Promise.all([
  read("../listing-categories.js"),
  read("../equipment-marketplace.js"),
  read("../index.html"),
  read("../buyer-profile-model.js"),
  read("../api/vehicles.js")
]);
const scope = {};
vm.runInNewContext(taxonomySource,scope);
const category=scope.hmListingCategories;
function list(values){return Array.from(values);}

test("cavalo mecânico é separado do caminhão e suporta configurações distintas",()=>{
  assert.notEqual(category.horse,category.truck);
  for(const variant of ["4x2","6x2","6x4","8x2","8x4","10x4"]){
    assert.ok(list(category.truckConfigs).includes(variant));
    const stored=category.compose("Cavalo mecânico",variant);
    assert.equal(stored,"Cavalo mecânico "+variant);
    assert.equal(category.base(stored),"Cavalo mecânico");
    assert.equal(category.variant(stored),variant);
    assert.equal(category.matches(stored,"Cavalo mecânico"),true);
    assert.equal(category.matches(stored,"Caminhão"),false);
  }
  assert.equal(category.compose("Caminhão","6x4"),"Caminhão 6x4");
  assert.equal(category.matches("Caminhão 6x4","Caminhão"),true);
});

test("carretas são implementos e preservam anúncios antigos",()=>{
  assert.equal(category.trailer,"Carreta / implemento");
  for(const type of ["Prancha","Basculante","Graneleira","Sider","Baú","Tanque","Frigorífica","Porta-contêiner"]){
    assert.ok(list(category.implementTypes).includes(type));
    const stored=category.compose(category.trailer,type);
    assert.equal(category.base(stored),category.trailer);
    assert.equal(category.variant(stored),type);
    assert.equal(category.matches(stored,category.horse),false);
    assert.equal(category.matches(stored,category.trailer),true);
  }
  assert.equal(category.base("Carreta"),category.trailer);
  assert.equal(category.variant("Carreta"),"");
  assert.equal(category.matches("Carreta",category.trailer),true);
  assert.equal(category.compose("Carreta / implemento","Inexistente"),"Carreta / implemento");
});

test("formulário exibe configurações somente para veículos compatíveis",()=>{
  assert.match(form,/id="hmVCategory"/);
  assert.match(form,/<option>Cavalo mecânico<\/option>/);
  assert.match(form,/<option value="Carreta \/ implemento">Carreta \/ implemento<\/option>/);
  assert.match(form,/id="hmVAxles"/);
  assert.match(form,/id="hmVImplement"/);
  assert.match(form,/category==="Caminhão"\|\|category==="Cavalo mecânico"/);
  assert.match(form,/category==="Carreta \/ implemento"/);
  assert.match(form,/taxonomy\.truckConfigs\.forEach/);
  assert.match(form,/taxonomy\.implementTypes\.forEach/);
  assert.match(form,/setCategoryFromStored\(v\.category\|\|""\)/);
  assert.match(form,/category:getStoredCategory\(\)/);
  assert.match(api,/const title = clean\(body\.title, 140\), category = clean\(body\.category, 80\)/);
});

test("filtros têm categorias separadas e encontram veículos com configuração",()=>{
  for(const cat of ["Caminhão","Cavalo mecânico","Carreta / implemento"]){
    assert.ok(index.includes('data-cat="'+cat+'"'));
  }
  assert.match(index,/hmListingCategories\.matches\(v\.category,activeCategory\)/);
  assert.match(index,/<script src="\/listing-categories\.js"><\/script>/);
  assert.ok(index.indexOf('<script src="/listing-categories.js">')<index.indexOf('<script src="/equipment-marketplace.js">'));
});

test("preferências anteriores de quem buscava ou oferecia Carreta continuam válidas",()=>{
  const ctx={window:{}};
  vm.runInNewContext(buyerSource,ctx);
  const model=ctx.window.hmBuyerProfileModel;
  const info=model.sanitize({categories:["Cavalo mecânico","Carreta"],has_trade:"Sim",trade_category:"Carreta"});
  assert.deepEqual(list(info.categories),["Cavalo mecânico","Carreta / implemento"]);
  assert.equal(info.trade_category,"Carreta / implemento");
  assert.ok(list(model.groups[1].fields.find(f=>f.key==="categories").options).includes("Carreta / implemento"));
});

test("o novo cadastro não altera login, preço e gestos de curtida",()=>{
  assert.match(form,/price:priceValue/);
  assert.match(index,/swipeActions=\{left:pass,right:like\}/);
  assert.match(index,/if\(dx>0\)\{like\(\);\}else\{pass\(\);\}/);
});
