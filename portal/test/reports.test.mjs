import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {canAccess} from '../access-policy.mjs';
const src=readFileSync(new URL('../prototype/portal-reports.js',import.meta.url),'utf8');
const aggregate=runInNewContext(src+';reportAggregate',{window:{addEventListener(){}}});
test('reports exclude missing costs and separate currencies',()=>{
 const rows=[{consignee:'A',salePrice:100,purchasePrice:60,financeCurrency:'EUR'},{consignee:'A',salePrice:900,purchasePrice:100,financeCurrency:'USD'},{consignee:'A',salePrice:200,purchasePrice:''}];
 const result=aggregate(rows,'logistics','EUR','','');assert.equal(result[0].count,3);assert.equal(result[0].amount,40);assert.equal(result[0].priced,1);
 assert.equal(aggregate([{receiver:'A',feeCurrency:'USD',freightFee:100,guaranteeFee:20,cost:50}],'ncts','USD','','')[0].amount,120);
});
test('reports and NCTS finance allow only tenant admin',()=>{
 for(const role of ['Yönetici','Operasyon','Finans','Görüntüleme','Müşteri'])for(const action of ['reports.read','reports.export','ncts.finance.read']){
 const p={active:true,sessionRevoked:false,userId:'u',kind:role==='Müşteri'?'customer':'staff',memberships:[{active:true,tenantId:'t',role}]};
 assert.equal(canAccess(p,action,'t'),role==='Yönetici');assert.equal(canAccess(p,action,'other'),false);
 }
});

test('NCTS fees do not require a cost field',()=>{assert.equal(aggregate([{receiver:'A',feeCurrency:'EUR',freightFee:80,guaranteeFee:20}],'ncts','EUR','','')[0].amount,100);});
