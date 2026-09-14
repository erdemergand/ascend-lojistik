import test from 'node:test';
import assert from 'node:assert/strict';
import '../prototype/notification-templates.js';
test('departure and arrival messages have distinct dates and no internal finance',()=>{
 const record={fileNo:'DEMO-1',shipper:'Tam Unvan Ltd. Şti.',consignee:'Alıcı',agent:'SECRET-CARRIER',agentId:'SECRET-ID',carrier:{name:'SECRET'},departureDate:'2026-09-11',arrivalDate:'2026-09-14',plate:'DEMO',profit:'SECRET',share:'SECRET',shareTL:'SECRET',purchasePrice:'SECRET',salePrice:'SECRET'};
 for(const event of ['departure','arrival']){
  const notice=AscendNotifications.create(record,event);
  assert.ok(notice.subject.includes(event==='departure'?'Çıkış':'Varış'));
  assert.ok(notice.text.includes(event==='departure'?'2026-09-11':'2026-09-14'));
  assert.ok(notice.text.includes(record.shipper));
  assert.ok(!JSON.stringify(notice).includes('SECRET'));
  assert.ok(!JSON.stringify(notice).includes('Acente'));
  if(event==='arrival')assert.ok(notice.text.includes('DEMO-1 numaralı sevkiyatın varış bildirimi 2026-09-14 tarihinde oluşturulmuştur.'));
  assert.ok(notice.attachmentName.endsWith('.pdf'));
 }
 assert.throws(()=>AscendNotifications.create({},'departure'));
 assert.throws(()=>AscendNotifications.create(record,'wrong'));
});
test('arrival contains customs fields and both notices contain selected original documents',()=>{
 const record={fileNo:'DEMO-2',departureDate:'2026-09-11',arrivalDate:'2026-09-14',reg:'REG-1',warehouse:'Depo A',warehouseNo:'AMBAR-1',originalDocs:['Invoice','Packing List','A.TR']};
 const departure=AscendNotifications.create(record,'departure');
 const arrival=AscendNotifications.create(record,'arrival');
 for(const value of ['REG-1','Depo A','AMBAR-1']){
  assert.ok(arrival.text.includes(value));assert.ok(!departure.text.includes(value));
 }
 for(const notice of [departure,arrival]){
  assert.ok(notice.text.includes('Orijinal Evraklar: Invoice, Packing List, A.TR'));
  assert.ok(notice.fields.some(([label,value])=>label==='Orijinal Evraklar'&&value==='Invoice, Packing List, A.TR'));
 }
});
