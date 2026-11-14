import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(path, import.meta.url), "utf8");
const [formSource, html, apiSource] = await Promise.all([
  read("../equipment-marketplace.js"),
  read("../index.html"),
  read("../api/vehicles.js")
]);

function priceFunctions() {
  const start = formSource.indexOf("  const money =");
  const end = formSource.indexOf("  function revokePreviews()", start);
  assert.ok(start >= 0 && end > start);
  const nodes = {
    hmVPrice: { value: "", disabled: false, required: false },
    hmVPriceOnRequest: { value: "false" },
    hmVPricePreview: { textContent: "" }
  };
  const context = { $: id => nodes[id] };
  vm.runInNewContext(formSource.slice(start, end) +
    "\nthis.parsePriceBR = parsePriceBR;this.money = money;this.updatePriceUI = updatePriceUI;", context);
  return { ...context, nodes };
}

test("preço aceita formato brasileiro e valores simples sem mudar centavos", () => {
  const { parsePriceBR } = priceFunctions();
  for (const [text, amount] of [
    ["250.000,00", 250000],
    ["R$ 250.000,50", 250000.50],
    ["250000", 250000],
    ["250.000", 250000],
    ["250000,90", 250000.90],
    ["250000.50", 250000.50],
    ["1.250.000,25", 1250000.25]
  ]) assert.equal(parsePriceBR(text), amount, text);
});

test("preço inválido é rejeitado e em branco não vira R$ 0,00", () => {
  const { parsePriceBR } = priceFunctions();
  assert.equal(parsePriceBR(""), null);
  for (const invalid of ["abc", "-200", "250,000.00", "250.000,999", "12.34.56"]) {
    assert.ok(Number.isNaN(parsePriceBR(invalid)), invalid);
  }
});

test("vendedor informa preço por padrão e vê uma prévia, com opção sob consulta", () => {
  const { nodes, updatePriceUI, money } = priceFunctions();
  assert.match(formSource, /<option value="false" selected>Mostrar preço<\/option>/);
  assert.match(formSource, /id="hmVPrice" type="text" inputmode="decimal"/);
  updatePriceUI();
  assert.equal(nodes.hmVPrice.required, true);
  assert.equal(nodes.hmVPrice.disabled, false);
  nodes.hmVPrice.value = "250.000,00";
  updatePriceUI();
  assert.match(nodes.hmVPricePreview.textContent, /R\$\s*250\.000,00/);
  assert.match(money({price:250000, price_on_request:false}), /R\$\s*250\.000,00/);
  nodes.hmVPriceOnRequest.value="true";
  updatePriceUI();
  assert.equal(nodes.hmVPrice.disabled,true);
  assert.equal(nodes.hmVPrice.required,false);
  assert.match(nodes.hmVPricePreview.textContent, /Sob consulta/);
});

test("valor é enviado como número ao servidor, sem copiar para descrição armazenada", () => {
  assert.match(formSource, /price:priceValue/);
  assert.match(formSource, /price_on_request:isOnRequest/);
  assert.match(formSource, /description:\$\("hmVDescription"\)\.value\.trim\(\)/);
  assert.match(apiSource, /price: priceOnRequest \? null : price/);
  assert.match(apiSource, /description: clean\(body\.description\)/);
  assert.match(formSource, /\$\("hmVPrice"\)\.value=v\.price==null/);
});

test("valor aparece tanto no cartão com foto como na descrição do anúncio", () => {
  assert.match(html, /class="hm-price-photo" aria-label="Preço do equipamento">\$\{esc\(v\.price\)\}/);
  assert.match(html, /class="hm-price-detail"><span>Preço anunciado<\/span><strong>\$\{esc\(v\.price\)\}/);
  assert.match(html, /\.hm-price-detail\{/);
  assert.match(formSource, /price:v\.price_on_request\|\|v\.price==null\?"Sob consulta":money\(v\)/);
});

test("filtro por faixa de preços interpreta o formato R$ 250.000,00 corretamente", () => {
  const sourceLine = html.split("\n").find(line => line.startsWith("function filterVehicles()"));
  assert.ok(sourceLine);
  const input = {
    brand: { value: "" },model:{value:""},search:{value:""},sort:{value:"featured"},
    priceMin:{value:"200000"},priceMax:{value:"300000"}
  };
  const context = {
    $: id => input[id],
    vehicles: [
      { id: 1, brand:"Scania",model:"R",category:"Caminhão",price:"R$ 250.000,00",featured:false },
      { id: 2, brand:"Volvo",model:"FH",category:"Caminhão",price:"R$ 190.000,00",featured:false },
      { id: 3, brand:"SANY",model:"SY",category:"Escavadeira",price:"Sob consulta",featured:false }
    ],
    activeCategory:"",filtered:[],index:0,render(){}
  };
  vm.runInNewContext(sourceLine+"\nthis.filterVehicles=filterVehicles;",context);
  context.filterVehicles();
  assert.deepEqual(Array.from(context.filtered,x=>x.id),[1,3]);
});
