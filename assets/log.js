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
 return{aid:idOf(link),link,title:isCur?($("title").value||it?.title||""):(it?.title||""),acc:accName(acc),kind:window.nextKind||(isCur&&$("mode").value=="story"?"Historia":"Post + historia")}}
window.logMeta=l=>{try{return infoOf(l)}catch{return{}}finally{window.nextKind=null}};
{const _sm=window.setMark;window.setMark=async(l,on)=>{await _sm(l,on);if(open)load()};}
{const _ap=apply;apply=j=>{_ap(j);if(open&&j&&!j.same)setTimeout(load,150)};}

// --- vista ---
let open=false,range="week",anchor=Date.now(),DATA={},timer=0;const busy=()=>{const a=document.activeElement;return!!a&&$("lgBody").contains(a)&&a.matches("input[type=text]")};
const view=$("logv");
function bounds(){const a=new Date(anchor);a.setHours(0,0,0,0);let s=new Date(a),e;
 if(range=="day")e=new Date(+s+864e5);
 else if(range=="week"){s.setDate(s.getDate()-((s.getDay()+6)%7));e=new Date(s);e.setDate(e.getDate()+7)}
 else{s.setDate(1);e=new Date(s);e.setMonth(e.getMonth()+1)}
 return[+s,+e]}
function months(){const[s,e]=bounds(),out=new Set();for(let t=s;t<e;t+=864e5)out.add(mkey(t));return[...out]}
async function load(){const ms=months();try{const r=await fetch("/api/log?m="+ms.join(",")+"&t="+Date.now(),{cache:"no-store"});if(!r.ok)throw 0;const j=await r.json();for(const m in j)DATA[m]=j[m].rows||[];backfill();prune();if(!busy())draw()}catch{$("lgBody").innerHTML=`<tr><td colspan="8" class="lg-empty">${tr("No se pudo cargar el registro. Reintentando…")}</td></tr>`}}
const done=new Set(),pruned=new Set();
// filas automáticas cuya noticia ya no está marcada: se quitan solas
function prune(){if(!STV)return;const lim=Date.now()-864e5*28;
 for(const r of Object.values(DATA).flat()){if(!r.aid||MARKS[r.aid]||r.at<lim||pruned.has(r.aid))continue;pruned.add(r.aid);
  for(const m in DATA)DATA[m]=DATA[m].filter(x=>x.aid!=r.aid);post({type:"removeAid",aid:r.aid}).catch(()=>pruned.delete(r.aid))}}
function backfill(){const[s,e]=bounds();const have=new Set(Object.values(DATA).flat().map(r=>r.aid));
 for(const id in MARKS){const m=MARKS[id];if(!m.at||m.at<s||m.at>=e||have.has(+id)||done.has(id))continue;const it=ITEMS.find(x=>idOf(x.link)==id);if(!it)continue;done.add(id);
  post({type:"add",keep:true,row:{...infoOf(it.link),by:m.by,at:m.at}}).then(()=>setTimeout(load,300)).catch(()=>{})}}
function rowsIn(){const[s,e]=bounds(),who=$("lgWho").value,ac=$("lgAcc").value.toLowerCase(),q=$("lgQ").value.trim().toLowerCase();
 return Object.entries(DATA).flatMap(([m,rs])=>rs.map(r=>({...r,m}))).filter(r=>r.at>=s&&r.at<e&&(!who||r.by==who)&&(!ac||(r.acc||"").toLowerCase()==ac)&&(!q||(r.title+" "+r.acc+" "+r.note).toLowerCase().includes(q))).sort((a,b)=>b.at-a.at)}
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
 const av=$("lgAcc").value,accs=[...new Set(["General",...ACC.map(a=>a[1]),...Object.values(DATA).flat().map(r=>r.acc).filter(Boolean)])];
 $("lgAcc").innerHTML=opt("",tr("Todas las localidades"),!av)+accs.map(a=>opt(a,a,a==av)).join("");
 const nP=rows.filter(r=>/Post/.test(r.kind)).length,nH=rows.filter(r=>/istoria/.test(r.kind)).length;
 const cnt={};rows.forEach(r=>cnt[r.by]=(cnt[r.by]||0)+1);
 $("lgSum").innerHTML=`<div class="lg-tot"><b>${rows.length}</b><span>${tr(rows.length==1?"publicación":"publicaciones")}${av?" · "+esc(av):""}</span></div><div class="lg-kinds"><span><b>${nP}</b> ${tr(nP==1?"post":"posts")}</span><span><b>${nH}</b> ${tr(nH==1?"historia":"historias")}</span></div>`+
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
$("lgBody").addEventListener("change",async e=>{const el=e.target,tr_=el.closest("tr[data-id]");if(!tr_)return;const k=el.dataset.k,id=tr_.dataset.id,m=tr_.dataset.m;let patch;
 if(k=="d"||k=="t"){const d=tr_.querySelector('[data-k=d]').value,t=tr_.querySelector('[data-k=t]').value||"00:00";if(!d)return;patch={at:new Date(`${d}T${t}`).getTime()}}
 else patch={[k]:el.value};
 el.classList.add("saving");try{await post({type:"update",m,id,patch});el.classList.remove("saving");el.classList.add("saved");setTimeout(()=>el.classList.remove("saved"),900);
  if(k=="by"){const p=profOf(el.value);tr_.querySelector(".av").style.setProperty("--c",p?p.color:"#9a9da5");tr_.querySelector(".av").textContent=ini(p&&p.name)}
  if(k=="d"||k=="t"||k=="by")load()}catch(err){el.classList.remove("saving");toast(err.message)}});
