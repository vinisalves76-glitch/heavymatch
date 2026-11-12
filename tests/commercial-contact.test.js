import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const [helpers, api, catalog, admin, cards, interactions] = await Promise.all([
  read('../modules/shared/helpers.js'),
  read('../api/vehicles.js'),
  read('../equipment-marketplace.js'),
  read('../api/admin/users.js'),
  read('../modules/marketplace/cards.js'),
  read('../modules/marketplace/interactions.js')
]);

function whatsapp(vehicle) {
  const context = { WHATSAPP_NUMBER: '5511999999999', toast: () => {} };
  vm.runInNewContext(helpers, context);
  return context.waUrl(vehicle);
}

test('WhatsApp do anúncio usa telefone do vendedor e não o número genérico', () => {
  const url = whatsapp({brand:'SANY',model:'SY750H',year:2024,seller_phone:'(31) 99999-9999'});
  assert.match(url, /^https:\/\/wa\.me\/5531999999999\?text=/);
  assert.doesNotMatch(url, /5511999999999/);
});

test('anúncio sem telefone não aponta para contato de outro vendedor', () => {
  assert.equal(whatsapp({brand:'SANY',model:'SY750H',year:2024}), null);
  assert.match(cards, /if\(!url\)/);
  assert.match(interactions, /removeAttribute\('href'\)/);
});

test('API consulta telefone do perfil e o catálogo preserva o contato', () => {
  assert.match(api, /select\("id, full_name, phone"\)/);
  assert.match(api, /seller_phone: seller\?\.phone/);
  assert.match(catalog, /seller_phone:v\.seller_phone/);
});

test('cadastro administrativo persiste telefone do vendedor', () => {
  assert.match(admin, /phone: phone \|\| null/);
  assert.match(admin, /role === "seller" && phone\.length < 12/);
});
