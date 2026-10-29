(() => {
  "use strict";
  const KEY = "heavymatch-product-tour-v1";
  const style = document.createElement("style");
  style.textContent = [
    ".hm-tour-help{border:1px solid #46545e;background:#25343e;color:#fff;border-radius:11px;padding:9px 11px;font-size:12px;font-weight:850;white-space:nowrap}",
    ".hm-tour-welcome,.hm-tour-panel{position:fixed;z-index:10020;width:min(430px,calc(100vw - 28px));background:#fff;color:#18242d;border-radius:18px;box-shadow:0 22px 70px #07131e55;border:1px solid #e2e7ea}",
    ".hm-tour-welcome{left:50%;top:50%;transform:translate(-50%,-50%);padding:25px}",
    ".hm-tour-welcome[hidden],.hm-tour-panel[hidden]{display:none}",
    ".hm-tour-kicker{font-size:10px;letter-spacing:1.5px;font-weight:950;color:#946000;margin-bottom:9px}",
    ".hm-tour-welcome h2,.hm-tour-panel h2{font-size:22px;letter-spacing:-.5px;margin:0 0 9px}",
    ".hm-tour-welcome p,.hm-tour-panel p{font-size:13px;line-height:1.6;color:#5d6a73;margin:0}",
    ".hm-tour-welcome-actions,.hm-tour-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:20px}",
    ".hm-tour-btn{border:1px solid #d9e0e4;background:#f4f6f7;color:#23323c;border-radius:10px;padding:10px 12px;font-size:12px;font-weight:850}",
    ".hm-tour-btn.primary{background:#f5b323;border-color:#f5b323;color:#17212a}",
    ".hm-tour-btn:disabled{opacity:.4;cursor:not-allowed}",
    ".hm-tour-skip{margin-left:auto;border:0;background:transparent;color:#687680;font-size:11px;font-weight:800;padding:8px}",
    ".hm-tour-panel{padding:19px;left:14px;top:14px}",
    ".hm-tour-progress{font-size:11px;color:#687680;font-weight:850;margin-bottom:9px}",
    ".hm-tour-progress-track{height:4px;background:#edf0f2;border-radius:9px;overflow:hidden;margin-bottom:15px}",
    ".hm-tour-progress-fill{height:100%;background:#f5b323;width:0;transition:width .2s}",
    ".hm-tour-backdrop{position:fixed;z-index:10000;background:#08131ed1;pointer-events:auto}",
    ".hm-tour-target{outline:3px solid #f5b323!important;outline-offset:4px!important;border-radius:10px!important;box-shadow:0 0 0 7px #f5b32338!important}",
    ".hm-tour-panel:focus{outline:2px solid #f5b323}",
    "@media(max-width:600px){.hm-tour-welcome{padding:21px}.hm-tour-welcome h2,.hm-tour-panel h2{font-size:20px}.hm-tour-panel{padding:16px}.hm-tour-actions{gap:6px}.hm-tour-btn{padding:10px}.hm-tour-skip{margin-left:0}}",
    "@media(prefers-reduced-motion:reduce){.hm-tour-progress-fill{transition:none}}"
  ].join("\n");
  document.head.appendChild(style);

  const help = document.createElement("button");
  help.type = "button";
  help.className = "hm-tour-help";
  help.id = "hmTourHelp";
  help.textContent = "❔ Ajuda";
  help.setAttribute("aria-label", "Aprender a usar o HeavyMatch");
  document.querySelector(".top-actions")?.appendChild(help);

  const welcome = document.createElement("section");
  welcome.className = "hm-tour-welcome";
  welcome.hidden = true;
  welcome.setAttribute("role", "dialog");
  welcome.setAttribute("aria-modal", "true");
  welcome.setAttribute("aria-labelledby", "hmTourWelcomeTitle");
  welcome.innerHTML = '<div class="hm-tour-kicker">BEM-VINDO AO HEAVYMATCH</div>' +
    '<h2 id="hmTourWelcomeTitle">Vamos conhecer o sistema?</h2>' +
    '<p>Em poucos passos, você vai aprender a explorar os equipamentos, filtrar anúncios, salvar seus favoritos e falar com um consultor. O tour acompanha a interface real e pode ser aberto novamente em <strong>Ajuda</strong>.</p>' +
    '<div class="hm-tour-welcome-actions"><button type="button" class="hm-tour-btn primary" id="hmTourStart">Iniciar tour</button><button type="button" class="hm-tour-btn" id="hmTourLater">Agora não</button></div>';
  document.body.appendChild(welcome);

  const panel = document.createElement("section");
  panel.className = "hm-tour-panel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "false");
  panel.setAttribute("aria-labelledby", "hmTourTitle");
  panel.tabIndex = -1;
  panel.innerHTML = '<div class="hm-tour-progress" id="hmTourProgress">Etapa 1 de 6</div>' +
    '<div class="hm-tour-progress-track"><div class="hm-tour-progress-fill" id="hmTourProgressFill"></div></div>' +
    '<div class="hm-tour-kicker">GUIA INTERATIVO</div><h2 id="hmTourTitle"></h2><p id="hmTourDescription"></p>' +
    '<div class="hm-tour-actions"><button type="button" class="hm-tour-btn" id="hmTourPrevious">Anterior</button><button type="button" class="hm-tour-btn primary" id="hmTourNext">Próximo</button><button type="button" class="hm-tour-skip" id="hmTourSkip">Pular tutorial</button></div>';
  document.body.appendChild(panel);

  const backdrops = [];
  for (let i = 0; i < 4; i++) {
    const block = document.createElement("div");
    block.className = "hm-tour-backdrop";
    block.hidden = true;
    document.body.appendChild(block);
    backdrops.push(block);
  }

  let steps = [];
  let currentIndex = 0;
  let currentTarget = null;
  let previousFocus = null;
  let isTourActive = false;
  const $ = id => document.getElementById(id);
  const readState = () => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (_) { return {}; } };
  const writeState = value => { try { localStorage.setItem(KEY, JSON.stringify(value)); } catch (_) {} };
  const isVisible = el => {
    if (!el || !el.isConnected) return false;
    const computed = window.getComputedStyle(el);
    if (computed.display === "none" || computed.visibility === "hidden" || Number(computed.opacity) === 0) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth;
  };
  const baseSteps = [
    { selector: ".intro", title: "Bem-vindo à vitrine", description: "Esta área apresenta o HeavyMatch. Role a página para explorar os anúncios de caminhões, carretas e máquinas pesadas." },
    { selector: "#quickbar", title: "Explore por categoria", description: "Use os atalhos Caminhões, Escavadeiras e outras categorias para restringir a vitrine ao tipo de equipamento que procura." },
    { selector: "#exploreNav", title: "Filtros e busca", description: "Abra os filtros para combinar marca, modelo, faixa de preço e busca por texto. Você também pode ordenar os anúncios.", before: () => { const f = $("filters"); if (f && !f.classList.contains("is-open")) $("exploreNav")?.click(); } },
    { selector: "#deck", title: "Conheça os anúncios", description: "O cartão mostra fotos, marca, modelo, ano e informações do equipamento. Se o anúncio tiver mais de uma foto cadastrada, toque na foto principal para mudar para a próxima imagem; os indicadores no alto mostram quantas fotos existem e qual está aberta. Se houver apenas uma foto, tocar nela não muda a imagem. Em celulares, deslize para a direita para curtir ou para a esquerda para passar." },
    { selector: "#likeBtn", title: "Curtir e salvar", description: "Toque no coração para adicionar o equipamento à sua lista de interesse. Também é possível deslizar o cartão para a direita." },
    { selector: "#detailsBtn", title: "Ver mais detalhes", description: "Abra os detalhes do anúncio para consultar as informações disponíveis antes de falar com o consultor." },
    { selector: "#savedNav", title: "Sua lista de interesse", description: "Acesse Interesse para rever os equipamentos que você curtiu e remover os que não deseja mais acompanhar." },
    { selector: "#chatNav", title: "Fale com um consultor", description: "O atalho Chat abre o contato comercial configurado para o anúncio atual. Confirme disponibilidade e condições diretamente com o consultor." },
    { selector: "#hmAccountButton", title: "Entrar na sua conta", description: "Entre com o acesso que foi criado para você. As funções de vendedor e administrador aparecem conforme o perfil autorizado; não existe cadastro público de vendedor." }
  ];
  function buildSteps() {
    const result = baseSteps.slice();
    const listings = document.querySelector(".hm-listings-btn");
    const admin = $("hmAdminNav");
    if (isVisible(listings)) result.push({ selector: ".hm-listings-btn", title: "Gerenciar equipamentos", description: "Vendedores e administradores autorizados podem abrir Meus anúncios para cadastrar equipamentos, adicionar fotos, editar anúncios e remover os que não são mais necessários." });
    if (admin && admin.classList.contains("hm-visible") && isVisible(admin)) result.push({ selector: "#hmAdminNav", title: "Área administrativa", description: "Somente administradores autorizados veem esta opção. Ela abre o painel de gestão de acessos, onde é possível criar contas de vendedores e administradores." });
    return result;
  }
  function hideWelcome() { welcome.hidden = true; }
  function clearBackdrop() { backdrops.forEach(el => { el.hidden = true; }); }
  function resetTarget() {
    if (currentTarget) currentTarget.classList.remove("hm-tour-target");
    currentTarget = null;
    clearBackdrop();
  }
  function closeTour() {
    isTourActive = false;
    resetTarget();
    panel.hidden = true;
    hideWelcome();
    document.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("resize", schedulePosition);
    window.removeEventListener("scroll", schedulePosition, true);
    if (previousFocus && previousFocus.isConnected && typeof previousFocus.focus === "function") previousFocus.focus({ preventScroll: true });
  }
  function markDone(status) {
    const state = readState();
    writeState({ ...state, status, updatedAt: new Date().toISOString(), version: 1 });
  }
  function finishTour(status) {
    markDone(status);
    closeTour();
  }
  function openWelcome() {
    closeTour();
    previousFocus = document.activeElement;
    welcome.hidden = false;
    $("hmTourStart").focus();
  }
  function startTour() {
    hideWelcome();
    closeTour();
    previousFocus = document.activeElement;
    steps = buildSteps();
    currentIndex = 0;
    isTourActive = true;
    panel.hidden = false;
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", schedulePosition);
    window.addEventListener("scroll", schedulePosition, true);
    showStep(0, 1);
  }
  function showStep(requestedIndex, direction) {
    if (!isTourActive) return;
    resetTarget();
    let index = requestedIndex;
    while (index >= 0 && index < steps.length) {
      const candidate = document.querySelector(steps[index].selector);
      if (isVisible(candidate)) break;
      index += direction;
    }
    if (index < 0 || index >= steps.length) { finishTour("completed"); return; }
    currentIndex = index;
    const step = steps[currentIndex];
    if (typeof step.before === "function") { try { step.before(); } catch (_) {} }
    const target = document.querySelector(step.selector);
    if (!isVisible(target)) { showStep(currentIndex + direction, direction); return; }
    currentTarget = target;
    currentTarget.classList.add("hm-tour-target");
    $("hmTourTitle").textContent = step.title;
    $("hmTourDescription").textContent = step.description;
    $("hmTourProgress").textContent = "Etapa " + (currentIndex + 1) + " de " + steps.length;
    $("hmTourProgressFill").style.width = (((currentIndex + 1) / steps.length) * 100) + "%";
    $("hmTourPrevious").disabled = currentIndex === 0;
    $("hmTourNext").textContent = currentIndex === steps.length - 1 ? "Concluir" : "Próximo";
    currentTarget.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center", inline: "nearest" });
    panel.hidden = false;
    positionPanel();
    window.requestAnimationFrame(() => { if (isTourActive) { positionBackdrop(); positionPanel(); } });
  }
  function positionBackdrop() {
    if (!isTourActive || !currentTarget || !isVisible(currentTarget)) return;
    const r = currentTarget.getBoundingClientRect(), pad = 8;
    const left = Math.max(0, r.left - pad), top = Math.max(0, r.top - pad);
    const right = Math.min(window.innerWidth, r.right + pad), bottom = Math.min(window.innerHeight, r.bottom + pad);
    const boxes = [
      { left: 0, top: 0, width: window.innerWidth, height: top },
      { left: 0, top, width: left, height: Math.max(0, bottom - top) },
      { left: right, top, width: Math.max(0, window.innerWidth - right), height: Math.max(0, bottom - top) },
      { left: 0, top: bottom, width: window.innerWidth, height: Math.max(0, window.innerHeight - bottom) }
    ];
    boxes.forEach((b, i) => {
      const el = backdrops[i];
      el.style.left = b.left + "px"; el.style.top = b.top + "px";
      el.style.width = b.width + "px"; el.style.height = b.height + "px";
      el.hidden = b.width <= 0 || b.height <= 0;
    });
  }
  function positionPanel() {
    if (!isTourActive || panel.hidden || !currentTarget) return;
    const r = currentTarget.getBoundingClientRect(), gap = 18, margin = 14;
    const width = Math.min(430, window.innerWidth - margin * 2);
    panel.style.width = width + "px"; panel.style.left = margin + "px"; panel.style.right = "auto";
    panel.style.top = margin + "px"; panel.style.bottom = "auto";
    const panelHeight = panel.getBoundingClientRect().height || 260;
    let top = r.bottom + gap;
    if (top + panelHeight > window.innerHeight - margin) top = r.top - panelHeight - gap;
    if (top < margin) top = Math.max(margin, (window.innerHeight - panelHeight) / 2);
    if (top + panelHeight > window.innerHeight - margin) { panel.style.top = "auto"; panel.style.bottom = margin + "px"; }
    else { panel.style.top = top + "px"; panel.style.bottom = "auto"; }
    const left = Math.max(margin, Math.min(r.left, window.innerWidth - width - margin));
    panel.style.left = left + "px";
  }
  let positionFrame = 0;
  function schedulePosition() {
    if (positionFrame) cancelAnimationFrame(positionFrame);
    positionFrame = requestAnimationFrame(() => { positionFrame = 0; positionBackdrop(); positionPanel(); });
  }
  function next() { if (currentIndex >= steps.length - 1) finishTour("completed"); else showStep(currentIndex + 1, 1); }
  function previous() { if (currentIndex > 0) showStep(currentIndex - 1, -1); }
  function onKeyDown(event) {
    if (event.key === "Escape") { event.preventDefault(); finishTour("skipped"); }
    else if (event.key === "ArrowRight") { event.preventDefault(); next(); }
    else if (event.key === "ArrowLeft") { event.preventDefault(); previous(); }
  }
  help.addEventListener("click", () => { if (isTourActive) closeTour(); startTour(); });
  $("hmTourStart").addEventListener("click", startTour);
  $("hmTourLater").addEventListener("click", () => { markDone("skipped"); hideWelcome(); });
  $("hmTourNext").addEventListener("click", next);
  $("hmTourPrevious").addEventListener("click", previous);
  $("hmTourSkip").addEventListener("click", () => finishTour("skipped"));
  const initialState = readState();
  if (!initialState.status) window.setTimeout(() => { if (!document.hidden && !isTourActive && welcome.hidden) openWelcome(); }, 700);
  window.addEventListener("hm-auth-changed", () => {
    if (!isTourActive) return;
    steps = buildSteps();
    showStep(Math.min(currentIndex, steps.length - 1), 1);
  });
  document.addEventListener("visibilitychange", () => { if (!document.hidden && isTourActive) schedulePosition(); });
})();