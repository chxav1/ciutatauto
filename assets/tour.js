/* Tutorial guiado, bienvenida para perfiles nuevos y vídeo de presentación */
(()=>{
const L=(es,ca)=>typeof LANG!="undefined"&&LANG=="ca"?ca:es;
const q=s=>document.querySelector(s),vis=e=>e&&e.getClientRects().length&&getComputedStyle(e).visibility!="hidden";
const el=(h)=>{const d=document.createElement("div");d.innerHTML=h.trim();return d.firstChild};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

const STEPS=[
 {t:null,h:["Bienvenido a Ciutat Studio","Benvingut a Ciutat Studio"],p:["Te enseño lo importante en un minuto. Puedes saltar cuando quieras.","T'ensenyo el més important en un minut. Pots saltar quan vulguis."]},
 {t:"#feedBody",h:["Las noticias","Les notícies"],p:["Aquí salen las últimas de laciutat.cat. Elige una y se genera todo.","Aquí surten les últimes de laciutat.cat. Tria'n una i es genera tot."]},
 {t:".cmd",h:["¿No está en la lista?","No és a la llista?"],p:["Pega el enlace del artículo y pulsa Generar.","Enganxa l'enllaç de l'article i prem Generar."]},
 {t:"#fPend",h:["Pendientes","Pendents"],p:["Lo que todavía no ha hecho nadie del equipo.","El que encara no ha fet ningú de l'equip."]},
 {t:"#res, .stage",pre:openFirst,h:["Post e historia, al momento","Post i història, al moment"],p:["Arrastra la foto para encuadrarla. Con la rueda haces zoom.","Arrossega la foto per enquadrar-la. Amb la roda fas zoom."]},
 {t:"#dlBoth",h:["Descárgalo","Descarrega-ho"],p:["Las dos piezas de un clic, listas para Instagram.","Les dues peces d'un clic, llestes per a Instagram."]},
 {t:"#markBtn",h:["Márcala como hecha","Marca-la com a feta"],p:["El equipo verá que ya está y se apunta sola en el Registro.","L'equip veurà que ja està i s'apunta sola al Registre."]},
 {t:".insp",h:["Retócalo","Retoca-ho"],p:["Titular, cuenta, ubicación, encuadre… Todo se puede ajustar.","Titular, compte, ubicació, enquadrament… Tot es pot ajustar."]},
 {t:"#res2, .quick",h:["El copy","El copy"],p:["Cópialo junto al enlace del sticker y a publicar.","Copia'l amb l'enllaç de l'sticker i a publicar."]},
 {t:"#tabs",h:["Registro y Notas","Registre i Notes"],p:["Registro: todo lo publicado, como un Excel. Notas: tareas y avisos del equipo.","Registre: tot el publicat, com un Excel. Notes: tasques i avisos de l'equip."]},
 {t:"#simpleBtn, #themeBtn",h:["A tu manera","A la teva manera"],p:["Modo simple para ir al grano y modo oscuro para la noche.","Mode simple per anar al gra i mode fosc per a la nit."]},
 {t:"#helpBtn",h:["¿Dudas?","Dubtes?"],p:["Desde aquí vuelves a ver el tutorial cuando quieras.","Des d'aquí tornes a veure el tutorial quan vulguis."]}
];

async function openFirst(){
 const res=q("#res");if(res&&!res.classList.contains("hide"))return;
 const it=q("#feed .it");if(!it)return;it.click();
 for(let i=0;i<30&&res.classList.contains("hide");i++)await sleep(100);
 await sleep(350);
}

/* ---------- capa del tutorial ---------- */
const ui=el(`<div class="tr" hidden><div class="tr-block"></div><div class="tr-hole"></div>
<div class="tr-card" role="dialog" aria-modal="true" aria-labelledby="trH"><div class="tr-top"><span class="tr-n"></span><button type="button" class="tr-x"></button></div>
<div class="tr-body"><h3 id="trH"></h3><p></p></div><div class="tr-bar"><i></i></div>
<div class="tr-acts"><button type="button" class="btn line tr-back"></button><button type="button" class="btn pri tr-next"></button></div></div></div>`);
document.body.append(ui);
const hole=ui.querySelector(".tr-hole"),card=ui.querySelector(".tr-card");
let idx=-1,live=[],busy=false;

function rectOf(sel){
 let r=null;for(const s of sel.split(",")){const e=q(s.trim());if(!vis(e))continue;const b=e.getBoundingClientRect();if(!b.width||!b.height)continue;
  r=r?{l:Math.min(r.l,b.left),t:Math.min(r.t,b.top),r:Math.max(r.r,b.right),b:Math.max(r.b,b.bottom)}:{l:b.left,t:b.top,r:b.right,b:b.bottom};
  if(sel.includes(".stage"))break}
 return r;
}
function place(){
 if(idx<0)return;const s=live[idx],vw=innerWidth,vh=innerHeight,pad=8;
 const r=s.t?rectOf(s.t):null;
 if(r){const l=Math.max(6,r.l-pad),t=Math.max(6,r.t-pad),w=Math.min(vw-6,r.r+pad)-l,h=Math.min(vh-6,r.b+pad)-t;
  Object.assign(hole.style,{left:l+"px",top:t+"px",width:w+"px",height:h+"px",opacity:1});hole.classList.add("ring")}
 else{Object.assign(hole.style,{left:vw/2+"px",top:vh/2+"px",width:"0px",height:"0px"});hole.classList.remove("ring")}
 const cw=card.offsetWidth,ch=card.offsetHeight,g=16;let x,y;
 if(vw<640){x=12;y=r&&(r.t+r.b)/2>vh/2?12:vh-ch-12}
 else if(!r){x=(vw-cw)/2;y=(vh-ch)/2}
 else if(r.b+g+ch<vh-8){y=r.b+g;x=(r.l+r.r)/2-cw/2}
 else if(r.t-g-ch>8){y=r.t-g-ch;x=(r.l+r.r)/2-cw/2}
 else if(r.r+g+cw<vw-8){x=r.r+g;y=(r.t+r.b)/2-ch/2}
 else if(r.l-g-cw>8){x=r.l-g-cw;y=(r.t+r.b)/2-ch/2}
 else{x=(vw-cw)/2;y=vh-ch-20}
 x=Math.max(12,Math.min(vw-cw-12,x));y=Math.max(12,Math.min(vh-ch-12,y));
 card.style.left=x+"px";card.style.top=y+"px";
}
async function go(i){
 if(busy||i<0)return;if(i>=live.length)return end(true);busy=true;
 const s=live[i];card.classList.add("swap");
 if(s.pre)await s.pre();
 if(s.t&&!rectOf(s.t)){busy=false;return go(i+(i>=idx?1:-1))}
 if(s.t){const e=q(s.t.split(",").map(x=>x.trim()).find(x=>vis(q(x))));const b=e.getBoundingClientRect();
  if(b.top<70||b.bottom>innerHeight-20){e.scrollIntoView({block:b.height>innerHeight*.7?"start":"center",behavior:"smooth"});await sleep(420)}}
 idx=i;const last=i==live.length-1;
 card.querySelector(".tr-n").textContent=L(`${i+1} de ${live.length}`,`${i+1} de ${live.length}`);
 card.querySelector("h3").textContent=L(...s.h);card.querySelector("p").textContent=L(...s.p);
 card.querySelector(".tr-bar i").style.width=((i+1)/live.length*100)+"%";
 const bk=card.querySelector(".tr-back");bk.textContent=L("Atrás","Enrere");bk.style.visibility=i?"visible":"hidden";
 card.querySelector(".tr-next").textContent=i==0?L("Empezar","Començar"):last?L("Terminar","Acabar"):L("Siguiente","Següent");
 card.querySelector(".tr-x").textContent=last?"":L("Saltar tutorial","Saltar tutorial");
 place();requestAnimationFrame(()=>card.classList.remove("swap"));busy=false;card.querySelector(".tr-next").focus({preventScroll:true});
}
function start(){
 closeAll();q('[data-tab="studio"]')?.click();
 if(document.body.classList.contains("whoopen")||!q("#who").classList.contains("hide"))return;
 live=STEPS.slice();ui.hidden=false;document.body.classList.add("touring");idx=-1;
 requestAnimationFrame(()=>{ui.classList.add("on");go(0)});
}
function end(done){
 ui.classList.remove("on");document.body.classList.remove("touring");idx=-1;
 setTimeout(()=>{ui.hidden=true},300);
 try{localStorage.setItem("cs_tour_done","1")}catch{}
 if(done&&typeof toast=="function")toast(L("¡Listo! Ya sabes lo básico","Fet! Ja saps el bàsic"));
}
card.querySelector(".tr-next").onclick=()=>go(idx+1);
card.querySelector(".tr-back").onclick=()=>go(idx-1);
card.querySelector(".tr-x").onclick=()=>end(false);
addEventListener("resize",()=>place());addEventListener("scroll",()=>place(),true);

/* ---------- bienvenida ---------- */
const wel=el(`<div class="modal hide tr-wel" role="dialog" aria-modal="true" aria-labelledby="trWT"><div class="mcard tr-wc">
<div class="tr-dot">?</div><h2 id="trWT"></h2><p class="hint"></p>
<button type="button" class="btn pri tr-wt"></button><button type="button" class="lnk tr-wn"></button></div></div>`);
document.body.append(wel);
function welcome(){
 wel.querySelector("h2").textContent=L("¿Eres nuevo?","Ets nou?");
 wel.querySelector(".hint").textContent=L("Aprende a usar Ciutat Studio en un minuto.","Aprèn a fer servir Ciutat Studio en un minut.");
 wel.querySelector(".tr-wt").textContent=L("Ver tutorial","Veure el tutorial");
 wel.querySelector(".tr-wn").textContent=L("Ahora no","Ara no");
 wel.classList.remove("hide");wel.querySelector(".tr-wt").focus();
}
wel.querySelector(".tr-wt").onclick=start;
wel.querySelector(".tr-wn").onclick=()=>wel.classList.add("hide");
wel.onclick=e=>{if(e.target==wel)wel.classList.add("hide")};

/* ---------- botón de ayuda (siempre disponible) ---------- */
const hb=el(`<button class="tbtn thm" id="helpBtn" type="button" ><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.2"/><path d="M9.4 9.3a2.7 2.7 0 0 1 5.2.9c0 1.8-2.6 2.3-2.6 3.8"/><path d="M12 17.2h.01"/></svg></button>`);
const tb=q("#themeBtn");tb.parentNode.insertBefore(hb,tb);
hb.onclick=()=>start();
function setHbLabel(){const s=L("Ver tutorial","Veure el tutorial");hb.title=s;hb.setAttribute("aria-label",s)}setHbLabel();

function closeAll(){wel.classList.add("hide");if(idx>=0)end(false)}

/* ---------- teclado: el tutorial y el vídeo se quedan las teclas ---------- */
addEventListener("keydown",e=>{
 if(!wel.classList.contains("hide")){if(e.key=="Escape")wel.classList.add("hide");e.stopImmediatePropagation();return}
 if(idx<0)return;
 e.stopImmediatePropagation();
 if(e.key=="ArrowRight"||e.key=="Enter"){e.preventDefault();go(idx+1)}
 else if(e.key=="ArrowLeft"){e.preventDefault();go(idx-1)}
 else if(e.key=="Escape")end(false);
},true);

/* ---------- perfil nuevo: «¿Eres nuevo?» una sola vez ---------- */
let fresh=false;
q("#peForm").addEventListener("submit",()=>{fresh=!peId},true);
const _close=closeWho;closeWho=function(pick){const r=_close.apply(this,arguments);setHbLabel();
 if(fresh&&!pick&&typeof ME!="undefined"&&ME){const k="cs_tour_"+ME;let seen=false;try{seen=!!localStorage.getItem(k);localStorage.setItem(k,"1")}catch{}if(!seen)setTimeout(welcome,900)}
 fresh=false;return r};
window.Tour={start,welcome};
})();
