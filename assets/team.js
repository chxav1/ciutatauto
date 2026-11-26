// ===== Equipo: perfiles tipo Netflix, estado compartido (noticias hechas), idioma y guardado en la galería =====
const PALETTE=[["#2563eb","Azul","Blau"],["#0ea5e9","Celeste","Cel"],["#0d9488","Turquesa","Turquesa"],["#16a34a","Verde","Verd"],["#84cc16","Lima","Llima"],["#eab308","Amarillo","Groc"],["#f97316","Naranja","Taronja"],
 ["#dc2626","Rojo","Vermell"],["#db2777","Rosa","Rosa"],["#c026d3","Fucsia","Fúcsia"],["#7c3aed","Violeta","Violeta"],["#0f172a","Noche","Nit"],["#78716c","Piedra","Pedra"],["#92400e","Marrón","Marró"]];
const ME_KEY="cs_me";let ME=null,STV=null,editing=false,peColor=null,peLang="ca",peId=null;
const ini=n=>(n||"?").trim().charAt(0).toUpperCase();
const cdist=(a,b)=>{const c=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const [r1,g1,b1]=c(a),[r2,g2,b2]=c(b),rm=(r1+r2)/2;return Math.sqrt((2+rm/256)*(r1-r2)**2+4*(g1-g2)**2+(2+(255-rm)/256)*(b1-b2)**2)};
const me=()=>PROFILES.find(p=>p.id==ME)||null;

// --- servidor ---
async function api(op){const r=await fetch("/api/state",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(op)});const j=await r.json().catch(()=>({error:"Sin conexión con el servidor"}));if(!r.ok)throw new Error(j.error||"Error");apply(j);return j}
let SEED=null,SEEDED=false;try{SEED=JSON.parse(localStorage.getItem("cs_state")||"null")}catch{}
function apply(j){if(!j||j.same)return;
 if(j.profiles&&!j.profiles.length&&!SEEDED&&SEED&&SEED.profiles&&SEED.profiles.length){SEEDED=true;api({type:"restore",profiles:SEED.profiles,marks:SEED.marks||{}}).catch(()=>{});return}
 try{if(j.profiles&&j.profiles.length)localStorage.setItem("cs_state",JSON.stringify(j))}catch{}STV=j.v;PROFILES=j.profiles||[];MARKS=j.marks||{};renderFeed();refreshMe();refreshMark();if(!$("who").classList.contains("hide"))renderWho()}
async function pull(){if(document.hidden)return;try{const r=await fetch("/api/state?t="+Date.now()+(STV?"&v="+encodeURIComponent(STV):""),{cache:"no-store"});if(r.ok)apply(await r.json())}catch{}}
setInterval(pull,12000);document.addEventListener("visibilitychange",()=>{if(!document.hidden)pull()});

// --- noticias hechas ---
window.setMark=async(link,on)=>{const id=idOf(link);if(!id||!ME)return;const prev=MARKS[id];
 if(on)MARKS[id]={by:ME,at:Date.now()};else delete MARKS[id];renderFeed();refreshMark();
 try{await api({type:"mark",id,on,by:ME,meta:on&&window.logMeta?window.logMeta(link):undefined});toast(on?"Marcada como hecha":"Desmarcada")}catch(e){if(prev)MARKS[id]=prev;else delete MARKS[id];renderFeed();refreshMark();toast(e.message)}};
const _rfT=renderFeed;renderFeed=()=>{_rfT();document.querySelectorAll("#feed .it").forEach(el=>{const m=markOf(el.dataset.l),p=m&&profOf(m.by);if(p)el.style.setProperty("--c",p.color);else el.style.removeProperty("--c")})};
function refreshMark(){const b=$("markBtn");if(!b)return;const l=$("link").value;if(!l){b.classList.add("hide");return}b.classList.remove("hide");
 const m=markOf(l),p=m&&profOf(m.by);b.classList.toggle("on",!!m);if(p)b.style.setProperty("--c",p.color);
 b.innerHTML=m?`<span class="av" style="--c:${p?p.color:"#9a9da5"}">${ini(p&&p.name)}</span><span>${p&&p.id==ME?tr("Hecha por ti"):tr("Hecha por")+" "+(p?esc(p.name):"?")}</span>`:`<span class="ring"></span><span>${tr("Marcar como hecha")}</span>`;
 b.title=m?tr("Pulsa para desmarcar"):""}
