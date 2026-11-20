// Idioma de la interfaz (castellano por defecto, catalán opcional). Las imágenes y el copy no se traducen.
const CA={
"Modo simple":"Mode simple","Modo completo":"Mode complet","Copiar copy":"Copiar copy","Copiar enlace":"Copiar enllaç","Elige tu perfil para empezar":"Tria el teu perfil per començar","Herramienta interna de redes sociales":"Eina interna de xarxes socials","Posts e historias de La Ciutat":"Posts i històries de La Ciutat","Modo claro / oscuro":"Mode clar / fosc","Cambiar entre modo claro y oscuro":"Canviar entre mode clar i fosc",
"Pega el enlace de un artículo de laciutat.cat":"Enganxa l'enllaç d'un article de laciutat.cat","Generar":"Generar","Artículos":"Articles",
"Últimos artículos":"Últims articles","Todas las ediciones":"Totes les edicions","Buscar artículos":"Cercar articles","Recargar":"Recarregar","Cargando…":"Carregant…",
"Elige un artículo":"Tria un article","Selecciona una noticia de la lista o pega su enlace arriba. El post, la historia y el copy se generan al momento.":"Selecciona una notícia de la llista o enganxa'n l'enllaç a dalt. El post, la història i el copy es generen a l'instant.",
"Post e historia":"Post i història","Solo historia":"Només història","Post":"Post","Historia":"Història","Descargar post":"Descarregar post","Descargar historia":"Descarregar història",
"Descargar historia (vídeo)":"Descarregar història (vídeo)","Descargar las 2":"Descarregar les 2","Contenido":"Contingut","Titular":"Titular",
"El titular aparecerá al elegir un artículo":"El titular apareixerà en triar un article","Cuenta de Instagram":"Compte d'Instagram","Automática":"Automàtica","Ubicación":"Ubicació","Auto":"Auto",
"Imagen":"Imatge","Franja fija":"Franja fixa","El titular se adapta y se centra":"El titular s'adapta i es centra","Encuadre de la foto":"Enquadrament de la foto","Cambiar foto":"Canviar foto",
"Animación del texto":"Animació del text","Flecha":"Fletxa","No sale si hay recuadro":"No surt si hi ha requadre","Recuadro del sticker":"Requadre de l'sticker","Sí":"Sí","No":"No",
"Copy":"Copy","Copiar":"Copiar","Aparecerá al generar":"Apareixerà en generar","Enlace para el sticker":"Enllaç per a l'sticker","Copiar enlace del artículo":"Copiar l'enllaç de l'article",
"¿Quién está trabajando?":"Qui està treballant?","Gestionar perfiles":"Gestionar perfils","Listo":"Fet","Añadir perfil":"Afegir perfil","Nuevo perfil":"Nou perfil","Editar perfil":"Editar perfil",
"Nombre":"Nom","Tu nombre":"El teu nom","Idioma de la web":"Idioma del web","Tu color":"El teu color","Los colores en uso no se pueden repetir.":"Els colors en ús no es poden repetir.",
"Eliminar perfil":"Eliminar perfil","Cancelar":"Cancel·lar","Guardar":"Desar","Cambiar de perfil":"Canviar de perfil",
"Marcar como hecha":"Marcar com a feta","Marcada como hecha":"Marcada com a feta","Desmarcada":"Desmarcada","Pulsa para desmarcar":"Prem per desmarcar",
"Guardar en la galería":"Desar a la galeria","Pulsa el botón y elige «Guardar imagen» o «Guardar vídeo».":"Prem el botó i tria «Desar imatge» o «Desar vídeo».",
"Post descargado":"Post descarregat","Historia descargada":"Història descarregada","Vídeo descargado":"Vídeo descarregat","Post e historia descargados":"Post i història descarregats",
"Copy copiado":"Copy copiat","Enlace copiado":"Enllaç copiat","1 artículo nuevo":"1 article nou","Creando vídeo…":"Creant vídeo…","Vídeo listo":"Vídeo llest",
"Elige un artículo primero":"Tria un article primer","No se pudo copiar":"No s'ha pogut copiar","No se pudo descargar":"No s'ha pogut descarregar","Sin artículos":"Sense articles",
"ahora":"ara","Nuevo":"Nou","Perfil guardado":"Perfil desat","Perfil eliminado":"Perfil eliminat","Sin conexión con el servidor":"Sense connexió amb el servidor",
"Hecha por":"Feta per","Hecha por ti":"Feta per tu","por ti":"per tu","Guardado en el dispositivo":"Desat al dispositiu"
};
let LANG="es";const ORIG=new WeakMap(),ATTR=["placeholder","aria-label","title","data-tip"];
const tr=s=>{if(LANG!="ca"||!s)return s;const k=s.trim();if(CA[k])return s.replace(k,CA[k]);
 let m;if((m=k.match(/^(\d+) artículos nuevos$/)))return m[1]+" articles nous";if((m=k.match(/^Creando vídeo… (\d+)%$/)))return "Creant vídeo… "+m[1]+"%";
 if((m=k.match(/^Hecha por (.+)$/)))return "Feta per "+m[1];if(/^ahora · /.test(k))return s.replace("ahora","ara");return s};
function translateNode(root){const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement&&!n.parentElement.closest("script,style,textarea,#feed .tl,#htitle")?1:2});
 let n;while((n=w.nextNode())){if(!ORIG.has(n))ORIG.set(n,n.nodeValue);const o=ORIG.get(n);const v=LANG=="ca"?tr(o):o;if(n.nodeValue!==v)n.nodeValue=v}
 (root.querySelectorAll?root:document).querySelectorAll("*").forEach(el=>ATTR.forEach(a=>{if(!el.hasAttribute(a))return;const key="o_"+a;if(!el.dataset[key.replace("-","")])el.dataset[key.replace("-","")]=el.getAttribute(a);const o=el.dataset[key.replace("-","")],v=LANG=="ca"?tr(o):o;if(el.getAttribute(a)!==v)el.setAttribute(a,v)}))}
function setLang(l){LANG=l=="ca"?"ca":"es";document.documentElement.lang=LANG;translateNode(document.body)}
new MutationObserver(ms=>{if(LANG!="ca")return;for(const m of ms)for(const n of m.addedNodes){if(n.nodeType==1)translateNode(n);else if(n.nodeType==3&&n.parentElement)translateNode(n.parentElement)}}).observe(document.body,{childList:true,subtree:true,characterData:false});