$("lgBody").addEventListener("keydown",e=>{if(e.key=="Enter"&&e.target.matches("input")){e.preventDefault();e.target.blur()}});
$("lgBody").addEventListener("click",async e=>{const b=e.target.closest(".lg-del");if(!b)return;
 if(!b.classList.contains("sure")){b.classList.add("sure");b.textContent=tr("¿Borrar?");setTimeout(()=>{b.classList.remove("sure");b.textContent="×"},2500);return}
 const tr_=b.closest("tr");tr_.classList.add("gone");const row=(DATA[tr_.dataset.m]||[]).find(x=>x.id==tr_.dataset.id);try{if(row&&row.aid&&MARKS[row.aid]&&row.link){await setMark(row.link,false);return}await post({type:"delete",m:tr_.dataset.m,id:tr_.dataset.id});toast("Fila borrada");load()}catch(err){tr_.classList.remove("gone");toast(err.message)}});
$("lgAdd").onclick=async()=>{if(!ME)return;const[s,e]=bounds();let at=Date.now();if(at<s||at>=e)at=s+12*36e5;
 try{await post({type:"add",row:{by:ME,at,title:"",acc:"",kind:"Post + historia"}});await load();const f=$("lgBody").querySelector('tr[data-id] [data-k=title]');if(f)f.focus()}catch(err){toast(err.message)}};
