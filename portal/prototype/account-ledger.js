// Internal prototype bookkeeping only. Production requires server authorization,
// tenant-scoped storage and an immutable audit trail before customer access.
function accountMinorUnits(value){
 const normalized=String(value).trim().replace(',','.');
 if(!/^\d+(\.\d{1,2})?$/.test(normalized))return null;
 const [whole,fraction='']=normalized.split('.');
 const result=Number(whole)*100+Number(fraction.padEnd(2,'0'));
 return Number.isSafeInteger(result)&&result>0?result:null;
}
function accountTotals(entries){
 return entries.reduce((total,entry)=>{
  if(entry.type==='invoice')total.invoiced+=entry.amount;
  if(entry.type==='payment')total.paid+=entry.amount;
  total.balance=total.invoiced-total.paid;return total;
 },{invoiced:0,paid:0,balance:0});
}
let selectedAccount=null;
let accountLedgerKind='customer';
function ledgerAllowed(){return accountLedgerKind==='customer'||isFinanceAdmin();}
function switchAccountLedger(kind){
 if(!['customer','carrier'].includes(kind)||(kind==='carrier'&&!isFinanceAdmin()))return;
 accountLedgerKind=kind;selectedAccount=null;document.getElementById('accountList').classList.remove('hidden');document.getElementById('accountDetail').classList.add('hidden');renderAccountLedger();
}
function accountStorageKey(){return accountLedgerKind==='carrier'?'ascend_carrier_account_entries':'ascend_account_entries';}
function changeAccountCurrency(value){
 const currency=value.trim().toUpperCase();
 if(!/^[A-Z]{3}$/.test(currency)){accountCurrencyError.textContent='EUR, USD, TRY gibi üç harfli para birimi kodu girin.';return;}
 accountCurrencyError.textContent='';openAccountDetail({...selectedAccount,currency});
}
function readAccountEntries(){if(typeof logisticsPreview!=='undefined'&&logisticsPreview)return [];if(!ledgerAllowed())return [];return JSON.parse(localStorage.getItem(accountStorageKey())||'[]');}
function accountMoney(amount,currency){return (amount/100).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' '+currency;}
function accountEntriesFor(account){return readAccountEntries().filter(entry=>normalize(entry.company)===normalize(account.company)&&entry.currency===account.currency);}
function renderAccountLedger(){
 if(!ledgerAllowed()){switchAccountLedger('customer');return;}
 carrierLedgerTab.classList.toggle('hidden',!isFinanceAdmin());
 customerLedgerTab.setAttribute('aria-pressed',String(accountLedgerKind==='customer'));
 carrierLedgerTab.setAttribute('aria-pressed',String(accountLedgerKind==='carrier'));
 accountInvoiceHeading.textContent=accountLedgerKind==='carrier'?'Bize Kesilen Faturalar':'Kesilen Faturalar';
 accountEntryType.options[0].textContent=accountLedgerKind==='carrier'?'Bize Kesilen Fatura':'Kesilen Fatura';
 accountBalanceHelp.textContent=accountLedgerKind==='carrier'?'Bakiye = bize kesilen faturalar − yaptığımız ödemeler. Pozitif bakiye acente/taşıyıcıya borcumuzdur.':'Bakiye = kestiğimiz faturalar − alınan ödemeler. Negatif bakiye müşteri alacağıdır.';
 const accounts=groupLedgerAccounts(rows,readAccountEntries(),accountLedgerKind);
 customerAccountBody.replaceChildren();
 for(const account of [...accounts.values()].sort((a,b)=>a.company.localeCompare(b.company,'tr'))){
  if(!normalize(account.company).includes(normalize(document.getElementById('accountSearch').value)))continue;
  const last=readAccountEntries().filter(e=>normalize(e.company)===normalize(account.company)).map(e=>e.date).sort().pop();
  const row=document.createElement('tr');
  const cell=document.createElement('td');
  cell.textContent=findCompany(account.company)?.shortName||account.company;cell.title=account.company;row.append(cell);
  for(const value of [account.count,last?last.split('-').reverse().join('.'):'—']){const td=document.createElement('td');td.textContent=value;row.append(td);}
  const action=document.createElement('td'),open=document.createElement('button');open.className='secondary';open.textContent='Cariyi Aç';open.onclick=()=>openAccountDetail(account);action.append(open);row.append(action);
  customerAccountBody.append(row);
 }
 if(!accounts.size)customerAccountBody.innerHTML='<tr><td colspan="4">Henüz cari hesap yok. İlgili firma bir sevkiyatta kullanıldığında burada görünür.</td></tr>';
 if(selectedAccount)renderAccountDetail();
}
function openAccountDetail(account){
 if(!ledgerAllowed())return;
 selectedAccount={...account,currency:account.currency||account.currencies?.[0]||'EUR'};document.getElementById('accountCurrency').value=selectedAccount.currency;accountEntryForm.reset();accountEntryError.textContent='';
 document.getElementById('accountList').classList.add('hidden');document.getElementById('accountDetail').classList.remove('hidden');renderAccountDetail();accountDetailTitle.focus();
}
function renderAccountDetail(){
 if(!ledgerAllowed()||!selectedAccount)return;
 const entries=readAccountEntries().filter(entry=>normalize(entry.company)===normalize(selectedAccount.company));
 const account=groupLedgerAccounts(rows,readAccountEntries(),accountLedgerKind).get(normalize(selectedAccount.company));
 const currencies=[...new Set([...(account?.currencies||[]),selectedAccount.currency])].sort();
 accountDetailTitle.textContent=selectedAccount.company;
 accountBalance.textContent='Tüm döviz bakiyeleri';
 accountCurrencySummary.replaceChildren();
 for(const currency of currencies){
  const total=accountTotals(entries.filter(entry=>entry.currency===currency));
  const row=document.createElement('tr');
  for(const value of [currency,accountMoney(Math.max(0,accountLedgerKind==='carrier'?-total.balance:total.balance),currency),accountMoney(Math.max(0,accountLedgerKind==='carrier'?total.balance:-total.balance),currency)]){const td=document.createElement('td');td.textContent=value;row.append(td);}
  accountCurrencySummary.append(row);
 }
 for(const [type,body] of [['invoice',accountInvoices],['payment',accountPayments]]){
  body.replaceChildren();
  const filtered=entries.filter(entry=>entry.type===type).sort((a,b)=>b.date.localeCompare(a.date));
  for(const entry of filtered){
   const row=document.createElement('tr');
   for(const value of [entry.reference,entry.date.split('-').reverse().join('.'),accountMoney(entry.amount,entry.currency),entry.note||'—']){const cell=document.createElement('td');cell.textContent=value;row.append(cell);}
   body.append(row);
  }
  if(!filtered.length)body.innerHTML='<tr><td colspan="4">Henüz kayıt yok.</td></tr>';
 }
}
function saveAccountEntry(event){
 if(typeof logisticsPreview!=='undefined'&&logisticsPreview){event.preventDefault();return;}
 event.preventDefault();if(!selectedAccount||!ledgerAllowed())return;
 const currency=document.getElementById('accountCurrency').value.trim().toUpperCase();
 if(!/^[A-Z]{3}$/.test(currency)){accountEntryError.textContent='Üç harfli para birimi kodu girin (EUR, USD, GBP).';return;}
 selectedAccount.currency=currency;
 const reference=accountEntryRef.value.trim(),date=accountEntryDate.value,amount=accountMinorUnits(accountEntryAmount.value);
 const checks=[[accountEntryRef,!reference,'Fatura numarası veya ödeme referansı girin.'],[accountEntryDate,!date,'İşlem tarihini girin.'],[accountEntryAmount,amount===null,'Sıfırdan büyük, en fazla iki ondalıklı tutar girin. Binlik ayırıcı kullanmayın.']];
 checks.forEach(([field,invalid])=>field.setAttribute('aria-invalid',String(invalid)));
 const invalid=checks.find(([,failed])=>failed);if(invalid){accountEntryError.textContent=invalid[2];invalid[0].focus();return;}
 const entries=readAccountEntries();
 if(accountEntriesFor(selectedAccount).some(entry=>entry.type===accountEntryType.value&&normalize(entry.reference)===normalize(reference))){accountEntryError.textContent='Bu referans aynı firma, para birimi ve kayıt türü için zaten kayıtlı.';accountEntryRef.focus();return;}
 const entry={id:crypto.randomUUID(),company:selectedAccount.company,currency:selectedAccount.currency,type:accountEntryType.value,reference,date,amount,note:accountEntryNote.value.trim()};
 try{localStorage.setItem(accountStorageKey(),JSON.stringify([...entries,entry]));}
 catch{accountEntryError.textContent='Kayıt saklanamadı. Bilgiler korunuyor; tarayıcı depolamasını kontrol edin.';return;}
 accountEntryForm.reset();accountEntryError.textContent='';renderAccountLedger();accountBalance.textContent='Kayıt eklendi. '+accountBalance.textContent;
}

function groupLedgerAccounts(shipments,entries,kind){
 const accounts=new Map();
 const ensure=(company,currency)=>{const key=normalize(company);if(!accounts.has(key))accounts.set(key,{company,count:0,currencies:[]});const account=accounts.get(key);if(!account.currencies.includes(currency))account.currencies.push(currency);return account;};
 shipments.forEach(row=>{const company=kind==='carrier'?row.agent:row.consignee;if(company)ensure(company,row.financeCurrency||'EUR').count++;});
 entries.forEach(entry=>ensure(entry.company,entry.currency));
 for(const account of accounts.values())account.currencies.sort();
 return accounts;
}
function accountDebt(balance,currency,kind){
 if(!balance)return accountMoney(0,currency)+' · Borç yok';
 const weOwe=kind==='carrier'?balance>0:balance<0;
 return accountMoney(Math.abs(balance),currency)+(weOwe?' · Biz firmaya borçluyuz':' · Firma bize borçlu');
}
