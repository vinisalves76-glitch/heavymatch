(function () {
  "use strict";
  var model = window.hmBuyerProfileModel;
  if (!model) {console.error("[HeavyMatch perfil] O modelo de perfil não foi carregado.");return;}
  var $ = function (id) {return document.getElementById(id);};
  var escapeHtml = function (value) {return String(value==null?"":value).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});};
  var overlay=document.createElement("div");
  overlay.className="hm-profile-overlay";
  overlay.id="hmBuyerProfileOverlay";
  overlay.innerHTML=
    '<section class="hm-profile-panel" role="dialog" aria-modal="true" aria-labelledby="hmProfileTitle">'+
    '<header class="hm-profile-header">'+
      '<div class="hm-profile-header-top"><div class="hm-profile-heading">'+
        '<div class="hm-profile-avatar" id="hmProfileAvatar">HM</div>'+
        '<div><small>HEAVYMATCH · PERFIL DE COMPRA</small><h2 id="hmProfileTitle">Meu perfil</h2>'+
        '<p id="hmProfileEmail">Suas preferências de equipamentos</p></div>'+
      '</div><button type="button" class="hm-profile-close" id="hmProfileClose" aria-label="Fechar perfil">×</button></div>'+
      '<div class="hm-profile-progress"><span id="hmProfileProgressLabel">Complete seu perfil</span>'+
      '<div class="hm-profile-progress-track"><div class="hm-profile-progress-bar" id="hmProfileProgressBar"></div></div>'+
      '<strong id="hmProfilePercent">0%</strong></div>'+
      '<div class="hm-profile-tags" id="hmProfileTags"></div>'+
    '</header>'+
    '<div class="hm-profile-tabbar" id="hmProfileTabs" role="tablist" aria-label="Seções do perfil"></div>'+
    '<main class="hm-profile-body" id="hmProfileBody"><div class="hm-profile-loading">Carregando seu perfil...</div></main>'+
    '<footer class="hm-profile-footer" id="hmProfileFooter">'+
      '<span class="hm-profile-feedback" id="hmProfileFeedback" role="status" aria-live="polite">Nenhuma alteração pendente</span>'+
      '<button type="button" class="hm-profile-secondary" id="hmProfileNext">Próxima</button>'+
      '<button type="button" class="hm-profile-save" id="hmProfileSave">Salvar perfil</button>'+
    '</footer></section>';
  document.body.appendChild(overlay);
  var currentTab=0, currentUser=null, state={}, dirty=false, saving=false;
  var openButton=document.createElement("button");
  openButton.type="button";
  openButton.className="hm-profile-desktop-btn";
  openButton.textContent="Minha busca";
  openButton.setAttribute("aria-label","Abrir meu perfil de comprador");
  openButton.style.cssText="border:1px solid #46545e;background:#25343e;color:#fff;border-radius:11px;padding:9px 11px;font-weight:800;font-size:12px";
  var largeScreen=window.matchMedia?window.matchMedia("(min-width:800px)"):null;
  function updateDesktopVisibility() {
    openButton.hidden=!largeScreen||!largeScreen.matches;
  }
  document.querySelector(".top-actions")?.appendChild(openButton);
  if(largeScreen&&largeScreen.addEventListener)largeScreen.addEventListener("change",updateDesktopVisibility);
  updateDesktopVisibility();
  var client=function(){return window.hmSupabaseClient||null;};
  function feedback(text,bad){
    var el=$("hmProfileFeedback");el.textContent=text;el.style.color=bad?"#b42332":"#59686f";
  }
  function setBusy(value){
    saving=!!value;
    $("hmProfileSave").disabled=saving;
    $("hmProfileSave").textContent=saving?"Salvando...":"Salvar perfil";
  }
  function updateHeading(){
    var name=state.display_name||currentUser?.user_metadata?.full_name||"Meu perfil";
    $("hmProfileTitle").textContent=name;
    $("hmProfileEmail").textContent=currentUser?.email||"Preferências da sua próxima compra";
    $("hmProfileAvatar").textContent=name.trim().split(/\s+/).slice(0,2).map(function(word){return word.charAt(0).toUpperCase();}).join("")||"HM";
    var progress=model.progress(state);
    $("hmProfileProgressLabel").textContent=progress.filled+" respostas preenchidas";
    $("hmProfilePercent").textContent=progress.percent+"%";
    $("hmProfileProgressBar").style.width=progress.percent+"%";
    var tags=[];
    if(state.city||state.state)tags.push([state.city,state.state].filter(Boolean).join(" / "));
    if(state.categories&&state.categories.length)tags.push(state.categories.slice(0,2).join(", "));
    if(state.brands)tags.push(state.brands.slice(0,75));
    if(state.budget_max)tags.push("Até "+Number(state.budget_max).toLocaleString("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}));
    if(state.has_trade==="Sim")tags.push("Tenho veículo para troca");
    $("hmProfileTags").innerHTML=tags.map(function(tag){return '<span class="hm-profile-tag">'+escapeHtml(tag)+'</span>';}).join("")||
      '<span class="hm-profile-tag">Adicione informações para montar sua bio de comprador</span>';
  }
  function optionsFor(field){
    var options=field.type==="yesno"?["Sim","Não","A definir"]:field.options;
    return '<option value="">Selecione</option>'+options.map(function(option){
      return '<option value="'+escapeHtml(option)+'"'+(state[field.key]===option?' selected':'')+'>'+escapeHtml(option)+'</option>';
    }).join("");
  }
  function renderField(field){
    var id="hmBuyer_"+field.key, value=state[field.key],wide=field.wide?" wide":"";
    var name=escapeHtml(field.key),label=escapeHtml(field.label);
    if(field.type==="check"){
      return '<div class="hm-profile-field'+wide+'"><label class="hm-profile-check" for="'+id+'">'+
      '<input type="checkbox" id="'+id+'" data-hm-field="'+name+'"'+(value===true?' checked':'')+'><span>'+label+'</span></label></div>';
    }
    var input;
    if(field.type==="chips"){
      input='<div class="hm-profile-chips" role="group" aria-label="'+label+'">'+field.options.map(function(option){
        var pressed=Array.isArray(value)&&value.indexOf(option)!==-1;
        return '<button type="button" class="hm-profile-chip" data-hm-chip="'+name+'" data-hm-choice="'+escapeHtml(option)+
          '" aria-pressed="'+String(pressed)+'">'+escapeHtml(option)+'</button>';
      }).join("")+'</div>';
    } else if(field.type==="textarea"){
      input='<textarea id="'+id+'" data-hm-field="'+name+'" maxlength="'+(field.max||500)+'" placeholder="'+escapeHtml(field.placeholder||"")+'">'+escapeHtml(value||"")+'</textarea>';
    } else if(field.type==="select"||field.type==="yesno"){
      input='<select id="'+id+'" data-hm-field="'+name+'">'+optionsFor(field)+'</select>';
    } else {
      var type=field.type==="number"?"number":field.type==="tel"?"tel":"text";
      input='<input id="'+id+'" data-hm-field="'+name+'" type="'+type+'" value="'+escapeHtml(value||"")+
        '" placeholder="'+escapeHtml(field.placeholder||"")+'"'+
        (type==="number"?' min="'+field.min+'" max="'+field.max+'" step="any" inputmode="decimal"': ' maxlength="'+(field.max||120)+'"')+'>';
    }
    return '<div class="hm-profile-field'+wide+'">'+(field.type==="chips"?'<label>'+label+'</label>':'<label for="'+id+'">'+label+'</label>')+
      input+(field.help?'<span class="hm-profile-hint">'+escapeHtml(field.help)+'</span>':'')+'</div>';
  }
  function renderTabs(){
    $("hmProfileTabs").innerHTML=model.groups.map(function(group,index){
      return '<button type="button" class="hm-profile-tab" role="tab" aria-selected="'+String(index===currentTab)+
        '" data-hm-tab="'+index+'">'+group.icon+" "+escapeHtml(group.title)+'</button>';
    }).join("");
  }
  function renderForm(){
    var group=model.groups[currentTab];
    renderTabs();
    var fields=group.fields;
    if(group.id==="trade"&&state.has_trade!=="Sim"){
      fields=fields.filter(function(field){return field.key==="has_trade";});
    }
    var extra=group.id==="trade"&&state.has_trade!=="Sim"?
      '<div class="hm-profile-trade-hint">Selecione "Sim" acima para informar marca, modelo, ano, valor e condições do equipamento que deseja oferecer na troca.</div>':"";
    $("hmProfileBody").innerHTML=
      '<section class="hm-profile-section" role="tabpanel" aria-label="'+escapeHtml(group.title)+'">'+
      '<h3>'+group.icon+" "+escapeHtml(group.title)+'</h3><p>'+escapeHtml(group.intro)+'</p>'+
      '<div class="hm-profile-grid">'+fields.map(renderField).join("")+extra+'</div>'+
      (group.id==="preferences"?
        '<p class="hm-profile-privacy">Seus dados ficam associados à sua conta. Esta versão não publica sua bio nem compartilha automaticamente seus contatos com vendedores. As opções de recomendações e contato indicam preferências para futuras funcionalidades.</p>':
        '')+'</section>';
    $("hmProfileNext").textContent=currentTab===model.groups.length-1?"Voltar ao início":"Próxima";
    $("hmProfileBody").scrollTop=0;
    updateHeading();
  }
  function updateField(input){
    var key=input.dataset.hmField, field=model.groups.reduce(function(acc,g){return acc.concat(g.fields);},[]).find(function(f){return f.key===key;});
    if(!field)return;
    state[key]=field.type==="check"?input.checked:input.value;
    dirty=true;
    feedback("Alterações ainda não salvas");
    if(key==="has_trade"){state=model.sanitize(state);renderForm();}else updateHeading();
  }
  $("hmProfileBody").addEventListener("input",function(e){
    var field=e.target.closest("[data-hm-field]");
    if(field)updateField(field);
  });
  $("hmProfileBody").addEventListener("change",function(e){
    var field=e.target.closest("[data-hm-field]");
    if(field)updateField(field);
  });
  $("hmProfileBody").addEventListener("click",function(e){
    var chip=e.target.closest("[data-hm-chip]");
    if(!chip)return;
    var key=chip.dataset.hmChip,option=chip.dataset.hmChoice;
    var selected=Array.isArray(state[key])?state[key].slice():[];
    var pos=selected.indexOf(option);
    if(pos>=0)selected.splice(pos,1);else selected.push(option);
    state[key]=selected;
    dirty=true;
    feedback("Alterações ainda não salvas");
    renderForm();
  });
  $("hmProfileTabs").addEventListener("click",function(e){
    var tab=e.target.closest("[data-hm-tab]");
    if(!tab)return;
    currentTab=Number(tab.dataset.hmTab);renderForm();
  });
  $("hmProfileNext").addEventListener("click",function(){
    currentTab=(currentTab+1)%model.groups.length;renderForm();
  });
  function close(force){
    if(!force&&dirty&&!window.confirm("Existem alterações não salvas. Deseja sair sem salvar?"))return;
    overlay.classList.remove("is-open");
    document.body.style.overflow="";
    currentUser=null;state={};dirty=false;
  }
  $("hmProfileClose").addEventListener("click",function(){close(false);});
  overlay.addEventListener("click",function(e){if(e.target===overlay)close(false);});
  document.addEventListener("keydown",function(e){
    if(e.key==="Escape"&&overlay.classList.contains("is-open")){e.preventDefault();close(false);}
  });
  function renderGuest(message) {
    $("hmProfileBody").innerHTML='<div class="hm-profile-empty"><h3>Seu perfil começa com seu login</h3>'+
      '<p>'+escapeHtml(message||"Entre ou crie sua conta para guardar seu perfil, as condições de compra e os equipamentos de interesse.")+'</p>'+
      '<button type="button" id="hmProfileLogin">Entrar ou fazer cadastro</button></div>';
    $("hmProfileTabs").innerHTML="";
    $("hmProfileFooter").hidden=true;
    $("hmProfileTags").innerHTML="";
    $("hmProfileProgressLabel").textContent="Entre para acessar";
    $("hmProfilePercent").textContent="";
    $("hmProfileProgressBar").style.width="0";
    $("hmProfileLogin").addEventListener("click",function(){close(true);$("hmAccountButton")?.click();});
  }
  async function open(){
    overlay.classList.add("is-open");
    document.body.style.overflow="hidden";
    $("hmProfileBody").innerHTML='<div class="hm-profile-loading">Carregando perfil...</div>';
    $("hmProfileFooter").hidden=true;
    $("hmProfileTitle").textContent="Meu perfil";
    $("hmProfileEmail").textContent="Suas preferências para comprar";
    var supabase=client();
    if(!supabase){renderGuest("A conexão com o login ainda não está pronta. Tente novamente em instantes.");return;}
    try{
      var result=await supabase.auth.getUser();
      if(result.error||!result.data?.user){renderGuest();return;}
      currentUser=result.data.user;
      var metadata=currentUser.user_metadata||{};
      var initial=Object.assign({},metadata[model.metadataKey]||{});
      if(!initial.display_name)initial.display_name=metadata.full_name||"";
      if(!initial.whatsapp)initial.whatsapp=metadata.phone||"";
      state=model.sanitize(initial);dirty=false;currentTab=0;
      $("hmProfileFooter").hidden=false;
      renderForm();feedback("Suas informações ainda não foram publicadas");
    }catch(error){
      console.error("[HeavyMatch perfil] Erro ao abrir:",error?.message);
      renderGuest("Não foi possível carregar o perfil agora. Tente entrar novamente.");
    }
  }
  $("hmProfileSave").addEventListener("click",async function(){
    if(saving||!currentUser)return;
    var supabase=client();
    if(!supabase){feedback("A conexão com o Supabase não está disponível.",true);return;}
    var next=model.sanitize(state);
    if(next.year_from&&next.year_to&&Number(next.year_from)>Number(next.year_to)){
      currentTab=1;renderForm();feedback("O ano mínimo não pode ser maior que o máximo.",true);return;
    }
    if(next.budget_min&&next.budget_max&&Number(next.budget_min)>Number(next.budget_max)){
      currentTab=2;renderForm();feedback("O orçamento mínimo não pode ser maior que o máximo.",true);return;
    }
    setBusy(true);feedback("Salvando suas preferências...");
    try{
      var result=await supabase.auth.updateUser({data:{[model.metadataKey]:next}});
      if(result.error)throw result.error;
      currentUser=result.data.user||currentUser;
      state=next;dirty=false;renderForm();
      feedback("Perfil salvo no Supabase com sucesso!");
    }catch(error){
      console.error("[HeavyMatch perfil] Falha no salvamento:",error?.message);
      feedback(error?.message||"Não foi possível salvar. Verifique a conexão e tente novamente.",true);
    }finally{setBusy(false);}
  });
  window.addEventListener("hm-auth-changed",function(event){
    if(!event.detail?.userId&&overlay.classList.contains("is-open"))close(true);
  });
  window.hmOpenBuyerProfile=open;
  openButton.addEventListener("click",open);
})();