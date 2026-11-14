import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFile} from "node:fs/promises";

const html=await readFile(new URL("../index.html",import.meta.url),"utf8");
const start=html.indexOf("const deckEl=$('deck');");
const end=html.indexOf("function toggleSavedPanel(",start);
assert.ok(start!==-1&&end>start,"gesture listeners must exist");
const gestureScript=html.slice(start,end);

function setup(){
  const events=[];
  const actions=[];
  const timers=[];
  const card={style:{},attrs:{}};
  const likeStamp={style:{opacity:"0"}},passStamp={style:{opacity:"0"}};
  const listeners={deck:{},document:{}};
  const deck={addEventListener(name,fn){listeners.deck[name]=fn;}};
  const document={addEventListener(name,fn){listeners.document[name]=fn;}};
  let photoTurns=0;
  const elements={deck,activeCard:card,likeStamp,passStamp};
  const context={
    document,$:id=>elements[id],
    current:{id:1},swipeLocked:false,startX:null,startY:null,suppressPhotoClick:false,
    like(){actions.push("like");},pass(){actions.push("pass");},
    changeEquipmentPhoto(){photoTurns++;},
    setTimeout(fn){timers.push(fn);}
  };
  vm.runInNewContext(gestureScript,context);
  function fire(group,type,data){
    const fn=listeners[group][type];
    assert.ok(fn,"missing "+group+" "+type);
    return fn(data);
  }
  function down(x=200,y=200,pointerId=7,extra={}){
    fire("deck","pointerdown",{target:{closest:s=>s===".photo"?{}:null},
      clientX:x,clientY:y,pointerId,isPrimary:true,pointerType:"touch",...extra});
  }
  function move(x,y,pointerId=7){fire("document","pointermove",{clientX:x,clientY:y,pointerId});}
  function up(x,y,pointerId=7){fire("document","pointerup",{clientX:x,clientY:y,pointerId});}
  return {down,move,up,fire,card,likeStamp,passStamp,actions,context,timers,getPhotoTurns:()=>photoTurns};
}

test("deslizar o dedo para a DIREITA curte e salva (inclusive soltando fora do card)",()=>{
  const s=setup();s.down(180,230);
  s.move(280,234);
  assert.match(s.card.style.transform,/translateX\(\d/);
  assert.equal(s.likeStamp.style.opacity,"1");
  assert.equal(s.passStamp.style.opacity,"0");
  s.up(320,239);
  assert.deepEqual(s.actions,["like"]);
  assert.equal(s.context.suppressPhotoClick,true);
  assert.equal(s.card.style.transition,"");
});

test("deslizar o dedo para a ESQUERDA passa sem salvar",()=>{
  const s=setup();s.down(260,170);
  s.move(140,169);
  assert.match(s.card.style.transform,/translateX\(-/);
  assert.equal(s.passStamp.style.opacity,"1");
  assert.equal(s.likeStamp.style.opacity,"0");
  s.up(110,169);
  assert.deepEqual(s.actions,["pass"]);
});

test("movimento vertical, toque curto e outro pointerId não acionam curtida/pulo",()=>{
  const vertical=setup();vertical.down(200,150);
  vertical.move(190,295);vertical.up(190,295);
  assert.deepEqual(vertical.actions,[]);
  const short=setup();short.down(200,150);short.move(220,149);short.up(220,149);
  assert.deepEqual(short.actions,[]);
  const foreign=setup();foreign.down(200,150,2);foreign.up(50,151,55);
  assert.deepEqual(foreign.actions,[]);
  assert.equal(foreign.context.startX,200);
  foreign.fire("document","pointercancel",{pointerId:2});
  assert.equal(foreign.context.startX,null);
});

test("gestos cancelados restauram o card sem passar ou salvar",()=>{
  const s=setup();s.down(200,160);
  s.move(300,163);
  s.fire("document","pointercancel",{pointerId:7});
  assert.deepEqual(s.actions,[]);
  assert.equal(s.card.style.transform,"");
  assert.equal(s.likeStamp.style.opacity,"0");
});

test("os botões continuam X à esquerda e coração à direita",()=>{
  const controls=html.match(/<div class="secondary-actions"[^>]*>(.*?)<\/div>/)?.[1]||"";
  const x=controls.indexOf('id="passBtn"'),heart=controls.indexOf('id="likeBtn"');
  assert.ok(x>=0&&heart>x);
  assert.match(controls,/id="passBtn" data-swipe-action="left"/);
  assert.match(controls,/id="likeBtn" data-swipe-action="right"/);
  assert.match(html,/const swipeActions=\{left:pass,right:like\}/);
  assert.match(html,/if\(dx>0\)\{like\(\);\}else\{pass\(\);\}/);
});

test("botões chamam de fato as ações correspondentes",()=>{
  const code=html.slice(html.indexOf("const swipeActions={"),html.indexOf("$('detailsBtn').addEventListener"));
  const actions=[];
  const buttons=[
    {dataset:{swipeAction:"left"},addEventListener(_name,fn){this.click=fn;}},
    {dataset:{swipeAction:"right"},addEventListener(_name,fn){this.click=fn;}}
  ];
  vm.runInNewContext(code,{document:{querySelectorAll(){return buttons;}},like(){actions.push("like");},pass(){actions.push("pass");}});
  for(const b of buttons)b.click({preventDefault(){},stopPropagation(){}});
  assert.deepEqual(actions,["pass","like"]);
});
