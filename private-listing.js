(() => {
  const css = document.createElement("style");
  css.textContent = `
    .hm-private-overlay{position:fixed;inset:0;z-index:130;background:#07111deb;display:none;align-items:center;justify-content:center;padding:10px}.hm-private-overlay.open{display:flex}
    .hm-private-card{width:100%;max-width:900px;max-height:96vh;overflow:auto;background:#fff;color:#192630;border-radius:18px;padding:18px}
    .hm-private-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.hm-private-head h2{margin:0;font-size:21px}.hm-private-close{border:0;border-radius:50%;width:36px;height:36px;font-size:22px;background:#edf0f2}
    .hm-private-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(240px,.85fr);gap:14px;margin-top:13px}.hm-private-section{border:1px solid #e0e6e9;border-radius:13px;padding:14px;min-width:0}.hm-private-form{display:grid;grid-template-columns:1fr 1fr;gap:9px}.hm-private-field{min-width:0}.hm-private-field.full{grid-column:1/-1}.hm-private-field label{display:block;font-size:11px;font-weight:850;margin:0 0 5px}.hm-private-field input,.hm-private-field select,.hm-private-field textarea{width:100%;min-height:40px;padding:9px 10px;border:1px solid #d7dfe3;border-radius:9px;background:#fff;color:#1d2a32;font:inherit;font-size:12px}.hm-private-field textarea{min-height:82px;resize:vertical}.hm-private-help{font-size:10px;line-height:1.45;color:#67747c;margin-top:5px}.hm-private-guidance{padding:10px;background:#fff8e8;border:1px solid #f1dfb4;border-radius:10px;font-size:10px;line-height:1.5;color:#624c1b}.hm-private-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.hm-private-actions button{flex:1;min-height:41px;border:1px solid #d7dfe3;border-radius:9px;background:#f5f7f8;color:#1c2a32;font-size:11px;font-weight:850}.hm-private-actions .primary{background:#E32227;border-color:#E32227;color:#fff}.hm-private-actions button:disabled{opacity:.55}.hm-private-message{font-size:11px;line-height:1.45;margin-top:8px;overflow-wrap:anywhere}.hm-private-photo-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-top:8px}.hm-private-photo-grid img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:7px;background:#eff2f4}.hm-private-item{border-bottom:1px solid #e6e9eb;padding:10px 0}.hm-private-item:first-child{padding-top:0}.hm-private-item strong{display:block;font-size:12px}.hm-private-item small{display:block;color:#687680;font-size:10px;line-height:1.4;margin-top:4px}.hm-private-item button{margin-top:7px;border:1px solid #d6dfe3;background:#f6f8f9;border-radius:8px;padding:7px 10px;font-size:10px;font-weight:800}.hm-private-empty{font-size:11px;color:#6a777f;line-height:1.5}
    @media(max-width:700px){.hm-private-grid{grid-template-columns:1fr}.hm-private-card{padding:12px}.hm-private-form{grid-template-columns:1fr 1fr}.hm-private-head h2{font-size:18px}}
  `;
  document.head.appendChild(css);
  const overlay = document.createElement("div");
  overlay.className = "hm-private-overlay";
  overlay.innerHTML = `
    <section class="hm-private-card" role="dialog" aria-modal="true" aria-labelledby="hmPrivateTitle">
      <div class="hm-private-head"><div><small style="font-size:9px;font-weight:900;letter-spacing:1px;color:#E32227">CATIRAMATCH · PESSOA FÍSICA</small><h2 id="hmPrivateTitle">Anunciar meu caminhão</h2></div><button class="hm-private-close" type="button" aria-label="Fechar">×</button></div>
      <p style="font-size:11px;color:#66747d;line-height:1.5;margin:7px 0">Uma taxa única por anúncio. Depois do pagamento, o ADM revisa o material e vincula um vendedor responsável. O contato dos interessados será intermediado por esse vendedor.</p>
      <div class="hm-private-grid">
        <section class="hm-private-section">
          <form id="hmPrivateForm" class="hm-private-form">
            <input id="hmPrivateId" type="hidden">
            <div class="hm-private-field full"><label for="hmPrivateIntent">O que você pretende fazer?</label><select id="hmPrivateIntent"><option value="sale">Vender meu caminhão</option><option value="trade">Trocar meu caminhão</option></select></div>
            <div class="hm-private-field full"><label for="hmPrivateTitleInput">Título do anúncio *</label><input id="hmPrivateTitleInput" maxlength="140" required placeholder="Ex.: Bitruck 6x2 em bom estado"></div>
            <div class="hm-private-field"><label for="hmPrivateCategory">Tipo de veículo *</label><input id="hmPrivateCategory" required maxlength="80" placeholder="Bitruck, cavalo mecânico toco..."></div>
            <div class="hm-private-field"><label for="hmPrivateCondition">Estado de conservação *</label><select id="hmPrivateCondition" required><option value="">Selecione</option><option>Excelente</option><option>Bom</option><option>Regular</option><option>Precisa de reparos</option></select></div>
            <div class="hm-private-field"><label for="hmPrivateBrand">Marca *</label><input id="hmPrivateBrand" required maxlength="80" placeholder="DAF, Volvo, Scania..."></div>
            <div class="hm-private-field"><label for="hmPrivateModel">Modelo *</label><input id="hmPrivateModel" required maxlength="100"></div>
            <div class="hm-private-field"><label for="hmPrivateYear">Ano *</label><input id="hmPrivateYear" type="number" min="1900" max="2100" required></div>
            <div class="hm-private-field"><label for="hmPrivateState">Estado (UF)</label><input id="hmPrivateState" maxlength="80" placeholder="MG"></div>
            <div class="hm-private-field"><label for="hmPrivateCity">Cidade</label><input id="hmPrivateCity" maxlength="100"></div>
            <div class="hm-private-field"><label for="hmPrivatePrice">Preço (R$)</label><input id="hmPrivatePrice" type="number" min="0" step="0.01" placeholder="250000"></div>
            <div class="hm-private-field"><label for="hmPrivateRequestPrice">Como exibir o preço?</label><select id="hmPrivateRequestPrice"><option value="true" selected>Sob consulta</option><option value="false">Mostrar preço</option></select></div>
            <div class="hm-private-field full" id="hmPrivateTradeFields" hidden><label for="hmPrivateDesired">Qual veículo gostaria de receber? *</label><input id="hmPrivateDesired" maxlength="100" placeholder="Ex.: Cavalo mecânico toco"><label for="hmPrivateDesiredDetails" style="margin-top:8px">Detalhes do veículo desejado</label><textarea id="hmPrivateDesiredDetails" maxlength="500" placeholder="Ano, configuração, localização e outras preferências"></textarea></div>
            <div class="hm-private-field full"><label for="hmPrivateDescription">Descrição</label><textarea id="hmPrivateDescription" maxlength="5000" placeholder="Quilometragem, manutenção, pneus, documentação e detalhes importantes"></textarea></div>
            <div class="hm-private-field full"><label for="hmPrivatePhotos">Fotos (JPG, PNG ou WebP, até 10 MB cada; até 10 fotos)</label><input id="hmPrivatePhotos" type="file" accept="image/jpeg,image/png,image/webp" multiple><div class="hm-private-guidance">Para facilitar a aprovação, mostre frente, laterais, traseira, cabine, pneus e painel. Use fotos nítidas, bem iluminadas e sem filtros. Se algum ajuste for necessário, o ADM explicará o que trocar; você poderá corrigir e reenviar.</div><div class="hm-private-photo-grid" id="hmPrivatePhotoPreview"></div></div>
            <div class="hm-private-field full"><div class="hm-private-actions"><button type="submit" class="primary" id="hmPrivateSubmit">Salvar e continuar para pagamento</button><button type="button" id="hmPrivateNew">Novo anúncio</button></div><div class="hm-private-message" id="hmPrivateMessage" role="status" aria-live="polite"></div></div>
          </form>
        </section>
        <section class="hm-private-section"><h3 style="font-size:14px;margin:0 0 9px">Meus anúncios particulares</h3><div id="hmPrivateMine" class="hm-private-empty">Carregando…</div></section>
      </div>
    </section>`;
  document.body.appendChild(overlay);
  const $ = id => document.getElementById(id);
  let client = null, role = window.hmAccountAccess?.role || "buyer", existingPaths = [], existingPhotoUrls = [], editingStatus = "";
  const statusLabels = { draft: "Rascunho", awaiting_payment: "Aguardando pagamento", under_review: "Em revisão pelo ADM", changes_requested: "Ajustes de fotos solicitados", published: "Publicado na vitrine" };
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const setMessage = (text, error = false) => { $("hmPrivateMessage").textContent = text; $("hmPrivateMessage").style.color = error ? "#b42332" : "#246b45"; };
  function setIntent() {
    const trade = $("hmPrivateIntent").value === "trade";
    $("hmPrivateTradeFields").hidden = !trade;
    $("hmPrivateDesired").required = trade;
  }
  function clearForm() {
    $("hmPrivateForm").reset(); $("hmPrivateId").value = ""; existingPaths = []; existingPhotoUrls = []; editingStatus = "";
    $("hmPrivateIntent").value = "sale"; $("hmPrivatePhotoPreview").innerHTML = ""; setIntent(); setMessage("");
    $("hmPrivateSubmit").textContent = "Salvar e continuar para pagamento";
  }
  async function getToken() {
    client = window.hmSupabaseClient;
    if (!client) throw new Error("A conexão com sua conta ainda está carregando.");
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    if (!data?.session?.access_token) throw new Error("Entre novamente para continuar.");
    return data.session.access_token;
  }
  async function callApi(method, body) {
    const token = await getToken();
    const response = await fetch("/api/private-listings", { method, headers: { "Content-Type": "application/json", Authorization: "Bearer " + token }, body: body ? JSON.stringify(body) : undefined });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Não foi possível carregar seus anúncios.");
    return data;
  }
  function formData(paths) {
    const priceOnRequest = $("hmPrivateRequestPrice").value === "true";
    return {
      id: $("hmPrivateId").value || undefined, intent: $("hmPrivateIntent").value,
      title: $("hmPrivateTitleInput").value.trim(), category: $("hmPrivateCategory").value.trim(),
      brand: $("hmPrivateBrand").value.trim(), model: $("hmPrivateModel").value.trim(),
      manufacture_year: Number($("hmPrivateYear").value), condition: $("hmPrivateCondition").value,
      city: $("hmPrivateCity").value.trim(), state: $("hmPrivateState").value.trim(),
      description: $("hmPrivateDescription").value.trim(), price_on_request: priceOnRequest,
      price: priceOnRequest || !$("hmPrivatePrice").value.trim() ? null : Number($("hmPrivatePrice").value),
      desired_category: $("hmPrivateDesired").value.trim(), desired_description: $("hmPrivateDesiredDetails").value.trim(), photos: paths
    };
  }
  async function upload(file, listingId) {
    if (!/^(image\/jpeg|image\/png|image\/webp)$/.test(file.type) || file.size < 1 || file.size > 10 * 1024 * 1024) throw new Error("Cada foto precisa ser JPG, PNG ou WebP e ter até 10 MB.");
    const token = await getToken();
    const signedResponse = await fetch("/api/private-listings/photo-token", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token }, body: JSON.stringify({ listing_id: listingId, content_type: file.type, size: file.size }) });
    const signed = await signedResponse.json().catch(() => ({}));
    if (!signedResponse.ok) throw new Error(signed.error || "Não foi possível preparar a foto.");
    const { error } = await client.storage.from("vehicle-photos").uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type, upsert: false });
    if (error) throw new Error("Não foi possível enviar uma das fotos. Tente novamente.");
    return signed.path;
  }
  function renderMine(listings) {
    if (!listings.length) { $("hmPrivateMine").innerHTML = '<div class="hm-private-empty">Você ainda não enviou anúncio particular.</div>'; return; }
    $("hmPrivateMine").innerHTML = listings.map(item => `<div class="hm-private-item"><strong>${esc(item.brand)} ${esc(item.model)} · ${esc(item.manufacture_year)}</strong><small>${esc(statusLabels[item.status] || item.status)}${item.review_note ? `<br><b>Orientação do ADM:</b> ${esc(item.review_note)}` : ""}</small>${item.status === "changes_requested" || item.status === "draft" ? `<button type="button" data-edit="${esc(item.id)}">${item.status === "draft" ? "Continuar rascunho" : "Ajustar anúncio"}</button>` : ""}${item.status === "published" && item.linked_vehicle_id ? `<a style="display:inline-block;margin-top:7px;font-size:10px;color:#176b3d" href="#" data-view="${esc(item.linked_vehicle_id)}">Anúncio publicado</a>` : ""}<div class="hm-private-photo-grid">${(item.photos || []).map(photo => photo.url ? `<img src="${esc(photo.url)}" alt="Foto do caminhão">` : "").join("")}</div></div>`).join("");
    $("hmPrivateMine").querySelectorAll("[data-edit]").forEach(button => button.addEventListener("click", () => {
      const item = listings.find(row => row.id === button.dataset.edit); if (!item) return;
      editingStatus = item.status;
      $("hmPrivateId").value = item.id; $("hmPrivateIntent").value = item.intent; $("hmPrivateTitleInput").value = item.title;
      $("hmPrivateCategory").value = item.category; $("hmPrivateBrand").value = item.brand; $("hmPrivateModel").value = item.model;
      $("hmPrivateYear").value = item.manufacture_year; $("hmPrivateCondition").value = item.condition; $("hmPrivateCity").value = item.city || "";
      $("hmPrivateState").value = item.state || ""; $("hmPrivateDescription").value = item.description || "";
      $("hmPrivatePrice").value = item.price ?? ""; $("hmPrivateRequestPrice").value = String(item.price_on_request);
      $("hmPrivateDesired").value = item.desired_category || ""; $("hmPrivateDesiredDetails").value = item.desired_description || "";
      existingPhotoUrls = (item.photos || []).map(photo => photo.url);
      existingPaths = item.status === "changes_requested" ? [] : (item.photos || []).map(photo => photo.path);
      $("hmPrivatePhotoPreview").innerHTML = existingPhotoUrls.filter(Boolean).map(url => `<img src="${esc(url)}" alt="Foto atual do anúncio">`).join("");
      $("hmPrivateSubmit").textContent = item.status === "draft" ? "Salvar e continuar para pagamento" : "Enviar ajustes para revisão";
      setIntent(); setMessage("Revise os dados e envie fotos novas ou ajustadas. Fotos atuais serão mantidas se não forem substituídas.");
      $("hmPrivateForm").scrollIntoView({ behavior: "smooth", block: "start" });
    }));
  }
  async function loadMine() { const data = await callApi("GET"); renderMine(data.listings || []); return data.listings || []; }
  async function open() {
    if (!window.hmSupabaseClient) { window.hmOpenAuth?.(); return; }
    const { data } = await window.hmSupabaseClient.auth.getSession();
    if (!data?.session) { document.getElementById("hmAccountButton")?.click(); return; }
    if (role !== "buyer") { setMessage("Esta modalidade é para pessoa física. Vendedores e agências usam o fluxo normal de anúncios.", true); return; }
    clearForm(); overlay.classList.add("open"); document.body.style.overflow = "hidden";
    try {
      await loadMine();
      const returnState = new URLSearchParams(window.location.search).get("privatePayment");
      if (returnState) {
        setMessage("Retorno do Mercado Pago recebido. A confirmação vem do servidor; acompanhe a situação do anúncio nesta lista.");
        const url = new URL(window.location.href); url.searchParams.delete("privatePayment");
        window.history.replaceState({}, "", url.pathname + url.search + url.hash);
      }
    } catch (error) { $("hmPrivateMine").textContent = error.message; }
  }
  window.hmOpenPrivateListing = open;
  overlay.querySelector(".hm-private-close").addEventListener("click", () => { overlay.classList.remove("open"); document.body.style.overflow = ""; });
  overlay.addEventListener("click", event => { if (event.target === overlay) { overlay.classList.remove("open"); document.body.style.overflow = ""; } });
  $("hmPrivateIntent").addEventListener("change", setIntent); setIntent();
  $("hmPrivateNew").addEventListener("click", clearForm);
  $("hmPrivatePhotos").addEventListener("change", () => {
    const files = [...$("hmPrivatePhotos").files].slice(0, 10);
    $("hmPrivatePhotoPreview").innerHTML = existingPhotoUrls.filter(Boolean).map(url => `<img src="${esc(url)}" alt="Foto atual do anúncio">`).join("") + files.map(file => `<img src="${URL.createObjectURL(file)}" alt="Nova foto selecionada">`).join("");
  });
  $("hmPrivateForm").addEventListener("submit", async event => {
    event.preventDefault(); const button = $("hmPrivateSubmit"); button.disabled = true;
    const files = [...$("hmPrivatePhotos").files];
    if (existingPaths.length + files.length > 10) { setMessage("O anúncio pode ter até 10 fotos.", true); button.disabled = false; return; }
    const editingChanges = $("hmPrivateId").value && editingStatus === "changes_requested";
    try {
      setMessage(editingChanges ? "Enviando fotos ajustadas…" : "Salvando os dados…");
      let id = $("hmPrivateId").value;
      let saved;
      if (!editingChanges) {
        saved = await callApi("POST", { action: "save", ...formData(existingPaths) });
        id = saved.listing.id; $("hmPrivateId").value = id;
      }
      const added = [];
      for (let index = 0; index < files.length; index++) { setMessage(`Enviando foto ${index + 1} de ${files.length}…`); added.push(await upload(files[index], id)); }
      const paths = [...existingPaths, ...added];
      if (editingChanges) {
        saved = await callApi("POST", { action: "save", ...formData(paths) });
        setMessage(saved.message || "Ajustes enviados para revisão.");
      } else {
        if (paths.length) saved = await callApi("POST", { action: "save", ...formData(paths) });
        if (!paths.length) throw new Error("Envie pelo menos uma foto antes de continuar para pagamento.");
        setMessage("Preparando pagamento seguro…");
        const checkout = await callApi("POST", { action: "checkout", id });
        setMessage("Taxa configurada. Abrindo Mercado Pago…");
        window.location.assign(checkout.checkout_url);
        return;
      }
      $("hmPrivatePhotos").value = ""; existingPaths = paths;
      if (editingChanges) { clearForm(); setMessage(saved.message || "Ajustes enviados para revisão."); }
      await loadMine();
    } catch (error) { setMessage(error.message || "Não foi possível enviar o anúncio.", true); }
    finally { button.disabled = false; }
  });
  window.addEventListener("hm-auth-changed", event => { role = event.detail?.role || "buyer"; if (role !== "buyer" && overlay.classList.contains("open")) { overlay.classList.remove("open"); document.body.style.overflow = ""; } });
  window.addEventListener("hm-supabase-ready", () => { client = window.hmSupabaseClient; });
})();
