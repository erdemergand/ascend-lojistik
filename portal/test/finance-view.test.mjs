import test from 'node:test';
import assert from 'node:assert/strict';
import { shipmentFinanceView } from '../access-policy.mjs';
const record={id:'demo',tenantId:'a',customerVisible:true,fileNo:'DEMO',shipper:'Sender',consignee:'Receiver',salePrice:250,financeCurrency:'EUR',arrivalDate:'2026-09-11',paymentDate:'',agent:'Private carrier',purchasePrice:100,profit:150,share:50,exchangeRate:40,shareTL:2000};
const identity=(role,kind='staff')=>({userId:'u',active:true,sessionRevoked:false,kind,memberships:[{tenantId:'a',role,active:true}]});
test('private financial fields are admin-only for read and export',()=>{
 for(const action of ['shipments.finance.read','shipments.finance.export']){
  for(const role of ['Yönetici','Operasyon','Finans','Görüntüleme']){
   const view=shipmentFinanceView(identity(role),record,action);
   for(const field of ['purchasePrice','profit','share','exchangeRate','shareTL'])assert.equal(field in view,role==='Yönetici');
   assert.equal(view.agent,record.agent);assert.equal(view.salePrice,250);
  }
  const view=shipmentFinanceView(identity('Müşteri','customer'),record,action);
  assert.equal(view.salePrice,250);
  for(const field of ['agent','purchasePrice','profit','share','exchangeRate','shareTL'])assert.equal(field in view,false);
  assert.throws(()=>shipmentFinanceView(identity('Müşteri','customer'),{...record,tenantId:'b'},action));
  assert.throws(()=>shipmentFinanceView(identity('Müşteri','customer'),{...record,customerVisible:false},action));
 }
});
