import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

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
