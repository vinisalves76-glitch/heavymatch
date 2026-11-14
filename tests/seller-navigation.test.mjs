import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const [html, moduleSource, authSource] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../equipment-marketplace.js", import.meta.url), "utf8"),
  readFile(new URL("../supabase-integration.js", import.meta.url), "utf8")
]);

test("Anunciar fica no menu inferior visível, não na intro oculta", () => {
  const nav = html.match(/<nav class="bottom-nav"[\s\S]*?<\/nav>/)?.[0] || "";
  assert.match(nav, /id="sellerNav"/);
  assert.match(nav, /Anunciar<\/button>/);
  assert.match(nav, /id="sellerNav"[^>]*hidden>/);
  assert.match(html, /#sellerNav\[hidden\]\{display:none!important\}/);
  assert.match(html, /#sellerNav:not\(\[hidden\]\)/);
  assert.match(moduleSource, /topActions\?\.appendChild\(openButton\)/);
  assert.doesNotMatch(moduleSource, /\.intro"\)\s*\|\|\s*topActions/);
  assert.match(moduleSource, /sellerNav\?\.addEventListener\("click",open\)/);
  assert.match(moduleSource, /window\.hmOpenListings=open/);
});

async function roleHarness(profileRole, hasUser=true) {
  const beginning = moduleSource.indexOf("  async function getSession() {");
  const ending = moduleSource.indexOf("  async function request(", beginning);
  assert.ok(beginning !== -1 && ending > beginning);
  const elements = {
    hmVehiclesTitle: { textContent: "" }
  };
  const launch = { style: {} };
  const nav = { hidden: true, attrs: {}, setAttribute(key,value) { this.attrs[key]=value; } };
  let closes = 0;
  const supabase = {
    auth: { async getSession() {
      return { data: { session: hasUser ? { user: { id:"seller-test" } } : null }, error: null };
    } },
    from(table) {
      assert.equal(table,"profiles");
      return { select(column) {
        assert.equal(column,"role");
        return { eq(column,id) {
          assert.equal(column,"id");assert.equal(id,"seller-test");
          return { async maybeSingle() { return { data:{role:profileRole},error:null }; } };
        }};
      }};
    }
  };
  const ctx = {
    window:{hmSupabaseClient:supabase},
    client:null,session:null,role:"buyer",user:null,
    openButton:launch,sellerNav:nav,
    $:key=>elements[key],
    overlay:{classList:{contains(){return false;}}},
    close(){closes++;}
  };
  vm.runInNewContext(moduleSource.slice(beginning,ending) +
    "\nthis.getSession=getSession;this.getRole=()=>role;this.refreshRole=refreshRole;",ctx);
  const canManage=await ctx.getSession();
  return {canManage,launch,nav,title:elements.hmVehiclesTitle.textContent,closes};
}

test("vendedor autenticado vê Anunciar e entra na área do vendedor", async()=>{
  const result=await roleHarness("seller");
  assert.equal(result.canManage,true);
  assert.equal(result.nav.hidden,false);
  assert.equal(result.nav.attrs["aria-hidden"],"false");
  assert.match(result.title,/Área do vendedor/);
});

test("ADM Master vê Anunciar e pode gerenciar anúncios",async()=>{
  const result=await roleHarness("admin");
  assert.equal(result.canManage,true);
  assert.equal(result.nav.hidden,false);
  assert.match(result.title,/ADM Master/);
});

test("comprador e visitante nunca veem Anunciar",async()=>{
  for(const [role,hasUser] of [["buyer",true],["seller",false]]) {
    const result=await roleHarness(role,hasUser);
    assert.equal(result.canManage,false);
    assert.equal(result.nav.hidden,true);
    assert.equal(result.nav.attrs["aria-hidden"],"true");
    assert.equal(result.launch.style.display,"none");
  }
});

test("login atualiza o menu e o fluxo de criação de anúncios continua autorizado no servidor",()=>{
  assert.match(moduleSource,/window\.addEventListener\("hm-auth-changed",refreshRole\)/);
  assert.match(moduleSource,/window\.addEventListener\("hm-supabase-ready",refreshRole\)/);
  assert.match(authSource,/new CustomEvent\("hm-auth-changed", \{ detail: \{ userId: user\.id, role: currentRole \} \}\)/);
  assert.match(moduleSource,/if\(!await getSession\(\)\)throw new Error\("Somente vendedor ou ADM Master pode cadastrar anúncios\."\)/);
});