$("markBtn").onclick=()=>{const l=$("link").value;if(l)setMark(l,!markOf(l))};
new MutationObserver(refreshMark).observe($("link"),{attributes:true});const _pickT=pick;pick=async x=>{const r=await _pickT(x);refreshMark();return r};
$("go").addEventListener("click",()=>setTimeout(refreshMark,2500));
// al descargar, se marca sola como hecha por quien la descarga
// al descargar: se marca (si no lo estaba) y el registro apunta lo que se ha descargado
function dlKind(k){const l=$("link").value;if(!l)return;if(!markOf(l)){window.nextKind=k;setMark(l,true)}
 else fetch("/api/log",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({type:"kind",aid:idOf(l),kind:k})}).catch(()=>{})}
$("dlStory").addEventListener("click",()=>dlKind("Historia"));
$("dlBoth").addEventListener("click",()=>dlKind($("mode").value=="story"?"Historia":"Post + historia"));
document.querySelector('#wpost .btn').addEventListener("click",()=>dlKind("Post"));

// --- perfiles ---
function refreshMe(){const p=me();$("meAv").textContent=ini(p&&p.name);$("meAv").style.setProperty("--c",p?p.color:"#9a9da5");$("meName").textContent=p?p.name:"";
 if(p&&p.lang!==LANG)setLang(p.lang)}
function renderWho(){const g=$("whoGrid");$("who").classList.toggle("editing",editing);
 g.innerHTML=PROFILES.map((p,i)=>`<button class="pf" data-id="${p.id}" style="--c:${p.color};--i:${i}"><span class="tile"><i class="dot"></i><b class="L">${esc(ini(p.name))}</b></span>${esc(p.name)}${p.emoji?` <span class="pemo">${emoHTML(p.emoji)}</span>`:""}</button>`).join("")+
  `<button class="pf add" id="pfAdd" style="--i:${PROFILES.length}"><span class="tile">+</span>${tr("Añadir perfil")}</button>`;
 $("whoEdit").textContent=tr(editing?"Listo":"Gestionar perfiles");$("whoEdit").classList.toggle("hide",!PROFILES.length)}
const HI={es:{m:["Buenos días","Bon dia por aquí","Buenos días, equipo","Arrancamos la mañana","Café en mano y a por ello","Buenos días, que hay noticias","Mañana nueva, posts nuevos","Hoy toca contar Tarragona"],t:["Buenas tardes","Buenas tardes, equipo","Seguimos con la tarde","La tarde también tiene noticias","Un último empujón","Vamos a por la tarde"],n:["Buenas noches","Turno de noche, qué cracks","Todavía por aquí","Última ronda de noticias","La noche también informa"],a:["Qué alegría verte","Hola de nuevo","Listos para publicar","Que no se escape ninguna noticia","Hoy va a quedar todo muy bonito","A por un buen día de redes","Las historias no se suben solas","Hagamos que se lea todo"]},
 ca:{m:["Bon dia","Bon dia, equip","Comencem el matí","Cafè a la mà i som-hi","Bon dia, que hi ha notícies","Matí nou, posts nous","Avui toca explicar Tarragona"],t:["Bona tarda","Bona tarda, equip","Seguim amb la tarda","La tarda també té notícies","Una última empenta"],n:["Bona nit","Torn de nit, quins cracks","Encara per aquí","Última ronda de notícies"],a:["Quina alegria veure't","Hola de nou","A punt per publicar","Que no se n'escapi cap notícia","Avui quedarà tot molt bonic","Les històries no es pugen soles"]}};
function greet(){let l="ca";try{const id=localStorage.getItem(ME_KEY),p=PROFILES.find(x=>x.id==id);if(p)l=p.lang;else if(document.documentElement.lang=="es")l="es"}catch{}
 const h=new Date().getHours(),k=h>=6&&h<14?"m":h>=14&&h<21?"t":"n",L=HI[l]||HI.es,pool=[...L[k],...L[k],...L.a];let t;
 t=null;try{const last=sessionStorage.getItem("cs_hi");do t=pool[Math.random()*pool.length|0];while(t==last&&pool.length>1);sessionStorage.setItem("cs_hi",t)}catch{t=pool[0]}
 t=(l=="es"?"¡":"")+t+"!";
 $("whoHi").innerHTML=t.split(" ").map((w,i)=>`<span style="--w:${i}">${esc(w)}</span>`).join(" ")}
