(() => {
  "use strict";
  const menu = document.createElement("div");
  menu.id = "hmMobileMenu";
  menu.className = "hm-mobile-menu";
  menu.hidden = true;
  menu.innerHTML = `
    <section class="hm-mobile-menu-panel" role="dialog" aria-modal="true" aria-labelledby="hmMobileMenuTitle">
      <header class="hm-mobile-menu-head">
        <h2 id="hmMobileMenuTitle">Minha conta</h2>
        <button class="hm-mobile-menu-close" type="button" id="hmMobileMenuClose" aria-label="Fechar menu">×</button>
      </header>
      <div class="hm-mobile-menu-group">
        <button class="hm-mobile-menu-option" type="button" id="hmMenuAccount"><span aria-hidden="true">♙</span><strong>Entrar ou criar conta</strong></button>
        <button class="hm-mobile-menu-option" type="button" id="hmMenuProfile" hidden><span aria-hidden="true">◉</span>Meu perfil de compra</button>
        <button class="hm-mobile-menu-option" type="button" id="hmMenuListings" hidden><span aria-hidden="true">＋</span>Cadastrar e gerenciar anúncios</button>
        <button class="hm-mobile-menu-option" type="button" id="hmMenuAdmin" hidden><span aria-hidden="true">⚙</span>ADM Master</button>
        <button class="hm-mobile-menu-option" type="button" id="hmMenuHelp"><span aria-hidden="true">?</span>Ajuda e tutorial</button>
        <button class="hm-mobile-menu-option" type="button" id="hmMenuLogout" hidden><span aria-hidden="true">↪</span>Sair da conta</button>
      </div>
      <p class="hm-mobile-menu-note">No Catira.com, deslize para a direita para salvar ou para a esquerda para passar. Toque na foto para ver outras imagens.</p>
    </section>`;
  document.body.appendChild(menu);
  const $ = id => document.getElementById(id);
  const mobile = () => window.matchMedia("(max-width: 799px)").matches;
  let previousFocus = null, previousOverflow = "";

  function sync() {
    const account=$("hmAccountButton");
    const logout=$("hmTopLogout");
    const seller=$("sellerNav");
    const admin=$("hmAdminNav");
    const signedIn=!!logout && !logout.hidden;
    $("hmMenuAccount").querySelector("strong").textContent=signedIn?"Minha conta":"Entrar ou criar conta";
    $("hmMenuProfile").hidden=!signedIn || (seller && !seller.hidden);
    $("hmMenuListings").hidden=!(seller && !seller.hidden);
    $("hmMenuAdmin").hidden=!(admin && admin.classList.contains("hm-visible"));
    $("hmMenuLogout").hidden=!signedIn;
    if(account && account.textContent==="ADM Master")$("hmMenuAccount").querySelector("strong").textContent="Minha conta / ADM";
  }

  function close() {
    if(menu.hidden)return;
    menu.hidden=true;
    document.body.style.overflow=previousOverflow;
    const profile=$("profileNav");
    profile?.classList.remove("active");
    const home=$("homeNav");
    home?.classList.add("active");
    if(previousFocus?.isConnected && typeof previousFocus.focus==="function")previousFocus.focus({preventScroll:true});
    previousFocus=null;
  }
  function open() {
    if(!mobile())return false;
    // A barra inferior oferece filtros e salvos; não deixar painéis sobrepostos ao menu.
    $("filters")?.classList.remove("is-open");
    $("quickbar")?.classList.remove("is-open");
    $("savedPanel")?.classList.remove("is-open");
    $("exploreNav")?.classList.remove("active");
    sync();
    previousFocus=document.activeElement;
    previousOverflow=document.body.style.overflow;
    menu.hidden=false;
    document.body.style.overflow="hidden";
    $("homeNav")?.classList.remove("active");
    $("profileNav")?.classList.add("active");
    $("hmMobileMenuClose").focus();
    return true;
  }
  window.hmMobileOpenMenu=open;
  $("hmMobileMenuClose").addEventListener("click",close);
  menu.addEventListener("click",event=>{if(event.target===menu)close();});
  document.addEventListener("keydown",event=>{if(event.key==="Escape"&&!menu.hidden){event.preventDefault();close();}});
  function forward(button,target) {
    $(button).addEventListener("click",()=>{
      close();
      $(target)?.click();
    });
  }
  forward("hmMenuAccount","hmAccountButton");
  forward("hmMenuListings","sellerNav");
  forward("hmMenuAdmin","hmAdminNav");
  forward("hmMenuHelp","hmTourHelp");
  forward("hmMenuLogout","hmTopLogout");
  $("hmMenuProfile").addEventListener("click",()=>{close();window.hmOpenBuyerProfile?.();});
  // A barra de navegação informa de forma consistente qual área está aberta.
  const primaryTabs=["homeNav","exploreNav","savedNav","profileNav"];
  function selectTab(id) {
    for(const tabId of primaryTabs){
      const item=$(tabId);if(!item)continue;
      const chosen=tabId===id;
      item.classList.toggle("active",chosen);
      if(chosen)item.setAttribute("aria-current","page");
      else item.removeAttribute("aria-current");
    }
  }
  $("homeNav")?.addEventListener("click",()=>selectTab("homeNav"));
  $("exploreNav")?.addEventListener("click",()=>{
    const open=$("filters")?.classList.contains("is-open");
    if(open)$("savedPanel")?.classList.remove("is-open");
    selectTab(open?"exploreNav":"homeNav");
  });
  $("savedNav")?.addEventListener("click",()=>{
    $("filters")?.classList.remove("is-open");
    $("quickbar")?.classList.remove("is-open");
    selectTab($("savedPanel")?.classList.contains("is-open")?"savedNav":"homeNav");
  });
  $("hmMobileMenuClose")?.setAttribute("title","Voltar ao anúncio");
    window.addEventListener("hm-auth-changed",sync);
  window.addEventListener("hm-supabase-ready",sync);
  window.addEventListener("resize",()=>{if(!mobile())close();});
})();