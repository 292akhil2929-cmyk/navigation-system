
import {useEffect,useRef,useState} from 'react';
import {shouldSuggest,rankSuggestions,fetchSuggestions} from './suggestions.js';
export default function usePlaceSuggestions(query,saved,enabled){
 const [items,setItems]=useState([]),[loading,setLoading]=useState(false),[message,setMessage]=useState('');
 const lastRequest=useRef(0);
 useEffect(()=>{
  const controller=new AbortController();let cancelled=false,timeout;
  const local=rankSuggestions(query,saved);
  setItems(enabled?local:[]);setMessage('');setLoading(false);
  if(!enabled||!shouldSuggest(query))return()=>controller.abort();
  setLoading(true);
  const delay=Math.max(700,1100-(Date.now()-lastRequest.current));
  const timer=setTimeout(async()=>{
   lastRequest.current=Date.now();
   timeout=setTimeout(()=>controller.abort(),8000);
   try{const remote=await fetchSuggestions(query,controller.signal);if(!cancelled)setItems(rankSuggestions(query,[...local,...remote]));}
   catch(e){if(!cancelled)setMessage('Press Search for a deeper address search, or choose an exact pin.');}
   finally{clearTimeout(timeout);if(!cancelled)setLoading(false);}
  },delay);
  return()=>{cancelled=true;clearTimeout(timer);clearTimeout(timeout);controller.abort();};
 },[query,saved,enabled]);
 return {items,loading,message};
}
