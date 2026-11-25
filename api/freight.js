import { createClient } from "@supabase/supabase-js";
const H={"Cache-Control":"no-store","Content-Type":"application/json; charset=utf-8"};
const opt={auth:{persistSession:false,autoRefreshToken:false}};
const reply=(res,status,body)=>{Object.entries(H).forEach(([k,v])=>res.setHeader(k,v));return res.status(status).json(body)};
const str=(v,n=160)=>typeof v==="string"?v.trim().slice(0,n):"";
export default async function handler(req,res){
 const url=process.env.SUPABASE_URL,anon=process.env.SUPABASE_ANON_KEY,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!anon||!key)return reply(res,503,{error:"Agenciamento indisponível no Preview."});
 const token=(req.headers.authorization||"").replace(/^Bearer /,""); if(!token)return reply(res,401,{error:"Entre na sua conta para continuar."});
 const auth=createClient(url,anon,opt),db=createClient(url,key,opt);
 try{
  const {data:u,error:ae}=await auth.auth.getUser(token); if(ae||!u?.user)return reply(res,401,{error:"Sessão inválida. Entre novamente."});
  const user=u.user; const {data:p,error:pe}=await db.from("profiles").select("role,full_name,phone").eq("id",user.id).maybeSingle(); if(pe)throw pe;
  const role=p?.role||"buyer", body=req.method==="GET"?{}:(req.body||{}), action=req.method==="GET"?"dashboard":str(body.action,24);
  if(action==="dashboard"){
   const {data:eq,error:ee}=await db.from("freight_driver_equipment").select("*").eq("user_id",user.id);if(ee)throw ee;
   let loads=[], interests=[], myLoads=[];
   if(role==="broker"||role==="admin"){
    let q=db.from("freight_loads").select("*").order("created_at",{ascending:false});if(role==="broker")q=q.eq("broker_id",user.id);
    const {data:d,error:e}=await q;if(e)throw e;myLoads=d||[];
    const ids=myLoads.map(x=>x.id);if(ids.length){const {data:i,error:ie}=await db.from("freight_interests").select("*").in("load_id",ids).order("created_at",{ascending:false});if(ie)throw ie;interests=i||[];
      const users=[...new Set(interests.map(x=>x.driver_id))];if(users.length){const {data:profiles,error:pr}=await db.from("profiles").select("id,full_name,phone").in("id",users);if(pr)throw pr;const m=new Map((profiles||[]).map(x=>[x.id,x]));interests=interests.map(i=>({...i,driver:m.get(i.driver_id)||{}}));}}
   }
   const {data:mine,error:mi}=await db.from("freight_interests").select("*,load:freight_loads(*)").eq("driver_id",user.id).order("created_at",{ascending:false});if(mi)throw mi;
   if(role==="buyer"||role==="seller") {
    const equipment=eq||[]; if(equipment.length){let q=db.from("freight_loads").select("*").eq("status","open").gt("freights_remaining",0).order("loading_date",{ascending:true});
      const {data:all,error:le}=await q;if(le)throw le;
      loads=(all||[]).filter(l=>equipment.some(e=>e.is_available&&e.vehicle_type===l.vehicle_type&&e.axle_config===l.axle_config&&e.implement_type===l.implement_type));}
   }
   return reply(res,200,{role,user:{id:user.id,name:p?.full_name||user.user_metadata?.full_name||"",phone:p?.phone||""},equipment:eq||[],loads,interests:mine||[],myLoads,brokerInterests:interests});
  }
  if(action==="equipment_save"){
   const row={user_id:user.id,vehicle_type:str(body.vehicle_type,80),axle_config:str(body.axle_config,40),implement_type:str(body.implement_type,80),is_available:body.is_available!==false};
   if(!["Caminhão","Cavalo mecânico"].includes(row.vehicle_type)||!row.axle_config||!row.implement_type)return reply(res,400,{error:"Informe caminhão/cavalo, configuração de eixos e implemento."});
   const id=str(body.id,60);let result=id?await db.from("freight_driver_equipment").update(row).eq("id",id).eq("user_id",user.id).select().single():await db.from("freight_driver_equipment").insert(row).select().single();if(result.error)throw result.error;
   return reply(res,200,{equipment:result.data});
  }
  if(action==="equipment_toggle"){
   const {data,error}=await db.from("freight_driver_equipment").update({is_available:body.is_available===true}).eq("id",str(body.id,60)).eq("user_id",user.id).select().single();if(error)throw error;return reply(res,200,{equipment:data});
  }
  if(action==="load_create"){
   if(!["broker","admin"].includes(role))return reply(res,403,{error:"Somente agenciadores e ADM podem publicar cargas."});
   const qty=Math.floor(Number(body.quantity_total));
   const row={broker_id:user.id,origin_city:str(body.origin_city,100),origin_state:str(body.origin_state,2).toUpperCase(),destination_city:str(body.destination_city,100),destination_state:str(body.destination_state,2).toUpperCase(),cargo_description:str(body.cargo_description,500),vehicle_type:str(body.vehicle_type,80),axle_config:str(body.axle_config,40),implement_type:str(body.implement_type,80),loading_date:str(body.loading_date,10)||null,quantity_total:qty,freights_remaining:qty,status:"open"};
   if(!row.origin_city||row.origin_state.length!==2||!row.destination_city||row.destination_state.length!==2||!row.cargo_description||!row.vehicle_type||!row.axle_config||!row.implement_type||!Number.isInteger(qty)||qty<1||qty>500)return reply(res,400,{error:"Confira origem, destino, veículo, implemento e quantidade (1 a 500)."});
   const {data,error}=await db.from("freight_loads").insert(row).select().single();if(error)throw error;return reply(res,201,{load:data});
  }
  if(action==="interest"){
   if(!["buyer","seller"].includes(role))return reply(res,403,{error:"Apenas carreteiros podem demonstrar interesse."});
   const loadId=str(body.load_id,60),eqId=str(body.driver_equipment_id,60);
   const {data:e,error:ee}=await db.from("freight_driver_equipment").select("*").eq("id",eqId).eq("user_id",user.id).eq("is_available",true).maybeSingle();if(ee)throw ee;if(!e)return reply(res,400,{error:"Selecione um conjunto disponível cadastrado por você."});
   const {data:l,error:le}=await db.from("freight_loads").select("*").eq("id",loadId).eq("status","open").gt("freights_remaining",0).maybeSingle();if(le)throw le;if(!l||l.vehicle_type!==e.vehicle_type||l.axle_config!==e.axle_config||l.implement_type!==e.implement_type)return reply(res,409,{error:"Carga indisponível ou incompatível com seu conjunto."});
   const {data,error}=await db.from("freight_interests").insert({load_id:loadId,driver_id:user.id,driver_equipment_id:eqId}).select().single();if(error){if(error.code==="23505")return reply(res,409,{error:"Você já enviou interesse para esta carga."});throw error;}return reply(res,201,{interest:data});
  }
  if(action==="interest_respond"){
   if(!["broker","admin"].includes(role))return reply(res,403,{error:"Somente o agenciador da carga pode responder."});
   const {data,error}=await db.rpc("respond_to_freight_interest",{p_actor_id:user.id,p_interest_id:str(body.interest_id,60),p_action:body.decision==="approve"?"approve":"reject"});if(error)throw error;return reply(res,200,{result:data});
  }
  if(action==="load_close"){
   if(!["broker","admin"].includes(role))return reply(res,403,{error:"Acesso restrito ao agenciador."});
   let q=db.from("freight_loads").update({status:"closed"}).eq("id",str(body.load_id,60));if(role!=="admin")q=q.eq("broker_id",user.id);const {data,error}=await q.select().maybeSingle();if(error)throw error;if(!data)return reply(res,404,{error:"Carga não encontrada."});return reply(res,200,{load:data});
  }
  return reply(res,400,{error:"Ação inválida."});
 }catch(error){console.error("[CatiraMatch freights]",error);return reply(res,500,{error:error?.message||"Não foi possível concluir a operação."});}
}