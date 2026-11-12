import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const helperSource = await readFile(new URL('../modules/shared/helpers.js', import.meta.url), 'utf8');
const catalogSource = await readFile(new URL('../equipment-marketplace.js', import.meta.url), 'utf8');
const cardSource = await readFile(new URL('../modules/marketplace/cards.js', import.meta.url), 'utf8');
const interactionsSource = await readFile(new URL('../modules/marketplace/interactions.js', import.meta.url), 'utf8');
const adminApiSource = await readFile(new URL('../api/admin/users.js', import.meta.url), 'utf8');

function createWaUrl(fallback = '') {
  const window = {};
  const context = {
    window,
    WHATSAPP_NUMBER: fallback,
    encodeURIComponent,
    clearTimeout() {},
    setTimeout() {},
    $() { return { classList: { add() {}, remove() {} }, textContent: '' }; }
  };
  vm.runInNewContext(helperSource + '\nwindow.__waUrl = waUrl;', context);
  return window.__waUrl;
}

test('WhatsApp do vendedor é normalizado e usado no anúncio', () => {
  const waUrl = createWaUrl('');
  const url = waUrl({ brand: 'SANY', model: 'SY750H', year: 2025, seller_phone: '(31) 99999-1234' });
  assert.match(url, /^https:\/\/wa\.me\/31999991234\?/);
});

test('contato sem número real não usa telefone de demonstração', () => {
  const waUrl = createWaUrl('');
  assert.equal(waUrl({ brand: 'Volvo', model: 'FH', year: 2024 }), '');
  assert.match(cardSource, /WhatsApp do vendedor ainda não foi cadastrado/);
});

test('catálogo preserva contato retornado pela API', () => {
  assert.match(catalogSource, /seller_phone:v\.seller_phone\|\|""/);
  assert.match(catalogSource, /seller_name:v\.seller_name\|\|""/);
});

test('perfil abre o fluxo real de conta', () => {
  assert.match(interactionsSource, /profileNav'[\s\S]*hmAccountButton/);
  assert.doesNotMatch(interactionsSource, /Área de perfil será implementada/);
});

test('admin normaliza telefone e permite atualizar contato comercial', () => {
  assert.match(adminApiSource, /replace\(\/\\D\/g, ""\)/);
  assert.match(adminApiSource, /body\.action === "update_phone"/);
  assert.match(adminApiSource, /WhatsApp comercial atualizado com sucesso/);
});