function askConfirm(title,text,ok){return new Promise(res=>{$("cfmT").textContent=title;$("cfmX").textContent=text;$("cfmOk").textContent=ok||tr("Eliminar");const m=$("cfm");m.classList.remove("hide");setTimeout(()=>$("cfmNo").focus(),30);
 const done=v=>{m.classList.add("hide");$("cfmOk").onclick=$("cfmNo").onclick=m.onclick=null;removeEventListener("keydown",k);res(v)},k=e=>{if(e.key=="Escape"){e.stopPropagation();done(false)}};
 $("cfmOk").onclick=()=>done(true);$("cfmNo").onclick=()=>done(false);m.onclick=e=>{if(e.target==m)done(false)};addEventListener("keydown",k,true)})}
window.askConfirm=askConfirm;
let whoT=0;function openWho(){greet();editing=false;clearTimeout(whoT);const w=$("who");w.classList.remove("leave");renderWho();w.classList.remove("hide");w.classList.add("show");document.body.classList.add("whoopen");whoT=setTimeout(()=>w.classList.remove("show"),900)}
function closeWho(pick){const w=$("who");clearTimeout(whoT);w.classList.remove("show");if(pick)pick.classList.add("pick");w.classList.add("leave");document.body.classList.remove("whoopen");
 whoT=setTimeout(()=>{w.classList.add("hide");w.classList.remove("leave");w.querySelectorAll(".pick").forEach(x=>x.classList.remove("pick"));document.body.classList.add("enter");setTimeout(()=>document.body.classList.remove("enter"),700)},480)}
$("whoGrid").onclick=e=>{const b=e.target.closest(".pf");if(!b)return;if(b.id=="pfAdd")return openEditor(null);const p=PROFILES.find(x=>x.id==b.dataset.id);if(!p)return;
 if(editing)return openEditor(p);ME=p.id;try{localStorage.setItem(ME_KEY,ME)}catch{}refreshMe();closeWho(b);renderFeed();refreshMark()};
$("whoEdit").onclick=()=>{editing=!editing;renderWho()};$("meBtn").onclick=openWho;
const EMOS=["img:cd-rojo","img:diamante","img:paloma","img:ala","img:oso","img:cruz","✨","🔥","⚡","🌊","🌸","🎧","📸","☕","🚀","🦊","🌙","🎱","😎","👑","🍒","🦄","🐸","🍓","🌈","🧃"];let peEmo="";
const emoHTML=e=>(e=e=="img:cd"?"img:cd-rojo":e)&&e.startsWith("img:")?`<img class="emi" src="assets/emoji/${e.slice(4)}.png" alt="" draggable="false">`:esc(e||"");
function renderEmo(){$("peEmo").innerHTML=`<button type="button" class="emc none${!peEmo?" on":""}" data-e="" title="${tr("Sin emoji")}" aria-label="${tr("Sin emoji")}">—</button>`+EMOS.map(e=>{const own=PROFILES.find(x=>x.id!=peId&&x.emoji==e);return`<button type="button" class="emc${e==peEmo?" on":""}" data-e="${e}" ${own?`disabled title="${esc(own.name)}"`:""}>${emoHTML(e)}${own?`<span class="own">${esc(ini(own.name))}</span>`:""}</button>`}).join("")}
$("peEmo").onclick=e=>{const b=e.target.closest(".emc");if(!b||b.disabled)return;peEmo=b.dataset.e;renderEmo();peAv()};
function openEditor(p){peId=p?p.id:null;peEmo=p&&p.emoji||"";renderEmo();peLang=p?p.lang:LANG;peColor=p?p.color:null;$("peName").value=p?p.name:"";$("peT").textContent=tr(p?"Editar perfil":"Nuevo perfil");
 $("peDel").classList.toggle("hide",!p);$("peErr").textContent="";
 [...$("peLang").children].forEach(b=>b.classList.toggle("on",b.dataset.v==peLang));
 if(!peColor){const free=PALETTE.find(([c])=>!PROFILES.some(x=>cdist(x.color,c)<90));peColor=free?free[0]:PALETTE[0][0]}
 renderColors();peAv();$("pedit").classList.remove("hide");setTimeout(()=>$("peName").focus(),50)}
