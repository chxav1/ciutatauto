// Encuadre directo sobre la imagen, filtro de pendientes, atajos de teclado y precarga de fotos.
(()=>{
window.FY=.5;window.ZOOM=1;
// ---------- redibujado ligero (un frame cada vez) ----------
let rq=0;const redraw=()=>{if(rq)return;rq=requestAnimationFrame(async()=>{rq=0;await draw()})};
const manual=()=>{if($("fxAuto").checked){$("fxAuto").checked=false;sync()}};

// ---------- foto nueva: encuadre por defecto ----------
const _sp=setPhoto;setPhoto=async src=>{window.FY=.5;window.ZOOM=1;$("zoom").value=1;return _sp(src)};

// ---------- arrastrar / zoom sobre post e historia ----------
const pts=new Map();let start=null;
function geo(cv){const k=cv.id=="cpost"?"post":"story",s=SPEC[k],sc=Math.max(s.W/photo.width,s.H/photo.height)*ZOOM;return{s,w:photo.width*sc,h:photo.height*sc,r:cv.getBoundingClientRect()}}
for(const id of["cpost","cstory"]){const cv=$(id);cv.classList.add("dragcv");
 cv.addEventListener("pointerdown",e=>{if(!photo)return;cv.setPointerCapture(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  start={fx:+$("fx").value,fy:FY,z:ZOOM,pts:new Map(pts),cv};cv.classList.add("grab")});
 cv.addEventListener("pointermove",e=>{if(!pts.has(e.pointerId)||!start)return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  const g=geo(cv),k=g.s.W/g.r.width;manual();
  const ids=[...pts.keys()];
  if(ids.length>=2&&start.pts.size>=2){const [a,b]=ids.map(i=>pts.get(i)),[a0,b0]=ids.map(i=>start.pts.get(i)||pts.get(i));
   const d=Math.hypot(a.x-b.x,a.y-b.y),d0=Math.hypot(a0.x-b0.x,a0.y-b0.y)||1;window.ZOOM=Math.min(3,Math.max(1,start.z*d/d0));$("zoom").value=ZOOM}
  const p=pts.get(e.pointerId),p0=start.pts.get(e.pointerId)||p,g2=geo(cv);
  const nfx=start.fx-(p.x-p0.x)*k/g2.w,nfy=start.fy-(p.y-p0.y)*k/g2.h;
  $("fx").value=Math.min(1,Math.max(0,nfx));window.FY=Math.min(1,Math.max(0,nfy));redraw()});
 const end=e=>{pts.delete(e.pointerId);if(!pts.size){start=null;cv.classList.remove("grab")}else start={fx:+$("fx").value,fy:FY,z:ZOOM,pts:new Map(pts),cv}};
 cv.addEventListener("pointerup",end);cv.addEventListener("pointercancel",end);
 cv.addEventListener("wheel",e=>{if(!photo)return;e.preventDefault();manual();window.ZOOM=Math.min(3,Math.max(1,ZOOM*Math.exp(-e.deltaY*.0015)));$("zoom").value=ZOOM;redraw()},{passive:false});
 cv.addEventListener("dblclick",()=>reset())}
$("zoom").addEventListener("input",()=>{window.ZOOM=+$("zoom").value;redraw()});
function reset(){window.FY=.5;window.ZOOM=1;$("zoom").value=1;$("fxAuto").checked=true;sync();redraw()}
$("fxReset").onclick=reset;

// ---------- pendientes ----------
let pend=false;
const today=d=>{const a=new Date(d),b=new Date();return a.getFullYear()==b.getFullYear()&&a.getMonth()==b.getMonth()&&a.getDate()==b.getDate()};
const isPend=l=>{const x=ITEMS.find(i=>i.link==l);return x&&!markOf(l)&&today(x.date)};
const _rf=renderFeed;renderFeed=(...a)=>{_rf(...a);if(window.prefetchTop)prefetchTop();const n=ITEMS.filter(x=>!markOf(x.link)&&today(x.date)).length;$("pendN").textContent=n||"";
 const its=[...document.querySelectorAll("#feed .it")];let vis=0;its.forEach(el=>{const h=pend&&!isPend(el.dataset.l);el.classList.toggle("fhide",h);if(!h&&el.style.display!="none")vis++});
 let em=$("feed").querySelector(".pend-empty");if(pend&&!vis){if(!em){em=document.createElement("p");em.className="mut pend-empty";$("feed").appendChild(em)}em.textContent=tr("No queda ninguna noticia pendiente de hoy.")}else if(em)em.remove()};
function setPend(v){pend=v;[...$("fPend").children].forEach(b=>b.classList.toggle("on",(b.dataset.v=="pend")==pend));try{localStorage.setItem("cs_pend",pend?"1":"")}catch{}renderFeed()}
$("fPend").onclick=e=>{const b=e.target.closest("button");if(b)setPend(b.dataset.v=="pend")};
try{if(localStorage.getItem("cs_pend"))setTimeout(()=>setPend(true),0)}catch{}

// ---------- precarga de fotos para que abrir una noticia sea instantáneo ----------
const IMG=new Map();
const _is=imageSrc;imageSrc=u=>{if(!u)return _is(u);if(!IMG.has(u))IMG.set(u,_is(u).catch(e=>{IMG.delete(u);throw e}));return IMG.get(u)};
let pq=[],pr=0;const pump=()=>{while(pr<3&&pq.length){const u=pq.shift();if(IMG.has(u))continue;pr++;imageSrc(u).catch(()=>{}).finally(()=>{pr--;pump()})}};
const prefetch=(list,front)=>{const us=list.map(x=>x.img).filter(u=>u&&!IMG.has(u));pq=front?[...us,...pq]:[...pq,...us];pump()};
const _lf=loadFeed;loadFeed=async(...a)=>{const r=await _lf(...a);prefetch(ITEMS.slice(0,15));return r};
$("feed").addEventListener("pointerover",e=>{const it=e.target.closest(".it");if(!it)return;const x=ITEMS.find(i=>i.link==it.dataset.l);if(x)prefetch([x],true)});
setTimeout(()=>prefetch(ITEMS.slice(0,15)),1500);
window.prefetchTop=()=>prefetch(ITEMS.slice(0,15));

// ---------- botón de recargar ----------
$("reload").onclick=async()=>{const b=$("reload");if(b.classList.contains("spin"))return;b.classList.add("spin");const t=Date.now();try{await loadFeed()}catch{}setTimeout(()=>b.classList.remove("spin"),Math.max(0,600-(Date.now()-t)))};

// ---------- atajos de teclado ----------
const vis=()=>[...document.querySelectorAll("#feed .it:not(.fhide)")].filter(el=>el.offsetParent);
function step(d){const L=vis();if(!L.length)return;let i=L.findIndex(el=>el.dataset.l==cur);i=i<0?(d>0?0:L.length-1):Math.min(L.length-1,Math.max(0,i+d));
 const el=L[i],x=ITEMS.find(z=>z.link==el.dataset.l);if(x){pick(x);el.scrollIntoView({block:"nearest",behavior:"smooth"});const n=L[i+d];if(n){const y=ITEMS.find(z=>z.link==n.dataset.l);if(y)prefetch([y],true)}}}
const kb=$("kbd"),toggleKbd=v=>kb.classList.toggle("hide",v===undefined?!kb.classList.contains("hide"):!v);
$("kbdBtn").onclick=()=>toggleKbd();
if(!matchMedia("(hover:hover) and (pointer:fine)").matches){$("kbdBtn").remove();kb.remove()}
document.addEventListener("click",e=>{if(!kb.classList.contains("hide")&&!e.target.closest("#kbd,#kbdBtn"))toggleKbd(false)});
addEventListener("keydown",e=>{const a=document.activeElement;
 if(e.key=="Escape"){toggleKbd(false);if(a==$("q"))a.blur();return}
 if(e.ctrlKey||e.metaKey||e.altKey)return;if(a&&a.matches("input,textarea,select,[contenteditable]"))return;
 if(!$("who").classList.contains("hide")||document.body.classList.contains("logmode")||document.querySelector(".modal:not(.hide)"))return;
 const has=!$("res").classList.contains("hide")&&$("link").value,k=e.key;
 if(k=="C"&&e.shiftKey){e.preventDefault();if(has)cp("link",document.querySelector('#res2 .fld .lnk'));return}
 const act={ArrowDown:()=>step(1),ArrowUp:()=>step(-1),j:()=>step(1),k:()=>step(-1),
  d:()=>has&&$("dlBoth").click(),p:()=>has&&!$("wpost").classList.contains("hide")&&document.querySelector("#wpost .btn").click(),h:()=>has&&$("dlStory").click(),
  c:()=>has&&cp("copy",document.querySelector('#res2 .lnk')),
  m:()=>has&&setMark($("link").value,!markOf($("link").value)),f:()=>setPend(!pend),"/":()=>$("q").focus(),"?":()=>toggleKbd()}[k.length==1?k.toLowerCase():k]||(k=="?"?()=>toggleKbd():null);
 if(act){e.preventDefault();act()}});
})();
