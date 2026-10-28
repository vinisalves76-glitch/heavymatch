(() => {
  const style = document.createElement("style");
  style.textContent = `
    .hm-listings-btn{border:1px solid #46545e;background:#25343e;color:#fff;border-radius:11px;padding:9px 10px;font-weight:850;font-size:12px;display:none}
    .hm-vehicle-overlay{position:fixed;inset:0;z-index:110;background:#08111de8;display:none;align-items:center;justify-content:center;padding:10px}
    .hm-vehicle-overlay.open{display:flex}
    .hm-vehicle-card{width:100%;max-width:920px;max-height:96vh;overflow:auto;background:#fff;color:#18242d;border-radius:20px;padding:20px}
    .hm-vehicle-head{display:flex;justify-content:space-between;align-items:center;gap:10px}.hm-vehicle-head h2{margin:0;font-size:23px}
    .hm-vehicle-close{border:0;border-radius:50%;width:36px;height:36px;background:#edf0f2;font-size:22px}
    .hm-vehicle-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;margin-top:15px}
    .hm-vehicle-section{border:1px solid #e1e6e9;border-radius:15px;padding:14px;min-width:0}.hm-vehicle-section h3{margin:0 0 10px;font-size:15px}
    .hm-vehicle-form{display:grid;grid-template-columns:1fr 1fr;gap:10px}.hm-vehicle-field{min-width:0}.hm-vehicle-field.full{grid-column:1/-1}
    .hm-vehicle-field label{display:block;font-size:11px;font-weight:850;margin-bottom:5px}.hm-vehicle-field input,.hm-vehicle-field select,.hm-vehicle-field textarea{width:100%;border:1px solid #d7dfe3;border-radius:9px;padding:10px;background:#fff;color:#17242e;min-height:40px;font:inherit;font-size:12px}.hm-vehicle-field textarea{min-height:78px;resize:vertical}
    .hm-vehicle-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.hm-vehicle-actions button{border:1px solid #d9e0e4;border-radius:10px;padding:10px 12px;font-weight:850;background:#f5f7f8;color:#17242e}.hm-vehicle-actions .primary{background:#f5b323;border-color:#f5b323}
    .hm-vehicle-status{font-size:12px;line-height:1.5;margin-top:10px;overflow-wrap:anywhere}.hm-vehicle-items{display:grid;gap:9px}.hm-vehicle-item{display:grid;grid-template-columns:78px minmax(0,1fr);gap:10px;border:1px solid #e4e8eb;border-radius:12px;padding:9px}.hm-vehicle-item img{width:78px;height:72px;object-fit:cover;border-radius:8px;background:#eef1f3}.hm-vehicle-item strong{font-size:12px;display:block}.hm-vehicle-item small{display:block;color:#6b7780;font-size:10px;margin:4px 0}.hm-vehicle-item .hm-vehicle-actions{margin-top:6px}.hm-vehicle-item .hm-vehicle-actions button{padding:6px 9px;font-size:10px}.hm-vehicle-empty{font-size:12px;color:#687680;line-height:1.6;padding:12px 0}
    @media(max-width:720px){.hm-vehicle-layout{grid-template-columns:1fr}.hm-vehicle-card{padding:13px;border-radius:16px}.hm-vehicle-form{grid-template-columns:1fr 1fr}.hm-vehicle-head h2{font-size:20px}.hm-listings-btn{font-size:10px;padding:8px}}
  `;
  document.head.appendChild(style);
  const topActions = document.querySelector(".top-actions");
  const openButton = document.createElement("button");
  openButton.type = "button"; openButton.className = "hm-listings-btn"; openButton.textContent = "Meus anúncios";
  topActions?.prepend(openButton);
  const overlay = document.createElement("div");
  overlay.className = "hm-vehicle-overlay";
  overlay.innerHTML = `
    <section class="hm-vehicle-card" role="dialog" aria-modal="true" aria-labelledby="hmVehiclesTitle">
      <div class="hm-vehicle-head"><div><div style="font-size:10px;letter-spacing:1.4px;font-weight:900;color:#946000;margin-bottom:5px">HEAVYMATCH · GESTÃO DE ANÚNCIOS</div><h2 id="hmVehiclesTitle">Equipamentos</h2></div><button type="button" class="hm-vehicle-close" aria-label="Fechar">×</button></div>
      <p style="font-size:12px;line-height:1.5;color:#687680;margin:8px 0">Cadastre equipamentos com fotos. O administrador gerencia todos os anúncios; cada vendedor gerencia apenas os próprios.</p>
      <div class="hm-vehicle-layout">
        <section class="hm-vehicle-section"><h3 id="hmVehicleFormTitle">Cadastrar equipamento</h3>
          <form id="hmVehicleForm" class="hm-vehicle-form">
            <div class="hm-vehicle-field full"><label for="hmVTitle">Título do anúncio *</label><input id="hmVTitle" required maxlength="140" placeholder="Ex.: Escavadeira hidráulica em ótimo estado"></div>
            <div class="hm-vehicle-field"><label for="hmVCategory">Categoria *</label><select id="hmVCategory" required><option value="">Selecione</option><option>Caminhão</option><option>Carreta</option><option>Escavadeira</option><option>Carregadeira</option><option>Retroescavadeira</option><option>Motoniveladora</option><option>Trator</option><option>Empilhadeira</option><option>Outro equipamento</option></select></div>
            <div class="hm-vehicle-field"><label for="hmVBrand">Marca *</label><input id="hmVBrand" required maxlength="80" placeholder="Ex.: Volvo, SANY, Scania"></div>
            <div class="hm-vehicle-field"><label for="hmVModel">Modelo *</label><input id="hmVModel" required maxlength="100" placeholder="Modelo"></div>
            <div class="hm-vehicle-field"><label for="hmVYear">Ano *</label><input id="hmVYear" type="number" min="1900" max="2100" required placeholder="2024"></div>
            <div class="hm-vehicle-field"><label for="hmVPrice">Preço (R$)</label><input id="hmVPrice" type="number" min="0" step="0.01" placeholder="0,00"></div>
            <div class="hm-vehicle-field"><label for="hmVPriceOnRequest">Preço</label><select id="hmVPriceOnRequest"><option value="true">Sob consulta</option><option value="false">Informar preço</option></select></div>
            <div class="hm-vehicle-field"><label for="hmVState">Estado</label><input id="hmVState" maxlength="80" placeholder="MG"></div>
            <div class="hm-vehicle-field"><label for="hmVCity">Cidade</label><input id="hmVCity" maxlength="100" placeholder="Belo Horizonte"></div>
            <div class="hm-vehicle-field full"><label for="hmVDescription">Descrição</label><textarea id="hmVDescription" maxlength="5000" placeholder="Condição, horímetro/quilometragem, opcionais e detalhes"></textarea></div>
            <div class="hm-vehicle-field full"><label for="hmVPhotos">Fotos (até 10, JPG/PNG/WebP, até 10 MB cada)</label><input id="hmVPhotos" type="file" accept="image/jpeg,image/png,image/webp" multiple><small id="hmVExistingPhotos" style="display:block;color:#687680;margin-top:5px"></small></div>
            <div class="hm-vehicle-field full"><label for="hmVStatus">Visibilidade</label><select id="hmVStatus"><option value="published">Publicar no catálogo</option><option value="draft">Salvar como rascunho</option></select></div>
            <div class="hm-vehicle-field full"><div class="hm-vehicle-actions"><button class="primary" id="hmVSave" type="submit">Cadastrar equipamento</button><button id="hmVCancelEdit" type="button" hidden>Cancelar edição</button><button id="hmVReset" type="button">Limpar formulário</button></div><div class="hm-vehicle-status" id="hmVMessage" role="status" aria-live="polite"></div></div>
          </form>
        </section>
        <section class="hm-vehicle-section"><h3>Equipamentos cadastrados</h3><div class="hm-vehicle-items" id="hmVehicleItems"><div class="hm-vehicle-empty">Carregando anúncios…</div></div></section>
      </div>
    </section>`;
  document.body.appendChild(overlay);
  let client = null, session = null, role = "buyer", user = null, items = [], editing = null;
  const $ = id => document.getElementById(id);
  const setMessage = (s, bad=false) => { $("hmVMessage").textContent=s; $("hmVMessage").style.color=bad?"#b42332":"#246b45"; };
  const close = () => { overlay.classList.remove("open"); document.body.style.overflow=""; };
  const clearForm = () => { editing=null; $("hmVehicleForm").reset(); $("hmVehicleFormTitle").textContent="Cadastrar equipamento"; $("hmVSave").textContent="Cadastrar equipamento"; $("hmVCancelEdit").hidden=true; $("hmVExistingPhotos").textContent=""; setMessage(""); };
  const money = v => v.price_on_request || v.price == null ? "Sob consulta" : Number(v.price).toLocaleString("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:2});
  const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  async function getSession() {
    if (!client) { const response=await fetch("/api/config"); const config=await response.json(); if(!response.ok) throw new Error(config.error||"Configuração indisponível."); client=window.supabase.createClient(config.url,config.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}); client.auth.onAuthStateChange((_e,s)=>{session=s; refreshRole();}); }
    const {data}=await client.auth.getSession(); session=data.session;
    user=session?.user||null; role="buyer";
    if(user){const {data:profile}=await client.from("profiles").select("role").eq("id",user.id).maybeSingle();role=profile?.role||"buyer";}
    const canManage=!!user&&["seller","admin"].includes(role);
    openButton.style.display=canManage?"inline-block":"none";
    return canManage;
  }
  async function refreshRole(){try{await getSession();}catch(_){}}
  async function request(action,payload={}) {
    const {data}=await client.auth.getSession(); const token=data?.session?.access_token;
    if(!token)throw new Error("Sua sessão expirou. Entre novamente.");
    const response=await fetch("/api/vehicles"+(action==="list"?"?manage=1":""),{method:action==="list"?"GET":"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},...(action==="list"?{}:{body:JSON.stringify({action,...payload})})});
    const result=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(result.error||"Falha ao acessar anúncios.");
    return result;
  }
  function toCatalog(v){return {id:v.id,category:v.category,brand:v.brand,model:v.model,year:v.manufacture_year,power:"Consultar",usage:"Consultar",price:v.price_on_request||v.price==null?"Sob consulta":money(v),location:[v.city,v.state].filter(Boolean).join(", ")||"Brasil",featured:false,description:v.description||"",image:v.image||"",photos:v.photos||[]};}
  // Mostra todas as fotos recebidas da API, em vez de deixar apenas a primeira visível.
  const galleryStyle = document.createElement("style");
  galleryStyle.textContent = `
    .hm-gallery-control{position:absolute;z-index:4;top:50%;transform:translateY(-50%);width:38px;height:38px;border:1px solid #ffffff70;border-radius:50%;background:#101820b8;color:#fff;font-size:24px;display:flex;align-items:center;justify-content:center;cursor:pointer}
    .hm-gallery-control.prev{left:10px}.hm-gallery-control.next{right:10px}
    .hm-gallery-count{position:absolute;z-index:4;top:14px;right:14px;border-radius:20px;background:#101820c9;color:#fff;padding:6px 10px;font-size:11px;font-weight:800}
    .hm-gallery-dots{position:absolute;z-index:4;left:0;right:0;bottom:12px;display:flex;justify-content:center;gap:5px;pointer-events:none}
    .hm-gallery-dot{width:6px;height:6px;border-radius:50%;background:#ffffff80;box-shadow:0 1px 3px #0008}.hm-gallery-dot.active{background:#fff;width:17px;border-radius:5px}
    .hm-detail-gallery{position:relative;margin:12px 0}.hm-detail-gallery img{display:block;width:100%;max-height:420px;object-fit:contain;border-radius:12px;background:#111}
    .hm-detail-gallery .hm-gallery-control{top:50%}
    @media(max-width:650px){.hm-gallery-control{width:34px;height:34px}.hm-gallery-count{top:10px;right:10px}}
  `;
  document.head.appendChild(galleryStyle);
  function photoUrls(v){
    const urls=(v?.photos||[]).map(p=>typeof p==="string"?p:p?.url).filter(Boolean);
    if(!urls.length&&v?.image)urls.push(v.image);
    return [...new Set(urls)];
  }
  function buildGallery(container,img,urls){
    if(!container||!img||!urls.length)return;
    let active=0;
    img.src=urls[0];
    if(urls.length<2)return;
    const count=document.createElement("span");count.className="hm-gallery-count";
    const prev=document.createElement("button");prev.type="button";prev.className="hm-gallery-control prev";prev.setAttribute("aria-label","Foto anterior");prev.textContent="‹";
    const next=document.createElement("button");next.type="button";next.className="hm-gallery-control next";next.setAttribute("aria-label","Próxima foto");next.textContent="›";
    const dots=document.createElement("div");dots.className="hm-gallery-dots";
    urls.forEach((_,i)=>{const dot=document.createElement("span");dot.className="hm-gallery-dot"+(i===0?" active":"");dots.appendChild(dot);});
    function show(step){active=(active+step+urls.length)%urls.length;img.src=urls[active];count.textContent=(active+1)+" / "+urls.length;[...dots.children].forEach((dot,i)=>dot.classList.toggle("active",i===active));}
    count.textContent="1 / "+urls.length;
    prev.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();show(-1);});
    next.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();show(1);});
    container.append(prev,next,count,dots);
  }
  function mountCardGallery(){
    const v=current;
    const card=document.getElementById("activeCard");
    if(!v||!card)return;
    const urls=photoUrls(v), photo=card.querySelector(".photo"), img=photo?.querySelector("img");
    if(urls.length>1)buildGallery(photo,img,urls);
  }
  const originalRender=window.render;
  if(typeof originalRender==="function")window.render=function(){originalRender();mountCardGallery();};
  const originalOpenDetails=window.openDetails;
  if(typeof originalOpenDetails==="function")window.openDetails=function(){
    originalOpenDetails();
    const v=current, content=document.getElementById("modalContent");
    const oldImg=content?.querySelector("img");
    const urls=photoUrls(v);
    if(oldImg&&urls.length>1){
      const gallery=document.createElement("div");gallery.className="hm-detail-gallery";
      oldImg.replaceWith(gallery);gallery.appendChild(oldImg);buildGallery(gallery,oldImg,urls);
    }
  };
  function renderPublic(list) {
    vehicles=list.map(toCatalog); filtered=[...vehicles]; index=0;
    const b=$("brand"),m=$("model");
    if(b){b.innerHTML='<option value="">Todas as marcas</option>';[...new Set(vehicles.map(v=>v.brand))].sort().forEach(x=>b.add(new Option(x,x)));}
    if(m){m.innerHTML='<option value="">Todos os modelos</option>';[...new Set(vehicles.map(v=>v.model))].sort().forEach(x=>m.add(new Option(x,x)));}
    if(typeof filterVehicles==="function")filterVehicles();else render();
  }
  async function loadPublic() {
    try {
      const response=await fetch("/api/vehicles",{headers:{"Accept":"application/json"}});
      const data=await response.json(); if(!response.ok)throw new Error(data.error||"Não foi possível carregar os anúncios.");
      renderPublic(data.vehicles||[]);
    } catch(error) { console.error("[HeavyMatch catálogo]",error); vehicles=[];filtered=[];index=0;render(); }
  }
  async function loadManage() {
    $("hmVehicleItems").innerHTML='<div class="hm-vehicle-empty">Carregando anúncios…</div>';
    try {
      const data=await request("list"); items=data.vehicles||[];
      if(!items.length){$("hmVehicleItems").innerHTML='<div class="hm-vehicle-empty">Nenhum equipamento cadastrado. Use o formulário ao lado para adicionar o primeiro anúncio.</div>';return;}
      $("hmVehicleItems").innerHTML=items.map(v=>'<article class="hm-vehicle-item"><img src="'+esc(v.image||"https://placehold.co/160x120/e0e5e9/26343e?text=Sem+foto")+'" alt=""><div><strong>'+esc(v.title||v.brand+" "+v.model)+'</strong><small>'+esc(v.brand+" "+v.model+" · "+v.manufacture_year+" · "+money(v))+'<br>'+esc(v.status==="published"?"Publicado":"Rascunho")+'</small><div class="hm-vehicle-actions"><button type="button" data-edit="'+esc(v.id)+'">Editar</button><button type="button" data-delete="'+esc(v.id)+'">Remover</button></div></div></article>').join("");
    } catch(error) {$("hmVehicleItems").innerHTML='<div class="hm-vehicle-empty">'+esc(error.message)+'</div>';}
  }
  async function open() {
    try {if(!await getSession()){alert("Entre com uma conta de vendedor ou administrador para gerenciar equipamentos.");return;}
      overlay.classList.add("open");document.body.style.overflow="hidden";clearForm();await loadManage();
    } catch(error){alert(error.message);}
  }
  openButton.addEventListener("click",open);
  overlay.querySelector(".hm-vehicle-close").addEventListener("click",close);
  overlay.addEventListener("click",e=>{if(e.target===overlay)close();});
  $("hmVCancelEdit").addEventListener("click",clearForm);$("hmVReset").addEventListener("click",clearForm);
  $("hmVPriceOnRequest").addEventListener("change",()=>{$("hmVPrice").disabled=$("hmVPriceOnRequest").value==="true";});
  $("hmVPrice").disabled=true;
  $("hmVehicleItems").addEventListener("click",async e=>{
    const edit=e.target.closest("[data-edit]");const del=e.target.closest("[data-delete]");
    if(edit){const v=items.find(x=>x.id===edit.dataset.edit);if(!v)return;editing=v.id;
      $("hmVehicleFormTitle").textContent="Editar equipamento";$("hmVSave").textContent="Salvar alterações";$("hmVCancelEdit").hidden=false;
      $("hmVTitle").value=v.title||"";$("hmVCategory").value=v.category||"";$("hmVBrand").value=v.brand||"";$("hmVModel").value=v.model||"";$("hmVYear").value=v.manufacture_year||"";
      $("hmVPriceOnRequest").value=String(!!v.price_on_request||v.price==null);$("hmVPrice").disabled=$("hmVPriceOnRequest").value==="true";$("hmVPrice").value=v.price??"";
      $("hmVState").value=v.state||"";$("hmVCity").value=v.city||"";$("hmVDescription").value=v.description||"";$("hmVStatus").value=v.status==="draft"?"draft":"published";
      $("hmVExistingPhotos").textContent=(v.photos||[]).length+" foto(s) atual(is). Se enviar novas fotos, elas substituirão as atuais."; $("hmVPhotos").value="";setMessage("");$("hmVehicleForm").scrollIntoView({behavior:"smooth",block:"start"});
    }
    if(del){const v=items.find(x=>x.id===del.dataset.delete);if(!v)return;if(!confirm("Remover definitivamente o anúncio "+(v.title||v.brand+" "+v.model)+"?"))return;
      del.disabled=true;try{const result=await request("delete",{id:v.id});setMessage(result.message||"Anúncio removido.");await loadManage();await loadPublic();}catch(error){setMessage(error.message,true);}finally{del.disabled=false;}
    }
  });
  $("hmVehicleForm").addEventListener("submit",async e=>{
    e.preventDefault();const button=$("hmVSave");button.disabled=true;button.textContent="Salvando…";setMessage("");
    let uploaded=[];
    try {
      if(!await getSession())throw new Error("Entre com uma conta autorizada.");
      const files=[...$("hmVPhotos").files];
      if(files.length>10)throw new Error("Escolha no máximo 10 fotos.");
      for(const file of files){if(!["image/jpeg","image/png","image/webp"].includes(file.type))throw new Error("Use somente fotos JPG, PNG ou WebP.");
        if(file.size>10*1024*1024)throw new Error("Cada foto deve ter até 10 MB.");
        const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
        const path=user.id+"/"+crypto.randomUUID()+"-"+safe;
        const {error}=await client.storage.from("vehicle-photos").upload(path,file,{upsert:false,contentType:file.type});
        if(error)throw new Error("Não foi possível enviar uma foto: "+error.message);
        uploaded.push(path);
      }
      const body={title:$("hmVTitle").value.trim(),category:$("hmVCategory").value,brand:$("hmVBrand").value.trim(),model:$("hmVModel").value.trim(),manufacture_year:Number($("hmVYear").value),price_on_request:$("hmVPriceOnRequest").value==="true",price:$("hmVPrice").value===""?null:Number($("hmVPrice").value),description:$("hmVDescription").value.trim(),state:$("hmVState").value.trim(),city:$("hmVCity").value.trim(),status:$("hmVStatus").value,photos:uploaded};
      if(editing)body.id=editing;
      if(editing&&!files.length)body.photos=(items.find(v=>v.id===editing)?.photos||[]).map(p=>p.path);
      const result=await request(editing?"update":"create",body);
      setMessage(result.message||"Salvo com sucesso.");clearForm();await loadManage();await loadPublic();
    } catch(error) {
      if(uploaded.length&&client)await client.storage.from("vehicle-photos").remove(uploaded).catch(()=>{});
      setMessage(error.message||"Não foi possível salvar o equipamento.",true);
    } finally {button.disabled=false;button.textContent=editing?"Salvar alterações":"Cadastrar equipamento";}
  });
  window.addEventListener("hm-auth-changed",()=>{refreshRole();});
  loadPublic();
  getSession().catch(()=>{});
})();