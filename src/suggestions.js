
import {normalizePlaceText,mapFeatures} from './locations.js';
import {uaePoint,distance} from './navigation.js';
export function shouldSuggest(q){const s=q.trim();return s.length>=3&&s.length<=180&&!/^https?:\/\//i.test(s)&&!/^[-\d.\s]+[,;]/.test(s);}
export function rankSuggestions(query,places){
 const words=normalizePlaceText(query).split(' ').filter(t=>t&&!['al','the','of','dubai','uae','building','bldg'].includes(t));
 const codes=words.filter(t=>/^[a-z]\d{2,3}$/.test(t));
 const out=[];
 for(const p of places){
  if(!uaePoint(p.coords))continue;
  const name=normalizePlaceText(p.name),text=normalizePlaceText(p.name+' '+p.detail).split(' ');
  if(codes.some(c=>!text.includes(c)))continue;
  if(words.some((t,i)=>!text.some(w=>w===t||(i===words.length-1&&w.startsWith(t)))))continue;
  if(out.some(x=>normalizePlaceText(x.name)===name&&distance(x.coords,p.coords)<60))continue;
  out.push({...p,suggestionScore:(p.source==='Saved on this device'?100:0)+words.filter(w=>name.split(' ').some(n=>n.startsWith(w))).length*10});
 }
 return out.sort((a,b)=>b.suggestionScore-a.suggestionScore).slice(0,8);
}
const cache=new Map();
export async function fetchSuggestions(query,signal){
 if(!shouldSuggest(query))return[];
 const key=query.trim().toLowerCase(),hit=cache.get(key);
 if(hit&&Date.now()-hit.time<300000)return hit.value;
 const url=new URL('https://photon.komoot.io/api/');
 url.search=new URLSearchParams({q:query.trim(),limit:'10',lat:'25.2',lon:'55.27',bbox:'51,22,57,26.5'});
 const response=await fetch(url,{signal});
 if(!response.ok)throw Error('Suggestions are unavailable. Press Search to try the full address search.');
 const value=mapFeatures(await response.json(),query);
 if(cache.size>=50)cache.clear();cache.set(key,{time:Date.now(),value});return value;
}
