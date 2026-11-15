import { parseFeeInput, formatFee, feeInputValue } from "./lib/listing-fee.js";

const pane = document.getElementById("hmAdminFees");
if (pane) {
  pane.innerHTML = `
    <section class="hm-admin-section hm-fee-section" aria-labelledby="hmFeeTitle">
      <h3 id="hmFeeTitle">Taxa do anúncio particular</h3>
      <p>Defina o valor único que o proprietário paga para anunciar seu caminhão.</p>
      <div class="hm-fee-current"><span>Taxa atual por anúncio</span><strong id="hmFeeCurrent">Não definida</strong><small id="hmFeeUpdated"></small></div>
      <form id="hmFeeForm">
        <label for="hmFeeAmount">Valor da taxa única (R$)</label>
        <input id="hmFeeAmount" type="text" inputmode="decimal" autocomplete="off" maxlength="20" placeholder="Informe o valor" aria-describedby="hmFeeHint" required disabled>
        <p id="hmFeeHint">Cobrança única por anúncio particular, sem mensalidade.</p>
        <div class="hm-admin-actions"><button type="submit" class="primary" id="hmFeeSave" disabled>Salvar taxa</button><button type="button" id="hmFeeReload">Recarregar valor</button></div>
      </form>
      <div id="hmFeeMessage" class="hm-admin-message" role="status" aria-live="polite"></div>
    </section>`;
  const style = document.createElement("style");
  style.textContent = ".hm-admin-card [hidden]{display:none!important}.hm-fee-section{max-width:540px}.hm-fee-current{padding:18px;margin:18px 0;border-radius:14px;background:#f3f3f3;display:grid;gap:7px}.hm-fee-current span,.hm-fee-current small{font-size:12px;color:#64727c}.hm-fee-current strong{font-size:29px;color:#181818}.hm-fee-section input:disabled{opacity:.6}.hm-fee-section button:disabled{opacity:.55;cursor:default}.hm-fee-section input[aria-invalid=true]{border-color:#b42332}";
  document.head.appendChild(style);
  const $ = id => document.getElementById(id);
  let revision = null, generation = 0, busy = false, available = false;
  const message = (text, error = false) => {
    $("hmFeeMessage").textContent = text;
    $("hmFeeMessage").style.color = error ? "#b42332" : "#246b45";
  };
  function controls() {
    $("hmFeeAmount").disabled = busy || !available;
    $("hmFeeSave").disabled = busy || !available || parseFeeInput($("hmFeeAmount").value) === null;
    $("hmFeeReload").disabled = busy;
  }
  function render(fee) {
    revision = fee.revision;
    $("hmFeeCurrent").textContent = formatFee(fee.amount_cents);
    $("hmFeeAmount").value = feeInputValue(fee.amount_cents);
    $("hmFeeUpdated").textContent = fee.updated_at ? "Atualizada em " + new Date(fee.updated_at).toLocaleString("pt-BR") : "";
    $("hmFeeAmount").removeAttribute("aria-invalid");
  }
  async function request(method, body) {
    const client = window.hmSupabaseClient;
    const session = await client?.auth.getSession();
    const token = session?.data?.session?.access_token;
    if (!token) throw new Error("Sua sessão expirou. Entre novamente.");
    const response = await fetch("/api/admin/fees", {
      method, headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || "Não foi possível acessar a taxa.");
      error.status = response.status;
      throw error;
    }
    return data.fee;
  }
  async function load() {
    const run = ++generation;
    busy = true; available = false; controls(); message("Carregando taxa…");
    try {
      const fee = await request("GET");
      if (run !== generation) return;
      render(fee); available = true;
      message(fee.amount_cents === null ? "Escolha e salve o valor da taxa para anúncios particulares." : "");
    } catch (error) {
      if (run !== generation) return;
      revision = null; $("hmFeeCurrent").textContent = "Indisponível";
      $("hmFeeAmount").value = ""; $("hmFeeUpdated").textContent = "";
      message(error.message, true);
    } finally { if (run === generation) { busy = false; controls(); } }
  }
  $("hmFeeAmount").addEventListener("input", () => { $("hmFeeAmount").removeAttribute("aria-invalid"); controls(); });
  $("hmFeeReload").addEventListener("click", load);
  $("hmFeeForm").addEventListener("submit", async event => {
    event.preventDefault();
    const amount = parseFeeInput($("hmFeeAmount").value);
    if (busy || !available || revision === null) return;
    if (amount === null) { $("hmFeeAmount").setAttribute("aria-invalid", "true"); message("Informe um valor maior que zero, com até duas casas decimais.", true); return; }
    const run = ++generation;
    busy = true; controls(); message("Salvando taxa…");
    try {
      const fee = await request("PUT", { amount_cents: amount, revision });
      if (run !== generation) return;
      render(fee); message("Taxa salva com sucesso.");
    } catch (error) {
      if (run !== generation) return;
      if ([401, 403, 409, 503].includes(error.status)) available = false;
      message(error.message, true);
    } finally { if (run === generation) { busy = false; controls(); } }
  });
  window.addEventListener("hm-admin-pane-changed", event => { if (event.detail?.pane === "fees") load(); });
  window.addEventListener("hm-auth-changed", () => {
    generation++; busy = false; available = false; revision = null;
    render({ amount_cents: null, revision: null, updated_at: null }); message(""); controls();
  });
}
