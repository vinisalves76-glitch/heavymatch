import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const load=path=>readFile(new URL(path,import.meta.url),"utf8");
const [tokenApi,vehicleApi,form,authUi,adminApi,index,security]=await Promise.all([
  load("../api/vehicles/photo-token.js"),
  load("../api/vehicles.js"),
  load("../equipment-marketplace.js"),
  load("../supabase-integration.js"),
  load("../api/admin/users.js"),
  load("../index.html"),
  load("../docs/seller-admin-storage-security.sql")
]);

function setup(source,{role="buyer",userId="11111111-1111-1111-1111-111111111111",authenticated=true}={}){
  const calls={signed:0,insert:0};
  const adminClient={
    from(name){
      if(name!=="profiles")throw Error("unexpected table: "+name);
      return { select(){return {eq(){return {async maybeSingle(){return {data:{role},error:null};}};}};} };
    },
    storage:{from(){return {async createSignedUploadUrl(path){calls.signed++;return {data:{token:"signed-example",path},error:null};}};}}
  };
  const publicClient={auth:{async getUser(token){return {data:{user:authenticated&&token==="jwt"?{id:userId}:null},error:null};}}};
  const createClient=(url,key)=>key==="anon"?publicClient:adminClient;
  const context={
    createClient,
    randomUUID:()=> "22222222-2222-4222-8222-222222222222",
    console,
    process:{env:{SUPABASE_URL:"https://example.supabase.co",SUPABASE_ANON_KEY:"anon",SUPABASE_SERVICE_ROLE_KEY:"secret"}}
  };
  const compiled=source.replace(/^import .*?;\s*$/gm,"").replace("export default async function handler","async function handler")+"\nthis.handler=handler;";
  vm.runInNewContext(compiled,context);
  const response=()=>({
    statusCode:200,setHeader(){},status(code){this.statusCode=code;return this;},
    json(value){this.body=value;return this;}
  });
  return {handler:context.handler,calls,response};
}
test("comprador não recebe autorização para enviar fotos",async()=>{
  const app=setup(tokenApi,{role:"buyer"});
  const res=app.response();
  await app.handler({method:"POST",headers:{authorization:"Bearer jwt"},body:{content_type:"image/jpeg",size:1024}},res);
  assert.equal(res.statusCode,403);
  assert.equal(app.calls.signed,0);
});
test("vendedor e ADM podem receber upload assinado somente para seu diretório",async()=>{
  for(const role of ["seller","admin"]){
    const app=setup(tokenApi,{role});
    const res=app.response();
    await app.handler({method:"POST",headers:{authorization:"Bearer jwt"},body:{content_type:"image/webp",size:1200}},res);
    assert.equal(res.statusCode,200);
    assert.match(res.body.path,/^11111111-1111-1111-1111-111111111111\/22222222-2222-4222-8222-222222222222\.webp$/);
    assert.equal(res.body.token,"signed-example");
    assert.equal(app.calls.signed,1);
  }
});
test("uploads inválidos e sessões sem login não criam tokens",async()=>{
  const app=setup(tokenApi,{role:"seller"});
  for(const [headers,body,status] of [
    [{authorization:"Bearer jwt"},{content_type:"image/svg+xml",size:123},400],
    [{authorization:"Bearer jwt"},{content_type:"image/jpeg",size:11*1024*1024},400],
    [{},{content_type:"image/jpeg",size:900},401]
  ]){
    const res=app.response();
    await app.handler({method:"POST",headers,body},res);
    assert.equal(res.statusCode,status);
  }
  assert.equal(app.calls.signed,0);
});
test("comprador não consegue criar ou gerenciar anúncios pela API",async()=>{
  const app=setup(vehicleApi,{role:"buyer"});
  for(const [method,query] of [["POST",{}],["GET",{manage:"1"}]]){
    const res=app.response();
    await app.handler({method,query,headers:{authorization:"Bearer jwt"},body:{action:"create"}},res);
    assert.equal(res.statusCode,403);
  }
});
test("vendedor só gerencia seus anúncios, ADM pode escolher responsável",()=>{
  assert.match(vehicleApi,/if \(manage && role !== "admin"\) query = query\.eq\("seller_id", user\.id\)/);
  assert.match(vehicleApi,/role !== "admin" && data\.seller_id !== user\.id/);
  assert.match(vehicleApi,/role !== "admin" && vehicle\.seller_id !== user\.id/);
  assert.match(vehicleApi,/\["seller", "admin"\]\.includes\(target\.role\)/);
  assert.match(vehicleApi,/seller_id: ownerId/);
});
test("formulário preserva fotos existentes e envia novas fotos de forma autorizada",()=>{
  assert.match(form,/uploadToSignedUrl\(result\.path,result\.token,file/);
  assert.match(form,/\/api\/vehicles\/photo-token/);
  assert.match(form,/existingPhotos\.map\(photo=>photo\.path\)/);
  assert.match(form,/data-remove-existing/);
  assert.match(form,/data-remove-new/);
  assert.match(form,/\["image\/jpeg","image\/png","image\/webp"\]/);
  assert.match(form,/if\(total>10\)/);
  assert.match(form,/if\(role==="admin"&&!editing/);
});
test("ADM e vendedor possuem WhatsApp e acesso ao painel de anúncios",()=>{
  assert.match(authUi,/id="hmAdminOpenListings"/);
  assert.match(authUi,/hmOpenListings\(\)/);
  assert.match(authUi,/id="hmNewPhone"/);
  assert.match(adminApi,/phone: phone \|\| null/);
  assert.match(vehicleApi,/action === "contact"/);
  assert.match(vehicleApi,/seller_phone: seller\?\.phone/);
  assert.match(form,/window\.hmOpenListings=open/);
  assert.match(index,/seller_phone/);
  assert.doesNotMatch(index,/https:\/\/wa\.me\/\$\{WHATSAPP_NUMBER\}/);
});
test("mudanças de RLS estão documentadas, mas não aplicadas",()=>{
  assert.match(security,/REVOKE ALL PRIVILEGES ON TABLE public\.profiles/);
  assert.match(security,/vehicle_photos_commercial_upload/);
  assert.match(security,/NOT been run/);
});
test("o swipe permanece: esquerda pula e direita curte",()=>{
  assert.match(index,/swipeActions=\{left:pass,right:like\}/);
  assert.match(index,/if\(dx>0\)\{like\(\);\}else\{pass\(\);\}/);
});
