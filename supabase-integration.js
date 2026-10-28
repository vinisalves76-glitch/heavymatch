(() => {
  const css = document.createElement("style");
  css.textContent = `
    .hm-account-btn{border:1px solid #46545e;background:#25343e;color:#fff;border-radius:11px;padding:9px 12px;font-weight:800;font-size:12px}
    .hm-auth-overlay{position:fixed;inset:0;z-index:100;background:#08111ddd;display:none;align-items:center;justify-content:center;padding:18px}
    .hm-auth-overlay.open{display:flex}
    .hm-auth-card{width:100%;max-width:420px;background:#fff;color:#1b2932;border-radius:20px;padding:22px;box-shadow:0 20px 70px #0005}
    .hm-auth-card h2{margin:0 0 6px;font-size:23px}.hm-auth-card p{color:#64727c;font-size:13px;line-height:1.5}
    .hm-auth-card label{display:block;font-size:12px;font-weight:800;margin:13px 0 6px}
    .hm-auth-card input{width:100%;height:44px;border:1px solid #dce2e6;border-radius:10px;padding:0 12px;color:#17242e;background:#fff}
    .hm-auth-actions{display:flex;gap:8px;margin-top:17px}.hm-auth-actions button{flex:1;min-height:43px;border-radius:10px;font-weight:800;border:1px solid #dce2e6}
    .hm-auth-actions .primary{background:#f5b323;border-color:#f5b323;color:#17212a}
    .hm-auth-message{font-size:12px;line-height:1.5;margin-top:12px;overflow-wrap:anywhere}.hm-auth-close{float:right;border:0;background:#eef1f3;border-radius:50%;width:32px;height:32px;font-size:20px}
    @media(max-width:799px){.hm-account-btn{font-size:11px;padding:8px 9px}}
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
        <label for="hmAuthEmail">E-mail</label>
        <input id="hmAuthEmail" type="email" autocomplete="username" required>
        <label for="hmAuthPassword">Senha</label>
        <input id="hmAuthPassword" type="password" autocomplete="current-password" required>
        <div class="hm-auth-actions"><button type="button" id="hmAuthCancel">Cancelar</button><button class="primary" type="submit" id="hmAuthSubmit">Entrar</button></div>
      </form>
      <div class="hm-auth-message" id="hmAuthMessage" role="status" aria-live="polite"></div>
    </section>`;
  document.body.appendChild(overlay);

  const accountButton = document.createElement("button");
  accountButton.type = "button";
  accountButton.className = "hm-account-btn";
  accountButton.id = "hmAccountButton";
  accountButton.textContent = "Entrar";
  document.querySelector(".top-actions")?.prepend(accountButton);

  const message = (text, error = false) => {
    const node = document.getElementById("hmAuthMessage");
    node.textContent = text;
    node.style.color = error ? "#b42332" : "#246b45";
  };
  const close = () => { overlay.classList.remove("open"); document.body.style.overflow = ""; };
  overlay.querySelector(".hm-auth-close").addEventListener("click", close);
  document.getElementById("hmAuthCancel").addEventListener("click", close);
  overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
  accountButton.addEventListener("click", () => {
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    document.getElementById("hmAuthEmail").focus();
  });

  let supabaseClient = null;
  let configError = "";
  async function initialize() {
    try {
      const response = await fetch("/api/config", { headers: { Accept: "application/json" } });
      const config = await response.json();
      if (!response.ok) throw new Error(config.error || "Não foi possível carregar a configuração.");
      if (!window.supabase?.createClient) throw new Error("A biblioteca de conexão não carregou. Verifique sua conexão e tente novamente.");
      supabaseClient = window.supabase.createClient(config.url, config.anonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session?.user) await showSignedIn(session.user);
    } catch (error) {
      configError = error?.message || "Falha ao conectar ao Supabase.";
      console.error("[HeavyMatch] Supabase:", configError);
    }
  }

  async function showSignedIn(user) {
    accountButton.textContent = "Minha conta";
    try {
      const { data: profile, error } = await supabaseClient
        .from("profiles").select("full_name, role").eq("id", user.id).maybeSingle();
      if (error) throw error;
      const role = profile?.role || "buyer";
      message("Login realizado. Perfil: " + role + ".", false);
      if (role === "admin") {
        message("Login de administrador confirmado. A conexão está ativa; o painel ADM Master será implementado na próxima etapa.", false);
      } else if (role === "seller") {
        message("Login de vendedor confirmado. O painel de anúncios será implementado na próxima etapa.", false);
      }
    } catch (error) {
      message("Login realizado, mas não foi possível ler o perfil. Confira as políticas RLS da tabela profiles.", true);
    }
  }

  document.getElementById("hmAuthForm").addEventListener("submit", async event => {
    event.preventDefault();
    const submit = document.getElementById("hmAuthSubmit");
    submit.disabled = true;
    submit.textContent = "Entrando…";
    try {
      if (!supabaseClient) throw new Error(configError || "A conexão ainda está carregando. Feche esta janela e tente novamente.");
      const email = document.getElementById("hmAuthEmail").value.trim();
      const password = document.getElementById("hmAuthPassword").value;
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await showSignedIn(data.user);
      accountButton.textContent = "Minha conta";
      window.setTimeout(close, 1800);
    } catch (error) {
      message(error?.message || "Não foi possível entrar. Confira o e-mail e a senha.", true);
    } finally {
      submit.disabled = false;
      submit.textContent = "Entrar";
    }
  });

  document.addEventListener("keydown", e => { if (e.key === "Escape" && overlay.classList.contains("open")) close(); });
  initialize();
})();
