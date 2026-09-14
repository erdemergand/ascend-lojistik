import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createPortalServer} from '../server.mjs';
test('server session isolates company data and document URLs, including forged browser roles',async()=>{
 const server=await createPortalServer({PORTAL_PREVIEW_ENABLED:'true',PORTAL_PREVIEW_USER:'test',PORTAL_PREVIEW_PASSWORD:'a-long-enough-preview-password'});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;const auth='Basic '+Buffer.from('test:a-long-enough-preview-password').toString('base64');
 async function call(path,body,cookie){return fetch(base+path,{method:body?'POST':'GET',headers:{Authorization:auth,...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});}
 try{
 const admin=await call('/api/tenant/login',{username:'yonetici.demo',password:'AscendDemo!2026'});assert.equal(admin.status,200);const a=admin.headers.get('set-cookie').split(';')[0];
 assert.equal((await call('/api/tenant/sync',{companies:[{id:'x',name:'X Firma'},{id:'y',name:'Y Firma'}],shipments:[{fileNo:'X-1',shipper:'X Firma',agent:'PRIVATE CARRIER',purchasePrice:77,mailHistory:['private'],salePrice:90},{fileNo:'Y-1',shipper:'Y Firma',salePrice:400}],ncts:[{no:'NX',sender:'X Firma',freightFee:22,fields:{nSender:'X Firma',privateCarrier:'SECRET'}},{no:'NY',sender:'Y Firma'}],users:[{username:'yonetici.demo',role:'Yönetici',active:true},{username:'x',password:'customer-test',role:'Görüntüleme',companyId:'x',active:true},{username:'y',password:'customer-test',role:'Görüntüleme',companyId:'y',active:true}]},a)).status,200);
 const login=await call('/api/tenant/login',{username:'x',password:'customer-test'});const x=login.headers.get('set-cookie').split(';')[0];const result=await call('/api/tenant/data',null,x);const data=await result.json();assert.deepEqual(data.shipments.map(r=>r.fileNo),['X-1']);assert.deepEqual(data.ncts.map(r=>r.no),['NX']);assert.equal(data.shipments[0].agent,undefined);assert.equal(data.shipments[0].purchasePrice,undefined);assert.equal(data.ncts[0].freightFee,undefined);assert.equal(data.ncts[0].fields.privateCarrier,undefined);
 assert.equal((await call('/api/tenant/document/shipments/Y-1',null,x)).status,404);assert.equal((await call('/api/tenant/document/ncts/NY',null,x)).status,404);assert.equal((await call('/api/tenant/document/shipments/X-1',null,x)).status,200);
 assert.equal((await call('/api/tenant/sync',{shipments:[]},x)).status,403);
 assert.equal((await call('/03_KULLANICI_YONETIMI.html',null,x)).status,403);
 const page=await (await call('/02_LOJISTIK_PORTAL_BRANDED_v14.html?view=admin',null,x)).text();assert.ok(page.includes('window.portalBootstrap'));assert.ok(!page.includes('PRIVATE CARRIER'));assert.ok(!page.includes('"fileNo":"Y-1"'));
 assert.equal((await call('/api/tenant/sync',{companies:[{id:'x',name:'X Yeni Unvan'},{id:'y',name:'Y Firma'}]},a)).status,200);
 const afterRename=await (await call('/api/tenant/data',null,x)).json();assert.deepEqual(afterRename.shipments.map(r=>r.fileNo),['X-1']);
 assert.equal((await call('/api/tenant/sync',{companies:[{id:'x',name:'Y Firma'},{id:'y',name:'Y Firma'}]},a)).status,400);
 assert.equal((await call('/api/tenant/data')).status,401);await call('/api/tenant/logout',{},x);assert.equal((await call('/api/tenant/data',null,x)).status,401);
 }finally{await new Promise(r=>server.close(r));}
});
