import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const load = path => readFile(new URL(path, import.meta.url), "utf8");
const [markup, interactionSource, cardsSource, styles] = await Promise.all([
  load("../index.html"),
  load("../modules/marketplace/interactions.js"),
  load("../modules/marketplace/cards.js"),
  load("../styles/responsive.css")
]);

function swipeHarness() {
  const elements = Object.fromEntries(["activeCard", "passStamp", "likeStamp"].map(id => [id, { style: {} }]));
  const deferred = [];
  const context = {
    $: id => elements[id],
    current: { id: "demo-vehicle", brand: "SANY", model: "SY750H" },
    favorites: [],
    renderFavorites() {},
    toast() {},
    setTimeout(callback) { deferred.push(callback); }
  };
  vm.runInNewContext(cardsSource, context);
  return { context, elements, deferred };
}

test("X fica à esquerda e chama pular; coração fica à direita e chama curtir", () => {
  const actions = markup.match(/<div class="secondary-actions"[^>]*>.*?<\/div>/s)?.[0] || "";
  assert.match(actions, /id="passBtn" data-swipe-action="left"/);
  assert.match(actions, /id="likeBtn" data-swipe-action="right"/);
  assert.ok(actions.indexOf('id="passBtn"') < actions.indexOf('id="likeBtn"'));
  assert.match(styles, /#secondaryActions #passBtn\{order:0/);
  assert.match(styles, /#secondaryActions #likeBtn\{order:1/);
  assert.match(interactionSource, /swipeActions=\{left:pass,right:like\}/);
});

test("botão de pular move para esquerda e não salva", () => {
  const { context, elements, deferred } = swipeHarness();
  context.pass();
  assert.match(elements.activeCard.style.transform, /translateX\(-115%\)/);
  assert.equal(elements.passStamp.style.opacity, "1");
  assert.equal(context.favorites.length, 0);
  context.like();
  assert.equal(deferred.length, 1, "segundo toque não deve pular outro anúncio");
});

test("botão de curtir move para direita e salva nos favoritos", () => {
  const { context, elements, deferred } = swipeHarness();
  context.like();
  assert.match(elements.activeCard.style.transform, /translateX\(115%\)/);
  assert.equal(elements.likeStamp.style.opacity, "1");
  assert.equal(context.favorites.length, 1);
  assert.equal(context.favorites[0].id, "demo-vehicle");
  context.pass();
  assert.equal(deferred.length, 1, "segundo toque não deve pular outro anúncio");
});

test("gesto da direita curte e gesto da esquerda pula", () => {
  assert.match(interactionSource, /if\(dx>0\)like\(\);else pass\(\)/);
  assert.match(interactionSource, /if\(e\.key==='ArrowLeft'\)pass\(\)/);
  assert.match(interactionSource, /if\(e\.key==='ArrowRight'\)like\(\)/);
});
