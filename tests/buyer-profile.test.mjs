import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFile} from "node:fs/promises";
const file=(path)=>readFile(new URL(path,import.meta.url),"utf8");
const [modelSource,uiSource,indexSource,authSource,styles]=await Promise.all([
  file("../buyer-profile-model.js"),file("../buyer-profile.js"),file("../index.html"),
  file("../supabase-integration.js"),file("../styles/buyer-profile.css")
]);
const ctx={window:{}};
vm.runInNewContext(modelSource,ctx);
const model=ctx.window.hmBuyerProfileModel;

test("perfil oferece mais de 50 campos organizados por cinco áreas",()=>{
  assert.equal(model.groups.length,5);
  assert.ok(model.keys.length>=55);
  assert.equal(new Set(model.keys).size,model.keys.length);
  assert.deepEqual(Array.from(model.groups,group=>group.id),["about","search","payment","trade","preferences"]);
});

test("dados de financiamento e troca são campos reais e editáveis",()=>{
  for(const field of ["payment_methods","financing_preapproved","down_payment","budget_min","budget_max","has_trade","trade_brand","trade_model","trade_year","trade_value","trade_financed","trade_balance","trade_mileage"]){
    assert.ok(model.keys.includes(field),field+" ausente");
  }
});

test("sanitização bloqueia campos estranhos, limita texto e valores inválidos",()=>{
  const cleaned=model.sanitize({
    display_name:"x".repeat(300),role:"admin",budget_max:-300,
    categories:["Caminhão","Caminhão","Opção inexistente","Escavadeira"],
    year_from:1888,has_trade:"Sim",trade_model:"R 450"
  });
  assert.equal(cleaned.display_name.length,100);
  assert.equal(cleaned.budget_max,"");
  assert.equal(cleaned.year_from,"");
  assert.deepEqual(Array.from(cleaned.categories),["Caminhão","Escavadeira"]);
  assert.equal(cleaned.trade_model,"R 450");
  assert.ok(!("role" in cleaned));
});

test("campos de troca não permanecem quando cliente desativa a troca",()=>{
  const cleaned=model.sanitize({has_trade:"Não",trade_brand:"Scania",trade_value:"200000"});
  assert.equal(cleaned.trade_brand,"");
  assert.equal(cleaned.trade_value,"");
});

test("opt-in de contato é explícito, não ativado automaticamente",()=>{
  const cleaned=model.sanitize({});
  assert.equal(cleaned.allow_contact,false);
  assert.equal(cleaned.allow_recommendations,false);
});

test("salvamento usa conta autenticada do Supabase, não expõe dados públicos",()=>{
  assert.match(uiSource,/supabase\.auth\.getUser\(\)/);
  assert.match(uiSource,/supabase\.auth\.updateUser\(\{data:\{\[model\.metadataKey\]:next\}\}\)/);
  assert.match(authSource,/window\.hmSupabaseClient = supabaseClient/);
  assert.match(indexSource,/id="profileNav"/);
  assert.match(indexSource,/window\.hmOpenBuyerProfile\?\.\(\)/);
  assert.match(indexSource,/buyer-profile-model\.js/);
  assert.match(indexSource,/buyer-profile\.js/);
  assert.match(indexSource,/buyer-profile\.css/);
  assert.match(styles,/\.hm-profile-overlay/);
});

test("interações de swipe existentes continuam associadas às direções corretas",()=>{
  assert.match(indexSource,/const swipeActions=\{left:pass,right:like\}/);
  assert.match(indexSource,/if\(dx>0\)\{like\(\);\}else\{pass\(\);\}/);
});

test("progresso não cobra dados da troca quando o cliente não tem veículo",()=>{
  const noTrade=model.progress({has_trade:"Não"});
  const withTrade=model.progress({has_trade:"Sim"});
  assert.ok(noTrade.total<withTrade.total);
  assert.ok(noTrade.percent>=0&&noTrade.percent<=100);
});
