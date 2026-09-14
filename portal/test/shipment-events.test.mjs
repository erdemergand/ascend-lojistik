import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const html=readFileSync(new URL('../prototype/02_LOJISTIK_PORTAL_BRANDED_v14.html',import.meta.url),'utf8');
const source=html.slice(html.indexOf('function shipmentToday('),html.indexOf('function recordShipmentEvent('));
const {shipmentToday,stampShipmentEvent}=runInNewContext(`${source}; ({shipmentToday,stampShipmentEvent})`);
test('dates use Turkey calendar at UTC midnight boundary',()=>{
 assert.equal(shipmentToday(new Date('2026-09-11T22:30:00Z')),'2026-09-12');
});
test('departure then arrival require no manual dates and preserve first click dates',()=>{
 const record={plate:'DEMO-01',billNo:'DEMO-BL-01',containerNo:'DEMO-CONT-01',reg:'DEMO-REG-1'};
 assert.equal(stampShipmentEvent(record,'arrival'),false);
 const first=new Date('2026-09-11T10:00:00Z'),next=new Date('2026-09-12T10:00:00Z');
 stampShipmentEvent(record,'departure',first);
 stampShipmentEvent(record,'departure',next);
 assert.equal(record.departureDate,'2026-09-11');
 stampShipmentEvent(record,'arrival',next);
 stampShipmentEvent(record,'arrival',new Date('2026-09-13T10:00:00Z'));
 assert.equal(record.arrivalDate,'2026-09-12');
 assert.equal(record.arrivalIssued,true);
});
test('any one transport identifier permits departure',()=>{
 for(const field of ['plate','billNo','containerNo']){
   const record={[field]:'DEMO-01'};
   assert.equal(stampShipmentEvent(record,'departure'),true);
   assert.equal(record.departureIssued,true);
 }
});
test('arrival requires one registry or warehouse field even after departure',()=>{
 const empty={departureIssued:true,reg:' ',warehouse:'',warehouseNo:''};
 assert.equal(stampShipmentEvent(empty,'arrival'),false);
 assert.equal(empty.arrivalDate,undefined);
 for(const field of ['reg','warehouse','warehouseNo']){
  const record={departureIssued:true,[field]:'DEMO'};
  assert.equal(stampShipmentEvent(record,'arrival'),true);
  assert.equal(record.arrivalIssued,true);
 }
});
test('all blank or whitespace identifiers block departure without changing state',()=>{
  for(const value of ['', '   ', undefined]){
   const record={plate:value,billNo:value,containerNo:value};
   assert.equal(stampShipmentEvent(record,'departure'),false);
   assert.equal(record.departureIssued,undefined);
   assert.equal(record.departureDate,undefined);
  }
});
