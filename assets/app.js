
const GLYPH=`<path d="M45.4446 44.386C44.1123 44.386 43.0117 43.9836 42.2008 43.1211C41.3319 42.2587 40.9264 41.2813 40.9264 40.1314C40.9264 38.924 41.3319 37.9466 42.2008 37.1417C43.0697 36.3368 44.1123 35.9343 45.4446 35.9343C46.7769 35.9343 47.8775 36.3368 48.7464 37.1417C49.5574 37.9466 50.0208 38.924 50.0208 40.1314C50.0208 41.3388 49.6153 42.3162 48.7464 43.1211C47.8775 43.9836 46.7769 44.386 45.4446 44.386ZM42.4904 32.6571L41.0422 11.2115H49.847L48.3989 32.6571H42.4904Z" fill="white"/><path d="M7.09753 27.885C7.09753 17.9384 14.6859 11.2115 23.6644 11.2115C33.2802 11.2115 37.5667 17.3634 38.6094 21.963L31.89 24.0903C31.3686 21.9055 29.3412 18.1684 23.7224 18.1684C19.4358 18.1684 14.57 21.2156 14.57 27.9425C14.57 33.922 19.0303 37.3717 23.7803 37.3717C29.3412 37.3717 31.5424 33.692 32.1796 31.3922L39.0149 33.347C37.9722 37.7166 33.7436 44.501 23.7803 44.501C14.5121 44.386 7.09753 37.8316 7.09753 27.885Z" fill="white"/>`,CIRCLE="M58.4202 28C58.4202 43.4661 45.7922 56 30.2101 56C14.6279 56 2 43.4661 2 28C2 12.5339 14.6279 0 30.2101 0C45.7922 0 58.4202 12.5339 58.4202 28Z";
const ACC=[["tarragona","Tarragona","#E5007E"],["reus","Reus","#0E6AB3"],["vilaseca","Vila-seca","#CAB22A"],["cambrils","Cambrils","#42C0F0"],["salou","Salou","#333280"],["ebre","Terres de l'Ebre","#E14536"],["lleida","Lleida","#4C9B42"],["girona","Girona","#D89220"],["penedes","Penedès","#6D3F0E"],["garraf","Garraf","#1C8D87"],["catalunyacentral","Catalunya Central","#B57CB1"],["andorra","Andorra",null],["barcelona","Barcelona","#961A7A"],["general","General (@diarilaciutat)","#030406"]];
const $=id=>document.getElementById(id);
ACC.forEach(([k,n])=>$("acc").add(new Option(n,k)));
const SPEC={post:{W:1080,H:1440,bb:1223,bt:896,pcx:81,pt:886,pk:1,lx:132,lct:925,ls:40,tx:86,tb:1028,ts:51,tp:68,tw:975,wr:1059,wct:1363,ws:29,wt:4,ll:912,lt:47.5,ld:120},
 story:{W:1080,H:1920,bb:1583,bt:1266,pcx:102,pt:1257,pk:.93,lx:151,lct:1293,ls:40,tx:106,tb:1394,ts:47,tp:66,tw:905,wr:1054,wct:1544,ws:29,wt:3.5,ll:902,lt:37,ld:138}};
let photo=null,data=null;
const F=s=>`700 ${s}px Montserrat`;
function wrap(c,t,w){const o=[];let cur="";for(const x of t.split(/\s+/)){const n=(cur+" "+x).trim();if(c.measureText(n).width<=w||!cur)cur=n;else{o.push(cur);cur=x}}o.push(cur);return o}
function logoImg(k){const a=ACC.find(x=>x[0]==k);const bg=a[2]?`<path d="${CIRCLE}" fill="${a[2]}"/>`:`<defs><clipPath id="c"><path d="${CIRCLE}"/></clipPath></defs><g clip-path="url(#c)"><rect width="20.8" height="56" fill="#263286"/><rect x="20.8" width="18.8" height="56" fill="#FDCA31"/><rect x="39.6" width="20" height="56" fill="#D30E3B"/></g>`;
 const s=`<svg xmlns="http://www.w3.org/2000/svg" width="590" height="560" viewBox="0 0 59 56">${bg}${GLYPH}</svg>`;
 return new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(s)})}
const PROF=[[0,1],[.49,.91],[.6,.836],[.818,.69],[1.036,.545],[1.255,.4],[1.473,.2],[1.582,.127],[1.69,0]];
function pinPath(c,cx,top,k){const R=24.2*k,cy=top+R;c.beginPath();c.arc(cx,cy,R,0,2*Math.PI);c.moveTo(cx+R,cy);
 PROF.forEach(([y,w])=>c.lineTo(cx+w*R,cy+y*R));for(let i=PROF.length-1;i>=0;i--)c.lineTo(cx-PROF[i][1]*R,cy+PROF[i][0]*R);c.closePath()}
function drawPin(ctx,cx,top,k){const R=24.2*k,cy=top+R,o=document.createElement("canvas");o.width=ctx.canvas.width;o.height=ctx.canvas.height;const c=o.getContext("2d");
 c.fillStyle="#000";c.beginPath();c.ellipse(cx,cy+1.87*R,1.073*R,.31*R,0,0,2*Math.PI);c.fill();
 c.globalCompositeOperation="destination-out";pinPath(c,cx,top,k);c.lineWidth=.22*R;c.lineJoin="round";c.stroke();c.fill();
 c.globalCompositeOperation="source-over";c.fillStyle="rgb(242,28,28)";pinPath(c,cx,top,k);c.fill();
 c.globalCompositeOperation="destination-out";c.beginPath();c.arc(cx,cy-.05*R,.465*R,0,2*Math.PI);c.fill();ctx.drawImage(o,0,0)}
