// Avisos instantáneos: cuando alguien guarda algo, Supabase Realtime avisa a todos y se actualiza al momento.
(()=>{window.RT_ON=false;
const emit=k=>document.dispatchEvent(new CustomEvent("rt",{detail:String(k||"")}));
async function start(){try{
 const c=await (await fetch("/api/rt",{cache:"no-store"})).json();if(!c.url||!c.key)return;
 if(!window.supabase)await new Promise((ok,ko)=>{const s=document.createElement("script");s.src="assets/vendor/supabase.js";s.onload=ok;s.onerror=ko;document.head.append(s)});
 const sb=supabase.createClient(c.url,c.key,{auth:{persistSession:false,autoRefreshToken:false}});
 sb.channel("ciutat").on("broadcast",{event:"change"},m=>emit(m&&m.payload&&m.payload.k))
  .subscribe(st=>{const on=st==="SUBSCRIBED";if(on&&!RT_ON)emit("*");RT_ON=on});
}catch(e){RT_ON=false}}
setTimeout(start,300);
})();
