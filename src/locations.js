
import {uaePoint,distance} from './navigation.js';
export function coordinatePlace(lat,lon,name='Pinned location'){
 const coords=[Number(lon),Number(lat)];if(!uaePoint(coords))throw Error('Choose a location in the UAE region. Enter latitude, longitude in that order.');
 return {name,detail:Number(lat).toFixed(6)+', '+Number(lon).toFixed(6)+' · check the entrance',coords,source:'coordinates'};
}
export function allowedMapUrl(value){
 let u;try{u=new URL(value);}catch{return null;}
 if(u.protocol!=='https:'||u.username||u.password||(u.port&&u.port!=='443'))return null;
 if(u.hostname==='maps.app.goo.gl')return u;
 if(u.hostname==='goo.gl'&&u.pathname.startsWith('/maps/'))return u;
 if(['www.google.com','google.com','www.google.ae','google.ae'].includes(u.hostname)&&u.pathname.startsWith('/maps'))return u;
 if(u.hostname==='maps.google.com')return u;
 return null;
}
function pair(text){const m=String(text||'').trim().match(/^(?:loc:)?\s*(-?\d{1,3}(?:\.\d+)?)\s*[,;]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/i);return m?coordinatePlace(m[1],m[2]):null;}
export function parseLocationInput(value){
 const text=String(value||'').trim();const raw=pair(text);if(raw)return raw;
 if(!/^https?:\/\//i.test(text))return null;
 const u=allowedMapUrl(text);if(!u)throw Error('Paste a Google Maps HTTPS link or latitude, longitude coordinates.');
 // Explicit destination coordinates win over the map camera centre.
 for(const key of ['destination','query','q']){const p=pair(u.searchParams.get(key));if(p)return p;}
 const decoded=decodeURIComponent(u.pathname+u.search);
 const destinationPairs=[...decoded.matchAll(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/g)];
 if(destinationPairs.length){const m=destinationPairs.at(-1);return coordinatePlace(m[1],m[2]);}
 const place=decoded.match(/\/place\/(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);if(place)return coordinatePlace(place[1],place[2]);
 // @lat,lon is a viewport, not a reliable destination. Never silently use it.
 return null;
}
export function buildingCodeQuery(q){return q.replace(/\b([A-Za-z])[-\s]?(\d{2,3})\b/g,(_,a,b)=>a.toUpperCase()+'-'+b);}
export function mapFeatures(data,q){
 const seen=[];return(data.features||[]).filter(f=>uaePoint(f.geometry?.coordinates)).map(f=>{const p=f.properties||{};return{name:p.name||[p.housenumber,p.street].filter(Boolean).join(' ')||q,detail:[p.housenumber,p.street,p.district,p.city,p.state].filter((s,i,a)=>s&&a.indexOf(s)===i).join(' · ')||'United Arab Emirates',coords:f.geometry.coordinates,source:'Photon / OpenStreetMap',type:p.osm_value||''};}).filter(p=>{if(seen.some(s=>s.name===p.name&&distance(s.coords,p.coords)<100))return false;seen.push(p);return true;});
}

export function mapAddresses(data,q){
 return(data.places||[]).map(p=>({name:p.name||p.address?.building||p.address?.road||q,detail:p.display_name||'United Arab Emirates',coords:[Number(p.lon),Number(p.lat)],source:'Nominatim / OpenStreetMap'})).filter(p=>uaePoint(p.coords));
}

export function normalizePlaceText(text){
 return String(text||'').normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase()
 .replace(/\b([a-z])[-\s]?(\d{2,3})\b/g,'$1$2')
 .replace(/\bal(marjan|mankhool|barsha|quoz|nahda|karama|qusais|warqa|jaddaf|raffa)\b/g,'al $1')
 .replace(/\bmankhul\b/g,'mankhool').replace(/\bintl\b/g,'international')
 .replace(/[أإآ]/g,'ا').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
}
const common=new Set(['al','the','building','bldg','dubai','uae','united','arab','emirates','street','st','road','rd']);
export function rankPlaces(query,places){
 if(/^\s*(?:https:\/\/|-?\d+(?:\.\d+)?\s*[,;])/i.test(query))return places.filter(p=>uaePoint(p.coords)&&p.source==='coordinates').map(p=>({...p,partial:false,score:100,sources:[p.source||'coordinates']}));
 const full=normalizePlaceText(query),tokens=full.split(' ').filter(t=>t&&!common.has(t));
 const codes=[...full.matchAll(/\b[a-z]\d{2,3}\b/g)].map(m=>m[0]);
 const scored=[];
 for(const p of places){
  if(!uaePoint(p.coords))continue;
  const name=normalizePlaceText(p.name),text=normalizePlaceText(p.name+' '+p.detail),words=new Set(text.split(' '));
  if(codes.some(c=>!words.has(c)))continue;
  const hits=tokens.filter(t=>words.has(t)).length;
  if(tokens.length&&hits===0)continue;
  const partial=tokens.length>0&&hits<tokens.length;
  const score=hits*20+(name===full?80:0)+tokens.filter(t=>name.split(' ').includes(t)).length*12+(p.source==='Saved on this device'?15:0);
  const existing=scored.find(x=>normalizePlaceText(x.name)===name&&distance(x.coords,p.coords)<60);
  if(existing){existing.sources=[...new Set([...existing.sources,p.source||'OpenStreetMap'])];continue;}
  scored.push({...p,partial,score,sources:[p.source||'OpenStreetMap']});
 }
 return scored.sort((a,b)=>b.score-a.score).slice(0,30);
}
export function sanitizeSavedPlaces(value){
 if(!Array.isArray(value))return[];
 return value.filter(p=>p&&typeof p.name==='string'&&p.name.trim()&&uaePoint(p.coords)).slice(0,100).map(p=>({name:p.name.trim().slice(0,100),detail:typeof p.detail==='string'?p.detail.slice(0,300):'Saved pin',coords:p.coords,source:'Saved on this device'}));
}
