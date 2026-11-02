
const cache=new Map();let lastRequest=0;
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Use GET.'});}
 const q=String(req.query?.q||'').trim();if(q.length<2||q.length>180)return res.status(400).json({error:'Enter a public place or street name between 2 and 180 characters.'});
 const key=q.toLowerCase(),saved=cache.get(key);if(saved&&Date.now()-saved.time<3600000)return res.status(200).json(saved.data);
 // Single-user prototype only. A supported provider/shared limiter is required before scaling.
 if(Date.now()-lastRequest<1200){res.setHeader('Retry-After','2');return res.status(429).json({error:'Please wait two seconds before another address search.'});}
 lastRequest=Date.now();
 try{
  const u=new URL(process.env.NOMINATIM_SEARCH_URL||'https://nominatim.openstreetmap.org/search');
  u.search=new URLSearchParams({q,format:'jsonv2',countrycodes:'ae',addressdetails:'1',limit:'15','accept-language':'en'});
  const r=await fetch(u,{headers:{'User-Agent':'MADA-personal-prototype/0.2 (https://navigation-system-79akhil105-2136s-projects.vercel.app)'},signal:AbortSignal.timeout(10000)});
  if(!r.ok)return res.status(503).json({error:'Address search is temporarily unavailable. Try map search or select a pin.'});
  const data={places:await r.json(),provider:'Nominatim / OpenStreetMap'};
  if(cache.size>200)cache.clear();cache.set(key,{time:Date.now(),data});return res.status(200).json(data);
 }catch{return res.status(503).json({error:'Address search is temporarily unavailable. Try map search or select a pin.'});}
}
