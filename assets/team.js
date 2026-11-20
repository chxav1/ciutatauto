// ===== Equipo: perfiles tipo Netflix, estado compartido (noticias hechas), idioma y guardado en la galería =====
const PALETTE=[["#2563eb","Azul","Blau"],["#0ea5e9","Celeste","Cel"],["#0d9488","Turquesa","Turquesa"],["#16a34a","Verde","Verd"],["#84cc16","Lima","Llima"],["#eab308","Amarillo","Groc"],["#f97316","Naranja","Taronja"],
 ["#dc2626","Rojo","Vermell"],["#db2777","Rosa","Rosa"],["#c026d3","Fucsia","Fúcsia"],["#7c3aed","Violeta","Violeta"],["#0f172a","Noche","Nit"],["#78716c","Piedra","Pedra"],["#92400e","Marrón","Marró"]];
const ME_KEY="cs_me";let ME=null,STV=null,editing=false,peColor=null,peLang="es",peId=null;
const ini=n=>(n||"?").trim().charAt(0).toUpperCase();
const cdist=(a,b)=>{const c=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const [r1,g1,b1]=c(a),[r2,g2,b2]=c(b),rm=(r1+r2)/2;return Math.sqrt((2+rm/256)*(r1-r2)**2+4*(g1-g2)**2+(2+(255-rm)/256)*(b1-b2)**2)};
const me=()=>PROFILES.find(p=>p.id==ME)||null;

// --- servidor ---
async function api(op){const r=await fetch("/api/state",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(op)});const j=await r.json().catch(()=>({error:"Sin conexión con el servidor"}));if(!r.ok)throw new Error(j.error||"Error");apply(j);return j}
function apply(j){if(!j||j.same)return;STV=j.v;PROFILES=j.profiles||[];MARKS=j.marks||{};renderFeed();refreshMe();refreshMark();if(!$("who").classList.contains("hide"))renderWho()}
async function pull(){if(document.hidden)return;try{const r=await fetch("/api/state?t="+Date.now()+(STV?"&v="+encodeURIComponent(STV):""),{cache:"no-store"});if(r.ok)apply(await r.json())}catch{}}
setInterval(pull,4000);document.addEventListener("visibilitychange",()=>{if(!document.hidden)pull()});

// --- noticias hechas ---
window.setMark=async(link,on)=>{const id=idOf(link);if(!id||!ME)return;const prev=MARKS[id];
 if(on)MARKS[id]={by:ME,at:Date.now()};else delete MARKS[id];renderFeed();refreshMark();
 try{await api({type:"mark",id,on,by:ME});toast(on?"Marcada como hecha":"Desmarcada")}catch(e){if(prev)MARKS[id]=prev;else delete MARKS[id];renderFeed();refreshMark();toast(e.message)}};
const _rfT=renderFeed;renderFeed=()=>{_rfT();document.querySelectorAll("#feed .it").forEach(el=>{const m=markOf(el.dataset.l),p=m&&profOf(m.by);if(p)el.style.setProperty("--c",p.color);else el.style.removeProperty("--c")})};
function refreshMark(){const b=$("markBtn");if(!b)return;const l=$("link").value;if(!l){b.classList.add("hide");return}b.classList.remove("hide");
 const m=markOf(l),p=m&&profOf(m.by);b.classList.toggle("on",!!m);if(p)b.style.setProperty("--c",p.color);
 b.innerHTML=m?`<span class="av" style="--c:${p?p.color:"#9a9da5"}">${ini(p&&p.name)}</span><span>${p&&p.id==ME?tr("Hecha por ti"):tr("Hecha por")+" "+(p?esc(p.name):"?")}</span>`:`<span class="ring"></span><span>${tr("Marcar como hecha")}</span>`;
 b.title=m?tr("Pulsa para desmarcar"):""}
