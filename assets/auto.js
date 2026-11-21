// Modo auto (oculto): se desbloquea escribiendo "xaviteamo" sin estar en ningún campo.
// Con el modo activo, cada noticia nueva que entra se abre, se descarga (post + historia) y se marca como hecha.
(()=>{
const KEY="cs_auto",BTN="cs_autobtn",CODE="xaviteamo";
const btn=document.createElement("button");
btn.className="tbtn thm autob hide";btn.id="autoBtn";btn.type="button";btn.setAttribute("aria-pressed","false");btn.setAttribute("aria-label","Modo auto");
btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 0 0-14.3-4.9L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16"/><path d="M20 20v-4h-4"/></svg><i></i>';
$("simpleBtn").before(btn);

let on=false,q=[],busy=false;
const save=()=>{try{localStorage.setItem(KEY,on?"1":"")}catch{}};
function setOn(v,quiet){on=v;btn.classList.toggle("on",on);btn.setAttribute("aria-pressed",on);btn.title=tr(on?"Modo auto activado: las noticias nuevas se hacen solas":"Modo auto");save();
 if(!quiet)toast(on?"Modo auto activado":"Modo auto desactivado");if(!on)q=[]}
function showBtn(v){btn.classList.toggle("hide",!v);try{localStorage.setItem(BTN,v?"1":"")}catch{}if(!v&&on)setOn(false,true)}
btn.onclick=()=>setOn(!on);

// código secreto
let buf="";
addEventListener("keydown",e=>{const a=document.activeElement;if(a&&a.matches("input,textarea,select,[contenteditable]"))return;if(e.key.length!=1)return;
 buf=(buf+e.key.toLowerCase()).slice(-CODE.length);if(buf==CODE){buf="";const vis=btn.classList.contains("hide");showBtn(vis);toast(vis?"Modo auto desbloqueado":"Modo auto oculto")}});

// copiar el copy (si la pestaña no está delante, se copia al volver a ella)
let pend=null;
async function copyNow(t){if(!t)return;try{if(!document.hasFocus())throw 0;await navigator.clipboard.writeText(t);pend=null}catch{pend=t}}
const flush=async()=>{if(!pend||!document.hasFocus())return;const t=pend;try{await navigator.clipboard.writeText(t);pend=null;toast("Copy copiado")}catch{}};
addEventListener("focus",()=>setTimeout(flush,150));document.addEventListener("visibilitychange",()=>{if(!document.hidden)setTimeout(flush,150)});addEventListener("pointerdown",flush);

// cola de noticias nuevas
const _add=NEW.add.bind(NEW);
NEW.add=l=>{const r=_add(l);if(on&&!q.includes(l))q.push(l),run();return r};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function idle(){for(let i=0;i<120;i++){if(!document.querySelector(".loading")&&!$("go").classList.contains("busy"))return;await wait(500)}}
async function run(){if(busy)return;busy=true;
 try{while(on&&q.length){const l=q.shift();await wait(1200);
  const it=ITEMS.find(x=>x.link==l);if(!it||markOf(l)||!ME)continue;
  try{if($("mode").value!="both")document.querySelector('.seg [data-v="both"]')?.click();
   await pick(it);await wait(600);if(!photo){toast("Modo auto: sin foto, revisa “"+it.title.slice(0,40)+"…”");continue}
   await idle();$("dlBoth").click();await wait(800);await idle();await wait(400);
   if(!markOf(l))await setMark(l,true);
   copyNow($("copy").value);
   toast(pend?"Hecha automáticamente · el copy se copiará al volver":"Hecha automáticamente · copy copiado");}
  catch(e){toast("Modo auto: "+(e.message||"error"))}}}
 finally{busy=false}}

try{if(localStorage.getItem(BTN)){btn.classList.remove("hide");if(localStorage.getItem(KEY))setOn(true,true)}}catch{}
})();
