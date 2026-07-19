const AIRPORTS = {
  TLV:{city:'Tel Aviv',country:'IL',region:'MIDDLE_EAST'}, JFK:{city:'New York',country:'US',region:'NORTH_AMERICA'},
  EWR:{city:'New York',country:'US',region:'NORTH_AMERICA'}, LGA:{city:'New York',country:'US',region:'NORTH_AMERICA'},
  BOS:{city:'Boston',country:'US',region:'NORTH_AMERICA'}, PHL:{city:'Philadelphia',country:'US',region:'NORTH_AMERICA'},
  IAD:{city:'Washington',country:'US',region:'NORTH_AMERICA'}, YYZ:{city:'Toronto',country:'CA',region:'NORTH_AMERICA'},
  YUL:{city:'Montreal',country:'CA',region:'NORTH_AMERICA'}, LHR:{city:'London',country:'GB',region:'EUROPE'},
  LGW:{city:'London',country:'GB',region:'EUROPE'}, CDG:{city:'Paris',country:'FR',region:'EUROPE'}, ORY:{city:'Paris',country:'FR',region:'EUROPE'},
  AMS:{city:'Amsterdam',country:'NL',region:'EUROPE'}, MAD:{city:'Madrid',country:'ES',region:'EUROPE'}, BCN:{city:'Barcelona',country:'ES',region:'EUROPE'},
  LIS:{city:'Lisbon',country:'PT',region:'EUROPE'}, FCO:{city:'Rome',country:'IT',region:'EUROPE'}, MXP:{city:'Milan',country:'IT',region:'EUROPE'},
  ZRH:{city:'Zurich',country:'CH',region:'EUROPE'}, VIE:{city:'Vienna',country:'AT',region:'EUROPE'}, PRG:{city:'Prague',country:'CZ',region:'EUROPE'},
  WAW:{city:'Warsaw',country:'PL',region:'EUROPE'}, ATH:{city:'Athens',country:'GR',region:'EUROPE'}, OTP:{city:'Bucharest',country:'RO',region:'EUROPE'},
  FRA:{city:'Frankfurt',country:'DE',region:'EUROPE'}, MUC:{city:'Munich',country:'DE',region:'EUROPE'}, BRU:{city:'Brussels',country:'BE',region:'EUROPE'},
  DUB:{city:'Dublin',country:'IE',region:'EUROPE'}, CPH:{city:'Copenhagen',country:'DK',region:'EUROPE'}, HEL:{city:'Helsinki',country:'FI',region:'EUROPE'},
  OSL:{city:'Oslo',country:'NO',region:'EUROPE'}, ARN:{city:'Stockholm',country:'SE',region:'EUROPE'}, BUD:{city:'Budapest',country:'HU',region:'EUROPE'},
  BEG:{city:'Belgrade',country:'RS',region:'EUROPE'}, IST:{city:'Istanbul',country:'TR',region:'EUROPE'}, DXB:{city:'Dubai',country:'AE',region:'MIDDLE_EAST'},
  AUH:{city:'Abu Dhabi',country:'AE',region:'MIDDLE_EAST'}, DOH:{city:'Doha',country:'QA',region:'MIDDLE_EAST'}, CAI:{city:'Cairo',country:'EG',region:'AFRICA'},
  NRT:{city:'Tokyo',country:'JP',region:'ASIA'}, HND:{city:'Tokyo',country:'JP',region:'ASIA'}, SIN:{city:'Singapore',country:'SG',region:'ASIA'},
  SYD:{city:'Sydney',country:'AU',region:'OCEANIA'}, MEL:{city:'Melbourne',country:'AU',region:'OCEANIA'}, GRU:{city:'Sao Paulo',country:'BR',region:'SOUTH_AMERICA'}
};

const GROUPS = {
  NYC:['JFK','EWR','LGA'], LON:['LHR','LGW'], PAR:['CDG','ORY'], TYO:['NRT','HND'],
  EUROPE:Object.keys(AIRPORTS).filter(k=>AIRPORTS[k].region==='EUROPE'),
  NORTH_AMERICA:Object.keys(AIRPORTS).filter(k=>AIRPORTS[k].region==='NORTH_AMERICA'),
  MIDDLE_EAST:Object.keys(AIRPORTS).filter(k=>AIRPORTS[k].region==='MIDDLE_EAST'),
  ASIA:Object.keys(AIRPORTS).filter(k=>AIRPORTS[k].region==='ASIA'),
  OCEANIA:Object.keys(AIRPORTS).filter(k=>AIRPORTS[k].region==='OCEANIA'),
  SOUTH_AMERICA:Object.keys(AIRPORTS).filter(k=>AIRPORTS[k].region==='SOUTH_AMERICA'),
  AFRICA:Object.keys(AIRPORTS).filter(k=>AIRPORTS[k].region==='AFRICA')
};

function expandLocation(value){
  if(Array.isArray(value)) return [...new Set(value.flatMap(expandLocation))];
  const tokens=String(value||'').split(',').map(s=>s.trim().toUpperCase()).filter(Boolean);
  return [...new Set(tokens.flatMap(t=>GROUPS[t] || (AIRPORTS[t]?[t]:[])))];
}
function sameMetro(a,b){
  if(a===b) return true;
  return Object.values(GROUPS).some(g=>g.length<10 && g.includes(a) && g.includes(b));
}
function label(code){const a=AIRPORTS[code];return a?`${code} · ${a.city}`:code;}
module.exports={AIRPORTS,GROUPS,expandLocation,sameMetro,label};
