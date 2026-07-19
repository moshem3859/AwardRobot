const http=require('http');const fs=require('fs');const path=require('path');const {URL}=require('url');
const {searchAllProviders}=require('./src/providers');const {buildCombinations}=require('./src/combiner');const {expandLocation,GROUPS}=require('./src/locations');
const PORT=process.env.PORT||3000;const PUBLIC=path.join(__dirname,'public');
function send(res,status,body,type='application/json'){res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store'});res.end(type.includes('json')?JSON.stringify(body):body);}
function readBody(req){return new Promise((resolve,reject)=>{let data='';req.on('data',c=>{data+=c;if(data.length>1_000_000)reject(new Error('Request too large'));});req.on('end',()=>{try{resolve(data?JSON.parse(data):{});}catch{reject(new Error('Invalid JSON'));}});});}
function serveStatic(req,res){const url=new URL(req.url,`http://${req.headers.host}`);const file=url.pathname==='/'?'/index.html':url.pathname;const full=path.normalize(path.join(PUBLIC,file));if(!full.startsWith(PUBLIC))return send(res,403,'Forbidden','text/plain');if(!fs.existsSync(full)||fs.statSync(full).isDirectory())return send(res,404,'Not found','text/plain');const ext=path.extname(full);const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript'};send(res,200,fs.readFileSync(full),types[ext]||'application/octet-stream');}
const server=http.createServer(async(req,res)=>{try{
  if(req.method==='GET'&&req.url==='/api/health')return send(res,200,{ok:true,version:'0.2.0',providers:{demo:true,cashApi:false,awardApi:false}});
  if(req.method==='GET'&&req.url==='/api/groups')return send(res,200,{groups:Object.keys(GROUPS)});
  if(req.method==='POST'&&req.url==='/api/search'){
    const x=await readBody(req);const originAirports=expandLocation(x.origin);const destinationAirports=expandLocation(x.destination);const connectionAirports=expandLocation(x.connectionRegion||'EUROPE');
    if(!originAirports.length)return send(res,400,{error:'No recognized origin airports or group'});if(!destinationAirports.length)return send(res,400,{error:'No recognized destination airports or group'});if(!connectionAirports.length)return send(res,400,{error:'No recognized connection airports or region'});
    const input={originAirports,destinationAirports,connectionAirports,startDate:x.startDate,endDate:x.endDate||x.startDate,passengers:Number(x.passengers||1),cabin:x.cabin||'ANY',minLayoverHours:Number(x.minLayoverHours||3),maxLayoverHours:Number(x.maxLayoverHours||24),airportChangeExtraHours:Number(x.airportChangeExtraHours||3),allowAirportChange:Boolean(x.allowAirportChange),allowOvernight:x.allowOvernight!==false,allowedCombinations:x.allowedCombinations||['cash + award','award + cash','award + award','cash + cash'],pointValueCpp:Number(x.pointValueCpp||1.25),maxResults:Number(x.maxResults||100)};
    if(!input.startDate)return send(res,400,{error:'startDate is required'});if(input.passengers<1||input.passengers>9)return send(res,400,{error:'passengers must be 1-9'});
    const p=await searchAllProviders(input);const combinations=buildCombinations(p.segments,input);return send(res,200,{query:input,providers:p.providers,warnings:p.warnings,searchedAt:new Date().toISOString(),segmentCount:p.segments.length,combinations});
  }
  return serveStatic(req,res);
}catch(e){console.error(e);return send(res,500,{error:e.message||'Unexpected error'});}});
server.listen(PORT,()=>console.log(`AwardRobot v2 running at http://localhost:${PORT}`));