function renderColors(){$("peColors").innerHTML=PALETTE.map(([c,es,ca])=>{const own=PROFILES.find(x=>x.id!=peId&&cdist(x.color,c)<90);
 return `<button type="button" class="swc${c==peColor?" on":""}" style="--c:${c}" data-c="${c}" ${own?"disabled":""} aria-label="${LANG=="ca"?ca:es}${own?" · "+esc(own.name):""}" title="${LANG=="ca"?ca:es}${own?" · "+esc(own.name):""}">${own?`<span class="own">${esc(ini(own.name))}</span>`:""}</button>`}).join("")}
function peAv(){$("peAv").textContent=ini($("peName").value);$("peAv").style.setProperty("--c",peColor||"#9a9da5")}
$("peColors").onclick=e=>{const b=e.target.closest(".swc");if(!b||b.disabled)return;peColor=b.dataset.c;renderColors();peAv()};
$("peLang").onclick=e=>{const b=e.target.closest("button");if(!b)return;peLang=b.dataset.v;[...$("peLang").children].forEach(x=>x.classList.toggle("on",x==b))};
$("peName").oninput=peAv;$("peCancel").onclick=()=>$("pedit").classList.add("hide");
$("peForm").onsubmit=async e=>{e.preventDefault();const btn=$("peSave");btn.disabled=true;$("peErr").textContent="";
 try{const j=await api({type:"profile",profile:{id:peId,name:$("peName").value,color:peColor,lang:peLang,emoji:peEmo}});$("pedit").classList.add("hide");
  if(!peId||peId==ME){ME=j.id;try{localStorage.setItem(ME_KEY,ME)}catch{}setLang(peLang);refreshMe()}
  if(!peId){closeWho()}else renderWho();toast("Perfil guardado")}catch(err){$("peErr").textContent=err.message;renderColors();renderEmo()}finally{btn.disabled=false}};
$("peDel").onclick=async()=>{if(!peId)return;const p=PROFILES.find(x=>x.id==peId);if(!await askConfirm((LANG=="ca"?"Eliminar el perfil de ":"¿Eliminar el perfil de ")+(p?p.name:"")+"?",tr("Sus noticias hechas seguirán marcadas, pero ya no se podrá entrar con este perfil.")))return;
 try{await api({type:"deleteProfile",id:peId});if(peId==ME){ME=null;try{localStorage.removeItem(ME_KEY)}catch{}}$("pedit").classList.add("hide");renderWho();toast("Perfil eliminado")}catch(err){$("peErr").textContent=err.message}};
addEventListener("keydown",e=>{if(e.key=="Escape"&&!$("pedit").classList.contains("hide"))$("pedit").classList.add("hide")});

// --- recuadro: control segmentado ---
$("frameSeg").onclick=e=>{const b=e.target.closest("button");if(!b)return;[...$("frameSeg").children].forEach(x=>x.classList.toggle("on",x==b));$("frame").value=b.dataset.v;$("frame").dispatchEvent(new Event("change"))};

// --- móvil: guardar directamente en la galería (hoja de compartir de iOS / Android) ---
const isMobile=/iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.maxTouchPoints>1&&/Mac/.test(navigator.platform));
const fileOf=(blob,name)=>new File([blob],name,{type:blob.type||"application/octet-stream"});
const canvasBlob=id=>new Promise(r=>$(id).toBlob(r,"image/jpeg",.95));
let pendingFiles=null;
async function shareFiles(files){if(!(navigator.canShare&&navigator.canShare({files})))return false;
 try{await navigator.share({files});return true}catch(e){if(e.name=="AbortError")return true;pendingFiles=files;$("saveSheet").classList.remove("hide");return true}}
$("ssGo").onclick=async()=>{const f=pendingFiles;$("saveSheet").classList.add("hide");pendingFiles=null;if(f)try{await navigator.share({files:f})}catch{}};
$("ssCancel").onclick=()=>{$("saveSheet").classList.add("hide");pendingFiles=null};
if(isMobile){
 const _dlM=dl;dl=async(id,n)=>{try{let f;if(id=="cstory"&&isVid()){const b=await withLoader([$("dlStory")],getVideo);f=fileOf(b,vname(b))}else f=fileOf(await canvasBlob(id),`laciutat_${n}_${Date.now()}.jpg`);
  if(!await shareFiles([f]))return _dlM(id,n)}catch(e){toast(e.message||"No se pudo descargar")}};
 $("dlBoth").onclick=async()=>{if(!TT.story)return;try{const files=[];if($("mode").value!="story")files.push(fileOf(await canvasBlob("cpost"),`laciutat_POST_${Date.now()}.jpg`));
  if(isVid()){const b=await withLoader([$("dlStory"),$("dlBoth")],getVideo);files.push(fileOf(b,vname(b)))}else files.push(fileOf(await canvasBlob("cstory"),`laciutat_HISTORIA_${Date.now()}.jpg`));
  if(!await shareFiles(files))files.forEach(f=>save(f,f.name))}catch(e){toast(e.message||"No se pudo descargar")}};
}

