(() => {
  const css = document.createElement("style");
  css.textContent = `
    .hm-account-btn{border:1px solid #46545e;background:#25343e;color:#fff;border-radius:11px;padding:9px 12px;font-weight:800;font-size:12px}
    .hm-auth-overlay,.hm-admin-overlay{position:fixed;inset:0;z-index:100;background:#08111ddd;display:none;align-items:center;justify-content:center;padding:14px}
    .hm-auth-overlay.open,.hm-admin-overlay.open{display:flex}
    .hm-auth-card,.hm-admin-card{width:100%;max-width:780px;max-height:92vh;overflow:auto;background:#fff;color:#1b2932;border-radius:20px;padding:22px;box-shadow:0 20px 70px #0005}
    .hm-auth-card{max-width:420px}
    .hm-auth-card h2,.hm-admin-card h2{margin:0 0 6px;font-size:23px}.hm-auth-card p,.hm-admin-card p{color:#64727c;font-size:13px;line-height:1.5}
    .hm-auth-card label,.hm-admin-card label{display:block;font-size:12px;font-weight:800;margin:13px 0 6px}
    .hm-auth-card input,.hm-admin-card input,.hm-admin-card select{width:100%;height:44px;border:1px solid #dce2e6;border-radius:10px;padding:0 12px;color:#17242e;background:#fff}
    .hm-auth-actions,.hm-admin-actions{display:flex;gap:8px;margin-top:17px;flex-wrap:wrap}.hm-auth-actions button,.hm-admin-actions button{flex:1;min-height:43px;border-radius:10px;font-weight:800;border:1px solid #dce2e6}
    .hm-auth-actions .primary,.hm-admin-actions .primary{background:#f5b323;border-color:#f5b323;color:#17212a}
    .hm-auth-message,.hm-admin-message{font-size:12px;line-height:1.5;margin-top:12px;overflow-wrap:anywhere}.hm-auth-close,.hm-admin-close{float:right;border:0;background:#eef1f3;border-radius:50%;width:32px;height:32px;font-size:20px}
    .hm-admin-kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:18px 0}
    .hm-admin-kpi{padding:13px;background:#f3f5f6;border-radius:13px}.hm-admin-kpi small{display:block;color:#687680;font-size:11px}.hm-admin-kpi strong{font-size:23px;display:block;margin-top:4px}
    .hm-admin-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px}
    .hm-admin-section{border:1px solid #e3e7ea;border-radius:15px;padding:15px;min-width:0}.hm-admin-section h3{margin:0 0 8px;font-size:15px}
    .hm-admin-table-wrap{overflow:auto;margin-top:10px}.hm-admin-table{border-collapse:collapse;width:100%;font-size:12px}.hm-admin-table th,.hm-admin-table td{text-align:left;border-bottom:1px solid #e6e9eb;padding:10px 7px;white-space:nowrap}.hm-admin-role{display:inline-block;padding:4px 7px;border-radius:20px;background:#edf0f2;font-size:10px;font-weight:800}.hm-admin-role.admin{background:#fff0c9;color:#805600}.hm-admin-role.seller{background:#e0f6e9;color:#176b3d}
    .hm-admin-tabs{display:flex;gap:7px;flex-wrap:wrap;margin:15px 0}.hm-admin-tab{border:1px solid #dce2e6;background:#fff;color:#25343e;border-radius:10px;padding:9px 12px;font-weight:800;font-size:12px}.hm-admin-tab.active{background:#17242e;color:#fff}
    .hm-admin-note{background:#fff7e5;border:1px solid #f4dfad;padding:10px;border-radius:10px;font-size:11px;line-height:1.5;color:#654a10}
    .hm-admin-nav{display:none!important}.hm-admin-nav.hm-visible{display:grid!important;color:#f5b323!important}
    @media(max-width:650px){.hm-admin-grid{grid-template-columns:1fr}.hm-admin-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}.hm-admin-kpi{padding:10px}.hm-admin-kpi strong{font-size:19px}.hm-admin-card{padding:16px}.hm-admin-section{padding:12px}}
    @media(max-width:799px){.hm-account-btn{font-size:11px;padding:8px 9px}.hm-admin-overlay{padding:7px}.hm-admin-card{max-height:96vh;border-radius:17px}}
  `;
  document.head.appendChild(css);

  const overlay = document.createElement("div");
  overlay.className = "hm-auth-overlay";
  overlay.innerHTML = `
    <section class="hm-auth-card" role="dialog" aria-modal="true" aria-labelledby="hmAuthTitle">
      <button type="button" class="hm-auth-close" aria-label="Fechar">×</button>
      <div style="font-size:10px;font-weight:900;letter-spacing:1.5px;color:#9a6900;margin:5px 0 9px">ÁREA SEGURA</div>
      <h2 id="hmAuthTitle">Entrar no HeavyMatch</h2>
      <p>Entre com uma conta já cadastrada. O cadastro público de vendedor não está disponível.</p>
      <form id="hmAuthForm">
        <label for="hmAuthEmail">E-mail</label><input id="hmAuthEmail" type="email" autocomplete="username" required>
        <label for="hmAuthPassword">Senha</label><input id="hmAuthPassword" type="password" autocomplete="current-password" required>
        <div class="hm-auth-actions"><button type="button" id="hmAuthCancel">Cancelar</button><button class="primary" type="submit" id="hmAuthSubmit">Entrar</button></div>
      </form>
      <div class="hm-auth-message" id="hmAuthMessage" role="status" aria-live="polite"></div>
    </section>`;
  document.body.appendChild(overlay);

  const adminOverlay = document.createElement("div");
  adminOverlay.className = "hm-admin-overlay";
  adminOverlay.innerHTML = `
    <section class="hm-admin-card" role="dialog" aria-modal="true" aria-labelledby="hmAdminTitle">
      <button type="button" class="hm-admin-close" aria-label="Fechar">×</button>
      <div style="font-size:10px;font-weight:900;letter-spacing:1.5px;color:#9a6900;margin:5px 0 9px">HEAVYMATCH · ACESSO RESTRITO</div>
      <h2 id="hmAdminTitle">ADM Master</h2>
      <p>Gerencie os acessos da plataforma. Somente administradores autorizados conseguem criar novas contas privilegiadas.</p>
      <div class="hm-admin-tabs"><button class="hm-admin-tab active" data-pane="accounts">Usuários e acessos</button><button class="hm-admin-tab" data-pane="future">Equipamentos e operação</button></div>
      <div id="hmAdminAccounts">
        <div class="hm-admin-kpis"><div class="hm-admin-kpi"><small>Total de contas</small><strong id="hmTotalUsers">—</strong></div><div class="hm-admin-kpi"><small>Vendedores</small><strong id="hmTotalSellers">—</strong></div><div class="hm-admin-kpi"><small>Administradores</small><strong id="hmTotalAdmins">—</strong></div></div>
        <div class="hm-admin-grid">
          <section class="hm-admin-section"><h3>Criar acesso</h3><p>Crie vendedores e outros administradores sem acessar o painel do banco de dados.</p>
            <form id="hmCreateUserForm">
              <label for="hmNewName">Nome completo</label><input id="hmNewName" autocomplete="name" placeholder="Nome do usuário" required>
              <label for="hmNewEmail">E-mail de acesso</label><input id="hmNewEmail" type="email" autocomplete="off" placeholder="nome@empresa.com.br" required>
              <label for="hmNewPassword">Senha inicial</label><input id="hmNewPassword" type="password" minlength="8" autocomplete="new-password" placeholder="Mínimo de 8 caracteres" required>
              <label for="hmNewRole">Tipo de acesso</label><select id="hmNewRole"><option value="seller">Vendedor</option><option value="admin">Administrador</option></select>
              <div class="hm-admin-actions"><button class="primary" id="hmCreateUserSubmit" type="submit">Criar conta</button><button type="button" id="hmReloadUsers">Atualizar lista</button></div>
            </form>
            <div class="hm-admin-message" id="hmCreateMessage" role="status" aria-live="polite"></div>
          </section>
          <section class="hm-admin-section"><h3>Contas cadastradas</h3><p>Lista de acessos existentes e seus níveis de permissão.</p>
            <div class="hm-admin-table-wrap"><table class="hm-admin-table"><thead><tr><th>Usuário</th><th>Perfil</th><th>Criado em</th></tr></thead><tbody id="hmUsersTable"><tr><td colspan="3">Carregando…</td></tr></tbody></table></div>
          </section>
        </div>
      </div>
      <div id="hmAdminFuture" hidden><div class="hm-admin-section"><h3>Gestão de equipamentos e operação</h3><p>Esta aba será conectada ao cadastro real de anúncios, fotos, conversas e métricas nas próximas etapas. O catálogo da vitrine ainda contém itens de demonstração; não publicaremos dados como se já estivessem integrados.</p><div class="hm-admin-note">A criação segura de contas está sendo implementada agora. Para habilitar a operação completa, ainda é necessário conectar os formulários de equipamentos, o armazenamento de fotos e o chat às tabelas do Supabase.</div></div></div>
      <div class="hm-admin-actions"><button type="button" id="hmAdminLogout">Sair da conta</button><button type="button" class="primary" id="hmAdminCloseBottom">Fechar ADM</button></div>
      <div class="hm-admin-message" id="hmAdminMessage" role="status" aria-live="polite"></div>
    </section>`;
  document.body.appendChild(adminOverlay);

  const accountButton = document.createElement("button");
  accountButton.type = "button"; accountButton.className = "hm-account-btn"; accountButton.id = "hmAccountButton"; accountButton.textContent = "Entrar";
  document.querySelector(".top-actions")?.prepend(accountButton);
  const adminNav = document.createElement("button");
  adminNav.type = "button"; adminNav.className = "nav-item hm-admin-nav"; adminNav.id = "hmAdminNav"; adminNav.title = "ADM Master"; adminNav.setAttribute("aria-label", "ADM Master"); adminNav.innerHTML = '<span aria-hidden="true">⚙</span>ADM';
  document.querySelector(".bottom-nav")?.appendChild(adminNav);

  let supabaseClient = null;
  let currentUser = null;
  let currentRole = "buyer";
  let configError = "";
  const message = (text, error = false) => { const node = document.getElementById("hmAuthMessage"); node.textContent = text; node.style.color = error ? "#b42332" : "#246b45"; };
  const adminMessage = (text, error = false) => { const node = document.getElementById("hmAdminMessage"); node.textContent = text; node.style.color = error ? "#b42332" : "#246b45"; };
  const createMessage = (text, error = false) => { const node = document.getElementById("hmCreateMessage"); node.textContent = text; node.style.color = error ? "#b42332" : "#246b45"; };
  const closeAuth = () => { overlay.classList.remove("open"); document.body.style.overflow = ""; };
  const closeAdmin = () => { adminOverlay.classList.remove("open"); document.body.style.overflow = ""; };
  const showAuth = () => { overlay.classList.add("open"); document.body.style.overflow = "hidden"; document.getElementById("hmAuthEmail").focus(); };
  const openAdmin = async () => {
    if (currentRole !== "admin" || !currentUser) { showAuth(); return; }
    adminOverlay.classList.add("open"); document.body.style.overflow = "hidden";
    document.getElementById("hmAdminAccounts").hidden = false; document.getElementById("hmAdminFuture").hidden = true;
    document.querySelectorAll(".hm-admin-tab").forEach(button => button.classList.toggle("active", button.dataset.pane === "accounts"));
    await loadUsers();
  };
  overlay.querySelector(".hm-auth-close").addEventListener("click", closeAuth);
  document.getElementById("hmAuthCancel").addEventListener("click", closeAuth);
  overlay.addEventListener("click", e => { if (e.target === overlay) closeAuth(); });
  adminOverlay.querySelector(".hm-admin-close").addEventListener("click", closeAdmin);
  document.getElementById("hmAdminCloseBottom").addEventListener("click", closeAdmin);
  adminOverlay.addEventListener("click", e => { if (e.target === adminOverlay) closeAdmin(); });
  accountButton.addEventListener("click", () => currentRole === "admin" ? openAdmin() : currentUser ? showAccountInfo() : showAuth());
  adminNav.addEventListener("click", openAdmin);
  document.querySelectorAll(".hm-admin-tab").forEach(button => button.addEventListener("click", () => {
    const accounts = button.dataset.pane === "accounts";
    document.querySelectorAll(".hm-admin-tab").forEach(tab => tab.classList.toggle("active", tab === button));
    document.getElementById("hmAdminAccounts").hidden = !accounts;
    document.getElementById("hmAdminFuture").hidden = accounts;
  }));
  function showAccountInfo() {
    overlay.classList.add("open"); document.body.style.overflow = "hidden";
    document.getElementById("hmAuthTitle").textContent = "Minha conta";
    document.querySelector("#hmAuthForm").hidden = true;
    message("Conectado como " + (currentUser?.email || "") + ". Perfil: " + currentRole + ".", false);
  }
  function resetAuthForm() {
    document.getElementById("hmAuthTitle").textContent = "Entrar no HeavyMatch";
    document.querySelector("#hmAuthForm").hidden = false;
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
  async function loadUsers() {
    const table = document.getElementById("hmUsersTable");
    table.innerHTML = '<tr><td colspan="3">Carregando contas…</td></tr>';
    adminMessage("");
    try {
      const result = await apiAdmin("list");
      const users = result.users || [];
      document.getElementById("hmTotalUsers").textContent = users.length;
      document.getElementById("hmTotalSellers").textContent = users.filter(u => u.role === "seller").length;
      document.getElementById("hmTotalAdmins").textContent = users.filter(u => u.role === "admin").length;
      if (!users.length) { table.innerHTML = '<tr><td colspan="3">Nenhuma conta encontrada.</td></tr>'; return; }
      table.innerHTML = users.map(user => {
        const role = ["admin", "seller", "buyer"].includes(user.role) ? user.role : "buyer";
        const roleLabel = role === "admin" ? "Administrador" : role === "seller" ? "Vendedor" : "Comprador";
        const date = user.created_at ? new Date(user.created_at).toLocaleDateString("pt-BR") : "—";
        return '<tr><td><strong>' + escapeHtml(user.full_name || user.email || "Usuário") + '</strong><br><span style="color:#71808a">' + escapeHtml(user.email) + '</span></td><td><span class="hm-admin-role ' + role + '">' + roleLabel + '</span></td><td>' + date + '</td></tr>';
      }).join("");
    } catch (error) {
      table.innerHTML = '<tr><td colspan="3">Não foi possível carregar a lista.</td></tr>';
      adminMessage(error.message, true);
    }
  }
  function escapeHtml(value) { return String(value || "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  document.getElementById("hmReloadUsers").addEventListener("click", loadUsers);
  document.getElementById("hmCreateUserForm").addEventListener("submit", async event => {
    event.preventDefault();
    const button = document.getElementById("hmCreateUserSubmit");
    button.disabled = true; button.textContent = "Criando…"; createMessage("");
    try {
      const result = await apiAdmin("create", {
        full_name: document.getElementById("hmNewName").value.trim(),
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
    currentUser = null; currentRole = "buyer"; window.dispatchEvent(new CustomEvent("hm-auth-changed", { detail: { userId: null, role: "buyer" } })); adminNav.classList.remove("hm-visible"); accountButton.textContent = "Entrar";
    closeAdmin(); resetAuthForm(); showAuth();
    message("Você saiu da sua conta.");
  });

  async function initialize() {
    try {
      const response = await fetch("/api/config", { headers: { Accept: "application/json" } });
      const config = await response.json();
      if (!response.ok) throw new Error(config.error || "Não foi possível carregar a configuração.");
      if (!window.supabase?.createClient) throw new Error("A biblioteca de conexão não carregou. Verifique sua conexão e tente novamente.");
      supabaseClient = window.supabase.createClient(config.url, config.anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session?.user) await showSignedIn(session.user);
      supabaseClient.auth.onAuthStateChange((_event, session) => {
        if (!session?.user) { currentUser = null; currentRole = "buyer"; window.dispatchEvent(new CustomEvent("hm-auth-changed", { detail: { userId: null, role: "buyer" } })); adminNav.classList.remove("hm-visible"); accountButton.textContent = "Entrar"; }
      });
    } catch (error) {
      configError = error?.message || "Falha ao conectar ao Supabase.";
      console.error("[HeavyMatch] Supabase:", configError);
    }
  }
  async function showSignedIn(user) {
    currentUser = user;
    accountButton.textContent = currentRole === "admin" ? "ADM Master" : "Minha conta";
    try {
      const { data: profile, error } = await supabaseClient.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle();
      if (error) throw error;
      currentRole = profile?.role || "buyer";
      window.dispatchEvent(new CustomEvent("hm-auth-changed", { detail: { userId: user.id, role: currentRole } }));
      adminNav.classList.toggle("hm-visible", currentRole === "admin");
      accountButton.textContent = currentRole === "admin" ? "ADM Master" : "Minha conta";
      message("Login realizado. Perfil: " + currentRole + ".", false);
      if (currentRole === "seller") message("Login de vendedor confirmado.", false);
    } catch (error) {
      currentRole = "buyer"; adminNav.classList.remove("hm-visible");
      message("Login realizado, mas não foi possível ler seu perfil. Confira as políticas RLS da tabela profiles.", true);
    }
  }
  document.getElementById("hmAuthForm").addEventListener("submit", async event => {
    event.preventDefault();
    const submit = document.getElementById("hmAuthSubmit");
    submit.disabled = true; submit.textContent = "Entrando…";
    try {
      if (!supabaseClient) throw new Error(configError || "A conexão ainda está carregando. Feche esta janela e tente novamente.");
      const email = document.getElementById("hmAuthEmail").value.trim();
      const password = document.getElementById("hmAuthPassword").value;
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await showSignedIn(data.user);
      if (currentRole === "admin") { closeAuth(); await openAdmin(); }
      else { message("Login realizado. Perfil: " + currentRole + ".", false); window.setTimeout(closeAuth, 1400); }
    } catch (error) { message(error?.message || "Não foi possível entrar. Confira o e-mail e a senha.", true); }
    finally { submit.disabled = false; submit.textContent = "Entrar"; }
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && adminOverlay.classList.contains("open")) closeAdmin();
    else if (e.key === "Escape" && overlay.classList.contains("open")) { closeAuth(); resetAuthForm(); }
  });
  initialize();
})();