const {sameMetro}=require('./locations');
const hours=ms=>ms/3_600_000;
const money=v=>Math.round((Number(v||0)+Number.EPSILON)*100)/100;

function pointValue(points, centsPerPoint){return money(points*(centsPerPoint/100));}
function safetyScore(a,b,layoverH,input){
  let score=100;
  const airportChange=a.destination!==b.origin;
  if(airportChange) score-=25;
  if(layoverH<input.minLayoverHours+1) score-=25; else if(layoverH<6) score-=10;
  if(layoverH>18) score-=8;
  if(a.kind!==b.kind) score-=3;
  if(a.seats===input.passengers||b.seats===input.passengers) score-=5;
  if(a.verification!=='live') score-=6;
  if(b.verification!=='live') score-=6;
  return Math.max(1,score);
}
function buildCombinations(segments,input){
  const first=segments.filter(s=>input.originAirports.includes(s.origin)&&input.connectionAirports.includes(s.destination));
  const second=segments.filter(s=>input.connectionAirports.includes(s.origin)&&input.destinationAirports.includes(s.destination));
  const allowed=new Set(input.allowedCombinations||['cash + award','award + cash','award + award','cash + cash']);
  const out=[];
  for(const a of first) for(const b of second){
    if(!sameMetro(a.destination,b.origin)) continue;
    const comboType=`${a.kind} + ${b.kind}`;
    if(!allowed.has(comboType)) continue;
    const airportChange=a.destination!==b.origin;
    if(airportChange&&!input.allowAirportChange) continue;
    if((a.seats||0)<input.passengers||(b.seats||0)<input.passengers) continue;
    const layoverH=hours(new Date(b.departure)-new Date(a.arrival));
    const buffer=airportChange?input.airportChangeExtraHours:0;
    if(layoverH<input.minLayoverHours+buffer||layoverH>input.maxLayoverHours) continue;
    const overnight=new Date(a.arrival).toISOString().slice(0,10)!==new Date(b.departure).toISOString().slice(0,10);
    if(overnight&&!input.allowOvernight) continue;
    const points=(a.points||0)+(b.points||0);
    const cash=money((a.cash||0)+(b.cash||0));
    const cashEquivalent=money(cash+pointValue(points,input.pointValueCpp));
    const safety=safetyScore(a,b,layoverH,input);
    const valueScore=Math.max(0,100-Math.round(cashEquivalent/20));
    const rankScore=Math.round(safety*0.55+valueScore*0.45);
    out.push({
      id:`${a.id}__${b.id}`,comboType,firstLeg:a,secondLeg:b,layoverHours:money(layoverH),airportChange,overnight,
      totalPointsPerPerson:points,totalCashPerPerson:cash,tripPoints:points*input.passengers,tripCash:money(cash*input.passengers),
      cashEquivalentPerPerson:cashEquivalent,safetyScore:safety,rankScore
    });
  }
  return out.sort((x,y)=>y.rankScore-x.rankScore||x.cashEquivalentPerPerson-y.cashEquivalentPerPerson||x.layoverHours-y.layoverHours).slice(0,input.maxResults||250);
}
module.exports={buildCombinations};