// --- exportación a Excel (.xlsx con estilo) ---
let XL=null;const loadXL=()=>XL||(XL=new Promise((ok,ko)=>{const sc=document.createElement("script");sc.src="https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js";sc.onload=()=>ok(window.ExcelJS);sc.onerror=()=>{XL=null;ko(new Error("No se pudo preparar el Excel"))};document.head.appendChild(sc)}));
const hx=c=>"FF"+String(c||"#9a9da5").replace("#","").toUpperCase();
const tint=(c,a)=>{const h=String(c||"#9a9da5").replace("#",""),v=[0,2,4].map(i=>Math.round(parseInt(h.slice(i,i+2),16)*a+255*(1-a)));return"FF"+v.map(x=>x.toString(16).padStart(2,"0")).join("").toUpperCase()};
$("lgExp").onclick=async()=>{const btn=$("lgExp"),o=btn.textContent;btn.disabled=true;btn.textContent=tr("Preparando…");
 try{const EX=await loadXL(),rows=rowsIn().slice().reverse(),wb=new EX.Workbook();wb.creator="Ciutat Studio";
  const PINK="FFE5007E",INK="FF17181C",GREY="FFF2F3F5",LINE="FFE2E3E8",MUT="FF6B6E76",F="Calibri";
  const thin={style:"thin",color:{argb:LINE}},box={top:thin,left:thin,bottom:thin,right:thin};
  const who=$("lgWho").value,acc=$("lgAcc").value,filt=[who&&profOf(who)?.name,acc].filter(Boolean).join(" · ");
  const nP=rows.filter(r=>/Post/.test(r.kind)).length,nH=rows.filter(r=>/istoria/.test(r.kind)).length;
  const ws=wb.addWorksheet("Registro",{views:[{state:"frozen",ySplit:7,showGridLines:false}],properties:{defaultRowHeight:22}});
  ws.columns=[{width:13},{width:8},{width:16},{width:62},{width:18},{width:17},{width:28}];
  ws.mergeCells("A1:G1");const t=ws.getCell("A1");t.value="Registro de publicaciones · La Ciutat";t.font={name:F,size:18,bold:true,color:{argb:"FFFFFFFF"}};t.fill={type:"pattern",pattern:"solid",fgColor:{argb:PINK}};t.alignment={vertical:"middle",indent:1};ws.getRow(1).height=38;
  ws.mergeCells("A2:G2");const st=ws.getCell("A2");st.value=cap(label())+(filt?"   ·   "+filt:"");st.font={name:F,size:11,color:{argb:MUT}};st.alignment={vertical:"middle",indent:1};ws.getRow(2).height=22;
  const kp=[["Publicaciones",rows.length],["Posts",nP],["Historias",nH]];
  kp.forEach(([k,v],i)=>{const c1=ws.getCell(4,1+i*2),c2=ws.getCell(5,1+i*2);c1.value=k;c1.font={name:F,size:9,bold:true,color:{argb:MUT}};c2.value=v;c2.font={name:F,size:20,bold:true,color:{argb:i?INK:PINK}};c2.alignment={horizontal:"left"}});
  ws.getRow(5).height=30;
  const H=["Fecha","Hora","Persona","Publicación","Localidad","Formato","Notas"],hr=ws.getRow(7);hr.values=H;hr.height=26;
  hr.eachCell(c=>{c.font={name:F,size:10,bold:true,color:{argb:"FFFFFFFF"}};c.fill={type:"pattern",pattern:"solid",fgColor:{argb:INK}};c.alignment={vertical:"middle",indent:1};c.border=box});
  let day="",n=8;
  for(const r of rows.slice().reverse().reverse()){const d=dkey(r.at);
   if(d!=day){day=d;const k=rows.filter(x=>dkey(x.at)==d).length;ws.mergeCells(n,1,n,7);const c=ws.getCell(n,1);c.value=`${cap(new Date(r.at).toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long",year:"numeric"}))}   ·   ${k} ${k==1?"publicación":"publicaciones"}`;
    c.font={name:F,size:10,bold:true,color:{argb:INK}};c.fill={type:"pattern",pattern:"solid",fgColor:{argb:GREY}};c.alignment={vertical:"middle",indent:1};ws.getRow(n).height=24;n++}
   const p=profOf(r.by),row=ws.getRow(n);row.values=[new Date(r.at).toLocaleDateString("es-ES"),tkey(r.at),p?p.name:"?",r.link?{text:r.title||r.link,hyperlink:r.link}:r.title,r.acc||"",r.kind,r.note||""];row.height=22;
   row.eachCell({includeEmpty:true},(c,i)=>{c.font={name:F,size:10,color:{argb:INK}};c.alignment={vertical:"middle",indent:1,wrapText:i==4};c.border=box});
   const pc=row.getCell(3);pc.fill={type:"pattern",pattern:"solid",fgColor:{argb:tint(p&&p.color,.16)}};pc.font={name:F,size:10,bold:true,color:{argb:hx(p&&p.color)}};
   if(r.link)row.getCell(4).font={name:F,size:10,color:{argb:INK},underline:false};
   const kc=row.getCell(6);kc.font={name:F,size:10,color:{argb:r.kind=="Historia"?"FF7C3AED":r.kind=="Post"?"FF0E6AB3":PINK},bold:true};
   n++}
  if(!rows.length){ws.mergeCells(8,1,8,7);const c=ws.getCell(8,1);c.value="No hay publicaciones en estas fechas.";c.font={name:F,size:10,italic:true,color:{argb:MUT}};c.alignment={indent:1}}
  ws.autoFilter={from:{row:7,column:1},to:{row:Math.max(7,n-1),column:7}};
  ws.pageSetup={orientation:"landscape",fitToPage:true,fitToWidth:1,fitToHeight:0,margins:{left:.4,right:.4,top:.5,bottom:.5,header:.2,footer:.2}};
  // hoja resumen
  const rs=wb.addWorksheet("Resumen",{views:[{showGridLines:false}]});rs.columns=[{width:28},{width:14},{width:10},{width:12}];
  rs.mergeCells("A1:D1");const rt=rs.getCell("A1");rt.value="Resumen · "+cap(label());rt.font={name:F,size:16,bold:true,color:{argb:"FFFFFFFF"}};rt.fill={type:"pattern",pattern:"solid",fgColor:{argb:PINK}};rt.alignment={vertical:"middle",indent:1};rs.getRow(1).height=34;
  let y=3;const table=(title,groups,colorOf)=>{const h=rs.getRow(y);h.values=[title,"Publicaciones","Posts","Historias"];h.height=24;h.eachCell(c=>{c.font={name:F,size:10,bold:true,color:{argb:"FFFFFFFF"}};c.fill={type:"pattern",pattern:"solid",fgColor:{argb:INK}};c.alignment={vertical:"middle",indent:1};c.border=box});y++;
   for(const[k,list]of groups){const r=rs.getRow(y);r.values=[k,list.length,list.filter(x=>/Post/.test(x.kind)).length,list.filter(x=>/istoria/.test(x.kind)).length];r.height=22;
    r.eachCell(c=>{c.font={name:F,size:10,color:{argb:INK}};c.alignment={vertical:"middle",indent:1};c.border=box});const col=colorOf&&colorOf(k);if(col){r.getCell(1).fill={type:"pattern",pattern:"solid",fgColor:{argb:tint(col,.16)}};r.getCell(1).font={name:F,size:10,bold:true,color:{argb:hx(col)}}}y++}
   const tot=rs.getRow(y);tot.values=["Total",rows.length,nP,nH];tot.eachCell(c=>{c.font={name:F,size:10,bold:true,color:{argb:INK}};c.fill={type:"pattern",pattern:"solid",fgColor:{argb:GREY}};c.alignment={vertical:"middle",indent:1};c.border=box});tot.height=22;y+=3};
  const grp=f=>{const m=new Map();rows.forEach(r=>{const k=f(r);m.set(k,[...(m.get(k)||[]),r])});return[...m].sort((a,b)=>b[1].length-a[1].length)};
  table("Persona",grp(r=>profOf(r.by)?.name||"?"),k=>PROFILES.find(p=>p.name==k)?.color);
  table("Localidad",grp(r=>r.acc||"Sin localidad"),k=>(ACC.find(a=>a[1]==k)||[])[2]);
  const buf=await wb.xlsx.writeBuffer(),bl=new Blob([buf],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),a=document.createElement("a");
  a.href=URL.createObjectURL(bl);a.download=`registro_laciutat_${dkey(bounds()[0])}${acc?"_"+acc.toLowerCase().replace(/[^a-z0-9]+/g,"-"):""}.xlsx`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),3000);toast("Excel descargado")}
 catch(e){toast(e.message||"No se pudo exportar")}finally{btn.disabled=false;btn.textContent=o}};
