// Modo auto (oculto): se desbloquea escribiendo "xaviteamo" sin estar en ningún campo.
// Con el modo activo, cada noticia nueva que entra se abre, se descarga (post + historia) y se marca como hecha.
(()=>{
const KEY="cs_auto",BTN="cs_autobtn",CODE="xaviteamo";
const btn=document.createElement("button");
btn.className="tbtn autob hide";btn.id="autoBtn";btn.type="button";btn.setAttribute("aria-pressed","false");
btn.innerHTML='<i></i><span>Auto</span>';
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
   toast("Hecha automáticamente");}
  catch(e){toast("Modo auto: "+(e.message||"error"))}}}
 finally{busy=false}}

try{if(localStorage.getItem(BTN)){btn.classList.remove("hide");if(localStorage.getItem(KEY))setOn(true,true)}}catch{}
})();
