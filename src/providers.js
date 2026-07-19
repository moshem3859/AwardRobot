const DEFAULT_GATEWAYS = ['LHR','CDG','AMS','MAD','BCN','LIS','FCO','MXP','ZRH','VIE','PRG','WAW','ATH','OTP','FRA','MUC','BRU','DUB','CPH'];

async function amadeusToken(){
  const base=process.env.AMADEUS_BASE_URL || 'https://test.api.amadeus.com';
  const body=new URLSearchParams({grant_type:'client_credentials',client_id:process.env.AMADEUS_CLIENT_ID,client_secret:process.env.AMADEUS_CLIENT_SECRET});
  const r=await fetch(`${base}/v1/security/oauth2/token`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});
  if(!r.ok) throw new Error(`Amadeus token failed: ${r.status}`);
  return (await r.json()).access_token;
}

function isoWithFallback(date,time='10:00:00Z'){ return `${date}T${time}`; }
function demoSegments(input){
  const d=input.startDate;
  const next=new Date(`${d}T00:00:00Z`); next.setUTCDate(next.getUTCDate()+1); const d2=next.toISOString().slice(0,10);
  return [
    {id:'demo1',kind:'award',origin:input.origins[0],destination:'MAD',departure:isoWithFallback(d,'21:00:00Z'),arrival:isoWithFallback(d2,'07:15:00Z'),airline:'IB',flightNumber:'IB-demo',cabin:'BUSINESS',seats:8,points:42500,cash:119,program:'Avios',source:'demo',verification:'demo'},
    {id:'demo2',kind:'cash',origin:input.origins[1]||input.origins[0],destination:'ATH',departure:isoWithFallback(d,'18:00:00Z'),arrival:isoWithFallback(d2,'08:30:00Z'),airline:'UA',flightNumber:'UA-demo',cabin:'ECONOMY',seats:9,points:0,cash:449,program:null,source:'demo',verification:'demo'},
    {id:'demo3',kind:'award',origin:'MAD',destination:input.destination,departure:isoWithFallback(d2,'14:30:00Z'),arrival:isoWithFallback(d2,'19:15:00Z'),airline:'UX',flightNumber:'UX-demo',cabin:'ECONOMY',seats:8,points:18000,cash:42,program:'Flying Blue',source:'demo',verification:'demo'},
    {id:'demo4',kind:'cash',origin:'ATH',destination:input.destination,departure:isoWithFallback(d2,'12:30:00Z'),arrival:isoWithFallback(d2,'14:30:00Z'),airline:'A3',flightNumber:'A3-demo',cabin:'ECONOMY',seats:9,points:0,cash:137,program:null,source:'demo',verification:'demo'}
  ];
}

async function searchAmadeus(input){
  if(!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) return [];
  const token=await amadeusToken();
  const base=process.env.AMADEUS_BASE_URL || 'https://test.api.amadeus.com';
  const gateways=(input.gateways.length?input.gateways:DEFAULT_GATEWAYS).slice(0,8);
  const pairs=[];
  for(const o of input.origins.slice(0,3)) for(const g of gateways) pairs.push([o,g]);
  for(const g of gateways) pairs.push([g,input.destination]);
  const rows=[];
  for(const [origin,dest] of pairs){
    const url=new URL(`${base}/v2/shopping/flight-offers`);
    url.searchParams.set('originLocationCode',origin); url.searchParams.set('destinationLocationCode',dest);
    url.searchParams.set('departureDate',input.startDate); url.searchParams.set('adults',String(input.passengers));
    url.searchParams.set('max','5'); url.searchParams.set('currencyCode','USD');
    const r=await fetch(url,{headers:{Authorization:`Bearer ${token}`}});
    if(!r.ok) continue;
    const j=await r.json();
    for(const offer of j.data||[]){
      const itin=offer.itineraries?.[0]; if(!itin?.segments?.length) continue;
      const f=itin.segments[0], l=itin.segments[itin.segments.length-1];
      rows.push({id:`am-${offer.id}-${origin}-${dest}`,kind:'cash',origin,destination:dest,departure:f.departure.at,arrival:l.arrival.at,airline:f.carrierCode,flightNumber:`${f.carrierCode}${f.number}`,cabin:'UNKNOWN',seats:input.passengers,points:0,cash:Number(offer.price?.grandTotal||0)/input.passengers,program:null,source:'amadeus',verification:'live'});
    }
  }
  return rows;
}

async function searchSeatsAero(input){
  if(!process.env.SEATSAERO_API_KEY) return [];
  // Provider contract and endpoint shape vary by account. This adapter is intentionally isolated.
  // Replace this call with the exact endpoint/fields supplied in your Seats.aero Partner API agreement.
  return [];
}

async function searchAllProviders(input){
  const warnings=[]; const providers={amadeus:'disabled',seatsAero:'disabled',demo:'enabled'}; let segments=[];
  try { const r=await searchAmadeus(input); if(r.length){segments.push(...r); providers.amadeus='live';} else if(process.env.AMADEUS_CLIENT_ID) providers.amadeus='no-results'; } catch(e){warnings.push(e.message); providers.amadeus='error';}
  try { const r=await searchSeatsAero(input); if(r.length){segments.push(...r); providers.seatsAero='live';} else if(process.env.SEATSAERO_API_KEY) providers.seatsAero='connector-needs-contract-endpoint'; } catch(e){warnings.push(e.message); providers.seatsAero='error';}
  if(!segments.length){segments=demoSegments(input); warnings.push('No live provider returned results, so demo data is shown.');}
  return {segments,providers,warnings};
}
module.exports={searchAllProviders};
