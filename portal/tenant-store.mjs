import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { dirname } from 'node:path';
const customerRoles=new Set(['Müşteri','Görüntüleme']);
const hash=(password,salt)=>scryptSync(password,salt,32).toString('hex');
const pick=(obj,keys)=>Object.fromEntries(keys.filter(k=>obj[k]!==undefined).map(k=>[k,obj[k]]));
const publicLogistics=['id','fileNo','direction','shipper','consignee','country','packages','weight','loadingDate','departureIssued','departureDate','arrivalDate','plate','billNo','containerNo','goods','originalDocs','reg','warehouse','warehouseNo','salePrice','financeCurrency','currency','value','paymentDate','customs','doc'];
const publicNcts=['id','no','date','sender','receiver','origin','packages','gross','destCustoms','items'];
const publicNctsFields=['nctsNo','nctsFormDate','nSender','field_4','field_5','nReceiver','field_9','field_10','field_16','field_17','nOriginCountry','nTotalPackages','nGross','field_21','field_22','nDestCustoms','field_30','field_31','nValueCurrency','field_32','field_33','field_34'];
export async function createTenantStore(path){
 let state={users:[],companies:[],shipments:[],ncts:[]};
 if(path){try{state=JSON.parse(await readFile(path,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}}
 function user(data){const salt=randomBytes(16).toString('hex');return {...pick(data,['username','name','role','companyId','companyName','active','email']),salt,passwordHash:hash(data.password,salt)};}
 if(!state.users.length){state.users=[user({username:'yonetici.demo',name:'Demo Yönetici',role:'Yönetici',password:'AscendDemo!2026',active:true}),user({username:'personel.demo',name:'Demo Personel',role:'Operasyon',password:'AscendDemo!2026',active:true}),user({username:'musteri.demo',name:'Demo Müşteri',role:'Görüntüleme',companyId:'demo-anadolu',password:'AscendDemo!2026',active:true})];state.companies=[{id:'demo-anadolu',name:'DEMO Anadolu Dış Ticaret Ltd. Şti.'}];}
 function bind(record,module){if(Array.isArray(record.customerCompanyIds))return record;const names=module==='ncts'?[record.sender,record.receiver]:[record.shipper,record.consignee];return {...record,customerCompanyIds:state.companies.filter(c=>names.includes(c.name)).map(c=>String(c.id||c.name))};}
 state.shipments=state.shipments.map(r=>bind(r,'shipments'));state.ncts=state.ncts.map(r=>bind(r,'ncts'));
 let pending=Promise.resolve();function persist(){if(!path)return Promise.resolve();const snapshot=JSON.stringify(state);pending=pending.then(async()=>{await mkdir(dirname(path),{recursive:true});await writeFile(path+'.tmp',snapshot);await rename(path+'.tmp',path);});return pending;}
 await persist();const sessions=new Map();
 const visibleUser=u=>pick(u,['username','name','role','companyId','companyName','email','active']);
 function principal(req){const token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('ascend_sid='))?.slice(11);const session=sessions.get(token);if(!session||session.expires<Date.now())return null;return state.users.find(u=>u.username===session.username&&u.active)||null;}
 function own(u,r,module){if(!customerRoles.has(u.role))return true;if(!u.companyId)return false;const c=state.companies.find(c=>String(c.id||c.name)===u.companyId);if(!c)return false;const ids=r.customerCompanyIds;if(Array.isArray(ids))return ids.includes(u.companyId);return false;}
 function records(u,module){return state[module].filter(r=>own(u,r,module)).map(r=>{if(u.role==='Yönetici')return r;if(!customerRoles.has(u.role)){const safe={...r};for(const k of ['purchasePrice','profit','share','shareTL','exchangeRate','freightFee','guaranteeFee'])delete safe[k];return safe;}if(module==='shipments')return pick(r,publicLogistics);return {...pick(r,publicNcts),fields:pick(r.fields||{},publicNctsFields)};});}
 function data(u){const companies=customerRoles.has(u.role)?state.companies.filter(c=>String(c.id||c.name)===u.companyId).map(c=>pick(c,['id','name','shortName','country','address'])):state.companies;return {user:visibleUser(u),companies,shipments:records(u,'shipments'),ncts:records(u,'ncts'),users:u.role==='Yönetici'?state.users.map(visibleUser):[]};}
 async function sync(u,body){
 if(customerRoles.has(u.role))throw Object.assign(Error('Yetkisiz'),{status:403});
 if(u.role!=='Yönetici'){
 if(body.users)throw Object.assign(Error('Yetkisiz'),{status:403});
 const cleaned={};
 for(const key of ['shipments','ncts'])if(body[key]){
 cleaned[key]=state[key].map(r=>({...r}));
 for(const incoming of body[key]){const id=incoming.id||incoming.fileNo||incoming.no;if(!id)throw Error('Dosya no gerekli');const index=cleaned[key].findIndex(r=>(r.id||r.fileNo||r.no)===id);const safe={...incoming};for(const field of ['purchasePrice','profit','share','shareTL','exchangeRate','salePrice','financeCurrency','freightFee','guaranteeFee','customerCompanyIds'])delete safe[field];if(index<0)cleaned[key].push(safe);else cleaned[key][index]={...cleaned[key][index],...safe};}
 }
 if(body.companies)cleaned.companies=body.companies;
 body=cleaned;
 }
for(const key of ['companies','shipments','ncts'])if(body[key]!==undefined){if(!Array.isArray(body[key]))throw Error('Invalid data');if(key==='companies'){for(const account of state.users){const previous=state.companies.find(c=>String(c.id||c.name)===account.companyId);const replacement=previous&&body[key].find(c=>c.name===previous.name);if(replacement)account.companyId=String(replacement.id||replacement.name);}}if(key==='companies'){const ids=new Set(),names=new Set();for(const c of body[key]){const id=String(c.id||c.name),name=String(c.name||'').trim().toLocaleLowerCase('tr');if(!id||!name||ids.has(id)||names.has(name))throw Error('Firma kimliği ve unvanı benzersiz olmalı');ids.add(id);names.add(name);}}state[key]=body[key];if(key!=='companies')state[key]=state[key].map(r=>bind(r,key));}
 if(body.users){if(!Array.isArray(body.users))throw Error('Invalid users');const next=body.users.map(v=>{const old=state.users.find(x=>x.username===v.username);if(v.active&&customerRoles.has(v.role)&&!state.companies.some(c=>String(c.id||c.name)===v.companyId))throw Error('Firma seçimi zorunlu');if(!['Yönetici','Operasyon','Finans','Görüntüleme','Müşteri'].includes(v.role))throw Error('Geçersiz rol');if(v.password){if(v.password.length<6)throw Error('Şifre kısa');return user(v);}if(!old)throw Error('Şifre gerekli');return {...old,...pick(v,['name','email','role','active','companyId','companyName'])};});if(!next.some(v=>v.username===u.username&&v.active&&v.role==='Yönetici'))throw Error('Kendi yönetici erişiminiz kaldırılamaz');state.users=next;}
 await persist();}
 let mutations=Promise.resolve();
 return {principal,data,records,async sync(u,b){const operation=mutations.then(async()=>{const before=structuredClone(state);try{await sync(u,b);}catch(e){state=before;throw e;}});mutations=operation.catch(()=>{});return operation;},login(username,password){const u=state.users.find(u=>u.username===username&&u.active);if(!u||!timingSafeEqual(Buffer.from(hash(password,u.salt),'hex'),Buffer.from(u.passwordHash,'hex')))return null;const token=randomBytes(32).toString('hex');sessions.set(token,{username,expires:Date.now()+8*3600000});return {token,user:visibleUser(u)};},logout(req){const token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('ascend_sid='))?.slice(11);sessions.delete(token);},customer:u=>customerRoles.has(u?.role)};
}
