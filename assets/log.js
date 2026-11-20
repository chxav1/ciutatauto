// Registro de publicaciones (tipo Excel): automático al marcar, editable a mano, con historial y exportación.
(()=>{
const accName=k=>((ACC.find(a=>a[0]==k)||[])[1])||(k=="general"?"General":k||"");
const pad=n=>String(n).padStart(2,"0");
const dkey=t=>{const d=new Date(t);return`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`};
const tkey=t=>{const d=new Date(t);return`${pad(d.getHours())}:${pad(d.getMinutes())}`};
const mkey=t=>dkey(t).slice(0,7);
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const LOC=()=>document.documentElement.lang=="ca"?"ca-ES":"es-ES";
async function post(op){const r=await fetch("/api/log",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(op)});const j=await r.json().catch(()=>({error:"Sin conexión con el servidor"}));if(!r.ok)throw new Error(j.error||"Error");return j}

// --- alta / baja automática al marcar una noticia ---
function infoOf(link){const it=ITEMS.find(x=>x.link==link);const isCur=$("link").value==link;let acc="";
 try{acc=isCur?curAcc():(it?autoOf(it).acc:"")}catch{}
 return{aid:idOf(link),link,title:isCur?($("title").value||it?.title||""):(it?.title||""),acc:accName(acc),kind:isCur&&$("mode").value=="story"?"Historia":"Post + historia"}}
const _sm=window.setMark;
window.setMark=async(link,on)=>{const before=!!markOf(link);await _sm(link,on);const now=!!markOf(link);if(now==before)return;
 try{if(on)await post({type:"add",row:{...infoOf(link),by:ME}});else await post({type:"removeAid",aid:idOf(link)})}catch(e){toast(e.message)}
 if(open)load()};

// --- vista ---
let open=false,range="week",anchor=Date.now(),DATA={},timer=0,editing=0;
const view=$("logv");
function bounds(){const a=new Date(anchor);a.setHours(0,0,0,0);let s=new Date(a),e;
 if(range=="day")e=new Date(+s+864e5);
 else if(range=="week"){s.setDate(s.getDate()-((s.getDay()+6)%7));e=new Date(s);e.setDate(e.getDate()+7)}
 else{s.setDate(1);e=new Date(s);e.setMonth(e.getMonth()+1)}
 return[+s,+e]}
function months(){const[s,e]=bounds(),out=new Set();for(let t=s;t<e;t+=864e5)out.add(mkey(t));return[...out]}
async function load(){const ms=months();try{const r=await fetch("/api/log?m="+ms.join(",")+"&t="+Date.now(),{cache:"no-store"});if(!r.ok)throw 0;const j=await r.json();for(const m in j)DATA[m]=j[m].rows||[];backfill();if(!editing)draw()}catch{$("lgBody").innerHTML=`<tr><td colspan="8" class="lg-empty">${tr("No se pudo cargar el registro. Reintentando…")}</td></tr>`}}
const done=new Set();
function backfill(){const[s,e]=bounds();const have=new Set(Object.values(DATA).flat().map(r=>r.aid));
 for(const id in MARKS){const m=MARKS[id];if(!m.at||m.at<s||m.at>=e||have.has(+id)||done.has(id))continue;const it=ITEMS.find(x=>idOf(x.link)==id);if(!it)continue;done.add(id);
  post({type:"add",keep:true,row:{...infoOf(it.link),by:m.by,at:m.at}}).then(()=>setTimeout(load,300)).catch(()=>{})}}
function rowsIn(){const[s,e]=bounds(),who=$("lgWho").value,q=$("lgQ").value.trim().toLowerCase();
 return Object.entries(DATA).flatMap(([m,rs])=>rs.map(r=>({...r,m}))).filter(r=>r.at>=s&&r.at<e&&(!who||r.by==who)&&(!q||(r.title+" "+r.acc+" "+r.note).toLowerCase().includes(q))).sort((a,b)=>b.at-a.at)}
function label(){const[s,e]=bounds(),L=LOC();
 if(range=="day")return new Date(s).toLocaleDateString(L,{weekday:"long",day:"numeric",month:"long",year:"numeric"});
 if(range=="month")return new Date(s).toLocaleDateString(L,{month:"long",year:"numeric"});
 const a=new Date(s),b=new Date(e-1);return`${a.toLocaleDateString(L,{day:"numeric",month:"short"})} – ${b.toLocaleDateString(L,{day:"numeric",month:"short",year:"numeric"})}`}
const opt=(v,t,sel)=>`<option value="${esc(v)}"${sel?" selected":""}>${esc(t)}</option>`;
const SM=matchMedia("(max-width:640px)");
const COLS=()=>[["d","Día",138],["t","Hora",96],["by","Persona",SM.matches?140:170],["title","Publicación",0],["acc","Cuenta",SM.matches?120:150],["kind","Formato",SM.matches?130:150],["note","Notas",180],["x","",56]].filter(c=>!(SM.matches&&(c[0]=="d"||c[0]=="note")));
SM.addEventListener("change",()=>open&&draw());
function draw(){const rows=rowsIn(),cols=COLS(),N=cols.length,has=k=>cols.some(c=>c[0]==k);
 $("lgCols").innerHTML=cols.map(c=>`<col${c[2]?` style="width:${c[2]}px"`:""}>`).join("");$("lgHead").innerHTML=cols.map(c=>`<th>${tr(c[1])}</th>`).join("");$("lgLabel").textContent=cap(label());
 const w=$("lgWho").value;$("lgWho").innerHTML=opt("",tr("Todas las personas"),!w)+PROFILES.map(p=>opt(p.id,p.name,w==p.id)).join("");
 const cnt={};rows.forEach(r=>cnt[r.by]=(cnt[r.by]||0)+1);
 $("lgSum").innerHTML=`<div class="lg-tot"><b>${rows.length}</b><span>${tr(rows.length==1?"publicación":"publicaciones")}</span></div>`+
  Object.entries(cnt).sort((a,b)=>b[1]-a[1]).map(([id,n])=>{const p=profOf(id);return`<div class="lg-chip"><span class="av" style="--c:${p?p.color:"#9a9da5"}">${esc(ini(p&&p.name))}</span><span>${esc(p?p.name:"?")}</span><b>${n}</b></div>`}).join("");
 if(!rows.length){$("lgBody").innerHTML=`<tr><td colspan="${N}" class="lg-empty">${tr("No hay publicaciones en estas fechas.")}</td></tr>`;return}
 let html="",day="";const L=LOC();
 for(const r of rows){const d=dkey(r.at);if(d!=day){day=d;const n=rows.filter(x=>dkey(x.at)==d).length;
   html+=`<tr class="dh"><td colspan="${N}"><span>${cap(new Date(r.at).toLocaleDateString(L,{weekday:"long",day:"numeric",month:"long"}))}</span><em>${n}</em></td></tr>`}
  const p=profOf(r.by);
  html+=`<tr data-id="${r.id}" data-m="${r.m}">
${has("d")?`<td><input type="date" data-k="d" value="${d}"></td>`:`<input type="hidden" data-k="d" value="${d}">`}
<td><input type="time" data-k="t" value="${tkey(r.at)}"></td>
<td><div class="lg-who"><span class="av" style="--c:${p?p.color:"#9a9da5"}">${esc(ini(p&&p.name))}</span><select data-k="by">${PROFILES.map(x=>opt(x.id,x.name,x.id==r.by)).join("")}${p?"":opt(r.by,"?",true)}</select></div></td>
<td class="lg-ti"><input type="text" data-k="title" value="${esc(r.title)}" placeholder="${tr("Titular")}">${r.link?`<a href="${esc(r.link)}" target="_blank" rel="noopener" title="${tr("Abrir noticia")}" aria-label="${tr("Abrir noticia")}"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg></a>`:""}</td>
<td><input type="text" data-k="acc" value="${esc(r.acc)}" list="lgAccs"></td>
<td><select data-k="kind">${["Post + historia","Historia","Post"].map(k=>opt(k,tr(k),k==r.kind)).join("")}</select></td>
${has("note")?`<td><input type="text" data-k="note" value="${esc(r.note||"")}" placeholder="—"></td>`:""}
<td><button class="lg-del" type="button" title="${tr("Borrar fila")}" aria-label="${tr("Borrar fila")}">×</button></td></tr>`}
 $("lgBody").innerHTML=html}

// edición tipo Excel: se guarda al cambiar cada celda
$("lgBody").addEventListener("focusin",()=>editing++);
$("lgBody").addEventListener("focusout",()=>setTimeout(()=>{editing=Math.max(0,editing-1)},0));
$("lgBody").addEventListener("change",async e=>{const el=e.target,tr_=el.closest("tr[data-id]");if(!tr_)return;const k=el.dataset.k,id=tr_.dataset.id,m=tr_.dataset.m;let patch;
 if(k=="d"||k=="t"){const d=tr_.querySelector('[data-k=d]').value,t=tr_.querySelector('[data-k=t]').value||"00:00";if(!d)return;patch={at:new Date(`${d}T${t}`).getTime()}}
 else patch={[k]:el.value};
 el.classList.add("saving");try{await post({type:"update",m,id,patch});el.classList.remove("saving");el.classList.add("saved");setTimeout(()=>el.classList.remove("saved"),900);
  if(k=="by"){const p=profOf(el.value);tr_.querySelector(".av").style.setProperty("--c",p?p.color:"#9a9da5");tr_.querySelector(".av").textContent=ini(p&&p.name)}
  if(k=="d"||k=="t"||k=="by"){editing=0;load()}}catch(err){el.classList.remove("saving");toast(err.message)}});
$("lgBody").addEventListener("keydown",e=>{if(e.key=="Enter"&&e.target.matches("input")){e.preventDefault();e.target.blur()}});
$("lgBody").addEventListener("click",async e=>{const b=e.target.closest(".lg-del");if(!b)return;
 if(!b.classList.contains("sure")){b.classList.add("sure");b.textContent=tr("¿Borrar?");setTimeout(()=>{b.classList.remove("sure");b.textContent="×"},2500);return}
 const tr_=b.closest("tr");tr_.classList.add("gone");try{await post({type:"delete",m:tr_.dataset.m,id:tr_.dataset.id});toast("Fila borrada");load()}catch(err){tr_.classList.remove("gone");toast(err.message)}});
$("lgAdd").onclick=async()=>{if(!ME)return;const[s,e]=bounds();let at=Date.now();if(at<s||at>=e)at=s+12*36e5;
 try{await post({type:"add",row:{by:ME,at,title:"",acc:"",kind:"Post + historia"}});await load();const f=$("lgBody").querySelector('tr[data-id] [data-k=title]');if(f)f.focus()}catch(err){toast(err.message)}};
$("lgExp").onclick=()=>{const rows=rowsIn().slice().reverse(),q=v=>`"${String(v??"").replace(/"/g,'""')}"`;
 const lines=[["Fecha","Hora","Persona","Publicación","Enlace","Cuenta","Formato","Notas"].map(q).join(";")].concat(rows.map(r=>{const p=profOf(r.by);return[new Date(r.at).toLocaleDateString("es-ES"),tkey(r.at),p?p.name:"?",r.title,r.link,r.acc,r.kind,r.note||""].map(q).join(";")}));
 const b=new Blob(["﻿"+lines.join("\r\n")],{type:"text/csv;charset=utf-8"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=`registro_${dkey(bounds()[0])}_${range}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)};
$("lgRange").onclick=e=>{const b=e.target.closest("button");if(!b)return;range=b.dataset.v;[...$("lgRange").children].forEach(x=>x.classList.toggle("on",x==b));load()};
const shift=dir=>{const d=new Date(anchor);if(range=="day")d.setDate(d.getDate()+dir);else if(range=="week")d.setDate(d.getDate()+7*dir);else d.setMonth(d.getMonth()+dir);anchor=+d;load()};
$("lgPrev").onclick=()=>shift(-1);$("lgNext").onclick=()=>shift(1);$("lgToday").onclick=()=>{anchor=Date.now();load()};
$("lgPick").onchange=e=>{if(e.target.value){anchor=new Date(e.target.value+"T12:00").getTime();load()}};
$("lgWho").onchange=draw;$("lgQ").oninput=draw;
$("lgAccs").innerHTML=["General",...ACC.map(a=>a[1])].map(n=>`<option value="${esc(n)}">`).join("");

// --- pestañas Estudio / Registro ---
function tab(t){open=t=="log";document.body.classList.toggle("logmode",open);view.classList.toggle("hide",!open);
 document.querySelectorAll("#tabs button").forEach(b=>{b.classList.toggle("on",b.dataset.tab==t);b.setAttribute("aria-selected",b.dataset.tab==t)});
 clearInterval(timer);if(open){load();timer=setInterval(()=>{if(!document.hidden)load()},8000)}try{sessionStorage.setItem("cs_tab",t)}catch{}}
$("tabs").onclick=e=>{const b=e.target.closest("button");if(b)tab(b.dataset.tab)};
try{if(sessionStorage.getItem("cs_tab")=="log")tab("log")}catch{}
})();
