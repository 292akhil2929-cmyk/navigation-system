
import {normalizeRoute,uaePoint} from './navigation.js';
import {parseLocationInput,allowedMapUrl,buildingCodeQuery,mapFeatures,mapAddresses,rankPlaces} from './locations.js';
async function json(url){let res;try{res=await fetch(url,{signal:AbortSignal.timeout(20000)});}catch(e){throw Error(e.name==='TimeoutError'?'The route service took too long. Try again.':'Connection failed. Check mobile data and try again.');}if(!res.ok)throw Error('The free map service is busy ('+res.status+'). Please try again later.');return res.json();}

const searchCache=new Map();
export async function searchPlaces(query){
 const q=query.trim();if(q.length<2)throw Error('Enter a building name, street, or coordinates.');
 const exact=parseLocationInput(q);if(exact)return[exact];
 if(/^https?:\/\//i.test(q)){
  if(!allowedMapUrl(q))throw Error('Use a Google Maps HTTPS link or latitude, longitude coordinates.');
  const res=await fetch('/api/resolve-map-link',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:q}),signal:AbortSignal.timeout(20000)});
  const data=await res.json();if(!res.ok)throw Error(data.error||'Could not read that map link. Paste coordinates instead.');return[data.place];
 }

 const cached=searchCache.get(q.toLowerCase());
 if(cached&&Date.now()-cached.time<300000)return cached.places;
 const url=new URL('https://photon.komoot.io/api/');
 url.search=new URLSearchParams({q,limit:'20',lat:'25.2',lon:'55.27',bbox:'51,22,57,26.5'});
 const responses=await Promise.allSettled([
  json('/api/search-address?q='+encodeURIComponent(q)).then(data=>mapAddresses(data,q)),
  json(url).then(data=>mapFeatures(data,q))
 ]);
 const available=responses.filter(r=>r.status==='fulfilled');
 if(!available.length)throw Error('Both place-search services are unavailable. Try again or use an exact pin.');
 let found=rankPlaces(q,available.flatMap(r=>r.value));
 const variant=buildingCodeQuery(q);
 if(!found.length&&variant!==q){try{url.searchParams.set('q',variant);found=rankPlaces(q,mapFeatures(await json(url),q));}catch{}}
 if(searchCache.size>50)searchCache.clear();
 searchCache.set(q.toLowerCase(),{time:Date.now(),places:found});
 return found;
}

export async function getRoute(from,to,label){if(!uaePoint(from)||!uaePoint(to))throw Error('This prototype supports locations in and around the UAE only.');const base=import.meta.env.VITE_ROUTING_URL||'https://router.project-osrm.org';const raw=await json(base+'/route/v1/driving/'+from.join(',')+';'+to.join(',')+'?overview=full&geometries=geojson&steps=true&alternatives=false');if(raw.code!=='Ok')throw Error('No route found. Try a nearby road entrance.');const a=raw.waypoints?.[0]?.distance,b=raw.waypoints?.[1]?.distance;if(a>500||b>500)throw Error('A location is too far from a mapped road. Choose a road entrance nearby.');return normalizeRoute(raw,label);}