// --- tema claro / oscuro ---
function setTheme(t){const d=document.documentElement;d.dataset.theme=t;try{localStorage.setItem("cs_theme",t)}catch{}document.querySelector('meta[name=theme-color]')?.setAttribute("content",t=="dark"?"#16171b":"#ffffff")}
document.addEventListener("click",e=>{if(e.target.closest("#themeBtn,[data-theme-toggle]"))setTheme(document.documentElement.dataset.theme=="dark"?"light":"dark")});

// --- vista previa flotante en móvil mientras ajustas ---
(()=>{const pip=$("pip"),pc=pip.querySelector("canvas"),lb=pip.querySelector("span"),prev=document.querySelector(".prev"),insp=document.querySelector(".insp");
 let kind="post",prevVis=true,inspVis=false,last=0;const mq=matchMedia("(max-width:1000px)");
 const src=()=>{if(kind=="post"&&$("wpost").classList.contains("hide"))kind="story";return $(kind=="post"?"cpost":"cstory")};
 const want=()=>mq.matches&&!$("res").classList.contains("hide")&&!prevVis&&inspVis;
 function draw(ts){if(pip.classList.contains("on")){if(ts-last>66){last=ts;const c=src(),w=pc.width,h=Math.round(w*c.height/c.width);if(pc.height!=h)pc.height=h;pc.getContext("2d").drawImage(c,0,0,w,h);lb.textContent=tr(kind=="post"?"Post":"Historia")}requestAnimationFrame(draw)}}
 function upd(){const on=want();if(on==pip.classList.contains("on"))return;pip.classList.toggle("on",on);if(on)requestAnimationFrame(draw)}
 const chk=()=>{const a=prev.getBoundingClientRect(),b=insp.getBoundingClientRect(),H=innerHeight;prevVis=a.bottom>a.height*.35+70&&a.top<H-a.height*.35;inspVis=b.top<H&&b.bottom>0;upd()};
 addEventListener("scroll",chk,{passive:true});addEventListener("resize",chk);
 pip.onclick=()=>{if(!$("wpost").classList.contains("hide")){kind=kind=="post"?"story":"post";last=0}};
})();

// --- modo simple ---
function setSimple(on){document.body.classList.toggle("simple",on);const b=$("simpleBtn");b.classList.toggle("on",on);b.setAttribute("aria-pressed",on);b.title=tr(on?"Modo completo":"Modo simple");try{localStorage.setItem("cs_simple",on?"1":"")}catch{}}
$("simpleBtn").onclick=()=>{const on=!document.body.classList.contains("simple");setSimple(on);toast(on?"Modo simple":"Modo completo")};
try{setSimple(!!localStorage.getItem("cs_simple"))}catch{}

// --- previsualizaciones: siempre caben en pantalla (escritorio) ---
(()=>{const st=document.querySelector(".stage"),pv=document.querySelector(".prev"),mq=matchMedia("(min-width:1001px)");
 function fit(){if(!mq.matches||$("res").classList.contains("hide")){pv.style.removeProperty("--ph");return}
  const cs=getComputedStyle(st),q=document.querySelector(".quick"),qh=q&&q.offsetParent?q.offsetHeight+18:0,sh=document.querySelector(".stagehead");
  const av=st.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom)-sh.offsetHeight-20-qh-28-12-38-11-20;
  const one=$("wpost").classList.contains("hide"),wb=one?pv.clientWidth/.5625:(pv.clientWidth-28)/1.3125;
  pv.style.setProperty("--ph",Math.max(220,Math.floor(Math.min(av,wb)))+"px")}
 addEventListener("resize",fit);new ResizeObserver(fit).observe(document.querySelector(".stagehead"));new ResizeObserver(fit).observe(pv);
 new MutationObserver(fit).observe(document.body,{subtree:true,attributes:true,attributeFilter:["class"]});window.fitPrev=fit;fit()})();

