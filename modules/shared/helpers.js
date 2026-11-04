function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

function waUrl(v=null){const msg=v?`Olá! Vi o anúncio ${v.brand} ${v.model} (${v.year}) no HeavyMatch. Gostaria de saber disponibilidade, especificações e condições comerciais.`:"Olá! Gostaria de ajuda para encontrar um caminhão ou máquina pesada no HeavyMatch.";return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;}

function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2200);}
