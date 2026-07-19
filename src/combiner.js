const AIRPORT_GROUPS = {
  PAR: ['CDG','ORY'], LON: ['LHR','LGW','LCY','STN','LTN'], MIL: ['MXP','LIN','BGY'],
  ROM: ['FCO','CIA'], BRU: ['BRU','CRL'], NYC: ['JFK','EWR','LGA']
};

function sameMetro(a,b) {
  if (a === b) return true;
  return Object.values(AIRPORT_GROUPS).some(g => g.includes(a) && g.includes(b));
}
function hours(ms){ return ms / 3_600_000; }
function money(v){ return Math.round((v + Number.EPSILON) * 100) / 100; }

function scoreCombo(a,b,layoverH,input){
  let score = 100;
  const airportChange = a.destination !== b.origin;
  if (airportChange) score -= 25;
  if (layoverH < 4) score -= 30;
  else if (layoverH < 6) score -= 15;
  if (layoverH > 16) score -= 8;
  const overnight = new Date(a.arrival).getUTCDate() !== new Date(b.departure).getUTCDate();
  if (overnight) score -= 4;
  if ((a.verification || '').startsWith('cached')) score -= 8;
  if ((b.verification || '').startsWith('cached')) score -= 8;
  if (a.seats === input.passengers || b.seats === input.passengers) score -= 5;
  return Math.max(1, score);
}

function buildCombinations(segments,input){
  const first = segments.filter(s => input.origins.includes(s.origin));
  const second = segments.filter(s => s.destination === input.destination);
  const out=[];
  for (const a of first) for (const b of second) {
    if (!sameMetro(a.destination,b.origin)) continue;
    if (a.destination !== b.origin && !input.allowAirportChange) continue;
    if (a.seats < input.passengers || b.seats < input.passengers) continue;
    const layoverH = hours(new Date(b.departure)-new Date(a.arrival));
    const airportChangeBuffer = a.destination !== b.origin ? 3 : 0;
    if (layoverH < input.minLayoverHours + airportChangeBuffer || layoverH > input.maxLayoverHours) continue;
    const overnight = new Date(a.arrival).toDateString() !== new Date(b.departure).toDateString();
    if (overnight && !input.allowOvernight) continue;
    const points = (a.points||0)+(b.points||0);
    const cash = money((a.cash||0)+(b.cash||0));
    const type = [a.kind,b.kind].join(' + ');
    out.push({
      id:`${a.id}__${b.id}`, type, firstLeg:a, secondLeg:b,
      layoverHours: money(layoverH), airportChange:a.destination!==b.origin,
      overnight, totalPointsPerPerson:points, totalCashPerPerson:cash,
      tripPoints:points*input.passengers, tripCash:money(cash*input.passengers),
      score:scoreCombo(a,b,layoverH,input)
    });
  }
  return out.sort((x,y)=> y.score-x.score || x.tripCash-y.tripCash || x.tripPoints-y.tripPoints).slice(0,250);
}
module.exports={buildCombinations};
