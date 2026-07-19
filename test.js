const assert=require('assert'); const {buildCombinations}=require('./src/combiner');
const input={origins:['JFK'],destination:'TLV',passengers:2,minLayoverHours:3,maxLayoverHours:20,allowAirportChange:false,allowOvernight:true};
const s=[{id:'a',kind:'award',origin:'JFK',destination:'MAD',departure:'2026-08-01T20:00:00Z',arrival:'2026-08-02T07:00:00Z',seats:2,points:50000,cash:100},{id:'b',kind:'cash',origin:'MAD',destination:'TLV',departure:'2026-08-02T13:00:00Z',arrival:'2026-08-02T18:00:00Z',seats:2,points:0,cash:200}];
const c=buildCombinations(s,input); assert.equal(c.length,1); assert.equal(c[0].tripPoints,100000); assert.equal(c[0].tripCash,600); console.log('Tests passed');
