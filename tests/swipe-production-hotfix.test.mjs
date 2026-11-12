import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

function setup() {
  const begin = html.indexOf('let swipeLocked=false;');
  const end = html.indexOf('function resetFeed()', begin);
  assert.ok(begin >= 0 && end > begin, 'As funções precisam existir no HTML de produção');
  const elements = Object.fromEntries(['activeCard','passStamp','likeStamp'].map(key => [key, {style:{}}]));
  const callbacks = [];
  const scope = {
    $: key => elements[key],
    index: 0,
    current: {id:'vehicle-1',brand:'SANY',model:'SY750H'},
    favorites:[],
    renderFavorites() {},
    toast() {},
    render() {},
    setTimeout(callback) { callbacks.push(callback); }
  };
  vm.runInNewContext(html.slice(begin,end),scope);
  return {scope,elements,callbacks};
}

test('X está à esquerda e coração está à direita em todas as larguras', () => {
  const markup = html.match(/<div class="secondary-actions" id="secondaryActions"[^>]*>.*?<\/div>/s)?.[0];
  assert.ok(markup);
  assert.ok(markup.indexOf('id="passBtn"') < markup.indexOf('id="likeBtn"'));
  assert.match(markup, /id="passBtn" data-swipe-action="left"/);
  assert.match(markup, /id="likeBtn" data-swipe-action="right"/);
  assert.match(html, /#secondaryActions #passBtn\{order:0/);
  assert.match(html, /#secondaryActions #likeBtn\{order:1/);
  assert.match(html, /swipeActions=\{left:pass,right:like\}/);
});

test('Botão de pular move o card para a esquerda e não salva', () => {
  const {scope,elements,callbacks} = setup();
  scope.pass();
  assert.match(elements.activeCard.style.transform, /translateX\(-115%\)/);
  assert.equal(elements.passStamp.style.opacity, '1');
  assert.equal(scope.favorites.length, 0);
  scope.like();
  assert.equal(callbacks.length, 1, 'não deve processar dois toques seguidos');
});

test('Botão de curtir salva e move o card para a direita', () => {
  const {scope,elements,callbacks} = setup();
  scope.like();
  assert.match(elements.activeCard.style.transform, /translateX\(115%\)/);
  assert.equal(elements.likeStamp.style.opacity, '1');
  assert.equal(scope.favorites.length, 1);
  assert.equal(scope.favorites[0].id,'vehicle-1');
  scope.pass();
  assert.equal(callbacks.length, 1, 'não deve pular o anúncio seguinte');
});

test('Gestos e teclado preservam a mesma direção dos botões', () => {
  assert.match(html, /if\(dx>0\)\{like\(\);\}else\{pass\(\);\}/);
  assert.match(html, /if\(e\.key==='ArrowLeft'\)pass\(\)/);
  assert.match(html, /if\(e\.key==='ArrowRight'\)like\(\)/);
});
