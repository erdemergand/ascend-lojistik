import {openPortalDatabase} from './database.mjs';
import {base32,verifyTotp,secretVault} from './security.mjs';
import {createHash} from 'node:crypto';
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
 const database=await openPortalDatabase(path),vault=await secretVault(path);let revision=database.current()?.revision??-1;if(database.current())state=JSON.parse(database.current().body);
 function user(data){const salt=randomBytes(16).toString('hex');return {...pick(data,['username','name','role','companyId','companyName','active','email']),salt,passwordHash:hash(data.password,salt)};}
 if(!state.users.length){state.users=[user({username:'yonetici.demo',name:'Demo Yönetici',role:'Yönetici',password:'AscendDemo!2026',active:true}),user({username:'personel.demo',name:'Demo Personel',role:'Operasyon',password:'AscendDemo!2026',active:true}),user({username:'musteri.demo',name:'Demo Müşteri',role:'Görüntüleme',companyId:'demo-anadolu',password:'AscendDemo!2026',active:true})];state.companies=[{id:'demo-anadolu',name:'DEMO Anadolu Dış Ticaret Ltd. Şti.'}];}
 function bind(record,module){if(Array.isArray(record.customerCompanyIds))return record;const names=module==='ncts'?[record.sender,record.receiver]:[record.shipper,record.consignee];return {...record,customerCompanyIds:state.companies.filter(c=>names.includes(c.name)).map(c=>String(c.id||c.name))};}
 state.shipments=state.shipments.map(r=>bind(r,'shipments'));state.ncts=state.ncts.map(r=>bind(r,'ncts'));
 function persist(actor='system',detail={}){revision=database.save(state,revision,actor,detail);return Promise.resolve();}
 if(!database.current())await persist();const sessions=new Map(),failures=new Map(),enrollments=new Map();
 const fingerprint=u=>u.passwordHash+'|'+u.role+'|'+u.companyId+'|'+u.active;
 const visibleUser=u=>pick(u,['username','name','role','companyId','companyName','email','active']);
 function principal(req){const token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('ascend_sid='))?.slice(11);const session=sessions.get(token);if(!session||session.expires<Date.now())return null;return state.users.find(u=>u.username===session.username&&u.active&&fingerprint(u)===session.fingerprint)||null;}
 function own(u,r,module){if(!customerRoles.has(u.role))return true;if(!u.companyId)return false;const c=state.companies.find(c=>String(c.id||c.name)===u.companyId);if(!c)return false;const ids=r.customerCompanyIds;if(Array.isArray(ids))return ids.includes(u.companyId);return false;}
 function records(u,module){return state[module].filter(r=>own(u,r,module)).map(r=>{if(u.role==='Yönetici')return r;if(!customerRoles.has(u.role)){const safe={...r};for(const k of ['purchasePrice','profit','share','shareTL','exchangeRate','freightFee','guaranteeFee'])delete safe[k];return safe;}if(module==='shipments')return pick(r,publicLogistics);return {...pick(r,publicNcts),fields:pick(r.fields||{},publicNctsFields)};});}
 function data(u){const companies=customerRoles.has(u.role)?state.companies.filter(c=>String(c.id||c.name)===u.companyId).map(c=>pick(c,['id','name','shortName','country','address'])):state.companies;return {revision,user:{...visibleUser(u),twoFactorEnabled:!!u.totpSecret},companies,shipments:records(u,'shipments'),ncts:records(u,'ncts'),users:u.role==='Yönetici'?state.users.map(visibleUser):[]};}
 let stateAuditChanges=[];
 async function sync(u,body){
 stateAuditChanges=[];
 for(const collection of ['companies','shipments','ncts','users'])if(Array.isArray(body[collection]))for(const row of body[collection]){const id=row.id||row.fileNo||row.no||row.username||row.name;const old=state[collection].find(x=>(x.id||x.fileNo||x.no||x.username||x.name)===id)||{};const fields=Object.keys(row).filter(k=>!['password','salt','passwordHash','totpSecret','lastTotpStep'].includes(k)&&JSON.stringify(row[k])!==JSON.stringify(old[k]));if(fields.length)stateAuditChanges.push({collection,id,fields,...(collection==='users'?{}:{before:pick(old,fields),after:pick(row,fields)})});}

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
for(const key of ['companies','shipments','ncts'])if(body[key]!==undefined){if(!Array.isArray(body[key]))throw Error('Invalid data');if(key==='companies'){for(const account of state.users){const previous=state.companies.find(c=>String(c.id||c.name)===account.companyId);const replacement=previous&&body[key].find(c=>c.name===previous.name);if(replacement)account.companyId=String(replacement.id||replacement.name);}}if(key==='companies'){const ids=new Set(),names=new Set();for(const c of body[key]){for(const contact of c.contacts||[]){if(contact.transportModes!==undefined&&(!Array.isArray(contact.transportModes)||contact.transportModes.some(mode=>!['Hava','Kara','Deniz','Demiryolu'].includes(mode))))throw Error('Geçersiz taşıma türü seçimi');}if(c.isCarrier&&(!(c.serviceCountries||[]).length||!(c.contacts||[]).some(x=>(x.transportModes||[x.transportMode]).some(mode=>['Hava','Kara','Deniz','Demiryolu'].includes(mode))&&/^\S+@\S+\.\S+$/.test(x.email||''))))throw Error('Acente hizmet ülkesi ve birim e-postası gerekli');const id=String(c.id||c.name),name=String(c.name||'').trim().toLocaleLowerCase('tr');if(!id||!name||ids.has(id)||names.has(name))throw Error('Firma kimliği ve unvanı benzersiz olmalı');ids.add(id);names.add(name);}}state[key]=body[key];if(key!=='companies')state[key]=state[key].map(r=>bind(r,key));}
 if(body.users){if(new Set(body.users.map(v=>v.username)).size!==body.users.length)throw Error('Kullanıcı adları benzersiz olmalı');if(!Array.isArray(body.users))throw Error('Invalid users');const next=body.users.map(v=>{const old=state.users.find(x=>x.username===v.username);if(v.active&&customerRoles.has(v.role)&&!state.companies.some(c=>String(c.id||c.name)===v.companyId))throw Error('Firma seçimi zorunlu');if(!['Yönetici','Operasyon','Finans','Görüntüleme','Müşteri'].includes(v.role))throw Error('Geçersiz rol');if(v.password){if(v.password.length<12)throw Error('Şifre kısa');return user(v);}if(!old)throw Error('Şifre gerekli');return {...old,...pick(v,['name','email','role','active','companyId','companyName'])};});if(!next.some(v=>v.username===u.username&&v.active&&v.role==='Yönetici'))throw Error('Kendi yönetici erişiminiz kaldırılamaz');state.users=next;}
 await persist(u.username,{collections:Object.keys(body).filter(k=>k!=='_revision'),changes:stateAuditChanges});}

 async function security(action,u,body={}){
 const admin=()=>{if(u?.role!=='Yönetici')throw Object.assign(Error('Yetkisiz'),{status:403});};
 const revoke=username=>{for(const [key,value] of sessions)if(value.username===username)sessions.delete(key);};
 if(action==='reset-complete'){
 const tokenHash=createHash('sha256').update(String(body.token||'')).digest('hex');const row=database.db.prepare('SELECT * FROM resets WHERE token_hash=? AND expires>?').get(tokenHash,Date.now());if(!row||String(body.password||'').length<12)throw Error('Geçersiz bağlantı veya en az 12 karakterli şifre gerekli.');const target=state.users.find(x=>x.username===row.username);if(!target)throw Error('Geçersiz bağlantı');const updated=user({...target,password:body.password});Object.assign(target,{salt:updated.salt,passwordHash:updated.passwordHash});database.db.prepare('DELETE FROM resets WHERE username=?').run(target.username);await persist(target.username,{security:'password.reset'});revoke(target.username);return {};
 }
 if(!u)throw Object.assign(Error('Giriş gerekli'),{status:401});
 if(action==='reset-create'){admin();const target=state.users.find(x=>x.username===body.username&&x.active);if(!target)throw Error('Kullanıcı bulunamadı');const token=randomBytes(32).toString('hex');database.db.prepare('INSERT INTO resets VALUES(?,?,?)').run(createHash('sha256').update(token).digest('hex'),target.username,Date.now()+15*60000);database.audit(u.username,'password.reset-issued',{username:target.username});return {token,expiresMinutes:15};}
 if(action==='totp-start'){if(!timingSafeEqual(Buffer.from(hash(String(body.password||''),u.salt),'hex'),Buffer.from(u.passwordHash,'hex')))throw Error('Mevcut şifreni doğrula');if(u.totpSecret&&verifyTotp(vault.decrypt(u.totpSecret),body.code,u.lastTotpStep)===null)throw Error('Mevcut doğrulama kodu gerekli');const secret=base32(randomBytes(20));enrollments.set(u.username,{secret,expires:Date.now()+10*60000});return {secret,uri:'otpauth://totp/Ascend:'+encodeURIComponent(u.username)+'?secret='+secret+'&issuer=Ascend'};}
 if(action==='totp-confirm'){const pending=enrollments.get(u.username);const step=pending&&pending.expires>Date.now()?verifyTotp(pending.secret,body.code):null;if(step===null)throw Error('Doğrulama kodu geçersiz');u.totpSecret=vault.encrypt(pending.secret);u.lastTotpStep=step;enrollments.delete(u.username);await persist(u.username,{security:'totp.enabled'});return {};}
 if(action==='setup'){admin();if(String(body.password||'').length<12)throw Error('Şifre en az 12 karakter olmalı');if(state.users.some(x=>x.username==='ascend lojistik'&&x.active))throw Error('Gerçek yönetici zaten kurulmuş');state.users.push(user({username:'ascend lojistik',name:'Ascend Lojistik',email:'info@ascendlojistik.com',role:'Yönetici',active:true,password:body.password}));state.users.forEach(x=>{if(x.username.endsWith('.demo')||x.username==='demo')x.active=false;});await persist(u.username,{security:'real-admin.activated'});sessions.clear();return {};}
 throw Error('Geçersiz işlem');
 }
 let mutations=Promise.resolve();
 return {principal,data,records,database,security,revision:()=>revision,close:()=>database.close(),async sync(u,b){const operation=mutations.then(async()=>{const before=structuredClone(state);try{if(b._revision!==undefined&&b._revision!==revision)throw Object.assign(Error('Kayıt başka bir oturumda değişti. Sayfayı yenileyin.'),{status:409});await sync(u,b);}catch(e){state=before;throw e;}});mutations=operation.catch(()=>{});return operation;},login(username,password,code){
 const attempts=failures.get(username);if(attempts?.until>Date.now()&&attempts.count>=5)throw Object.assign(Error('Çok fazla deneme. 15 dakika sonra tekrar deneyin.'),{status:429});
 const u=state.users.find(u=>u.username===username&&u.active);
 const valid=u&&timingSafeEqual(Buffer.from(hash(password,u.salt),'hex'),Buffer.from(u.passwordHash,'hex'));
 let step=null;if(valid&&u.totpSecret)step=verifyTotp(vault.decrypt(u.totpSecret),code,u.lastTotpStep);
 if(!valid||(u.totpSecret&&step===null)){const previous=attempts?.until>Date.now()?attempts.count:0;failures.set(username,{count:previous+1,until:Date.now()+15*60000});database.audit(username,'login.failed');return null;}
 failures.delete(username);if(step!==null){u.lastTotpStep=step;persist(u.username,{security:'totp.login'});}
 const token=randomBytes(32).toString('hex');sessions.set(token,{username,expires:Date.now()+8*3600000,fingerprint:fingerprint(u)});database.audit(username,'login.success');return {token,user:visibleUser(u)};
},logout(req){const token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('ascend_sid='))?.slice(11);sessions.delete(token);},customer:u=>customerRoles.has(u?.role)};
}
