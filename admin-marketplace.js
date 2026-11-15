(() => {
  const root = document.getElementById("hmAdminMarketplace");
  if (!root) return;
  root.innerHTML = `
    <div class="hm-admin-section">
      <h3>Solicitações de cadastro de agência</h3>
      <p>O interessado conclui o cadastro, mas permanece como comprador até o ADM liberar o perfil de vendedor.</p>
      <div id="hmAgencyRequests"><div class="hm-private-empty">Abra esta aba para carregar.</div></div>
    </div>
    <div class="hm-admin-section" style="margin-top:12px">
      <h3>Anúncios de pessoa física</h3>
      <p>Anúncios pagos aguardam revisão. Se precisar de fotos melhores, solicite a substituição; depois, vincule um vendedor para liberar na vitrine.</p>
      <div id="hmPrivateAdminListings"><div class="hm-private-empty">Abra esta aba para carregar.</div></div>
    </div>
    <div class="hm-admin-message" id="hmMarketplaceAdminMessage" role="status" aria-live="polite"></div>`;
  const style = document.createElement("style");
  style.textContent = `
    .hm-mkt-card{border:1px solid #e1e6e9;border-radius:12px;padding:12px;margin:10px 0;background:#fff}.hm-mkt-card h4{font-size:13px;margin:0 0 5px}.hm-mkt-meta{font-size:10px;color:#66747d;line-height:1.5;overflow-wrap:anywhere}.hm-mkt-photos{display:flex;gap:6px;overflow:auto;margin:8px 0}.hm-mkt-photos img{width:86px;height:70px;object-fit:cover;border-radius:7px;background:#eef1f3}.hm-mkt-card textarea,.hm-mkt-card select{width:100%;min-height:38px;border:1px solid #d7dfe3;border-radius:8px;padding:8px;font:inherit;font-size:11px;margin-top:7px}.hm-mkt-card textarea{min-height:58px}.hm-mkt-card .hm-admin-actions button{font-size:10px;padding:8px}.hm-mkt-status{font-weight:850;color:#8a6100}
  `;
  document.head.appendChild(style);
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  let sellers = [];
  function message(value, error = false) { $("hmMarketplaceAdminMessage").textContent = value; $("hmMarketplaceAdminMessage").style.color = error ? "#b42332" : "#246b45"; }
  async function request(method, body) {
    const { data, error } = await window.hmSupabaseClient.auth.getSession();
    if (error) throw error;
    const token = data?.session?.access_token;
    if (!token) throw new Error("Entre novamente para continuar.");
    const response = await fetch("/api/admin/marketplace", { method, headers: { "Content-Type": "application/json", Authorization: "Bearer " + token }, body: body ? JSON.stringify(body) : undefined });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Não foi possível carregar as solicitações.");
    return result;
  }
  const date = value => value ? new Date(value).toLocaleString("pt-BR") : "—";
  function renderAgencies(requests) {
    if (!requests.length) { $("hmAgencyRequests").innerHTML = '<div class="hm-private-empty">Nenhuma solicitação de agência aguardando finalização.</div>'; return; }
    $("hmAgencyRequests").innerHTML = requests.map(item => `<article class="hm-mkt-card"><h4>${esc(item.business_name || item.full_name || "Solicitação de vendedor")}</h4><div class="hm-mkt-meta">${esc(item.full_name)} · ${esc(item.email)}<br>WhatsApp: ${esc(item.phone || "Não informado")} · ${Number(item.equipment_count) || 2} equipamentos<br>Recebido em ${esc(date(item.created_at))}<br>Situação: <span class="hm-mkt-status">${esc(item.status)}</span>${item.admin_note ? `<br>Observação: ${esc(item.admin_note)}` : ""}</div><div class="hm-admin-actions">${item.status === "pending" ? `<button type="button" data-agency-contact="${esc(item.id)}">Marcar contato realizado</button>` : ""}<button type="button" class="primary" data-agency-approve="${esc(item.id)}">Liberar como vendedor</button></div></article>`).join("");
    root.querySelectorAll("[data-agency-contact]").forEach(button => button.addEventListener("click", () => runAction({ action: "agency_status", id: button.dataset.agencyContact, status: "contacted" }, "Contato registrado.")));
    root.querySelectorAll("[data-agency-approve]").forEach(button => button.addEventListener("click", () => {
      if (!confirm("Liberar esta conta como vendedor? O WhatsApp informado será usado como contato comercial dos anúncios.")) return;
      runAction({ action: "agency_status", id: button.dataset.agencyApprove, status: "approved" }, "Cadastro de vendedor liberado.");
    }));
  }
  const listingStatus = { draft: "Rascunho sem pagamento", awaiting_payment: "Aguardando confirmação do Mercado Pago", under_review: "Pago · aguardando ADM", changes_requested: "Aguardando ajuste de fotos" };
  function renderListings(listings) {
    if (!listings.length) { $("hmPrivateAdminListings").innerHTML = '<div class="hm-private-empty">Nenhum anúncio particular pendente.</div>'; return; }
    $("hmPrivateAdminListings").innerHTML = listings.map(item => {
      const paid = item.payment?.status === "approved";
      const sellerOptions = `<option value="">Escolha o responsável</option>` + sellers.map(seller => `<option value="${esc(seller.id)}" ${item.assigned_seller_id === seller.id ? "selected" : ""}>${esc(seller.full_name || seller.phone || "Vendedor")}</option>`).join("");
      return `<article class="hm-mkt-card"><h4>${esc(item.title)} · ${esc(item.brand)} ${esc(item.model)}</h4><div class="hm-mkt-meta">Proprietário: ${esc(item.owner_name)} · ${esc(item.owner_phone)}<br>Ano ${esc(item.manufacture_year)} · ${esc(item.condition)} · ${esc(item.city || "")} / ${esc(item.state || "")}<br>Intenção: ${item.intent === "trade" ? `Troca por ${esc(item.desired_category || "")} ${esc(item.desired_description || "")}` : "Venda"}<br>Taxa registrada: ${item.fee_cents_snapshot == null ? "—" : esc((item.fee_cents_snapshot / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }))} · Pagamento: ${paid ? "Confirmado" : esc(item.payment?.status || "Não iniciado")}<br>Situação: <span class="hm-mkt-status">${esc(listingStatus[item.status] || item.status)}</span><br>${esc(item.description || "")}${item.review_note ? `<br>Orientação enviada: ${esc(item.review_note)}` : ""}</div><div class="hm-mkt-photos">${(item.photos || []).map(photo => photo.url ? `<img src="${esc(photo.url)}" alt="Foto enviada pelo proprietário">` : "").join("")}</div>${item.status === "under_review" ? `<label style="display:block;font-size:10px;font-weight:800;margin-top:8px">Vendedor responsável</label><select data-seller-for="${esc(item.id)}">${sellerOptions}</select><textarea data-note-for="${esc(item.id)}" maxlength="1000" placeholder="Se precisar de novas fotos, descreva aqui quais devem ser ajustadas"></textarea><div class="hm-admin-actions"><button type="button" data-request-photos="${esc(item.id)}">Solicitar ajuste de fotos</button><button type="button" class="primary" data-publish="${esc(item.id)}" ${paid ? "" : "disabled"}>Aprovar e liberar na vitrine</button></div>` : ""}</article>`;
    }).join("");
    root.querySelectorAll("[data-request-photos]").forEach(button => button.addEventListener("click", () => {
      const note = root.querySelector(`[data-note-for="${CSS.escape(button.dataset.requestPhotos)}"]`)?.value.trim();
      if (!note) { message("Descreva quais fotos precisam ser trocadas ou refeitas.", true); return; }
      runAction({ action: "request_photos", id: button.dataset.requestPhotos, note }, "Pedido de ajuste enviado ao proprietário.");
    }));
    root.querySelectorAll("[data-publish]").forEach(button => button.addEventListener("click", () => {
      const id = button.dataset.publish;
      const sellerId = root.querySelector(`[data-seller-for="${CSS.escape(id)}"]`)?.value;
      if (!sellerId) { message("Escolha o vendedor que fará a intermediação.", true); return; }
      if (!confirm("Aprovar este anúncio e publicá-lo vinculado ao vendedor selecionado?")) return;
      runAction({ action: "publish", id, seller_id: sellerId }, "Anúncio liberado na vitrine.");
    }));
  }
  async function load() {
    $("hmAgencyRequests").innerHTML = '<div class="hm-private-empty">Carregando solicitações…</div>';
    $("hmPrivateAdminListings").innerHTML = '<div class="hm-private-empty">Carregando anúncios…</div>';
    try {
      const data = await request("GET"); sellers = data.sellers || [];
      renderAgencies(data.agencies || []); renderListings(data.listings || []); message("");
    } catch (error) { $("hmAgencyRequests").textContent = error.message; $("hmPrivateAdminListings").textContent = error.message; }
  }
  async function runAction(body, success) { try { const data = await request("POST", body); message(data.message || success); await load(); } catch (error) { message(error.message, true); } }
  window.addEventListener("hm-admin-pane-changed", event => { if (event.detail?.pane === "marketplace") load(); });
})();
