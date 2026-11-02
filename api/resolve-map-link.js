
import {allowedMapUrl,parseLocationInput} from '../src/locations.js';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Use POST.'});}
 try{
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
  if(typeof body?.url!=='string'||body.url.length>2000)return res.status(400).json({error:'Paste a valid Google Maps link.'});
  let u=allowedMapUrl(body.url);if(!u)return res.status(400).json({error:'Only Google Maps HTTPS links are supported.'});
  const signal=AbortSignal.timeout(8000);
  for(let hop=0;hop<5;hop++){
   const place=parseLocationInput(u.href);if(place)return res.status(200).json({place});
   if(!['maps.app.goo.gl','goo.gl'].includes(u.hostname))break;
   const response=await fetch(u.href,{redirect:'manual',signal});
   const next=response.headers.get('location');await response.body?.cancel();
   if(!next||response.status<300||response.status>=400)break;
   u=allowedMapUrl(new URL(next,u).href);if(!u)return res.status(422).json({error:'That link redirects outside supported Maps URLs. Paste pin coordinates instead.'});
  }
  return res.status(422).json({error:'This link does not expose destination coordinates. In Google Maps, long-press the exact entrance, copy its latitude and longitude, and paste them here. A map centre or place ID alone is not an exact destination.'});
 }catch(e){return res.status(400).json({error:e.name==='TimeoutError'?'The map link took too long. Paste pin coordinates instead.':e.message?.startsWith('Choose a location')?e.message:'Could not read that link. Paste latitude, longitude instead.'});}
}