$("markBtn").onclick=()=>{const l=$("link").value;if(l)setMark(l,!markOf(l))};
new MutationObserver(refreshMark).observe($("link"),{attributes:true});const _pickT=pick;pick=async x=>{const r=await _pickT(x);refreshMark();return r};
$("go").addEventListener("click",()=>setTimeout(refreshMark,2500));
// al descargar, se marca sola como hecha por quien la descarga
["dlStory","dlBoth"].forEach(id=>$(id).addEventListener("click",()=>{const l=$("link").value;if(l&&!markOf(l))setMark(l,true)}));
document.querySelector('#wpost .btn').addEventListener("click",()=>{const l=$("link").value;if(l&&!markOf(l))setMark(l,true)});

// --- perfiles ---
function refreshMe(){const p=me();$("meAv").textContent=ini(p&&p.name);$("meAv").style.setProperty("--c",p?p.color:"#9a9da5");$("meName").textContent=p?p.name:"";
 if(p&&p.lang!==LANG)setLang(p.lang)}
function renderWho(){const g=$("whoGrid");$("who").classList.toggle("editing",editing);
 g.innerHTML=PROFILES.map(p=>`<button class="pf" data-id="${p.id}" style="--c:${p.color}"><span class="tile">${esc(ini(p.name))}</span>${esc(p.name)}</button>`).join("")+
  `<button class="pf add" id="pfAdd"><span class="tile">+</span>${tr("Añadir perfil")}</button>`;
 $("whoEdit").textContent=tr(editing?"Listo":"Gestionar perfiles");$("whoEdit").classList.toggle("hide",!PROFILES.length)}
function openWho(){editing=false;renderWho();$("who").classList.remove("hide")}
$("whoGrid").onclick=e=>{const b=e.target.closest(".pf");if(!b)return;if(b.id=="pfAdd")return openEditor(null);const p=PROFILES.find(x=>x.id==b.dataset.id);if(!p)return;
 if(editing)return openEditor(p);ME=p.id;try{localStorage.setItem(ME_KEY,ME)}catch{}refreshMe();$("who").classList.add("hide");renderFeed();refreshMark()};
$("whoEdit").onclick=()=>{editing=!editing;renderWho()};$("meBtn").onclick=openWho;
function openEditor(p){peId=p?p.id:null;peLang=p?p.lang:LANG;peColor=p?p.color:null;$("peName").value=p?p.name:"";$("peT").textContent=tr(p?"Editar perfil":"Nuevo perfil");
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
 try{const j=await api({type:"profile",profile:{id:peId,name:$("peName").value,color:peColor,lang:peLang}});$("pedit").classList.add("hide");
  if(!peId||peId==ME){ME=j.id;try{localStorage.setItem(ME_KEY,ME)}catch{}setLang(peLang);refreshMe()}
  if(!peId){$("who").classList.add("hide")}else renderWho();toast("Perfil guardado")}catch(err){$("peErr").textContent=err.message;renderColors()}finally{btn.disabled=false}};
$("peDel").onclick=async()=>{if(!peId)return;const p=PROFILES.find(x=>x.id==peId);if(!confirm((LANG=="ca"?"Eliminar el perfil de ":"¿Eliminar el perfil de ")+(p?p.name:"")+"?"))return;
 try{await api({type:"deleteProfile",id:peId});if(peId==ME){ME=null;try{localStorage.removeItem(ME_KEY)}catch{}}$("pedit").classList.add("hide");renderWho();toast("Perfil eliminado")}catch(err){$("peErr").textContent=err.message}};
addEventListener("keydown",e=>{if(e.key=="Escape"&&!$("pedit").classList.contains("hide"))$("pedit").classList.add("hide")});

// --- recuadro: control segmentado ---
$("frameSeg").onclick=e=>{const b=e.target.closest("button");if(!b)return;[...$("frameSeg").children].forEach(x=>x.classList.toggle("on",x==b));$("frame").value=b.dataset.v;$("frame").dispatchEvent(new Event("change"))};

// --- móvil: guardar directamente en la galería (hoja de compartir de iOS / Android) ---
const isMobile=/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)||(navigator.maxTouchPoints>1&&/Mac/.test(navigator.platform));
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

// --- inicio ---
(async()=>{try{ME=localStorage.getItem(ME_KEY)}catch{}await pull();if(!me()){setTimeout(openWho,ME===null?1700:0)}else{setLang(me().lang);refreshMe()}refreshMark()})();
