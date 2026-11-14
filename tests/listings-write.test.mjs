import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const source=await readFile(new URL("../api/vehicles.js",import.meta.url),"utf8");
const actorId="11111111-1111-4111-8111-111111111111";
const sellerId="33333333-3333-4333-8333-333333333333";
const image=actorId+"/22222222-2222-4222-8222-222222222222.jpg";

function fakeApp({role="seller",phone="31999998888",targetRole="seller",targetPhone="31999997777"}={}) {
  const records={vehicles:[],photos:[]};
  const profiles=new Map([
    [actorId,{id:actorId,role,phone}],
    [sellerId,{id:sellerId,role:targetRole,phone:targetPhone}]
  ]);
  const db={
    from(name) {
      if(name==="profiles")return {
        select(){return {eq(field,id){return {async maybeSingle(){return {data:profiles.get(id)||null,error:null};}};}};}
      };
      if(name==="vehicles")return {
        insert(data){records.vehicles.push(data);return {select(){return {async single(){return {data:{id:"vehicle-created"},error:null};}};}};},
        select(){return {eq(){return {async maybeSingle(){return {data:null,error:null};}};}};}
      };
      if(name==="vehicle_photos")return {
        async insert(data){records.photos.push(...data);return {error:null};}
      };
      throw new Error("unexpected table "+name);
    }
  };
  const publicClient={auth:{async getUser(){return {data:{user:{id:actorId}},error:null};}}};
  const ctx={
    createClient:(_url,key)=>key==="anon"?publicClient:db,
    process:{env:{SUPABASE_URL:"https://demo.supabase.co",SUPABASE_ANON_KEY:"anon",SUPABASE_SERVICE_ROLE_KEY:"secret"}},
    console
  };
  vm.runInNewContext(source.replace(/^import .*?;\s*$/gm,"").replace("export default async function handler","async function handler")+"\nthis.handler=handler;",ctx);
  async function post(body) {
    const response={statusCode:200,setHeader(){},status(code){this.statusCode=code;return this;},json(payload){this.body=payload;return this;}};
    await ctx.handler({method:"POST",headers:{authorization:"Bearer jwt"},body},response);
    return response;
  }
  return {post,records};
}
const listing={action:"create",title:"Caminhão teste",category:"Caminhão",brand:"Scania",model:"R450",
  manufacture_year:2021,price_on_request:true,status:"published",photos:[image]};

test("vendedor publica equipamento próprio com foto e contato",async()=>{
  const app=fakeApp();
  const res=await app.post(listing);
  assert.equal(res.statusCode,201);
  assert.equal(app.records.vehicles.length,1);
  assert.equal(app.records.vehicles[0].seller_id,actorId);
  assert.equal(app.records.vehicles[0].status,"published");
  assert.equal(app.records.photos.length,1);
  assert.equal(app.records.photos[0].storage_path,image);
});
test("vendedor não escolhe dono de outro perfil",async()=>{
  const app=fakeApp();
  const res=await app.post({...listing,seller_id:sellerId});
  assert.equal(res.statusCode,201);
  assert.equal(app.records.vehicles[0].seller_id,actorId);
});
test("administrador publica para vendedor cadastrado",async()=>{
  const app=fakeApp({role:"admin"});
  const res=await app.post({...listing,seller_id:sellerId});
  assert.equal(res.statusCode,201);
  assert.equal(app.records.vehicles[0].seller_id,sellerId);
});
test("administrador não associa anúncio a comprador",async()=>{
  const app=fakeApp({role:"admin",targetRole:"buyer"});
  const res=await app.post({...listing,seller_id:sellerId});
  assert.equal(res.statusCode,400);
  assert.equal(app.records.vehicles.length,0);
});
test("publicação sem fotos ou WhatsApp é bloqueada, rascunho é permitido",async()=>{
  const noPhoto=fakeApp();
  assert.equal((await noPhoto.post({...listing,photos:[]})).statusCode,400);
  const noPhone=fakeApp({phone:""});
  assert.equal((await noPhone.post(listing)).statusCode,400);
  const draft=fakeApp({phone:""});
  assert.equal((await draft.post({...listing,status:"draft",photos:[]})).statusCode,201);
});
