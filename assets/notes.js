// Notas del equipo: tareas, avisos e ideas, con persona, fecha límite, fijadas y noticia vinculada.
(()=>{
let NOTES=[],NV=null,filter="open",editId=null,first=true,seen=new Set();
const pad=n=>String(n).padStart(2,"0");
const LOC=()=>document.documentElement.lang=="ca"?"ca-ES":"es-ES";
const sod=t=>{const d=new Date(t);d.setHours(0,0,0,0);return+d};
const T0=()=>sod(Date.now());
function when(t){const d=new Date(t),dd=sod(t),h=`${pad(d.getHours())}:${pad(d.getMinutes())}`,allDay=h=="23:59";
 const day=dd==T0()?tr("Hoy"):dd==T0()+864e5?tr("Mañana"):dd==T0()-864e5?tr("Ayer"):d.toLocaleDateString(LOC(),{weekday:"short",day:"numeric",month:"short"});
 return allDay?day:`${day} · ${h}`}
function ago(t){const m=Math.round((Date.now()-t)/6e4);return m<1?tr("ahora"):m<60?m+" min":m<1440?Math.floor(m/60)+" h":new Date(t).toLocaleDateString(LOC(),{day:"numeric",month:"short"})}
const P=id=>profOf(id),avH=(id,cls="")=>{const p=P(id);return`<span class="av ${cls}" style="--c:${p?p.color:"#9a9da5"}" title="${esc(p?p.name:"?")}">${esc(ini(p&&p.name))}</span>`};
const linkify=s=>esc(s).replace(/(https?:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>').replace(/\n/g,"<br>");
async function post(op){const r=await fetch("/api/notes",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...op,by:ME})});const j=await r.json().catch(()=>({error:"Sin conexión con el servidor"}));if(!r.ok)throw new Error(j.error||"Error");take(j);return j}
function take(j){if(!j||j.same)return;NV=j.v;const old=new Set(NOTES.map(n=>n.id));NOTES=j.notes||[];
 if(!first&&ME)for(const n of NOTES)if(!old.has(n.id)&&!seen.has(n.id)&&n.by!=ME&&(!n.to||n.to==ME)){seen.add(n.id);toast(`${tr("Nueva nota de")} ${P(n.by)?.name||"?"}`);window.snd&&snd("done")}
 first=false;badge();if(document.body.classList.contains("notesmode"))draw()}
async function pull(){if(document.hidden&&!first)return;try{const r=await fetch("/api/notes?t="+Date.now()+(NV?"&v="+encodeURIComponent(NV):""),{cache:"no-store"});if(r.ok)take(await r.json())}catch{}}
setInterval(pull,6000);document.addEventListener("visibilitychange",()=>{if(!document.hidden)pull()});setTimeout(pull,800);

const isOpen=n=>!n.done,mine=n=>n.to&&n.to==ME,forMe=n=>!n.to||n.to==ME;
const late=n=>n.due&&n.due<Date.now()&&isOpen(n);
function badge(){const b=$("ntBadge");if(!b)return;const n=NOTES.filter(n=>isOpen(n)&&(mine(n)||(!n.to&&n.due&&n.due<T0()+864e5))).length;b.textContent=n||"";b.classList.toggle("hide",!n)}

// ---------- lista ----------
function card(n){const typeL={tarea:tr("Tarea"),aviso:tr("Aviso"),idea:tr("Idea")}[n.type]||"";
 return`<article class="nt t-${n.type}${n.pin?" pinned":""}${late(n)?" late":""}${n.done?" isdone":""}" data-id="${n.id}">
 <button class="nt-ck" type="button" aria-label="${tr(n.done?"Marcar como pendiente":"Marcar como hecha")}" title="${tr(n.done?"Marcar como pendiente":"Marcar como hecha")}"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></button>
 <div class="nt-main"><p class="nt-tx">${linkify(n.text)}</p>
  ${n.link?`<a class="nt-art" href="${esc(n.link)}" data-art="${esc(n.link)}">${esc(n.ltitle||n.link)}</a>`:""}
  <div class="nt-meta"><span class="nt-ty">${typeL}</span>${n.due?`<span class="nt-due">${when(n.due)}</span>`:""}
   <span class="nt-who">${avH(n.by,"sm")}<span>${esc(P(n.by)?.name||"?")}</span><em>${ago(n.at)}</em></span>
   <span class="nt-to">→ ${n.to?`${avH(n.to,"sm")}<span>${esc(P(n.to)?.name||"?")}</span>`:`<span>${tr("Todo el equipo")}</span>`}</span>
   ${n.done?`<span class="nt-dn">✓ ${esc(P(n.done.by)?.name||"?")} · ${ago(n.done.at)}</span>`:""}</div></div>
 <div class="nt-acts"><button type="button" data-a="pin" class="${n.pin?"on":""}" title="${tr(n.pin?"Desfijar":"Fijar arriba")}" aria-label="${tr(n.pin?"Desfijar":"Fijar arriba")}"><svg viewBox="0 0 24 24" width="15" height="15" fill="${n.pin?"currentColor":"none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5M9 3h6l-1 6 3 3H7l3-3-1-6Z"/></svg></button>
  <button type="button" data-a="edit" title="${tr("Editar")}" aria-label="${tr("Editar")}"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>
  <button type="button" data-a="del" title="${tr("Borrar")}" aria-label="${tr("Borrar")}"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button></div></article>`}
function group(t,list){return list.length?`<h3 class="nt-g">${t}<em>${list.length}</em></h3>${list.map(card).join("")}`:""}
function draw(){const q=$("ntQ").value.trim().toLowerCase();let L=NOTES.filter(n=>!q||(n.text+" "+(n.ltitle||"")).toLowerCase().includes(q));
 const open=L.filter(isOpen);$("ntCount").textContent=open.length||"";
 let html="";
 if(filter=="done"){html=group(tr("Hechas"),L.filter(n=>n.done).sort((a,b)=>b.done.at-a.done.at))}
 else{const src=filter=="me"?open.filter(mine):open,byDue=(a,b)=>a.due-b.due,byNew=(a,b)=>b.at-a.at,t1=T0()+864e5;
  const pin=src.filter(n=>n.pin).sort(byNew),rest=src.filter(n=>!n.pin);
  html=group(tr("Fijadas"),pin)+group(tr("Atrasadas"),rest.filter(n=>n.due&&n.due<Date.now()).sort(byDue))+group(tr("Para hoy"),rest.filter(n=>n.due>=Date.now()&&n.due<t1).sort(byDue))
   +group(tr("Próximas"),rest.filter(n=>n.due>=t1).sort(byDue))+group(tr("Sin fecha"),rest.filter(n=>!n.due).sort(byNew))}
 $("ntBody").innerHTML=html||`<div class="nt-empty"><p>${tr(filter=="done"?"Todavía no hay notas hechas.":filter=="me"?"No tienes nada asignado. ¡Todo al día!":"No hay notas pendientes. Escribe la primera a la izquierda.")}</p></div>`}

$("ntBody").addEventListener("click",async e=>{const art=e.target.closest("[data-art]");if(art){e.preventDefault();const l=art.dataset.art,x=ITEMS.find(i=>i.link==l);document.querySelector('#tabs [data-tab="studio"]').click();if(x)pick(x);else{$("url").value=l;$("go").click()}return}
 const el=e.target.closest(".nt");if(!el)return;const id=el.dataset.id,n=NOTES.find(x=>x.id==id);if(!n)return;
 try{if(e.target.closest(".nt-ck")){el.classList.add("leaving");await post({type:"done",id,on:!n.done});if(!n.done&&window.snd)snd("done")}
  else{const a=e.target.closest("[data-a]")?.dataset.a;
   if(a=="pin")await post({type:"update",id,patch:{pin:!n.pin}});
   if(a=="edit")startEdit(n);
   if(a=="del"&&await askConfirm(tr("¿Borrar esta nota?"),n.text.length>90?n.text.slice(0,90)+"…":n.text,tr("Borrar")))await post({type:"delete",id})}}
 catch(err){el.classList.remove("leaving");toast(err.message)}});
$("ntFilter").onclick=e=>{const b=e.target.closest("button");if(!b)return;filter=b.dataset.v;[...$("ntFilter").children].forEach(x=>x.classList.toggle("on",x==b));draw()};
$("ntQ").oninput=draw;

// ---------- nueva nota / edición ----------
let ntype="tarea";
$("ntType").onclick=e=>{const b=e.target.closest("button");if(!b)return;ntype=b.dataset.v;[...$("ntType").children].forEach(x=>x.classList.toggle("on",x==b))};
function fillTo(v){$("ntTo").innerHTML=`<option value="">${tr("Todo el equipo")}</option>`+PROFILES.map(p=>`<option value="${p.id}"${p.id==v?" selected":""}>${esc(p.name)}${p.id==ME?" ("+tr("tú")+")":""}</option>`).join("")}
const toLocal=t=>{if(!t)return"";const d=new Date(t);return`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`};
$("ntQuick").onclick=e=>{const b=e.target.closest("button");if(!b)return;const v=b.dataset.v;if(v=="none"){$("ntDue").value="";return}
 const d=new Date();if(v=="tomorrow")d.setDate(d.getDate()+1);if(v=="2h")d.setHours(d.getHours()+2,0,0,0);else if(v=="today")d.setHours(Math.max(d.getHours()+1,13),0,0,0);else d.setHours(10,0,0,0);$("ntDue").value=toLocal(+d)};
function cur(){return $("link").value&&!$("res").classList.contains("hide")?{link:$("link").value,ltitle:$("title").value||$("htitle").textContent}:null}
function refreshLink(){const c=cur(),row=$("ntLinkRow");row.classList.toggle("hide",!c&&!editId);if(c)$("ntLinkT").textContent=c.ltitle}
function startEdit(n){editId=n.id;$("ntForm").classList.remove("shut");$("ntForm").scrollIntoView({block:"nearest",behavior:"smooth"});ntype=n.type;[...$("ntType").children].forEach(x=>x.classList.toggle("on",x.dataset.v==n.type));$("ntText").value=n.text;fillTo(n.to);$("ntDue").value=toLocal(n.due);$("ntPin").checked=!!n.pin;
 $("ntLink").checked=!!n.link;$("ntLinkT").textContent=n.ltitle||"";$("ntLinkRow").classList.toggle("hide",!n.link);$("ntSave").textContent=tr("Guardar cambios");$("ntCancel").classList.remove("hide");$("ntHead").textContent=tr("Editar nota");$("ntText").focus()}
function resetForm(){editId=null;$("ntText").value="";$("ntDue").value="";$("ntPin").checked=false;$("ntLink").checked=false;fillTo("");$("ntSave").textContent=tr("Añadir nota");$("ntCancel").classList.toggle("hide",!matchMedia("(max-width:900px)").matches);$("ntHead").textContent=tr("Nueva nota");refreshLink()}
$("ntCancel").onclick=()=>{resetForm();$("ntForm").classList.add("shut")};
$("ntOpen").onclick=()=>{$("ntForm").classList.remove("shut");setTimeout(()=>$("ntText").focus(),50)};
$("ntForm").onsubmit=async e=>{e.preventDefault();const text=$("ntText").value.trim();if(!text){$("ntText").focus();return}
 const c=cur(),d=$("ntDue").value,keep=editId&&NOTES.find(x=>x.id==editId);
 const note={text,type:ntype,to:$("ntTo").value,due:d?new Date(d).getTime():0,pin:$("ntPin").checked,
  link:$("ntLink").checked?(c?.link||keep?.link||""):"",ltitle:$("ntLink").checked?(c?.ltitle||keep?.ltitle||""):""};
 const b=$("ntSave");b.disabled=true;try{if(editId)await post({type:"update",id:editId,patch:note});else await post({type:"add",note});toast(editId?"Nota guardada":"Nota añadida");resetForm();$("ntForm").classList.add("shut")}catch(err){toast(err.message)}finally{b.disabled=false}};
$("ntText").addEventListener("keydown",e=>{if(e.key=="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();$("ntForm").requestSubmit()}});

// al entrar en la pestaña
window.onNotesTab=()=>{fillTo(editId?$("ntTo").value:"");refreshLink();draw();pull()};
setInterval(()=>{if(document.body.classList.contains("notesmode"))draw()},60000); // "hace X min" y atrasadas al día
})();
