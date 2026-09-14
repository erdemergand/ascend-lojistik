import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const source=readFileSync(new URL('../prototype/account-ledger.js',import.meta.url),'utf8');
const ledger=runInNewContext(source+';({accountMinorUnits,accountTotals})');
test('money is stored as integer cents; invalid precision and negatives are rejected',()=>{
 assert.equal(ledger.accountMinorUnits('1250,50'),125050);
 assert.equal(ledger.accountMinorUnits('0.10'),10);
 for(const value of ['0','-5','1.234','1.250,50','','NaN'])assert.equal(ledger.accountMinorUnits(value),null);
});
test('partial payments and credits reconcile independently of shipment sales',()=>{
 const total=ledger.accountTotals([{type:'invoice',amount:225000},{type:'payment',amount:100000},{type:'payment',amount:25000}]);
 assert.equal(total.balance,100000);assert.equal(total.invoiced,225000);assert.equal(total.paid,125000);
 assert.equal(ledger.accountTotals([{type:'payment',amount:5000}]).balance,-5000);
});

test('currencies and carrier records stay separate; non-admin carrier reads fail closed',()=>{
 const data={ascend_account_entries:JSON.stringify([{company:'Demo',currency:'EUR',amount:100},{company:'Demo',currency:'USD',amount:200}]),ascend_carrier_account_entries:JSON.stringify([{company:'Demo',currency:'EUR',amount:300}])};
 const context={localStorage:{getItem:key=>data[key]},normalize:s=>s.toLowerCase(),isFinanceAdmin:()=>false};
 assert.equal(runInNewContext(source+`;accountEntriesFor({company:'Demo',currency:'EUR'})[0].amount`,{...context}),100);
 assert.equal(runInNewContext(source+`;accountEntriesFor({company:'Demo',currency:'USD'})[0].amount`,{...context}),200);
 assert.equal(runInNewContext(source+`;accountLedgerKind='carrier';readAccountEntries().length`,{...context}),0);
 assert.equal(runInNewContext(source+`;accountLedgerKind='carrier';readAccountEntries()[0].amount`,{...context,isFinanceAdmin:()=>true}),300);
});


test('one company groups multiple shipment currencies and both debt directions',()=>{
 const api=runInNewContext(source+';({groupLedgerAccounts,accountDebt})',{normalize:s=>s.toLowerCase()});
 const shipments=[{consignee:'Demo',agent:'Carrier',financeCurrency:'EUR'},{consignee:'Demo',agent:'Carrier',financeCurrency:'USD'}];
 for(const kind of ['customer','carrier']){
  const groups=api.groupLedgerAccounts(shipments,[],kind);
  assert.equal(groups.size,1);const account=[...groups.values()][0];assert.equal(account.count,2);assert.equal(account.currencies.join(','),'EUR,USD');
 }
 assert.match(api.accountDebt(100,'EUR','customer'),/Firma bize borçlu/);
 assert.match(api.accountDebt(-100,'USD','customer'),/Biz firmaya borçluyuz/);
 assert.match(api.accountDebt(100,'GBP','carrier'),/Biz firmaya borçluyuz/);
 assert.match(api.accountDebt(-100,'EUR','carrier'),/Firma bize borçlu/);
});
