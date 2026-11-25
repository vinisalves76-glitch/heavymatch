(() => {
  "use strict";

  const byId = id => document.getElementById(id);
  const nav = document.querySelector(".bottom-nav");
  if (!nav || byId("hmPostNav")) return;

  let accountRole = "buyer";
  const setLabel = (node, label) => {
    if (!node) return;
    Array.from(node.childNodes).forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) child.remove();
    });
    node.append(document.createTextNode(label));
  };

  const home = byId("homeNav");
  const explore = byId("exploreNav");
  const activity = byId("savedNav");
  setLabel(home, "Início");
  home?.setAttribute("aria-label", "Início");
  setLabel(explore, "Explorar");
  explore?.setAttribute("aria-label", "Explorar equipamentos e filtros");
  setLabel(activity, "Atividade");
  activity?.setAttribute("aria-label", "Atividade, salvos e interesses");

  const post = document.createElement("button");
  post.type = "button";
  post.id = "hmPostNav";
  post.className = "nav-item hm-bottom-primary";
  post.setAttribute("aria-label", "Publicar no CatiraMatch");
  post.innerHTML = '<span class="hm-nav-plus" aria-hidden="true">＋</span>Publicar';
  nav.insertBefore(post, activity || byId("profileNav"));

  const header = document.querySelector(".topbar");
  const experience = document.createElement("div");
  experience.className = "hm-experience-switch";
  experience.setAttribute("aria-label", "Escolha a área principal");
  experience.innerHTML = '<button type="button" class="active" data-experience="marketplace">Compra e venda</button><button type="button" data-experience="services">Serviços e cargas</button>';
  header?.insertAdjacentElement("afterend", experience);

  const savedPanel = byId("savedPanel");
  if (savedPanel) {
    const heading = savedPanel.querySelector(".section-head h3");
    if (heading) heading.textContent = "Sua atividade";
    const shortcuts = document.createElement("div");
    shortcuts.className = "hm-activity-shortcuts";
    shortcuts.innerHTML = [
      '<a class="hm-activity-link" href="/agenciamento-cargas-preview.html"><span>📦</span>Interesses em cargas</a>',
      '<a class="hm-activity-link" href="/apoio-motorista-preview.html"><span>🤝</span>Serviços e parceiros</a>',
      '<button type="button" class="hm-activity-link" id="hmActivityAccount"><span>👤</span>Cadastro e preferências</button>'
    ].join("");
    const list = byId("savedList");
    list?.insertAdjacentElement("beforebegin", shortcuts);
    byId("hmActivityAccount")?.addEventListener("click", () => {
      savedPanel.classList.remove("is-open");
      if (!window.hmMobileOpenMenu?.()) window.hmOpenBuyerProfile?.();
    });
  }

  const overlay = document.createElement("div");
  overlay.className = "hm-shell-overlay";
  overlay.id = "hmPublishOverlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "hmPublishTitle");
  overlay.innerHTML = '<div class="hm-shell-sheet"><div class="hm-shell-sheet-head"><div><div class="eyebrow">PUBLICAR</div><h2 id="hmPublishTitle">O que você quer disponibilizar?</h2><p>As opções mudam de acordo com seu cadastro.</p></div><button class="hm-shell-close" id="hmPublishClose" aria-label="Fechar">×</button></div><div class="hm-publish-grid" id="hmPublishChoices"></div><p class="hm-shell-note">O CatiraMatch mantém compra e venda, serviços e cargas organizados no mesmo aplicativo.</p></div>';
  document.body.appendChild(overlay);

  const closePublish = () => {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  };
  const openAccount = () => {
    closePublish();
    if (!window.hmMobileOpenMenu?.()) window.hmOpenBuyerProfile?.();
  };
  const contactTeam = () => {
    closePublish();
    const link = byId("generalWhatsapp");
    if (link?.href && link.getAttribute("href") !== "#") link.click();
    else byId("hmAccountButton")?.click();
  };
  const openListings = () => {
    closePublish();
    if (typeof window.hmOpenListings === "function") window.hmOpenListings();
    else openAccount();
  };
  const renderPublish = () => {
    const choices = byId("hmPublishChoices");
    if (!choices) return;
    const canManageVehicles = accountRole === "seller" || accountRole === "admin";
    const canPublishLoads = accountRole === "broker" || accountRole === "admin";
    choices.innerHTML = [
      '<button type="button" class="hm-publish-choice" data-publish="vehicle"><span class="icon">🚛</span><span><strong>' + (canManageVehicles ? 'Cadastrar equipamento' : 'Vender ou trocar equipamento') + '</strong><small>' + (canManageVehicles ? 'Abra a gestão de anúncios e publique seu veículo.' : 'Fale com a equipe para iniciar seu anúncio com segurança.') + '</small></span><span class="arrow">›</span></button>',
      '<button type="button" class="hm-publish-choice" data-publish="load"><span class="icon">📦</span><span><strong>' + (canPublishLoads ? 'Cadastrar uma carga' : 'Encontrar cargas') + '</strong><small>' + (canPublishLoads ? 'Informe rota, implemento e disponibilidade.' : 'Veja fretes compatíveis com seu caminhão e implemento.') + '</small></span><span class="arrow">›</span></button>',
      '<button type="button" class="hm-publish-choice" data-publish="service"><span class="icon">🤝</span><span><strong>Oferecer um serviço</strong><small>Cadastre sua atividade para análise e liberação do ADM.</small></span><span class="arrow">›</span></button>'
    ].join("");
  };
  const openPublish = () => {
    renderPublish();
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  };

  post.addEventListener("click", openPublish);
  byId("hmPublishClose")?.addEventListener("click", closePublish);
  overlay.addEventListener("click", event => {
    if (event.target === overlay) closePublish();
    const option = event.target.closest("[data-publish]");
    if (!option) return;
    const action = option.dataset.publish;
    if (action === "vehicle") {
      if (accountRole === "seller" || accountRole === "admin") openListings();
      else contactTeam();
    }
    if (action === "load") {
      closePublish();
      window.location.href = "/agenciamento-cargas-preview.html";
    }
    if (action === "service") openAccount();
  });

  experience.addEventListener("click", event => {
    const button = event.target.closest("[data-experience]");
    if (!button) return;
    const value = button.dataset.experience;
    localStorage.setItem("hm-primary-experience", value);
    if (value === "services") window.location.href = "/apoio-motorista-preview.html";
  });

  activity?.addEventListener("click", () => {
    nav.querySelectorAll(".nav-item").forEach(item => item.classList.toggle("active", item === activity));
  });
  home?.addEventListener("click", () => {
    nav.querySelectorAll(".nav-item").forEach(item => item.classList.toggle("active", item === home));
  });
  explore?.addEventListener("click", () => {
    nav.querySelectorAll(".nav-item").forEach(item => item.classList.toggle("active", item === explore));
  });

  window.addEventListener("hm-auth-changed", event => {
    accountRole = event.detail?.role || "buyer";
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && overlay.classList.contains("open")) closePublish();
  });
})();