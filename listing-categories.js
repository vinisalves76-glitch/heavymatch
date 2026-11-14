(function(root) {
  "use strict";
  const truckConfigs = ["4x2", "6x2", "6x4", "8x2", "8x4", "10x4", "Outra configuração"];
  const implementTypes = [
    "Basculante", "Graneleira", "Prancha", "Baú", "Sider",
    "Tanque", "Frigorífica", "Porta-contêiner", "Cegonha",
    "Florestal", "Canavieira", "Dolly", "Outro implemento"
  ];
  const trailer = "Carreta / implemento";
  const horse = "Cavalo mecânico";
  const truck = "Caminhão";
  function base(stored) {
    const text = String(stored || "").trim();
    if (text === "Carreta" || text === trailer || text.startsWith(trailer + " — ")) return trailer;
    if (text === horse || text.startsWith(horse + " ")) return horse;
    if (text === truck || text.startsWith(truck + " ")) return truck;
    return text;
  }
  function variant(stored) {
    const text = String(stored || "").trim(), type = base(text);
    if (type === trailer && text.startsWith(trailer + " — ")) return text.slice((trailer + " — ").length);
    if ((type === truck || type === horse) && text.startsWith(type + " ")) return text.slice(type.length + 1);
    return "";
  }
  function compose(type, detail) {
    const selected = String(type || "").trim();
    const value = String(detail || "").trim();
    if (selected === trailer && implementTypes.includes(value)) return trailer + " — " + value;
    if ((selected === horse || selected === truck) && truckConfigs.includes(value)) return selected + " " + value;
    return selected;
  }
  function matches(stored, selected) {
    if (!selected) return true;
    return base(stored) === selected;
  }
  root.hmListingCategories = {truckConfigs, implementTypes, trailer, horse, truck, base, variant, compose, matches};
})(typeof window !== "undefined" ? window : globalThis);
