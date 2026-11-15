// Valores monetários desta configuração são armazenados em centavos inteiros.
export function parseFeeInput(value) {
  if (typeof value !== "string") return null;
  let text = value.trim().replace(/^R\$\s*/, "");
  if (!text) return null;
  if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(text)) text = text.replace(/\./g, "");
  if (!/^\d+([,.]\d{1,2})?$/.test(text)) return null;
  const [whole, decimal = ""] = text.replace(",", ".").split(".");
  const cents = Number(whole) * 100 + Number(decimal.padEnd(2, "0"));
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

export function formatFee(cents) {
  return cents === null ? "Não definida" : (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function feeInputValue(cents) {
  return cents === null ? "" : (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false });
}
