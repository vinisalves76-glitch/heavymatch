import test from 'node:test';
import assert from 'node:assert/strict';

const cards = await readFile(new URL('../modules/marketplace/cards.js', import.meta.url), 'utf8');
const interactions = await readFile(new URL('../modules/marketplace/interactions.js', import.meta.url), 'utf8');

test('cards.js declara funções, mas não registra eventos da interface', () => {
  assert.doesNotMatch(cards, /addEventListener\s*\(/);
});

test('cada controle principal tem um único registro centralizado', () => {
  for (const id of ['passBtn', 'likeBtn', 'detailsBtn', 'contactBtn', 'modalContact', 'closeModal', 'favoritesJump', 'savedNav', 'homeNav']) {
    const matches = interactions.match(new RegExp('\\$\\([\'"]' + id + '[\'"]\\)\\.addEventListener', 'g')) || [];
    assert.equal(matches.length, 1, id + ' deve ter exatamente um listener');
  }
});

test('curtir move o cartão para a direita e salva o anúncio', () => {
  const body = cards.match(/function like\(\)\s*\{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(body, /favorites\.push\(v\)/);
  assert.match(body, /translateX\(115%\)/);
});

test('passar move o cartão para a esquerda', () => {
  const body = cards.match(/function pass\(\)\s*\{[\s\S]*?\n\}/)?.[0] || '';
  assert.match(body, /translateX\(-115%\)/);
});

test('gesto para direita curte e para esquerda passa', () => {
  assert.match(interactions, /if\(dx>0\)like\(\);else pass\(\)/);
});

import { readFile } from 'node:fs/promises';

const apiSource = await readFile(new URL('../api/vehicles.js', import.meta.url), 'utf8');
const catalogSource = await readFile(new URL('../equipment-marketplace.js', import.meta.url), 'utf8');
const cardsSource = await readFile(new URL('../modules/marketplace/cards.js', import.meta.url), 'utf8');
const interactionsSource = await readFile(new URL('../modules/marketplace/interactions.js', import.meta.url), 'utf8');

test('catálogo público limita cada consulta e usa offset', () => {
  assert.match(apiSource, /boundedInt\(params\.limit, 20, 1, 30\)/);
  assert.match(apiSource, /query\.range\(offset, offset \+ limit\)/);
  assert.match(apiSource, /nextOffset: offset \+ visibleRows\.length/);
});

test('fotos são assinadas em lote, não uma chamada por foto', () => {
  assert.match(apiSource, /createSignedUrls\(paths, 60 \* 60\)/);
  assert.doesNotMatch(apiSource, /createSignedUrl\(/);
});

test('filtros de preço mantêm anúncios sem preço e a busca é aplicada no servidor', () => {
  assert.match(apiSource, /price\.is\.null/);
  assert.match(apiSource, /brand\.ilike/);
  assert.match(apiSource, /model\.ilike/);
  assert.match(apiSource, /category\.ilike/);
});

test('frontend solicita páginas e carrega a próxima ao terminar o feed', () => {
  assert.match(catalogSource, /limit:"20"/);
  assert.match(catalogSource, /window\.hmLoadMoreCatalog=\(\)=>loadPublic\(\{append:true\}\)/);
  assert.match(cardsSource, /window\.hmCatalogHasMore&&typeof window\.hmLoadMoreCatalog/);
});

test('alterar filtros reinicia a consulta paginada no servidor', () => {
  assert.match(interactionsSource, /window\.hmReloadCatalog\?\.\(\)/);
  assert.match(catalogSource, /params\.set\(key,String\(value\)\.trim\(\)\)/);
});

test('respostas públicas usam cache curto e seguro para fotos assinadas', () => {
  assert.match(apiSource, /public, max-age=30, s-maxage=60, stale-while-revalidate=300/);
});