// Variantes por cuenta (medidas de las plantillas de cada ciudad)
const FRAME=["barcelona","penedes","cambrils","garraf","vilaseca","ebre","reus"];
const VAR={andorra:{post:{noLoc:1,bt:952,bb:1235,tx:68,tb:1050,ts:55,tp:75.5,tw:940,wr:1048,wct:1356,ws:29,wt:3.5,ll:938,lt:49,ld:115,web:"LACIUTAT.AD"},story:{noLoc:1,bt:1302,web:"LACIUTAT.AD"}}};

// La franja oscura NO se mueve ni cambia de tamaño: el titular se adapta (tamaño e interlineado) para caber en 3 líneas
function fitTitle(c,txt,s){const base=s.ts,bp=s.tp,H=2*bp;
 {for(let z=Math.round(base*1.15);z>base;z--){c.font=F(z);const l=wrap(c,txt,s.tw);if(l.length<=2){const p=Math.round(bp*z/base*10)/10;return {size:z,pitch:p,lines:l,dy:H/2-(l.length-1)*p/2}}}}
 for(let z=base;z>=Math.round(base*.74);z--){c.font=F(z);const l=wrap(c,txt,s.tw);if(l.length<=3){const p=Math.round(bp*z/base*10)/10;return {size:z,pitch:p,lines:l,dy:0}}}
 for(let z=Math.round(base*.74);z>=24;z--){c.font=F(z);const l=wrap(c,txt,s.tw);const p=Math.min(bp*z/base*1.02,H/(l.length-1));if(p>=z*1.08)return {size:z,pitch:p,lines:l}}
 c.font=F(24);const l=wrap(c,txt,s.tw);return {size:24,pitch:H/Math.max(1,l.length-1),lines:l}}
async function render(kind,cv,opt={}){const acc=curAcc(),s=Object.assign({},SPEC[kind],VAR[acc]?.[kind]),c=cv.getContext("2d"),fx=+$("fx").value;
 const sc=Math.max(s.W/photo.width,s.H/photo.height),w=photo.width*sc,h=photo.height*sc;
 const left=Math.min(Math.max(0,fx*w-s.W/2),w-s.W),top=Math.max(0,(h-s.H)/2);
 c.imageSmoothingQuality="high";c.drawImage(photo,-left,-top,w,h);
 let lines,ex=0;const txt=$("title").value.trim();
 if($("fitBig").checked){const ft=fitTitle(c,txt,s),yref=s.tb+(2*s.tp-.53*s.ts)/2;s.ts=ft.size;s.tp=ft.pitch;lines=ft.lines;
  s.tb=Math.round(yref-((lines.length-1)*s.tp-.53*s.ts)/2)}  // centro visual igual al de la plantilla con 3 líneas
 else{c.font=F(s.ts);lines=wrap(c,txt,s.tw);ex=(lines.length-3)*s.tp}
 c.fillStyle="rgba(0,0,0,.58)";c.fillRect(0,s.bt-ex,s.W,s.bb-(s.bt-ex));
 if(!s.noLoc)drawPin(c,s.pcx,s.pt-ex,s.pk);
 c.fillStyle="#fff";c.textBaseline="alphabetic";
 if(!s.noLoc){c.font=F(s.ls);c.fillText($("loc").value.toUpperCase(),s.lx,s.lct-ex+.7*s.ls)}
 TT[kind]={lines,s,ex};if(!opt.noTitle)drawTitle(c,kind,0,1);c.fillStyle="#fff";
 c.font=F(s.ws);const W=s.web||"LACIUTAT.CAT";let tw=[...W].reduce((a,ch)=>a+c.measureText(ch).width,0)+s.wt*(W.length-1),x=s.wr-tw;
 for(const ch of W){c.fillText(ch,x,s.wct+.7*s.ws);x+=c.measureText(ch).width+s.wt}
 const fr=$("frame").value;if(kind=="story"&&(fr=="si"||(fr=="auto"&&FRAME.includes(acc)))){c.beginPath();c.roundRect(258.5,1640.5,563,127,30);c.fillStyle="#fff";c.fill();c.lineWidth=9;c.strokeStyle="#000";c.stroke()}
 const lg=await logoImg(acc);c.drawImage(lg,s.ll-2*s.ld/56,s.lt,s.ld*59/56,s.ld)}