$("lgRange").onclick=e=>{const b=e.target.closest("button");if(!b)return;range=b.dataset.v;[...$("lgRange").children].forEach(x=>x.classList.toggle("on",x==b));load()};
const shift=dir=>{const d=new Date(anchor);if(range=="day")d.setDate(d.getDate()+dir);else if(range=="week")d.setDate(d.getDate()+7*dir);else d.setMonth(d.getMonth()+dir);anchor=+d;load()};
$("lgPrev").onclick=()=>shift(-1);$("lgNext").onclick=()=>shift(1);$("lgToday").onclick=()=>{anchor=Date.now();load()};
$("lgPick").onchange=e=>{if(e.target.value){anchor=new Date(e.target.value+"T12:00").getTime();load()}};
$("lgWho").onchange=draw;$("lgAcc").onchange=draw;$("lgQ").oninput=draw;
$("lgAccs").innerHTML=["General",...ACC.map(a=>a[1])].map(n=>`<option value="${esc(n)}">`).join("");

// --- pestañas Estudio / Registro ---
function tab(t){open=t=="log";document.body.classList.toggle("logmode",t!="studio");document.body.classList.toggle("notesmode",t=="notes");view.classList.toggle("hide",!open);$("notesv").classList.toggle("hide",t!="notes");if(t=="notes"&&window.onNotesTab)setTimeout(onNotesTab,0);
 document.querySelectorAll("#tabs button").forEach(b=>{b.classList.toggle("on",b.dataset.tab==t);b.setAttribute("aria-selected",b.dataset.tab==t)});
 clearInterval(timer);if(open){load();timer=setInterval(()=>{if(!document.hidden)load()},20000)}try{sessionStorage.setItem("cs_tab",t)}catch{}}
$("tabs").onclick=e=>{const b=e.target.closest("button");if(b)tab(b.dataset.tab)};
try{const t=sessionStorage.getItem("cs_tab");if(t&&t!="studio")setTimeout(()=>tab(t),0)}catch{}
})();