// --- scroll suave en la lista de noticias ---
(()=>{const el=$("feedBody");let tgt=null,raf=0;
 function step(){const d=tgt-el.scrollTop;if(Math.abs(d)<.6){el.scrollTop=tgt;tgt=null;raf=0;return}el.scrollTop+=d*.06;raf=requestAnimationFrame(step)}
 el.addEventListener("wheel",e=>{if(e.ctrlKey||matchMedia("(prefers-reduced-motion:reduce)").matches)return;const max=el.scrollHeight-el.clientHeight;if(max<=0)return;
  let dy=e.deltaMode==1?e.deltaY*32:e.deltaMode==2?e.deltaY*el.clientHeight:e.deltaY;dy*=.55;if(tgt==null)tgt=el.scrollTop;
  const n=Math.max(0,Math.min(max,tgt+dy));if(n==tgt&&(n==0||n==max))return;e.preventDefault();tgt=n;if(!raf)raf=requestAnimationFrame(step)},{passive:false});
 el.addEventListener("scroll",()=>{if(!raf)tgt=null},{passive:true})})();

// --- sonidos discretos (sintetizados, volumen bajo) ---
const SND={enter:[[523.25,0,.5],[783.99,.09,.6],[1046.5,.18,.8]],done:[[987.77,0,.45],[1479.98,.08,.7]],undo:[[659.25,0,.35],[493.88,.07,.45]],tap:[[1760,0,.12]],save:[[783.99,0,.35],[987.77,.07,.35],[1318.5,.14,.6]],copy:[[1318.5,0,.18]]};
let sndT=0;function snd(k){const n=SND[k];if(!n||Date.now()-sndT<60)return;sndT=Date.now();try{unlock();if(!AC)return;const t=AC.currentTime+.01,out=AC.createGain();out.gain.value=k=="tap"||k=="copy"?.05:.085;out.connect(AC.destination);
 n.forEach(([f,d,len])=>{[1,2].forEach((h,i)=>{const o=AC.createOscillator(),g=AC.createGain();o.type=i?"triangle":"sine";o.frequency.value=f*h;const v=i?.18:1;
  g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(v,t+d+.008);g.gain.exponentialRampToValueAtTime(.0001,t+d+len);o.connect(g).connect(out);o.start(t+d);o.stop(t+d+len+.05)})})}catch{}}
window.snd=snd;
{const _cw=closeWho;closeWho=pick=>{if(pick)snd("enter");return _cw(pick)};}
{const _sm=window.setMark;window.setMark=async(l,on)=>{const b=!!markOf(l);await _sm(l,on);if(!!markOf(l)!=b)snd(on?"done":"undo")};}
{const _sv=save;save=(...a)=>{snd("save");return _sv(...a)};}
{const _sf=shareFiles;shareFiles=async f=>{const r=await _sf(f);if(r)snd("save");return r};}

// --- inicio ---
(async()=>{let fast=false;try{ME=localStorage.getItem(ME_KEY);fast=!!sessionStorage.getItem("cs_in");const c=JSON.parse(localStorage.getItem("cs_state")||"null");if(c){STV=null;PROFILES=c.profiles||[];MARKS=c.marks||{};if(me()){setLang(me().lang);refreshMe()}}}catch{}if(!me())setLang("ca");
 const t0=Date.now(),wait=fast?0:800;const go=()=>setTimeout(openWho,Math.max(0,wait-(Date.now()-t0)));
 if(PROFILES.length){go();pull().then(()=>{if(me()){setLang(me().lang);refreshMe()}refreshMark()})}
 else{await pull();if(me()){setLang(me().lang);refreshMe()}go()}
 refreshMark()})();
// al descargar: historia → copia el enlace; post (o las 2) → copia el copy
(()=>{const clip=(id,msg)=>{const v=($(id).value||"").trim();if(!v||!navigator.clipboard)return;navigator.clipboard.writeText(v).then(()=>setTimeout(()=>toast(tr(msg)),400),()=>{})};
 const base=dl;dl=(id,n)=>{if(id=="cstory")clip("link","Enlace copiado");else if(id=="cpost")clip("copy","Copy copiado");return base(id,n)};window.dl=dl;
 const b=$("dlBoth"),both=b.onclick;b.onclick=e=>{if(TT.story)clip($("mode").value=="story"?"link":"copy",$("mode").value=="story"?"Enlace copiado":"Copy copiado");return both.call(b,e)}})();