const GEN={catalunya:"Catalunya",espanya:"Espanya",mon:"Món",internacional:"Món"};
const ED={laciutatdetarragona:["tarragona","Tarragona",["Reus","Vila-seca","Cambrils","Salou","Valls","Montblanc","Falset","La Canonja","El Morell","Torredembarra","Altafulla","Constantí","Riudoms","Mont-roig","L'Hospitalet de l'Infant","La Pobla de Mafumet","Vilallonga","La Selva del Camp","Alcover","La Pineda","Creixell","Roda de Berà","Riudecanyes","Botarell","Tarragona"]],
 "laciutat-terres-de-lebre":["ebre","Terres de l'Ebre",["Tortosa","Amposta","Deltebre","L'Ametlla de Mar","Sant Carles de la Ràpita","Móra d'Ebre","Gandesa"]],
 laciutatdelleida:["lleida","Lleida",["Balaguer","Tàrrega","Mollerussa","Lleida"]],laciutatdegirona:["girona","Girona",["Figueres","Blanes","Lloret de Mar","Olot","Girona"]],
 laciutatdelpenedesgarraf:["penedes","Penedès",["El Vendrell","Calafell","Cunit","Vilafranca del Penedès","Sant Sadurní d'Anoia","Sitges","Vilanova i la Geltrú","Sant Pere de Ribes"]],
 "laciutat-de-catalunya-central":["catalunyacentral","Catalunya Central",["Manresa","Igualada","Solsona","Vic"]],laciutatandorra:["andorra","Andorra",["Andorra la Vella","Escaldes-Engordany","Encamp","La Massana","Ordino","Canillo","Sant Julià de Lòria"]],
 laciutatdebarcelona:["barcelona","Barcelona",["L'Hospitalet de Llobregat","Cornellà de Llobregat","El Prat de Llobregat","Sabadell","Granollers","Badalona","Santa Coloma de Gramenet","Sant Boi de Llobregat","Viladecans","Gavà","Barcelona"]]};
