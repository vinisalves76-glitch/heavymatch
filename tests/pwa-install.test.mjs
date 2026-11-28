import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../pwa-install.js',import.meta.url),'utf8');
function setup({ios=false,standalone=false}={}) {
  const events=new Map(), controls=new Map();
  const button={hidden:true,addEventListener:(name,fn)=>controls.set(name,fn)};
  const media={matches:standalone,addEventListener:(name,fn)=>events.set('media:'+name,fn)};
  const alerts=[];
  const window={matchMedia:()=>media,addEventListener:(name,fn)=>events.set(name,fn),alert:x=>alerts.push(x)};
  vm.runInNewContext(source,{window,document:{getElementById:()=>button},navigator:{userAgent:ios?'iPhone':'Android'}});
  return {button,events,controls,alerts,media};
}
test('Android: install only after browser prompt, hide after install',async()=>{
  const {button,events,controls}=setup(); assert.equal(button.hidden,true);
  let prevented=false, prompted=false;
  events.get('beforeinstallprompt')({preventDefault(){prevented=true},prompt:async()=>{prompted=true},userChoice:Promise.resolve({outcome:'accepted'})});
  assert.equal(prevented,true); assert.equal(button.hidden,false);
  await controls.get('click')(); assert.equal(prompted,true); assert.equal(button.hidden,true);
  events.get('appinstalled')(); assert.equal(button.hidden,true);
});
test('iOS: manual instructions in browser, hidden in standalone',async()=>{
  const s=setup({ios:true}); assert.equal(s.button.hidden,false);
  await s.controls.get('click')(); assert.match(s.alerts[0],/Adicionar à Tela de Início/);
  s.media.matches=true; s.events.get('media:change')(); assert.equal(s.button.hidden,true);
  assert.equal(setup({ios:true,standalone:true}).button.hidden,true);
});
test('dismissal does not mark installed; fresh prompt can show again',async()=>{
  const s=setup(); const event={preventDefault(){},prompt:async()=>{},userChoice:Promise.resolve({outcome:'dismissed'})};
  s.events.get('beforeinstallprompt')(event); await s.controls.get('click')();
  s.events.get('beforeinstallprompt')(event); assert.equal(s.button.hidden,false);
});
test('manifest and header integration',()=>{
  const manifest=JSON.parse(readFileSync(new URL('../manifest.webmanifest',import.meta.url)));
  assert.equal(manifest.display,'standalone'); assert.equal(manifest.start_url,'/');
  for(const item of manifest.icons) assert.ok(readFileSync(new URL('..'+item.src,import.meta.url),'utf8').includes('data:image/png;base64,'));
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.match(html,/<link rel="manifest" href="\/manifest.webmanifest">/);
  assert.match(html,/<button type="button" id="pwaInstall" class="pwa-install" hidden/);
});
