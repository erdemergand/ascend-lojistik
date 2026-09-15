import {randomUUID} from 'node:crypto';
export function offerService(store) {
 const db=store.database.db;
 db.exec('CREATE TABLE IF NOT EXISTS offers(id TEXT PRIMARY KEY,quote_id TEXT NOT NULL,version INTEGER NOT NULL,body TEXT NOT NULL,updated_at TEXT NOT NULL)');
 const admin=u=>{if(u?.role!=='Yönetici')throw Object.assign(Error('Yalnız yönetici erişebilir'),{status:403});};
 const conflict=()=>Object.assign(Error('Teklif değişti. Listeyi yenileyip tekrar kontrol edin.'),{status:409});
 return {
 list(u){admin(u);return db.prepare('SELECT * FROM offers ORDER BY updated_at DESC').all().map(r=>({...r,body:JSON.parse(r.body),mail:db.prepare('SELECT status,last_error FROM outbox WHERE unique_key=?').get('offer:'+r.id+':'+r.version)||null}));},
 save(u,b){admin(u);const request=db.prepare('SELECT id FROM quote_requests WHERE id=?').get(b.quoteId);if(!request)throw Error('Geçerli bir fiyat talebi seçin');
 const old=b.id?db.prepare('SELECT * FROM offers WHERE id=?').get(b.id):null;if(b.id&&!old)throw Error('Teklif bulunamadı');if(old&&(old.version!==b.version||old.quote_id!==b.quoteId))throw conflict();
 const company=store.data(u).companies.find(c=>String(c.id||c.name)===b.carrierId&&c.isCarrier);if(!company)throw Error('Kayıtlı acente/taşıyıcı seçin');
 for(const key of ['purchase','sale'])if(!/^\d+(\.\d{1,2})?$/.test(String(b[key]))||!Number.isSafeInteger(Math.round(Number(b[key])*100)))throw Error('Tutarlar en fazla iki ondalık basamakla girilmeli');
 if(!['USD','EUR','TRY','GBP','CHF','JPY','CNY','AED','SAR','CAD','AUD'].includes(b.currency))throw Error('Döviz seçin');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(b.validUntil||'')||new Date(b.validUntil).toISOString().slice(0,10)!==b.validUntil)throw Error('Geçerlilik tarihi girin');
 if(!['Teklif geldi','Müşteriye sunuldu','Kabul edildi','Reddedildi'].includes(b.status))throw Error('Durum seçin');
 const body={carrierId:b.carrierId,purchase:Math.round(Number(b.purchase)*100)/100,sale:Math.round(Number(b.sale)*100)/100,currency:b.currency,validUntil:b.validUntil,status:b.status,transit:String(b.transit||'').slice(0,300),costs:String(b.costs||'').slice(0,2000),notes:String(b.notes||'').slice(0,3000)};
 const id=old?.id||randomUUID(),version=(old?.version||0)+1;
 db.prepare('INSERT INTO offers VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET version=excluded.version,body=excluded.body,updated_at=excluded.updated_at').run(id,b.quoteId,version,JSON.stringify(body),new Date().toISOString());store.database.audit(u.username,'offer.saved',{id,version});return {id,version};},
 send(u,b){admin(u);if(b.reviewed!==true)throw Error('Maili kontrol ettiğinizi onaylayın');const row=db.prepare('SELECT * FROM offers WHERE id=?').get(b.id);if(!row||row.version!==b.version)throw conflict();
 const to=String(b.to||'').split(/[,;]/).map(x=>x.trim()).filter(Boolean);if(!to.length||to.some(x=>!/^\S+@\S+\.\S+$/.test(x)))throw Error('Geçerli alıcı adresi girin');
 const subject=String(b.subject||'').trim(),text=String(b.text||'').trim();if(!subject||subject.length>200||/[\r\n]/.test(subject)||!text||text.length>15000)throw Error('Konu ve mail metnini kontrol edin');
 const key='offer:'+row.id+':'+row.version;
 db.prepare('INSERT OR IGNORE INTO outbox VALUES(?,?,?,0,?,?,NULL)').run(randomUUID(),key,'waiting-provider',new Date().toISOString(),JSON.stringify({kind:'quote',to,cc:[],subject,text}));
 store.database.audit(u.username,'offer.mail-approved',{id:row.id,version:row.version});return {status:db.prepare('SELECT status FROM outbox WHERE unique_key=?').get(key).status};}
 };
}