const ACC_OF_PLACE={"Reus":"reus","Vila-seca":"vilaseca","La Pineda":"vilaseca","Cambrils":"cambrils","Salou":"salou","Sitges":"garraf","Vilanova i la Geltrú":"garraf","Sant Pere de Ribes":"garraf","Balaguer":"lleida","Tremp":"lleida","La Seu d'Urgell":"lleida"};
function firstPlace(list,txt){let best=null,bi=1e9;for(const p of list){const m=new RegExp("(^|[^\\p{L}])"+p.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"(?![\\p{L}])","iu").exec(txt);if(m&&m.index<bi){bi=m.index;best=p}}return best}
function guess(path,title,sub){const seg=path.replace(/^\/(es|ca)\//,"/").split("/").filter(Boolean),root=seg[0]||"",subsec=seg.length>2?seg[1]:"";
 if(GEN[root])return {acc:"general",loc:GEN[root]};
 const ed=ED[root];if(!ed)return {acc:"general",loc:firstPlace(["Tarragona","Reus","Barcelona","Lleida","Girona","Andorra"],title+" "+sub)||"Catalunya"};
 if(root=="laciutatdelleida"&&/pirineus|seu|tremp/.test(subsec))return {acc:"lleida",loc:{"la-seu-durgell":"La Seu d'Urgell",tremp:"Tremp"}[subsec]||"Pirineus"};
 const loc=firstPlace(ed[2],title)||firstPlace(ed[2],sub)||ed[1];let acc=ACC_OF_PLACE[loc]||ed[0];
 if(root=="laciutatdelpenedesgarraf"&&/garraf|sitges|vilanova|ribes/.test(subsec))acc="garraf";
 return {acc,loc}}

// 1) servidor propio (/api/article). 2) si no existe (hosting estático), lectura directa vía proxy público.
const PAGE=[u=>fetch("https://r.jina.ai/"+u,{headers:{"X-Respond-With":"html"}}),u=>fetch("https://api.allorigins.win/raw?url="+encodeURIComponent(u))];
const IMG=[u=>fetch("https://images.weserv.nl/?url="+encodeURIComponent(u)),u=>fetch("https://api.allorigins.win/raw?url="+encodeURIComponent(u))];
async function viaProxy(u,blob){for(const f of (blob?IMG:PAGE)){try{const r=await f(u);if(r.ok)return blob?await r.blob():await r.text()}catch(e){}}throw new Error("No se pudo leer laciutat.cat, prueba otra vez")}
const toDataURL=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(b)});
async function getArticle(u){let url;try{url=new URL(u)}catch{throw new Error("Enlace no válido")}
 if(!/(^|\.)laciutat\.cat$/.test(url.hostname))throw new Error("Solo enlaces de laciutat.cat");
 try{const r=await fetch("/api/article?url="+encodeURIComponent(u));if((r.headers.get("content-type")||"").includes("json")){const j=await r.json();if(!r.ok)throw new Error(j.error);return j}}catch(e){if(e.message&&!/fetch|JSON/i.test(e.message))throw e}
 const d=new DOMParser().parseFromString(await viaProxy(u),"text/html"),m=n=>d.querySelector(`meta[property="${n}"],meta[name="${n}"]`)?.content||"";
 const title=(m("og:title")||d.querySelector("h1")?.textContent||"").trim();
 const sub=(d.querySelector("article h2,h2")?.textContent||m("og:description")).trim();
 const img=m("og:image")||m("twitter:image")||d.querySelector('link[rel="image_src"]')?.href||[...d.querySelectorAll("article img,main img,figure img")].map(i=>i.getAttribute("data-src")||i.getAttribute("src")).find(s=>s&&/\/uploads\//.test(s))||"";let image="";if(img)try{image=await toDataURL(await viaProxy(new URL(img,url).href,true))}catch(e){}
 return {title,sub,image,url:url.href,path:url.pathname}}
const tag=s=>"#"+s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
function copyText(){$("copy").value=`ℹ️  ${$("title").value.trim()}\n\n👉  ${data.sub}\n\n⚫ Continua llegint a l'enllaç de la nostra biografia\n\n${tag($("loc").value)} #noticiescatalunya`}
async function draw(){if(!photo)return;await document.fonts.load(F(40));const st=$("mode").value=="story";
 $("wpost").classList.toggle("hide",st);if(!st)await render("post",$("cpost"));await render("story",$("cstory"));copyText();
 $("res").classList.remove("hide");$("empty").classList.add("hide")}
$("go").onclick=async()=>{$("msg").textContent="";$("go").disabled=true;$("go").textContent="Cargando…";
 try{data=await getArticle($("url").value.trim());
  
  $("title").value=data.title;auto=guess(data.path,data.title,data.sub);$("link").value=data.url;
  if(data.image)await setPhoto(data.image);else{photo=null;$("msg").textContent="No he podido coger la foto: añádela con «Añadir imagen»."}sync();if(photo)await draw()}
 catch(e){$("msg").textContent=e.message||"Error"}finally{$("go").disabled=false;$("go").textContent="Generar"}};
["mode","acc","loc","title","fx"].forEach(id=>$(id).addEventListener(id=="fx"||id=="loc"||id=="title"?"input":"change",draw));
["locAuto","fxAuto"].forEach(id=>$(id).addEventListener("change",()=>{sync();draw()}));
let auto={acc:"tarragona",loc:"Tarragona"},autoFx=.5;
const curAcc=()=>$("acc").value=="auto"?auto.acc:$("acc").value;
function sync(){$("loc").disabled=$("locAuto").checked;if($("locAuto").checked)$("loc").value=auto.loc;$("fx").disabled=$("fxAuto").checked;if($("fxAuto").checked)$("fx").value=autoFx}
// encuadre automático: busca la franja vertical con más detalle (bordes + saturación)
function focus(img){const W=160,H=Math.round(img.height*W/img.width),c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");x.drawImage(img,0,0,W,H);
 const d=x.getImageData(0,0,W,H).data,col=new Float32Array(W);
 for(let y=1;y<H;y++)for(let i=1;i<W;i++){const k=(y*W+i)*4,l=(a)=>d[a]*.3+d[a+1]*.59+d[a+2]*.11;const e=Math.abs(l(k)-l(k-4))+Math.abs(l(k)-l(k-W*4));const mx=Math.max(d[k],d[k+1],d[k+2]),mn=Math.min(d[k],d[k+1],d[k+2]);col[i]+=e+(mx-mn)*.3}
 const best=w=>{let s=0,b=0,bi=0;for(let i=0;i<W;i++){s+=col[i];if(i>=w)s-=col[i-w];if(i>=w-1&&s>b){b=s;bi=i-w+1}}return (bi+w/2)/W};
 const win=Math.round(W*(img.height*1080/1440)/img.width);return Math.min(Math.max(best(Math.max(4,win)),0),1)}
function dl(id,n){$(id).toBlob(b=>{const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=`laciutat_${n}_${Date.now()}.jpg`;a.click()},"image/jpeg",.95)}
function cp(id,b){navigator.clipboard.writeText($(id).value).then(()=>{const o=b.textContent;b.textContent="¡Copiado!";setTimeout(()=>b.textContent=o,1200)})}

async function setPhoto(src){photo=await new Promise((ok,ko)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=ko;i.src=src});autoFx=focus(photo)}
$("file").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;if(!data)data={title:"",sub:"",url:"",path:""};await setPhoto(await toDataURL(f));$("msg").textContent="";sync();await draw()});
document.querySelectorAll(".seg button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".seg button").forEach(x=>x.classList.toggle("on",x==b));$("mode").value=b.dataset.v;draw()});

// ---- Últimos artículos (feed de laciutat.cat) ----
const FEED="https://laciutat.cat/uploads/feeds/feed_laciutat_ca.xml";let ITEMS=[],cur=null;
// Estado compartido del equipo (lo rellena team.js): perfiles y noticias marcadas como hechas
const idOf=l=>+((String(l).match(/_(\d+)_\d+\.html/)||[])[1]||0);
let MARKS={},PROFILES=[];const markOf=l=>MARKS[idOf(l)]||null,profOf=id=>PROFILES.find(p=>p.id==id)||null;
const done={has:l=>!!markOf(l),add:l=>window.setMark&&setMark(l,true),delete:l=>window.setMark&&setMark(l,false)};const saveDone=()=>{};
async function loadFeed(){try{let items;
  try{const r=await fetch("/api/feed?t="+Date.now(),{cache:"no-store"});if((r.headers.get("content-type")||"").includes("json")&&r.ok)items=(await r.json()).items}catch{}
  if(!items){const d=new DOMParser().parseFromString(await viaProxy(FEED+"?t="+Date.now()),"text/xml");
   items=[...d.querySelectorAll("item")].map(i=>({title:i.querySelector("title")?.textContent.trim(),link:i.querySelector("link")?.textContent.trim(),date:i.querySelector("pubDate")?.textContent,sub:(i.querySelector("description")?.textContent||"").trim(),cats:[...i.querySelectorAll("category")].map(c=>c.textContent.trim()),img:i.querySelector("enclosure")?.getAttribute("url")||""}))}
  ITEMS=items.filter(x=>x.link);const eds=[...new Set(ITEMS.map(x=>x.cats[0]).filter(Boolean))].sort();
  const s=$("ed"),v=s.value;s.length=1;eds.forEach(e=>s.add(new Option(e,e)));s.value=v;
  $("upd").textContent="Actualizado "+new Date().toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"});renderFeed()}
 catch(e){$("feed").innerHTML='<p class="mut">No se pudo cargar la lista. Reintentando…</p>'}}
const imgURL=u=>u?"https://images.weserv.nl/?w=140&h=140&fit=cover&url="+encodeURIComponent(u):"";
const esc=s=>(s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function ago(d){const m=Math.round((Date.now()-new Date(d))/6e4);return m<1?"ahora":m<60?m+" min":m<1440?Math.floor(m/60)+" h":new Date(d).toLocaleDateString("es-ES")}
function renderFeed(){const ed=$("ed").value,L=ITEMS.filter(x=>!ed||x.cats[0]==ed);
 $("feed").innerHTML=L.map((x,i)=>`<div class="it${done.has(x.link)?" done":""}${cur==x.link?" cur":""}" data-l="${esc(x.link)}">
  <img loading="lazy" src="${imgURL(x.img)}" alt="">
  <div class="tx"><div class="tl">${esc(x.title)}</div><div class="mt">${ago(x.date)} · ${esc(accLabel(x))}</div></div>${statusHTML(x)}</div>`).join("")||'<p class="mut">Sin artículos</p>'}
function statusHTML(x){const m=markOf(x.link),p=m&&profOf(m.by);
 if(m)return `<button class="who" style="--c:${p?p.color:"#9a95a0"}" data-tip="${esc((p?p.name:"?"))}" aria-label="Hecha por ${esc(p?p.name:"?")}. Pulsa para desmarcar">${esc((p?p.name:"?").trim().charAt(0).toUpperCase())}</button>`;
 return `<button class="mk" aria-label="Marcar como hecha" data-tip="Marcar como hecha"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></button>`}
$("feed").addEventListener("click",async e=>{const it=e.target.closest(".it");if(!it)return;const l=it.dataset.l;
 if(e.target.closest(".mk")){done.add(l);return}if(e.target.closest(".who")){done.delete(l);return}
 await pick(ITEMS.find(x=>x.link==l))});
const SUBACC={"Reus":"reus","Cambrils":"cambrils","Salou":"salou","Vila-seca":"vilaseca","La Seu d'Urgell":"lleida","Pirineus":"lleida","Tremp":"lleida","Vilanova i la Geltrú":"garraf","Sitges":"garraf","Sant Pere de Ribes":"garraf","Garraf":"garraf"};
const NOTPLACE=/^(La Ciutat|Opinió|Política|Cultura|Entrevistes|Catalunya|Espanya|Món|Baix |Alt |Tarragonès|Regió|Parroquies|Nacional|Costa Brava|Penedès|Catalunya Central)/;
function autoOf(x){const path=new URL(x.link).pathname;let g=guess(path,x.title,x.sub);
 const top=x.cats[0]||"";if(/^(Catalunya|Espanya|Món)$/.test(top))g={acc:"general",loc:top};
 else{const sub=x.cats.find((c,i)=>i>0&&!NOTPLACE.test(c));if(sub&&/^La Ciutat/.test(top)){g.loc=sub;if(SUBACC[sub])g.acc=SUBACC[sub]}}
 if(g.acc=="general"&&!/^(Catalunya|Espanya|Món)$/.test(top)){const ed=x.cats.find(c=>EDN[c]);if(ed){g.acc=EDN[ed];g.loc=(ACC.find(a=>a[0]==g.acc)||[])[1]||g.loc}}return g}
const EDN={"La Ciutat de Tarragona":"tarragona","La Ciutat de Barcelona":"barcelona","La Ciutat de Lleida":"lleida","La Ciutat de Girona":"girona","La Ciutat del Penedès-Garraf":"penedes","La Ciutat de les Terres de l'Ebre":"ebre","La Ciutat de Catalunya Central":"catalunyacentral","La Ciutat d'Andorra":"andorra"};
// nombre corto de la cuenta para la lista (p. ej. L'Hospitalet -> Barcelona)
const EDLBL={laciutatdetarragona:"Tarragona",laciutatdebarcelona:"Barcelona",laciutatdelleida:"Lleida",laciutatdegirona:"Girona",laciutatdelpenedesgarraf:"Penedès-Garraf","laciutat-terres-de-lebre":"Terres de l'Ebre","laciutat-de-catalunya-central":"Catalunya Central",laciutatandorra:"Andorra",catalunya:"Catalunya",espanya:"Espanya",mon:"Món",politica:"Política",cultura:"Cultura",entrevistes:"Entrevistes",opinio:"Opinió"};
// en la lista: la edición del enlace (laciutatde…), solo para identificarla
function accLabel(x){try{const seg=new URL(x.link).pathname.split("/").filter(s=>s&&s!="es")[0]||"";return EDLBL[seg]||seg.replace(/^laciutat-?(de-?|del-?|d-?)?/,"").replace(/-/g," ").replace(/^./,c=>c.toUpperCase())}catch{return ""}}
async function pick(x){cur=x.link;renderFeed();$("url").value=x.link;$("msg").textContent="";
 const path=new URL(x.link).pathname;auto=autoOf(x);
 data={title:x.title,sub:x.sub,url:x.link,path};$("title").value=x.title;$("link").value=x.link;
 try{const src=await imageSrc(x.img);if(src)await setPhoto(src);else throw 0}catch{try{const d=await getArticle(x.link);if(d.image)await setPhoto(d.image);else{photo=null;$("msg").textContent="No he podido coger la foto: añádela con «Añadir imagen»."}}catch(e){$("msg").textContent=e.message}}
 sync();if(photo)await draw();renderFeed();
 if(innerWidth<900)$("res").scrollIntoView({behavior:"smooth"})}
async function imageSrc(u){if(!u)return"";try{const r=await fetch("/api/image?url="+encodeURIComponent(u));if(r.ok&&(r.headers.get("content-type")||"").startsWith("image"))return await toDataURL(await r.blob())}catch{}
 return await toDataURL(await viaProxy(u,true))}
$("ed").onchange=renderFeed;$("frame").onchange=draw;
$("reload").onclick=loadFeed;loadFeed();setInterval(()=>loadFeed(),15000);document.addEventListener("visibilitychange",()=>{if(!document.hidden)loadFeed()});


// ---- Ciutat Studio · capa de interfaz ----
setTimeout(()=>{$("intro").classList.add("out");document.body.classList.add("enter");setTimeout(()=>{$("intro").remove();document.body.classList.remove("enter")},750)},2150);
function toast(m){const t=$("toast");t.querySelector("span").textContent=m;t.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("on"),1800)}
const _draw=draw;draw=async(...a)=>{const r=$("res");r.classList.add("busyc");try{return await _draw(...a)}finally{r.classList.remove("busyc");$("htitle").textContent=$("title").value}};
const _dl=dl;dl=(id,n)=>{_dl(id,n);toast(n=="POST"?"Post descargado":"Historia descargada")};
const _cp=cp;cp=(id,b)=>{_cp(id,b);toast(id=="copy"?"Copy copiado":"Enlace copiado")};
new MutationObserver(()=>{const g=$("go");g.classList.toggle("busy",g.disabled)}).observe($("go"),{attributes:true,attributeFilter:["disabled"]});
$("url").addEventListener("keydown",e=>{if(e.key=="Enter")$("go").click()});


// ---- Historia animada (texto + flecha) y exportación a MP4 ----
const TT={},VID={fps:30,frames:173,arrow:{x:88,y:1571,w:180,h:140,n:36}};
function drawTitle(c,kind,dx,a){const T=TT[kind];if(!T)return;const {lines,s,ex}=T;c.save();c.globalAlpha=a;c.fillStyle="#fff";c.textBaseline="alphabetic";c.font=F(s.ts);
 lines.forEach((l,i)=>{const m=c.measureText(l);c.fillText(l,s.tx+m.actualBoundingBoxLeft+dx,s.tb-ex+i*s.tp)});c.restore()}
const ARW=new Image();ARW.src="arrow.png";
const SB=document.createElement("canvas");SB.width=1080;SB.height=1920;
const animOn=()=>$("anim").checked,arrowOn=()=>$("arrowChk").checked&&!frameOn(),isVid=()=>animOn()||arrowOn();
function frameOn(){const f=$("frame").value;return f=="si"||(f=="auto"&&FRAME.includes(curAcc()))}
// fotograma n (30 fps): titular entra desde la izquierda (80 px, ease-out) en 0,5 s; flecha en bucle de 36 fotogramas
function frameAt(c,n){c.drawImage(SB,0,0);
 let dx=0,a=1;if(animOn()){const p=Math.min(1,n/15),e=1-(1-p)*(1-p);dx=-80*(1-e);a=n==0?0:e}
 drawTitle(c,"story",dx,a);
 if(arrowOn()&&ARW.complete){const A=VID.arrow,k=n%A.n;c.drawImage(ARW,k*A.w,0,A.w,A.h,A.x,A.y,A.w,A.h)}}
let loopT0=0,loopOn=false;
function loop(ts){if(!loopOn)return;const c=$("cstory").getContext("2d");if(isVid()&&TT.story){const n=Math.floor((ts-loopT0)/1000*VID.fps)%VID.frames;frameAt(c,n)}requestAnimationFrame(loop)}
async function buildStoryBase(){if(!photo||!TT.story)return;await render("story",SB,{noTitle:true});loopT0=performance.now();prepVideo();
 if(isVid()){if(!loopOn){loopOn=true;requestAnimationFrame(loop)}}else loopOn=false}
let baseQ=0;const _render=render;render=async(k,cv,o)=>{const r=await _render(k,cv,o);if(k=="story"&&cv.id=="cstory"){clearTimeout(baseQ);baseQ=setTimeout(buildStoryBase,30)}return r};
["anim","arrowChk"].forEach(id=>$(id).addEventListener("change",()=>{loopOn=false;draw();$("dlsLabel").textContent=isVid()?"Descargar historia (vídeo)":"Descargar historia"}));
$("dlsLabel").textContent="Descargar historia (vídeo)";
function save(blob,name){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}
let MUX=null;const getMux=()=>MUX||(MUX=import("https://cdn.jsdelivr.net/npm/mp4-muxer@5/+esm"));setTimeout(()=>getMux().catch(()=>MUX=null),2500);
let VCFG=null;async function encCfg(W,H){if(VCFG)return VCFG;
 for(const hw of ["prefer-hardware","no-preference"])for(const codec of ["avc1.640028","avc1.4d0028","avc1.42003e"]){const k={codec,width:W,height:H,bitrate:8e6,framerate:VID.fps,latencyMode:"realtime",hardwareAcceleration:hw,avc:{format:"avc"}};
  try{if((await VideoEncoder.isConfigSupported(k)).supported)return VCFG=k}catch{}}return null}
let VTOK=0,VJOB=null,VPROG=0;
// exporta el vídeo; si cambia algo a mitad (tok), se cancela
async function exportMP4(tok=VTOK,show=true){const W=1080,H=1920,cv=document.createElement("canvas");cv.width=W;cv.height=H;const c=cv.getContext("2d",{willReadFrequently:false}),pr=$("vprog");
 const step=f=>{VPROG=f;if(show){pr.classList.add("on");pr.firstElementChild.style.width=(f*100).toFixed(1)+"%"}};const live=()=>{if(tok!==VTOK)throw new Error("cancel")};
 try{
  if(window.VideoEncoder){const [{Muxer,ArrayBufferTarget},cfg]=await Promise.all([getMux(),encCfg(W,H)]);
   if(cfg){const mux=new Muxer({target:new ArrayBufferTarget(),video:{codec:"avc",width:W,height:H,frameRate:VID.fps},fastStart:"in-memory"});
    let err=null;const enc=new VideoEncoder({output:(ch,m)=>mux.addVideoChunk(ch,m),error:e=>err=e});enc.configure(cfg);
    try{for(let n=0;n<VID.frames;n++){live();frameAt(c,n);const vf=new VideoFrame(cv,{timestamp:Math.round(n*1e6/VID.fps),duration:Math.round(1e6/VID.fps)});enc.encode(vf,{keyFrame:n%90==0});vf.close();
      if(enc.encodeQueueSize>24)await new Promise(r=>enc.addEventListener("dequeue",r,{once:true}));if(n%12==0)step(n/VID.frames);if(err)throw err}
     await enc.flush();}finally{if(enc.state!="closed")enc.close()}
    mux.finalize();step(1);return new Blob([mux.target.buffer],{type:"video/mp4"})}}
  const types=["video/mp4;codecs=avc1","video/mp4","video/webm;codecs=vp9","video/webm"],type=types.find(x=>window.MediaRecorder&&MediaRecorder.isTypeSupported(x));
  if(!type)throw new Error("Este navegador no puede crear vídeo");
  const st=cv.captureStream(VID.fps),rec=new MediaRecorder(st,{mimeType:type,videoBitsPerSecond:8e6}),parts=[];rec.ondataavailable=e=>parts.push(e.data);
  const done=new Promise(r=>rec.onstop=r);frameAt(c,0);rec.start();const t0=performance.now();
  await new Promise((r,j)=>{const tick=()=>{if(tok!==VTOK){j(new Error("cancel"));return}const n=Math.floor((performance.now()-t0)/1000*VID.fps);if(n>=VID.frames){r();return}frameAt(c,n);step(n/VID.frames);requestAnimationFrame(tick)};tick()}).finally(()=>rec.state!="inactive"&&rec.stop());
  await done;return new Blob(parts,{type:type.split(";")[0]})
 }finally{if(show)setTimeout(()=>{pr.classList.remove("on");pr.firstElementChild.style.width="0"},500)}}
// el vídeo se prepara solo en segundo plano en cuanto la historia está lista
function prepVideo(){VTOK++;VJOB=null;VPROG=0;if(!isVid()||!TT.story)return;const tok=VTOK;
 setTimeout(()=>{if(tok!==VTOK)return;const job={tok,p:exportMP4(tok,false)};job.p.catch(()=>{});VJOB=job},350)}
// loader: barra de progreso y botón girando mientras el vídeo termina
async function withLoader(btns,fn){const pr=$("vprog"),bar=pr.firstElementChild,lbl=$("dlsLabel"),old=lbl.textContent,t0=performance.now();let on=true;
 btns.forEach(b=>b&&b.classList.add("loading"));pr.classList.add("on");
 const tick=()=>{if(!on)return;const f=Math.max(VPROG,Math.min(.95,(performance.now()-t0)/2500*.3));bar.style.width=(f*100).toFixed(1)+"%";lbl.textContent="Creando vídeo… "+Math.round(f*100)+"%";requestAnimationFrame(tick)};tick();
 try{const r=await fn();bar.style.width="100%";lbl.textContent="Vídeo listo";await new Promise(r=>setTimeout(r,Math.max(0,450-(performance.now()-t0))));return r}
 finally{on=false;btns.forEach(b=>b&&b.classList.remove("loading"));setTimeout(()=>{pr.classList.remove("on");bar.style.width="0";lbl.textContent=old},400)}}
async function getVideo(){for(let i=0;i<6;i++){
  if(VJOB&&VJOB.tok===VTOK){try{return await VJOB.p}catch(e){if(e.message!="cancel")throw e;continue}}
  await new Promise(r=>setTimeout(r,60));if(VJOB&&VJOB.tok===VTOK)continue;
  try{return await exportMP4(VTOK,false)}catch(e){if(e.message!="cancel")throw e}}
 throw new Error("No se pudo crear el vídeo, vuelve a pulsar")}
const vname=b=>`laciutat_HISTORIA_${Date.now()}.${b.type.includes("mp4")?"mp4":"webm"}`;
const _dl2=dl;dl=async(id,n)=>{if(id!="cstory"||!isVid())return _dl2(id,n);if(!TT.story)return;
 try{const b=await withLoader([$("dlStory")],getVideo);save(b,vname(b));toast("Vídeo descargado")}catch(e){toast(e.message=="cancel"?"Vuelve a pulsar descargar":(e.message||"No se pudo crear el vídeo"))}};
// descargar las 2 a la vez (archivos separados)
$("dlBoth").onclick=async()=>{if(!TT.story)return;const btn=$("dlBoth");
 try{const story=$("mode").value=="story";
  if(!story)$("cpost").toBlob(b=>save(b,`laciutat_POST_${Date.now()}.jpg`),"image/jpeg",.95);
  if(isVid()){const b=await withLoader([$("dlStory"),btn],getVideo);save(b,vname(b))}else $("cstory").toBlob(b=>save(b,`laciutat_HISTORIA_${Date.now()}.jpg`),"image/jpeg",.95);
  toast(story?"Historia descargada":"Post e historia descargados")}catch(e){toast(e.message||"No se pudo descargar")}};
// artículos nuevos: aviso y etiqueta
const NEW=new Set();const _lf=loadFeed;loadFeed=async()=>{const prev=new Set(ITEMS.map(x=>x.link));await _lf();if(prev.size){const f=ITEMS.filter(x=>!prev.has(x.link));f.forEach(x=>NEW.add(x.link));if(f.length){toast(f.length==1?"1 artículo nuevo":f.length+" artículos nuevos");renderFeed()}}};
const _rf3=renderFeed;renderFeed=()=>{_rf3();document.querySelectorAll("#feed .it").forEach(el=>el.classList.toggle("new",NEW.has(el.dataset.l)&&!done.has(el.dataset.l)))};

$("cpLink").onclick=()=>{const v=($("link").value||$("url").value||"").trim();if(!v){toast("Elige un artículo primero");return}
 navigator.clipboard.writeText(v).then(()=>{const b=$("cpLink");b.classList.add("ok");setTimeout(()=>b.classList.remove("ok"),1200);toast("Enlace copiado")},()=>toast("No se pudo copiar"))};

// ---- Noticias al instante: además del RSS (que laciutat.cat regenera cada ~5 min), se buscan los IDs siguientes ----
const LIVE=new Map();
function mergeLive(notify){const known=new Set(ITEMS.map(x=>idOf(x.link)));for(const id of [...LIVE.keys()])if(known.has(id)&&!ITEMS.find(x=>x.live&&idOf(x.link)==id))LIVE.delete(id);
 const add=[...LIVE.values()].filter(x=>!known.has(x.id));if(!add.length)return;
 ITEMS=[...add,...ITEMS].sort((a,b)=>new Date(b.date)-new Date(a.date)||idOf(b.link)-idOf(a.link));
 if(notify){add.forEach(x=>NEW.add(x.link));toast(add.length==1?"1 artículo nuevo":add.length+" artículos nuevos")}renderFeed()}
let probing=false;async function probe(){if(probing||document.hidden||!ITEMS.length)return;probing=true;
 try{const known=new Set(ITEMS.map(x=>idOf(x.link)));const max=Math.max(...known);const ids=[];for(let i=max-8;i<=max+6;i++)if(!known.has(i))ids.push(i);
  const r=await fetch("/api/probe?ids="+ids.join(",")+"&t="+Date.now(),{cache:"no-store"});if(!r.ok||!(r.headers.get("content-type")||"").includes("json"))return;
  const {items}=await r.json();let fresh=0;items.forEach(x=>{if(!LIVE.has(x.id)){LIVE.set(x.id,x);fresh++}});if(fresh)mergeLive(true)}catch{}finally{probing=false}}
const _lf2=loadFeed;loadFeed=async()=>{await _lf2();mergeLive(false)};
setInterval(probe,10000);setTimeout(probe,4000);document.addEventListener("visibilitychange",()=>{if(!document.hidden)probe()});

// ---- búsqueda y sonido de aviso ----
const norm=s=>(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
const _rf4=renderFeed;renderFeed=()=>{_rf4();const q=norm($("q").value.trim());if(!q)return;document.querySelectorAll("#feed .it").forEach(el=>{const x=ITEMS.find(i=>i.link==el.dataset.l);el.style.display=x&&norm(x.title+" "+x.cats.join(" ")+" "+accLabel(x)).includes(q)?"":"none"})};
$("q").addEventListener("input",renderFeed);
let AC=null;const unlock=()=>{try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();AC.resume()}catch{}};["pointerdown","keydown"].forEach(e=>addEventListener(e,unlock,{once:true}));
function chime(){try{unlock();const t=AC.currentTime;[[880,0],[1318.5,.12]].forEach(([f,d])=>{const o=AC.createOscillator(),g=AC.createGain();o.type="sine";o.frequency.value=f;g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(.18,t+d+.015);g.gain.exponentialRampToValueAtTime(.0001,t+d+.9);o.connect(g).connect(AC.destination);o.start(t+d);o.stop(t+d+1)})}catch{}}
const _toast=toast;toast=m=>{_toast(m);if(/artículos? nuevos?/.test(m))chime()};

$("fitBig").addEventListener("change",()=>draw());
