function addDays(date,n){const d=new Date(`${date}T00:00:00Z`);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
function at(date,time){return `${date}T${time}:00Z`;}
function demoSegments(input){
  const d=input.startDate,d2=addDays(d,1);const origins=input.originAirports.slice(0,3);const hubs=input.connectionAirports.slice(0,12);const dests=input.destinationAirports.slice(0,3);
  const rows=[];let id=1;
  origins.forEach((o,oi)=>hubs.forEach((h,hi)=>{
    if((oi+hi)%3===0) rows.push({id:`d${id++}`,kind:'cash',origin:o,destination:h,departure:at(d,`${String(16+oi).padStart(2,'0')}:10`),arrival:at(d2,`${String(6+(hi%4)).padStart(2,'0')}:20`),airline:['LY','A3','W6'][hi%3],flightNumber:`DEMO${id}`,cabin:'ECONOMY',seats:9,points:0,cash:160+hi*18,source:'demo',verification:'demo'});
    if((oi+hi)%4===0) rows.push({id:`d${id++}`,kind:'award',origin:o,destination:h,departure:at(d,`${String(18+oi).padStart(2,'0')}:00`),arrival:at(d2,`${String(7+(hi%3)).padStart(2,'0')}:15`),airline:['AF','IB','UA'][hi%3],flightNumber:`DEMO${id}`,cabin:hi%2?'BUSINESS':'ECONOMY',seats:4+(hi%5),points:18000+hi*2500,cash:35+hi*4,program:['Flying Blue','Avios','Aeroplan'][hi%3],source:'demo',verification:'demo'});
  }));
  hubs.forEach((h,hi)=>dests.forEach((dest,di)=>{
    rows.push({id:`d${id++}`,kind:hi%2?'award':'cash',origin:h,destination:dest,departure:at(d2,`${String(12+(hi%7)).padStart(2,'0')}:30`),arrival:at(d2,`${String(17+(hi%5)).padStart(2,'0')}:40`),airline:['DL','UA','AA','BA'][hi%4],flightNumber:`DEMO${id}`,cabin:hi%3===0?'BUSINESS':'ECONOMY',seats:3+(hi%7),points:hi%2?22000+hi*1800:0,cash:hi%2?55+hi*5:280+hi*22,program:hi%2?['Flying Blue','Avios','Aeroplan'][hi%3]:null,source:'demo',verification:'demo'});
  }));
  return rows;
}
async function searchAllProviders(input){
  return {segments:demoSegments(input),providers:{demo:'enabled',cashApi:'not-connected',awardApi:'not-connected'},warnings:['Using generated demo data. The worldwide combination engine is active; live providers are not connected yet.']};
}
module.exports={searchAllProviders};
