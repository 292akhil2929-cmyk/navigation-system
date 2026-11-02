
import {useEffect,useRef} from 'react';
import L from 'leaflet';import 'leaflet/dist/leaflet.css';
export default function RouteMap({route,position,origin,destination,active}){
 const host=useRef(null),map=useRef(null),layers=useRef({});
 useEffect(()=>{const m=L.map(host.current,{zoomControl:false,attributionControl:true}).setView([25.18,55.26],11);map.current=m;
 L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'}).addTo(m);L.control.zoom({position:'bottomright'}).addTo(m);
 const obs=new ResizeObserver(()=>m.invalidateSize());obs.observe(host.current);return()=>{obs.disconnect();m.remove();};},[]);
 useEffect(()=>{const m=map.current;if(!m)return;for(const x of Object.values(layers.current))m.removeLayer(x);layers.current={};
 const addMarker=(p,color,text)=>L.circleMarker([p[1],p[0]],{radius:8,color:'#fff',weight:3,fillColor:color,fillOpacity:1}).addTo(m).bindTooltip(text);
 if(route){const pts=route.coords.map(p=>[p[1],p[0]]);layers.current.outline=L.polyline(pts,{color:'#1b3025',weight:9,opacity:0.8}).addTo(m);layers.current.route=L.polyline(pts,{color:'#c2e97c',weight:5}).addTo(m);m.fitBounds(layers.current.route.getBounds(),{padding:[35,35]});}
 if(origin)layers.current.origin=addMarker(origin.coords,'#c2e97c','Start');
 if(destination)layers.current.destination=addMarker(destination.coords,'#e7b76d',destination.name);
 },[route,origin,destination]);
 useEffect(()=>{const m=map.current;if(!m||!position)return;const p=[position[1],position[0]];if(!layers.current.car)layers.current.car=L.circleMarker(p,{radius:8,color:'#fff',weight:3,fillColor:'#368dff',fillOpacity:1}).addTo(m);else layers.current.car.setLatLng(p);if(active)m.setView(p,Math.max(m.getZoom(),15),{animate:false});},[position,active]);
 return <div ref={host} className="map" aria-label="Interactive OpenStreetMap route map"/>;
}
