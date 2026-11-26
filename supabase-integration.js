(() => {
  const css = document.createElement("style");
  css.textContent = `
    .hm-account-btn{border:1px solid #46545e;background:#25343e;color:#fff;border-radius:11px;padding:9px 12px;font-weight:800;font-size:12px}
    .hm-top-logout{border:1px solid #59636a;background:transparent;color:#fff;border-radius:11px;padding:9px 12px;font-weight:800;font-size:12px;cursor:pointer}
    .hm-top-logout[hidden]{display:none!important}
    .hm-auth-overlay,.hm-admin-overlay{position:fixed;inset:0;z-index:100;background:#08111ddd;display:none;align-items:center;justify-content:center;padding:14px}
    .hm-auth-overlay.open,.hm-admin-overlay.open{display:flex}
    .hm-auth-card,.hm-admin-card{width:100%;max-width:780px;max-height:92vh;overflow:auto;background:#fff;color:#1b2932;border-radius:20px;padding:22px;box-shadow:0 20px 70px #0005}
    .hm-auth-card{max-width:420px}
    .hm-auth-card [hidden]{display:none!important}
    .hm-auth-switch{width:100%;border:0;background:transparent;color:#705000;font-weight:850;padding:12px 6px 2px;font-size:12px}
    .hm-auth-card h2,.hm-admin-card h2{margin:0 0 6px;font-size:23px}.hm-auth-card p,.hm-admin-card p{color:#64727c;font-size:13px;line-height:1.5}
    .hm-auth-card label,.hm-admin-card label{display:block;font-size:12px;font-weight:800;margin:13px 0 6px}
    .hm-auth-card input,.hm-auth-card select,.hm-admin-card input,.hm-admin-card select{width:100%;height:44px;border:1px solid #dce2e6;border-radius:10px;padding:0 12px;color:#17242e;background:#fff}
    .hm-service-options{border:1px solid #e0e5e8;border-radius:12px;padding:11px;margin-top:8px;background:#f8f9fa}.hm-service-options>span{display:block;font-size:12px;font-weight:850;margin-bottom:7px}.hm-service-options label{display:flex!important;align-items:center;gap:8px;margin:7px 0!important;font-weight:700!important}.hm-service-options input{width:18px!important;height:18px!important;flex:0 0 auto}.hm-service-options small{display:block;color:#687680;font-size:10px;line-height:1.45;margin-top:8px}.hm-provider-request{border:1px solid #e1e5e8;border-radius:13px;padding:13px;margin:9px 0}.hm-provider-request h4{margin:0 0 5px}.hm-provider-request p{margin:4px 0}.hm-provider-status{display:inline-block;border-radius:99px;padding:5px 8px;font-size:10px;font-weight:900}.hm-provider-status.pending{background:#fff0c9;color:#805600}.hm-provider-status.approved{background:#e0f6e9;color:#176b3d}.hm-provider-status.rejected{background:#ffe5e5;color:#9d2432}
    .hm-auth-actions,.hm-admin-actions{display:flex;gap:8px;margin-top:17px;flex-wrap:wrap}.hm-auth-actions button,.hm-admin-actions button{flex:1;min-height:43px;border-radius:10px;font-weight:800;border:1px solid #dce2e6}
    .hm-auth-actions .primary,.hm-admin-actions .primary{background:#E32227;border-color:#E32227;color:#fff}
    .hm-auth-recovery{color:#705000;font-weight:850;width:100%;padding:9px 5px;border:0;background:transparent;cursor:pointer;font-size:12px;text-align:center}.hm-auth-recovery[hidden]{display:none!important}
    .hm-auth-message,.hm-admin-message{font-size:12px;line-height:1.5;margin-top:12px;overflow-wrap:anywhere}.hm-auth-close,.hm-admin-close{float:right;border:0;background:#eef1f3;border-radius:50%;width:32px;height:32px;font-size:20px}
    .hm-signup-progress{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:12px 0 4px}.hm-signup-progress span{height:5px;border-radius:99px;background:#e5e8ea}.hm-signup-progress span.active{background:#E32227}.hm-signup-step-label{font-size:11px;font-weight:900;color:#687680;margin:8px 0}.hm-signup-next{width:100%;min-height:44px;margin-top:16px;border:0;border-radius:10px;background:#E32227;color:#fff;font-weight:900}.hm-signup-back{width:100%;min-height:40px;margin-top:8px;border:1px solid #dce2e6;border-radius:10px;background:#fff;color:#25343e;font-weight:850}
    .hm-admin-kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:18px 0}
    .hm-admin-kpi{padding:13px;background:#f3f5f6;border-radius:13px}.hm-admin-kpi small{display:block;color:#687680;font-size:11px}.hm-admin-kpi strong{font-size:23px;display:block;margin-top:4px}
    .hm-admin-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px}
    .hm-admin-section{border:1px solid #e3e7ea;border-radius:15px;padding:15px;min-width:0}.hm-admin-section h3{margin:0 0 8px;font-size:15px}
    .hm-admin-table-wrap{overflow:auto;margin-top:10px}.hm-admin-table{border-collapse:collapse;width:100%;font-size:12px}.hm-admin-table th,.hm-admin-table td{text-align:left;border-bottom:1px solid #e6e9eb;padding:10px 7px;white-space:nowrap}.hm-admin-role{display:inline-block;padding:4px 7px;border-radius:20px;background:#edf0f2;font-size:10px;font-weight:800}.hm-admin-role.admin{background:#fff0c9;color:#805600}.hm-admin-role.seller{background:#e0f6e9;color:#176b3d}.hm-admin-role.broker{background:#e7efff;color:#254f91}
    .hm-admin-tabs{display:flex;gap:7px;flex-wrap:wrap;margin:15px 0}.hm-admin-tab{border:1px solid #dce2e6;background:#fff;color:#25343e;border-radius:10px;padding:9px 12px;font-weight:800;font-size:12px}.hm-admin-tab.active{background:#17242e;color:#fff}
    .hm-admin-note{background:#fff7e5;border:1px solid #f4dfad;padding:10px;border-radius:10px;font-size:11px;line-height:1.5;color:#654a10}
    .hm-admin-nav{display:none!important}.hm-admin-nav.hm-visible{display:grid!important;color:#E32227!important}
    @media(max-width:650px){.hm-admin-grid{grid-template-columns:1fr}.hm-admin-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}.hm-admin-kpi{padding:10px}.hm-admin-kpi strong{font-size:19px}.hm-admin-card{padding:16px}.hm-admin-section{padding:12px}}
    @media(max-width:799px){.hm-account-btn{font-size:11px;padding:8px 9px}.hm-admin-overlay{padding:7px}.hm-admin-card{max-height:96vh;border-radius:17px}}
  `;
  document.head.appendChild(css);

  const overlay = document.createElement("div");
  overlay.className = "hm-auth-overlay";
  overlay.innerHTML = `
    <section class="hm-auth-card" role="dialog" aria-modal="true" aria-labelledby="hmAuthTitle">
      <button type="button" class="hm-auth-close" aria-label="Fechar">×</button>
      <div class="hm-auth-brand"><img src="/assets/catiramatch-logo.png" alt="CatiraMatch"><span>Seu próximo negócio começa aqui.</span></div>
      <div style="font-size:10px;font-weight:900;letter-spacing:1.5px;color:#E32227;margin:5px 0 9px">ÁREA SEGURA</div>
      <h2 id="hmAuthTitle">Entre na sua conta</h2>
      <p id="hmAuthSubtitle">Entre com seu e-mail e senha para acessar sua conta.</p>
      <form id="hmAuthForm">
        <label for="hmAuthName" id="hmAuthNameWrap" hidden>Nome completo</label><input id="hmAuthName" type="text" autocomplete="name" maxlength="120" placeholder="Seu nome completo" hidden>
        <label for="hmAuthPhone" id="hmAuthPhoneWrap" hidden>Telefone / WhatsApp</label><input id="hmAuthPhone" type="tel" autocomplete="tel" maxlength="30" placeholder="(31) 99999-9999" hidden>
        <label for="hmAuthAddress" id="hmAuthAddressWrap" hidden>Endereço</label><input id="hmAuthAddress" type="text" autocomplete="street-address" maxlength="240" placeholder="Rua, número, bairro, cidade e estado" hidden>
        <label for="hmHasTruck" id="hmHasTruckWrap" hidden>Você tem caminhão ou cavalo mecânico disponível para rodar?</label><select id="hmHasTruck" hidden><option value="">Selecione</option><option value="yes">Sim</option><option value="no">Não</option></select>
        <div id="hmTruckInfo" hidden><label for="hmTruckType">Veículo disponível</label><select id="hmTruckType"><option>Caminhão</option><option>Cavalo mecânico</option></select><label for="hmTruckAxles">Configuração de eixos</label><select id="hmTruckAxles"><option>4x2</option><option>6x2</option><option>6x4</option><option>8x2</option><option>8x4</option><option>10x4</option><option>Outra configuração</option></select><label for="hmTruckImplement">Implemento acoplado</label><select id="hmTruckImplement"><option>Basculante</option><option>Graneleira</option><option>Prancha</option><option>Baú</option><option>Sider</option><option>Tanque</option><option>Frigorífica</option><option>Porta-contêiner</option><option>Cegonha</option><option>Florestal</option><option>Canavieira</option><option>Dolly</option><option>Outro implemento</option></select></div><label for="hmPrimaryIntent" id="hmPrimaryIntentWrap" hidden>Qual é seu principal interesse no app?</label><select id="hmPrimaryIntent" hidden><option value="marketplace">Compra e venda de equipamentos</option><option value="services">Serviços e apoio ao motorista</option></select>
        <label for="hmOffersServices" id="hmOffersServicesWrap" hidden>Você oferece serviços para caminhoneiros?</label><select id="hmOffersServices" hidden><option value="">Selecione</option><option value="yes">Sim, ofereço serviços</option><option value="no">Não ofereço serviços</option></select>
        <div id="hmServiceInfo" hidden>
          <label for="hmServiceBusiness">Nome do negócio ou empresa (opcional)</label><input id="hmServiceBusiness" maxlength="120" placeholder="Ex.: Cargas Minas">
          <div class="hm-service-options"><span>Quais serviços você oferece?</span>
            <label><input type="checkbox" name="hmService" value="freight_broker">Agenciamento de cargas</label>
            <label><input type="checkbox" name="hmService" value="dispatcher">Despachante e documentação</label>
            <label><input type="checkbox" name="hmService" value="parts_store">Loja de peças e acessórios</label>
            <label><input type="checkbox" name="hmService" value="tow_service">Guincho e reboque</label>
            <label><input type="checkbox" name="hmService" value="electrician">Eletricista</label>
            <label><input type="checkbox" name="hmService" value="mechanic">Oficina e serviços mecânicos</label>
            <label><input type="checkbox" name="hmService" value="insurance_benefits">Seguros e benefícios</label>
            <label><input type="checkbox" name="hmService" value="other">Outro serviço</label>
            <small>O ADM analisará o cadastro. O painel correspondente só será liberado após a aprovação.</small>
          </div>
        </div>
        <label for="hmAuthEmail" id="hmAuthEmailLabel">E-mail</label><input id="hmAuthEmail" type="email" autocomplete="email" maxlength="254" required>
        <label for="hmAuthPassword">Senha</label><input id="hmAuthPassword" type="password" autocomplete="current-password" minlength="8" maxlength="128" placeholder="Mínimo de 8 caracteres" required>
        <label for="hmAuthConfirmPassword" id="hmAuthConfirmWrap" hidden>Confirmar senha</label><input id="hmAuthConfirmPassword" type="password" autocomplete="new-password" minlength="8" maxlength="128" placeholder="Digite a senha novamente" hidden>
        <div class="hm-auth-actions"><button type="button" id="hmAuthCancel">Cancelar</button><button class="primary" type="submit" id="hmAuthSubmit">Entrar</button></div>
      </form>
      <button type="button" class="hm-auth-recovery" id="hmAuthRecovery">Esqueci minha senha</button>
      <button type="button" class="hm-auth-switch" id="hmAuthSwitch">Ainda não tem conta? Fazer cadastro</button>
      <button type="button" class="hm-auth-switch" id="hmAuthLogout" hidden>Sair da conta e entrar com outro acesso</button>
      <div class="hm-auth-message" id="hmAuthMessage" role="status" aria-live="polite"></div>
    </section>`;
  document.body.appendChild(overlay);

  const authForm = document.getElementById("hmAuthForm");
  const authActions = authForm.querySelector(".hm-auth-actions");
  const signupProgress = document.createElement("div");
  signupProgress.id = "hmSignupProgress";
  signupProgress.className = "hm-signup-progress";
  signupProgress.hidden = true;
  signupProgress.innerHTML = '<span class="active"></span><span></span>';
  const signupStepOne = document.createElement("div");
  signupStepOne.id = "hmSignupStepOne";
  const signupStepTwo = document.createElement("div");
  signupStepTwo.id = "hmSignupStepTwo";
  signupStepTwo.hidden = true;
  const movePair = (labelId, inputId, target) => {
    const label = document.getElementById(labelId);
    const input = document.getElementById(inputId);
    if (label) target.appendChild(label);
    if (input) target.appendChild(input);
  };
  movePair("hmAuthNameWrap", "hmAuthName", signupStepOne);
  movePair("hmAuthPhoneWrap", "hmAuthPhone", signupStepOne);
  movePair("hmAuthAddressWrap", "hmAuthAddress", signupStepOne);
  movePair("hmAuthEmailLabel", "hmAuthEmail", signupStepOne);
  const passwordLabel = authForm.querySelector('label[for="hmAuthPassword"]');
  if (passwordLabel) signupStepOne.appendChild(passwordLabel);
  signupStepOne.appendChild(document.getElementById("hmAuthPassword"));
  movePair("hmAuthConfirmWrap", "hmAuthConfirmPassword", signupStepOne);
  movePair("hmPrimaryIntentWrap", "hmPrimaryIntent", signupStepTwo);
  movePair("hmHasTruckWrap", "hmHasTruck", signupStepTwo);
  signupStepTwo.appendChild(document.getElementById("hmTruckInfo"));
  movePair("hmOffersServicesWrap", "hmOffersServices", signupStepTwo);
  signupStepTwo.appendChild(document.getElementById("hmServiceInfo"));
  const signupNext = document.createElement("button");
  signupNext.type = "button";
  signupNext.id = "hmSignupNext";
  signupNext.className = "hm-signup-next";
  signupNext.textContent = "Continuar";
  const signupBack = document.createElement("button");
  signupBack.type = "button";
  signupBack.id = "hmSignupBack";
  signupBack.className = "hm-signup-back";
  signupBack.textContent = "Voltar";
  signupStepOne.appendChild(signupNext);
  signupStepTwo.appendChild(signupBack);
  authForm.insertBefore(signupProgress, authActions);
  authForm.insertBefore(signupStepOne, authActions);
  authForm.insertBefore(signupStepTwo, authActions);
  let signupStep = 1;
  function setSignupStep(step, enabled = authMode === "signup") {
    signupStep = enabled ? step : 1;
    signupProgress.hidden = !enabled;
    signupStepOne.hidden = enabled && signupStep === 2;
    signupStepTwo.hidden = !enabled || signupStep !== 2;
    signupNext.hidden = !enabled || signupStep !== 1;
    signupBack.hidden = !enabled || signupStep !== 2;
    document.getElementById("hmAuthSubmit").hidden = enabled && signupStep === 1;
    signupProgress.querySelectorAll("span").forEach((bar, index) => bar.classList.toggle("active", index < signupStep));
    if (enabled) {
      document.getElementById("hmAuthSubtitle").textContent = signupStep === 1
        ? "Etapa 1 de 2 · Seus dados de acesso."
        : "Etapa 2 de 2 · Conte como pretende usar o CatiraMatch.";
    }
  }
  signupNext.addEventListener("click", () => {
    const invalid = Array.from(signupStepOne.querySelectorAll("input[required],select[required]")).find(field => !field.checkValidity());
    if (invalid) { invalid.reportValidity(); return; }
    setSignupStep(2, true);
    document.querySelector(".hm-auth-card")?.scrollTo({ top: 0, behavior: "smooth" });
  });
  signupBack.addEventListener("click", () => setSignupStep(1, true));
  authForm.addEventListener("submit", event => {
    if (authMode === "signup" && signupStep === 1) {
      event.preventDefault();
      event.stopImmediatePropagation();
      signupNext.click();
    }
  }, true);

  const adminOverlay = document.createElement("div");
  adminOverlay.className = "hm-admin-overlay";
  adminOverlay.innerHTML = `
    <section class="hm-admin-card" role="dialog" aria-modal="true" aria-labelledby="hmAdminTitle">
      <button type="button" class="hm-admin-close" aria-label="Fechar">×</button>
      <div style="font-size:10px;font-weight:900;letter-spacing:1.5px;color:#9a6900;margin:5px 0 9px">CATIRAMATCH · ACESSO RESTRITO</div>
      <h2 id="hmAdminTitle">ADM Master</h2>
      <p>Gerencie os acessos da plataforma. Somente administradores autorizados conseguem criar novas contas privilegiadas.</p>
      <div class="hm-admin-tabs"><button class="hm-admin-tab active" data-pane="accounts">Usuários e acessos</button><button class="hm-admin-tab" data-pane="providers">Prestadores</button><button class="hm-admin-tab" data-pane="future">Equipamentos e operação</button></div>
      <div id="hmAdminAccounts">
        <div class="hm-admin-kpis"><div class="hm-admin-kpi"><small>Total de contas</small><strong id="hmTotalUsers">—</strong></div><div class="hm-admin-kpi"><small>Vendedores</small><strong id="hmTotalSellers">—</strong></div><div class="hm-admin-kpi"><small>Administradores</small><strong id="hmTotalAdmins">—</strong></div></div>
        <div class="hm-admin-grid">
          <section class="hm-admin-section"><h3>Criar acesso</h3><p>Crie vendedores e outros administradores sem acessar o painel do banco de dados.</p>
            <form id="hmCreateUserForm">
              <label for="hmNewName">Nome completo</label><input id="hmNewName" autocomplete="name" placeholder="Nome do usuário" required>
              <label for="hmNewPhone">WhatsApp do vendedor (com DDD)</label><input id="hmNewPhone" type="tel" inputmode="tel" maxlength="20" placeholder="(31) 99999-9999">
              <label for="hmNewEmail">E-mail de acesso</label><input id="hmNewEmail" type="email" autocomplete="off" placeholder="nome@empresa.com.br" required>
              <label for="hmNewPassword">Senha inicial</label><input id="hmNewPassword" type="password" minlength="8" autocomplete="new-password" placeholder="Mínimo de 8 caracteres" required>
              <label for="hmNewRole">Tipo de acesso</label><select id="hmNewRole"><option value="seller">Vendedor</option><option value="broker">Agenciador de cargas</option><option value="admin">Administrador</option></select>
              <div class="hm-admin-actions"><button class="primary" id="hmCreateUserSubmit" type="submit">Criar conta</button><button type="button" id="hmReloadUsers">Atualizar lista</button></div>
            </form>
            <div class="hm-admin-message" id="hmCreateMessage" role="status" aria-live="polite"></div>
          </section>
          <section class="hm-admin-section"><h3>Contas cadastradas</h3><p>Lista de acessos existentes e seus níveis de permissão.</p>
            <div class="hm-admin-table-wrap"><table class="hm-admin-table"><thead><tr><th>Usuário</th><th>WhatsApp</th><th>Perfil</th><th>Criado em</th></tr></thead><tbody id="hmUsersTable"><tr><td colspan="4">Carregando…</td></tr></tbody></table></div>
          </section>
        </div>
      </div>
      <div id="hmAdminProviders" hidden><div class="hm-admin-section"><h3>Solicitações de prestadores</h3><p>Aprove os serviços informados no cadastro. Agenciadores aprovados recebem acesso para publicar cargas.</p><div id="hmProviderRequests"><p>Carregando solicitações…</p></div></div></div>
      <div id="hmAdminFuture" hidden><div class="hm-admin-section"><h3>Gestão de anúncios</h3><p>Cadastre caminhões, carretas e máquinas com fotos, preço, descrição e situação de publicação. O ADM visualiza todos os anúncios e pode escolher o vendedor responsável.</p><div class="hm-admin-actions"><button type="button" class="primary" id="hmAdminOpenListings">Abrir cadastro de equipamentos</button></div><div class="hm-admin-note">O vendedor gerencia somente os próprios anúncios. O comprador não possui acesso ao cadastro.</div></div></div>
      <div class="hm-admin-actions"><button type="button" id="hmAdminLogout">Sair da conta</button><button type="button" class="primary" id="hmAdminCloseBottom">Fechar ADM</button></div>
      <div class="hm-admin-message" id="hmAdminMessage" role="status" aria-live="polite"></div>
    </section>`;
  document.body.appendChild(adminOverlay);

  const accountButton = document.createElement("button");
  accountButton.type = "button"; accountButton.className = "hm-account-btn"; accountButton.id = "hmAccountButton"; accountButton.textContent = "Entrar";
  document.querySelector(".top-actions")?.prepend(accountButton);
  const topLogoutButton = document.createElement("button");
  topLogoutButton.type = "button"; topLogoutButton.className = "hm-top-logout"; topLogoutButton.id = "hmTopLogout"; topLogoutButton.textContent = "Sair"; topLogoutButton.hidden = true; topLogoutButton.setAttribute("aria-label", "Sair da conta");
  document.querySelector(".top-actions")?.appendChild(topLogoutButton);
  const adminNav = document.createElement("button");
  adminNav.type = "button"; adminNav.className = "nav-item hm-admin-nav"; adminNav.id = "hmAdminNav"; adminNav.title = "ADM Master"; adminNav.setAttribute("aria-label", "ADM Master"); adminNav.innerHTML = '<span aria-hidden="true">⚙</span>ADM';
  document.querySelector(".bottom-nav")?.appendChild(adminNav);

  let supabaseClient = null;
  let currentUser = null;
  let currentRole = "buyer";
  let authMode = "login";
  let recoveryPending = false;
  let configError = "";
  const readableError = error => {
    const candidates = [error?.message, error?.error_description, error?.error, error?.details, error?.hint];
    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
      if (candidate && typeof candidate === "object") {
        for (const key of ["message", "error_description", "error", "details", "hint"]) {
          const value = candidate[key];
          if (typeof value === "string" && value.trim()) return value.trim();
        }
      }
    }
    if (typeof error === "string" && error.trim()) return error.trim();
    return "";
  };
  const message = (text, error = false) => { const node = document.getElementById("hmAuthMessage"); node.textContent = typeof text === "string" ? text : readableError(text) || "Não foi possível concluir. Tente novamente."; node.style.color = error ? "#b42332" : "#246b45"; };
  const adminMessage = (text, error = false) => { const node = document.getElementById("hmAdminMessage"); node.textContent = text; node.style.color = error ? "#b42332" : "#246b45"; };
  const createMessage = (text, error = false) => { const node = document.getElementById("hmCreateMessage"); node.textContent = text; node.style.color = error ? "#b42332" : "#246b45"; };
  const closeAuth = () => { overlay.classList.remove("open"); document.body.style.overflow = ""; };
  const closeAdmin = () => { adminOverlay.classList.remove("open"); document.body.style.overflow = ""; };
  const showAuth = () => {
    overlay.classList.add("open"); document.body.style.overflow = "hidden";
    if (recoveryPending) setAuthMode("reset");
    else if (!currentUser) setAuthMode("login");
    document.getElementById("hmAuthEmail").focus();
  };
  const openAdmin = async () => {
    if (currentRole !== "admin" || !currentUser) { showAuth(); return; }
    adminOverlay.classList.add("open"); document.body.style.overflow = "hidden";
    document.getElementById("hmAdminAccounts").hidden = false;
    document.getElementById("hmAdminProviders").hidden = true;
    document.getElementById("hmAdminFuture").hidden = true;
    document.querySelectorAll(".hm-admin-tab").forEach(button => button.classList.toggle("active", button.dataset.pane === "accounts"));
    await Promise.all([loadUsers(), loadProviderRequests()]);
  };
  async function signOutFromTopMenu() {
    if (!currentUser) return;
    topLogoutButton.disabled = true; topLogoutButton.textContent = "Saindo…";
    try {
      if (supabaseClient) { const { error } = await supabaseClient.auth.signOut(); if (error) throw error; }
      currentUser = null; currentRole = "buyer"; topLogoutButton.hidden = true;
      window.dispatchEvent(new CustomEvent("hm-auth-changed", { detail: { userId: null, role: "buyer" } }));
      adminNav.classList.remove("hm-visible"); accountButton.textContent = "Entrar"; topLogoutButton.hidden = true;
      closeAdmin(); closeAuth(); resetAuthForm();
      message("Você saiu da sua conta.");
    } catch (error) {
      message(error?.message || "Não foi possível sair da conta. Tente novamente.", true);
    } finally { topLogoutButton.disabled = false; topLogoutButton.textContent = "Sair"; }
  }
  topLogoutButton.addEventListener("click", signOutFromTopMenu);
  overlay.querySelector(".hm-auth-close").addEventListener("click", closeAuth);
  document.getElementById("hmAuthCancel").addEventListener("click", closeAuth);
  document.getElementById("hmAuthSwitch").addEventListener("click", () => setAuthMode(authMode === "signup" || authMode === "recover" ? "login" : "signup"));
  document.getElementById("hmAuthRecovery").addEventListener("click", () => setAuthMode("recover"));
  overlay.addEventListener("click", e => { if (e.target === overlay) closeAuth(); });
  adminOverlay.querySelector(".hm-admin-close").addEventListener("click", closeAdmin);
  document.getElementById("hmAdminCloseBottom").addEventListener("click", closeAdmin);
  document.getElementById("hmAdminOpenListings").addEventListener("click", () => { closeAdmin(); if(typeof window.hmOpenListings === "function") window.hmOpenListings(); });
  adminOverlay.addEventListener("click", e => { if (e.target === adminOverlay) closeAdmin(); });
  accountButton.addEventListener("click", () => currentRole === "admin" ? openAdmin() : currentUser ? showAccountInfo() : showAuth());
  adminNav.addEventListener("click", openAdmin);
  document.querySelectorAll(".hm-admin-tab").forEach(button => button.addEventListener("click", async () => {
    const pane = button.dataset.pane;
    document.querySelectorAll(".hm-admin-tab").forEach(tab => tab.classList.toggle("active", tab === button));
    document.getElementById("hmAdminAccounts").hidden = pane !== "accounts";
    document.getElementById("hmAdminProviders").hidden = pane !== "providers";
    document.getElementById("hmAdminFuture").hidden = pane !== "future";
    if (pane === "accounts") await loadUsers();
    if (pane === "providers") await loadProviderRequests();
  }));
  function showAccountInfo() {
    overlay.classList.add("open"); document.body.style.overflow = "hidden";
    document.getElementById("hmAuthTitle").textContent = "Minha conta";
    document.getElementById("hmAuthSubtitle").textContent = "Você pode mudar o foco principal do aplicativo quando quiser.";
    document.querySelector("#hmAuthForm").hidden = true;
    document.getElementById("hmAuthSwitch").hidden = true;
    document.getElementById("hmAuthLogout").hidden = false;
    let box=document.getElementById("hmAccountPreferences");
    if(!box){box=document.createElement("div");box.id="hmAccountPreferences";document.querySelector(".hm-auth-card").insertBefore(box,document.getElementById("hmAuthRecovery"));}
    const intent=currentUser?.user_metadata?.primary_intent==="services"?"services":"marketplace";
    box.innerHTML='<label for="hmAccountIntent" style="display:block;margin:12px 0 6px;font-weight:800;font-size:12px">Meu foco principal</label><select id="hmAccountIntent" style="width:100%;height:44px;border:1px solid #dce2e6;border-radius:10px;padding:0 10px"><option value="marketplace">Compra e venda de equipamentos</option><option value="services">Serviços e apoio ao motorista</option></select><button id="hmSaveIntent" type="button" style="width:100%;margin-top:9px;border:0;border-radius:10px;background:#E32227;color:white;padding:12px;font-weight:850">Salvar preferência</button>';
    box.querySelector("#hmAccountIntent").value=intent;
    box.querySelector("#hmSaveIntent").onclick=async function(){try{const value=box.querySelector("#hmAccountIntent").value;const result=await supabaseClient.auth.updateUser({data:{primary_intent:value}});if(result.error)throw result.error;currentUser=result.data.user||currentUser;message("Preferência salva. Ela pode ser alterada a qualquer momento.",false);}catch(error){message(error?.message||"Não foi possível salvar a preferência.",true);}};
    message("Conectado como " + (currentUser?.email || "") + ". Perfil: " + currentRole + ".", false);
  }
  document.getElementById("hmAuthLogout").addEventListener("click", async () => {
    const button = document.getElementById("hmAuthLogout");
    button.disabled = true; button.textContent = "Saindo…";
    try {
      if (supabaseClient) {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
      }
      currentUser = null; currentRole = "buyer";
      window.dispatchEvent(new CustomEvent("hm-auth-changed", { detail: { userId: null, role: "buyer" } }));
      adminNav.classList.remove("hm-visible"); accountButton.textContent = "Entrar";
      document.getElementById("hmAuthLogout").hidden = true;
      document.getElementById("hmAuthSubtitle").textContent = "Entre com seu e-mail e senha para acessar sua conta.";
      resetAuthForm();
      document.getElementById("hmAuthEmail").focus();
    } catch (error) {
      message(error?.message || "Não foi possível sair da conta. Tente novamente.", true);
    } finally {
      button.disabled = false; button.textContent = "Sair da conta e entrar com outro acesso";
    }
  });
  function setAuthMode(mode) {
    authMode = ["login", "signup", "recover", "reset"].includes(mode) ? mode : "login";
    const signup = authMode === "signup";
    const recover = authMode === "recover";
    const reset = authMode === "reset";
    document.getElementById("hmAuthTitle").textContent = signup ? "Crie sua conta" : recover ? "Recuperar acesso" : reset ? "Escolha uma nova senha" : "Entre na sua conta";
    document.getElementById("hmAuthSubtitle").textContent = signup
      ? "Cadastre-se como cliente para salvar equipamentos e acompanhar seus interesses."
      : recover ? "Informe seu e-mail para receber um link de recuperação."
      : reset ? "Digite e confirme sua nova senha para voltar a acessar o CatiraMatch."
      : "Entre com seu e-mail e senha para acessar sua conta.";
    ["Name", "Phone", "Address"].forEach(field => {
      const wrap = document.getElementById("hmAuth" + field + "Wrap");
      const input = document.getElementById("hmAuth" + field);
      wrap.hidden = !signup; input.hidden = !signup; input.required = signup;
    });
    const intentWrap=document.getElementById("hmPrimaryIntentWrap"),intentInput=document.getElementById("hmPrimaryIntent");intentWrap.hidden=!signup;intentInput.hidden=!signup;intentInput.required=signup;
    const offersWrap=document.getElementById("hmOffersServicesWrap"),offers=document.getElementById("hmOffersServices"),serviceInfo=document.getElementById("hmServiceInfo");offersWrap.hidden=!signup;offers.hidden=!signup;offers.required=signup;serviceInfo.hidden=!signup||offers.value!=="yes";
    if(!offers.dataset.bound){offers.addEventListener("change",()=>{serviceInfo.hidden=offers.value!=="yes";});offers.dataset.bound="1";}
    const hasTruckWrap=document.getElementById("hmHasTruckWrap"),hasTruck=document.getElementById("hmHasTruck"),truckInfo=document.getElementById("hmTruckInfo");hasTruckWrap.hidden=!signup;hasTruck.hidden=!signup;hasTruck.required=signup;truckInfo.hidden=!signup||hasTruck.value!=="yes";
    if(!hasTruck.dataset.bound){hasTruck.addEventListener("change",()=>{truckInfo.hidden=hasTruck.value!=="yes";});hasTruck.dataset.bound="1";}
    const emailInput = document.getElementById("hmAuthEmail");
    const emailLabel = document.querySelector('label[for="hmAuthEmail"]');
    emailInput.hidden = reset; emailInput.required = !reset;
    if (emailLabel) emailLabel.hidden = reset;
    const passwordInput = document.getElementById("hmAuthPassword");
    const passwordLabel = document.querySelector('label[for="hmAuthPassword"]');
    passwordInput.hidden = recover;
    passwordInput.required = !recover;
    if (passwordLabel) passwordLabel.hidden = recover;
    passwordInput.autocomplete = signup || reset ? "new-password" : "current-password";
    passwordInput.value = "";
    const confirm = document.getElementById("hmAuthConfirmPassword");
    document.getElementById("hmAuthConfirmWrap").hidden = !signup && !reset;
    confirm.hidden = !signup && !reset;
    confirm.required = signup || reset;
    confirm.value = "";
    document.getElementById("hmAuthForm").hidden = !!currentUser && !reset;
    document.getElementById("hmAuthSwitch").hidden = (!!currentUser && !reset) || reset;
    document.getElementById("hmAuthRecovery").hidden = authMode !== "login";
    document.getElementById("hmAuthLogout").hidden = true;
    document.getElementById("hmAuthSubmit").textContent =
      signup ? "Criar minha conta" : recover ? "Enviar link de recuperação" : reset ? "Atualizar senha" : "Entrar";
    document.getElementById("hmAuthSwitch").textContent = signup || recover
      ? "Já tem conta? Entrar" : "Ainda não tem conta? Fazer cadastro";
    setSignupStep(1, signup);
    message("");
  }
  function resetAuthForm() {
    document.getElementById("hmAuthForm").hidden = false;
    document.getElementById("hmAuthSwitch").hidden = false;
    setAuthMode("login");
    message("");
  }
  async function apiAdmin(action, payload = {}) {
    const { data: sessionData } = await supabaseClient.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) throw new Error("Sua sessão expirou. Entre novamente.");
    const response = await fetch("/api/admin/users", {
      method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify({ action, ...payload })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Falha na operação administrativa.");
    return result;
  }
  async function apiServiceProviders(action, payload = {}) {
    const { data: sessionData } = await supabaseClient.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) throw new Error("Sua sessão expirou. Entre novamente.");
    const response = await fetch("/api/service-providers", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify({ action, ...payload })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Falha na operação de prestadores.");
    return result;
  }
  const serviceLabels = {
    freight_broker: "Agenciamento de cargas",
    dispatcher: "Despachante e documentação",
    parts_store: "Loja de peças e acessórios",
    tow_service: "Guincho e reboque",
    electrician: "Eletricista",
    mechanic: "Oficina e serviços mecânicos",
    insurance_benefits: "Seguros e benefícios",
    other: "Outro serviço"
  };
  async function loadProviderRequests() {
    const container = document.getElementById("hmProviderRequests");
    if (!container || currentRole !== "admin") return;
    container.innerHTML = "<p>Carregando solicitações…</p>";
    try {
      const result = await apiServiceProviders("list");
      const requests = result.requests || [];
      if (!requests.length) {
        container.innerHTML = '<div class="hm-admin-note">Nenhuma solicitação de prestador recebida.</div>';
        return;
      }
      container.innerHTML = requests.map(item => {
        const labels = (item.services || []).map(service => serviceLabels[service] || service).join(", ");
        const statusLabel = item.status === "approved" ? "Aprovado" : item.status === "rejected" ? "Recusado" : "Pendente";
        const date = item.created_at ? new Date(item.created_at).toLocaleDateString("pt-BR") : "—";
        return '<article class="hm-provider-request"><span class="hm-provider-status ' + escapeHtml(item.status) + '">' + statusLabel + '</span>' +
          '<h4>' + escapeHtml(item.business_name || item.profile?.full_name || "Prestador") + '</h4>' +
          '<p><strong>Responsável:</strong> ' + escapeHtml(item.profile?.full_name || "—") + '</p>' +
          '<p><strong>WhatsApp:</strong> ' + escapeHtml(item.profile?.phone || "—") + '</p>' +
          '<p><strong>Serviços:</strong> ' + escapeHtml(labels) + '</p>' +
          '<p><strong>Solicitado em:</strong> ' + date + '</p>' +
          (item.status === "pending" ? '<div class="hm-admin-actions"><button type="button" class="primary hm-provider-review" data-id="' + item.id + '" data-decision="approve">Aprovar</button><button type="button" class="hm-provider-review" data-id="' + item.id + '" data-decision="reject">Recusar</button></div>' : '') +
          '</article>';
      }).join("");
    } catch (error) {
      container.innerHTML = '<div class="hm-admin-note">Não foi possível carregar as solicitações.</div>';
      adminMessage(error.message, true);
    }
  }
  document.getElementById("hmProviderRequests").addEventListener("click", async event => {
    const button = event.target.closest(".hm-provider-review");
    if (!button) return;
    const approve = button.dataset.decision === "approve";
    const note = approve ? "" : (window.prompt("Motivo da recusa (opcional):") || "");
    button.disabled = true;
    try {
      const result = await apiServiceProviders("review", {
        request_id: button.dataset.id,
        decision: button.dataset.decision,
        admin_note: note
      });
      adminMessage(result.message || "Solicitação analisada.");
      await Promise.all([loadProviderRequests(), loadUsers()]);
    } catch (error) {
      adminMessage(error.message, true);
      button.disabled = false;
    }
  });
  async function loadUsers() {
    const table = document.getElementById("hmUsersTable");
    table.innerHTML = '<tr><td colspan="4">Carregando contas…</td></tr>';
    adminMessage("");
    try {
      const result = await apiAdmin("list");
      const users = result.users || [];
      document.getElementById("hmTotalUsers").textContent = users.length;
      document.getElementById("hmTotalSellers").textContent = users.filter(u => u.role === "seller" || u.role === "broker").length;
      document.getElementById("hmTotalAdmins").textContent = users.filter(u => u.role === "admin").length;
      if (!users.length) { table.innerHTML = '<tr><td colspan="4">Nenhuma conta encontrada.</td></tr>'; return; }
      table.innerHTML = users.map(user => {
        const role = ["admin", "seller", "broker", "buyer"].includes(user.role) ? user.role : "buyer";
        const roleLabel = role === "admin" ? "Administrador" : role === "broker" ? "Agenciador de cargas" : role === "seller" ? "Vendedor" : "Comprador";
        const date = user.created_at ? new Date(user.created_at).toLocaleDateString("pt-BR") : "—";
        return '<tr><td><strong>' + escapeHtml(user.full_name || user.email || "Usuário") + '</strong><br><span style="color:#71808a">' + escapeHtml(user.email) + '</span></td><td>' + escapeHtml(user.phone || "—") + '</td><td><span class="hm-admin-role ' + role + '">' + roleLabel + '</span></td><td>' + date + '</td></tr>';
      }).join("");
    } catch (error) {
      table.innerHTML = '<tr><td colspan="4">Não foi possível carregar a lista.</td></tr>';
      adminMessage(error.message, true);
    }
  }
  function escapeHtml(value) { return String(value || "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  document.getElementById("hmNewRole").addEventListener("change", () => { document.getElementById("hmNewPhone").required = document.getElementById("hmNewRole").value === "seller"; });
  document.getElementById("hmNewPhone").required = true;
  document.getElementById("hmReloadUsers").addEventListener("click", loadUsers);
  document.getElementById("hmCreateUserForm").addEventListener("submit", async event => {
    event.preventDefault();
    const button = document.getElementById("hmCreateUserSubmit");
    button.disabled = true; button.textContent = "Criando…"; createMessage("");
    try {
      const result = await apiAdmin("create", {
        full_name: document.getElementById("hmNewName").value.trim(),
        phone: document.getElementById("hmNewPhone").value.trim(),
        email: document.getElementById("hmNewEmail").value.trim(),
        password: document.getElementById("hmNewPassword").value,
        role: document.getElementById("hmNewRole").value
      });
      createMessage(result.message || "Conta criada com sucesso.");
      document.getElementById("hmCreateUserForm").reset();
      await loadUsers();
    } catch (error) { createMessage(error.message, true); }
    finally { button.disabled = false; button.textContent = "Criar conta"; }
  });
  document.getElementById("hmAdminLogout").addEventListener("click", async () => {
    if (supabaseClient) await supabaseClient.auth.signOut();
    currentUser = null; currentRole = "buyer"; window.dispatchEvent(new CustomEvent("hm-auth-changed", { detail: { userId: null, role: "buyer" } })); adminNav.classList.remove("hm-visible"); accountButton.textContent = "Entrar"; topLogoutButton.hidden = true;
    closeAdmin(); resetAuthForm(); showAuth();
    message("Você saiu da sua conta.");
  });

  function enterResetFlow() {
    recoveryPending = true;
    currentUser = null;
    currentRole = "buyer";
    topLogoutButton.hidden = true;
    accountButton.textContent = "Entrar";
    setAuthMode("reset");
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    document.getElementById("hmAuthPassword").value = "";
    message("Link de recuperação reconhecido. Digite a nova senha e confirme para salvar.");
    document.getElementById("hmAuthPassword").focus();
  }
  async function ensureAccountProfile() {
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
    if (sessionError) throw sessionError;
    const token = sessionData?.session?.access_token;
    if (!token) throw new Error("Sessão expirada. Entre novamente.");
    const response = await fetch("/api/auth/profile", {
      method: "POST",
      headers: { "Accept": "application/json", "Authorization": "Bearer " + token }
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Não foi possível concluir a preparação do seu perfil.");
    if (!result.profile?.role) throw new Error("O perfil da conta ainda não está disponível.");
    return result.profile;
  }
  async function initialize() {
    try {
      const response = await fetch("/api/config", { headers: { Accept: "application/json" } });
      const config = await response.json();
      if (!response.ok) throw new Error(config.error || "Não foi possível carregar a configuração.");
      if (!window.supabase?.createClient) throw new Error("A biblioteca de conexão não carregou. Verifique sua conexão e tente novamente.");
      supabaseClient = window.supabase.createClient(config.url, config.anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
      window.hmSupabaseClient = supabaseClient;
      window.dispatchEvent(new CustomEvent("hm-supabase-ready"));
      // Registrar antes de recuperar a sessão: o link de senha pode emitir PASSWORD_RECOVERY nessa etapa.
      supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY") { enterResetFlow(); return; }
        if (!session?.user) {
          currentUser = null;
          currentRole = "buyer";
          topLogoutButton.hidden = true;
          adminNav.classList.remove("hm-visible");
          accountButton.textContent = "Entrar";
          window.dispatchEvent(new CustomEvent("hm-auth-changed", { detail: { userId: null, role: "buyer" } }));
        }
      });
      const { data: { session } } = await supabaseClient.auth.getSession();
      const recoveryLanding = new URLSearchParams(window.location.search).get("hmRecovery") === "1";
      if (recoveryLanding) {
        if (session?.user) enterResetFlow();
        else {
          setAuthMode("recover");
          overlay.classList.add("open");
          document.body.style.overflow = "hidden";
          message("Se o link de recuperação expirou, solicite um novo e-mail.");
        }
      } else if (session?.user && authMode !== "reset") {
        await showSignedIn(session.user);
      }
    } catch (error) {
      configError = error?.message || "Falha ao conectar ao Supabase.";
      console.error("[CatiraMatch] Supabase:", configError);
    }
  }
  function maybeShowBioPrompt(user) {
    if(user?.user_metadata?.primary_intent==="services") {
      if(window.location.pathname==="/"&&!sessionStorage.getItem("hm_focus_route_seen")){sessionStorage.setItem("hm_focus_route_seen","1");window.setTimeout(()=>{window.location.href="/apoio-motorista-preview.html";},1800);}
      return;
    }
    if(localStorage.getItem("hm_bio_prompt_"+user.id))return;
    window.setTimeout(()=>{
      if(localStorage.getItem("hm_bio_prompt_"+user.id))return;
      const box=document.createElement("div");box.id="hmBioPrompt";box.style.cssText="position:fixed;inset:0;z-index:130;background:#08111ddd;display:grid;place-items:center;padding:18px";
      box.innerHTML='<section style="max-width:430px;background:white;border-radius:18px;padding:22px;color:#17242e"><div style="color:#E32227;font-size:10px;font-weight:900;letter-spacing:1px">PERSONALIZE SUA BUSCA</div><h2 style="margin:8px 0">Complete sua Bio</h2><p style="font-size:13px;line-height:1.55;color:#64727c">Sua Bio ajuda o sistema e nossos consultores a entender o que você procura e priorizar anúncios mais compatíveis. Você pode preencher agora ou deixar para depois.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button id="hmBioNow" style="flex:1;border:0;border-radius:10px;background:#E32227;color:white;padding:12px;font-weight:850">Preencher Bio</button><button id="hmBioSkip" style="flex:1;border:1px solid #dce2e6;border-radius:10px;background:white;padding:12px;font-weight:850">Agora não</button></div></section>';
      document.body.appendChild(box);
      function done(){localStorage.setItem("hm_bio_prompt_"+user.id,"1");box.remove();}
      box.querySelector("#hmBioSkip").onclick=done;
      box.querySelector("#hmBioNow").onclick=()=>{done();window.hmOpenBuyerProfile?.();};
    },1600);
  }
  async function syncFreightEquipment(user) {
    const eq=user?.user_metadata?.freight_equipment;if(!eq||!supabaseClient)return;
    try{const {data}=await supabaseClient.auth.getSession();const token=data?.session?.access_token;if(!token)return;
      const r=await fetch("/api/freight",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify({action:"equipment_save",...eq})});
      if(!r.ok)console.warn("[CatiraMatch cargas] Não foi possível sincronizar o conjunto inicial.");
      else await supabaseClient.auth.updateUser({data:{freight_equipment:null}});
    }catch(error){console.warn("[CatiraMatch cargas] Sincronização pendente.",error?.message);}
  }
  async function syncServiceProviderRequest(user) {
    const request = user?.user_metadata?.service_provider_request;
    if (!request || !supabaseClient) return;
    try {
      const result = await apiServiceProviders("request", request);
      if (result.request) {
        await supabaseClient.auth.updateUser({ data: { service_provider_request: null } });
        message("Seu cadastro de prestador está aguardando aprovação do ADM.", false);
      }
    } catch (error) {
      console.warn("[CatiraMatch prestadores] Sincronização pendente.", error?.message);
    }
  }
  async function showSignedIn(user) {
    const profile = await ensureAccountProfile();
    currentUser = user;
    currentRole = profile.role;
    topLogoutButton.hidden = false;
    window.dispatchEvent(new CustomEvent("hm-auth-changed", { detail: { userId: user.id, role: currentRole } }));
    adminNav.classList.toggle("hm-visible", currentRole === "admin");
    accountButton.textContent = currentRole === "admin" ? "ADM Master" : "Minha conta";
    message(currentRole === "seller" ? "Login de vendedor confirmado." : "Login realizado. Perfil: " + currentRole + ".", false);
    syncFreightEquipment(user);
    maybeShowBioPrompt(user);
  }
  document.getElementById("hmAuthForm").addEventListener("submit", async event => {
    event.preventDefault();
    const submit = document.getElementById("hmAuthSubmit");
    submit.disabled = true;
    submit.textContent = authMode === "signup" ? "Criando conta…" : authMode === "recover" ? "Enviando link…" : authMode === "reset" ? "Salvando senha…" : "Entrando…";
    try {
      if (!supabaseClient) throw new Error(configError || "A conexão ainda está carregando. Feche esta janela e tente novamente.");
      const email = document.getElementById("hmAuthEmail").value.trim().toLowerCase();
      const password = document.getElementById("hmAuthPassword").value;
      if (authMode === "recover") {
        if (!email) throw new Error("Informe seu e-mail para recuperar o acesso.");
        const redirectTo = window.location.origin + window.location.pathname + "?hmRecovery=1";
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo });
        if (error) throw error;
        message("Se houver uma conta com esse e-mail, você receberá um link para criar uma nova senha. Confira também o spam.");
      } else if (authMode === "reset") {
        if (!recoveryPending) throw new Error("Abra um link de recuperação válido enviado por e-mail.");
        const confirmPassword = document.getElementById("hmAuthConfirmPassword").value;
        if (password.length < 8) throw new Error("A nova senha precisa ter pelo menos 8 caracteres.");
        if (password !== confirmPassword) throw new Error("As senhas não coincidem. Digite novamente.");
        const { data: recoveryIdentity, error: verifyError } = await supabaseClient.auth.getUser();
        if (verifyError || !recoveryIdentity?.user) throw new Error("Link expirado. Solicite outra recuperação de senha.");
        const { error } = await supabaseClient.auth.updateUser({ password });
        if (error) throw error;
        recoveryPending = false;
        const { error: signOutError } = await supabaseClient.auth.signOut();
        if (signOutError) throw signOutError;
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete("hmRecovery");
        cleanUrl.hash = "";
        window.history.replaceState({}, "", cleanUrl.pathname + cleanUrl.search);
        currentUser = null;
        currentRole = "buyer";
        document.getElementById("hmAuthForm").reset();
        setAuthMode("login");
        message("Senha atualizada com sucesso! Entre com seu e-mail e a nova senha.");
      } else if (authMode === "signup") {
        const fullName = document.getElementById("hmAuthName").value.trim();
        const phone = document.getElementById("hmAuthPhone").value.trim();
        const address = document.getElementById("hmAuthAddress").value.trim();
        const primaryIntent=document.getElementById("hmPrimaryIntent").value;
        const offersServices=document.getElementById("hmOffersServices").value;
        const requestedServices=[...document.querySelectorAll('input[name="hmService"]:checked')].map(input=>input.value);
        const serviceBusiness=document.getElementById("hmServiceBusiness").value.trim();
        const hasTruck=document.getElementById("hmHasTruck").value;
        const freightEquipment=hasTruck==="yes"?{vehicle_type:document.getElementById("hmTruckType").value,axle_config:document.getElementById("hmTruckAxles").value,implement_type:document.getElementById("hmTruckImplement").value}:null;
        const confirmPassword = document.getElementById("hmAuthConfirmPassword").value;
        if (!fullName || !phone || !address) throw new Error("Preencha nome, telefone e endereço.");
        if (!["services","marketplace"].includes(primaryIntent)) throw new Error("Escolha seu principal interesse no aplicativo.");
        if(!["yes","no"].includes(offersServices))throw new Error("Informe se você oferece serviços para caminhoneiros.");
        if(offersServices==="yes"&&!requestedServices.length)throw new Error("Selecione pelo menos um serviço oferecido.");
        if(!["yes","no"].includes(hasTruck))throw new Error("Informe se você tem caminhão disponível para rodar.");
        if (password !== confirmPassword) throw new Error("As senhas não coincidem. Digite a mesma senha nos dois campos.");
        const { data, error } = await supabaseClient.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName, phone, address, account_type: "buyer", primary_intent: primaryIntent, freight_equipment: freightEquipment, service_provider_request: offersServices==="yes"?{business_name:serviceBusiness,services:requestedServices}:null, hm_buyer_profile_v1: { allow_recommendations: true } }
          }
        });
        if (error) throw error;
        if (data.session) {
          await ensureAccountProfile();
          const { error: signOutError } = await supabaseClient.auth.signOut();
          if (signOutError) throw signOutError;
        }
        currentUser = null;
        currentRole = "buyer";
        topLogoutButton.hidden = true;
        accountButton.textContent = "Entrar";
        adminNav.classList.remove("hm-visible");
        window.dispatchEvent(new CustomEvent("hm-auth-changed", { detail: { userId: null, role: "buyer" } }));
        document.getElementById("hmAuthForm").reset();
        resetAuthForm();
        document.getElementById("hmAuthEmail").value = email;
        message(data.session
          ? "Cadastro concluído! Agora entre usando seu e-mail e sua senha."
          : "Solicitação recebida. Verifique seu e-mail para confirmar o cadastro. Se você já tinha uma conta, use Entrar ou Esqueci minha senha.", false);
      } else {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await showSignedIn(data.user);
        if (currentRole === "admin") { closeAuth(); await openAdmin(); }
        else { message("Login realizado. Perfil: " + currentRole + ".", false); window.setTimeout(closeAuth, 1400); }
      }
    } catch (error) {
      const raw = readableError(error);
      console.error("[CatiraMatch] Falha no fluxo de autenticação:", error);
      const friendly = /invalid login credentials/i.test(raw) ? "Não foi possível entrar com esse e-mail e senha. Se esqueceu a senha, toque em Esqueci minha senha."
        : /email not confirmed/i.test(raw) ? "Confirme seu e-mail antes de entrar. Verifique a caixa de entrada e o spam."
        : /user already registered/i.test(raw) ? "Este e-mail já possui cadastro. Entre na sua conta ou recupere a senha."
        : /password should be at least/i.test(raw) ? "A senha precisa ter pelo menos 8 caracteres."
        : /rate limit|over_email_send_rate_limit/i.test(raw) ? "Muitas tentativas de envio. Aguarde um pouco antes de solicitar outro link."
        : (raw || "Não foi possível concluir. Confira sua conexão e tente novamente.");
      message(friendly, true);
    } finally {
      submit.disabled = false;
      submit.textContent = authMode === "signup" ? "Criar minha conta" : authMode === "recover" ? "Enviar link de recuperação" : authMode === "reset" ? "Salvar nova senha" : "Entrar";
    }
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && adminOverlay.classList.contains("open")) closeAdmin();
    else if (e.key === "Escape" && overlay.classList.contains("open")) { closeAuth(); resetAuthForm(); }
  });
  initialize();
})();