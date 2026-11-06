import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../modules/shared/api.js', import.meta.url), 'utf8');
const adminSource = await readFile(new URL('../supabase-integration.js', import.meta.url), 'utf8');
const vehicleSource = await readFile(new URL('../equipment-marketplace.js', import.meta.url), 'utf8');

function createClient(fetchImpl) {
  const window = {};
  vm.runInNewContext(source, { window, fetch: fetchImpl });
  return window.hmApiRequest;
}

test('cliente HTTP envia método, token e corpo JSON', async () => {
  let captured;
  const request = createClient(async (path, options) => {
    captured = { path, options };
    return { ok: true, json: async () => ({ saved: true }) };
  });

  const result = await request('/api/example', {
    method: 'POST',
    token: 'session-token',
    body: { action: 'create', value: 7 }
  });

  assert.deepEqual(result, { saved: true });
  assert.equal(captured.path, '/api/example');
  assert.equal(captured.options.method, 'POST');
  assert.equal(captured.options.headers.Authorization, 'Bearer session-token');
  assert.equal(captured.options.headers['Content-Type'], 'application/json');
  assert.equal(captured.options.body, JSON.stringify({ action: 'create', value: 7 }));
});

test('cliente HTTP preserva cabeçalhos adicionais e aceita GET sem corpo', async () => {
  let captured;
  const request = createClient(async (path, options) => {
    captured = { path, options };
    return { ok: true, json: async () => ({ vehicles: [] }) };
  });

  await request('/api/vehicles?manage=1', {
    headers: { 'X-Trace': 'phase-3' },
    errorMessage: 'Falha'
  });

  assert.equal(captured.options.method, 'GET');
  assert.equal(captured.options.headers.Accept, 'application/json');
  assert.equal(captured.options.headers['X-Trace'], 'phase-3');
  assert.equal(captured.options.body, undefined);
});

test('cliente HTTP propaga mensagem de erro retornada pela API', async () => {
  const request = createClient(async () => ({
    ok: false,
    json: async () => ({ error: 'Acesso negado.' })
  }));

  await assert.rejects(
    request('/api/admin/users', { errorMessage: 'Falha administrativa.' }),
    { message: 'Acesso negado.' }
  );
});

test('administração e gestão de anúncios usam o cliente HTTP compartilhado', () => {
  assert.match(adminSource, /window\.hmApiRequest\("\/api\/admin\/users"/);
  assert.match(vehicleSource, /window\.hmApiRequest\(path/);
  assert.doesNotMatch(adminSource, /fetch\("\/api\/admin\/users"/);
  assert.doesNotMatch(vehicleSource, /fetch\("\/api\/vehicles"/);
});
