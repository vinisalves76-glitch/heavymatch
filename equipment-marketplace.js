(() => {
  const style = document.createElement("style");
  style.textContent = `
    .hm-listings-btn{border:0;background:#f5b323;color:#17212a;border-radius:12px;padding:11px 16px;font-weight:900;font-size:13px;display:none;margin-top:12px;box-shadow:0 5px 14px #ac75002c}
    .hm-vehicle-overlay{position:fixed;inset:0;z-index:110;background:#08111de8;display:none;align-items:center;justify-content:center;padding:10px}
    .hm-vehicle-overlay.open{display:flex}
    .hm-vehicle-card{width:100%;max-width:920px;max-height:96vh;overflow:auto;background:#fff;color:#18242d;border-radius:20px;padding:20px}
    .hm-vehicle-head{display:flex;justify-content:space-between;align-items:center;gap:10px}.hm-vehicle-head h2{margin:0;font-size:23px}
    .hm-vehicle-close{border:0;border-radius:50%;width:36px;height:36px;background:#edf0f2;font-size:22px}
    .hm-vehicle-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;margin-top:15px}
    .hm-vehicle-section{border:1px solid #e1e6e9;border-radius:15px;padding:14px;min-width:0}.hm-vehicle-section h3{margin:0 0 10px;font-size:15px}
    .hm-vehicle-form{display:grid;grid-template-columns:1fr 1fr;gap:10px}.hm-vehicle-field{min-width:0}.hm-vehicle-field.full{grid-column:1/-1}
    .hm-vehicle-field label{display:block;font-size:11px;font-weight:850;margin-bottom:5px}.hm-vehicle-field input,.hm-vehicle-field select,.hm-vehicle-field textarea{width:100%;border:1px solid #d7dfe3;border-radius:9px;padding:10px;background:#fff;color:#17242e;min-height:40px;font:inherit;font-size:12px}.hm-vehicle-field textarea{min-height:78px;resize:vertical}
    .hm-photo-previews{display:grid;grid-template-columns:repeat(auto-fill,minmax(83px,1fr));gap:8px;margin-top:10px}
    .hm-photo-preview{position:relative;aspect-ratio:1;overflow:hidden;border-radius:10px;background:#e7eaee;border:1px solid #dae0e4}
    .hm-photo-preview img{width:100%;height:100%;object-fit:cover}
    .hm-photo-preview button{position:absolute;top:4px;right:4px;background:#fff;color:#a6172d;border:0;border-radius:50%;width:26px;height:26px;font-size:17px;box-shadow:0 2px 8px #0005}
    .hm-photo-preview .hm-photo-cover{position:absolute;bottom:0;left:0;right:0;background:#16303acb;color:#fff;font-size:9px;font-weight:850;padding:4px;text-align:center}
    .hm-vehicle-contact{margin:12px 0;padding:13px;border:1px solid #f0deae;background:#fff9e9;border-radius:13px;display:flex;flex-wrap:wrap;align-items:end;gap:10px}
    .hm-vehicle-contact label{display:block;font-size:11px;font-weight:850}
    .hm-vehicle-contact input{height:39px;border-radius:9px;border:1px solid #d9e0e5;padding:8px 10px;min-width:200px;max-width:100%}
    .hm-vehicle-contact button{height:39px;padding:0 13px;border:0;border-radius:9px;background:#1b2a34;color:white;font-weight:850}
    .hm-vehicle-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.hm-vehicle-actions button{border:1px solid #d9e0e4;border-radius:10px;padding:10px 12px;font-weight:850;background:#f5f7f8;color:#17242e}.hm-vehicle-actions .primary{background:#f5b323;border-color:#f5b323}
    .hm-vehicle-status{font-size:12px;line-height:1.5;margin-top:10px;overflow-wrap:anywhere}.hm-vehicle-items{display:grid;gap:9px}.hm-vehicle-item{display:grid;grid-template-columns:78px minmax(0,1fr);gap:10px;border:1px solid #e4e8eb;border-radius:12px;padding:9px}.hm-vehicle-item img{width:78px;height:72px;object-fit:cover;border-radius:8px;background:#eef1f3}.hm-vehicle-item strong{font-size:12px;display:block}.hm-vehicle-item small{display:block;color:#6b7780;font-size:10px;margin:4px 0}.hm-vehicle-item .hm-vehicle-actions{margin-top:6px}.hm-vehicle-item .hm-vehicle-actions button{padding:6px 9px;font-size:10px}.hm-vehicle-empty{font-size:12px;color:#687680;line-height:1.6;padding:12px 0}
    @media(max-width:720px){.hm-vehicle-layout{grid-template-columns:1fr}.hm-vehicle-card{padding:13px;border-radius:16px}.hm-vehicle-form{grid-template-columns:1fr 1fr}.hm-vehicle-head h2{font-size:20px}.hm-listings-btn{font-size:10px;padding:8px}}
  `;
  document.head.appendChild(style);
  const topActions = document.querySelector(".top-actions");
  const openButton = document.createElement("button");
  openButton.type = "button"; openButton.className = "hm-listings-btn"; openButton.textContent = "📸 Cadastrar / gerenciar anúncios";
  (document.querySelector(".intro") || topActions)?.appendChild(openButton);
  const overlay = document.createElement("div");
  overlay.className = "hm-vehicle-overlay";
  overlay.innerHTML = `
    <section class="hm-vehicle-card" role="dialog" aria-modal="true" aria-labelledby="hmVehiclesTitle">
      <div class="hm-vehicle-head"><div><div style="font-size:10px;letter-spacing:1.4px;font-weight:900;color:#946000;margin-bottom:5px">HEAVYMATCH · GESTÃO DE ANÚNCIOS</div><h2 id="hmVehiclesTitle">Equipamentos</h2></div><button type="button" class="hm-vehicle-close" aria-label="Fechar">×</button></div>
      <p style="font-size:12px;line-height:1.5;color:#687680;margin:8px 0">Cadastre equipamentos com fotos. O administrador gerencia todos os anúncios; cada vendedor gerencia apenas os próprios.</p>
      <div class="hm-vehicle-contact">
        <div><label for="hmVWhatsApp">Seu WhatsApp para receber compradores</label><input id="hmVWhatsApp" type="tel" inputmode="tel" placeholder="(31) 99999-9999" autocomplete="tel"></div>
        <button type="button" id="hmVSaveWhatsApp">Salvar contato</button>
        <small style="font-size:11px;color:#68532a;flex:1">Anúncios mostram o WhatsApp do vendedor responsável. O ADM pode escolher um vendedor para novos anúncios.</small>
      </div>
      <div class="hm-vehicle-layout">
        <section class="hm-vehicle-section"><h3 id="hmVehicleFormTitle">Cadastrar equipamento</h3>
          <form id="hmVehicleForm" class="hm-vehicle-form">
            <div class="hm-vehicle-field full" id="hmVSellerWrap" hidden><label for="hmVSeller">Vendedor responsável</label><select id="hmVSeller"><option value="">Minha conta (ADM)</option></select><small style="color:#687680;font-size:10px">Escolha o vendedor que receberá os contatos deste anúncio.</small></div>
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
            <div class="hm-vehicle-field full"><label for="hmVPhotos">Fotos do equipamento (até 10, JPG/PNG/WebP, até 10 MB cada)</label><input id="hmVPhotos" type="file" accept="image/jpeg,image/png,image/webp" multiple><input id="hmVCameraPhotos" type="file" accept="image/*" capture="environment" hidden><div class="hm-vehicle-actions" style="margin-top:8px"><button id="hmVTakePhoto" type="button" class="primary">📷 Tirar foto com a câmera</button><button id="hmVChoosePhotos" type="button">🖼️ Escolher da galeria</button></div><small id="hmVPhotoHelp" style="display:block;color:#687680;margin-top:5px">No celular, toque em “Tirar foto” para abrir a câmera traseira. Você pode repetir para adicionar mais fotos.</small><small id="hmVExistingPhotos" style="display:block;color:#687680;margin-top:5px"></small><div id="hmVPhotoPreviews" class="hm-photo-previews" aria-label="Fotos selecionadas"></div></div>
            <div class="hm-vehicle-field full"><label for="hmVStatus">Visibilidade</label><select id="hmVStatus"><option value="draft">Salvar como rascunho</option><option value="published">Publicar no catálogo</option><option value="sold">Vendido</option><option value="inactive">Pausar anúncio</option></select></div>
            <div class="hm-vehicle-field full"><div class="hm-vehicle-actions"><button class="primary" id="hmVSave" type="submit">Cadastrar equipamento</button><button id="hmVCancelEdit" type="button" hidden>Cancelar edição</button><button id="hmVReset" type="button">Limpar formulário</button></div><div class="hm-vehicle-status" id="hmVMessage" role="status" aria-live="polite"></div></div>
          </form>
        </section>
        <section class="hm-vehicle-section"><h3>Equipamentos cadastrados</h3><div class="hm-vehicle-items" id="hmVehicleItems"><div class="hm-vehicle-empty">Carregando anúncios…</div></div></section>
      </div>
    </section>`;
  document.body.appendChild(overlay);
  let client = null, session = null, role = "buyer", user = null;
  let items = [], sellers = [], editing = null, existingPhotos = [], pickedFiles = [], previewUrls = [];
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  const setMessage = (text, bad=false) => { $("hmVMessage").textContent=text; $("hmVMessage").style.color=bad?"#b42332":"#246b45"; };
  const money = v => v.price_on_request || v.price == null ? "Sob consulta" : Number(v.price).toLocaleString("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:2});
  function revokePreviews() {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    previewUrls = [];
  }
  function renderPhotoPreviews() {
    revokePreviews();
    const tiles = [];
    existingPhotos.forEach((p,index) => {
      if(!p.url)return;
      tiles.push('<div class="hm-photo-preview"><img src="'+esc(p.url)+'" alt="Foto existente '+(index+1)+'"><button type="button" data-remove-existing="'+index+'" aria-label="Remover foto existente">×</button>'+(tiles.length===0?'<div class="hm-photo-cover">Foto principal</div>':'')+'</div>');
    });
    pickedFiles.forEach((file,index) => {
      const url=URL.createObjectURL(file);previewUrls.push(url);
      tiles.push('<div class="hm-photo-preview"><img src="'+esc(url)+'" alt="Nova foto '+(index+1)+'"><button type="button" data-remove-new="'+index+'" aria-label="Remover foto nova">×</button>'+(tiles.length===0?'<div class="hm-photo-cover">Foto principal</div>':'')+'</div>');
    });
    $("hmVPhotoPreviews").innerHTML=tiles.join("");
    const total=existingPhotos.length+pickedFiles.length;
    $("hmVPhotoHelp").textContent=total+" de 10 fotos · A primeira foto será a capa do anúncio.";
  }
  function close() {
    overlay.classList.remove("open");
    document.body.style.overflow="";
    revokePreviews();
  }
  function clearForm() {
    editing=null; existingPhotos=[]; pickedFiles=[];
    $("hmVehicleForm").reset();
    $("hmVStatus").value="draft";
    $("hmVPrice").disabled=true;
    $("hmVehicleFormTitle").textContent="Cadastrar equipamento";
    $("hmVSave").textContent="Cadastrar equipamento";
    $("hmVCancelEdit").hidden=true;
    $("hmVSeller").disabled=false;
    $("hmVExistingPhotos").textContent="";
    $("hmVPhotos").value="";
    $("hmVCameraPhotos").value="";
    renderPhotoPreviews();
    setMessage("");
  }
  async function getSession() {
    client=window.hmSupabaseClient || client;
    if(!client) throw new Error("O login ainda está carregando. Tente novamente.");
    const {data,error}=await client.auth.getSession();
    if(error)throw error;
    session=data.session;
    user=session?.user||null;
    role="buyer";
    if(user){
      const {data:profile,error:profileError}=await client.from("profiles")
        .select("role").eq("id",user.id).maybeSingle();
      if(profileError)throw profileError;
      role=profile?.role||"buyer";
    }
    const canManage=!!user&&["seller","admin"].includes(role);
    openButton.style.display=canManage?"inline-block":"none";
    if(!canManage&&overlay.classList.contains("open"))close();
    return canManage;
  }
  async function refreshRole() { try{await getSession();}catch(error){openButton.style.display="none";} }
  async function request(action,payload={}) {
    await getSession();
    const token=session?.access_token;
    if(!token)throw new Error("Sua sessão expirou. Faça login novamente.");
    const response=await fetch("/api/vehicles"+(action==="list"?"?manage=1":""),{
      method:action==="list"?"GET":"POST",
      headers:{"Accept":"application/json","Content-Type":"application/json","Authorization":"Bearer "+token},
      ...(action==="list"?{}:{body:JSON.stringify({action,...payload})})
    });
    const result=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(result.error||"Falha ao acessar anúncios.");
    return result;
  }
  function toCatalog(v) {
    return {id:v.id,category:v.category,brand:v.brand,model:v.model,year:v.manufacture_year,
      power:"Consultar",usage:"Consultar",price:v.price_on_request||v.price==null?"Sob consulta":money(v),
      location:[v.city,v.state].filter(Boolean).join(", ")||"Brasil",featured:false,
      description:v.description||"",image:v.image||"",photos:v.photos||[],
      seller_name:v.seller_name||"",seller_phone:v.seller_phone||""};
  }
  function renderPublic(list) {
    vehicles=list.map(toCatalog);filtered=[...vehicles];index=0;
    const b=$("brand"),m=$("model");
    if(b){b.innerHTML='<option value="">Todas as marcas</option>';[...new Set(vehicles.map(v=>v.brand))].sort().forEach(value=>b.add(new Option(value,value)));}
    if(m){m.innerHTML='<option value="">Todos os modelos</option>';[...new Set(vehicles.map(v=>v.model))].sort().forEach(value=>m.add(new Option(value,value)));}
    if(typeof filterVehicles==="function")filterVehicles();else render();
  }
  async function loadPublic() {
    try {
      const response=await fetch("/api/vehicles",{headers:{"Accept":"application/json"}});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"Não foi possível carregar os anúncios.");
      renderPublic(data.vehicles||[]);
    }catch(error){
      console.error("[HeavyMatch catálogo]",error);
      vehicles=[];filtered=[];index=0;render();
    }
  }
  function updateSellerOptions() {
    const selector=$("hmVSeller");
    selector.innerHTML='<option value="">Minha conta (ADM)</option>'+
      sellers.map(item=>'<option value="'+esc(item.id)+'">'+esc(item.name)+(item.phone?" · WhatsApp cadastrado":" · Sem WhatsApp")+'</option>').join("");
    $("hmVSellerWrap").hidden=role!=="admin";
  }
  async function loadManage() {
    $("hmVehicleItems").innerHTML='<div class="hm-vehicle-empty">Carregando anúncios…</div>';
    try {
      const data=await request("list");
      items=data.vehicles||[];
      sellers=data.sellers||[];
      $("hmVWhatsApp").value=data.my_phone||"";
      updateSellerOptions();
      if(!items.length) {
        $("hmVehicleItems").innerHTML='<div class="hm-vehicle-empty">Nenhum anúncio cadastrado. Cadastre um equipamento e adicione fotos para publicá-lo.</div>';
        return;
      }
      $("hmVehicleItems").innerHTML=items.map(v=>'<article class="hm-vehicle-item"><img src="'+esc(v.image||"https://placehold.co/160x120/e0e5e9/26343e?text=Sem+foto")+'" alt=""><div><strong>'+esc(v.title||v.brand+" "+v.model)+'</strong><small>'+esc(v.brand+" "+v.model+" · "+v.manufacture_year+" · "+money(v))+'<br>'+esc(v.status==="published"?"Publicado":v.status==="draft"?"Rascunho":v.status==="sold"?"Vendido":"Pausado")+(role==="admin"?" · "+esc(v.seller_name||"Sem nome"):"")+'</small><div class="hm-vehicle-actions"><button type="button" data-edit="'+esc(v.id)+'">Editar fotos e dados</button><button type="button" data-delete="'+esc(v.id)+'">Remover</button></div></div></article>').join("");
    }catch(error){
      $("hmVehicleItems").innerHTML='<div class="hm-vehicle-empty">'+esc(error.message)+'</div>';
    }
  }
  async function open() {
    try {
      if(!await getSession()){alert("Entre com uma conta de vendedor ou ADM Master para cadastrar anúncios.");return;}
      overlay.classList.add("open");
      document.body.style.overflow="hidden";
      clearForm();
      await loadManage();
    }catch(error){alert(error.message);}
  }
  window.hmOpenListings=open;
  openButton.addEventListener("click",open);
  $("hmVSaveWhatsApp").addEventListener("click",async()=>{
    const button=$("hmVSaveWhatsApp");button.disabled=true;
    try {
      const result=await request("contact",{phone:$("hmVWhatsApp").value});
      setMessage(result.message||"WhatsApp atualizado.");
      await loadManage();
    }catch(error){setMessage(error.message,true);}finally{button.disabled=false;}
  });
  $("hmVTakePhoto").addEventListener("click",()=> $("hmVCameraPhotos").click());
  $("hmVChoosePhotos").addEventListener("click",()=> $("hmVPhotos").click());
  function addFiles(input) {
    const candidates=[...input.files];
    input.value="";
    const accepted=[];
    for(const file of candidates) {
      if(!["image/jpeg","image/png","image/webp"].includes(file.type)) {setMessage("Escolha somente arquivos JPG, PNG ou WebP.",true);continue;}
      if(file.size>10*1024*1024||file.size===0) {setMessage("Cada imagem deve ter até 10 MB.",true);continue;}
      if(existingPhotos.length+pickedFiles.length+accepted.length>=10){setMessage("Limite de 10 fotos por anúncio.",true);break;}
      accepted.push(file);
    }
    pickedFiles.push(...accepted);
    renderPhotoPreviews();
  }
  $("hmVCameraPhotos").addEventListener("change",()=>addFiles($("hmVCameraPhotos")));
  $("hmVPhotos").addEventListener("change",()=>addFiles($("hmVPhotos")));
  $("hmVPhotoPreviews").addEventListener("click",event=>{
    const old=event.target.closest("[data-remove-existing]");
    const added=event.target.closest("[data-remove-new]");
    if(old)existingPhotos.splice(Number(old.dataset.removeExisting),1);
    if(added)pickedFiles.splice(Number(added.dataset.removeNew),1);
    if(old||added){renderPhotoPreviews();setMessage("Foto removida da seleção. Salve o anúncio para aplicar.");}
  });
  overlay.querySelector(".hm-vehicle-close").addEventListener("click",close);
  overlay.addEventListener("click",event=>{if(event.target===overlay)close();});
  $("hmVCancelEdit").addEventListener("click",clearForm);
  $("hmVReset").addEventListener("click",clearForm);
  $("hmVPriceOnRequest").addEventListener("change",()=>{$("hmVPrice").disabled=$("hmVPriceOnRequest").value==="true";});
  $("hmVPrice").disabled=true;
  $("hmVehicleItems").addEventListener("click",async event=>{
    const edit=event.target.closest("[data-edit]");
    const del=event.target.closest("[data-delete]");
    if(edit) {
      const v=items.find(item=>item.id===edit.dataset.edit);
      if(!v)return;
      clearForm();editing=v.id;
      $("hmVehicleFormTitle").textContent="Editar equipamento";
      $("hmVSave").textContent="Salvar alterações";
      $("hmVCancelEdit").hidden=false;
      $("hmVTitle").value=v.title||"";
      $("hmVCategory").value=v.category||"";
      $("hmVBrand").value=v.brand||"";
      $("hmVModel").value=v.model||"";
      $("hmVYear").value=v.manufacture_year||"";
      $("hmVPriceOnRequest").value=String(!!v.price_on_request||v.price==null);
      $("hmVPrice").disabled=$("hmVPriceOnRequest").value==="true";
      $("hmVPrice").value=v.price??"";
      $("hmVState").value=v.state||"";
      $("hmVCity").value=v.city||"";
      $("hmVDescription").value=v.description||"";
      $("hmVStatus").value=["draft","published","sold","inactive"].includes(v.status)?v.status:"draft";
      existingPhotos=[...(v.photos||[])].filter(photo=>photo.path);
      if(role==="admin") {
        $("hmVSeller").value=v.seller_id||"";
        $("hmVSeller").disabled=true;
      }
      $("hmVExistingPhotos").textContent=existingPhotos.length+" foto(s) atual(is). Você pode manter, remover e adicionar outras fotos.";
      renderPhotoPreviews();
      $("hmVehicleForm").scrollIntoView({behavior:"smooth",block:"start"});
    }
    if(del) {
      const v=items.find(item=>item.id===del.dataset.delete);
      if(!v)return;
      if(!confirm("Remover definitivamente o anúncio "+(v.title||v.brand+" "+v.model)+"?"))return;
      del.disabled=true;
      try {
        const result=await request("delete",{id:v.id});
        clearForm();setMessage(result.message||"Anúncio removido.");
        await loadManage();await loadPublic();
      }catch(error){setMessage(error.message,true);}
      finally{del.disabled=false;}
    }
  });
  async function uploadPhoto(file) {
    const {data}=await client.auth.getSession();
    const token=data?.session?.access_token;
    if(!token)throw new Error("Sessão expirada. Entre novamente.");
    const response=await fetch("/api/vehicles/photo-token",{
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},
      body:JSON.stringify({content_type:file.type,size:file.size})
    });
    const result=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(result.error||"Não foi possível autorizar esta foto.");
    const upload=await client.storage.from("vehicle-photos")
      .uploadToSignedUrl(result.path,result.token,file,{contentType:file.type});
    if(upload.error)throw new Error("Falha ao enviar a foto: "+upload.error.message);
    return result.path;
  }
  $("hmVehicleForm").addEventListener("submit",async event=>{
    event.preventDefault();
    const button=$("hmVSave");
    button.disabled=true;
    button.textContent="Salvando…";
    setMessage("");
    const uploaded=[];
    try {
      if(!await getSession())throw new Error("Somente vendedor ou ADM Master pode cadastrar anúncios.");
      const total=existingPhotos.length+pickedFiles.length;
      if(total>10)throw new Error("Escolha no máximo 10 fotos.");
      if($("hmVStatus").value==="published"&&total===0)throw new Error("Adicione pelo menos uma foto para publicar.");
      const paths=existingPhotos.map(photo=>photo.path);
      for(let i=0;i<pickedFiles.length;i++){
        setMessage("Enviando foto "+(i+1)+" de "+pickedFiles.length+"...");
        const path=await uploadPhoto(pickedFiles[i]);
        uploaded.push(path);paths.push(path);
      }
      const body={
        title:$("hmVTitle").value.trim(),category:$("hmVCategory").value,
        brand:$("hmVBrand").value.trim(),model:$("hmVModel").value.trim(),
        manufacture_year:Number($("hmVYear").value),
        price_on_request:$("hmVPriceOnRequest").value==="true",
        price:$("hmVPrice").value===""?null:Number($("hmVPrice").value),
        description:$("hmVDescription").value.trim(),state:$("hmVState").value.trim(),
        city:$("hmVCity").value.trim(),status:$("hmVStatus").value,photos:paths
      };
      if(editing)body.id=editing;
      if(role==="admin"&&!editing&&$("hmVSeller").value)body.seller_id=$("hmVSeller").value;
      const result=await request(editing?"update":"create",body);
      clearForm();setMessage(result.message||"Anúncio salvo.");
      await loadManage();await loadPublic();
    }catch(error) {
      if(uploaded.length){try{await request("cleanup",{photos:uploaded});}catch(cleanupError){console.warn("[HeavyMatch fotos] limpeza pendente");}}
      setMessage(error.message||"Não foi possível salvar o anúncio.",true);
    }finally {
      button.disabled=false;
      button.textContent=editing?"Salvar alterações":"Cadastrar equipamento";
    }
  });
  window.addEventListener("hm-auth-changed",refreshRole);
  window.addEventListener("hm-supabase-ready",refreshRole);
  loadPublic();
  if(window.hmSupabaseClient)refreshRole();
})();