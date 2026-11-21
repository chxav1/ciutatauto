// Encuadre inteligente: busca caras y personas en la foto (MediaPipe, en el navegador) y centra el recorte en ellas.
// Si no encuentra a nadie, usa el detector de contraste de siempre.
(()=>{
const V="0.10.14",CDN=`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${V}`;
const FACE="https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";
const OBJ="https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite";
let models=null;
function load(){return models||(models=(async()=>{const m=await import(`${CDN}/vision_bundle.mjs`),fs=await m.FilesetResolver.forVisionTasks(`${CDN}/wasm`);
 const [face,obj]=await Promise.all([
  m.FaceDetector.createFromOptions(fs,{baseOptions:{modelAssetPath:FACE},runningMode:"IMAGE",minDetectionConfidence:.45}).catch(()=>null),
  m.ObjectDetector.createFromOptions(fs,{baseOptions:{modelAssetPath:OBJ},runningMode:"IMAGE",scoreThreshold:.35,maxResults:8,categoryAllowlist:["person"]}).catch(()=>null)]);
 if(!face&&!obj)throw new Error("sin modelos");return{face,obj}})().catch(e=>{models=null;throw e}))}

// columna de "interés" a partir de las cajas detectadas
function focusFrom(img,faces,people,base){const N=200,col=new Float32Array(N),W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;
 const add=(b,w)=>{const a=Math.max(0,Math.floor(b.originX/W*N)),z=Math.min(N-1,Math.ceil((b.originX+b.width)/W*N));for(let i=a;i<=z;i++)col[i]+=w/(z-a+1)};
 for(const d of faces){const b=d.boundingBox,ar=b.width*b.height/(W*H);add(b,6*(0.4+Math.sqrt(ar)*4)*(d.categories?.[0]?.score||.6))}
 for(const d of people){const b=d.boundingBox,ar=b.width*b.height/(W*H);
  // la cabeza está arriba: damos más peso a la parte superior central de la persona
  add({originX:b.originX+b.width*.2,width:b.width*.6},2*(0.3+Math.sqrt(ar)*3)*(d.categories?.[0]?.score||.5))}
 const tot=col.reduce((a,b)=>a+b,0);if(!tot)return null;
 const win=Math.max(8,Math.round(N*Math.min(1,(H*1080/1440)/W)));let s=0,best=-1,bi=0;
 for(let i=0;i<N;i++){s+=col[i];if(i>=win)s-=col[i-win];if(i>=win-1){const c=(i-win+1+win/2)/N,sc=s-Math.abs(c-base)*tot*.02;if(sc>best){best=sc;bi=i-win+1}}}
 return Math.min(1,Math.max(0,(bi+win/2)/N))}

let seq=0;
window.fxReady=Promise.resolve();
const _set=setPhoto;
setPhoto=async src=>{await _set(src);const my=++seq,img=photo,base=autoFx;
 window.fxReady=(async()=>{try{const{face,obj}=await Promise.race([load(),new Promise((_,ko)=>setTimeout(()=>ko(new Error("lento")),8000))]);
   if(my!=seq||photo!==img)return;
   const faces=face?face.detect(img).detections:[],people=obj?obj.detect(img).detections:[];
   const fx=focusFrom(img,faces,people,base);
   if(fx==null||my!=seq||photo!==img)return;
   autoFx=fx;if($("fxAuto").checked){sync();await draw()}}catch{}})();};
// precarga en segundo plano para que la primera foto no espere
setTimeout(()=>load().catch(()=>{}),3000);
})();
