
export const R=6371000;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function distance(a,b){const rad=Math.PI/180;const x=(b[1]-a[1])*rad,y=(b[0]-a[0])*rad;const h=Math.sin(x/2)**2+Math.cos(a[1]*rad)*Math.cos(b[1]*rad)*Math.sin(y/2)**2;return 2*R*Math.asin(Math.sqrt(clamp(h,0,1)));}
export function prepareDistance(speed=0,lead=60){return clamp(Math.max(0,speed)*lead,700,3000);}
export function isExit(s){return ['off ramp','fork','end of road'].includes(s?.maneuver?.type);}
export function instruction(s){if(!s)return 'Follow the route';const m=s.maneuver||{},dir=(m.modifier||'').replaceAll('slight ','slightly ');const road=s.name||s.ref||'';if(m.type==='arrive')return 'Arrive at your destination';if(m.type==='depart')return 'Head onto '+(road||'the road');if(m.type==='roundabout'||m.type==='rotary')return 'At the roundabout, take exit '+(m.exit||'ahead');if(m.type==='off ramp')return 'Take the '+(dir||'upcoming')+' exit'+(s.exits?' '+s.exits:'');if(m.type==='fork')return 'Keep '+(dir||'ahead')+' at the fork';if(m.type==='merge')return 'Merge '+(dir||'ahead');if(m.type==='continue'||m.type==='new name')return 'Continue '+(dir||'ahead');return (m.type==='turn'?'Turn ':m.type==='end of road'?'At the end, turn ':'Continue ')+(dir||'ahead');}
export function normalizeRoute(raw,label='Destination'){
 const r=raw.routes?.[0];if(!r?.geometry?.coordinates?.length)throw Error('No drivable route found. Try a nearby road entrance.');
 const coords=r.geometry.coordinates;const cumulative=[0];for(let i=1;i<coords.length;i++)cumulative.push(cumulative[i-1]+distance(coords[i-1],coords[i]));
 const steps=[];let offset=0;for(const leg of r.legs||[])for(const s of leg.steps||[]){steps.push({...s,at:offset});offset+=s.distance||0;}
 const scale=(cumulative.at(-1)||1)/(r.distance||1);steps.forEach(s=>s.at*=scale);
 return {coords,cumulative,steps,total:cumulative.at(-1),duration:r.duration,label,created:Date.now()};
}
// Project each GPS point onto route geometry. During guidance search near prior
// progress, avoiding jumps between stacked/parallel roads and self-intersections.
export function project(route,point,previous=null){
 const lat=point[1]*Math.PI/180,kx=111320*Math.cos(lat),ky=111320;let best=null;
 for(let i=0;i<route.coords.length-1;i++){if(previous!==null&&(route.cumulative[i]<previous-250||route.cumulative[i]>previous+1800))continue;
 const a=route.coords[i],b=route.coords[i+1];const ax=(a[0]-point[0])*kx,ay=(a[1]-point[1])*ky,dx=(b[0]-a[0])*kx,dy=(b[1]-a[1])*ky;
 const t=clamp(-(ax*dx+ay*dy)/(dx*dx+dy*dy||1),0,1),d=Math.hypot(ax+t*dx,ay+t*dy),at=route.cumulative[i]+t*(route.cumulative[i+1]-route.cumulative[i]);
 if(!best||d<best.distance)best={distance:d,at,point:[a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]};
 }return best||{distance:Infinity,at:previous||0,point};
}
export function pointAt(route,at){let i=route.cumulative.findIndex(x=>x>=at);if(i<=0)return route.coords[i===0?0:route.coords.length-1];const a=route.coords[i-1],b=route.coords[i],t=(at-route.cumulative[i-1])/(route.cumulative[i]-route.cumulative[i-1]||1);return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];}
export function guidance(route,at,speed=0,lead=60){
 const next=route.steps.find(s=>s.at>at+12)||route.steps.at(-1);
 const exit=route.steps.find(s=>isExit(s)&&s.at>at+30);
 const remaining=Math.max(0,route.total-at),arrived=remaining<35;
 const prep=exit&&exit.at-at<=prepareDistance(speed,lead);
 return {next,exit,remaining,arrived,prepare:!!prep,toNext:Math.max(0,(next?.at||0)-at),toExit:exit?exit.at-at:null,phase:arrived?'arrived':prep?'prepare':'cruise'};
}
export function formatDistance(m){if(!Number.isFinite(m))return '—';return m>=1000?(m/1000).toFixed(m<10000?1:0)+' km':Math.max(0,Math.round(m/10)*10)+' m';}
export function uaePoint(p){return Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&p[0]>=51&&p[0]<=57&&p[1]>=22&&p[1]<=26.5;}
